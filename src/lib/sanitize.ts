// Anonimización de evidencias antes de subirlas.
// - Imágenes: se re-codifican en un canvas, lo que ELIMINA todo metadato
//   (EXIF, GPS, modelo de dispositivo, fecha) que podría identificar al
//   denunciante.
// - Nombres: se reemplazan por genéricos para no filtrar PII en el nombre
//   del archivo (p. ej. "foto_de_juan.jpg").
//
// Devuelve además `metadataStripped` para que la UI pueda advertir sobre
// formatos no-imagen (video/audio/PDF) que el navegador no puede limpiar.

export type EvidenciaSanitizada = {
  file: File
  nombre: string
  metadataStripped: boolean
}

const ext = (name: string) => {
  const e = name.includes('.') ? name.split('.').pop()! : 'bin'
  return e.toLowerCase().replace(/[^a-z0-9]/g, '') || 'bin'
}

export async function sanitizarEvidencia(
  file: File,
  index: number,
): Promise<EvidenciaSanitizada> {
  const generic = (e: string) => `evidencia-${index + 1}.${e}`

  // Entorno sin DOM (no debería ocurrir: se llama en el navegador).
  if (typeof document === 'undefined' || typeof createImageBitmap === 'undefined') {
    return { file, nombre: generic(ext(file.name)), metadataStripped: false }
  }

  if (file.type.startsWith('image/')) {
    try {
      const bitmap = await createImageBitmap(file)
      const canvas = document.createElement('canvas')
      canvas.width = bitmap.width
      canvas.height = bitmap.height
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('sin contexto 2d')
      ctx.drawImage(bitmap, 0, 0)
      bitmap.close?.()
      const blob: Blob = await new Promise((resolve, reject) =>
        canvas.toBlob(
          (b) => (b ? resolve(b) : reject(new Error('toBlob nulo'))),
          'image/jpeg',
          0.92,
        ),
      )
      const nombre = generic('jpg')
      return {
        file: new File([blob], nombre, { type: 'image/jpeg' }),
        nombre,
        metadataStripped: true,
      }
    } catch {
      // Si no se puede re-codificar, NO subimos el original con EXIF.
      throw new Error('No se pudo anonimizar una de las imágenes. Quítala e intenta de nuevo.')
    }
  }

  // Video/audio/documento: el navegador no puede limpiar metadatos de forma
  // fiable. Se sube con nombre genérico, pero se marca como no anonimizado.
  return { file, nombre: generic(ext(file.name)), metadataStripped: false }
}
