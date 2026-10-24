<script setup>
import { computed } from 'vue'
import { Download, FileJson, Play } from '@lucide/vue'
import { deathVideoUrl, episodeValue, seasonValue } from '../lib/video'
import { jsonDataUrl, savedClipsExport } from '../lib/clip-json'

const props = defineProps({ deaths: { type: Array, default: () => [] } })
defineEmits(['open'])

const savedJsonUrl = computed(() => jsonDataUrl(savedClipsExport(props.deaths)))

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
      <div class="saved-video-header-actions">
        <span class="saved-video-count">{{ deaths.length }} {{ deaths.length === 1 ? 'vídeo' : 'vídeos' }}</span>
        <a class="saved-json-action" :href="savedJsonUrl" target="_blank" rel="noopener" title="Abrir JSON dos vídeos salvos"><FileJson :size="16" />Abrir JSON</a>
        <a class="saved-json-action" :href="savedJsonUrl" download="pato7s-videos-salvos.json" title="Baixar JSON dos vídeos salvos"><Download :size="16" />Baixar JSON</a>
      </div>
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
