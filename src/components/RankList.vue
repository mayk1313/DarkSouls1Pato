<script setup>
import { computed } from 'vue'
import EnemyThumb from './EnemyThumb.vue'

// items: [{ label, value, image? }] — com a chave "image", mostra a miniatura
const props = defineProps({ items: { type: Array, default: () => [] } })
const max = computed(() => Math.max(1, ...props.items.map((i) => i.value)))
</script>

<template>
  <ol class="space-y-4">
    <li v-for="(item, i) in items" :key="item.label" class="flex items-center gap-3">
      <span class="rank-number" :class="i === 0 && 'leader'">{{ String(i + 1).padStart(2, '0') }}</span>
      <EnemyThumb
        v-if="'image' in item"
        :src="item.image"
        :name="item.label"
        class="size-10 shrink-0 rounded-lg border border-line"
      />
      <div class="min-w-0 flex-1">
        <div class="mb-2 flex justify-between gap-3 text-sm">
          <span class="truncate">{{ item.label }}</span>
          <span class="font-medium tabular-nums">{{ item.value }}</span>
        </div>
        <div class="h-1.5 rounded-full bg-bg">
          <div class="h-full rounded-sm bg-accent" :style="{ width: (item.value / max) * 100 + '%' }" />
        </div>
      </div>
    </li>
  </ol>
</template>
