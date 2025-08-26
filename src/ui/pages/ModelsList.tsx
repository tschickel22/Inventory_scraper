import React, { useEffect, useMemo, useState } from 'react'
import { sb } from '../../lib/supabaseClient'
import { ModelCard } from '../components/ModelCard'
import { Search } from 'lucide-react'

type Row = { id: string; model_name: string; beds: number|null; baths: number|null; sqft: number|null; source_brand: string|null; mh_media: {kind:string;url:string|null}[]|null }

export function ModelsList() {
  const [q, setQ] = useState(''); const [page, setPage] = useState(0)
  const [rows, setRows] = useState<Row[]>([]); const [total, setTotal] = useState<number|null>(null)
  const pageSize = 24

  useEffect(() => {
    let alive = true
    const run = async () => {
      const from = page*pageSize, to = from + pageSize - 1
      const { count } = await sb.from('mh_models').select('*',{count:'exact',head:true}).ilike('model_name', q?`%${q}%`:'%')
      if (alive) setTotal(count ?? null)
      const { data, error } = await sb.from('mh_models')
        .select('id, model_name, beds, baths, sqft, source_brand, mh_media ( kind, url )')
        .ilike('model_name', q?`%${q}%`:'%')
        .order('model_name', { ascending: true }).range(from, to)
      if (!alive) return
      if (error) { console.error(error); setRows([]) } else { setRows(data as any) }
    }
    run()
    return () => { alive = false }
  }, [q, page])

  const pages = useMemo(() => total==null?0:Math.ceil(total/pageSize), [total])
  return (
    <div className="space-y-4">
      <div className="card p-2">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <input value={q} onChange={e=>{setPage(0);setQ(e.target.value)}} placeholder="Search model name…" className="w-full rounded-xl border border-gray-300 bg-white px-10 py-2.5 text-sm outline-none focus:ring-2 focus:ring-gray-200"/>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-500"/>
          </div>
          <div className="text-sm text-gray-600 px-2">{total!=null?`${total.toLocaleString()} results`:'—'}</div>
        </div>
      </div>

      {rows.length===0 ? <div className="text-gray-500 text-sm">No results.</div> :
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {rows.map(r => <ModelCard key={r.id} m={r as any}/>)}
        </div>}

      <div className="flex items-center justify-center gap-2 pt-2">
        <button disabled={page===0} onClick={()=>setPage(p=>Math.max(0,p-1))} className="btn disabled:opacity-50">Prev</button>
        <div className="text-sm text-gray-600">Page {page+1}{pages?` of ${pages}`:''}</div>
        <button disabled={pages && page+1>=pages} onClick={()=>setPage(p=>p+1)} className="btn disabled:opacity-50">Next</button>
      </div>
    </div>
  )
}