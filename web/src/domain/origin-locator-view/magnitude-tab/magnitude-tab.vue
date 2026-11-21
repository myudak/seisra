<script setup lang="ts">
import { EarthQuakeEvent } from '@src/types/event'
import { Magnitude } from '@src/types/magnitude'
import { computed, ref, watch } from 'vue'

import { MagnitudeDetail } from '../magnitude-detail'
import { MagnitudeList } from '../magnitude-list'

const { event } = defineProps<{
  event: EarthQuakeEvent
}>()

const selectedMagnitudeIndex = ref('')

const { magnitudes } = event
const magnitudeList = computed(() =>
  magnitudes.reduce(
    (prev, magnitude) => {
      if (!prev[magnitude.type]) {
        prev[magnitude.type] = [magnitude]
      } else {
        prev[magnitude.type].push(magnitude)
      }
      return prev
    },
    {} as Record<string, Magnitude[]>
  )
)
const magnitudeTypes = computed(() => Object.keys(magnitudeList.value))
const selectedMagnitudes = computed(() => magnitudeList.value[selectedMagnitudeIndex.value])

watch(
  magnitudeTypes,
  (newMagnitudeTypes) => {
    if (newMagnitudeTypes.length > 0) {
      selectedMagnitudeIndex.value = newMagnitudeTypes[0]
    }
  },
  { immediate: true }
)
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-wrap items-center gap-3">
      <span class="text-sm text-base-content/60">Jenis magnitudo</span>
      <div class="app-segmented" role="tablist">
        <button
          v-for="magnitudeType in magnitudeTypes"
          :key="magnitudeType"
          role="tab"
          class="app-segment"
          :class="{ 'app-segment-active': magnitudeType === selectedMagnitudeIndex }"
          :aria-selected="magnitudeType === selectedMagnitudeIndex"
          @click="selectedMagnitudeIndex = magnitudeType">
          {{ magnitudeType }}
          <span class="text-xs text-base-content/50">{{ magnitudeList[magnitudeType].length }}</span>
        </button>
      </div>
    </div>

    <div v-if="!magnitudeTypes.length" class="app-card px-4 py-10 text-center text-sm text-base-content/60">
      Kejadian ini belum punya magnitudo.
    </div>

    <div v-else class="grid gap-4 lg:grid-cols-12">
      <MagnitudeDetail
        v-if="selectedMagnitudes?.length"
        :key="selectedMagnitudeIndex"
        class="lg:col-span-8"
        :event="event"
        :magnitudes="selectedMagnitudes" />
      <section class="app-card overflow-hidden lg:col-span-4">
        <h2 class="app-section-title border-b border-base-300 px-4 py-3">Nilai {{ selectedMagnitudeIndex }}</h2>
        <MagnitudeList :magnitudes="selectedMagnitudes ?? []" />
      </section>
    </div>
  </div>
</template>
