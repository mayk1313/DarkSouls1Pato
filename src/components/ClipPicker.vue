<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { Check, ChevronLeft, ChevronRight, Maximize, Minimize, Pause, Play, Volume2, VolumeX } from '@lucide/vue'
import { deathVideoUrl, episodeValue, seasonValue } from '../lib/video'
import VideoMenu from './VideoMenu.vue'
import ClassificationDisclaimer from './ClassificationDisclaimer.vue'

const props = defineProps({ deaths: { type: Array, default: () => [] }, savedIds: { type: Array, default: () => [] } })
const emit = defineEmits(['save', 'share'])
const draftNumber = ref('1')
const confirmedNumber = ref(1)
const player = ref(null)
const progress = ref(0)
const paused = ref(false)
const muted = ref(false)
const playerRoot = ref(null)
const controlsVisible = ref(false)
const isFullscreen = ref(false)
let controlsTimer

const currentIndex = computed(() => confirmedNumber.value - 1)
const current = computed(() => props.deaths[currentIndex.value])
const currentIsSaved = computed(() => props.savedIds.some((id) => Number(id) === Number(current.value?.id)))
const causeName = computed(() => current.value?.cause?.detail ?? current.value?.cause?.type ?? 'Causa não identificada')

watch(() => props.deaths.length, (count) => {
  const next = Math.min(Math.max(confirmedNumber.value, 1), count || 1)
  confirmedNumber.value = next
  draftNumber.value = String(next)
}, { immediate: true })
watch(current, () => { progress.value = 0; paused.value = false })

function clearControlsTimer() { window.clearTimeout(controlsTimer) }
function showControls() {
  controlsVisible.value = true
  clearControlsTimer()
  controlsTimer = window.setTimeout(() => { controlsVisible.value = false }, 2200)
}
function hideControls() {
  clearControlsTimer()
  controlsVisible.value = false
}
function syncFullscreenState() {
  isFullscreen.value = document.fullscreenElement === playerRoot.value
  if (!isFullscreen.value) hideControls()
}

onMounted(() => document.addEventListener('fullscreenchange', syncFullscreenState))
onBeforeUnmount(() => {
  clearControlsTimer()
  document.removeEventListener('fullscreenchange', syncFullscreenState)
})

function validNumber(value) { return Math.min(Math.max(Number.parseInt(value, 10) || 1, 1), props.deaths.length || 1) }
function changeDraft(amount) { draftNumber.value = String(validNumber(Number(draftNumber.value) + amount)) }
function confirmSelection() {
  const next = validNumber(draftNumber.value)
  draftNumber.value = String(next)
  confirmedNumber.value = next
}
function togglePlayback() {
  if (!player.value) return
  if (player.value.paused) player.value.play()
  else player.value.pause()
}
function updateProgress() { progress.value = player.value?.duration ? (player.value.currentTime / player.value.duration) * 100 : 0 }
function seek(event) { if (player.value?.duration) player.value.currentTime = (Number(event.target.value) / 100) * player.value.duration }
function toggleMuted() { if (player.value) player.value.muted = !player.value.muted }
function toggleFullscreen() {
  if (!playerRoot.value) return
  if (document.fullscreenElement === playerRoot.value) document.exitFullscreen?.()
  else playerRoot.value.requestFullscreen?.()
}
function saveCurrent() { if (current.value) emit('save', current.value) }
function shareCurrent() { if (current.value) emit('share', { death: current.value, view: 'picker' }) }
</script>

<template>
  <section class="clip-picker-page">
    <header class="section-heading"><div><p class="eyebrow">Reprodução direta</p><h2>Escolher vídeo</h2></div></header>

    <form v-if="deaths.length" class="clip-picker-selector" @submit.prevent="confirmSelection">
      <label for="clip-number">Número do vídeo <span>de 1 a {{ deaths.length }}</span></label>
      <div class="clip-number-controls">
        <button type="button" aria-label="Diminuir número" @click="changeDraft(-1)"><ChevronLeft :size="20" /></button>
        <input id="clip-number" v-model="draftNumber" type="text" inputmode="numeric" pattern="[0-9]*" aria-label="Número do vídeo" />
        <button type="button" aria-label="Aumentar número" @click="changeDraft(1)"><ChevronRight :size="20" /></button>
        <button class="clip-confirm-button" type="submit"><Check :size="17" />Confirmar</button>
      </div>
    </form>
    <p v-else class="state-message">Nenhum clipe disponível.</p>

    <div v-if="current" ref="playerRoot" class="clip-picker-player" @mouseenter="showControls" @mousemove="showControls" @mouseleave="hideControls" @touchstart.passive="showControls" @focusin="showControls">
      <div class="clip-picker-stage">
        <video ref="player" :key="current.id" class="clip-picker-video" autoplay playsinline :src="deathVideoUrl(current, current.episode)" @click="togglePlayback" @timeupdate="updateProgress" @play="paused = false" @pause="paused = true" @volumechange="muted = player?.muted ?? false" />
        <VideoMenu class="clip-picker-menu" :class="{ 'is-hidden': !controlsVisible }" :download-url="deathVideoUrl(current, current.episode)" :saved="currentIsSaved" @save="saveCurrent" @share="shareCurrent" />
        <div class="clip-picker-controls" :class="{ 'is-hidden': !controlsVisible }">
          <input aria-label="Progresso do vídeo" type="range" min="0" max="100" step="0.1" :value="progress" @input="seek" />
          <div>
            <button :aria-label="paused ? 'Reproduzir' : 'Pausar'" @click="togglePlayback"><Play v-if="paused" :size="20" fill="currentColor" /><Pause v-else :size="20" fill="currentColor" /></button>
            <button :aria-label="muted ? 'Ativar som' : 'Silenciar'" @click="toggleMuted"><VolumeX v-if="muted" :size="20" /><Volume2 v-else :size="20" /></button>
            <button :aria-label="isFullscreen ? 'Sair da tela cheia' : 'Tela cheia'" @click="toggleFullscreen"><Minimize v-if="isFullscreen" :size="19" /><Maximize v-else :size="19" /></button>
          </div>
        </div>
      </div>
      <p class="clip-picker-caption"><strong>#{{ confirmedNumber }} · {{ causeName }}</strong><span>Temporada {{ seasonValue(current, current.episode) }} · Episódio {{ episodeValue(current, current.episode) }} · ID {{ current.id }}</span></p>
    </div>
    <ClassificationDisclaimer />
  </section>
</template>
