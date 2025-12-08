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
 * CANCEL-SUBSCRIPTION
 * 
 * This function ONLY interacts with Stripe API.
 * Database updates are handled by the stripe-webhook when Stripe sends events.
 * 
 * Stripe is the single source of truth for subscription status.
 */
serve(async (req) => {
  console.log('=== CANCEL-SUBSCRIPTION ===')
  
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    // Create Supabase client for auth only
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
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('subscription_id')
      .eq('id', user.id)
      .single()

    if (profileError || !profile?.subscription_id) {
      throw new Error('No active subscription found')
    }

    console.log('Subscription ID:', profile.subscription_id)

    // Get request body
    const body = await req.json().catch(() => ({}))
    const cancelImmediately = body.cancelImmediately === true

    // Call Stripe API - this will trigger a webhook event
    let subscription
    if (cancelImmediately) {
      console.log('Canceling immediately via Stripe...')
      subscription = await stripe.subscriptions.cancel(profile.subscription_id)
    } else {
      console.log('Scheduling cancellation at period end via Stripe...')
      subscription = await stripe.subscriptions.update(profile.subscription_id, {
        cancel_at_period_end: true,
      })
    }

    console.log('Stripe response:')
    console.log('  - status:', subscription.status)
    console.log('  - cancel_at_period_end:', subscription.cancel_at_period_end)
    console.log('  - current_period_end:', subscription.current_period_end)

    // NOTE: We do NOT update the database here.
    // Stripe will send a customer.subscription.updated webhook event
    // and our webhook handler will update the database.

    const endDate = subscription.current_period_end 
      ? new Date(subscription.current_period_end * 1000).toISOString()
      : null

    return new Response(
      JSON.stringify({
        success: true,
        message: cancelImmediately 
          ? 'Subscription canceled immediately'
          : `Subscription will end on ${new Date(endDate!).toLocaleDateString()}`,
        accessUntil: endDate,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
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
