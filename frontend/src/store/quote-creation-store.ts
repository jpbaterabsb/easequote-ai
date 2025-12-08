import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { QuoteFormData, QuoteItem, Addon } from '@/types/quote-creation'

interface QuoteCreationState {
  currentStep: number
  formData: QuoteFormData
  draftId: string | null
  setCurrentStep: (step: number) => void
  updateCustomer: (customer: Partial<QuoteFormData['customer']>) => void
  addItem: (item: QuoteItem) => void
  updateItem: (itemId: string, updates: Partial<QuoteItem>) => void
  removeItem: (itemId: string) => void
  cloneItem: (itemId: string) => void
  addAddonToItem: (itemId: string, addon: Addon) => void
  removeAddonFromItem: (itemId: string, addonId: string) => void
  setMaterials: (providesMaterials: boolean, cost: number) => void
  setPaymentMethod: (paymentMethod: QuoteFormData['payment_method']) => void
  setNotes: (notes: string) => void
  reset: () => void
  setDraftId: (id: string | null) => void
  // Getter para todos os materiais agregados
  getAllMaterials: () => Addon[]
}

const initialFormData: QuoteFormData = {
  customer: {
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    customer_address: '',
    customer_city: '',
    customer_state: '',
    customer_zip: '',
  },
  items: [],
  customer_provides_materials: false,
  material_cost: 0,
  payment_method: undefined,
  notes: '',
}

export const useQuoteCreationStore = create<QuoteCreationState>()(
  persist(
    (set, get) => ({
      currentStep: 1,
      formData: initialFormData,
      draftId: null,

      setCurrentStep: (step) => set({ currentStep: step }),

      updateCustomer: (customer) =>
        set((state) => ({
          formData: {
            ...state.formData,
            customer: { ...state.formData.customer, ...customer },
          },
        })),

      addItem: (item) =>
        set((state) => ({
          formData: {
            ...state.formData,
            items: [...state.formData.items, item],
          },
        })),

      updateItem: (itemId, updates) =>
        set((state) => ({
          formData: {
            ...state.formData,
            items: state.formData.items.map((item) =>
              item.id === itemId ? { ...item, ...updates } : item
            ),
          },
        })),

      removeItem: (itemId) =>
        set((state) => ({
          formData: {
            ...state.formData,
            items: state.formData.items.filter((item) => item.id !== itemId),
          },
        })),

      cloneItem: (itemId) =>
        set((state) => {
          const itemToClone = state.formData.items.find((item) => item.id === itemId)
          if (!itemToClone) return state

          const clonedItem: QuoteItem = {
            ...itemToClone,
            id: crypto.randomUUID(),
            item_name: `${itemToClone.item_name} (Copy)`,
            addons: itemToClone.addons.map((addon) => ({
              ...addon,
              id: crypto.randomUUID(),
            })),
          }

          return {
            formData: {
              ...state.formData,
              items: [...state.formData.items, clonedItem],
            },
          }
        }),

      addAddonToItem: (itemId, addon) =>
        set((state) => ({
          formData: {
            ...state.formData,
            items: state.formData.items.map((item) =>
              item.id === itemId
                ? { ...item, addons: [...item.addons, addon] }
                : item
            ),
          },
        })),

      removeAddonFromItem: (itemId, addonId) =>
        set((state) => ({
          formData: {
            ...state.formData,
            items: state.formData.items.map((item) =>
              item.id === itemId
                ? { ...item, addons: item.addons.filter((a) => a.id !== addonId) }
                : item
            ),
          },
        })),

      setMaterials: (providesMaterials, cost) =>
        set((state) => ({
          formData: {
            ...state.formData,
            customer_provides_materials: providesMaterials,
            material_cost: cost,
          },
        })),

      setPaymentMethod: (paymentMethod) =>
        set((state) => ({
          formData: {
            ...state.formData,
            payment_method: paymentMethod,
          },
        })),

      setNotes: (notes) =>
        set((state) => ({
          formData: {
            ...state.formData,
            notes,
          },
        })),

      reset: () =>
        set({
          currentStep: 1,
          formData: initialFormData,
          draftId: null,
        }),

      setDraftId: (id) => set({ draftId: id }),

      // Getter para todos os materiais de todos os itens
      getAllMaterials: (): Addon[] => {
        const state = get()
        return state.formData.items.flatMap((item: QuoteItem) =>
          item.addons.filter((addon: Addon) => addon.addonType === 'material')
        )
      },
    }),
    {
      name: 'quote-creation-draft',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        formData: state.formData,
        currentStep: state.currentStep,
        draftId: state.draftId,
      }),
    }
  )
)

