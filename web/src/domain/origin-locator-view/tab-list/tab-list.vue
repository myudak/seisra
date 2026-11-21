<script setup lang="ts">
import { RouterLink } from 'vue-router'

defineProps<{
  id: string
  selectedTab: string
}>()

const TABS = [
  { id: 'location', label: 'Lokasi', icon: 'ri-map-pin-2-line' },
  { id: 'magnitude', label: 'Magnitudo', icon: 'ri-pulse-line' },
  { id: 'picking', label: 'Koreksi fase', icon: 'gi-sound-waves' }
]
</script>

<template>
  <nav class="app-segmented self-start lg:self-auto" aria-label="Analisis kejadian">
    <RouterLink
      v-for="tab in TABS"
      :key="tab.id"
      :to="`/origin-locator-view/${tab.id}/${id}`"
      class="app-segment"
      :class="{ 'app-segment-active': selectedTab === tab.id }"
      :aria-current="selectedTab === tab.id ? 'page' : undefined">
      <v-icon :name="tab.icon" scale="0.85" />
      {{ tab.label }}
    </RouterLink>
  </nav>
</template>
