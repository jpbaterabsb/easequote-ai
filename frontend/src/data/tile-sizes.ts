/**
 * Especificações de tiles por tamanho
 * Baseado na tabela do documento x.md
 */

export interface TileSize {
  id: string
  name: string
  size: string // Ex: "3x6", "12x24", "Hexagon 8\""
  sqftPerPiece: number
  clipsPerSqft: number
  spacersPerSqft: number
  thinsetPerSqft: number // Thinset usage per sqft
  groutPerSqft: number // Grout usage per sqft
  category: 'subway' | 'rectangular' | 'square' | 'large' | 'special'
}

export const tileSizes: TileSize[] = [
  // Subway / Small Formats - Only spacers (no clips)
  { id: '3x6', name: '3x6', size: '3x6', sqftPerPiece: 0.125, clipsPerSqft: 0, spacersPerSqft: 10, thinsetPerSqft: 0.30, groutPerSqft: 0.07, category: 'subway' },
  { id: '3x12', name: '3x12', size: '3x12', sqftPerPiece: 0.25, clipsPerSqft: 0, spacersPerSqft: 6, thinsetPerSqft: 0.32, groutPerSqft: 0.06, category: 'subway' },
  { id: '4x12', name: '4x12', size: '4x12', sqftPerPiece: 0.33, clipsPerSqft: 0, spacersPerSqft: 5, thinsetPerSqft: 0.35, groutPerSqft: 0.06, category: 'subway' },
  
  // Rectangular (Common Wood-Look & Medium Formats) - Only clips (no spacers)
  { id: '6x24', name: '6x24', size: '6x24', sqftPerPiece: 1.00, clipsPerSqft: 3, spacersPerSqft: 0, thinsetPerSqft: 0.38, groutPerSqft: 0.05, category: 'rectangular' },
  { id: '6x36', name: '6x36', size: '6x36', sqftPerPiece: 1.50, clipsPerSqft: 3, spacersPerSqft: 0, thinsetPerSqft: 0.40, groutPerSqft: 0.05, category: 'rectangular' },
  { id: '6x48', name: '6x48', size: '6x48', sqftPerPiece: 2.00, clipsPerSqft: 2.4, spacersPerSqft: 0, thinsetPerSqft: 0.45, groutPerSqft: 0.05, category: 'rectangular' },
  { id: '8x36', name: '8x36', size: '8x36', sqftPerPiece: 2.00, clipsPerSqft: 2.2, spacersPerSqft: 0, thinsetPerSqft: 0.45, groutPerSqft: 0.05, category: 'rectangular' },
  { id: '8x48', name: '8x48', size: '8x48', sqftPerPiece: 2.66, clipsPerSqft: 3.4, spacersPerSqft: 0, thinsetPerSqft: 0.48, groutPerSqft: 0.05, category: 'rectangular' },
  { id: '12x24', name: '12x24', size: '12x24', sqftPerPiece: 2.00, clipsPerSqft: 2.5, spacersPerSqft: 0, thinsetPerSqft: 0.50, groutPerSqft: 0.04, category: 'rectangular' },
  { id: '12x36', name: '12x36', size: '12x36', sqftPerPiece: 3.00, clipsPerSqft: 2, spacersPerSqft: 0, thinsetPerSqft: 0.55, groutPerSqft: 0.04, category: 'rectangular' },
  { id: '12x48', name: '12x48', size: '12x48', sqftPerPiece: 4.00, clipsPerSqft: 1.8, spacersPerSqft: 0, thinsetPerSqft: 0.60, groutPerSqft: 0.04, category: 'rectangular' },
  
  // Square Formats - Keep both clips and spacers
  { id: '12x12', name: '12x12', size: '12x12', sqftPerPiece: 1.00, clipsPerSqft: 4, spacersPerSqft: 4, thinsetPerSqft: 0.35, groutPerSqft: 0.06, category: 'square' },
  { id: '16x16', name: '16x16', size: '16x16', sqftPerPiece: 1.77, clipsPerSqft: 2.8, spacersPerSqft: 2.8, thinsetPerSqft: 0.40, groutPerSqft: 0.05, category: 'square' },
  { id: '18x18', name: '18x18', size: '18x18', sqftPerPiece: 2.25, clipsPerSqft: 2, spacersPerSqft: 2, thinsetPerSqft: 0.42, groutPerSqft: 0.05, category: 'square' },
  
  // Large Format Tiles - Only clips (no spacers)
  { id: '24x24', name: '24x24', size: '24x24', sqftPerPiece: 4.00, clipsPerSqft: 1.2, spacersPerSqft: 0, thinsetPerSqft: 0.40, groutPerSqft: 0.04, category: 'large' },
  { id: '30x30', name: '30x30', size: '30x30', sqftPerPiece: 6.25, clipsPerSqft: 1.4, spacersPerSqft: 0, thinsetPerSqft: 0.45, groutPerSqft: 0.04, category: 'large' },
  { id: '24x48', name: '24x48', size: '24x48', sqftPerPiece: 8.00, clipsPerSqft: 1.4, spacersPerSqft: 0, thinsetPerSqft: 0.60, groutPerSqft: 0.04, category: 'large' },
  { id: '30x60', name: '30x60', size: '30x60', sqftPerPiece: 12.50, clipsPerSqft: 1.5, spacersPerSqft: 0, thinsetPerSqft: 0.65, groutPerSqft: 0.04, category: 'large' },
  { id: '36x36', name: '36x36', size: '36x36', sqftPerPiece: 9.00, clipsPerSqft: 1.5, spacersPerSqft: 0, thinsetPerSqft: 0.70, groutPerSqft: 0.03, category: 'large' },
  
  // Special Shapes - No clips, no spacers
  { id: 'hexagon_8', name: 'Hexagon 8"', size: 'Hexagon 8"', sqftPerPiece: 0.35, clipsPerSqft: 0, spacersPerSqft: 0, thinsetPerSqft: 0.38, groutPerSqft: 0.07, category: 'special' },
  { id: 'hexagon_12', name: 'Hexagon 12"', size: 'Hexagon 12"', sqftPerPiece: 0.75, clipsPerSqft: 0, spacersPerSqft: 0, thinsetPerSqft: 0.40, groutPerSqft: 0.06, category: 'special' },
  { id: 'penny_tile', name: 'Penny Tile (sheet)', size: 'Penny Tile (sheet)', sqftPerPiece: 1.00, clipsPerSqft: 0, spacersPerSqft: 0, thinsetPerSqft: 0.30, groutPerSqft: 0.07, category: 'special' },
  { id: 'mosaic_sheet', name: 'Mosaic Sheet 12x12', size: 'Mosaic Sheet 12x12', sqftPerPiece: 1.00, clipsPerSqft: 0, spacersPerSqft: 0, thinsetPerSqft: 0.35, groutPerSqft: 0.06, category: 'special' },
  { id: 'arabesco', name: 'Arabesco', size: 'Arabesco', sqftPerPiece: 0.30, clipsPerSqft: 0, spacersPerSqft: 0, thinsetPerSqft: 0.40, groutPerSqft: 0.07, category: 'special' },
  { id: 'fish_scale', name: 'Fish Scale', size: 'Fish Scale', sqftPerPiece: 0.25, clipsPerSqft: 0, spacersPerSqft: 0, thinsetPerSqft: 0.38, groutPerSqft: 0.07, category: 'special' },
]

/**
 * Material coverage formulas and prices (based on Home Depot research)
 * Prices are in USD and represent average retail prices
 */
export interface MaterialCoverage {
  coverage: number // Coverage per unit
  pricePerUnit: number // Price per unit (bag, gallon, roll, etc.)
  unit: string // Unit type (bag, gallon, roll, tube, etc.)
  formula: (sqft: number) => number // Formula to calculate quantity needed
}

export const materialCoverage: Record<string, MaterialCoverage> = {
  // Tile installation materials
  thinset: { 
    coverage: 80, 
    pricePerUnit: 20, // $15-25 per 50lb bag, average $20
    unit: 'bag',
    formula: (sqft: number) => Math.ceil(sqft / 80) 
  },
  grout: { 
    coverage: 200, 
    pricePerUnit: 20, // $15-25 per bag, average $20
    unit: 'bag',
    formula: (sqft: number) => Math.ceil(sqft / 200) 
  },
  waterproof: { 
    coverage: 55, 
    pricePerUnit: 265, // $180-350 per unit (roll/gallon), average $265
    unit: 'unit',
    formula: (sqft: number) => Math.ceil(sqft / 55) 
  },
  backerBoard: { 
    coverage: 15, 
    pricePerUnit: 14.47, // $10-15 per 3x5 sheet, average $14.47
    unit: 'sheet',
    formula: (sqft: number) => Math.ceil(sqft / 15) 
  },
  silicone: { 
    coverage: 25, 
    pricePerUnit: 7.5, // $5-10 per tube, average $7.50
    unit: 'tube',
    formula: (linearFt: number) => Math.ceil(linearFt / 25) 
  },
  mortar: { 
    coverage: 30, 
    pricePerUnit: 20, // $15-25 per bag, average $20
    unit: 'bag',
    formula: (sqft: number) => Math.ceil(sqft / 30) 
  },
  
  // Flooring materials
  underlayment: { 
    coverage: 1, 
    pricePerUnit: 0.5, // $0.40-0.60 per sqft, average $0.50
    unit: 'sqft',
    formula: (sqft: number) => sqft 
  },
  quarterRound: { 
    coverage: 1, 
    pricePerUnit: 1.5, // $1-2 per linear foot, average $1.50
    unit: 'ft',
    formula: (linearFt: number) => linearFt 
  },
  transitionStrips: { 
    coverage: 1, 
    pricePerUnit: 24, // $18-30 per unit, average $24
    unit: 'unit',
    formula: (units: number) => units 
  },
  baseboards: { 
    coverage: 1, 
    pricePerUnit: 2.5, // $2-3 per linear foot, average $2.50
    unit: 'ft',
    formula: (linearFt: number) => linearFt 
  },
  vinylPlankBox: {
    coverage: 23.5, // average sqft per box
    pricePerUnit: 55, // average $50-60 per box
    unit: 'box',
    formula: (sqft: number) => Math.ceil(sqft / 23.5),
  },
  laminateBox: {
    coverage: 20, // average sqft per box
    pricePerUnit: 45,
    unit: 'box',
    formula: (sqft: number) => Math.ceil(sqft / 20),
  },
  
  // Painting materials
  paint: { 
    coverage: 350, 
    pricePerUnit: 40, // $30-50 per gallon, average $40
    unit: 'gallon',
    formula: (sqft: number) => Math.ceil(sqft / 350) 
  },
  primer: { 
    coverage: 250, 
    pricePerUnit: 30, // $20-40 per gallon, average $30
    unit: 'gallon',
    formula: (sqft: number) => Math.ceil(sqft / 250) 
  },
  
  // Drywall materials
  drywallMud: { 
    coverage: 120, 
    pricePerUnit: 15, // $10-20 per bag, average $15
    unit: 'bag',
    formula: (sqft: number) => Math.ceil(sqft / 120) 
  },
  drywallTape: { 
    coverage: 1, 
    pricePerUnit: 8, // $5-10 per roll, average $8
    unit: 'roll',
    formula: (linearFt: number) => Math.ceil(linearFt / 500) // 500ft per roll
  },
  
  // Exterior materials
  concreteSealer: { 
    coverage: 250, 
    pricePerUnit: 30, // $20-40 per gallon, average $30
    unit: 'gallon',
    formula: (sqft: number) => Math.ceil(sqft / 250) 
  },
  
  // Plumbing materials
  waxRing: { 
    coverage: 1, 
    pricePerUnit: 4.5, // $3-6 per ring, average $4.50
    unit: 'ring',
    formula: (units: number) => units 
  },
  caulk: { 
    coverage: 25, 
    pricePerUnit: 7.5, // $5-10 per tube, average $7.50
    unit: 'tube',
    formula: (linearFt: number) => Math.ceil(linearFt / 25) 
  },
}

/**
 * Encontra um tile size por ID
 */
export function findTileSizeById(id: string): TileSize | undefined {
  return tileSizes.find((tile) => tile.id === id)
}

/**
 * Calcula a quantidade de clips necessários baseado no tamanho do tile e área
 */
export function calculateClipsNeeded(tileSizeId: string, area: number): number {
  const tileSize = findTileSizeById(tileSizeId)
  if (!tileSize) return 0
  return Math.ceil(area * tileSize.clipsPerSqft)
}

/**
 * Calcula a quantidade de spacers necessários baseado no tamanho do tile e área
 */
export function calculateSpacersNeeded(tileSizeId: string, area: number): number {
  const tileSize = findTileSizeById(tileSizeId)
  if (!tileSize) return 0
  return Math.ceil(area * tileSize.spacersPerSqft)
}

const TILE_WASTE_FACTOR = 1.1 // 10% waste buffer
const FLOORING_WASTE_FACTOR = 1.08

export function calculateTilePiecesNeeded(tileSizeId: string, area: number): number {
  const tileSize = findTileSizeById(tileSizeId)
  if (!tileSize || tileSize.sqftPerPiece <= 0) return 0
  const sqftWithWaste = area * TILE_WASTE_FACTOR
  return Math.ceil(sqftWithWaste / tileSize.sqftPerPiece)
}

export function calculateFlooringBoxesNeeded(type: 'vinyl' | 'laminate', area: number): number {
  const coverage =
    type === 'vinyl'
      ? materialCoverage.vinylPlankBox
      : materialCoverage.laminateBox
  if (!coverage || coverage.coverage <= 0) return 0
  const sqftWithWaste = area * FLOORING_WASTE_FACTOR
  return coverage.formula(sqftWithWaste)
}

