import React from 'react'
import { Link } from 'react-router-dom'
type Media = { kind: string; url: string | null }
type Model = { id: string; model_name: string; beds: number|null; baths: number|null; sqft: number|null; source_brand: string|null; mh_media?: Media[]|null }
export function ModelCard({ m }: { m: Model }) {
  const hero = m.mh_media?.find(x => x.kind === 'image')?.url || ''
  return (
    <Link to={`/models/${m.id}`} className="block card overflow-hidden">
      <div className="aspect-[16/10] bg-gray-100">{hero ? <img src={hero} alt={m.model_name} className="h-full w-full object-cover" loading="lazy"/> : null}</div>
      <div className="card-c space-y-1.5">
        <div className="text-sm text-gray-500">{m.source_brand || 'Model'}</div>
        <div className="font-semibold">{m.model_name}</div>
        <div className="text-sm text-gray-600">{m.beds ?? '—'} bd · {m.baths ?? '—'} ba · {m.sqft ? `${m.sqft.toLocaleString()} sqft` : '—'}</div>
      </div>
    </Link>
  )
}