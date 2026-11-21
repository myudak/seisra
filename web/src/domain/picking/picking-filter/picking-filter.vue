<script setup lang="ts">
import { OrderPhaseType } from '@src/types/waveform'

defineProps<{
  orderPhase: OrderPhaseType
}>()

defineEmits<{
  (e: 'close'): void
  (e: 'change-order-phase', phase: OrderPhaseType): void
  (e: 'confirm'): void
}>()

const phase = defineModel<string>('phase')
</script>

<template>
  <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
    <div class="flex flex-wrap items-center gap-x-4 gap-y-2">
      <div class="flex items-center gap-2">
        <span class="text-xs text-base-content/60">Urutkan</span>
        <div class="app-segmented">
          <button
            v-for="option in (['OT', 'P', 'S'] as const)"
            :key="option"
            class="app-segment !px-2.5 !py-1 text-xs"
            :class="{ 'app-segment-active': orderPhase === option }"
            :title="option === 'OT' ? 'Waktu asal' : `Arrival ${option}`"
            @click="$emit('change-order-phase', option)">
            {{ option }}
          </button>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <span class="text-xs text-base-content/60">Fase yang diedit</span>
        <div class="app-segmented">
          <button
            v-for="option in ['P', 'S']"
            :key="option"
            class="app-segment !px-2.5 !py-1 text-xs"
            :class="{ 'app-segment-active': phase === option }"
            @click="phase = option">
            {{ option }}
          </button>
        </div>
      </div>

      <div class="flex items-center gap-2" title="Filter dan pilihan komponen belum tersedia">
        <span class="text-xs text-base-content/60">Komponen</span>
        <div class="app-segmented">
          <span class="app-segment app-segment-active app-segment-disabled !px-2.5 !py-1 text-xs">Z</span>
          <span class="app-segment app-segment-disabled !px-2.5 !py-1 text-xs">N</span>
          <span class="app-segment app-segment-disabled !px-2.5 !py-1 text-xs">E</span>
        </div>
      </div>
    </div>

    <div class="flex items-center justify-end gap-2">
      <button class="btn btn-sm btn-ghost" @click="$emit('close')">Batal</button>
      <button class="btn btn-sm btn-primary" @click="$emit('confirm')">
        <v-icon name="io-checkmark" /> Simpan koreksi
      </button>
    </div>
  </div>
</template>
