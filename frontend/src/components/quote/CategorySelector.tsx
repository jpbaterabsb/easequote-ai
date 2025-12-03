import { Label } from '@/components/ui/label'
import { categories } from '@/data/categories'
import { useTranslation } from '@/hooks/useTranslation'
import { 
  LayoutGrid, 
  Bath, 
  ChefHat, 
  Home, 
  Paintbrush, 
  SquareStack 
} from 'lucide-react'

interface CategorySelectorProps {
  selectedCategoryId: string
  onSelect: (categoryId: string) => void
  disabled?: boolean
  locked?: boolean // Se true, categoria já foi selecionada e não pode ser alterada
}

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  flooring: LayoutGrid,
  bathroom: Bath,
  kitchen: ChefHat,
  exterior: Home,
  painting: Paintbrush,
  drywall: SquareStack,
}

const categoryColors: Record<string, { bg: string; hover: string; text: string }> = {
  flooring: {
    bg: 'bg-orange-500',
    hover: 'hover:bg-orange-600',
    text: 'text-white',
  },
  bathroom: {
    bg: 'bg-blue-500',
    hover: 'hover:bg-blue-600',
    text: 'text-white',
  },
  kitchen: {
    bg: 'bg-teal-500',
    hover: 'hover:bg-teal-600',
    text: 'text-white',
  },
  exterior: {
    bg: 'bg-green-500',
    hover: 'hover:bg-green-600',
    text: 'text-white',
  },
  painting: {
    bg: 'bg-purple-500',
    hover: 'hover:bg-purple-600',
    text: 'text-white',
  },
  drywall: {
    bg: 'bg-gray-500',
    hover: 'hover:bg-gray-600',
    text: 'text-white',
  },
}

export function CategorySelector({ selectedCategoryId, onSelect, disabled = false, locked = false }: CategorySelectorProps) {
  const { t } = useTranslation()

  return (
    <div className="space-y-3">
      <Label>{t('quoteCreation.category')}</Label>
      {disabled && (
        <p className="text-sm text-muted-foreground">
          {t('quoteCreation.enterAreaFirst') || 'Please enter the area first'}
        </p>
      )}
      {locked && (
        <p className="text-sm text-muted-foreground">
          {t('quoteCreation.categoryLocked') || 'Category is locked. Create a new item for a different category.'}
        </p>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {categories.map((category) => {
          const Icon = categoryIcons[category.id] || LayoutGrid
          const colors = categoryColors[category.id] || categoryColors.flooring
          const isSelected = selectedCategoryId === category.id
          const isDisabled = disabled || (locked && !isSelected)

          return (
            <button
              key={category.id}
              type="button"
              onClick={() => !isDisabled && onSelect(category.id)}
              disabled={isDisabled}
              className={`
                flex flex-col items-center justify-center gap-2 p-4 rounded-lg
                transition-all duration-200
                ${colors.bg} ${colors.hover} ${colors.text}
                ${isSelected 
                  ? 'ring-2 ring-offset-2 ring-primary shadow-lg scale-105' 
                  : 'shadow-md hover:shadow-lg hover:scale-105'
                }
                ${isDisabled ? 'opacity-50 cursor-not-allowed hover:scale-100 hover:shadow-md' : ''}
              `}
            >
              <Icon className="h-8 w-8" />
              <span className="font-medium text-sm">{category.name}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

