<script setup>
import { Database, Download, ExternalLink, FolderGit2 } from '@lucide/vue'
import { REPOSITORIES } from '../lib/video'

const sourceUrl = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const tables = [
  { name: 'death_causes', label: 'Causas de morte', description: 'Tipos e detalhes dos inimigos.' },
  { name: 'deaths', label: 'Mortes', description: 'Registros, tempos e referências dos clipes.' },
  { name: 'episodes', label: 'Episódios', description: 'Metadados das lives e temporadas.' },
]
const repositories = Object.entries(REPOSITORIES).map(([number, repository]) => ({ number, ...repository, url: `https://codeberg.org/${repository.owner}/${repository.repository}` }))
const archives = [
  { name: 'Coleção completa', file: 'AllDeathsPato7sDS1.zip', description: 'Todas as mortes reunidas e separadas por temporada.', url: 'https://www.mediafire.com/file/p97islxf2z08w82/AllDeathsPato7sDS1.zip/file' },
  { name: 'Espelho dos repositórios', file: 'repo_AllDeathsPato7sDS1.zip', description: 'Mortes organizadas por repositório, temporada e episódio.', url: 'https://www.mediafire.com/file/cgwgjppkgn6rrbb/repo_AllDeathsPato7sDS1.zip/file' },
]
function rawTableUrl(table) {
  if (!sourceUrl || !anonKey) return '#'
  return `${sourceUrl}/rest/v1/${table}?select=*&apikey=${encodeURIComponent(anonKey)}`
}
</script>

<template>
  <section class="source-archive">
    <header class="source-header"><p class="eyebrow">Fonte original</p><h1>Acervo de dados e clipes</h1><p>Abra os dados em JSON bruto ou vá direto à origem dos arquivos. Nada é carregado nesta página.</p></header>
    <section class="source-section dashboard-card"><div class="source-section-heading"><Download :size="20" /><div><h2>Arquivo completo</h2><p>Baixe todos os vídeos em pacotes prontos para guardar localmente.</p></div></div><div class="source-grid"><a v-for="archive in archives" :key="archive.file" class="source-card" :href="archive.url" target="_blank" rel="noreferrer"><span>MediaFire</span><strong>{{ archive.name }}</strong><small>{{ archive.description }}</small><i><Download :size="16" />{{ archive.file }}</i></a></div></section>
    <section class="source-section dashboard-card"><div class="source-section-heading"><Database :size="20" /><div><h2>Dados em JSON</h2><p>Cada link abre a tabela completa no endpoint público.</p></div></div><div class="source-grid"><a v-for="table in tables" :key="table.name" class="source-card" :class="rawTableUrl(table.name) === '#' && 'is-unavailable'" :href="rawTableUrl(table.name)" target="_blank" rel="noreferrer"><span>{{ table.name }}</span><strong>{{ table.label }}</strong><small>{{ table.description }}</small><i><Download :size="16" />Abrir JSON</i></a></div></section>
    <section class="source-section dashboard-card"><div class="source-section-heading"><FolderGit2 :size="20" /><div><h2>Clipes na fonte</h2><p>Repositórios originais no Codeberg, organizados por episódio.</p></div></div><div class="source-grid"><a v-for="repository in repositories" :key="repository.number" class="source-card" :href="repository.url" target="_blank" rel="noreferrer"><span>Repositório {{ repository.number }}</span><strong>{{ repository.owner }}/{{ repository.repository }}</strong><small>Clipes originais e arquivos da temporada.</small><i><ExternalLink :size="16" />Abrir Codeberg</i></a></div></section>
    <p class="source-disclaimer">A divisão e a classificação das mortes podem conter algum erro. Se encontrar algo incorreto, fale comigo para que eu possa ajustar o registro.</p>
  </section>
</template>
