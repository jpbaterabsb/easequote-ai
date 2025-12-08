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

serve(async (req) => {
  console.log('=== CREATE-CHECKOUT: Request received ===')
  console.log('Method:', req.method)
  console.log('URL:', req.url)
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('CORS preflight request - returning OK')
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    console.log('Auth header present:', !!authHeader)
    
    if (!authHeader) {
      console.error('ERROR: No authorization header provided')
      throw new Error('No authorization header')
    }

    // Create Supabase client
    console.log('Creating Supabase client...')
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    )

    // Get the user
    console.log('Fetching authenticated user...')
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    
    if (userError) {
      console.error('ERROR: User authentication failed:', userError.message)
      throw new Error('User not authenticated')
    }
    
    if (!user) {
      console.error('ERROR: No user found in session')
      throw new Error('User not authenticated')
    }
    
    console.log('User authenticated:', {
      id: user.id,
      email: user.email,
    })

    // Get request body
    const body = await req.json()
    const { priceId, successUrl, cancelUrl } = body
    
    console.log('Request body:', {
      priceId,
      successUrl,
      cancelUrl,
    })

    if (!priceId) {
      console.error('ERROR: No priceId provided in request body')
      throw new Error('Price ID is required')
    }

    // Check if user already has a Stripe customer ID
    console.log('Checking for existing Stripe customer ID...')
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.warn('Warning: Could not fetch profile:', profileError.message)
    }

    let customerId = profile?.stripe_customer_id
    console.log('Existing Stripe customer ID:', customerId || 'none')

    // Create a new Stripe customer if doesn't exist
    if (!customerId) {
      console.log('Creating new Stripe customer...')
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          supabase_user_id: user.id,
        },
      })
      customerId = customer.id
      console.log('New Stripe customer created:', customerId)

      // Save customer ID to profile
      console.log('Saving customer ID to profile...')
      const { error: updateError } = await supabaseClient
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id)
      
      if (updateError) {
        console.error('ERROR: Failed to save customer ID to profile:', updateError.message)
      } else {
        console.log('Customer ID saved to profile successfully')
      }
    }

    // Create checkout session
    console.log('Creating Stripe checkout session...')
    console.log('Checkout params:', {
      customer: customerId,
      priceId,
      mode: 'subscription',
      successUrl: successUrl || `${req.headers.get('origin')}/dashboard?payment=success`,
      cancelUrl: cancelUrl || `${req.headers.get('origin')}/dashboard?payment=cancelled`,
    })
    
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl || `${req.headers.get('origin')}/dashboard?payment=success`,
      cancel_url: cancelUrl || `${req.headers.get('origin')}/dashboard?payment=cancelled`,
      subscription_data: {
        metadata: {
          supabase_user_id: user.id,
        },
      },
    })

    console.log('Checkout session created successfully:', {
      sessionId: session.id,
      url: session.url,
    })

    console.log('=== CREATE-CHECKOUT: Success ===')
    return new Response(
      JSON.stringify({ url: session.url }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('=== CREATE-CHECKOUT: Error ===')
    console.error('Error type:', error.constructor.name)
    console.error('Error message:', error.message)
    console.error('Error stack:', error.stack)
    
    // Check for Stripe-specific errors
    if (error.type) {
      console.error('Stripe error type:', error.type)
      console.error('Stripe error code:', error.code)
    }
    
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})

