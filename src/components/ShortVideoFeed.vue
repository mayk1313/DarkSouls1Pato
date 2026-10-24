<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { ArrowLeft } from '@lucide/vue'
import { deathVideoUrl, episodeValue, seasonValue } from '../lib/video'
import { clipExport, clipJsonFilename, jsonDataUrl } from '../lib/clip-json'
import VideoMenu from './VideoMenu.vue'

const props = defineProps({ deaths: { type: Array, default: () => [] }, initialDeathId: Number, savedIds: { type: Array, default: () => [] }, shareView: { type: String, default: 'clips' }, showBack: Boolean })
const emit = defineEmits(['back', 'save', 'share'])
const active = ref(0)
const vertical = ref(false)
const touchStartY = ref(0)
const progress = ref(0)
const paused = ref(false)
const playlist = ref([])
const slideDirection = ref('up')
let wheelLocked = false

const current = computed(() => playlist.value[active.value])
const clipTitle = computed(() => current.value?.clip_comment ?? current.value?.comment ?? '')
const causeName = computed(() => current.value?.cause?.detail ?? current.value?.cause?.type ?? 'Causa não identificada')
const currentIsSaved = computed(() => props.savedIds.some((id) => Number(id) === Number(current.value?.id)))
const currentJsonUrl = computed(() => current.value ? jsonDataUrl(clipExport(current.value)) : '')
const currentJsonFilename = computed(() => clipJsonFilename(current.value))
function shuffle(items) {
  const result = [...items]
  for (let index = result.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1))
    ;[result[index], result[randomIndex]] = [result[randomIndex], result[index]]
  }
  return result
}
watch(() => props.deaths, (deaths) => {
  const shared = deaths.find((death) => death.id === props.initialDeathId)
  playlist.value = shared ? [shared, ...shuffle(deaths.filter((death) => death.id !== shared.id))] : shuffle(deaths)
  active.value = 0
}, { immediate: true })
function select(index) {
  const next = Math.max(0, Math.min(index, playlist.value.length - 1))
  if (next === active.value) return
  slideDirection.value = next > active.value ? 'up' : 'down'
  active.value = next
  progress.value = 0
  paused.value = false
}
function onKey(event) {
  if (event.key === 'ArrowDown' || event.key === 'ArrowRight') { event.preventDefault(); select(active.value + 1) }
  if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') { event.preventDefault(); select(active.value - 1) }
}
function updateDefaultMode() { vertical.value = window.innerWidth < 640 }
function onWheel(event) {
  if (wheelLocked || Math.abs(event.deltaY) < 18) return
  wheelLocked = true
  select(active.value + (event.deltaY > 0 ? 1 : -1))
  window.setTimeout(() => { wheelLocked = false }, 450)
}
function onTouchStart(event) { touchStartY.value = event.changedTouches[0].clientY }
function onTouchEnd(event) {
  const distance = touchStartY.value - event.changedTouches[0].clientY
  if (Math.abs(distance) > 45) select(active.value + (distance > 0 ? 1 : -1))
}
function togglePlayback(event) {
  const video = event.currentTarget
  if (video.paused) video.play()
  else video.pause()
}
function updateProgress(event) {
  const video = event.currentTarget
  progress.value = video.duration ? (video.currentTime / video.duration) * 100 : 0
}
function shareCurrent() { emit('share', { death: current.value, view: props.shareView }) }
function saveCurrent() { if (current.value) emit('save', current.value) }

onMounted(() => {
  updateDefaultMode()
  window.addEventListener('resize', updateDefaultMode)
  window.addEventListener('keydown', onKey)
})
onBeforeUnmount(() => {
  window.removeEventListener('resize', updateDefaultMode)
  window.removeEventListener('keydown', onKey)
})
</script>

<template>
  <section class="shorts-page">
    <p v-if="!playlist.length" class="state-message">Nenhum clipe disponível.</p>
    <div v-else class="short-player-area">
      <div class="shorts-feed" :class="vertical && 'vertical-mode'" @wheel.prevent="onWheel" @touchstart.passive="onTouchStart" @touchend.passive="onTouchEnd">
        <article class="short-card">
          <div class="short-stage">
            <Transition :name="`clip-${slideDirection}`">
              <div v-if="current" :key="current.id" class="short-slide">
                <video
                  :src="deathVideoUrl(current, current.episode)"
                  autoplay
                  loop
                  playsinline
                  preload="metadata"
                  class="short-video"
                  @click="togglePlayback"
                  @timeupdate="updateProgress"
                  @play="paused = false"
                  @pause="paused = true"
                />
                <div class="short-info">
                  <p class="short-title">{{ causeName }}<span v-if="clipTitle"> · {{ clipTitle }}</span></p>
                  <p class="short-description">Temporada {{ seasonValue(current, current.episode) }} · Episódio {{ episodeValue(current, current.episode) }} · ID {{ current.id }}</p>
                </div>
              </div>
            </Transition>
            <span class="short-progress"><i :style="{ width: `${progress}%` }" /></span>
            <span v-if="paused" class="pause-indicator">Ⅱ</span>
          </div>
        </article>
      </div>
      <button v-if="showBack" class="short-back-button" aria-label="Voltar para vídeos salvos" title="Voltar para vídeos salvos" @click="emit('back')"><ArrowLeft :size="21" /></button>
      <VideoMenu class="short-video-menu" :download-url="deathVideoUrl(current, current.episode)" :json-url="currentJsonUrl" :json-filename="currentJsonFilename" :saved="currentIsSaved" show-format :vertical="vertical" @save="saveCurrent" @vertical="vertical = true" @complete="vertical = false" @share="shareCurrent" />
      <div class="short-nav" aria-label="Navegação de clipes">
        <button :disabled="active === 0" aria-label="Clipe anterior" @click="select(active - 1)">↑</button>
        <button :disabled="active === playlist.length - 1" aria-label="Próximo clipe" @click="select(active + 1)">↓</button>
      </div>
    </div>
  </section>
</template>
