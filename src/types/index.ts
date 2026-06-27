export type TipoDelito = 'CORRUPCIÓN' | 'EXTORSIÓN' | 'ABUSO DE AUTORIDAD' | 'OTRO'

export type EstadoDenuncia = 'PENDIENTE' | 'EN_REVISION' | 'PUBLICADA' | 'RECHAZADA'

export type TrackingStepStatus = 'COMPLETADO' | 'EN_PROGRESO' | 'PENDIENTE'

export interface Acusado {
  cedula: string
  cedulaPrefix: 'V' | 'E' | 'J'
  nombres: string
  apellidos: string
  cargo: string
  institucion: string
  estado: string
  municipio?: string
  fotoUrl?: string
  delitos: TipoDelito[]
  denunciasCount: number
  activo: boolean
}

export interface Evidencia {
  tipo: 'IMAGEN' | 'VIDEO' | 'AUDIO' | 'DOCUMENTO'
  thumbnailUrl?: string
  nombre?: string
}

export interface DenunciaPublicada {
  id: string
  fecha: string
  tipo: TipoDelito
  descripcion: string
  evidencias: Evidencia[]
  aiScore: number
  estado: EstadoDenuncia
}

export interface TrackingStep {
  status: TrackingStepStatus
  titulo: string
  descripcion: string
  fecha?: string
  hora?: string
}

export interface TrackingResult {
  id: string
  acusado: {
    nombres: string
    apellidos: string
    cargo: string
    institucion: string
    estado: string
    fotoUrl?: string
  }
  tipo: TipoDelito
  estado: EstadoDenuncia
  aiScore?: number
  timeline: TrackingStep[]
}
