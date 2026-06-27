'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { TipoDelito } from '@/types'
import { crearDenuncia } from '@/lib/data'
import {
  sha256File,
  acusadoFingerprint,
  denunciaFingerprint,
  isFileKnown,
  isRecordKnown,
  findAcusadoMatch,
  registerRecord,
} from '@/lib/dedup'

const ESTADOS = [
  'Amazonas', 'Anzoátegui', 'Apure', 'Aragua', 'Barinas', 'Bolívar',
  'Carabobo', 'Cojedes', 'Delta Amacuro', 'Dependencias Federales',
  'Distrito Capital', 'Falcón', 'Guárico', 'Lara', 'Mérida', 'Miranda',
  'Monagas', 'Nueva Esparta', 'Portuguesa', 'Sucre', 'Táchira', 'Trujillo',
  'La Guaira', 'Yaracuy', 'Zulia',
]

const TIPOS_DELITO: TipoDelito[] = [
  'CORRUPCIÓN',
  'EXTORSIÓN',
  'ABUSO DE AUTORIDAD',
  'OTRO',
]

const DELITO_STYLE: Record<
  TipoDelito,
  { bg: string; text: string; ring: string }
> = {
  'CORRUPCIÓN': { bg: 'bg-[#2D1B00]', text: 'text-[#FCD34D]', ring: 'ring-[#FCD34D]/50' },
  'EXTORSIÓN': { bg: 'bg-[#1C0A0A]', text: 'text-[#FCA5A5]', ring: 'ring-[#FCA5A5]/50' },
  'ABUSO DE AUTORIDAD': { bg: 'bg-[#0C1A2E]', text: 'text-[#93C5FD]', ring: 'ring-[#93C5FD]/50' },
  'OTRO': { bg: 'bg-elevated', text: 'text-textSecondary', ring: 'ring-borderSubtle/50' },
}

const MOCK_CEDULAS: Record<
  string,
  { nombres: string; apellidos: string; cargo: string; institucion: string; estado: string; municipio: string; denunciasCount: number }
> = {}

interface FilePreview {
  file: File
  previewUrl?: string
  hash: string
}


type StepStatus = 'active' | 'completed' | 'pending'

function StepIndicator({
  number,
  label,
  status,
}: {
  number: number
  label: string
  status: StepStatus
}) {
  return (
    <div className="relative z-10 flex flex-col items-center">
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold mb-2 border-2 transition-all ${
          status === 'completed'
            ? 'bg-[#052E16] border-[#4ADE80] text-[#4ADE80]'
            : status === 'active'
            ? 'bg-primary border-primary text-white'
            : 'bg-surface border-borderDefault text-textSecondary'
        }`}
      >
        {status === 'completed' ? (
          <span className="material-symbols-outlined text-xl">check</span>
        ) : (
          <span className="font-mono">{number}</span>
        )}
      </div>
      <span
        className={`text-[10px] uppercase tracking-widest font-bold ${
          status === 'completed'
            ? 'text-[#4ADE80]'
            : status === 'active'
            ? 'text-primary'
            : 'text-textSecondary'
        }`}
      >
        {label}
      </span>
    </div>
  )
}

export default function DenunciaPage() {
  const [step, setStep] = useState(1)

  // Step 1
  const [cedulaPrefix, setCedulaPrefix] = useState<'V' | 'E' | 'J'>('V')
  const [cedula, setCedula] = useState('')
  const [acusadoFound, setAcusadoFound] = useState<(typeof MOCK_CEDULAS)[string] | null>(null)
  const [nombres, setNombres] = useState('')
  const [apellidos, setApellidos] = useState('')
  const [cargo, setCargo] = useState('')
  const [institucion, setInstitucion] = useState('')
  const [estadoAcusado, setEstadoAcusado] = useState('')
  const [municipio, setMunicipio] = useState('')
  const [anonimo, setAnonimo] = useState(true)

  // Step 2
  const [tipoDelito, setTipoDelito] = useState<TipoDelito | ''>('')
  const [descripcion, setDescripcion] = useState('')
  const [fechaIncidente, setFechaIncidente] = useState('')
  const [lugar, setLugar] = useState('')
  // Coordenadas del HECHO (para el mapa). Se capturan al usar geolocalización
  // o geocodificando la dirección escrita.
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [isLocating, setIsLocating] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)

  // Pide permiso al navegador, obtiene coords y hace reverse-geocode con
  // Nominatim (OpenStreetMap, gratis). Si el geocode falla, cae a coords crudas.
  const handleUseMyLocation = async () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setLocationError('Tu dispositivo no soporta geolocalización.')
      return
    }
    setIsLocating(true)
    setLocationError(null)
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 12000,
          maximumAge: 60000,
        })
      })
      const { latitude, longitude } = position.coords
      setCoords({ lat: latitude, lng: longitude })
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=es&zoom=18`,
          { headers: { 'Accept': 'application/json' } },
        )
        const data = await res.json()
        const address = data?.display_name as string | undefined
        if (address) {
          setLugar(address)
          return
        }
      } catch { /* fall through to raw coords */ }
      setLugar(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`)
    } catch (err) {
      const code = (err as GeolocationPositionError)?.code
      const messages: Record<number, string> = {
        1: 'Permiso denegado. Activá la ubicación en los ajustes del navegador.',
        2: 'No se pudo obtener tu ubicación. Verificá tu señal GPS.',
        3: 'Tardó demasiado. Intentá de nuevo.',
      }
      setLocationError((code && messages[code]) || 'No se pudo obtener tu ubicación.')
    } finally {
      setIsLocating(false)
    }
  }

  // Step 3
  const [files, setFiles] = useState<FilePreview[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Step 4 / success
  const [aceptaTerminos, setAceptaTerminos] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [trackingId, setTrackingId] = useState('')
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => {
    return () => {
      files.forEach((f) => f.previewUrl && URL.revokeObjectURL(f.previewUrl))
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleCedulaBlur = useCallback(() => {
    const raw = cedula.replace(/\./g, '')
    const found = MOCK_CEDULAS[raw] ?? null
    setAcusadoFound(found)
    if (found) {
      setNombres(found.nombres)
      setApellidos(found.apellidos)
      setCargo(found.cargo)
      setInstitucion(found.institucion)
      setEstadoAcusado(found.estado)
      setMunicipio(found.municipio)
    }
  }, [cedula])

  const [fileRejection, setFileRejection] = useState<string | null>(null)

  const addFiles = useCallback(
    async (newFiles: FileList) => {
      const slots = 5 - files.length
      if (slots <= 0) return
      setFileRejection(null)
      const incoming = Array.from(newFiles).slice(0, slots)
      const rejections: string[] = []
      const accepted: FilePreview[] = []

      for (const file of incoming) {
        // 1) hash the file (defensive — degrade to non-deduped accept on failure
        //    so a single corrupt/huge file doesn't block the upload entirely)
        let hash: string
        try {
          hash = await sha256File(file)
        } catch (e) {
          console.warn('hash failed for', file.name, e)
          // Accept anyway, dedup will be skipped for this file.
          accepted.push({
            file,
            previewUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
            hash: `nohash-${Date.now()}-${Math.random().toString(36).slice(2)}`,
          })
          continue
        }

        // 2) dedup vs files ya cargados en este form
        if (files.some((f) => f.hash === hash) || accepted.some((f) => f.hash === hash)) {
          rejections.push(`«${file.name}»: ya está en esta denuncia.`)
          continue
        }

        // 3) dedup vs DB conocida (otras denuncias)
        const known = isFileKnown(hash)
        if (known) {
          rejections.push(
            `«${file.name}»: este archivo ya fue subido en otra denuncia (${new Date(known.uploadedAt).toLocaleDateString()}).`,
          )
          continue
        }

        accepted.push({
          file,
          previewUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
          hash,
        })
      }

      if (rejections.length) setFileRejection(rejections.join(' '))
      if (accepted.length) setFiles((prev) => [...prev, ...accepted])
    },
    [files]
  )

  const removeFile = (index: number) => {
    setFiles((prev) => {
      const removed = prev[index]
      if (removed.previewUrl) URL.revokeObjectURL(removed.previewUrl)
      return prev.filter((_, i) => i !== index)
    })
  }

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      if (e.dataTransfer.files) addFiles(e.dataTransfer.files)
    },
    [addFiles]
  )

  // Detecta acusados ya denunciados a partir de los campos demográficos —
  // funciona aunque no haya cédula. Se recalcula cuando cambia cualquier campo
  // relevante.
  const [acusadoMatch, setAcusadoMatch] = useState<{ displayName: string; denunciasCount: number } | null>(null)
  useEffect(() => {
    let cancelled = false
    const enoughInfo =
      nombres.trim().length > 1 &&
      apellidos.trim().length > 1 &&
      (cedula.trim().length > 0 || estadoAcusado.length > 0)
    if (!enoughInfo) {
      setAcusadoMatch(null)
      return
    }
    acusadoFingerprint({
      cedulaPrefix, cedula, nombres, apellidos, cargo, institucion,
      estado: estadoAcusado, municipio,
    }).then((hash) => {
      if (cancelled) return
      setAcusadoMatch(findAcusadoMatch(hash))
    })
    return () => { cancelled = true }
  }, [cedulaPrefix, cedula, nombres, apellidos, cargo, institucion, estadoAcusado, municipio])

  const [duplicateRecord, setDuplicateRecord] = useState<string | null>(null)

  const handleSubmit = async () => {
    setSubmitting(true)
    setDuplicateRecord(null)

    // 1) Fingerprint del registro completo.
    const recordHash = await denunciaFingerprint({
      cedulaPrefix, cedula, nombres, apellidos, cargo, institucion,
      estado: estadoAcusado, municipio,
      tipoDelito: (tipoDelito ?? '') as string,
      descripcion, fecha: fechaIncidente, lugar,
    })

    // 2) Chequeo duro: si ya existe una denuncia idéntica, abortamos y
    //    mostramos el tracking previo para que el usuario sepa que ya fue
    //    procesada.
    const existing = isRecordKnown(recordHash)
    if (existing) {
      setDuplicateRecord(existing)
      setSubmitting(false)
      return
    }

    // 3) Coordenadas del hecho: usa la geolocalización; si no, geocodifica la
    //    dirección escrita (Nominatim) para que el hecho aparezca en el mapa.
    let finalCoords = coords
    if (!finalCoords && lugar.trim()) {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&limit=1&accept-language=es&q=${encodeURIComponent(
            lugar.trim(),
          )}`,
          { headers: { Accept: 'application/json' } },
        )
        const arr = await res.json()
        if (arr?.[0]) {
          finalCoords = { lat: parseFloat(arr[0].lat), lng: parseFloat(arr[0].lon) }
        }
      } catch {
        /* sin coords: la denuncia se registra igual, solo no aparece en el mapa */
      }
    }

    // 4) Envío real: sube evidencias a Storage y crea la denuncia (PENDIENTE).
    const res = await crearDenuncia({
      acusado: {
        cedulaPrefix,
        cedula: cedula.replace(/\./g, '') || undefined,
        nombres,
        apellidos,
        cargo,
        institucion,
        estado: estadoAcusado,
        municipio,
      },
      tipo: tipoDelito as TipoDelito,
      descripcion,
      ocurridoEn: fechaIncidente || undefined,
      lat: finalCoords?.lat ?? null,
      lng: finalCoords?.lng ?? null,
      files: files.map((f) => ({ file: f.file, hash: f.hash })),
    })

    if ('error' in res) {
      setSubmitError(res.error)
      setSubmitting(false)
      return
    }
    const tracking = res.codigo

    // 4) Registrar localmente para que las próximas denuncias detecten el dup.
    const acusadoHash = await acusadoFingerprint({
      cedulaPrefix, cedula, nombres, apellidos, cargo, institucion,
      estado: estadoAcusado, municipio,
    })
    registerRecord({
      recordHash,
      acusadoHash,
      acusadoDisplayName: `${nombres} ${apellidos}`.trim(),
      fileHashes: files.map((f) => ({ hash: f.hash, name: f.file.name, size: f.file.size })),
      trackingId: tracking,
    })

    setTrackingId(tracking)
    setSubmitting(false)
    setStep(5)
  }

  const stepStatus = (n: number): StepStatus => {
    if (step > n) return 'completed'
    if (step === n) return 'active'
    return 'pending'
  }

  const inputClass =
    'w-full bg-elevated border border-borderSubtle text-textPrimary px-4 py-3 rounded focus:ring-1 focus:ring-primary focus:outline-none transition-all'
  const labelClass = 'block text-xs font-bold text-textSecondary uppercase tracking-widest mb-2'

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow pt-24 pb-12 px-4 flex justify-center items-start">
        <div className="w-full max-w-3xl">
          {/* Success State */}
          {step === 5 && (
            <div className="bg-surface border border-[#4ADE80]/30 p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-[#052E16] border-2 border-[#4ADE80] flex items-center justify-center mx-auto mb-6">
                <span className="material-symbols-outlined text-[#4ADE80] text-3xl">check</span>
              </div>
              <h1 className="text-2xl font-bold text-textPrimary mb-2">Denuncia Registrada</h1>
              <p className="text-textSecondary text-sm mb-8">
                Tu denuncia fue enviada correctamente al sistema de auditoría ciudadana.
              </p>
              <div className="bg-background border border-borderSubtle p-6 mb-8 inline-block">
                <p className="text-[10px] font-bold text-textSecondary uppercase tracking-widest mb-2">
                  Número de Seguimiento
                </p>
                <p className="font-mono text-2xl font-bold text-primary">{trackingId}</p>
              </div>
              <p className="text-xs text-textSecondary mb-8 max-w-sm mx-auto">
                Guarda este número. No lo compartas con el denunciado. Podrás consultar el estado
                de tu denuncia en cualquier momento.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href={`/seguimiento?id=${trackingId}`}
                  className="bg-primary text-white font-bold py-3 px-8 tracking-widest uppercase text-sm hover:bg-red-700 transition-all"
                >
                  Ver seguimiento
                </Link>
                <Link
                  href="/"
                  className="border border-borderSubtle text-textSecondary font-bold py-3 px-8 tracking-widest uppercase text-sm hover:text-textPrimary transition-all"
                >
                  Volver al catálogo
                </Link>
              </div>
            </div>
          )}

          {step < 5 && (
            <div className="bg-surface border border-borderSubtle shadow-2xl rounded-sm overflow-hidden">
              {/* Stepper */}
              <div className="p-6 border-b border-borderDefault">
                <div className="flex items-center justify-between relative">
                  <div className="absolute top-5 left-0 w-full h-0.5 bg-borderDefault z-0" />
                  <StepIndicator number={1} label="Acusado" status={stepStatus(1)} />
                  <StepIndicator number={2} label="Delito" status={stepStatus(2)} />
                  <StepIndicator number={3} label="Evidencias" status={stepStatus(3)} />
                  <StepIndicator number={4} label="Confirmar" status={stepStatus(4)} />
                </div>
              </div>

              {/* ─── STEP 1: Datos del Acusado ─── */}
              {step === 1 && (
                <>
                  <div className="p-8">
                    <div className="mb-8">
                      <h1 className="text-2xl md:text-3xl font-headline font-extrabold text-textPrimary tracking-tight">
                        Datos del Acusado
                      </h1>
                      <p className="text-textSecondary text-sm mt-1">
                        Ingresa la información del funcionario que deseas denunciar.
                      </p>
                    </div>

                    <div className="space-y-6">
                      {/* Cédula */}
                      <div>
                        <label className={labelClass}>
                          Cédula de Identidad{' '}
                          <span className="text-borderSubtle normal-case font-normal">
                            (Opcional)
                          </span>
                        </label>
                        <div className="flex gap-0">
                          <select
                            value={cedulaPrefix}
                            onChange={(e) => setCedulaPrefix(e.target.value as 'V' | 'E' | 'J')}
                            className="bg-elevated border border-borderSubtle border-r-0 text-textPrimary px-4 py-3 rounded-l focus:ring-1 focus:ring-primary focus:outline-none"
                          >
                            <option value="V">V</option>
                            <option value="E">E</option>
                            <option value="J">J</option>
                          </select>
                          <input
                            type="text"
                            inputMode="numeric"
                            value={cedula}
                            onChange={(e) => setCedula(e.target.value)}
                            onBlur={handleCedulaBlur}
                            placeholder="Si la conocés (no es obligatoria)"
                            className="flex-1 bg-elevated border border-borderSubtle text-textPrimary px-4 py-3 font-mono focus:ring-1 focus:ring-primary focus:outline-none rounded-r"
                          />
                        </div>
                        <p className="text-[10px] text-textSecondary/60 mt-2 italic">
                          Si la conocés, ayuda a evitar duplicidad en la base nacional. Si no, podés dejarla en blanco — los datos de nombre, cargo e institución son suficientes.
                        </p>
                      </div>

                      {/* Alert: found */}
                      {acusadoFound && (
                        <div className="bg-[#0C1A2E] border border-[#1E40AF] p-4 flex gap-4 items-start rounded">
                          <div className="bg-[#1E40AF] rounded-full p-1 mt-0.5 flex-shrink-0">
                            <span className="material-symbols-outlined text-white text-base">check</span>
                          </div>
                          <div>
                            <h4 className="text-blue-300 font-bold text-sm">Acusado encontrado</h4>
                            <p className="text-blue-200/80 text-xs">
                              {acusadoFound.nombres} {acusadoFound.apellidos} ya tiene{' '}
                              {acusadoFound.denunciasCount} denuncia
                              {acusadoFound.denunciasCount !== 1 ? 's' : ''} registradas. Confirma o
                              edita sus datos.
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Alert: posible duplicado por demografía (cuando no hay cédula) */}
                      {!acusadoFound && acusadoMatch && (
                        <div className="bg-[#2D1B00] border border-[#D97706] p-4 flex gap-4 items-start rounded">
                          <div className="bg-[#D97706] rounded-full p-1 mt-0.5 flex-shrink-0">
                            <span className="material-symbols-outlined text-white text-base">priority_high</span>
                          </div>
                          <div>
                            <h4 className="text-amber-300 font-bold text-sm">Posible coincidencia</h4>
                            <p className="text-amber-200/80 text-xs">
                              Ya existe un registro con datos similares: <strong>{acusadoMatch.displayName}</strong>{' '}
                              ({acusadoMatch.denunciasCount} denuncia{acusadoMatch.denunciasCount !== 1 ? 's' : ''}).
                              Si es la misma persona, podés continuar y se sumará a su historial.
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Nombres & Apellidos */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className={labelClass}>Nombre(s) *</label>
                          <input
                            type="text"
                            value={nombres}
                            onChange={(e) => setNombres(e.target.value)}
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className={labelClass}>Apellido(s) *</label>
                          <input
                            type="text"
                            value={apellidos}
                            onChange={(e) => setApellidos(e.target.value)}
                            className={inputClass}
                          />
                        </div>
                      </div>

                      {/* Cargo */}
                      <div>
                        <label className={labelClass}>Cargo / Posición</label>
                        <input
                          type="text"
                          value={cargo}
                          onChange={(e) => setCargo(e.target.value)}
                          className={inputClass}
                        />
                      </div>

                      {/* Institución & Estado */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className={labelClass}>Institución</label>
                          <input
                            type="text"
                            value={institucion}
                            onChange={(e) => setInstitucion(e.target.value)}
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className={labelClass}>Estado *</label>
                          <select
                            value={estadoAcusado}
                            onChange={(e) => setEstadoAcusado(e.target.value)}
                            className={inputClass}
                          >
                            <option value="">Seleccionar estado...</option>
                            {ESTADOS.map((e) => (
                              <option key={e} value={e}>
                                {e}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Municipio */}
                      <div>
                        <label className={labelClass}>
                          Municipio{' '}
                          <span className="text-borderSubtle normal-case font-normal">
                            (Opcional)
                          </span>
                        </label>
                        <input
                          type="text"
                          value={municipio}
                          onChange={(e) => setMunicipio(e.target.value)}
                          className={inputClass}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="bg-elevated/50 p-6 flex flex-col md:flex-row justify-between items-center gap-4 border-t border-borderDefault">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={anonimo}
                        onChange={(e) => setAnonimo(e.target.checked)}
                        className="h-5 w-5 bg-surface border-borderSubtle rounded text-primary focus:ring-0 accent-primary"
                      />
                      <span className="text-sm text-textSecondary group-hover:text-textPrimary transition-colors">
                        Deseo denunciar de forma anónima{' '}
                        <span className="text-xs opacity-60">(no se solicitará mi email)</span>
                      </span>
                    </label>
                    <div className="flex items-center gap-3 w-full md:w-auto">
                      <Link
                        href="/"
                        className="flex-1 md:flex-none px-6 py-3 text-sm font-bold text-textPrimary border border-borderSubtle hover:bg-elevated transition-colors rounded text-center"
                      >
                        Cancelar
                      </Link>
                      <button
                        onClick={() => setStep(2)}
                        disabled={!nombres || !apellidos || !estadoAcusado}
                        className="flex-1 md:flex-none px-6 py-3 text-sm font-bold bg-primary text-white hover:bg-red-700 active:scale-95 transition-all rounded flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        Continuar{' '}
                        <span className="material-symbols-outlined text-sm">arrow_forward</span>
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* ─── STEP 2: Tipo de Delito ─── */}
              {step === 2 && (
                <>
                  <div className="p-8">
                    <div className="mb-8">
                      <h1 className="text-2xl md:text-3xl font-headline font-extrabold text-textPrimary tracking-tight">
                        Tipo de Delito
                      </h1>
                      <p className="text-textSecondary text-sm mt-1">
                        Selecciona la categoría que mejor describe la conducta denunciada.
                      </p>
                    </div>

                    <div className="space-y-6">
                      {/* Crime type pills */}
                      <div>
                        <label className={labelClass}>Categoría del Delito *</label>
                        <div className="grid grid-cols-2 gap-3">
                          {TIPOS_DELITO.map((tipo) => {
                            const style = DELITO_STYLE[tipo]
                            const isActive = tipoDelito === tipo
                            const hasSelection = tipoDelito !== ''
                            // Visual states:
                            // - active:                full color + bright ring
                            // - inactive when none picked: muted (so CORRUPCIÓN's
                            //   vivid base doesn't read as preselected)
                            // - inactive when sibling picked: dimmed
                            const stateClasses = isActive
                              ? `${style.bg} ${style.text} ring-2 ${style.ring}`
                              : hasSelection
                              ? `${style.bg} ${style.text} opacity-40 hover:opacity-80`
                              : 'bg-elevated text-textSecondary border-borderSubtle hover:bg-elevated/60'
                            return (
                              <button
                                key={tipo}
                                type="button"
                                onClick={() => setTipoDelito(tipo)}
                                aria-pressed={isActive}
                                className={`${stateClasses} border p-4 text-left font-bold text-sm tracking-widest uppercase transition-all`}
                              >
                                <span className="material-symbols-outlined text-xl block mb-2">
                                  {tipo === 'CORRUPCIÓN'
                                    ? 'payments'
                                    : tipo === 'EXTORSIÓN'
                                    ? 'warning'
                                    : tipo === 'ABUSO DE AUTORIDAD'
                                    ? 'gavel'
                                    : 'more_horiz'}
                                </span>
                                {tipo}
                              </button>
                            )
                          })}
                        </div>
                        {!tipoDelito && (
                          <p className="text-[10px] text-textSecondary/70 mt-2 italic">
                            Tocá una de las categorías para continuar.
                          </p>
                        )}
                      </div>

                      {/* Descripción */}
                      <div>
                        <label className={labelClass}>Descripción del Incidente *</label>
                        <textarea
                          value={descripcion}
                          onChange={(e) => setDescripcion(e.target.value)}
                          rows={5}
                          placeholder="Describe los hechos con el mayor detalle posible: fechas, lugares, testigos, montos exigidos..."
                          className={`${inputClass} resize-none`}
                        />
                        <p className="text-[10px] text-textSecondary/60 mt-2">
                          Mínimo 20 caracteres. Actual: {descripcion.length}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className={labelClass}>Fecha Aproximada</label>
                          <input
                            type="date"
                            value={fechaIncidente}
                            onChange={(e) => setFechaIncidente(e.target.value)}
                            className={`${inputClass} font-mono`}
                          />
                        </div>
                        <div>
                          <label className={labelClass}>
                            Lugar{' '}
                            <span className="text-borderSubtle normal-case font-normal">
                              (Opcional)
                            </span>
                          </label>
                          <input
                            type="text"
                            value={lugar}
                            onChange={(e) => {
                              setLugar(e.target.value)
                              // dirección editada a mano: descartar coords del GPS
                              setCoords(null)
                            }}
                            placeholder="Ej: Comando Policial, Av. Principal..."
                            className={inputClass}
                          />
                          <button
                            type="button"
                            onClick={handleUseMyLocation}
                            disabled={isLocating}
                            className="mt-2 inline-flex items-center gap-2 px-3 py-2 text-xs uppercase tracking-wider font-bold border border-primary/60 text-primary hover:bg-primary hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                          >
                            {isLocating ? (
                              <>
                                <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
                                  <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                                </svg>
                                Obteniendo ubicación…
                              </>
                            ) : (
                              <>
                                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                                  <circle cx="12" cy="10" r="3" />
                                </svg>
                                Usar mi ubicación actual
                              </>
                            )}
                          </button>
                          {locationError && (
                            <p className="mt-1 text-xs text-[#FCA5A5]">{locationError}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-elevated/50 p-6 flex flex-col gap-2 border-t border-borderDefault">
                    {(!tipoDelito || descripcion.length < 20) && (
                      <p className="text-xs text-[#FCA5A5]/80 text-center md:text-right">
                        {!tipoDelito && descripcion.length < 20
                          ? 'Falta elegir la categoría y completar la descripción (mín. 20 caracteres).'
                          : !tipoDelito
                          ? 'Falta elegir la categoría del delito.'
                          : `Faltan ${20 - descripcion.length} caracteres en la descripción.`}
                      </p>
                    )}
                    <div className="flex justify-between items-center gap-4">
                    <button
                      onClick={() => setStep(1)}
                      className="px-8 py-3 border border-primary text-primary font-bold uppercase tracking-widest text-sm hover:bg-primary hover:text-white transition-all flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-sm">arrow_back</span> Volver
                    </button>
                    <button
                      onClick={() => setStep(3)}
                      disabled={!tipoDelito || descripcion.length < 20}
                      className="px-12 py-3 bg-primary text-white font-bold uppercase tracking-widest text-sm hover:bg-red-700 transition-all flex items-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Continuar{' '}
                      <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </button>
                    </div>
                  </div>
                </>
              )}

              {/* ─── STEP 3: Evidencias ─── */}
              {step === 3 && (
                <>
                  <div className="p-6 md:p-8">
                    <h1 className="text-2xl md:text-3xl font-bold text-textPrimary mb-2 tracking-tight">
                      Evidencias Multimedia
                    </h1>
                    <p className="text-textSecondary mb-4">
                      Sube al menos 1 foto o video que respalde tu denuncia. Máximo 5 archivos.
                    </p>

                    <div className="flex items-start gap-3 bg-[#052E16]/40 border border-[#4ADE80]/30 p-4 rounded mb-8">
                      <span className="material-symbols-outlined text-[#4ADE80] text-base mt-0.5">
                        shield_lock
                      </span>
                      <p className="text-[#4ADE80]/90 text-xs leading-relaxed">
                        <strong>Anonimato garantizado.</strong> No guardamos ningún dato tuyo. A las
                        fotos se les eliminan los metadatos (ubicación GPS, dispositivo) antes de
                        subirlas y se renombran. En videos y audios esa limpieza no es posible: evita
                        subir archivos que puedan identificarte.
                      </p>
                    </div>

                    {/* Drop Zone */}
                    <div
                      className="relative group cursor-pointer"
                      onDragOver={(e) => {
                        e.preventDefault()
                        setIsDragging(true)
                      }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <div
                        className={`bg-elevated rounded-lg p-12 flex flex-col items-center justify-center text-center transition-all custom-dashed ${
                          isDragging ? 'border-2 border-primary bg-primary/5' : 'border-2 border-transparent'
                        }`}
                      >
                        <div className="w-16 h-16 rounded-full bg-background flex items-center justify-center mb-4 border border-borderSubtle">
                          <span className="material-symbols-outlined text-3xl text-primary">
                            cloud_upload
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-textPrimary">
                          Arrastra tus archivos aquí
                        </h3>
                        <p className="text-textSecondary mb-4">o haz clic para seleccionar</p>
                        <div className="text-[10px] font-mono text-textSecondary bg-background px-3 py-1 rounded border border-borderSubtle">
                          JPG, PNG, WEBP (MÁX 10MB) · MP4, MOV, AVI (MÁX 100MB)
                        </div>
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*,video/*"
                        multiple
                        className="hidden"
                        onChange={(e) => e.target.files && addFiles(e.target.files)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>

                    {fileRejection && (
                      <div className="mt-4 bg-[#1C0A0A] border border-[#7F1D1D] p-3 text-xs text-red-200/90 rounded">
                        <strong className="text-red-300">Archivo duplicado:</strong> {fileRejection}
                      </div>
                    )}

                    {/* File Previews */}
                    {files.length > 0 && (
                      <div className="mt-10">
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="text-sm font-bold uppercase tracking-widest text-textSecondary">
                            Archivos seleccionados ({files.length} de 5)
                          </h4>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                          {files.map((fp, i) => (
                            <div
                              key={i}
                              className="relative group aspect-[3/4] bg-background border border-borderSubtle rounded p-2 flex flex-col"
                            >
                              <div className="flex-grow bg-elevated rounded-sm mb-2 overflow-hidden relative">
                                {fp.previewUrl ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    src={fp.previewUrl}
                                    alt={fp.file.name}
                                    className="w-full h-full object-cover opacity-70"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <span className="material-symbols-outlined text-3xl text-borderSubtle">
                                      video_file
                                    </span>
                                  </div>
                                )}
                                <button
                                  onClick={() => removeFile(i)}
                                  className="absolute top-1 right-1 bg-primary text-white p-1 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <span className="material-symbols-outlined text-sm">close</span>
                                </button>
                              </div>
                              <div className="text-[10px] font-mono truncate text-textPrimary">
                                {fp.file.name}
                              </div>
                              <div className="text-[10px] font-mono text-textSecondary">
                                {(fp.file.size / 1024 / 1024).toFixed(1)} MB
                              </div>
                            </div>
                          ))}
                          {files.length < 5 && (
                            <button
                              onClick={() => fileInputRef.current?.click()}
                              className="aspect-[3/4] border-2 border-dashed border-borderSubtle rounded flex flex-col items-center justify-center hover:bg-elevated/30 transition-colors"
                            >
                              <span className="material-symbols-outlined text-2xl text-borderSubtle">
                                add
                              </span>
                              <span className="text-[10px] font-bold uppercase tracking-tighter text-borderSubtle mt-1">
                                Añadir
                              </span>
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Warnings */}
                    <div className="mt-8 space-y-4">
                      <div className="flex items-center gap-3 p-3 bg-background border-l-2 border-primary">
                        <span className="material-symbols-outlined text-primary flex-shrink-0">
                          lock
                        </span>
                        <p className="text-xs text-textSecondary">
                          Los metadatos EXIF (GPS, cámara) son eliminados automáticamente antes de
                          almacenar las evidencias.
                        </p>
                      </div>
                      {files.length === 0 && (
                        <div className="flex items-center gap-3 p-3 bg-[#2D1B00] border border-[#FCD34D]/30 rounded">
                          <span className="material-symbols-outlined text-[#FCD34D] flex-shrink-0">
                            warning
                          </span>
                          <p className="text-xs font-bold text-[#FCD34D]">
                            Al menos 1 archivo requerido para continuar.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-elevated/30 px-6 py-6 flex flex-col md:flex-row justify-between items-center gap-4 border-t border-borderDefault">
                    <button
                      onClick={() => setStep(2)}
                      className="w-full md:w-auto px-8 py-3 border border-primary text-primary font-bold uppercase tracking-widest text-sm hover:bg-primary hover:text-white transition-all flex items-center justify-center gap-2"
                    >
                      <span className="material-symbols-outlined text-sm">arrow_back</span> Volver
                    </button>
                    <button
                      onClick={() => setStep(4)}
                      disabled={files.length === 0}
                      className="w-full md:w-auto px-12 py-3 bg-primary text-white font-bold uppercase tracking-widest text-sm hover:bg-red-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Continuar{' '}
                      <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </button>
                  </div>
                </>
              )}

              {/* ─── STEP 4: Confirmar ─── */}
              {step === 4 && (
                <>
                  <div className="p-8">
                    <div className="mb-8">
                      <h1 className="text-2xl md:text-3xl font-headline font-extrabold text-textPrimary tracking-tight">
                        Confirmar Denuncia
                      </h1>
                      <p className="text-textSecondary text-sm mt-1">
                        Revisa los datos antes de enviar. Una vez enviada, tu denuncia será
                        procesada por el sistema de auditoría.
                      </p>
                    </div>

                    <div className="space-y-4">
                      {/* Summary: Acusado */}
                      <div className="bg-background border border-borderDefault p-4">
                        <p className="text-[10px] font-bold text-textSecondary uppercase tracking-widest mb-3">
                          Acusado
                        </p>
                        <p className="font-bold text-textPrimary">
                          {nombres} {apellidos}
                        </p>
                        <p className="text-sm text-textSecondary">{cargo} — {institucion}</p>
                        <p className="text-sm text-textSecondary">
                          {estadoAcusado}
                          {municipio ? `, ${municipio}` : ''}
                        </p>
                        <p className="font-mono text-xs text-primary mt-1">
                          {cedulaPrefix}-{cedula}
                        </p>
                      </div>

                      {/* Summary: Delito */}
                      <div className="bg-background border border-borderDefault p-4">
                        <p className="text-[10px] font-bold text-textSecondary uppercase tracking-widest mb-3">
                          Delito
                        </p>
                        {tipoDelito && (
                          <span className="inline-block px-2 py-0.5 bg-[#2D1B00] text-[#FCD34D] text-[10px] font-bold tracking-widest uppercase border border-[#FCD34D]/20 mb-2">
                            {tipoDelito}
                          </span>
                        )}
                        <p className="text-sm text-textPrimary leading-relaxed">{descripcion}</p>
                        {fechaIncidente && (
                          <p className="font-mono text-xs text-textSecondary mt-2">
                            {fechaIncidente}
                            {lugar ? ` · ${lugar}` : ''}
                          </p>
                        )}
                      </div>

                      {/* Summary: Evidencias */}
                      <div className="bg-background border border-borderDefault p-4">
                        <p className="text-[10px] font-bold text-textSecondary uppercase tracking-widest mb-3">
                          Evidencias ({files.length} archivo{files.length !== 1 ? 's' : ''})
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {files.map((fp, i) => (
                            <span
                              key={i}
                              className="font-mono text-[10px] bg-elevated border border-borderSubtle px-2 py-1 text-textSecondary"
                            >
                              {fp.file.name}
                            </span>
                          ))}
                        </div>
                      </div>

                      {anonimo && (
                        <div className="flex items-center gap-2 text-xs text-textSecondary">
                          <span className="material-symbols-outlined text-sm text-[#4ADE80]">
                            visibility_off
                          </span>
                          Esta denuncia será enviada de forma anónima.
                        </div>
                      )}

                      {/* Terms */}
                      <label className="flex items-start gap-3 cursor-pointer group pt-2">
                        <input
                          type="checkbox"
                          checked={aceptaTerminos}
                          onChange={(e) => setAceptaTerminos(e.target.checked)}
                          className="mt-0.5 h-5 w-5 bg-surface border-borderSubtle rounded text-primary focus:ring-0 accent-primary flex-shrink-0"
                        />
                        <span className="text-xs text-textSecondary group-hover:text-textPrimary transition-colors leading-relaxed">
                          Declaro que la información proporcionada es verídica según mi conocimiento.
                          Entiendo que denuncias falsas pueden tener consecuencias legales.
                        </span>
                      </label>
                    </div>
                  </div>

                  {duplicateRecord && (
                    <div className="mx-6 mb-6 bg-[#1C0A0A] border border-[#7F1D1D] p-4 rounded">
                      <h4 className="text-red-300 font-bold text-sm mb-1">Denuncia duplicada</h4>
                      <p className="text-red-200/80 text-xs">
                        Una denuncia con estos mismos datos ya fue registrada con código{' '}
                        <strong className="font-mono">{duplicateRecord}</strong>. No se envió de nuevo.
                        Si querés agregar información, abrí el seguimiento de esa denuncia.
                      </p>
                    </div>
                  )}

                  {submitError && (
                    <div className="mx-6 mb-6 bg-[#1C0A0A] border border-[#7F1D1D] p-4 rounded">
                      <h4 className="text-red-300 font-bold text-sm mb-1">No se pudo enviar</h4>
                      <p className="text-red-200/80 text-xs">{submitError}</p>
                    </div>
                  )}

                  <div className="bg-elevated/50 p-6 flex flex-col md:flex-row justify-between items-center gap-4 border-t border-borderDefault">
                    <button
                      onClick={() => setStep(3)}
                      className="w-full md:w-auto px-8 py-3 border border-primary text-primary font-bold uppercase tracking-widest text-sm hover:bg-primary hover:text-white transition-all flex items-center justify-center gap-2"
                    >
                      <span className="material-symbols-outlined text-sm">arrow_back</span> Volver
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={!aceptaTerminos || submitting || !!duplicateRecord}
                      className="w-full md:w-auto px-12 py-3 bg-primary text-white font-bold uppercase tracking-widest text-sm hover:bg-red-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {submitting ? (
                        <>
                          <span className="material-symbols-outlined text-sm loading-spinner">
                            autorenew
                          </span>
                          Enviando...
                        </>
                      ) : (
                        <>
                          Enviar Denuncia{' '}
                          <span className="material-symbols-outlined text-sm">send</span>
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Security note */}
          {step < 5 && (
            <div className="mt-8 flex items-center justify-center gap-2 text-textSecondary text-[11px] uppercase tracking-[0.2em] opacity-50 font-label">
              <span className="material-symbols-outlined text-sm">security</span>
              Toda información será verificada mediante procesos de auditoría ciudadana
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
