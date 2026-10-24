<script setup>
import { ref } from 'vue'

// Tamanho e borda vêm de quem usa (class="size-9 rounded")
defineProps({ src: String, name: { type: String, default: '' }, dim: Boolean })
const failed = ref(false)
</script>

<template>
  <div class="relative overflow-hidden bg-bg">
    <img
      v-if="src && !failed"
      :src="src"
      :alt="name"
      loading="lazy"
      class="absolute inset-0 size-full object-cover object-top"
      :class="dim && 'opacity-45 grayscale'"
      @error="failed = true"
    />
    <span v-else class="absolute inset-0 grid place-items-center font-display text-lg font-medium text-muted">
      {{ name[0] }}
    </span>
  </div>
</template>
