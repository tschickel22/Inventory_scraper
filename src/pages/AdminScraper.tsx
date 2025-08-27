import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
)

type Job = {
  id: string
  source: string
  limit: number
  concurrency: number
  delay: number
  status: 'queued'|'running'|'success'|'error'
  log: string | null
  created_at: string
  started_at: string | null
  finished_at: string | null
}

export default function AdminScraper() {
  const [form, setForm] = useState({ source: 'cavco', limit: 800, concurrency: 4, delay: 400 })
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(false)
  const disabled = useMemo(() => loading, [loading])

  const load = async () => {
    const { data } = await supabase
      .from('mh_scrape_jobs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)
    setJobs((data as Job[]) ?? [])
  }

  useEffect(() => {
    load()
    const channel = supabase
      .channel('jobs')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'mh_scrape_jobs' },
        () => load()
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  const queue = async () => {
    setLoading(true)
    await supabase.from('mh_scrape_jobs').insert([{ ...form }])
    setLoading(false)
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-semibold">Scraper Admin</h1>

      <div className="grid gap-3 sm:grid-cols-4">
        <label className="flex flex-col gap-1">
          <span className="text-sm text-gray-600">Source</span>
          <select
            className="border rounded px-3 py-2"
            value={form.source}
            onChange={e => setForm({ ...form, source: e.target.value })}
          >
            <option value="cavco">Cavco</option>
            {/* add more when you add plugins */}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm text-gray-600">Limit</span>
          <input className="border rounded px-3 py-2" type="number" value={form.limit}
            onChange={e => setForm({ ...form, limit: Number(e.target.value) })} />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm text-gray-600">Concurrency</span>
          <input className="border rounded px-3 py-2" type="number" value={form.concurrency}
            onChange={e => setForm({ ...form, concurrency: Number(e.target.value) })} />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm text-gray-600">Delay (ms)</span>
          <input className="border rounded px-3 py-2" type="number" value={form.delay}
            onChange={e => setForm({ ...form, delay: Number(e.target.value) })} />
        </label>
      </div>

      <button
        onClick={queue}
        disabled={disabled}
        className="px-4 py-2 rounded bg-black text-white disabled:opacity-50"
      >
        Queue Scrape Job
      </button>

      <div className="border rounded">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-2 text-left">Created</th>
              <th className="p-2">Source</th>
              <th className="p-2">Params</th>
              <th className="p-2">Status</th>
              <th className="p-2 text-left">Log (last 120 chars)</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map(j => (
              <tr key={j.id} className="border-t">
                <td className="p-2">{new Date(j.created_at).toLocaleString()}</td>
                <td className="p-2 text-center">{j.source}</td>
                <td className="p-2 text-center">{j.limit}/{j.concurrency}/{j.delay}ms</td>
                <td className="p-2 text-center">
                  <span className={
                    j.status === 'success' ? 'text-green-600' :
                    j.status === 'error' ? 'text-red-600' :
                    j.status === 'running' ? 'text-blue-600' : 'text-gray-600'
                  }>{j.status}</span>
                </td>
                <td className="p-2 truncate">{j.log?.slice(-120) ?? ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
