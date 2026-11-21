<script setup lang="ts">
type Status = 'ENABLED' | 'DISABLED'

defineProps<{
  status: Status
  page: number
  limit: number
  totalPage: number
  totalEnabled: number
  totalDisabled: number
  filterConfig?: { low: number; high: number }
  isSettingsOpen?: boolean
}>()

defineEmits<{
  (e: 'change-status', newStatus: Status): void
  (e: 'change-limit', newLimit: number): void
  (e: 'next-page'): void
  (e: 'prev-page'): void
  (e: 'open-settings'): void
  (e: 'open-map'): void
}>()
</script>

<template>
  <div class="flex flex-wrap items-center justify-between gap-3 border-b border-base-300 bg-base-100 px-4 py-2.5">
    <div class="flex flex-wrap items-center gap-3">
      <div class="flex items-center gap-2">
        <h1 class="text-base font-semibold text-base-content">Trace</h1>
        <span class="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success">
          <span class="h-1.5 w-1.5 animate-pulse rounded-full bg-success" /> Live
        </span>
      </div>
      <div class="app-segmented" role="tablist" aria-label="Status stasiun">
        <button
          role="tab"
          class="app-segment !py-1"
          :class="{ 'app-segment-active': status === 'ENABLED' }"
          :aria-selected="status === 'ENABLED'"
          @click="$emit('change-status', 'ENABLED')">
          Aktif <span class="tabular-nums text-base-content/50">{{ totalEnabled }}</span>
        </button>
        <button
          role="tab"
          class="app-segment !py-1"
          :class="{ 'app-segment-active': status === 'DISABLED' }"
          :aria-selected="status === 'DISABLED'"
          @click="$emit('change-status', 'DISABLED')">
          Nonaktif <span class="tabular-nums text-base-content/50">{{ totalDisabled }}</span>
        </button>
      </div>
      <span class="app-chip" title="Filter bandpass waveform">
        <v-icon name="la-filter-solid" scale="0.75" />
        {{ filterConfig ? `${filterConfig.low}–${filterConfig.high} Hz` : 'Tanpa filter' }}
      </span>
    </div>

    <div class="flex items-center gap-2">
      <div v-if="totalPage > 1" class="flex items-center gap-1 text-sm text-base-content/70">
        <button
          class="btn btn-ghost btn-sm btn-square"
          :disabled="page <= 1"
          aria-label="Halaman sebelumnya"
          @click="$emit('prev-page')">
          <v-icon name="ri-arrow-left-s-line" />
        </button>
        <span class="tabular-nums">{{ page }} / {{ totalPage }}</span>
        <button
          class="btn btn-ghost btn-sm btn-square"
          :disabled="page >= totalPage"
          aria-label="Halaman berikutnya"
          @click="$emit('next-page')">
          <v-icon name="ri-arrow-right-s-line" />
        </button>
      </div>
      <button class="btn btn-sm btn-ghost border-base-300" @click="$emit('open-map')">
        <v-icon name="ri-base-station-line" scale="0.9" /> <span class="max-sm:hidden">Peta stasiun</span>
      </button>
      <button
        class="btn btn-sm btn-ghost border-base-300"
        :class="{ 'btn-active': isSettingsOpen }"
        @click="$emit('open-settings')">
        <v-icon name="ri-settings-3-line" scale="0.9" /> <span class="max-sm:hidden">Tampilan</span>
      </button>
    </div>
  </div>
</template>
