import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { X } from 'lucide-react'
import type { Category } from '@/data/categories'
import { useTranslation } from '@/hooks/useTranslation'

interface SubcategorySelectorProps {
  category: Category | null
  selectedSubcategoryId: string
  onSelect: (subcategoryId: string) => void
  onClearCategory?: () => void
  categoryLocked?: boolean // Se true, não permite limpar categoria
}

export function SubcategorySelector({
  category,
  selectedSubcategoryId,
  onSelect,
  onClearCategory,
  categoryLocked = false,
}: SubcategorySelectorProps) {
  const { t } = useTranslation()

  if (!category) return null

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>{t('quoteCreation.subcategory')}</Label>
        {onClearCategory && !categoryLocked && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClearCategory}
            className="h-7 px-2 text-xs"
          >
            <X className="h-3 w-3 mr-1" />
            {t('common.clear')}
          </Button>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {category.subcategories.map((subcategory) => {
          const isSelected = selectedSubcategoryId === subcategory.id
          const hasAddons = subcategory.suggestedAddons.length > 0

          return (
            <button
              key={subcategory.id}
              type="button"
              onClick={() => onSelect(subcategory.id)}
              className={`
                text-left p-3 rounded-lg border-2 transition-all duration-200
                ${isSelected
                  ? 'border-primary bg-primary/5 shadow-md'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }
              `}
            >
              <div className="flex items-center justify-between">
                <span className={`font-medium text-sm ${isSelected ? 'text-primary' : 'text-gray-900'}`}>
                  {subcategory.name}
                </span>
                {hasAddons && (
                  <span className="text-xs text-muted-foreground">
                    ({subcategory.suggestedAddons.length} {t('quoteCreation.addons')})
                  </span>
                )}
              </div>
              {subcategory.id === 'others' && (
                <p className="text-xs text-muted-foreground mt-1">
                  {t('quoteCreation.manualEntry')}
                </p>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

