import { cn } from 'scripts/utils/tailwind-helpers'

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('animate-skeleton bg-muted rounded-md', className)} {...props} />
}

export { Skeleton }
