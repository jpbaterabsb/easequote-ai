import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') as string, {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
})

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

/**
 * REACTIVATE-SUBSCRIPTION
 * 
 * This function ONLY interacts with Stripe API.
 * Database updates are handled by the stripe-webhook when Stripe sends events.
 * 
 * Stripe is the single source of truth for subscription status.
 * 
 * Returns:
 * - reactivated: true → Subscription was scheduled to cancel and has been reactivated
 * - needsNewSubscription: true → Subscription is fully canceled, need to create new one
 */
serve(async (req) => {
  console.log('=== REACTIVATE-SUBSCRIPTION ===')
  
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    if (userError || !user) {
      throw new Error('User not authenticated')
    }

    console.log('User:', user.id)

    // Get subscription ID from profile
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('subscription_id')
      .eq('id', user.id)
      .single()

    if (!profile?.subscription_id) {
      console.log('No subscription_id in profile - need new subscription')
      return new Response(
        JSON.stringify({ 
          needsNewSubscription: true,
          message: 'No existing subscription found. Please create a new subscription.',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    // Check subscription status in Stripe
    console.log('Checking Stripe subscription:', profile.subscription_id)
    
    let stripeSubscription
    try {
      stripeSubscription = await stripe.subscriptions.retrieve(profile.subscription_id)
    } catch (e: any) {
      console.log('Subscription not found in Stripe:', e.message)
      return new Response(
        JSON.stringify({ 
          needsNewSubscription: true,
          message: 'Subscription no longer exists. Please create a new subscription.',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    console.log('Stripe subscription:')
    console.log('  - status:', stripeSubscription.status)
    console.log('  - cancel_at_period_end:', stripeSubscription.cancel_at_period_end)

    // If subscription is fully canceled in Stripe
    if (stripeSubscription.status === 'canceled') {
      console.log('Subscription is fully canceled - need new subscription')
      return new Response(
        JSON.stringify({ 
          needsNewSubscription: true,
          message: 'Subscription has expired. Please create a new subscription.',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    // If subscription is active but scheduled to cancel, reactivate it
    if (stripeSubscription.status === 'active' && stripeSubscription.cancel_at_period_end) {
      console.log('Subscription scheduled to cancel - reactivating via Stripe...')
      
      const updatedSubscription = await stripe.subscriptions.update(profile.subscription_id, {
        cancel_at_period_end: false,
      })

      console.log('Stripe response:')
      console.log('  - cancel_at_period_end:', updatedSubscription.cancel_at_period_end)

      // NOTE: We do NOT update database here.
      // Stripe will send a webhook and our handler will update the database.

      const endDate = updatedSubscription.current_period_end 
        ? new Date(updatedSubscription.current_period_end * 1000).toISOString()
        : null

      return new Response(
        JSON.stringify({
          success: true,
          reactivated: true,
          needsNewSubscription: false,
          message: 'Your subscription has been reactivated! No payment needed.',
          nextBillingDate: endDate,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    // If subscription is already active and not scheduled to cancel
    if (stripeSubscription.status === 'active' && !stripeSubscription.cancel_at_period_end) {
      console.log('Subscription is already fully active')
      
      const endDate = stripeSubscription.current_period_end 
        ? new Date(stripeSubscription.current_period_end * 1000).toISOString()
        : null

      return new Response(
        JSON.stringify({
          success: true,
          reactivated: false,
          needsNewSubscription: false,
          message: 'Your subscription is already active!',
          nextBillingDate: endDate,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    // Handle other statuses (past_due, unpaid, etc.)
    console.log('Subscription in unusual status:', stripeSubscription.status)
    return new Response(
      JSON.stringify({
        needsNewSubscription: true,
        currentStatus: stripeSubscription.status,
        message: `Subscription is ${stripeSubscription.status}. Please update payment or create new subscription.`,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error: any) {
    console.error('Error:', error.message)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
