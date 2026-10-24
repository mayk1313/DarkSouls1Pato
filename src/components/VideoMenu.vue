<script setup>
import { ref } from 'vue'
import { Bookmark, BookmarkCheck, Download, FileJson, Link, Monitor, Smartphone, X } from '@lucide/vue'

defineProps({ downloadUrl: { type: String, required: true }, jsonUrl: { type: String, default: '' }, jsonFilename: { type: String, default: 'pato7s-clipe.json' }, showFormat: Boolean, showSave: { type: Boolean, default: true }, showShare: { type: Boolean, default: true }, vertical: Boolean, saved: Boolean })
const emit = defineEmits(['save', 'share', 'vertical', 'complete'])
const open = ref(false)
const menuRoot = ref(null)
let resumeOnClose = false

function relatedVideo() { return menuRoot.value?.closest('.short-player-area, .player-wrap, .clip-picker-player, .sequence-player')?.querySelector('video') }
function openMenu() {
  const video = relatedVideo()
  resumeOnClose = Boolean(video && !video.paused && !video.ended)
  if (resumeOnClose) video.pause()
  open.value = true
}
function closeMenu() {
  open.value = false
  const video = relatedVideo()
  if (resumeOnClose && video) video.play().catch(() => {})
  resumeOnClose = false
}
function share() { closeMenu(); emit('share') }
function setFormat() { emit('vertical'); closeMenu() }
function setComplete() { emit('complete'); closeMenu() }
</script>

<template>
  <div ref="menuRoot" class="video-menu">
    <div class="video-menu-controls">
      <button v-if="showSave" class="save-video-button" :class="saved && 'is-saved'" :aria-label="saved ? 'Remover dos vídeos salvos' : 'Salvar vídeo'" :title="saved ? 'Remover dos salvos' : 'Salvar vídeo'" @click="$emit('save')">
        <BookmarkCheck v-if="saved" :size="19" aria-hidden="true" />
        <Bookmark v-else :size="19" aria-hidden="true" />
      </button>
      <button class="video-menu-trigger" aria-label="Abrir opções do vídeo" title="Opções do vídeo" @click="openMenu">•••</button>
    </div>

    <Teleport to="body">
      <div v-if="open" class="video-menu-modal" role="presentation" @click.self="closeMenu">
        <section class="video-menu-dialog" role="dialog" aria-modal="true" aria-label="Opções do vídeo" @click.stop>
          <header><div><p>Opções do vídeo</p><span>Escolha uma ação</span></div><button aria-label="Fechar opções" @click="closeMenu"><X :size="20" /></button></header>
          <div class="video-menu-options">
            <button v-if="showFormat && !vertical" class="video-menu-option" @click="setFormat"><Smartphone :size="19" /><span><strong>Formato vertical</strong><small>Preenche a tela como um short.</small></span></button>
            <button v-if="showFormat && vertical" class="video-menu-option" @click="setComplete"><Monitor :size="19" /><span><strong>Formato completo</strong><small>Volta para a proporção original.</small></span></button>
            <a class="video-menu-option" :href="downloadUrl" download @click="closeMenu"><Download :size="19" /><span><strong>Baixar vídeo</strong><small>Salva uma cópia no seu dispositivo.</small></span></a>
            <a v-if="jsonUrl" class="video-menu-option" :href="jsonUrl" target="_blank" rel="noopener" @click="closeMenu"><FileJson :size="19" /><span><strong>Abrir JSON</strong><small>Mostra os dados deste clipe.</small></span></a>
            <a v-if="jsonUrl" class="video-menu-option" :href="jsonUrl" :download="jsonFilename" @click="closeMenu"><Download :size="19" /><span><strong>Baixar JSON</strong><small>Salva os dados deste clipe.</small></span></a>
            <button v-if="showShare" class="video-menu-option" @click="share"><Link :size="19" /><span><strong>Compartilhar</strong><small>Copia ou abre as opções de compartilhamento.</small></span></button>
          </div>
        </section>
      </div>
    </Teleport>
  </div>
</template>
