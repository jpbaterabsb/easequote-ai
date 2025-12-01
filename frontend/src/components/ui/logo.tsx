import { Link } from 'react-router-dom'
import logoImage from '@/assets/images/logo.png'

interface LogoProps {
  linkTo?: string | null
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeClasses = {
  sm: 'h-8',
  md: 'h-10',
  lg: 'h-12',
}

export function Logo({ linkTo = '/', size = 'md', className = '' }: LogoProps) {
  const logoContent = (
    <img 
      src={logoImage} 
      alt="EaseQuote.AI" 
      className={`${sizeClasses[size]} w-auto ${className}`}
    />
  )

  if (linkTo) {
    return (
      <Link to={linkTo} className="flex items-center">
        {logoContent}
      </Link>
    )
  }

  return <div className="flex items-center">{logoContent}</div>
}

