import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'
import { run as cavcoPlus } from '../plugins/cavco_plus.ts'

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

const registry: Record<string, (opts: any) => Promise<void>> = {
  cavco: cavcoPlus,
}

async function nextJob() {
  const { data, error } = await supabaseAdmin
    .from('mh_scrape_jobs')
    .select('*')
    .eq('status', 'queued')
    .order('created_at', { ascending: true })
    .limit(1)
  if (error) throw error
  return data?.[0] ?? null
}

async function runJob(job: any) {
  const { id, source, limit, concurrency, delay } = job
  await supabaseAdmin.from('mh_scrape_jobs')
    .update({ status: 'running', started_at: new Date().toISOString() })
    .eq('id', id)

  const fn = registry[source]
  if (!fn) {
    await supabaseAdmin.from('mh_scrape_jobs')
      .update({ status: 'error', log: `unknown source: ${source}`, finished_at: new Date().toISOString() })
      .eq('id', id)
    return
  }

  try {
    await fn({ limit, concurrency, delay })
    await supabaseAdmin.from('mh_scrape_jobs')
      .update({ status: 'success', finished_at: new Date().toISOString() })
      .eq('id', id)
  } catch (e: any) {
    await supabaseAdmin.from('mh_scrape_jobs')
      .update({ status: 'error', log: String(e?.message || e), finished_at: new Date().toISOString() })
      .eq('id', id)
  }
}

async function main() {
  console.log('Scrape worker up. Polling every 10s…')
  while (true) {
    try {
      const job = await nextJob()
      if (job) await runJob(job)
    } catch (e) {
      console.error('Worker error:', e)
    }
    await new Promise(r => setTimeout(r, 10_000))
  }
}
main()
