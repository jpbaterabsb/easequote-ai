import { Button } from '@/components/ui/button'
import { Package, Wrench, Box, ChevronRight } from 'lucide-react'
import type { Subcategory } from '@/data/categories'
import { useTranslation } from '@/hooks/useTranslation'

interface PackageOverviewScreenProps {
  subcategory: Subcategory
  onSelectTileSize: () => void
  onContinueWithoutTile: () => void
}

export function PackageOverviewScreen({
  subcategory,
  onSelectTileSize,
  onContinueWithoutTile,
}: PackageOverviewScreenProps) {
  const { t } = useTranslation()

  const includedItems = subcategory.includedItems || []
  const services = includedItems.filter((item) => item.type === 'service')
  const materials = includedItems.filter((item) => item.type === 'material')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center pb-4 border-b">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-3">
          <Package className="w-7 h-7 text-primary" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">
          {t('quoteCreation.packageOverview') || 'Package Overview'}
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          {t('quoteCreation.packageOverviewDescription') || 'Here\'s what\'s included in this package'}
        </p>
      </div>

      {/* Included Services */}
      {services.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Wrench className="w-4 h-4 text-blue-600" />
            <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              {t('quoteCreation.includedServices') || 'Included Services'}
            </h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {services.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-100 rounded-lg"
              >
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="text-sm font-medium text-blue-900">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Included Materials */}
      {materials.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Box className="w-4 h-4 text-emerald-600" />
            <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              {t('quoteCreation.includedMaterials') || 'Included Materials'}
            </h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {materials.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-100 rounded-lg"
              >
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-sm font-medium text-emerald-900">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tile Selection Info */}
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <p className="text-sm text-amber-800">
          <strong>{t('quoteCreation.tileNote') || 'Note'}:</strong>{' '}
          {t('quoteCreation.tileNoteDescription') || 'Tile is not included in this package. You can select a tile size to add it to the quote, or continue without tile and add it later.'}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3 pt-2">
        <Button
          type="button"
          onClick={onSelectTileSize}
          className="w-full h-12 text-base font-semibold"
        >
          {t('quoteCreation.selectTileSize') || 'Select Tile Size'}
          <ChevronRight className="w-5 h-5 ml-2" />
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onContinueWithoutTile}
          className="w-full h-11"
        >
          {t('quoteCreation.continueWithoutTile') || 'Continue Without Tile'}
        </Button>
      </div>
    </div>
  )
}

