import { EMITENTE } from '@/lib/empresa'

type Props = {
  /** 'azul' para fundos claros, 'branco' para fundos escuros. */
  variante?: 'azul' | 'branco'
  tamanho?: 'sm' | 'md' | 'lg'
  className?: string
}

const TAMANHOS = {
  sm: { img: 'h-8', marca: 'text-lg', slogan: 'text-[8px]', gap: 'gap-2.5' },
  md: { img: 'h-11', marca: 'text-2xl', slogan: 'text-[9px]', gap: 'gap-3' },
  lg: { img: 'h-14', marca: 'text-3xl', slogan: 'text-[10px]', gap: 'gap-4' },
} as const

/**
 * Marca da ECAJ: logo à esquerda, nome e slogan à direita.
 * Ponto único de alteração do lockup usado em login, navbar e página pública.
 */
export default function Logo({ variante = 'azul', tamanho = 'md', className = '' }: Props) {
  const t = TAMANHOS[tamanho]
  const arquivo = variante === 'branco' ? '/logo-ecaj-branco.png' : '/logo-ecaj.png'
  const corMarca = variante === 'branco' ? 'text-white' : 'text-secondary-900'
  const corSlogan = variante === 'branco' ? 'text-white/70' : 'text-secondary-500'

  return (
    <div className={`flex items-center ${t.gap} ${className}`}>
      <img src={arquivo} alt={`Logo ${EMITENTE.marca}`} className={`${t.img} w-auto shrink-0`} />
      <div className="min-w-0">
        <p className={`${t.marca} ${corMarca} font-bold tracking-tight leading-none`}>
          {EMITENTE.marca}
        </p>
        <p className={`${t.slogan} ${corSlogan} font-semibold uppercase tracking-[0.15em] mt-1`}>
          {EMITENTE.slogan}
        </p>
      </div>
    </div>
  )
}
