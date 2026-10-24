<script setup>
import EnemyThumb from './EnemyThumb.vue'

// max: maior número de mortes da lista atual (escala da barra)
defineProps({ enemy: { type: Object, required: true }, max: { type: Number, default: 1 } })
defineEmits(['open'])
</script>

<template>
  <article class="enemy-card" role="button" tabindex="0" @click="$emit('open', enemy)" @keydown.enter="$emit('open', enemy)">
    <EnemyThumb :src="enemy.image_url" :name="enemy.name" :dim="!enemy.deaths" class="w-[4.5rem] shrink-0" />
    <div class="flex min-w-0 flex-1 flex-col justify-center gap-2 px-3 py-2.5">
      <div class="min-w-0">
        <h3 class="truncate text-sm font-semibold">{{ enemy.name }}</h3>
        <p class="h-4 text-xs text-muted">{{ enemy.detail ? enemy.type : '' }}</p>
      </div>
      <div class="h-1 rounded-full bg-bg">
        <div class="h-full rounded-full bg-accent" :style="{ width: (enemy.deaths / max) * 100 + '%' }" />
      </div>
    </div>
    <p
      class="grid w-14 shrink-0 place-items-center border-l border-line font-display text-xl font-semibold tabular-nums"
      :class="enemy.deaths ? 'text-fg' : 'text-muted/60'"
    >
      {{ enemy.deaths }}
    </p>
  </article>
</template>
