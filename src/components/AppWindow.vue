<script setup>
defineProps({ title: String, sticky: Boolean })
</script>

<template>
  <section class="dashboard-card">
    <header
      v-if="title || $slots.header"
      class="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4 sm:px-6"
      :class="sticky && 'sticky top-0 z-10 rounded-t-xl bg-panel/95 backdrop-blur'"
    >
      <h2 v-if="title" class="text-sm font-semibold text-fg">{{ title }}</h2>
      <slot name="header" />
    </header>
    <div class="p-5 sm:p-6"><slot /></div>
  </section>
</template>
