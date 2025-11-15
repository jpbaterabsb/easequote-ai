import { format, formatDistanceToNow, parseISO, type Locale } from 'date-fns'
import { enUS, es, ptBR } from 'date-fns/locale'
import i18n from '@/lib/i18n/config'

// Map i18n language codes to date-fns locales
const localeMap: Record<string, Locale> = {
  en: enUS,
  es: es,
  pt: ptBR,
}

function getCurrentLocale(): Locale {
  // Get the current language from i18n
  // Try to get it directly, or fallback to stored value
  let currentLang = i18n.language || 'en'
  
  // Handle language codes like 'en-US', 'pt-BR', etc.
  if (currentLang.includes('-')) {
    currentLang = currentLang.split('-')[0]
  }
  
  // Normalize language codes
  if (currentLang === 'pt' || currentLang === 'pt-BR') {
    return ptBR
  }
  if (currentLang === 'es' || currentLang === 'es-ES') {
    return es
  }
  
  // Default to English
  return localeMap[currentLang] || enUS
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  const locale = getCurrentLocale()
  return format(dateObj, 'MMM d, yyyy', { locale })
}

export function formatRelativeDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  const locale = getCurrentLocale()
  return formatDistanceToNow(dateObj, { addSuffix: true, locale })
}

export function formatQuoteNumber(quoteNumber: string): string {
  return quoteNumber.toUpperCase()
}

