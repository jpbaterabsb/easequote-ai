import * as React from 'react'
import { cn } from '@/lib/utils'

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          'flex min-h-[100px] w-full rounded-lg border border-gray-200 bg-white/80 backdrop-blur-sm px-4 py-3 text-sm',
          'ring-offset-background',
          'placeholder:text-gray-400 placeholder:font-normal',
          'transition-all duration-200',
          'hover:border-gray-300 hover:bg-white',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary focus-visible:bg-white focus-visible:shadow-md',
          'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50 disabled:border-gray-200',
          'resize-y',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = 'Textarea'

export { Textarea }

