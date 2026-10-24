<script setup>
import AppWindow from './AppWindow.vue'
import StatItem from './StatItem.vue'
import RankList from './RankList.vue'
import { formatDuration } from '../lib/format'

defineProps({ stats: { type: Object, required: true } })
</script>

<template>
  <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-12">
    <AppWindow class="death-summary md:col-span-2 xl:col-span-4">
      <div class="flex items-start justify-between">
        <div><p class="card-kicker">Total de mortes</p><StatItem :value="stats.totalDeaths.toLocaleString('pt-BR')" large /></div>
        <span class="skull-icon">☠</span>
      </div>
      <div class="mt-7 grid grid-cols-2 gap-4 border-t border-white/10 pt-5">
        <StatItem label="Tempo de live" :value="formatDuration(stats.liveSeconds)" />
        <StatItem label="Tempo morrendo" :value="formatDuration(stats.dyingSeconds)" />
      </div>
    </AppWindow>
    <AppWindow title="Principais causas" class="xl:col-span-3">
      <RankList :items="stats.topCauses" />
    </AppWindow>
    <AppWindow title="Inimigos mais letais" class="xl:col-span-5">
      <RankList :items="stats.topEnemies" />
    </AppWindow>
  </div>
</template>
