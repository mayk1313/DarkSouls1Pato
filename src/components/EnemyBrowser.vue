<script setup>
import { ref, computed } from 'vue'
import { Search } from '@lucide/vue'
import AppWindow from './AppWindow.vue'
import TabBar from './TabBar.vue'
import EnemyCard from './EnemyCard.vue'
import { CATEGORIES } from '../lib/categories'

const props = defineProps({ enemies: { type: Array, default: () => [] } })
defineEmits(['open'])

const tab = ref('all')
const desc = ref(true) // padrão: quem mais matou primeiro
const query = ref('')

const options = computed(() =>
  CATEGORIES.map((c) => ({
    key: c.key,
    label: c.label,
    count: props.enemies.filter((e) => c.match(e.type)).length,
  })),
)

const list = computed(() => {
  const category = CATEGORIES.find((c) => c.key === tab.value)
  const dir = desc.value ? -1 : 1
  return props.enemies
    .filter((e) => category.match(e.type))
    .filter((e) => `${e.name} ${e.type} ${e.detail ?? ''}`.toLocaleLowerCase('pt-BR').includes(query.value.trim().toLocaleLowerCase('pt-BR')))
    .sort((a, b) => (a.deaths - b.deaths) * dir || a.name.localeCompare(b.name))
})

const max = computed(() => Math.max(1, ...list.value.map((e) => e.deaths)))
</script>

<template>
  <AppWindow sticky>
    <template #header>
      <div class="catalog-toolbar">
        <label class="catalog-search"><Search :size="17" /><input v-model="query" type="search" placeholder="Buscar por nome ou tipo" aria-label="Buscar no catálogo" /><button v-if="query" type="button" aria-label="Limpar busca" @click="query = ''">×</button></label>
        <button
          class="sort-button"
          :aria-label="desc ? 'Ordem decrescente' : 'Ordem crescente'"
          @click="desc = !desc"
        >
          Mortes <span class="text-base leading-none text-accent">{{ desc ? '↓' : '↑' }}</span>
        </button>
      </div>
      <TabBar v-model="tab" :options="options" />
    </template>
    <div v-if="list.length" class="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
      <EnemyCard v-for="e in list" :key="e.id" :enemy="e" :max="max" @open="$emit('open', $event)" />
    </div>
    <div v-else class="empty-catalog">
      <p>{{ query ? 'Nenhum resultado para esta busca.' : 'Nenhum inimigo foi registrado nesta categoria.' }}</p>
      <span>{{ query ? 'Tente outro nome ou limpe a busca.' : 'Escolha outra categoria para continuar explorando.' }}</span>
    </div>
  </AppWindow>
</template>
