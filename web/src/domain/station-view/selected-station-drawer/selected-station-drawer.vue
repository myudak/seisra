<script setup lang="ts">
import { SidePanel } from '@src/components/side-panel'
import useGetStationWaveformStatus from '@src/hooks/use-get-station-waveform-status'
import { Station } from '@src/types/station'
import { computed } from 'vue'

import { SelectedStationWaveformList } from '../selected-station-waveform-list'

const { station } = defineProps<{
  station: Station
}>()

const { data } = useGetStationWaveformStatus(station._id)
const stationStatus = computed(() => data.value?.data)

// Helper to safely format numeric values with fallback
const fmt = (v: number | null | undefined, unit: string, digits = 2) => {
  if (v === undefined || v === null || Number.isNaN(v)) return '-'
  return `${v.toFixed(digits)} ${unit}`.trim()
}

const qualityParameters = computed(() => [
  { label: 'Delay', value: fmt(stationStatus.value?.delay_second, 's') },
  { label: 'RMS', value: fmt(stationStatus.value?.rms, '') },
  { label: 'Amplitudo spike', value: fmt(stationStatus.value?.spike_amplitude, '') },
  { label: 'Jumlah spike', value: fmt(stationStatus.value?.spikes_count, '', 0) },
  { label: 'Interval spike', value: fmt(stationStatus.value?.spikes_interval, 'ms') },
  { label: 'Kualitas timing', value: fmt(stationStatus.value?.timing_quality, '%') }
])

const groundMotions = computed(() => [
  { label: 'Percepatan', value: fmt(stationStatus.value?.acceleration, 'µm/s²') },
  { label: 'Kecepatan', value: fmt(stationStatus.value?.velocity, 'µm/s') },
  { label: 'Perpindahan', value: fmt(stationStatus.value?.displacement, 'µm') }
])

const location = computed(
  () => `${station.latitude.toFixed(3)}, ${station.longitude.toFixed(3)} · ${station.elevation} m`
)

const emit = defineEmits<{
  (e: 'close'): void
}>()
</script>

<template>
  <SidePanel :title="station.code" :subtitle="`${station.network} · ${station.name}`" @close="emit('close')">
    <template #meta>
      <div class="mt-1.5 flex flex-wrap gap-1.5">
        <span class="app-chip">{{ location }}</span>
        <span class="app-chip">{{ station.channel.join(' · ') }}</span>
      </div>
    </template>

    <div id="selected-station-drawer" class="flex flex-col">
      <div class="grid gap-4 border-b border-base-300 px-4 py-3 sm:grid-cols-2">
        <section>
          <h3 class="app-section-title mb-2">Kualitas data</h3>
          <dl class="app-dl">
            <template v-for="item in qualityParameters" :key="item.label">
              <dt>{{ item.label }}</dt>
              <dd>{{ item.value }}</dd>
            </template>
          </dl>
        </section>
        <section>
          <h3 class="app-section-title mb-2">Gerakan tanah</h3>
          <dl class="app-dl">
            <template v-for="item in groundMotions" :key="item.label">
              <dt>{{ item.label }}</dt>
              <dd>{{ item.value }}</dd>
            </template>
          </dl>
        </section>
      </div>

      <section class="py-3">
        <h3 class="app-section-title mb-2 px-4">Waveform langsung</h3>
        <SelectedStationWaveformList :station="station" />
      </section>
    </div>
  </SidePanel>
</template>
