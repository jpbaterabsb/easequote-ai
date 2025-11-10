import * as React from 'react'
import { cn } from '@/lib/utils'

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-11 w-full rounded-lg border border-gray-200 bg-white/80 backdrop-blur-sm px-4 py-2.5 text-sm',
          'ring-offset-background',
          'file:border-0 file:bg-transparent file:text-sm file:font-medium',
          'placeholder:text-gray-400 placeholder:font-normal',
          'transition-all duration-200',
          'hover:border-gray-300 hover:bg-white',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary focus-visible:bg-white focus-visible:shadow-md',
          'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50 disabled:border-gray-200',
          'autofill:bg-white autofill:shadow-[inset_0_0_0px_1000px_white]',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = 'Input'

export { Input }

