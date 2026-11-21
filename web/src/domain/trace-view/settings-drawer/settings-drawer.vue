<script setup lang="ts">
import { SidePanel } from '@src/components/side-panel'

const NO_CHANNEL_OPTIONS = [5, 10, 15, 20, 30, 40, 50]
const FILTER_CONFIG_OPTIONS = [
  {
    low: 0.7,
    high: 2
  },
  {
    low: 1,
    high: 3
  },
  {
    low: 2,
    high: 4
  },
  {
    low: 4,
    high: 8
  }
]

interface FilterConfig {
  low: number
  high: number
}

defineProps<{
  maxChannels: number
  open: boolean
  filterConfig?: FilterConfig
}>()

const emit = defineEmits<{
  (e: 'change-max-channels', value: number): void
  (e: 'change-filter-config', filterConfig?: FilterConfig): void
  (e: 'close'): void
}>()

const onChange = (event: Event) => {
  emit('change-max-channels', Number((event.target as HTMLSelectElement).value))
}
</script>

<template>
  <SidePanel title="Tampilan trace" subtitle="Jumlah kanal dan filter bandpass" @close="emit('close')">
    <div class="flex flex-col gap-5 p-4">
      <label class="form-control w-full">
        <span class="mb-1.5 text-sm font-medium text-base-content">Kanal per layar</span>
        <select
          id="trace-max-channels"
          class="select select-bordered select-sm w-full"
          :value="maxChannels"
          @change="onChange($event)">
          <option v-for="option in NO_CHANNEL_OPTIONS" :key="option" :value="option">{{ option }} kanal</option>
        </select>
        <span class="mt-1 text-xs text-base-content/55">Tinggi tiap trace menyesuaikan jumlah kanal.</span>
      </label>

      <fieldset class="flex flex-col gap-1">
        <legend class="mb-1.5 text-sm font-medium text-base-content">Filter bandpass</legend>
        <label class="flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 hover:bg-base-200/70">
          <span class="text-sm">Tanpa filter</span>
          <input
            type="radio"
            name="trace-filter"
            class="radio radio-primary radio-sm"
            :checked="!filterConfig"
            @change="emit('change-filter-config')" />
        </label>
        <label
          v-for="option in FILTER_CONFIG_OPTIONS"
          :key="option.low"
          class="flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 hover:bg-base-200/70">
          <span class="text-sm tabular-nums">{{ option.low }}–{{ option.high }} Hz</span>
          <input
            type="radio"
            name="trace-filter"
            class="radio radio-primary radio-sm"
            :checked="filterConfig?.low === option.low"
            @change="emit('change-filter-config', option)" />
        </label>
      </fieldset>
    </div>
  </SidePanel>
</template>
