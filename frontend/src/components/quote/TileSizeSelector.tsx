import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { tileSizes, type TileSize } from '@/data/tile-sizes'
import { useTranslation } from '@/hooks/useTranslation'

interface TileSizeSelectorProps {
  selectedTileSizeId: string | null
  onSelect: (tileSizeId: string) => void
}

export function TileSizeSelector({ selectedTileSizeId, onSelect }: TileSizeSelectorProps) {
  const { t } = useTranslation()

  // Agrupar tiles por categoria
  const tilesByCategory = {
    subway: tileSizes.filter((t) => t.category === 'subway'),
    rectangular: tileSizes.filter((t) => t.category === 'rectangular'),
    square: tileSizes.filter((t) => t.category === 'square'),
    special: tileSizes.filter((t) => t.category === 'special'),
  }

  const renderCategorySection = (title: string, tiles: TileSize[]) => {
    if (tiles.length === 0) return null

    return (
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-gray-700">{title}</h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {tiles.map((tile) => {
            const isSelected = selectedTileSizeId === tile.id
            return (
              <button
                key={tile.id}
                type="button"
                onClick={() => onSelect(tile.id)}
                className={`
                  p-3 rounded-lg border-2 transition-all text-sm
                  ${isSelected
                    ? 'border-primary bg-primary/10 text-primary font-semibold'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }
                `}
              >
                <div className="font-medium">{tile.name}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {tile.clipsPerSqft} clips/sqf
                </div>
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-base font-semibold">
          {t('quoteCreation.selectTileSize') || 'Select Tile Size'}
        </Label>
        <p className="text-sm text-muted-foreground mt-1">
          {t('quoteCreation.selectTileSizeDescription') || 'Choose the tile size to calculate materials automatically'}
        </p>
      </div>

      <div className="space-y-4 max-h-[400px] overflow-y-auto">
        {renderCategorySection(
          t('quoteCreation.tileSubway') || 'Subway / Small Formats',
          tilesByCategory.subway
        )}
        {renderCategorySection(
          t('quoteCreation.tileRectangular') || 'Rectangular (Wood-Look)',
          tilesByCategory.rectangular
        )}
        {renderCategorySection(
          t('quoteCreation.tileSquare') || 'Square Formats',
          tilesByCategory.square
        )}
        {renderCategorySection(
          t('quoteCreation.tileSpecial') || 'Special Shapes',
          tilesByCategory.special
        )}
      </div>
    </div>
  )
}

