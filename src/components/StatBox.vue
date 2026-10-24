<script setup>
import AppWindow from './AppWindow.vue'
defineProps({ label: String, value: [String, Number] })
</script>

<template>
  <AppWindow :title="label">
    <p class="font-display text-3xl font-semibold tabular-nums">{{ value }}</p>
  </AppWindow>
</template>
