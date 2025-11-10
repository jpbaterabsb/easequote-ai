import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCallback, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AddressAutocomplete } from './AddressAutocomplete'
import { CustomerAutocomplete } from './CustomerAutocomplete'
import { useQuoteCreationStore } from '@/store/quote-creation-store'
import type { CustomerInfo } from '@/types/quote-creation'

const customerSchema = z.object({
  customer_name: z.string().min(1, 'Customer name is required'),
  customer_phone: z.string().optional(),
  customer_email: z.string().email('Invalid email address').optional().or(z.literal('')),
  customer_address: z.string().optional(),
  customer_city: z.string().optional(),
  customer_state: z.string().optional(),
  customer_zip: z.string().optional(),
})

type CustomerFormData = z.infer<typeof customerSchema>

interface CustomerStepProps {
  onNext: () => void
}

export function CustomerStep({ onNext }: CustomerStepProps) {
  const { formData, updateCustomer } = useQuoteCreationStore()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      customer_name: formData.customer.customer_name,
      customer_phone: formData.customer.customer_phone || '',
      customer_email: formData.customer.customer_email || '',
      customer_address: formData.customer.customer_address || '',
      customer_city: formData.customer.customer_city || '',
      customer_state: formData.customer.customer_state || '',
      customer_zip: formData.customer.customer_zip || '',
    },
  })

  const customerName = watch('customer_name')
  const customerData = watch()

  const onSubmit = (data: CustomerFormData) => {
    updateCustomer(data)
    onNext()
  }

  const handleCustomerNameChange = useCallback(
    (value: string) => {
      setValue('customer_name', value, { shouldValidate: true })
      updateCustomer({ customer_name: value })
    },
    [setValue, updateCustomer]
  )

  const handleSelectCustomer = useCallback(
    (customer: { name: string; phone?: string; email?: string }) => {
      setValue('customer_name', customer.name, { shouldValidate: true })
      setValue('customer_phone', customer.phone || '', { shouldValidate: true })
      setValue('customer_email', customer.email || '', { shouldValidate: true })
      updateCustomer({
        customer_name: customer.name,
        customer_phone: customer.phone,
        customer_email: customer.email,
      })
    },
    [setValue, updateCustomer]
  )

  const handleAddressChange = useCallback(
    (address: Partial<CustomerInfo>) => {
      updateCustomer(address)
      setValue('customer_address', address.customer_address || '')
      setValue('customer_city', address.customer_city || '')
      setValue('customer_state', address.customer_state || '')
      setValue('customer_zip', address.customer_zip || '')
    },
    [setValue, updateCustomer]
  )

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Customer Information</h2>
        <p className="text-muted-foreground">
          Enter the customer details for this quote.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="customer_name">
            Customer Name <span className="text-destructive">*</span>
          </Label>
          <CustomerAutocomplete
            id="customer_name"
            value={customerName}
            onChange={handleCustomerNameChange}
            onSelectCustomer={handleSelectCustomer}
            error={errors.customer_name?.message}
            placeholder="Start typing to search customers..."
          />
        </div>

        <div>
          <Label htmlFor="customer_phone">Phone Number</Label>
          <Input
            id="customer_phone"
            {...register('customer_phone')}
            placeholder="+1 (555) 123-4567"
            onChange={(e) => {
              register('customer_phone').onChange(e)
              updateCustomer({ customer_phone: e.target.value })
            }}
          />
        </div>

        <div>
          <Label htmlFor="customer_email">Email</Label>
          <Input
            id="customer_email"
            type="email"
            {...register('customer_email')}
            placeholder="customer@example.com"
            className={errors.customer_email ? 'border-destructive' : ''}
            onChange={(e) => {
              register('customer_email').onChange(e)
              updateCustomer({ customer_email: e.target.value })
            }}
          />
          {errors.customer_email && (
            <p className="text-sm text-destructive mt-1">
              {errors.customer_email.message}
            </p>
          )}
        </div>

        <AddressAutocomplete
          value={customerData}
          onChange={handleAddressChange}
          error={errors.customer_address?.message}
        />
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Next: Add Line Items
        </button>
      </div>
    </form>
  )
}

