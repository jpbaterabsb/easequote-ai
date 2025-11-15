declare module 'react-geocode' {
  export function setKey(apiKey: string): void
  export function fromAddress(address: string): Promise<{
    results: Array<{
      formatted_address: string
      address_components: Array<{
        long_name: string
        short_name: string
        types: string[]
      }>
      geometry: {
        location: {
          lat(): number
          lng(): number
          lat: number
          lng: number
        }
      }
    }>
  }>
}

