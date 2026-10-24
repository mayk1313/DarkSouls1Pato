// Busca na API do Fandom a miniatura de cada Boss/NPC e grava a URL em death_causes.image_url.
// Não baixa nada: o navegador carrega a imagem direto do Fandom (é assim que funciona no outro projeto).
// Só processa quem ainda está sem imagem, então pode rodar de novo.
import { createClient } from '@supabase/supabase-js'

const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Defina SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY em .env.local')
  process.exit(1)
}

const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
// nome da busca quando difere do nome no banco
const SEARCH = { 'Wheel Skeleton': 'Skeleton Wheel' }
// link direto de imagem para quem a wiki não achar: 'Nome': 'https://...'
const MANUAL = {}

async function thumbnail(name) {
  const qs = new URLSearchParams({
    action: 'query', format: 'json', generator: 'search', gsrsearch: SEARCH[name] ?? name,
    gsrlimit: '1', prop: 'pageimages', pithumbsize: '200',
  })
  const res = await fetch(`https://darksouls.fandom.com/api.php?${qs}`, {
    headers: { 'User-Agent': 'pato7s-site/1.0' },
  })
  if (!res.ok) throw new Error(`api ${res.status}`)
  const page = Object.values((await res.json()).query?.pages ?? {})[0]
  return page?.thumbnail?.source ?? null
}

const { data: rows, error } = await sb
  .from('death_causes')
  .select('id, detail')
  .in('type', ['Boss', 'NPC'])
  .is('image_url', null)
if (error) throw error

for (const row of rows) {
  try {
    const url = MANUAL[row.detail] ?? (await thumbnail(row.detail))
    if (!url) {
      console.log('sem imagem', row.detail)
      continue
    }
    const { error: dbErr } = await sb.from('death_causes').update({ image_url: url }).eq('id', row.id)
    if (dbErr) throw dbErr
    console.log('ok        ', row.detail)
  } catch (e) {
    console.log('falhou    ', row.detail, '-', e.cause?.code ?? e.message)
  }
  await new Promise((r) => setTimeout(r, 300))
}
