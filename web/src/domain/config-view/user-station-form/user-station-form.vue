<script setup lang="ts">
import { getStationListAPI } from '@src/api-service/station'
import { GetStationListQuery } from '@src/api-service/station/types'
import { Input } from '@src/components/input/input'
import { Station } from '@src/types/station'
import { useDebounceFn, useInfiniteScroll } from '@vueuse/core'
import { ref, watch } from 'vue'
import { onMounted } from 'vue'

const emit = defineEmits<{
  (e: 'onCancel', value: null): void
  (e: 'onSubmit', value: string[]): void
}>()

const props = defineProps<{
  isLoading: boolean
  userStation?: string[]
}>()

const stationWrapperRef = ref<HTMLElement | null>(null)
const searchQuery = ref('')
const fetchQuery = ref<GetStationListQuery>({ page: 1, limit: 10 })
const userDataStations = ref<string[]>([''])
const availableStations = ref<Station[] | []>([])
const totalData = ref(0)

useInfiniteScroll(
  stationWrapperRef,
  () => {
    onLoadMore()
  },
  { distance: 10 }
)

const debouncedSearch = useDebounceFn(() => {
  fetchStations()
}, 500)

watch(
  () => props.userStation,
  (newValue) => {
    userDataStations.value = newValue as string[]
  }
)

watch(
  () => searchQuery.value,
  (newValue) => {
    console
    availableStations.value = []
    fetchQuery.value = { ...fetchQuery.value, page: 1, q: newValue }
    debouncedSearch()
  }
)

onMounted(() => {
  fetchStations()
})

function fetchStations() {
  const isRealAPI = false
  getStationListAPI(isRealAPI, fetchQuery.value).then(({ data, total }) => {
    totalData.value = total as number
    data.forEach((item: Station) => availableStations.value.push(item as never))
  })
}

function onLoadMore() {
  if (availableStations.value.length < totalData.value) {
    fetchQuery.value = { ...fetchQuery.value, page: fetchQuery.value.page + 1 }
    fetchStations()
  }
}

function onToggleChange(stationId: string) {
  const isExistOnList = userDataStations.value.find((id) => id === stationId)

  if (isExistOnList) {
    userDataStations.value = userDataStations.value.filter((id) => id !== stationId)
  } else {
    userDataStations.value.push(stationId)
  }
}

function onSubmitForm() {
  emit('onSubmit', userDataStations.value)
}
</script>
<template>
  <div class="flex flex-col gap-3">
    <div>
      <h3 class="text-lg font-semibold">Stasiun pengguna</h3>
      <p class="mt-1 text-sm text-base-content/60">Stasiun yang dapat dipantau oleh pengguna ini.</p>
    </div>
    <Input v-model="searchQuery" icon="fa-search" placeholder="Cari stasiun…" />
    <div ref="stationWrapperRef" class="flex h-96 flex-col overflow-y-auto rounded-lg border border-base-300">
      <label
        v-for="station in availableStations"
        :key="station._id"
        class="flex cursor-pointer items-center justify-between border-b border-base-300/70 px-3 py-2 last:border-b-0 hover:bg-base-200/60">
        <span class="font-mono text-sm font-semibold text-base-content">{{ station.code }}</span>
        <input
          type="checkbox"
          class="toggle toggle-primary toggle-sm"
          :checked="userDataStations?.includes(station._id)"
          @change="onToggleChange(station.code)" />
      </label>
    </div>
    <p class="text-sm text-base-content/60">{{ userDataStations.length }} stasiun dipilih</p>
    <div class="mt-2 flex justify-end gap-2 border-t border-base-300 pt-4">
      <button class="btn btn-ghost btn-sm h-10" @click="emit('onCancel', null)">Batal</button>
      <button class="btn btn-primary btn-sm h-10 px-5" :disabled="isLoading" @click="onSubmitForm">
        <span v-if="isLoading" class="loading loading-spinner loading-xs" />
        Simpan
      </button>
    </div>
  </div>
</template>
