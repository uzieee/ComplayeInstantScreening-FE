import { cn } from '@/utils/cn'

interface LogoProps {
  variant?: 'full' | 'symbol'
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const sizes = { sm: 28, md: 36, lg: 48 }

export function Logo({ variant = 'full', className, size = 'md' }: LogoProps) {
  const s = sizes[size]

  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      {/* Symbol: two nested rounded squares — the Complaye icon */}
      <svg width={s} height={s} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="2" width="44" height="44" rx="10" fill="#E85D26" />
        <rect x="12" y="12" width="24" height="24" rx="5" fill="white" opacity="0.3" />
        <rect x="18" y="18" width="18" height="18" rx="4" fill="white" />
      </svg>

      {variant === 'full' && (
        <div className="flex flex-col leading-none">
          <span
            className="font-bold tracking-tight text-gray-900"
            style={{ fontSize: size === 'lg' ? 22 : size === 'md' ? 18 : 14 }}
          >
            Complaye
          </span>
          <span
            className="font-medium tracking-widest text-brand uppercase"
            style={{ fontSize: size === 'lg' ? 9 : size === 'md' ? 8 : 7 }}
          >
            Instant Screening
          </span>
        </div>
      )}
    </div>
  )
}

export function LogoOnDark({ variant = 'full', className, size = 'md' }: LogoProps) {
  const s = sizes[size]
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <svg width={s} height={s} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="2" width="44" height="44" rx="10" fill="#E85D26" />
        <rect x="12" y="12" width="24" height="24" rx="5" fill="white" opacity="0.3" />
        <rect x="18" y="18" width="18" height="18" rx="4" fill="white" />
      </svg>
      {variant === 'full' && (
        <div className="flex flex-col leading-none">
          <span
            className="font-bold tracking-tight text-white"
            style={{ fontSize: size === 'lg' ? 22 : size === 'md' ? 18 : 14 }}
          >
            Complaye
          </span>
          <span
            className="font-medium tracking-widest text-brand-300 uppercase"
            style={{ fontSize: size === 'lg' ? 9 : size === 'md' ? 8 : 7 }}
          >
            Instant Screening
          </span>
        </div>
      )}
    </div>
  )
}
