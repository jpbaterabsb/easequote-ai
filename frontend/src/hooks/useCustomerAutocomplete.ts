import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useDebounce } from './useDebounce'

export interface Customer {
  id: string
  name: string
  phone: string | null
  email: string | null
  address: string | null
  city: string | null
  state: string | null
  zip: string | null
  lat: number | null
  lng: number | null
  created_at: string
}

export function useCustomerAutocomplete(searchQuery: string) {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(false)
  const debouncedQuery = useDebounce(searchQuery, 300)
  const requestIdRef = useRef(0)
  const isMountedRef = useRef(true)

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  useEffect(() => {
    // Increment request ID for this request
    const currentRequestId = ++requestIdRef.current

    const fetchCustomers = async () => {
      if (!debouncedQuery.trim() || debouncedQuery.length < 2) {
        // Only update if this is still the latest request
        if (currentRequestId === requestIdRef.current && isMountedRef.current) {
          setCustomers([])
          setLoading(false)
        }
        return
      }

      try {
        // Only set loading if this is still the latest request
        if (currentRequestId === requestIdRef.current && isMountedRef.current) {
          setLoading(true)
        }

        // Fuzzy search using ILIKE for case-insensitive pattern matching
        // Search by name, email, or phone
        const { data, error } = await supabase
          .from('customers')
          .select('id, name, phone, email, address, city, state, zip, lat, lng, created_at')
          .or(
            `name.ilike.%${debouncedQuery}%,email.ilike.%${debouncedQuery}%,phone.ilike.%${debouncedQuery}%`
          )
          .order('name', { ascending: true })
          .limit(10)

        // Only update state if this is still the latest request and component is mounted
        if (currentRequestId === requestIdRef.current && isMountedRef.current) {
          if (error) {
            console.error('Error fetching customers:', error)
            setCustomers([])
          } else {
            setCustomers(data || [])
          }
          setLoading(false)
        }
      } catch (error) {
        // Only update state if this is still the latest request and component is mounted
        if (currentRequestId === requestIdRef.current && isMountedRef.current) {
          console.error('Error fetching customers:', error)
          setCustomers([])
          setLoading(false)
        }
      }
    }

    fetchCustomers()
  }, [debouncedQuery])

  return { customers, loading }
}

