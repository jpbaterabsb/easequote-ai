export type AddonType = 'material' | 'service' | 'complexity' | 'general'

export interface SuggestedAddon {
  id: string
  name: string
  priceType: 'sqft' | 'unit' | 'ft' | 'step' | 'percent'
  priceRange: {
    min: number
    max?: number
  }
  defaultPrice?: number // Preço padrão quando há range
  addonType: AddonType // Tipo do addon: material, service, complexity, ou general
}

export interface Subcategory {
  id: string
  name: string
  suggestedAddons: SuggestedAddon[]
  requiresTileSize?: boolean // Se true, requer seleção de tamanho de tile antes de mostrar addons
  basePrice?: number // Preço base/instalação que compartilha o estado com price_per_sqft
  basePriceName?: string // Nome do base price (ex: "Base price", "Installation", "Install")
}

export interface Category {
  id: string
  name: string
  subcategories: Subcategory[]
}

export const categories: Category[] = [
  {
    id: 'flooring',
    name: 'Flooring',
    subcategories: [
      {
        id: 'vinyl_plank',
        name: 'Vinyl Plank',
        basePrice: 2.25,
        basePriceName: 'Base price',
        suggestedAddons: [
          {
            id: 'base_price',
            name: 'Base price',
            priceType: 'sqft',
            priceRange: { min: 2.25 },
            defaultPrice: 2.25,
            addonType: 'service',
          },
          {
            id: 'demo_remove',
            name: 'Demo remove',            priceType: 'sqft',
            priceRange: { min: 0.5 },
            defaultPrice: 0.5,
            addonType: 'service',
          },
          {
            id: 'underlayment',
            name: 'Underlayment',            priceType: 'sqft',
            priceRange: { min: 0.4, max: 0.6 },
            defaultPrice: 0.5,
            addonType: 'material',
          },
          {
            id: 'adhesive',
            name: 'Adhesive',            priceType: 'unit',
            priceRange: { min: 20, max: 35 },
            defaultPrice: 27.5,
            addonType: 'material',
          },
          {
            id: 'quarter_round',
            name: 'Quarter round',            priceType: 'ft',
            priceRange: { min: 1, max: 2 },
            defaultPrice: 1.5,
            addonType: 'material',
          },
          {
            id: 'transition_strips',
            name: 'Transition strips',            priceType: 'unit',
            priceRange: { min: 18, max: 30 },
            defaultPrice: 24,
            addonType: 'material',
          },
          {
            id: 'baseboards',
            name: 'Baseboards',            priceType: 'ft',
            priceRange: { min: 2, max: 3 },
            defaultPrice: 2.5,
            addonType: 'material',
          },
          {
            id: 'cplx_many_cuts',
            name: 'Cplx many cuts',            priceType: 'percent',
            priceRange: { min: 10 },
            defaultPrice: 10,
            addonType: 'complexity',
          },
          {
            id: 'cplx_diagonal',
            name: 'Cplx diagonal',            priceType: 'sqft',
            priceRange: { min: 0.5 },
            defaultPrice: 0.5,
            addonType: 'complexity',
          },
          {
            id: 'cplx_corners',
            name: 'Cplx corners',            priceType: 'percent',
            priceRange: { min: 15 },
            defaultPrice: 15,
            addonType: 'complexity',
          },
          {
            id: 'subfloor_leveling',
            name: 'Subfloor leveling',            priceType: 'sqft',
            priceRange: { min: 0.5, max: 1.5 },
            defaultPrice: 1.0,
            addonType: 'service',
          },
          {
            id: 'door_trimming',
            name: 'Door trimming',            priceType: 'unit',
            priceRange: { min: 20, max: 40 },
            defaultPrice: 30,
            addonType: 'service',
          },
        ],
      },
      {
        id: 'vinyl_glue_down',
        name: 'Vinyl Glue-Down',
        basePrice: 2.25,
        basePriceName: 'Base price',
        suggestedAddons: [
          {
            id: 'base_price',
            name: 'Base price',
            priceType: 'sqft',
            priceRange: { min: 2.0, max: 2.5 },
            defaultPrice: 2.25,
          addonType: 'service',
            },
          {
            id: 'demo_remove',
            name: 'Demo remove',            priceType: 'sqft',
            priceRange: { min: 0.5 },
            defaultPrice: 0.5,
          addonType: 'service',
            },
          {
            id: 'adhesive',
            name: 'Adhesive',            priceType: 'unit',
            priceRange: { min: 20, max: 35 },
            defaultPrice: 27.5,
          addonType: 'material',
            },
          {
            id: 'trowel_lines_correction',
            name: 'Trowel lines correction',            priceType: 'sqft',
            priceRange: { min: 0.2, max: 0.4 },
            defaultPrice: 0.3,
          addonType: 'general',
            },
          {
            id: 'subfloor_leveling',
            name: 'Subfloor leveling',            priceType: 'sqft',
            priceRange: { min: 0.5, max: 1.5 },
            defaultPrice: 1.0,
          addonType: 'service',
            },
          {
            id: 'transitions',
            name: 'Transitions',            priceType: 'unit',
            priceRange: { min: 18, max: 30 },
            defaultPrice: 24,
          addonType: 'material',
            },
        ],
      },
      {
        id: 'laminate',
        name: 'Laminate',
        basePrice: 2.0,
        basePriceName: 'Base price',
        suggestedAddons: [
          {
            id: 'base_price',
            name: 'Base price',
            priceType: 'sqft',
            priceRange: { min: 2.0 },
            defaultPrice: 2.0,
          addonType: 'service',
            },
          {
            id: 'demo_remove',
            name: 'Demo remove',            priceType: 'sqft',
            priceRange: { min: 0.5 },
            defaultPrice: 0.5,
          addonType: 'service',
            },
          {
            id: 'underlayment',
            name: 'Underlayment',            priceType: 'sqft',
            priceRange: { min: 0.3, max: 0.5 },
            defaultPrice: 0.4,
          addonType: 'material',
            },
          {
            id: 'transition_strips',
            name: 'Transition strips',            priceType: 'unit',
            priceRange: { min: 18, max: 30 },
            defaultPrice: 24,
          addonType: 'material',
            },
          {
            id: 'quarter_round',
            name: 'Quarter round',            priceType: 'ft',
            priceRange: { min: 1, max: 2 },
            defaultPrice: 1.5,
          addonType: 'material',
            },
          {
            id: 'cplx_many_cuts',
            name: 'Cplx many cuts',            priceType: 'percent',
            priceRange: { min: 10 },
            defaultPrice: 10,
          addonType: 'complexity',
            },
          {
            id: 'stairs',
            name: 'Stairs',            priceType: 'step',
            priceRange: { min: 40, max: 80 },
            defaultPrice: 60,
          addonType: 'general',
            },
        ],
      },
      {
        id: 'tile_floor',
        name: 'Tile Floor',
        requiresTileSize: true,
        basePrice: 4.5,
        basePriceName: 'Base price',
        suggestedAddons: [
          {
            id: 'base_price',
            name: 'Base price',
            priceType: 'sqft',
            priceRange: { min: 4.5 },
            defaultPrice: 4.5,
          addonType: 'service',
            },
          {
            id: 'demo_tile',
            name: 'Demo tile',            priceType: 'sqft',
            priceRange: { min: 1, max: 2 },
            defaultPrice: 1.5,
          addonType: 'service',
            },
          {
            id: 'thinset',
            name: 'Thinset',            priceType: 'unit',
            priceRange: { min: 15, max: 25 },
            defaultPrice: 20,
          addonType: 'material',
            },
          {
            id: 'grout',
            name: 'Grout',            priceType: 'unit',
            priceRange: { min: 15, max: 25 },
            defaultPrice: 20,
          addonType: 'material',
            },
          {
            id: 'spacers',
            name: 'Spacers',            priceType: 'unit',
            priceRange: { min: 5, max: 15 },
            defaultPrice: 10,
          addonType: 'material',
            },
          {
            id: 'leveling_clips',
            name: 'Leveling clips',            priceType: 'unit',
            priceRange: { min: 20, max: 40 },
            defaultPrice: 30,
          addonType: 'material',
            },
          {
            id: 'silicone',
            name: 'Silicone',            priceType: 'unit',
            priceRange: { min: 5, max: 10 },
            defaultPrice: 7.5,
          addonType: 'material',
            },
          {
            id: 'cplx_diagonal',
            name: 'Cplx diagonal',            priceType: 'sqft',
            priceRange: { min: 0.8, max: 1.5 },
            defaultPrice: 1.15,
          addonType: 'complexity',
            },
          {
            id: 'cplx_large_format',
            name: 'Cplx large format',            priceType: 'sqft',
            priceRange: { min: 1.5, max: 3 },
            defaultPrice: 2.25,
          addonType: 'complexity',
            },
          {
            id: 'cplx_decorative_band',
            name: 'Cplx decorative band',            priceType: 'ft',
            priceRange: { min: 8, max: 20 },
            defaultPrice: 14,
          addonType: 'complexity',
            },
          {
            id: 'waterproof',
            name: 'Waterproof',            priceType: 'sqft',
            priceRange: { min: 2, max: 4 },
            defaultPrice: 3,
          addonType: 'material',
            },
          {
            id: 'niche',
            name: 'Niche',            priceType: 'unit',
            priceRange: { min: 120, max: 250 },
            defaultPrice: 185,
          addonType: 'general',
            },
        ],
      },
      {
        id: 'hardwood',
        name: 'Hardwood',
        basePrice: 6.0,
        basePriceName: 'Base price',
        suggestedAddons: [
          {
            id: 'base_price',
            name: 'Base price',
            priceType: 'sqft',
            priceRange: { min: 6.0 },
            defaultPrice: 6.0,
          addonType: 'service',
            },
          {
            id: 'demo_hardwood',
            name: 'Demo hardwood',            priceType: 'sqft',
            priceRange: { min: 1.5, max: 2.5 },
            defaultPrice: 2.0,
          addonType: 'service',
            },
          {
            id: 'nails_adhesive',
            name: 'Nails/adhesive',            priceType: 'unit',
            priceRange: { min: 20, max: 40 },
            defaultPrice: 30,
          addonType: 'material',
            },
          {
            id: 'wood_filler',
            name: 'Wood filler',            priceType: 'unit',
            priceRange: { min: 15, max: 25 },
            defaultPrice: 20,
          addonType: 'material',
            },
          {
            id: 'cplx_herringbone',
            name: 'Cplx herringbone',            priceType: 'sqft',
            priceRange: { min: 3, max: 6 },
            defaultPrice: 4.5,
          addonType: 'complexity',
            },
          {
            id: 'stairs',
            name: 'Stairs',            priceType: 'step',
            priceRange: { min: 60, max: 120 },
            defaultPrice: 90,
          addonType: 'general',
            },
          {
            id: 'refinish',
            name: 'Refinish',            priceType: 'sqft',
            priceRange: { min: 3, max: 5 },
            defaultPrice: 4,
          addonType: 'service',
            },
        ],
      },
      {
        id: 'others',
        name: 'Others',
        suggestedAddons: [],
      },
    ],
  },
  {
    id: 'bathroom',
    name: 'Bathroom',
    subcategories: [
      {
        id: 'shower_full',
        name: 'Shower – Full',
        basePrice: 50,
        basePriceName: 'Full shower install',
        suggestedAddons: [
          {
            id: 'full_shower_install',
            name: 'Full shower install',            priceType: 'sqft',
            priceRange: { min: 35, max: 65 },
            defaultPrice: 50,
          addonType: 'service',
            },
          {
            id: 'waterproof',
            name: 'Waterproof',            priceType: 'sqft',
            priceRange: { min: 2, max: 4 },
            defaultPrice: 3,
          addonType: 'material',
            },
          {
            id: 'niche',
            name: 'Niche',            priceType: 'unit',
            priceRange: { min: 120, max: 250 },
            defaultPrice: 185,
          addonType: 'general',
            },
          {
            id: 'bench',
            name: 'Bench',            priceType: 'unit',
            priceRange: { min: 150, max: 250 },
            defaultPrice: 200,
          addonType: 'general',
            },
          {
            id: 'linear_drain',
            name: 'Linear drain',            priceType: 'unit',
            priceRange: { min: 180, max: 350 },
            defaultPrice: 265,
          addonType: 'general',
            },
          {
            id: 'shower_floor_tile',
            name: 'Shower floor tile',            priceType: 'sqft',
            priceRange: { min: 8, max: 15 },
            defaultPrice: 11.5,
          addonType: 'general',
            },
        ],
      },
      {
        id: 'shower_walls_only',
        name: 'Shower – Walls Only',
        requiresTileSize: true,
        basePrice: 10,
        basePriceName: 'Base price',
        suggestedAddons: [
          {
            id: 'base_price',
            name: 'Base price',
            priceType: 'sqft',
            priceRange: { min: 8, max: 12 },
            defaultPrice: 10,
          addonType: 'service',
            },
          {
            id: 'demo_tile_walls',
            name: 'Demo tile walls',            priceType: 'sqft',
            priceRange: { min: 1, max: 2 },
            defaultPrice: 1.5,
          addonType: 'service',
            },
          {
            id: 'waterproof',
            name: 'Waterproof',            priceType: 'unit',
            priceRange: { min: 180, max: 350 },
            defaultPrice: 265,
          addonType: 'material',
            },
          {
            id: 'niche',
            name: 'Niche',            priceType: 'unit',
            priceRange: { min: 75, max: 150 },
            defaultPrice: 112.5,
          addonType: 'general',
            },
        ],
      },
      {
        id: 'shower_floor_only',
        name: 'Shower – Floor Only',
        requiresTileSize: true,
        basePrice: 15,
        basePriceName: 'Base price',
        suggestedAddons: [
          {
            id: 'base_price',
            name: 'Base price',
            priceType: 'sqft',
            priceRange: { min: 12, max: 18 },
            defaultPrice: 15,
          addonType: 'service',
            },
          {
            id: 'demo_shower_pan',
            name: 'Demo shower pan',            priceType: 'unit',
            priceRange: { min: 120, max: 250 },
            defaultPrice: 185,
          addonType: 'service',
            },
          {
            id: 'waterproof_floor',
            name: 'Waterproof floor',            priceType: 'unit',
            priceRange: { min: 120, max: 220 },
            defaultPrice: 170,
          addonType: 'material',
            },
          {
            id: 'pan_rebuild',
            name: 'Pan rebuild',            priceType: 'unit',
            priceRange: { min: 150, max: 350 },
            defaultPrice: 250,
          addonType: 'service',
            },
        ],
      },
      {
        id: 'bathroom_floor',
        name: 'Bathroom Floor',
        requiresTileSize: true,
        basePrice: 5.25,
        basePriceName: 'Tile install',
        suggestedAddons: [
          {
            id: 'tile_install',
            name: 'Tile install',            priceType: 'sqft',
            priceRange: { min: 4.5, max: 6 },
            defaultPrice: 5.25,
          addonType: 'service',
            },
          {
            id: 'demo_tile',
            name: 'Demo tile',            priceType: 'sqft',
            priceRange: { min: 1, max: 2 },
            defaultPrice: 1.5,
          addonType: 'service',
            },
          {
            id: 'demo_vinyl_laminate',
            name: 'Demo vinyl/laminate',            priceType: 'sqft',
            priceRange: { min: 0.5 },
            defaultPrice: 0.5,
          addonType: 'service',
            },
          {
            id: 'toilet_remove_install',
            name: 'Toilet remove/install',            priceType: 'unit',
            priceRange: { min: 40, max: 60 },
            defaultPrice: 50,
          addonType: 'service',
            },
          {
            id: 'transitions',
            name: 'Transitions',            priceType: 'unit',
            priceRange: { min: 18, max: 30 },
            defaultPrice: 24,
          addonType: 'material',
            },
        ],
      },
      {
        id: 'tub_surround',
        name: 'Tub Surround',
        requiresTileSize: true,
        basePrice: 8.5,
        basePriceName: 'Tile surround',
        suggestedAddons: [
          {
            id: 'tile_surround',
            name: 'Tile surround',            priceType: 'sqft',
            priceRange: { min: 7, max: 10 },
            defaultPrice: 8.5,
          addonType: 'general',
            },
          {
            id: 'demo_surround',
            name: 'Demo surround',            priceType: 'unit',
            priceRange: { min: 80, max: 150 },
            defaultPrice: 115,
          addonType: 'service',
            },
          {
            id: 'niche',
            name: 'Niche',            priceType: 'unit',
            priceRange: { min: 75, max: 150 },
            defaultPrice: 112.5,
          addonType: 'general',
            },
          {
            id: 'waterproof',
            name: 'Waterproof',            priceType: 'unit',
            priceRange: { min: 180, max: 350 },
            defaultPrice: 265,
          addonType: 'material',
            },
        ],
      },
      {
        id: 'vanity',
        name: 'Vanity',
        suggestedAddons: [
          {
            id: 'install',
            name: 'Install',            priceType: 'unit',
            priceRange: { min: 120, max: 250 },
            defaultPrice: 185,
          addonType: 'service',
            },
          {
            id: 'remove',
            name: 'Remove',            priceType: 'unit',
            priceRange: { min: 40, max: 80 },
            defaultPrice: 60,
          addonType: 'service',
            },
        ],
      },
      {
        id: 'toilet',
        name: 'Toilet',
        suggestedAddons: [
          {
            id: 'install',
            name: 'Install',            priceType: 'unit',
            priceRange: { min: 40, max: 60 },
            defaultPrice: 50,
          addonType: 'service',
            },
          {
            id: 'replace',
            name: 'Replace',            priceType: 'unit',
            priceRange: { min: 80, max: 120 },
            defaultPrice: 100,
          addonType: 'service',
            },
          {
            id: 'remove',
            name: 'Remove',            priceType: 'unit',
            priceRange: { min: 40 },
            defaultPrice: 40,
          addonType: 'service',
            },
        ],
      },
      {
        id: 'bath_demo',
        name: 'Bath Demo',
        suggestedAddons: [
          {
            id: 'tile_floor',
            name: 'Tile floor',            priceType: 'sqft',
            priceRange: { min: 1, max: 2 },
            defaultPrice: 1.5,
          addonType: 'general',
            },
          {
            id: 'tile_walls',
            name: 'Tile walls',            priceType: 'sqft',
            priceRange: { min: 1, max: 2 },
            defaultPrice: 1.5,
          addonType: 'general',
            },
          {
            id: 'complete_shower_demo',
            name: 'Complete shower demo',            priceType: 'unit',
            priceRange: { min: 300, max: 650 },
            defaultPrice: 475,
          addonType: 'service',
            },
        ],
      },
      {
        id: 'others',
        name: 'Others',
        suggestedAddons: [],
      },
    ],
  },
  {
    id: 'kitchen',
    name: 'Kitchen',
    subcategories: [
      {
        id: 'backsplash',
        name: 'Backsplash',
        requiresTileSize: true,
        basePrice: 16,
        basePriceName: 'Install',
        suggestedAddons: [
          {
            id: 'install',
            name: 'Install',            priceType: 'sqft',
            priceRange: { min: 12, max: 20 },
            defaultPrice: 16,
          addonType: 'service',
            },
          {
            id: 'demo',
            name: 'Demo',            priceType: 'sqft',
            priceRange: { min: 2, max: 4 },
            defaultPrice: 3,
          addonType: 'service',
            },
          {
            id: 'grout',
            name: 'Grout',            priceType: 'unit',
            priceRange: { min: 15, max: 25 },
            defaultPrice: 20,
          addonType: 'material',
            },
          {
            id: 'thinset',
            name: 'Thinset',            priceType: 'unit',
            priceRange: { min: 15, max: 25 },
            defaultPrice: 20,
          addonType: 'material',
            },
          {
            id: 'cplx_mosaic',
            name: 'Cplx mosaic',            priceType: 'sqft',
            priceRange: { min: 2, max: 4 },
            defaultPrice: 3,
          addonType: 'complexity',
            },
          {
            id: 'cplx_many_outlets',
            name: 'Cplx many outlets',            priceType: 'sqft',
            priceRange: { min: 1 },
            defaultPrice: 1,
          addonType: 'complexity',
            },
          {
            id: 'cplx_large_format',
            name: 'Cplx large format',            priceType: 'sqft',
            priceRange: { min: 1.5 },
            defaultPrice: 1.5,
          addonType: 'complexity',
            },
        ],
      },
      {
        id: 'kitchen_demo',
        name: 'Kitchen Demo',
        suggestedAddons: [
          {
            id: 'demo_backsplash',
            name: 'Demo backsplash',            priceType: 'sqft',
            priceRange: { min: 2, max: 4 },
            defaultPrice: 3,
          addonType: 'service',
            },
          {
            id: 'demo_tile_floor',
            name: 'Demo tile floor',            priceType: 'sqft',
            priceRange: { min: 1, max: 2 },
            defaultPrice: 1.5,
          addonType: 'service',
            },
          {
            id: 'demo_vinyl_laminate',
            name: 'Demo vinyl/laminate',            priceType: 'sqft',
            priceRange: { min: 0.5 },
            defaultPrice: 0.5,
          addonType: 'service',
            },
          {
            id: 'demo_cabinets',
            name: 'Demo cabinets',            priceType: 'unit',
            priceRange: { min: 20, max: 40 },
            defaultPrice: 30,
          addonType: 'service',
            },
          {
            id: 'demo_countertop',
            name: 'Demo countertop',            priceType: 'unit',
            priceRange: { min: 80, max: 150 },
            defaultPrice: 115,
          addonType: 'service',
            },
          {
            id: 'demo_sink',
            name: 'Demo sink',            priceType: 'unit',
            priceRange: { min: 20, max: 40 },
            defaultPrice: 30,
          addonType: 'service',
            },
          {
            id: 'demo_appliance_disconnect',
            name: 'Demo appliance disconnect',            priceType: 'unit',
            priceRange: { min: 20, max: 40 },
            defaultPrice: 30,
          addonType: 'service',
            },
        ],
      },
      {
        id: 'kitchen_floor',
        name: 'Kitchen Floor',
        basePrice: 5.25,
        basePriceName: 'Tile install',
        suggestedAddons: [
          {
            id: 'tile_install',
            name: 'Tile install',            priceType: 'sqft',
            priceRange: { min: 4.5, max: 6 },
            defaultPrice: 5.25,
          addonType: 'service',
            },
          {
            id: 'vinyl_install',
            name: 'Vinyl install',            priceType: 'sqft',
            priceRange: { min: 2.25 },
            defaultPrice: 2.25,
          addonType: 'service',
            },
          {
            id: 'demo_tile',
            name: 'Demo tile',            priceType: 'sqft',
            priceRange: { min: 1, max: 2 },
            defaultPrice: 1.5,
          addonType: 'service',
            },
          {
            id: 'demo_vinyl',
            name: 'Demo vinyl',            priceType: 'sqft',
            priceRange: { min: 0.5 },
            defaultPrice: 0.5,
          addonType: 'service',
            },
          {
            id: 'move_appliance',
            name: 'Move appliance',            priceType: 'unit',
            priceRange: { min: 20, max: 40 },
            defaultPrice: 30,
          addonType: 'service',
            },
        ],
      },
      {
        id: 'cabinets',
        name: 'Cabinets',
        suggestedAddons: [
          {
            id: 'install',
            name: 'Install',            priceType: 'unit',
            priceRange: { min: 45, max: 65 },
            defaultPrice: 55,
          addonType: 'service',
            },
          {
            id: 'remove',
            name: 'Remove',            priceType: 'unit',
            priceRange: { min: 20, max: 40 },
            defaultPrice: 30,
          addonType: 'service',
            },
          {
            id: 'crown_molding',
            name: 'Crown molding',            priceType: 'ft',
            priceRange: { min: 8, max: 14 },
            defaultPrice: 11,
          addonType: 'general',
            },
        ],
      },
      {
        id: 'sink',
        name: 'Sink',
        suggestedAddons: [
          {
            id: 'install',
            name: 'Install',            priceType: 'unit',
            priceRange: { min: 80, max: 150 },
            defaultPrice: 115,
          addonType: 'service',
            },
          {
            id: 'remove',
            name: 'Remove',            priceType: 'unit',
            priceRange: { min: 20, max: 40 },
            defaultPrice: 30,
          addonType: 'service',
            },
          {
            id: 'faucet_install',
            name: 'Faucet install',            priceType: 'unit',
            priceRange: { min: 40, max: 80 },
            defaultPrice: 60,
          addonType: 'service',
            },
        ],
      },
      {
        id: 'appliances',
        name: 'Appliances',
        suggestedAddons: [
          {
            id: 'fridge',
            name: 'Fridge',            priceType: 'unit',
            priceRange: { min: 40, max: 80 },
            defaultPrice: 60,
          addonType: 'general',
            },
          {
            id: 'stove',
            name: 'Stove',            priceType: 'unit',
            priceRange: { min: 40, max: 80 },
            defaultPrice: 60,
          addonType: 'general',
            },
          {
            id: 'dishwasher',
            name: 'Dishwasher',            priceType: 'unit',
            priceRange: { min: 90, max: 150 },
            defaultPrice: 120,
          addonType: 'general',
            },
          {
            id: 'waterline',
            name: 'Waterline',            priceType: 'unit',
            priceRange: { min: 40, max: 80 },
            defaultPrice: 60,
          addonType: 'general',
            },
        ],
      },
      {
        id: 'others',
        name: 'Others',
        suggestedAddons: [],
      },
    ],
  },
  {
    id: 'exterior',
    name: 'Exterior',
    subcategories: [
      {
        id: 'pavers',
        name: 'Pavers',
        basePrice: 14,
        basePriceName: 'Install',
        suggestedAddons: [
          {
            id: 'install',
            name: 'Install',            priceType: 'sqft',
            priceRange: { min: 10, max: 18 },
            defaultPrice: 14,
          addonType: 'service',
            },
          {
            id: 'remove',
            name: 'Remove',            priceType: 'sqft',
            priceRange: { min: 3, max: 6 },
            defaultPrice: 4.5,
          addonType: 'service',
            },
          {
            id: 'leveling',
            name: 'Leveling',            priceType: 'sqft',
            priceRange: { min: 1.5, max: 3 },
            defaultPrice: 2.25,
          addonType: 'service',
            },
          {
            id: 'slope_correction',
            name: 'Slope correction',            priceType: 'sqft',
            priceRange: { min: 2, max: 3 },
            defaultPrice: 2.5,
          addonType: 'general',
            },
          {
            id: 'edging',
            name: 'Edging',            priceType: 'ft',
            priceRange: { min: 2, max: 4 },
            defaultPrice: 3,
          addonType: 'general',
            },
        ],
      },
      {
        id: 'concrete_repair',
        name: 'Concrete Repair',
        basePrice: 8,
        basePriceName: 'Repair',
        suggestedAddons: [
          {
            id: 'repair',
            name: 'Repair',            priceType: 'sqft',
            priceRange: { min: 6, max: 10 },
            defaultPrice: 8,
          addonType: 'service',
            },
          {
            id: 'remove',
            name: 'Remove',            priceType: 'sqft',
            priceRange: { min: 2, max: 4 },
            defaultPrice: 3,
          addonType: 'service',
            },
          {
            id: 'sealer',
            name: 'Sealer',            priceType: 'sqft',
            priceRange: { min: 0.5, max: 1 },
            defaultPrice: 0.75,
          addonType: 'material',
            },
        ],
      },
      {
        id: 'pressure_wash',
        name: 'Pressure Wash',
        basePrice: 0.325,
        basePriceName: 'Surfaces',
        suggestedAddons: [
          {
            id: 'surfaces',
            name: 'Surfaces',            priceType: 'sqft',
            priceRange: { min: 0.2, max: 0.45 },
            defaultPrice: 0.325,
          addonType: 'general',
            },
        ],
      },
      {
        id: 'handyman',
        name: 'Handyman',
        suggestedAddons: [
          {
            id: 'drywall_patch',
            name: 'Drywall patch',            priceType: 'unit',
            priceRange: { min: 50, max: 250 },
            defaultPrice: 150,
          addonType: 'material',
            },
          {
            id: 'baseboard_repair',
            name: 'Baseboard repair',            priceType: 'ft',
            priceRange: { min: 3, max: 5 },
            defaultPrice: 4,
          addonType: 'service',
            },
        ],
      },
      {
        id: 'fence',
        name: 'Fence',
        suggestedAddons: [
          {
            id: 'wood_fence',
            name: 'Wood fence',            priceType: 'ft',
            priceRange: { min: 18, max: 28 },
            defaultPrice: 23,
          addonType: 'general',
            },
          {
            id: 'vinyl_fence',
            name: 'Vinyl fence',            priceType: 'ft',
            priceRange: { min: 22, max: 35 },
            defaultPrice: 28.5,
          addonType: 'general',
            },
          {
            id: 'fence_removal',
            name: 'Fence removal',            priceType: 'ft',
            priceRange: { min: 6, max: 12 },
            defaultPrice: 9,
          addonType: 'service',
            },
          {
            id: 'small_gate',
            name: 'Small gate',            priceType: 'unit',
            priceRange: { min: 120, max: 250 },
            defaultPrice: 185,
          addonType: 'general',
            },
          {
            id: 'large_gate',
            name: 'Large gate',            priceType: 'unit',
            priceRange: { min: 250, max: 450 },
            defaultPrice: 350,
          addonType: 'general',
            },
        ],
      },
      {
        id: 'sod_install',
        name: 'Sod Install',
        basePrice: 1.4,
        basePriceName: 'Sod + install',
        suggestedAddons: [
          {
            id: 'sod_install',
            name: 'Sod + install',            priceType: 'sqft',
            priceRange: { min: 1, max: 1.8 },
            defaultPrice: 1.4,
          addonType: 'service',
            },
          {
            id: 'remove_grass',
            name: 'Remove grass',            priceType: 'sqft',
            priceRange: { min: 0.4, max: 0.8 },
            defaultPrice: 0.6,
          addonType: 'service',
            },
        ],
      },
      {
        id: 'others',
        name: 'Others',
        suggestedAddons: [],
      },
    ],
  },
  {
    id: 'painting',
    name: 'Painting',
    subcategories: [
      {
        id: 'interior_walls',
        name: 'Interior Walls',
        basePrice: 1.4,
        basePriceName: 'Base price',
        suggestedAddons: [
          {
            id: 'base_price',
            name: 'Base price',
            priceType: 'sqft',
            priceRange: { min: 1, max: 1.8 },
            defaultPrice: 1.4,
          addonType: 'service',
            },
          {
            id: 'many_colors',
            name: 'Many colors',            priceType: 'percent',
            priceRange: { min: 10, max: 20 },
            defaultPrice: 15,
          addonType: 'general',
            },
          {
            id: 'wall_damage_repair',
            name: 'Wall damage repair',            priceType: 'sqft',
            priceRange: { min: 0.2, max: 0.5 },
            defaultPrice: 0.35,
          addonType: 'service',
            },
          {
            id: 'accent_wall',
            name: 'Accent wall',            priceType: 'unit',
            priceRange: { min: 50, max: 150 },
            defaultPrice: 100,
          addonType: 'general',
            },
        ],
      },
      {
        id: 'ceilings',
        name: 'Ceilings',
        basePrice: 1.85,
        basePriceName: 'Base price',
        suggestedAddons: [
          {
            id: 'base_price',
            name: 'Base price',
            priceType: 'sqft',
            priceRange: { min: 1.2, max: 2.5 },
            defaultPrice: 1.85,
          addonType: 'service',
            },
          {
            id: 'high_ceilings',
            name: 'High ceilings',            priceType: 'sqft',
            priceRange: { min: 0.3, max: 0.8 },
            defaultPrice: 0.55,
          addonType: 'general',
            },
          {
            id: 'popcorn',
            name: 'Popcorn',            priceType: 'sqft',
            priceRange: { min: 0.5, max: 1.2 },
            defaultPrice: 0.85,
          addonType: 'general',
            },
        ],
      },
      {
        id: 'trim_baseboard',
        name: 'Trim & Baseboard',
        suggestedAddons: [
          {
            id: 'trim_painting',
            name: 'Trim painting',            priceType: 'ft',
            priceRange: { min: 1, max: 2 },
            defaultPrice: 1.5,
          addonType: 'material',
            },
          {
            id: 'caulking',
            name: 'Caulking',            priceType: 'ft',
            priceRange: { min: 0.2, max: 0.4 },
            defaultPrice: 0.3,
          addonType: 'material',
            },
        ],
      },
      {
        id: 'doors',
        name: 'Doors',
        suggestedAddons: [
          {
            id: 'one_side',
            name: 'One side',            priceType: 'unit',
            priceRange: { min: 35, max: 60 },
            defaultPrice: 47.5,
          addonType: 'general',
            },
          {
            id: 'both_sides',
            name: 'Both sides',            priceType: 'unit',
            priceRange: { min: 55, max: 95 },
            defaultPrice: 75,
          addonType: 'general',
            },
        ],
      },
      {
        id: 'popcorn_removal',
        name: 'Popcorn Removal',
        basePrice: 2.1,
        basePriceName: 'Removal',
        suggestedAddons: [
          {
            id: 'removal',
            name: 'Removal',            priceType: 'sqft',
            priceRange: { min: 1.2, max: 3 },
            defaultPrice: 2.1,
          addonType: 'service',
            },
          {
            id: 'new_texture',
            name: 'New texture',            priceType: 'sqft',
            priceRange: { min: 0.5, max: 1.5 },
            defaultPrice: 1,
          addonType: 'service',
            },
        ],
      },
      {
        id: 'others',
        name: 'Others',
        suggestedAddons: [],
      },
    ],
  },
  {
    id: 'drywall',
    name: 'Drywall',
    subcategories: [
      {
        id: 'patches',
        name: 'Patches',
        suggestedAddons: [
          {
            id: 'small',
            name: 'Small',            priceType: 'unit',
            priceRange: { min: 50, max: 90 },
            defaultPrice: 70,
          addonType: 'general',
            },
          {
            id: 'medium',
            name: 'Medium',            priceType: 'unit',
            priceRange: { min: 80, max: 150 },
            defaultPrice: 115,
          addonType: 'general',
            },
          {
            id: 'large',
            name: 'Large',            priceType: 'unit',
            priceRange: { min: 120, max: 250 },
            defaultPrice: 185,
          addonType: 'general',
            },
          {
            id: 'texture_match',
            name: 'Texture match',            priceType: 'unit',
            priceRange: { min: 20, max: 80 },
            defaultPrice: 50,
          addonType: 'service',
            },
        ],
      },
      {
        id: 'installation',
        name: 'Installation',
        basePrice: 3,
        basePriceName: 'Drywall install',
        suggestedAddons: [
          {
            id: 'drywall_install',
            name: 'Drywall install',            priceType: 'sqft',
            priceRange: { min: 2, max: 4 },
            defaultPrice: 3,
          addonType: 'material',
            },
          {
            id: 'tape_and_mud',
            name: 'Tape and mud',            priceType: 'sqft',
            priceRange: { min: 1, max: 3 },
            defaultPrice: 2,
          addonType: 'material',
            },
          {
            id: 'texture',
            name: 'Texture',            priceType: 'sqft',
            priceRange: { min: 0.5, max: 1.5 },
            defaultPrice: 1,
          addonType: 'service',
            },
          {
            id: 'remove_drywall',
            name: 'Remove drywall',            priceType: 'sqft',
            priceRange: { min: 1, max: 1.8 },
            defaultPrice: 1.4,
          addonType: 'material',
            },
          {
            id: 'insulation',
            name: 'Insulation',            priceType: 'sqft',
            priceRange: { min: 0.8, max: 1.5 },
            defaultPrice: 1.15,
          addonType: 'material',
            },
        ],
      },
      {
        id: 'finish_levels',
        name: 'Finish Levels',
        suggestedAddons: [
          {
            id: 'level_1',
            name: 'Level 1',            priceType: 'sqft',
            priceRange: { min: 0.8, max: 1.2 },
            defaultPrice: 1,
          addonType: 'general',
            },
          {
            id: 'level_2',
            name: 'Level 2',            priceType: 'sqft',
            priceRange: { min: 1, max: 1.5 },
            defaultPrice: 1.25,
          addonType: 'general',
            },
          {
            id: 'level_3',
            name: 'Level 3',            priceType: 'sqft',
            priceRange: { min: 1.5, max: 2.5 },
            defaultPrice: 2,
          addonType: 'general',
            },
          {
            id: 'level_4',
            name: 'Level 4',            priceType: 'sqft',
            priceRange: { min: 2.5, max: 4 },
            defaultPrice: 3.25,
          addonType: 'general',
            },
          {
            id: 'level_5',
            name: 'Level 5',            priceType: 'sqft',
            priceRange: { min: 3.5, max: 5.5 },
            defaultPrice: 4.5,
          addonType: 'general',
            },
        ],
      },
      {
        id: 'ceiling_drywall',
        name: 'Ceiling Drywall',
        suggestedAddons: [
          {
            id: 'ceiling_repair',
            name: 'Ceiling repair',            priceType: 'unit',
            priceRange: { min: 120, max: 350 },
            defaultPrice: 235,
          addonType: 'service',
            },
        ],
      },
      {
        id: 'corner_bead',
        name: 'Corner Bead',
        suggestedAddons: [
          {
            id: 'install',
            name: 'Install',            priceType: 'unit',
            priceRange: { min: 20, max: 45 },
            defaultPrice: 32.5,
          addonType: 'service',
            },
          {
            id: 'repair',
            name: 'Repair',            priceType: 'unit',
            priceRange: { min: 15, max: 30 },
            defaultPrice: 22.5,
          addonType: 'service',
            },
        ],
      },
      {
        id: 'drywall_demo',
        name: 'Drywall Demo',
        suggestedAddons: [
          {
            id: 'remove_drywall',
            name: 'Remove drywall',            priceType: 'sqft',
            priceRange: { min: 1, max: 1.8 },
            defaultPrice: 1.4,
          addonType: 'material',
            },
          {
            id: 'ceiling_demo',
            name: 'Ceiling demo',            priceType: 'percent',
            priceRange: { min: 20, max: 30 },
            defaultPrice: 25,
          addonType: 'service',
            },
        ],
      },
      {
        id: 'others',
        name: 'Others',
        suggestedAddons: [],
      },
    ],
  },
]

export function findCategoryById(id: string): Category | undefined {
  return categories.find((cat) => cat.id === id)
}

export function findSubcategoryById(categoryId: string, subcategoryId: string): Subcategory | undefined {
  const category = findCategoryById(categoryId)
  return category?.subcategories.find((sub) => sub.id === subcategoryId)
}

/**
 * Gera o printName de um suggested addon baseado na relação categoria -> subcategoria -> addon
 * @param category - A categoria do addon
 * @param subcategory - A subcategoria do addon
 * @param addon - O addon sugerido
 * @returns O nome formatado para impressão (ex: "Flooring - Vinyl Plank - Base price")
 */
export function getSuggestedAddonPrintName(
  category: Category,
  subcategory: Subcategory,
  addon: SuggestedAddon
): string {
  return `${category.name} - ${subcategory.name} - ${addon.name}`
}

/**
 * Encontra um suggested addon e retorna seu printName baseado na relação categoria -> subcategoria
 * @param categoryId - ID da categoria
 * @param subcategoryId - ID da subcategoria
 * @param addonId - ID do addon
 * @returns O printName do addon ou null se não encontrado
 */
export function getSuggestedAddonPrintNameById(
  categoryId: string,
  subcategoryId: string,
  addonId: string
): string | null {
  const category = findCategoryById(categoryId)
  if (!category) return null

  const subcategory = category.subcategories.find((sub) => sub.id === subcategoryId)
  if (!subcategory) return null

  const addon = subcategory.suggestedAddons.find((a) => a.id === addonId)
  if (!addon) return null

  return getSuggestedAddonPrintName(category, subcategory, addon)
}
