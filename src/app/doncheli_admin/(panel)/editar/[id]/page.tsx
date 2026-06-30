import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createSupabaseServer } from '@/lib/supabase/server'
import { actualizarDenuncia } from '../../../actions'

export const dynamic = 'force-dynamic'

const TIPOS = ['CORRUPCIÓN', 'EXTORSIÓN', 'ABUSO DE AUTORIDAD', 'OTRO']
const ORIGENES = ['TESTIMONIO', 'REDES_SOCIALES', 'PRENSA', 'REGISTRO_OFICIAL', 'OTRO']

export default async function EditarDenuncia({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createSupabaseServer()

  const { data: user } = await supabase.auth.getUser()
  if (!user.user) redirect('/doncheli_admin/login')

  const { data: d } = await supabase
    .from('denuncias')
    .select(
      'id, codigo, tipo, descripcion, origen, ocurrido_en, lat, lng, acusado_id, acusados(id, nombres, apellidos, cedula, cedula_prefix, cargo, institucion, estado, municipio, foto_url)',
    )
    .eq('id', id)
    .maybeSingle()

  if (!d) notFound()
  const a = Array.isArray(d.acusados) ? d.acusados[0] : d.acusados

  const inputClass =
    'w-full bg-elevated border border-borderSubtle text-textPrimary px-4 py-2.5 rounded focus:ring-1 focus:ring-primary focus:outline-none transition-all text-sm'
  const labelClass = 'block text-[10px] font-bold text-textSecondary uppercase tracking-widest mb-1.5'

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/doncheli_admin" className="text-textSecondary hover:text-textPrimary">
          <span className="material-symbols-outlined">arrow_back</span>
        </Link>
        <div>
          <h1 className="text-lg font-bold text-textPrimary">Editar denuncia</h1>
          <p className="font-mono text-xs text-primary">{d.codigo}</p>
        </div>
      </div>

      <form action={actualizarDenuncia} encType="multipart/form-data" className="space-y-6">
        <input type="hidden" name="denunciaId" value={d.id} />
        <input type="hidden" name="acusadoId" value={d.acusado_id} />

        {/* Imagen principal */}
        <fieldset className="bg-surface border border-borderDefault p-5 space-y-4">
          <legend className="px-2 text-[10px] font-bold uppercase tracking-widest text-textSecondary">
            Imagen principal
          </legend>
          <div className="flex items-start gap-5">
            <div className="w-24 h-32 shrink-0 bg-black border border-borderSubtle overflow-hidden flex items-center justify-center">
              {a?.foto_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={a.foto_url}
                  alt="Foto actual"
                  className="w-full h-full object-cover grayscale contrast-125"
                />
              ) : (
                <span className="material-symbols-outlined text-borderSubtle text-4xl">person</span>
              )}
            </div>
            <div className="flex-grow space-y-3">
              <div>
                <label className={labelClass}>Subir imagen</label>
                <input
                  type="file"
                  name="foto"
                  accept="image/*"
                  className="block w-full text-xs text-textSecondary file:mr-3 file:py-2 file:px-4 file:border-0 file:text-xs file:font-bold file:uppercase file:tracking-widest file:bg-primary file:text-white hover:file:bg-red-700 file:cursor-pointer"
                />
              </div>
              <div>
                <label className={labelClass}>O pegar URL de imagen</label>
                <input
                  name="foto_url"
                  placeholder="https://…"
                  className={inputClass}
                />
              </div>
              {a?.foto_url && (
                <label className="flex items-center gap-2 text-xs text-textSecondary cursor-pointer">
                  <input type="checkbox" name="eliminar_foto" className="accent-primary" />
                  Eliminar imagen actual
                </label>
              )}
            </div>
          </div>
        </fieldset>

        {/* Acusado */}
        <fieldset className="bg-surface border border-borderDefault p-5 space-y-4">
          <legend className="px-2 text-[10px] font-bold uppercase tracking-widest text-textSecondary">
            Acusado
          </legend>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Nombres</label>
              <input name="nombres" defaultValue={a?.nombres ?? ''} required className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Apellidos</label>
              <input name="apellidos" defaultValue={a?.apellidos ?? ''} required className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Prefijo</label>
              <select name="cedula_prefix" defaultValue={a?.cedula_prefix ?? ''} className={inputClass}>
                <option value="">—</option>
                <option value="V">V</option>
                <option value="E">E</option>
                <option value="J">J</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Cédula (opcional)</label>
              <input name="cedula" defaultValue={a?.cedula ?? ''} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Cargo</label>
              <input name="cargo" defaultValue={a?.cargo ?? ''} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Institución</label>
              <input name="institucion" defaultValue={a?.institucion ?? ''} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Estado</label>
              <input name="estado" defaultValue={a?.estado ?? ''} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Municipio</label>
              <input name="municipio" defaultValue={a?.municipio ?? ''} className={inputClass} />
            </div>
          </div>
        </fieldset>

        {/* Denuncia */}
        <fieldset className="bg-surface border border-borderDefault p-5 space-y-4">
          <legend className="px-2 text-[10px] font-bold uppercase tracking-widest text-textSecondary">
            Denuncia
          </legend>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Tipo de delito</label>
              <select name="tipo" defaultValue={d.tipo} className={inputClass}>
                {TIPOS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Origen</label>
              <select name="origen" defaultValue={d.origen} className={inputClass}>
                {ORIGENES.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Fecha del hecho</label>
              <input
                type="date"
                name="ocurrido_en"
                defaultValue={d.ocurrido_en ?? ''}
                className={inputClass}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className={labelClass}>Latitud</label>
                <input name="lat" defaultValue={d.lat ?? ''} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Longitud</label>
                <input name="lng" defaultValue={d.lng ?? ''} className={inputClass} />
              </div>
            </div>
          </div>
          <div>
            <label className={labelClass}>Descripción</label>
            <textarea
              name="descripcion"
              defaultValue={d.descripcion}
              rows={5}
              required
              className={inputClass}
            />
          </div>
        </fieldset>

        <div className="flex gap-3">
          <button
            type="submit"
            className="bg-primary text-white font-bold py-3 px-8 uppercase tracking-widest text-sm hover:bg-red-700 transition-all"
          >
            Guardar cambios
          </button>
          <Link
            href="/doncheli_admin"
            className="py-3 px-6 text-textSecondary hover:text-textPrimary text-sm font-bold"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  )
}
