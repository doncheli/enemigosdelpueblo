import { TipoDelito } from '@/types'

const STYLES: Record<TipoDelito, { bg: string; text: string; border: string }> = {
  'CORRUPCIÓN': {
    bg: 'bg-[#2D1B00]',
    text: 'text-[#FCD34D]',
    border: 'border-[#FCD34D]/20',
  },
  'EXTORSIÓN': {
    bg: 'bg-[#1C0A0A]',
    text: 'text-[#FCA5A5]',
    border: 'border-[#FCA5A5]/20',
  },
  'ABUSO DE AUTORIDAD': {
    bg: 'bg-[#0C1A2E]',
    text: 'text-[#93C5FD]',
    border: 'border-[#93C5FD]/20',
  },
  'OTRO': {
    bg: 'bg-elevated',
    text: 'text-textSecondary',
    border: 'border-borderSubtle/20',
  },
}

interface CrimeBadgeProps {
  tipo: TipoDelito
  size?: 'sm' | 'md'
}

export default function CrimeBadge({ tipo, size = 'md' }: CrimeBadgeProps) {
  const style = STYLES[tipo]
  const sizeClasses = size === 'sm' ? 'px-1.5 py-0.5 text-[9px]' : 'px-2 py-1 text-[10px]'

  return (
    <span
      className={`inline-block ${sizeClasses} ${style.bg} ${style.text} border ${style.border} font-bold tracking-widest rounded-sm uppercase`}
    >
      {tipo}
    </span>
  )
}
