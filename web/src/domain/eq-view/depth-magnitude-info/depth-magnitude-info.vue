<script setup lang="ts">
// Map legend: marker colour = hypocentre depth, marker size = magnitude.
import { getDepthColor, getMagnitudeWidth } from '@src/utils/event'

const DEPTHS = [
  { label: '< 50', sample: 0 },
  { label: '50–100', sample: 50 },
  { label: '100–250', sample: 100 },
  { label: '250–600', sample: 250 },
  { label: '≥ 600', sample: 600 }
]
const MAGNITUDES = [3, 4, 5, 6, 7]
</script>

<template>
  <div class="app-float flex flex-col gap-2.5 p-3 text-xs text-base-content/80" aria-label="Legenda peta">
    <div>
      <div class="app-section-title mb-1.5 !text-[10px]">Kedalaman (km)</div>
      <div class="flex flex-wrap gap-x-3 gap-y-1">
        <span v-for="depth in DEPTHS" :key="depth.label" class="inline-flex items-center gap-1.5 tabular-nums">
          <span class="h-2.5 w-2.5 rounded-full ring-1 ring-black/20" :style="{ backgroundColor: getDepthColor(depth.sample) }" />
          {{ depth.label }}
        </span>
      </div>
    </div>
    <div>
      <div class="app-section-title mb-1.5 !text-[10px]">Magnitudo</div>
      <div class="flex items-end gap-3">
        <span v-for="magnitude in MAGNITUDES" :key="magnitude" class="inline-flex flex-col items-center gap-1 tabular-nums">
          <span
            class="rounded-full border-2 border-base-content/50"
            :style="{ width: `${getMagnitudeWidth(magnitude)}px`, height: `${getMagnitudeWidth(magnitude)}px` }" />
          {{ magnitude }}
        </span>
      </div>
    </div>
  </div>
</template>
