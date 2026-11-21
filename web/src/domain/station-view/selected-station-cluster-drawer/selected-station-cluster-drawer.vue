<script setup lang="ts">
import { SidePanel } from '@src/components/side-panel'
import { Station } from '@src/types/station'
import { computed, defineEmits, defineProps, ref } from 'vue'

defineEmits<{
  (e: 'close'): void
  (e: 'select-channel', station: Station): void
}>()

const { stations } = defineProps<{
  stations: Station[]
}>()

const keyword = ref('')

const sortedStations = computed(() => [...stations].sort((a, b) => (a.name < b.name ? -1 : 1)))
const filteredStations = computed(() => {
  if (!keyword.value) {
    return sortedStations.value
  }
  return sortedStations.value.filter((station) => {
    const q = keyword.value.toLowerCase().trim()
    return station.code.toLowerCase().includes(q) || station.name.toLowerCase().includes(q)
  })
})
</script>

<template>
  <SidePanel title="Stasiun di area ini" :subtitle="`${stations.length} stasiun berdekatan`" @close="$emit('close')">
    <div class="border-b border-base-300 p-3">
      <label class="input input-sm input-bordered flex h-9 items-center gap-2 bg-base-100">
        <v-icon name="fa-search" scale="0.75" class="text-base-content/50" />
        <input id="cluster-search" v-model="keyword" class="grow" placeholder="Cari stasiun" />
      </label>
    </div>
    <ul class="p-1.5">
      <li v-for="station in filteredStations" :key="station._id">
        <button
          class="flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left hover:bg-base-200/70"
          @click="$emit('select-channel', station)">
          <span class="font-mono text-sm font-semibold text-base-content">{{ station.code }}</span>
          <span class="min-w-0 flex-1 truncate text-sm text-base-content/70">{{ station.name }}</span>
          <v-icon name="ri-arrow-right-s-line" class="text-base-content/40" />
        </button>
      </li>
    </ul>
  </SidePanel>
</template>
