<script setup>
import { Play } from '@lucide/vue'
import { deathVideoUrl, episodeValue, seasonValue } from '../lib/video'

defineProps({ deaths: { type: Array, default: () => [] } })
defineEmits(['open'])

function causeName(death) {
  return death.cause?.detail ?? death.cause?.type ?? 'Causa não identificada'
}
</script>

<template>
  <section class="saved-videos-page">
    <header class="section-heading">
      <div>
        <p class="eyebrow">Sua coleção</p>
        <h2>Vídeos salvos</h2>
      </div>
      <span class="saved-video-count">{{ deaths.length }} {{ deaths.length === 1 ? 'vídeo' : 'vídeos' }}</span>
    </header>

    <p v-if="!deaths.length" class="state-message">Você ainda não salvou nenhum vídeo.</p>
    <div v-else class="saved-video-grid">
      <button v-for="death in deaths" :key="death.id" class="saved-video-card" @click="$emit('open', death)">
        <span class="saved-video-preview">
          <video :src="deathVideoUrl(death, death.episode)" muted playsinline preload="metadata" aria-hidden="true" />
          <i><Play :size="18" fill="currentColor" aria-hidden="true" /></i>
        </span>
        <span class="saved-video-copy">
          <strong>{{ causeName(death) }}</strong>
          <small>Temporada {{ seasonValue(death, death.episode) }} · Episódio {{ episodeValue(death, death.episode) }}</small>
        </span>
      </button>
    </div>
  </section>
</template>
