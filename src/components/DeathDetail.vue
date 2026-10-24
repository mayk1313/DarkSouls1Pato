<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { ArrowLeft, Maximize, Minimize, Pause, Play, Volume2, VolumeX } from '@lucide/vue'
import { deathVideoUrl, episodeValue, seasonValue } from '../lib/video'
import VideoMenu from './VideoMenu.vue'
import ClassificationDisclaimer from './ClassificationDisclaimer.vue'

const props = defineProps({ cause: { type: Object, required: true }, deaths: { type: Array, default: () => [] }, initialDeathId: Number, savedIds: { type: Array, default: () => [] } })
const emit = defineEmits(['close', 'save', 'share', 'copied'])
const activeIndex = ref(0)
const autoplay = ref(true)
const player = ref(null)
const playerRoot = ref(null)
const progress = ref(0)
const paused = ref(false)
const muted = ref(false)
const controlsVisible = ref(false)
const isFullscreen = ref(false)
let controlsTimer

watch(() => [props.cause.id, props.initialDeathId], () => {
  const initialIndex = props.deaths.findIndex((death) => death.id === props.initialDeathId)
  activeIndex.value = initialIndex >= 0 ? initialIndex : 0
  autoplay.value = true
}, { immediate: true })
const activeDeath = computed(() => props.deaths[activeIndex.value] ?? null)
const videoUrl = computed(() => activeDeath.value ? deathVideoUrl(activeDeath.value, activeDeath.value.episode) : '')
const activeComment = computed(() => activeDeath.value?.clip_comment ?? activeDeath.value?.comment ?? activeDeath.value?.comments ?? '')
const displayName = computed(() => props.cause.detail || props.cause.type)
const activeIsSaved = computed(() => props.savedIds.some((id) => Number(id) === Number(activeDeath.value?.id)))

function play(index) {
  activeIndex.value = index
}
function next() {
  if (!props.deaths.length) return
  activeIndex.value = (activeIndex.value + 1) % props.deaths.length
}
function shareCurrent() { emit('share', { death: activeDeath.value, view: 'detail', causeId: props.cause.id }) }
function saveCurrent() { if (activeDeath.value) emit('save', activeDeath.value) }
function clearControlsTimer() { window.clearTimeout(controlsTimer) }
function showControls() { controlsVisible.value = true; clearControlsTimer(); controlsTimer = window.setTimeout(() => { controlsVisible.value = false }, 2200) }
function hideControls() { clearControlsTimer(); controlsVisible.value = false }
function togglePlayback() { if (!player.value) return; player.value.paused ? player.value.play() : player.value.pause() }
function updateProgress() { progress.value = player.value?.duration ? (player.value.currentTime / player.value.duration) * 100 : 0 }
function seek(event) { if (player.value?.duration) player.value.currentTime = (Number(event.target.value) / 100) * player.value.duration }
function toggleMuted() { if (player.value) player.value.muted = !player.value.muted }
function syncFullscreenState() { isFullscreen.value = document.fullscreenElement === playerRoot.value; if (!isFullscreen.value) hideControls() }
function toggleFullscreen() { if (!playerRoot.value) return; document.fullscreenElement === playerRoot.value ? document.exitFullscreen?.() : playerRoot.value.requestFullscreen?.() }
watch(activeDeath, () => { progress.value = 0; paused.value = false })
onMounted(() => document.addEventListener('fullscreenchange', syncFullscreenState))
onBeforeUnmount(() => { clearControlsTimer(); document.removeEventListener('fullscreenchange', syncFullscreenState) })
</script>

<template>
  <section class="detail-page">
    <button class="icon-back" aria-label="Voltar ao catálogo" title="Voltar" @click="emit('close')"><ArrowLeft :size="20" /></button>
    <header class="detail-titlebar">
      <h1>{{ displayName }}</h1>
    </header>

    <div class="detail-layout">
      <section class="video-column">
        <div v-if="activeDeath" ref="playerRoot" class="player-wrap detail-player" @mouseenter="showControls" @mousemove="showControls" @mouseleave="hideControls" @touchstart.passive="showControls" @focusin="showControls">
          <video ref="player" :key="videoUrl" class="death-player" autoplay playsinline :src="videoUrl" @click="togglePlayback" @timeupdate="updateProgress" @play="paused = false" @pause="paused = true" @volumechange="muted = player?.muted ?? false" @ended="autoplay && next()" />
          <VideoMenu class="detail-video-menu" :class="{ 'is-hidden': !controlsVisible }" :download-url="videoUrl" :saved="activeIsSaved" @save="saveCurrent" @share="shareCurrent" />
          <div class="detail-player-controls" :class="{ 'is-hidden': !controlsVisible }">
            <input aria-label="Progresso do vídeo" type="range" min="0" max="100" step="0.1" :value="progress" @input="seek" />
            <div><button :aria-label="paused ? 'Reproduzir' : 'Pausar'" @click="togglePlayback"><Play v-if="paused" :size="20" fill="currentColor" /><Pause v-else :size="20" fill="currentColor" /></button><button :aria-label="muted ? 'Ativar som' : 'Silenciar'" @click="toggleMuted"><VolumeX v-if="muted" :size="20" /><Volume2 v-else :size="20" /></button><button :aria-label="isFullscreen ? 'Sair da tela cheia' : 'Tela cheia'" @click="toggleFullscreen"><Minimize v-if="isFullscreen" :size="19" /><Maximize v-else :size="19" /></button></div>
          </div>
          <p class="player-caption">Clipe {{ activeDeath.position ?? activeDeath.id }} · Temporada {{ seasonValue(activeDeath, activeDeath.episode) }} · Episódio {{ episodeValue(activeDeath, activeDeath.episode) }}</p>
        </div>
        <section v-if="activeDeath" class="death-context" aria-label="Informações da morte selecionada">
          <div><span>Inimigo</span><strong>{{ displayName }}</strong></div>
          <div><span>Causa</span><strong>{{ cause.type }}</strong></div>
          <div><span>Registro</span><strong>#{{ activeDeath.id }}</strong></div>
          <div><span>Mortes da causa</span><strong>{{ deaths.length }}</strong></div>
        </section>
        <div v-if="activeComment" class="death-comment">“{{ activeComment }}”</div>
      </section>

      <section class="clip-rail-section">
        <div class="wiki-header"><div><h2>Clipes desta causa</h2><p>{{ deaths.length }} {{ deaths.length === 1 ? 'registro disponível' : 'registros disponíveis' }}</p></div><label class="autoplay-switch"><input v-model="autoplay" type="checkbox" /><span></span>Reproduzir em sequência</label></div>
        <p v-if="!deaths.length" class="empty-deaths">Nenhuma morte registrada para esta causa.</p>
        <div v-else class="clip-rail" role="list" aria-label="Clipes da causa">
          <button v-for="(death, index) in deaths" :key="death.id" class="clip-rail-item" :class="index === activeIndex && 'selected'" role="listitem" @click="play(index)"><span>Clipe {{ death.position ?? death.id }}</span><strong>Registro #{{ death.id }}</strong><small>T{{ seasonValue(death, death.episode) }} · EP {{ episodeValue(death, death.episode) }}</small></button>
        </div>
      </section>
      <details class="json-block detail-json-block"><summary>Dados da causa em JSON</summary><pre>{{ JSON.stringify(cause, null, 2) }}</pre></details>
      <ClassificationDisclaimer />
    </div>
  </section>
</template>
