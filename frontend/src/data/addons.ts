export interface AddonOption {
  id: string
  name: string
  children?: AddonOption[]
}

export const addonOptions: AddonOption[] = [
  {
    id: 'floor_type',
    name: 'Floor Type',
    children: [
      {
        id: 'tile',
        name: 'Tile',
      },
      {
        id: 'vinyl',
        name: 'Vinyl',
        children: [
          {
            id: 'vinyl_mat',
            name: 'Mat',
            children: [
              {
                id: 'vinyl_mat_2m_20m',
                name: '2M x 20M',
              },
            ],
          },
          {
            id: 'vinyl_plank',
            name: 'Plank',
            children: [
              {
                id: 'vinyl_plank_122x18',
                name: '122 x 18 cm',
              },
              {
                id: 'vinyl_plank_152x22',
                name: '152 x 22 cm',
              },
            ],
          },
          {
            id: 'vinyl_tile',
            name: 'Tile',
            children: [
              {
                id: 'vinyl_tile_45x45',
                name: '45 x 45 cm',
              },
              {
                id: 'vinyl_tile_60x60',
                name: '60 x 60 cm',
              },
            ],
          },
          {
            id: 'vinyl_click',
            name: 'Click',
            children: [
              {
                id: 'vinyl_click_thickness',
                name: '4-6.5mm thickness',
              },
            ],
          },
          {
            id: 'vinyl_spc',
            name: 'SPC',
          },
        ],
      },
      {
        id: 'wood',
        name: 'Wood',
      },
      {
        id: 'laminate',
        name: 'Laminate',
      },
    ],
  },
  {
    id: 'other',
    name: 'Other',
    children: [
      {
        id: 'demolition',
        name: 'Demolition',
        children: [
          {
            id: 'demolition_light',
            name: 'Light',
          },
          {
            id: 'demolition_medium',
            name: 'Medium',
          },
          {
            id: 'demolition_heavy',
            name: 'Heavy',
          },
        ],
      },
      {
        id: 'niche',
        name: 'Niche',
      },
      {
        id: 'bench',
        name: 'Bench',
      },
      {
        id: 'pattern',
        name: 'Pattern',
        children: [
          {
            id: 'pattern_subway',
            name: 'Subway',
          },
        ],
      },
      {
        id: 'waterproofing',
        name: 'Waterproofing',
      },
      {
        id: 'substrate',
        name: 'Substrate',
        children: [
          {
            id: 'substrate_ok',
            name: 'OK',
          },
        ],
      },
      {
        id: 'custom_niche',
        name: 'Custom Niche',
      },
      {
        id: 'linear_drain',
        name: 'Linear Drain',
      },
    ],
  },
]

export function getAddonPath(option: AddonOption, path: string[] = []): string[] {
  const currentPath = [...path, option.name]
  if (option.children && option.children.length > 0) {
    return currentPath
  }
  return currentPath
}

export function findAddonOption(id: string, options: AddonOption[] = addonOptions): AddonOption | null {
  for (const option of options) {
    if (option.id === id) {
      return option
    }
    if (option.children) {
      const found = findAddonOption(id, option.children)
      if (found) return found
    }
  }
  return null
}

export function getFullAddonName(option: AddonOption, _options: AddonOption[] = addonOptions, path: string[] = []): string {
  const currentPath = [...path, option.name]
  if (option.children && option.children.length > 0) {
    return currentPath.join(' - ')
  }
  return currentPath.join(' - ')
}

