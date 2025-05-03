import * as React from "react"

import { cn } from "@/lib/utils"

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full rounded-md border border-rose-dust/20 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-deep-cocoa/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-warm-coral focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-rose-dust/10 dark:bg-deep-cocoa/90 dark:ring-offset-deep-cocoa dark:placeholder:text-vanilla-cream/50 dark:focus-visible:ring-warm-coral",
        className,
      )}
      ref={ref}
      {...props}
    />
  )
})
Textarea.displayName = "Textarea"

export { Textarea }
