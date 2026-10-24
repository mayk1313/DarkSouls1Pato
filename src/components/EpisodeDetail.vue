<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { ArrowLeft, Clapperboard, Download, Eye, TvMinimalPlay } from '@lucide/vue'
import { deathCodebergUrl, deathLiveUrl, deathVideoUrl, episodeValue, liveEmbedUrl, seasonValue } from '../lib/video'
import { clipExport, clipJsonFilename, jsonDataUrl } from '../lib/clip-json'
import { toSeconds } from '../lib/format'
import ClassificationDisclaimer from './ClassificationDisclaimer.vue'
import VideoMenu from './VideoMenu.vue'

const props = defineProps({ episode: { type: Object, required: true }, title: String, deaths: { type: Array, default: () => [] } })
const emit = defineEmits(['close'])
const sequenceMode = ref('youtube')
const sequenceAutoplay = ref(false)
const sequenceIndex = ref(0)
const youtubeFrame = ref(null)
const currentDeath = computed(() => props.deaths[sequenceIndex.value] ?? null)
const liveUrl = computed(() => deathLiveUrl(currentDeath.value ?? {}, props.episode))
const playerUrl = computed(() => {
  const start = toSeconds(currentDeath.value?.clip_start)
  const end = toSeconds(currentDeath.value?.clip_end)
  return liveEmbedUrl(liveUrl.value, start, end > start ? end : undefined, sequenceAutoplay.value)
})
const currentJsonUrl = computed(() => currentDeath.value ? jsonDataUrl(clipExport({ ...currentDeath.value, episode: currentDeath.value.episode ?? props.episode })) : '')
const currentJsonFilename = computed(() => clipJsonFilename(currentDeath.value))

watch(() => [props.episode.id, props.deaths.length], () => { sequenceIndex.value = 0 }, { immediate: true })
function watchDeath(death) { const index = props.deaths.findIndex((item) => item.id === death.id); if (index >= 0) sequenceIndex.value = index }
function nextInSequence() { if (sequenceAutoplay.value && sequenceIndex.value < props.deaths.length - 1) sequenceIndex.value += 1 }
function setMode(mode) { sequenceMode.value = mode; sequenceIndex.value = 0 }
function listenToYoutube() {
  youtubeFrame.value?.contentWindow?.postMessage(JSON.stringify({ event: 'listening', id: 'episode-sequence' }), '*')
  youtubeFrame.value?.contentWindow?.postMessage(JSON.stringify({ event: 'command', func: 'addEventListener', args: ['onStateChange'] }), '*')
}
function onYoutubeMessage(event) {
  if (sequenceMode.value !== 'youtube' || !String(event.origin).includes('youtube')) return
  let data = event.data
  if (typeof data === 'string') { try { data = JSON.parse(data) } catch { return } }
  if (data?.event === 'onStateChange' && data.info === 0) nextInSequence()
}
onMounted(() => window.addEventListener('message', onYoutubeMessage))
onBeforeUnmount(() => window.removeEventListener('message', onYoutubeMessage))
</script>

<template>
  <section class="episode-detail-page">
    <button class="icon-back" aria-label="Voltar aos episódios" title="Voltar" @click="emit('close')"><ArrowLeft :size="20" /></button>
    <header class="episode-detail-header"><span class="episode-kicker">Temporada {{ seasonValue({}, episode) }} · EP {{ episodeValue({}, episode) }}</span><h1>{{ title ?? episode.name ?? episode.title ?? `Episódio ${episodeValue({}, episode)}` }}</h1><p>{{ deaths.length }} {{ deaths.length === 1 ? 'morte registrada' : 'mortes registradas' }}</p></header>

    <section class="episode-sequence dashboard-card">
      <div class="sequence-header"><div><h2>Assistir em sequência</h2><p>Escolha a origem e ative a sequência automática apenas se quiser avançar entre os trechos.</p></div><div class="sequence-controls"><div class="sequence-modes" role="group" aria-label="Modo de reprodução"><button :class="sequenceMode === 'clips' && 'active'" @click="setMode('clips')"><Clapperboard :size="16" />Clipes</button><button :class="sequenceMode === 'youtube' && 'active'" @click="setMode('youtube')"><TvMinimalPlay :size="16" />YouTube</button></div><label class="autoplay-switch"><input v-model="sequenceAutoplay" type="checkbox" /><span></span>Avançar automaticamente</label></div></div>
      <p v-if="!deaths.length" class="empty-deaths">Não há clipes para assistir neste episódio.</p>
      <template v-else>
        <div class="sequence-player">
          <video v-if="sequenceMode === 'clips' && currentDeath" :key="`clip-${currentDeath.id}-${sequenceAutoplay}`" class="sequence-video" controls :autoplay="sequenceAutoplay" playsinline :src="deathVideoUrl(currentDeath, currentDeath.episode ?? episode)" @ended="nextInSequence" />
          <iframe v-else-if="playerUrl" ref="youtubeFrame" :key="`youtube-${currentDeath?.id}-${sequenceAutoplay}`" class="episode-live" :src="playerUrl" title="Trecho da live no YouTube" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen @load="listenToYoutube"></iframe>
          <p v-else class="state-message">A live deste episódio não possui um link disponível.</p>
          <VideoMenu v-if="currentDeath" class="episode-video-menu" :download-url="deathVideoUrl(currentDeath, currentDeath.episode ?? episode)" :json-url="currentJsonUrl" :json-filename="currentJsonFilename" :show-save="false" :show-share="false" />
        </div>
        <div class="sequence-status"><div><span>Origem</span><strong>{{ sequenceMode === 'youtube' ? 'Trecho da live no YouTube' : 'Clipe recortado' }}</strong></div><div><span>Causa</span><strong>{{ currentDeath?.cause?.detail ?? currentDeath?.cause?.type ?? 'Causa não identificada' }}</strong></div><div><span>Posição</span><strong>Clipe {{ sequenceIndex + 1 }} de {{ deaths.length }}</strong></div><div><span>Temporada</span><strong>{{ seasonValue(currentDeath ?? {}, episode) }} · EP {{ episodeValue(currentDeath ?? {}, episode) }}</strong></div></div>
      </template>
    </section>

    <section class="episode-clips dashboard-card">
      <div class="episode-clips-heading"><div><h2>Clipes do episódio</h2><p>Selecione um trecho para assistir a partir dele.</p></div></div>
      <p v-if="!deaths.length" class="empty-deaths">Nenhuma morte registrada.</p>
      <div v-else class="episode-clip-list">
        <article v-for="(death, index) in deaths" :key="death.id" class="episode-clip-row" :class="sequenceIndex === index && 'selected'"><button class="episode-clip-main" @click="watchDeath(death)"><span>Clipe {{ index + 1 }}</span><strong>{{ death.cause?.detail ?? death.cause?.type ?? 'Causa não identificada' }}</strong><small>{{ death.clip_start || 'Início não informado' }}</small></button><div class="episode-death-actions"><button class="episode-icon-button" :aria-label="`Assistir morte ${death.id}`" title="Assistir no sequenciador" @click="watchDeath(death)"><Eye :size="17" /></button><a class="episode-icon-button" :href="deathCodebergUrl(death, episode)" target="_blank" rel="noreferrer" :aria-label="`Abrir clipe da morte ${death.id}`" title="Abrir clipe no Codeberg"><Download :size="17" /></a></div></article>
      </div>
    </section>
    <ClassificationDisclaimer />
  </section>
</template>
