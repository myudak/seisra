<script setup lang="ts">
// Placeholder until the backend returns residual data for these plots.
defineProps<{
  tab?: string
}>()
</script>

<template>
  <div
    class="flex h-40 w-full flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-base-300 bg-base-200/40 text-center">
    <v-icon name="ri-pulse-line" class="text-base-content/30" scale="1.2" />
    <p class="text-sm font-medium text-base-content/70">Grafik {{ tab ? tab.toLowerCase() : '' }} belum tersedia</p>
    <p class="text-xs text-base-content/50">Backend belum mengirim data residual untuk grafik ini.</p>
  </div>
</template>
