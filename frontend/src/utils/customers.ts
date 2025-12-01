import { supabase } from '@/lib/supabase/client'

export interface CustomerData {
  name: string
  phone?: string | null
  email?: string | null
  address?: string | null
  city?: string | null
  state?: string | null
  zip?: string | null
  lat?: number | null
  lng?: number | null
}

/**
 * Find or create a customer
 * Returns the customer ID
 */
export async function findOrCreateCustomer(
  customerData: CustomerData
): Promise<string | null> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error('User not authenticated')
    }

    // First, try to find existing customer by email (if provided)
    if (customerData.email) {
      const { data: existingCustomer } = await supabase
        .from('customers')
        .select('id')
        .eq('user_id', user.id)
        .eq('email', customerData.email)
        .single()

      if (existingCustomer) {
        // Update customer info including address
        await supabase
          .from('customers')
          .update({
            name: customerData.name,
            phone: customerData.phone || null,
            address: customerData.address || null,
            city: customerData.city || null,
            state: customerData.state || null,
            zip: customerData.zip || null,
            lat: customerData.lat || null,
            lng: customerData.lng || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingCustomer.id)

        return existingCustomer.id
      }
    }

    // Try to find by name and phone (if both provided)
    if (customerData.name && customerData.phone) {
      const { data: existingCustomer } = await supabase
        .from('customers')
        .select('id')
        .eq('user_id', user.id)
        .eq('name', customerData.name)
        .eq('phone', customerData.phone)
        .single()

      if (existingCustomer) {
        // Update email and address if provided
        await supabase
          .from('customers')
          .update({
            email: customerData.email || null,
            address: customerData.address || null,
            city: customerData.city || null,
            state: customerData.state || null,
            zip: customerData.zip || null,
            lat: customerData.lat || null,
            lng: customerData.lng || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingCustomer.id)

        return existingCustomer.id
      }
    }

    // Create new customer with all fields including address
    const { data: newCustomer, error } = await supabase
      .from('customers')
      .insert({
        user_id: user.id,
        name: customerData.name,
        phone: customerData.phone || null,
        email: customerData.email || null,
        address: customerData.address || null,
        city: customerData.city || null,
        state: customerData.state || null,
        zip: customerData.zip || null,
        lat: customerData.lat || null,
        lng: customerData.lng || null,
      })
      .select('id')
      .single()

    if (error) throw error

    return newCustomer?.id || null
  } catch (error) {
    console.error('Error finding or creating customer:', error)
    return null
  }
}
