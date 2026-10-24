<script setup>
import { useData } from './composables/useData'
import StatsPanel from './components/StatsPanel.vue'
import EnemyBrowser from './components/EnemyBrowser.vue'
import DeathDetail from './components/DeathDetail.vue'
import ShortVideoFeed from './components/ShortVideoFeed.vue'
import ClipPicker from './components/ClipPicker.vue'
import SavedVideoCatalog from './components/SavedVideoCatalog.vue'
import EpisodeBrowser from './components/EpisodeBrowser.vue'
import EpisodeDetail from './components/EpisodeDetail.vue'
import SourceArchive from './components/SourceArchive.vue'
import { originalVideoTitle } from './lib/video'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { Bookmark, Clapperboard, Database, LayoutDashboard, ListVideo, Menu, Moon, RotateCw, Skull, Sun, X } from '@lucide/vue'

const { enemies, stats, deathsByCause, deathRecords, episodes, loading, error, reload } = useData()
const VIEWS = ['overview', 'bestiary', 'detail', 'clips', 'picker', 'saved', 'sources', 'episodes', 'episode']
const SAVED_VIDEOS_KEY = 'pato7s:saved-video-ids'
function readSavedVideoIds() {
  try {
    const saved = JSON.parse(localStorage.getItem(SAVED_VIDEOS_KEY) ?? '[]')
    return Array.isArray(saved) ? saved.map(Number).filter(Number.isFinite) : []
  } catch { return [] }
}
function persistSavedVideoIds(ids) {
  try { localStorage.setItem(SAVED_VIDEOS_KEY, JSON.stringify(ids)) } catch { /* armazenamento indisponível não impede a navegação */ }
}
function routeFromUrl() {
  const query = new URLSearchParams(window.location.search)
  return {
    view: VIEWS.includes(query.get('view')) ? query.get('view') : 'overview',
    deathId: Number(query.get('death')) || undefined,
    causeId: Number(query.get('cause')) || undefined,
    episodeId: query.get('episode') || undefined,
  }
}
const initialRoute = routeFromUrl()
const view = ref(initialRoute.view)
const routeDeathId = ref(initialRoute.deathId)
const routeCauseId = ref(initialRoute.causeId)
const routeEpisodeId = ref(initialRoute.episodeId)
const selectedCause = ref(null)
const selectedEpisode = ref(null)
const episodeTitles = ref(new Map())
const compactMenuOpen = ref(false)
const changingView = ref(false)
const toastMessage = ref('')
const savedDeathIds = ref(readSavedVideoIds())
const savedDeaths = computed(() => deathRecords.value.filter((death) => savedDeathIds.value.includes(Number(death.id))))
const spotlightEnemy = computed(() => [...enemies.value].sort((a, b) => b.deaths - a.deaths)[0] ?? null)
const colorMode = ref('dark')
const sidebarCollapsed = ref(false)
let navigationTimer
let toastTimer
function setRoute(nextView, { deathId, causeId, episodeId } = {}, mode = 'push') {
  const url = new URL(window.location.href)
  url.search = ''
  if (nextView !== 'overview') url.searchParams.set('view', nextView)
  if (deathId) url.searchParams.set('death', deathId)
  if (causeId) url.searchParams.set('cause', causeId)
  if (episodeId) url.searchParams.set('episode', episodeId)
  history[mode === 'replace' ? 'replaceState' : 'pushState']({}, '', url)
  view.value = nextView
  routeDeathId.value = deathId
  routeCauseId.value = causeId
  routeEpisodeId.value = episodeId
}
function openCause(cause) {
  changeView(() => {
    selectedCause.value = cause
    setRoute('detail', { causeId: cause.id })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  })
}
function show(viewName) {
  compactMenuOpen.value = false
  if (view.value === viewName) return
  changeView(() => {
    setRoute(viewName)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  })
}
function openEpisode(episode) {
  changeView(() => {
    selectedEpisode.value = episode
    setRoute('episode', { episodeId: episode.id })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  })
}
function changeView(callback) {
  window.clearTimeout(navigationTimer)
  changingView.value = true
  navigationTimer = window.setTimeout(() => {
    callback()
    changingView.value = false
  }, 650)
}
function showToast(message) {
  window.clearTimeout(toastTimer)
  toastMessage.value = message
  toastTimer = window.setTimeout(() => { toastMessage.value = '' }, 2200)
}
function toggleSavedVideo(death) {
  const id = Number(death?.id)
  if (!Number.isFinite(id)) return
  const alreadySaved = savedDeathIds.value.includes(id)
  savedDeathIds.value = alreadySaved ? savedDeathIds.value.filter((savedId) => savedId !== id) : [...savedDeathIds.value, id]
  if (alreadySaved && view.value === 'saved' && routeDeathId.value === id) setRoute('saved', {}, 'replace')
  showToast(alreadySaved ? 'Removido dos salvos.' : 'Vídeo salvo!')
}
function openSavedVideo(death) {
  if (!death?.id) return
  setRoute('saved', { deathId: death.id })
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
function returnToSavedCatalog() {
  setRoute('saved', {}, 'replace')
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
function restoreRoute() {
  const route = routeFromUrl()
  view.value = route.view
  routeDeathId.value = route.deathId
  routeCauseId.value = route.causeId
  routeEpisodeId.value = route.episodeId
}
onMounted(() => window.addEventListener('popstate', restoreRoute))
onMounted(() => {
  const stored = localStorage.getItem('pato7s:color-mode')
  colorMode.value = stored === 'light' || stored === 'dark'
    ? stored
    : window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
})
onMounted(() => { sidebarCollapsed.value = localStorage.getItem('pato7s:sidebar-collapsed') === 'true' })
onBeforeUnmount(() => {
  window.removeEventListener('popstate', restoreRoute)
  document.body.classList.remove('clips-page-open')
  window.clearTimeout(navigationTimer)
  window.clearTimeout(toastTimer)
})
watch(view, (currentView) => document.body.classList.toggle('clips-page-open', currentView === 'clips'), { immediate: true })
watch([enemies, routeCauseId, view], ([causes, causeId, currentView]) => {
  if (currentView === 'detail' && causeId) selectedCause.value = causes.find((cause) => cause.id === causeId) ?? null
}, { immediate: true })
watch([episodes, routeEpisodeId, view], ([items, episodeId, currentView]) => {
  if (currentView === 'episode' && episodeId) selectedEpisode.value = items.find((episode) => String(episode.id) === String(episodeId)) ?? null
}, { immediate: true })
watch(episodes, async (items) => {
  const titles = await Promise.all(items.map(async (episode) => [String(episode.id), await originalVideoTitle(episode)]))
  episodeTitles.value = new Map(titles.filter(([, title]) => title))
}, { immediate: true })
watch(savedDeathIds, persistSavedVideoIds, { deep: true })
watch(colorMode, (mode) => {
  document.documentElement.dataset.theme = mode
  localStorage.setItem('pato7s:color-mode', mode)
}, { immediate: true })
watch(sidebarCollapsed, (collapsed) => localStorage.setItem('pato7s:sidebar-collapsed', String(collapsed)))
function toggleColorMode() { colorMode.value = colorMode.value === 'dark' ? 'light' : 'dark' }
async function shareVideo({ death, view: targetView, causeId }) {
  if (!death) return
  const url = new URL(window.location.href)
  url.search = ''
  url.searchParams.set('view', targetView)
  url.searchParams.set('death', death.id)
  if (causeId) url.searchParams.set('cause', causeId)
  const shareData = { title: 'pato7s', url: url.toString() }
  try {
    if (navigator.share) await navigator.share(shareData)
    else {
      await navigator.clipboard.writeText(shareData.url)
      showToast('Link copiado!')
    }
  } catch { /* cancelamento do compartilhamento não altera a página */ }
}
</script>

<template>
  <main class="min-h-screen bg-bg text-fg">
    <aside class="dashboard-sidebar" :class="sidebarCollapsed && 'sidebar-collapsed'">
      <button class="brand" :aria-label="sidebarCollapsed ? 'Expandir barra lateral' : 'Recolher barra lateral'" :title="sidebarCollapsed ? 'Expandir barra lateral' : 'Recolher barra lateral'" @click="sidebarCollapsed = !sidebarCollapsed">
        <span class="brand-mark"><img src="/favicon.svg" alt="" class="size-6" /></span>
        <span class="brand-copy"><strong>pato7s</strong><small>arquivo de campanha</small></span>
      </button>

      <nav class="sidebar-nav" aria-label="Navegação principal">
        <button class="nav-link" :class="view === 'overview' && 'active'" title="Visão geral" @click="show('overview')"><LayoutDashboard :size="18" /><span class="nav-label">Visão geral</span></button>
        <button class="nav-link" :class="(view === 'bestiary' || view === 'detail') && 'active'" title="Catálogo" @click="show('bestiary')"><Skull :size="18" /><span class="nav-label">Catálogo</span></button>
        <button class="nav-link" :class="view === 'clips' && 'active'" title="Clipes" @click="show('clips')"><Clapperboard :size="18" /><span class="nav-label">Clipes</span></button>
        <button class="nav-link" :class="(view === 'episodes' || view === 'episode') && 'active'" title="Episódios" @click="show('episodes')"><ListVideo :size="18" /><span class="nav-label">Episódios</span></button>
      </nav>
      <div class="sidebar-bottom-nav">
        <button class="nav-link" :class="view === 'picker' && 'active'" title="Escolher vídeo" @click="show('picker')"><Clapperboard :size="18" /><span class="nav-label">Escolher vídeo</span></button>
        <button class="nav-link" :class="view === 'saved' && 'active'" title="Vídeos salvos" @click="show('saved')"><Bookmark :size="18" /><span class="nav-label">Vídeos salvos</span></button>
        <button class="nav-link" :class="view === 'sources' && 'active'" title="Fontes e downloads" @click="show('sources')"><Database :size="18" /><span class="nav-label">Fontes e downloads</span></button>
        <button class="theme-toggle" :aria-label="colorMode === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro'" @click="toggleColorMode"><Sun v-if="colorMode === 'dark'" :size="17" /><Moon v-else :size="17" /><span class="nav-label">{{ colorMode === 'dark' ? 'Modo claro' : 'Modo escuro' }}</span></button>
      </div>

    </aside>

    <div class="compact-menu lg:hidden">
      <button class="compact-menu-trigger" :aria-label="compactMenuOpen ? 'Fechar navegação' : 'Abrir navegação'" :aria-expanded="compactMenuOpen" @click="compactMenuOpen = !compactMenuOpen">
        <X v-if="compactMenuOpen" :size="22" /><Menu v-else :size="22" />
      </button>
      <Transition name="mobile-menu">
      <nav v-if="compactMenuOpen" class="compact-nav" aria-label="Navegação principal" @click.self="compactMenuOpen = false">
        <button :class="view === 'overview' && 'active'" @click="show('overview')">Visão geral</button>
        <button :class="(view === 'bestiary' || view === 'detail') && 'active'" @click="show('bestiary')">Catálogo</button>
        <button :class="view === 'clips' && 'active'" @click="show('clips')">Clipes</button>
        <button :class="view === 'picker' && 'active'" @click="show('picker')">Escolher vídeo</button>
        <button :class="view === 'saved' && 'active'" @click="show('saved')">Vídeos salvos</button>
        <button :class="view === 'sources' && 'active'" @click="show('sources')">Fontes e downloads</button>
        <button :class="(view === 'episodes' || view === 'episode') && 'active'" @click="show('episodes')">Episódios</button>
        <button class="compact-theme-toggle" @click="toggleColorMode"><Sun v-if="colorMode === 'dark'" :size="17" /><Moon v-else :size="17" />{{ colorMode === 'dark' ? 'Modo claro' : 'Modo escuro' }}</button>
      </nav>
      </Transition>
    </div>

    <Transition name="view-loader">
      <div v-if="changingView" class="view-loader" role="status" aria-label="Abrindo tela">
        <span class="view-loader-spinner" aria-hidden="true"></span>
      </div>
    </Transition>
    <Transition name="toast">
      <p v-if="toastMessage" class="app-toast" role="status">{{ toastMessage }}</p>
    </Transition>

    <section id="top" class="dashboard-content" :class="{ 'clips-content': view === 'clips', 'episodes-content': view === 'episodes', 'sidebar-collapsed': sidebarCollapsed }">
      <section v-if="loading" class="loading-state" aria-live="polite"><span class="loading-orbit" aria-hidden="true"></span><div><h2>Organizando o arquivo</h2><p>Carregando mortes, episódios e registros da campanha.</p></div></section>
      <section v-else-if="error" class="empty-state"><span class="empty-state-icon"><RotateCw :size="23" /></span><div><h2>Não foi possível abrir o arquivo</h2><p>Verifique a conexão e tente carregar os dados novamente.</p><button class="primary-button" @click="reload">Tentar novamente</button></div></section>
      <template v-else-if="view === 'detail' && selectedCause">
        <DeathDetail :cause="selectedCause" :deaths="deathsByCause.get(selectedCause.id) ?? []" :initial-death-id="routeDeathId" :saved-ids="savedDeathIds" @close="show('bestiary')" @copied="showToast('Link copiado!')" @save="toggleSavedVideo" @share="shareVideo" />
      </template>
      <ShortVideoFeed v-else-if="view === 'clips'" :deaths="deathRecords" :initial-death-id="routeDeathId" :saved-ids="savedDeathIds" @save="toggleSavedVideo" @share="shareVideo" />
      <ClipPicker v-else-if="view === 'picker'" :deaths="deathRecords" :saved-ids="savedDeathIds" @save="toggleSavedVideo" @share="shareVideo" />
      <SavedVideoCatalog v-else-if="view === 'saved' && !routeDeathId" :deaths="savedDeaths" @open="openSavedVideo" />
      <ShortVideoFeed v-else-if="view === 'saved'" :deaths="savedDeaths" :initial-death-id="routeDeathId" :saved-ids="savedDeathIds" share-view="saved" show-back @back="returnToSavedCatalog" @save="toggleSavedVideo" @share="shareVideo" />
      <SourceArchive v-else-if="view === 'sources'" />
      <EpisodeDetail v-else-if="view === 'episode' && selectedEpisode" :episode="selectedEpisode" :title="episodeTitles.get(String(selectedEpisode.id))" :deaths="deathRecords.filter((death) => String(death.episode_id) === String(selectedEpisode.id))" @close="show('episodes')" />
      <EpisodeBrowser v-else-if="view === 'episodes'" :episodes="episodes" :titles="episodeTitles" :deaths="deathRecords" @open="openEpisode" />
      <template v-else>
        <section v-if="view === 'overview'" id="overview" class="space-y-5">
          <section class="overview-hero">
            <div class="hero-copy"><p class="hero-kicker">Registro de campanha</p><h1>Uma visão nítida de cada tentativa.</h1><p>Explore mortes, inimigos e momentos salvos em uma linha do tempo feita para voltar ao que importa.</p><div class="hero-actions"><button class="primary-button" @click="show('clips')"><Clapperboard :size="17" />Ver clipes</button><button class="quiet-button" @click="show('bestiary')">Abrir catálogo</button></div></div>
            <div class="hero-visual" :class="!spotlightEnemy?.image_url && 'no-image'">
              <img v-if="spotlightEnemy?.image_url" :src="spotlightEnemy.image_url" :alt="spotlightEnemy.name" />
              <div class="hero-visual-caption"><span>Maior ameaça registrada</span><strong>{{ spotlightEnemy?.name ?? 'Aguardando registros' }}</strong><small>{{ spotlightEnemy?.deaths ?? 0 }} {{ spotlightEnemy?.deaths === 1 ? 'morte' : 'mortes' }}</small></div>
            </div>
          </section>
            <div class="section-heading"><div><p class="eyebrow">Resumo</p><h2>Visão geral</h2></div></div>
          <StatsPanel :stats="stats" />
        </section>
        <section v-if="view === 'bestiary'" id="enemies">
          <div class="section-heading">
            <div>
              <p class="eyebrow">Arquivo de inimigos</p><h2>Catálogo</h2>
            </div>
          </div>
          <EnemyBrowser :enemies="enemies" @open="openCause" />
        </section>
      </template>
    </section>
  </main>
</template>
