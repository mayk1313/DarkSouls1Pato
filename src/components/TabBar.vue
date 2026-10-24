<script setup>
// options: [{ key, label, count? }]
defineProps({ options: Array, modelValue: String })
defineEmits(['update:modelValue'])
</script>

<template>
  <div class="category-tabs">
    <button
      v-for="o in options"
      :key="o.key"
      class="flex items-center gap-1.5 whitespace-nowrap rounded-md px-3 py-2 text-sm transition-colors"
      :class="modelValue === o.key ? 'bg-raised text-fg shadow-sm' : 'text-muted hover:text-fg'"
      @click="$emit('update:modelValue', o.key)"
    >
      {{ o.label }}
      <span class="text-xs tabular-nums" :class="modelValue === o.key ? 'text-accent' : 'text-muted/70'">
        {{ o.count }}
      </span>
    </button>
  </div>
</template>
