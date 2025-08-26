import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { sb } from '../../lib/supabaseClient'
import { ArrowLeft } from 'lucide-react'
type Media = { kind: string; url: string | null; title?: string | null }
type Spec = { key: string | null; value: string | null }
type Model = { id: string; model_name: string; model_code: string|null; build_type: string|null; sections: number|null; beds: number|null; baths: number|null; width_ft: number|null; length_ft: number|null; sqft: number|null; year: number|null; wind_zone: string|null; roof_load: string|null; base_msrp: number|null; description: string|null; source_url: string; source_brand: string|null; mh_media: Media[]|null; mh_specs: Spec[]|null }
export function ModelDetail() {
  const { id } = useParams(); const [row, setRow] = useState<Model|null>(null)
  useEffect(() => {
    let alive = true
    const run = async () => {
      const { data, error } = await sb.from('mh_models').select('*, mh_media(*), mh_specs(*)').eq('id', id).single()
      if (!alive) return
      if (error) { console.error(error); setRow(null) } else { setRow(data as any) }
    }
    if (id) run(); return () => { alive = false }
  }, [id])
  if (!row) return <div className="text-sm text-gray-500">Loading…</div>
  const images = (row.mh_media||[]).filter(m=>m.kind==='image' && m.url)
  const floors = (row.mh_media||[]).filter(m=>(['floorplan','line_drawing','brochure_pdf'].includes(m.kind)) && m.url)
  return (
    <div className="space-y-6">
      <Link to="/" className="btn"><ArrowLeft className="size-4"/> Back</Link>
      <div className="grid lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 card overflow-hidden">
          {images.length ? <img src={images[0].url!} alt={row.model_name} className="w-full h-auto object-cover"/> : <div className="aspect-[16/9] bg-gray-100"/>}
          {images.length>1 && <div className="grid grid-cols-4 gap-2 p-3">{images.slice(1,9).map((m,i)=><img key={i} src={m.url!} className="h-24 w-full object-cover rounded-lg"/>)}</div>}
        </div>
        <div className="card">
          <div className="card-h"><div className="text-xs text-gray-500">{row.source_brand || 'Model'}</div><h1 className="text-xl font-semibold">{row.model_name}</h1>{row.model_code && <div className="text-sm text-gray-600">Code: {row.model_code}</div>}</div>
          <div className="card-c space-y-3 text-sm">
            <div className="text-gray-700">{row.beds ?? '—'} bd · {row.baths ?? '—'} ba · {row.sqft ? `${row.sqft.toLocaleString()} sqft` : '—'}</div>
            <div className="grid grid-cols-2 gap-2 text-gray-600">
              <div>Sections: {row.sections ?? '—'}</div><div>Build: {row.build_type ?? '—'}</div>
              <div>Width: {row.width_ft ? `${row.width_ft} ft` : '—'}</div><div>Length: {row.length_ft ? `${row.length_ft} ft` : '—'}</div>
              <div>Wind Zone: {row.wind_zone ?? '—'}</div><div>Roof Load: {row.roof_load ?? '—'}</div>
              <div>Year: {row.year ?? '—'}</div><div>MSRP: {row.base_msrp != null ? `$${row.base_msrp.toLocaleString()}` : '—'}</div>
            </div>
            {row.description && <p className="text-gray-700 leading-relaxed">{row.description}</p>}
            <a href={row.source_url} target="_blank" className="btn">Open Source Page</a>
          </div>
        </div>
      </div>
      {floors.length ? <div className="card"><div className="card-h font-semibold">Floorplans & PDFs</div><div className="card-c grid md:grid-cols-2 lg:grid-cols-3 gap-3">{floors.map((m,i)=><a key={i} href={m.url!} target="_blank" className="btn truncate">{m.kind.toUpperCase()} — {m.title || 'View'}</a>)}</div></div> : null}
      {(row.mh_specs||[]).length ? <div className="card"><div className="card-h font-semibold">Specs</div><div className="card-c grid md:grid-cols-2 lg:grid-cols-3 gap-2 text-sm">{row.mh_specs!.slice(0,60).map((s,i)=><div key={i} className="flex justify-between gap-3 border-b border-gray-100 py-1"><span className="text-gray-500">{s.key}</span><span className="font-medium">{s.value}</span></div>)}</div></div> : null}
    </div>
  )
}