<script setup lang="ts">
import { getAllEventListAPI } from '@src/api-service/event'
import { GetAllEventListQuery } from '@src/api-service/event/types'
import { DateFilter } from '@src/components/date-filter'
import { EmptyState } from '@src/components/empty-state'
import { EventListTable } from '@src/components/event-list-table'
import { PageHeader } from '@src/components/page-header'
import { EarthQuakeEvent } from '@src/types/event'
import { endOfDay, startOfDay, subWeeks } from 'date-fns'
import { computed, ref, watch } from 'vue'

const page = ref(1)
const totalPerPage = ref(1000)
const dateRange = ref({
  start: startOfDay(subWeeks(new Date(), 1)),
  end: endOfDay(new Date())
})
const startDate = computed(() => dateRange.value.start.toISOString())
const endDate = computed(() => dateRange.value.end.toISOString())
const data = ref<EarthQuakeEvent[]>([])
const isLoading = ref(true)
const keyword = ref('')

const params = computed(() => ({
  page: page.value,
  totalPerPage: totalPerPage.value,
  startDate: startDate.value,
  endDate: endDate.value
}))
const eventList = computed(() => {
  const q = keyword.value.trim().toLowerCase()
  const list = data.value ?? []
  if (!q) return list
  return list.filter((e) =>
    [e.name, e.region, e.sub_region, e.country].some((v) => v?.toLowerCase().includes(q))
  )
})

const fetchEventList = (newParams: GetAllEventListQuery) => {
  isLoading.value = true
  getAllEventListAPI(newParams)
    .then((response) => {
      data.value = response.data
    })
    .catch((err) => {
      console.error('[EventTab] Failed to fetch events:', err)
      data.value = []
    })
    .finally(() => {
      isLoading.value = false
    })
}

watch(
  params,
  (newParams) => {
    fetchEventList(newParams)
  },
  { immediate: true, deep: true }
)
</script>

<template>
  <PageHeader
    title="Origin Locator"
    description="Pilih kejadian untuk meninjau lokasi dan magnitudo, mengoreksi fase P/S, lalu commit hasil relokasinya."
    :breadcrumbs="[{ label: 'Beranda', to: '/' }, { label: 'Origin Locator' }]" />

  <section class="app-card overflow-hidden">
    <div class="flex flex-col gap-3 border-b border-base-300 p-4 md:flex-row md:items-center md:justify-between">
      <div class="flex flex-wrap items-center gap-3">
        <DateFilter v-model:range="dateRange" />
        <span class="text-sm text-base-content/60">
          {{ eventList.length }} kejadian<template v-if="keyword"> cocok</template>
        </span>
      </div>
      <label class="input input-sm input-bordered flex h-9 items-center gap-2 bg-base-100 md:w-72">
        <v-icon name="fa-search" scale="0.75" class="text-base-content/50" />
        <input id="event-search" v-model="keyword" class="grow" placeholder="Cari wilayah atau event ID" />
      </label>
    </div>

    <EmptyState v-if="isLoading && !data.length" title="Memuat kejadian…" loading />
    <EmptyState
      v-else-if="!eventList.length"
      :title="keyword ? 'Tidak ada yang cocok' : 'Tidak ada kejadian'"
      :description="
        keyword
          ? 'Coba kata kunci lain atau hapus pencarian.'
          : 'Belum ada kejadian pada rentang tanggal ini. Coba perluas rentangnya.'
      "
      icon="la-dot-circle" />
    <div v-else class="max-h-[calc(100dvh-300px)] overflow-auto">
      <EventListTable :events="eventList" />
    </div>
  </section>
</template>
