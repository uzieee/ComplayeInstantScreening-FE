import { cn } from '@/utils/cn'
import { Loader2 } from 'lucide-react'

export function Spinner({ className, size = 20 }: { className?: string; size?: number }) {
  return <Loader2 size={size} className={cn('animate-spin text-brand', className)} />
}

export function PageSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-3">
        <Spinner size={36} />
        <p className="text-sm text-gray-500">Loading…</p>
      </div>
    </div>
  )
}
