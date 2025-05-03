import type React from "react"
import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("animate-pulse rounded-md bg-soft-peach/50 dark:bg-rose-dust/20", className)} {...props} />
}

export { Skeleton }
