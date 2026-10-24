<script setup>
defineProps({ label: String, value: [String, Number], large: Boolean })
</script>

<template>
  <div class="stat-item">
    <p v-if="label" class="text-xs text-muted">{{ label }}</p>
    <p
      class="mt-1 font-display font-semibold leading-none tabular-nums"
      :class="large ? 'mt-3 text-5xl sm:text-6xl' : 'text-xl'"
    >
      {{ value }}
    </p>
  </div>
</template>
