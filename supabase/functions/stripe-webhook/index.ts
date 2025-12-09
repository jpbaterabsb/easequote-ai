import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') as string, {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
})

const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') as string

// Create Supabase admin client
const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

// Helper function to safely convert Unix timestamp to ISO string
function safeTimestampToISO(timestamp: number | undefined | null): string | null {
  if (!timestamp || typeof timestamp !== 'number') {
    return null
  }
  try {
    return new Date(timestamp * 1000).toISOString()
  } catch {
    console.warn('Failed to convert timestamp:', timestamp)
    return null
  }
}

serve(async (req) => {
  console.log('=== STRIPE-WEBHOOK: Request received ===')
  console.log('Timestamp:', new Date().toISOString())
  
  const signature = req.headers.get('stripe-signature')
  console.log('Stripe signature present:', !!signature)
  
  if (!signature) {
    console.error('ERROR: No stripe-signature header')
    return new Response('No signature', { status: 400 })
  }

  const body = await req.text()
  console.log('Request body length:', body.length)

  let event: Stripe.Event

  try {
    console.log('Verifying webhook signature...')
    console.log('Webhook secret configured:', !!webhookSecret)
    // Use async version for Deno compatibility
    event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret)
    console.log('Webhook signature verified successfully')
  } catch (err) {
    console.error('=== STRIPE-WEBHOOK: Signature verification failed ===')
    console.error('Error:', err.message)
    return new Response(`Webhook Error: ${err.message}`, { status: 400 })
  }

  console.log('=== Processing event ===')
  console.log('Event ID:', event.id)
  console.log('Event type:', event.type)
  console.log('Event created:', new Date(event.created * 1000).toISOString())

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        console.log('--- Handling checkout.session.completed ---')
        const session = event.data.object as Stripe.Checkout.Session
        
        console.log('Session details:', {
          id: session.id,
          customer: session.customer,
          subscription: session.subscription,
          payment_status: session.payment_status,
          mode: session.mode,
          metadata: session.metadata,
        })
        
        // Try to get user ID from various sources
        let userId = session.metadata?.supabase_user_id
        console.log('User ID from session metadata:', userId)
        
        // Fallback: try subscription metadata
        if (!userId && session.subscription && typeof session.subscription === 'object') {
          userId = session.subscription.metadata?.supabase_user_id
          console.log('User ID from subscription metadata:', userId)
        }
        
        // Fallback: lookup by customer ID
        if (!userId && session.customer) {
          console.log('No user ID in metadata, looking up by customer ID...')
          const customerId = typeof session.customer === 'string' 
            ? session.customer 
            : session.customer.id
          
          const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('id')
            .eq('stripe_customer_id', customerId)
            .single()
          
          userId = profile?.id
          console.log('Found user ID by customer lookup:', userId)
        }
        
        if (userId && session.subscription) {
          console.log('Fetching subscription details from Stripe...')
          const subscriptionId = typeof session.subscription === 'string' 
            ? session.subscription 
            : session.subscription.id
          console.log('Subscription ID:', subscriptionId)
          
          const subscription = await stripe.subscriptions.retrieve(subscriptionId)
          console.log('Subscription retrieved:', {
            id: subscription.id,
            status: subscription.status,
            customer: subscription.customer,
            current_period_end: safeTimestampToISO(subscription.current_period_end),
          })
          
          // Note: At this point status might be 'incomplete' if payment is still processing
          // The invoice.paid event will update it to 'active' when payment confirms
          await updateSubscriptionStatus(userId, subscription)
        } else {
          console.warn('WARNING: Could not process checkout - missing userId or subscription')
          console.warn('userId:', userId)
          console.warn('subscription:', session.subscription)
        }
        break
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        console.log(`--- Handling ${event.type} ---`)
        const subscription = event.data.object as Stripe.Subscription
        
        console.log('Subscription details:', {
          id: subscription.id,
          status: subscription.status,
          customer: subscription.customer,
          metadata: subscription.metadata,
          current_period_end: safeTimestampToISO(subscription.current_period_end),
          items: subscription.items?.data?.map(item => ({
            price_id: item.price?.id,
            product_id: item.price?.product,
          })) || [],
        })
        
        const userId = subscription.metadata?.supabase_user_id
        console.log('User ID from metadata:', userId)
        
        if (userId) {
          await updateSubscriptionStatus(userId, subscription)
        } else {
          console.log('No user ID in metadata, looking up by customer ID...')
          const customerId = typeof subscription.customer === 'string' 
            ? subscription.customer 
            : subscription.customer.id
          console.log('Customer ID:', customerId)
          
          const { data: profile, error: profileError } = await supabaseAdmin
            .from('profiles')
            .select('id')
            .eq('stripe_customer_id', customerId)
            .single()
          
          if (profileError) {
            console.error('ERROR: Could not find profile by customer ID:', profileError.message)
          } else if (profile) {
            console.log('Found profile by customer ID:', profile.id)
            await updateSubscriptionStatus(profile.id, subscription)
          } else {
            console.warn('WARNING: No profile found for customer ID:', customerId)
          }
        }
        break
      }

      case 'customer.subscription.deleted': {
        console.log('--- Handling customer.subscription.deleted ---')
        const subscription = event.data.object as Stripe.Subscription
        
        // Get ended_at to determine if subscription ended immediately or was scheduled
        const endedAt = (subscription as any).ended_at
        const canceledAt = (subscription as any).canceled_at
        
        console.log('Deleted subscription details:', {
          id: subscription.id,
          status: subscription.status,
          customer: subscription.customer,
          metadata: subscription.metadata,
          ended_at: endedAt,
          canceled_at: canceledAt,
          cancel_at_period_end: subscription.cancel_at_period_end,
        })
        
        const userId = subscription.metadata?.supabase_user_id
        console.log('User ID from metadata:', userId)
        
        let userIdToUpdate = userId
        
        if (!userIdToUpdate) {
          console.log('No user ID in metadata, looking up by customer ID...')
          const customerId = typeof subscription.customer === 'string' 
            ? subscription.customer 
            : subscription.customer.id
          console.log('Customer ID:', customerId)
          
          const { data: profile, error: profileError } = await supabaseAdmin
            .from('profiles')
            .select('id')
            .eq('stripe_customer_id', customerId)
            .single()
          
          if (profileError) {
            console.error('ERROR: Could not find profile:', profileError.message)
          }
          
          userIdToUpdate = profile?.id
          console.log('Found user ID:', userIdToUpdate)
        }
        
        if (userIdToUpdate) {
          // Determine if subscription ended immediately or at period end
          // If ended_at exists and equals canceled_at, it was canceled immediately
          const canceledImmediately = endedAt && canceledAt && (endedAt === canceledAt)
          
          if (canceledImmediately) {
            // Subscription was canceled IMMEDIATELY - user loses access now
            console.log('Subscription canceled IMMEDIATELY - removing access...')
            const { error: updateError } = await supabaseAdmin
              .from('profiles')
              .update({
                subscription_status: 'inactive',
                subscription_id: null,
                subscription_plan: null,
                stripe_price_id: null,
                subscription_end_date: null,
              })
              .eq('id', userIdToUpdate)
            
            if (updateError) {
              console.error('ERROR: Failed to update profile:', updateError.message)
            } else {
              console.log('Profile reset to inactive for user:', userIdToUpdate)
            }
          } else {
            // Subscription was scheduled to cancel at period end - keep access until end_date
            console.log('Subscription ended at period end - keeping end_date for access...')
            const { error: updateError } = await supabaseAdmin
              .from('profiles')
              .update({
                subscription_status: 'canceled',
                // Keep subscription_end_date so user has access until that date
              })
              .eq('id', userIdToUpdate)
            
            if (updateError) {
              console.error('ERROR: Failed to update profile:', updateError.message)
            } else {
              console.log('Profile updated to canceled status for user:', userIdToUpdate)
            }
          }
        } else {
          console.warn('WARNING: Could not find user to update')
        }
        break
      }

      // invoice.paid is the KEY event that confirms payment completed
      // This is when subscription changes from 'incomplete' to 'active'
      case 'invoice.paid': {
        console.log('===========================================')
        console.log('--- Handling invoice.paid (KEY EVENT) ---')
        console.log('===========================================')
        const invoice = event.data.object as Stripe.Invoice
        
        console.log('Paid invoice details:', {
          id: invoice.id,
          customer: invoice.customer,
          subscription: invoice.subscription,
          amount_paid: invoice.amount_paid,
          status: invoice.status,
          billing_reason: invoice.billing_reason,
        })
        
        // Check if invoice has period_end directly
        console.log('Invoice additional fields:')
        console.log('  invoice.period_end:', (invoice as any).period_end)
        console.log('  invoice.period_start:', (invoice as any).period_start)
        console.log('  invoice.lines:', (invoice as any).lines?.data?.length)
        console.log('  invoice.lines data:', JSON.stringify((invoice as any).lines?.data, null, 2))
        
        // Get subscription ID from various locations (Stripe API 2025-11-17 structure)
        let subscriptionId: string | undefined
        let periodEnd: number | undefined
        let userId: string | undefined
        
        const invoiceAny = invoice as any
        
        // Method 1: Direct on invoice (older API versions)
        if (invoice.subscription) {
          subscriptionId = typeof invoice.subscription === 'string' 
            ? invoice.subscription 
            : invoice.subscription.id
          console.log('Found subscription directly on invoice:', subscriptionId)
        }
        
        // Method 2: From invoice.parent.subscription_details (new API 2025-11-17)
        if (!subscriptionId && invoiceAny.parent?.subscription_details?.subscription) {
          subscriptionId = invoiceAny.parent.subscription_details.subscription
          console.log('Found subscription in parent.subscription_details:', subscriptionId)
          
          // Also get user ID from here
          if (invoiceAny.parent.subscription_details.metadata?.supabase_user_id) {
            userId = invoiceAny.parent.subscription_details.metadata.supabase_user_id
            console.log('Found user ID in parent metadata:', userId)
          }
        }
        
        // Method 3: From line items
        const lines = invoiceAny.lines?.data
        if (lines && lines.length > 0) {
          const lineItem = lines[0]
          
          // Get subscription from line item
          if (!subscriptionId && lineItem.parent?.subscription_item_details?.subscription) {
            subscriptionId = lineItem.parent.subscription_item_details.subscription
            console.log('Found subscription in line item:', subscriptionId)
          }
          
          // Get period end from line item
          if (lineItem.period?.end) {
            periodEnd = lineItem.period.end
            console.log('Found period.end in line item:', periodEnd, '=', new Date(periodEnd * 1000).toISOString())
          }
          
          // Get user ID from line item metadata
          if (!userId && lineItem.metadata?.supabase_user_id) {
            userId = lineItem.metadata.supabase_user_id
            console.log('Found user ID in line item metadata:', userId)
          }
        }
        
        // Method 4: List customer subscriptions as last resort
        if (!subscriptionId && invoice.customer) {
          console.log('No subscription found, searching customer subscriptions...')
          const customerId = typeof invoice.customer === 'string' 
            ? invoice.customer 
            : invoice.customer.id
          
          const subscriptions = await stripe.subscriptions.list({
            customer: customerId,
            limit: 1,
            status: 'all',
          })
          
          if (subscriptions.data.length > 0) {
            subscriptionId = subscriptions.data[0].id
            console.log('Found subscription via customer lookup:', subscriptionId)
          }
        }
        
        console.log('Final extracted values:')
        console.log('  - subscriptionId:', subscriptionId)
        console.log('  - periodEnd:', periodEnd)
        console.log('  - userId:', userId)
        
        if (subscriptionId) {
          console.log('Fetching subscription details from Stripe API...')
          console.log('Subscription ID to fetch:', subscriptionId)
          
          // Fetch subscription with price data
          const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
            expand: ['items.data.price'],
          })
          
          console.log('Subscription fetched:')
          console.log('  - id:', subscription.id)
          console.log('  - status:', subscription.status)
          console.log('  - current_period_end from API:', subscription.current_period_end)
          
          // Use periodEnd from invoice if subscription doesn't have it
          const finalPeriodEnd = subscription.current_period_end || periodEnd
          console.log('  - finalPeriodEnd to use:', finalPeriodEnd)
          
          // Try to get user ID from multiple sources
          if (!userId) {
            userId = subscription.metadata?.supabase_user_id
            console.log('User ID from subscription metadata:', userId)
          }
          
          // Fallback: lookup by customer ID
          if (!userId) {
            console.log('No user ID in metadata, looking up by customer ID...')
            const customerId = typeof subscription.customer === 'string' 
              ? subscription.customer 
              : (subscription.customer as any)?.id
            console.log('Customer ID for lookup:', customerId)
            
            if (customerId) {
              const { data: profile, error: lookupError } = await supabaseAdmin
                .from('profiles')
                .select('id, stripe_customer_id')
                .eq('stripe_customer_id', customerId)
                .single()
              
              if (lookupError) {
                console.error('ERROR looking up profile by customer_id:', lookupError.message)
              } else {
                console.log('Found profile:', profile)
                userId = profile?.id
              }
            }
          }
          
          console.log('Final user ID to update:', userId)
          
          if (userId) {
            console.log('Calling updateSubscriptionStatusWithPeriod...')
            // Pass the period end we extracted from the invoice
            await updateSubscriptionStatusWithPeriod(userId, subscription, finalPeriodEnd)
          } else {
            console.error('ERROR: Could not find user ID for invoice.paid event')
            console.error('Subscription customer:', subscription.customer)
            console.error('Subscription metadata:', subscription.metadata)
          }
        } else {
          console.log('Could not find subscription ID from invoice - skipping')
          console.log('This might be a one-time invoice, not a subscription')
        }
        break
      }

      case 'invoice.payment_succeeded': {
        console.log('--- Handling invoice.payment_succeeded ---')
        const invoice = event.data.object as Stripe.Invoice
        
        console.log('Invoice details:', {
          id: invoice.id,
          customer: invoice.customer,
          subscription: invoice.subscription,
          amount_paid: invoice.amount_paid,
          status: invoice.status,
        })
        
        if (invoice.subscription) {
          console.log('Fetching subscription details...')
          const subscriptionId = typeof invoice.subscription === 'string' 
            ? invoice.subscription 
            : invoice.subscription.id
          
          const subscription = await stripe.subscriptions.retrieve(subscriptionId)
          console.log('Subscription status:', subscription.status)
          
          // Try to get user ID from subscription metadata
          let userId = subscription.metadata?.supabase_user_id
          console.log('User ID from subscription metadata:', userId)
          
          // Fallback: lookup by customer ID
          if (!userId) {
            console.log('No user ID in metadata, looking up by customer ID...')
            const customerId = typeof invoice.customer === 'string' 
              ? invoice.customer 
              : invoice.customer?.id
            
            if (customerId) {
              const { data: profile } = await supabaseAdmin
                .from('profiles')
                .select('id')
                .eq('stripe_customer_id', customerId)
                .single()
              
              userId = profile?.id
              console.log('Found user ID by customer lookup:', userId)
            }
          }
          
          if (userId) {
            await updateSubscriptionStatus(userId, subscription)
          } else {
            console.warn('WARNING: No user ID found for invoice.payment_succeeded')
          }
        } else {
          console.log('Invoice has no subscription - skipping')
        }
        break
      }

      case 'invoice.payment_failed': {
        console.log('--- Handling invoice.payment_failed ---')
        const invoice = event.data.object as Stripe.Invoice
        
        console.log('Failed invoice details:', {
          id: invoice.id,
          customer: invoice.customer,
          subscription: invoice.subscription,
          amount_due: invoice.amount_due,
        })
        
        const customerId = typeof invoice.customer === 'string' 
          ? invoice.customer 
          : invoice.customer?.id
        
        if (customerId) {
          const { data: profile, error: profileError } = await supabaseAdmin
            .from('profiles')
            .select('id')
            .eq('stripe_customer_id', customerId)
            .single()
          
          if (profileError) {
            console.error('ERROR: Could not find profile:', profileError.message)
          } else if (profile) {
            console.log('Updating profile to past_due status...')
            const { error: updateError } = await supabaseAdmin
              .from('profiles')
              .update({ subscription_status: 'past_due' })
              .eq('id', profile.id)
            
            if (updateError) {
              console.error('ERROR: Failed to update profile:', updateError.message)
            } else {
              console.log('Profile updated to past_due for user:', profile.id)
            }
          }
        }
        break
      }

      default:
        console.log('Unhandled event type:', event.type)
    }

    console.log('=== STRIPE-WEBHOOK: Success ===')
    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('=== STRIPE-WEBHOOK: Error ===')
    console.error('Error type:', error.constructor.name)
    console.error('Error message:', error.message)
    console.error('Error stack:', error.stack)
    return new Response(
      JSON.stringify({ error: 'Webhook handler failed' }),
      { status: 500 }
    )
  }
})

// New function that accepts period end as parameter (for invoice.paid events)
/**
 * Update subscription status with explicit period end timestamp
 * Used primarily by invoice.paid event where we extract period from invoice lines
 * 
 * Same logic as updateSubscriptionStatus - check cancel_at_period_end
 */
async function updateSubscriptionStatusWithPeriod(
  userId: string, 
  subscription: Stripe.Subscription,
  periodEndFromInvoice: number | undefined
) {
  console.log('===========================================')
  console.log('--- updateSubscriptionStatusWithPeriod ---')
  console.log('===========================================')
  console.log('User ID:', userId)
  console.log('Subscription ID:', subscription.id)
  console.log('Stripe Status:', subscription.status)
  console.log('cancel_at_period_end:', subscription.cancel_at_period_end)
  console.log('Period End from Invoice:', periodEndFromInvoice)
  
  // Determine our internal status based on Stripe's data
  let internalStatus: string
  
  if (subscription.status === 'active' && subscription.cancel_at_period_end) {
    internalStatus = 'canceled'
    console.log('→ Mapping to "canceled" (scheduled cancellation)')
  } else if (subscription.status === 'active') {
    internalStatus = 'active'
    console.log('→ Mapping to "active"')
  } else {
    internalStatus = subscription.status
    console.log(`→ Using Stripe status directly: "${internalStatus}"`)
  }
  
  // Get period end timestamp - priority: invoice period > cancel_at > items > root
  let periodEndTimestamp: number | null = periodEndFromInvoice || null
  
  if (!periodEndTimestamp && subscription.cancel_at_period_end && (subscription as any).cancel_at) {
    periodEndTimestamp = (subscription as any).cancel_at
    console.log('Using cancel_at:', periodEndTimestamp)
  }
  
  if (!periodEndTimestamp) {
    periodEndTimestamp = subscription.items?.data?.[0]?.current_period_end || 
                         subscription.current_period_end || 
                         null
    console.log('Using subscription period_end:', periodEndTimestamp)
  }
  
  const currentPeriodEnd = safeTimestampToISO(periodEndTimestamp)
  const priceId = subscription.items?.data?.[0]?.price?.id || 
                  (subscription as any).plan?.id || 
                  null
  const planName = 'pro'
  
  console.log('=== Database Update Values ===')
  console.log('  subscription_status:', internalStatus)
  console.log('  subscription_id:', subscription.id)
  console.log('  subscription_end_date:', currentPeriodEnd)
  console.log('  stripe_price_id:', priceId)
  
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .update({
      subscription_status: internalStatus,
      subscription_id: subscription.id,
      subscription_end_date: currentPeriodEnd,
      subscription_plan: planName,
      stripe_price_id: priceId,
    })
    .eq('id', userId)
    .select()
  
  if (error) {
    console.error('DATABASE UPDATE FAILED!')
    console.error('Error:', error.message)
    console.error('Details:', JSON.stringify(error, null, 2))
  } else {
    console.log('DATABASE UPDATE SUCCESS!')
    console.log('Updated:', JSON.stringify(data, null, 2))
  }
}

/**
 * Main function to update subscription status in database
 * 
 * IMPORTANT: Stripe is the single source of truth.
 * This function interprets Stripe's data and maps it to our database schema.
 * 
 * Key logic:
 * - If Stripe status is 'active' BUT cancel_at_period_end is true → we set 'canceled'
 *   (User scheduled cancellation but still has access until period end)
 * - If Stripe status is 'active' AND cancel_at_period_end is false → we set 'active'
 * - All other Stripe statuses map directly (canceled, past_due, unpaid, etc.)
 */
async function updateSubscriptionStatus(userId: string, subscription: Stripe.Subscription) {
  console.log('===========================================')
  console.log('--- updateSubscriptionStatus ---')
  console.log('===========================================')
  console.log('User ID:', userId)
  console.log('Subscription ID:', subscription.id)
  console.log('Stripe Status:', subscription.status)
  console.log('cancel_at_period_end:', subscription.cancel_at_period_end)
  console.log('cancel_at:', (subscription as any).cancel_at)
  console.log('current_period_end (root):', subscription.current_period_end)
  console.log('items[0].current_period_end:', subscription.items?.data?.[0]?.current_period_end)
  
  // Determine our internal status based on Stripe's data
  let internalStatus: string
  
  if (subscription.status === 'active' && subscription.cancel_at_period_end) {
    // User scheduled cancellation - they still have access until period end
    internalStatus = 'canceled'
    console.log('→ Mapping to "canceled" (scheduled cancellation)')
  } else if (subscription.status === 'active') {
    // Fully active subscription
    internalStatus = 'active'
    console.log('→ Mapping to "active"')
  } else {
    // All other statuses (canceled, past_due, unpaid, incomplete, trialing, etc.)
    internalStatus = subscription.status
    console.log(`→ Using Stripe status directly: "${internalStatus}"`)
  }
  
  // Get period end timestamp from multiple possible sources (Stripe API changes)
  // Priority: 1. cancel_at (when scheduled to cancel), 2. items[0].current_period_end, 3. root current_period_end
  let periodEndTimestamp: number | null = null
  
  // If subscription is scheduled to cancel, use cancel_at as the end date
  if (subscription.cancel_at_period_end && (subscription as any).cancel_at) {
    periodEndTimestamp = (subscription as any).cancel_at
    console.log('Using cancel_at for period end:', periodEndTimestamp)
  }
  
  // Try items[0].current_period_end (new Stripe API structure)
  if (!periodEndTimestamp) {
    const itemPeriodEnd = subscription.items?.data?.[0]?.current_period_end
    if (itemPeriodEnd) {
      periodEndTimestamp = itemPeriodEnd
      console.log('Using items[0].current_period_end:', periodEndTimestamp)
    }
  }
  
  // Fallback to root current_period_end
  if (!periodEndTimestamp && subscription.current_period_end) {
    periodEndTimestamp = subscription.current_period_end
    console.log('Using root current_period_end:', periodEndTimestamp)
  }
  
  // Last resort: calculate from interval
  if (!periodEndTimestamp && subscription.current_period_start) {
    const interval = subscription.items?.data?.[0]?.price?.recurring?.interval
    const intervalCount = subscription.items?.data?.[0]?.price?.recurring?.interval_count || 1
    const startDate = new Date(subscription.current_period_start * 1000)
    
    if (interval === 'month') {
      startDate.setMonth(startDate.getMonth() + intervalCount)
      periodEndTimestamp = Math.floor(startDate.getTime() / 1000)
    } else if (interval === 'year') {
      startDate.setFullYear(startDate.getFullYear() + intervalCount)
      periodEndTimestamp = Math.floor(startDate.getTime() / 1000)
    }
    console.log('Calculated period_end from interval:', periodEndTimestamp)
  }
  
  const currentPeriodEnd = safeTimestampToISO(periodEndTimestamp)
  const priceId = subscription.items?.data?.[0]?.price?.id || null
  const planName = 'pro'
  
  console.log('=== Database Update Values ===')
  console.log('  subscription_status:', internalStatus)
  console.log('  subscription_id:', subscription.id)
  console.log('  subscription_end_date:', currentPeriodEnd)
  console.log('  stripe_price_id:', priceId)
  
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .update({
      subscription_status: internalStatus,
      subscription_id: subscription.id,
      subscription_end_date: currentPeriodEnd,
      subscription_plan: planName,
      stripe_price_id: priceId,
    })
    .eq('id', userId)
    .select()
  
  if (error) {
    console.error('DATABASE UPDATE FAILED!')
    console.error('Error:', error.message)
  } else {
    console.log('DATABASE UPDATE SUCCESS!')
    console.log('Updated:', JSON.stringify(data, null, 2))
  }
}

