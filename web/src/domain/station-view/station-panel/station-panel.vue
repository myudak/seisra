<script setup lang="ts">
// Left-hand station roster on the Stations map: network health at a glance, then a searchable list.
import { EmptyState } from '@src/components/empty-state'
import { Station } from '@src/types/station'
import { computed, ref } from 'vue'

const props = defineProps<{
  stations: Station[]
  disabledIds: string[]
  /** `${network}-${code}` of stations with a pick in the last 30 s */
  pickedKeys: string[]
  selectedId?: string | null
  loading?: boolean
}>()

defineEmits<{
  (e: 'select', station: Station): void
  (e: 'collapse'): void
}>()

type Filter = 'all' | 'active' | 'inactive' | 'picked'

const keyword = ref('')
const filter = ref<Filter>('all')

const keyOf = (station: Station) => `${station.network}-${station.code}`
const isInactive = (station: Station) => station.status === 'disabled' || props.disabledIds.includes(station._id)
const isPicked = (station: Station) => props.pickedKeys.includes(keyOf(station))

const counts = computed(() => {
  const inactive = props.stations.filter(isInactive).length
  return {
    all: props.stations.length,
    active: props.stations.length - inactive,
    inactive,
    picked: props.stations.filter(isPicked).length
  }
})

const FILTERS: Array<{ id: Filter; label: string }> = [
  { id: 'all', label: 'Semua' },
  { id: 'active', label: 'Aktif' },
  { id: 'inactive', label: 'Nonaktif' },
  { id: 'picked', label: 'Ada pick' }
]

const visible = computed(() => {
  const q = keyword.value.trim().toLowerCase()
  return [...props.stations]
    .sort((a, b) => Number(isPicked(b)) - Number(isPicked(a)) || a.code.localeCompare(b.code))
    .filter((s) => {
      if (filter.value === 'active' && isInactive(s)) return false
      if (filter.value === 'inactive' && !isInactive(s)) return false
      if (filter.value === 'picked' && !isPicked(s)) return false
      return !q || s.code.toLowerCase().includes(q) || s.name.toLowerCase().includes(q)
    })
})
</script>

<template>
  <section class="app-float flex min-h-0 flex-col" aria-label="Jaringan stasiun">
    <header class="flex flex-col gap-3 border-b border-base-300 p-4">
      <div class="flex items-start justify-between gap-2">
        <div>
          <h1 class="text-base font-semibold text-base-content">Jaringan stasiun</h1>
          <p class="text-xs text-base-content/60">{{ counts.active }} aktif dari {{ counts.all }} stasiun</p>
        </div>
        <button class="btn btn-ghost btn-sm btn-square text-base-content/60" aria-label="Sembunyikan daftar" @click="$emit('collapse')">
          <v-icon name="ri-arrow-left-s-line" class="max-md:rotate-[-90deg]" />
        </button>
      </div>

      <div class="grid grid-cols-3 gap-2 text-center">
        <div class="rounded-lg border border-base-300 px-2 py-1.5">
          <div class="text-lg font-semibold tabular-nums text-success">{{ counts.active }}</div>
          <div class="text-[11px] text-base-content/60">Aktif</div>
        </div>
        <div class="rounded-lg border border-base-300 px-2 py-1.5">
          <div class="text-lg font-semibold tabular-nums text-base-content/70">{{ counts.inactive }}</div>
          <div class="text-[11px] text-base-content/60">Nonaktif</div>
        </div>
        <div class="rounded-lg border border-base-300 px-2 py-1.5">
          <div class="text-lg font-semibold tabular-nums text-warning">{{ counts.picked }}</div>
          <div class="text-[11px] text-base-content/60">Pick 30 dtk</div>
        </div>
      </div>

      <label class="input input-sm input-bordered flex h-9 items-center gap-2 bg-base-100">
        <v-icon name="fa-search" scale="0.75" class="text-base-content/50" />
        <input id="station-search" v-model="keyword" class="grow" placeholder="Cari kode atau nama stasiun" />
      </label>

      <div class="app-segmented w-full">
        <button
          v-for="f in FILTERS"
          :key="f.id"
          class="app-segment flex-1 justify-center !px-2 text-xs"
          :class="{ 'app-segment-active': filter === f.id }"
          @click="filter = f.id">
          {{ f.label }}
        </button>
      </div>
    </header>

    <EmptyState v-if="loading && !stations.length" title="Memuat stasiun…" loading />
    <EmptyState
      v-else-if="!visible.length"
      title="Tidak ada stasiun"
      description="Tidak ada stasiun yang cocok dengan pencarian atau filter ini."
      icon="ri-base-station-line" />

    <ul v-else class="min-h-0 flex-1 overflow-y-auto p-1.5">
      <li v-for="station in visible" :id="keyOf(station)" :key="station._id">
        <button
          class="flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-base-200/70"
          :class="{ 'bg-primary/10 hover:bg-primary/15': selectedId === station._id }"
          @click="$emit('select', station)">
          <span
            class="h-2.5 w-2.5 shrink-0 rounded-full"
            :class="isPicked(station) ? 'animate-pulse bg-warning' : isInactive(station) ? 'bg-base-content/30' : 'bg-success'"
            :aria-label="isPicked(station) ? 'Ada pick' : isInactive(station) ? 'Nonaktif' : 'Aktif'" />
          <span class="min-w-0 flex-1">
            <span class="flex items-baseline gap-2">
              <span class="font-mono text-sm font-semibold text-base-content">{{ station.code }}</span>
              <span class="text-xs text-base-content/50">{{ station.network }}</span>
            </span>
            <span class="block truncate text-xs text-base-content/60">{{ station.name }}</span>
          </span>
          <span class="shrink-0 text-xs text-base-content/50">{{ station.channel.length }} kanal</span>
        </button>
      </li>
    </ul>
  </section>
</template>
