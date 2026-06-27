'use client'

import { useState } from 'react'
import { crearReplica } from '@/lib/data'

export default function ReplicaForm({ acusadoId }: { acusadoId: string }) {
  const [open, setOpen] = useState(false)
  const [contenido, setContenido] = useState('')
  const [autor, setAutor] = useState('')
  const [contacto, setContacto] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (contenido.trim().length < 10) {
      setError('La respuesta debe tener al menos 10 caracteres.')
      return
    }
    setSubmitting(true)
    setError(null)
    const res = await crearReplica({
      acusadoId,
      contenido: contenido.trim(),
      autor: autor.trim() || undefined,
      contacto: contacto.trim() || undefined,
    })
    setSubmitting(false)
    if ('error' in res && res.error) {
      setError(res.error)
      return
    }
    setDone(true)
  }

  if (done) {
    return (
      <div className="bg-surface border border-[#4ADE80]/30 p-6 text-center">
        <span className="material-symbols-outlined text-[#4ADE80] text-3xl">check_circle</span>
        <p className="text-textPrimary font-bold mt-2">Réplica enviada</p>
        <p className="text-textSecondary text-sm mt-1">
          Tu respuesta fue recibida y será revisada antes de publicarse junto a esta ficha.
        </p>
      </div>
    )
  }

  const inputClass =
    'w-full bg-elevated border border-borderSubtle text-textPrimary px-4 py-3 rounded focus:ring-1 focus:ring-primary focus:outline-none transition-all text-sm'

  return (
    <div className="bg-surface border border-borderDefault p-6">
      <div className="flex items-start gap-3">
        <span className="material-symbols-outlined text-textSecondary">balance</span>
        <div className="flex-grow">
          <h3 className="text-sm font-bold text-textPrimary uppercase tracking-widest">
            Derecho de réplica
          </h3>
          <p className="text-textSecondary text-sm mt-1">
            ¿Eres la persona señalada o su representante? Puedes responder. Tu réplica será revisada
            y publicada en esta misma ficha.
          </p>
        </div>
      </div>

      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="mt-4 border border-borderSubtle text-textSecondary hover:text-textPrimary hover:border-primary px-6 py-3 text-[10px] font-bold uppercase tracking-widest transition-all"
        >
          Ejercer derecho de réplica
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <textarea
            value={contenido}
            onChange={(e) => setContenido(e.target.value)}
            placeholder="Tu respuesta a los señalamientos…"
            rows={5}
            className={inputClass}
            required
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="text"
              value={autor}
              onChange={(e) => setAutor(e.target.value)}
              placeholder="Nombre o representación (opcional)"
              className={inputClass}
            />
            <input
              type="text"
              value={contacto}
              onChange={(e) => setContacto(e.target.value)}
              placeholder="Contacto para verificación (no se publica)"
              className={inputClass}
            />
          </div>
          {error && <p className="text-primary text-sm">{error}</p>}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="bg-primary text-white font-bold py-3 px-8 tracking-widest uppercase text-sm hover:bg-red-700 active:scale-95 transition-all disabled:opacity-50"
            >
              {submitting ? 'Enviando…' : 'Enviar réplica'}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-textSecondary hover:text-textPrimary px-4 text-sm"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
