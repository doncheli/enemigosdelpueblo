'use client'

import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import Link from 'next/link'
import type { LatLngExpression } from 'leaflet'
import type { PuntoMapa } from '@/lib/data'
import { TipoDelito } from '@/types'

const COLOR: Record<TipoDelito, string> = {
  CORRUPCIÓN: '#FCD34D',
  EXTORSIÓN: '#FCA5A5',
  'ABUSO DE AUTORIDAD': '#93C5FD',
  OTRO: '#94A3B8',
}

// Corredor Caracas — La Guaira
const CENTER: LatLngExpression = [10.55, -66.92]

export default function MapaMatraqueo({ puntos }: { puntos: PuntoMapa[] }) {
  return (
    <MapContainer
      center={CENTER}
      zoom={11}
      scrollWheelZoom={false}
      className="h-[420px] w-full"
      style={{ background: '#080C14' }}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
        subdomains="abcd"
        maxZoom={20}
      />
      {puntos.map((p) => {
        const color = COLOR[p.tipo] ?? COLOR.OTRO
        return (
          <CircleMarker
            key={p.id}
            center={[p.lat, p.lng]}
            radius={9}
            pathOptions={{ color, fillColor: color, fillOpacity: 0.55, weight: 2 }}
          >
            <Popup>
              <div className="min-w-[160px]">
                <span
                  className="inline-block text-[9px] font-bold tracking-widest uppercase mb-1"
                  style={{ color }}
                >
                  {p.tipo}
                </span>
                <p className="font-bold text-sm leading-tight">{p.acusado}</p>
                <p className="font-mono text-[10px] opacity-70 mb-2">{p.codigo}</p>
                {p.cedula && (
                  <Link
                    href={`/acusado/${p.cedula}`}
                    className="text-[11px] font-bold uppercase tracking-wider"
                    style={{ color: '#FCA5A5' }}
                  >
                    Ver ficha →
                  </Link>
                )}
              </div>
            </Popup>
          </CircleMarker>
        )
      })}
    </MapContainer>
  )
}
