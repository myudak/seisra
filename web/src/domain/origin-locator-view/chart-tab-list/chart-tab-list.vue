<script setup lang="ts">
import { ref } from 'vue'

import { MockChart } from '../mock-chart'

const tabs = [
  { id: 'Distance', label: 'Jarak' },
  { id: 'Azimuth', label: 'Azimuth' },
  { id: 'Travel Time', label: 'Waktu tempuh' },
  { id: 'Move Out', label: 'Move-out' }
]

const selectedTab = ref(tabs[0].id)
</script>

<template>
  <div class="flex flex-col gap-3">
    <div class="flex flex-wrap items-center justify-between gap-2">
      <h2 class="app-section-title">Residual</h2>
      <div class="app-segmented" role="tablist">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          role="tab"
          class="app-segment !px-2.5 !py-1 text-xs"
          :class="{ 'app-segment-active': tab.id === selectedTab }"
          :aria-selected="tab.id === selectedTab"
          @click="selectedTab = tab.id">
          {{ tab.label }}
        </button>
      </div>
    </div>

    <MockChart :tab="tabs.find((t) => t.id === selectedTab)?.label ?? selectedTab" />
  </div>
</template>
