<script setup lang="ts">
import { getEventDetailAPI } from '@src/api-service/event'
import { EmptyState } from '@src/components/empty-state'
import { PickingPage } from '@src/domain/picking/picking-page'
import { EarthQuakeEvent } from '@src/types/event'
import { getDepthColor } from '@src/utils/event'
import {
  formatDateTimeUTC,
  formatDepth,
  formatMagnitude,
  getDisplayMagnitude,
  getOriginTimeFromEvent
} from '@src/utils/string'
import { computed, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

import { EventTab } from '../event-tab'
import { LocationDetail } from '../location-detail'
import { MagnitudeTab } from '../magnitude-tab'
import { TabList } from '../tab-list'

const route = useRoute()

const id = computed(() => route.params.id as string | undefined)
const selectedTab = computed(() => (route.params.tab as string | undefined) ?? 'events')
const data = ref<EarthQuakeEvent | null>(null)
const isLoading = ref(false)
const loadError = ref(false)

const magnitude = computed(() => (data.value ? getDisplayMagnitude(data.value.magnitudes) : undefined))
const stationCount = computed(
  () => new Set((data.value?.arrivals ?? []).map((a) => a.station_details?._id ?? a.pick_details?.station_id)).size
)
const title = computed(() =>
  data.value ? [data.value.sub_region, data.value.region].filter(Boolean).join(', ') || data.value.name : ''
)

watch(
  id,
  (newId) => {
    if (!newId) {
      data.value = null
      return
    }
    isLoading.value = true
    loadError.value = false
    getEventDetailAPI(newId)
      .then((response) => {
        data.value = response
      })
      .catch(() => {
        data.value = null
        loadError.value = true
      })
      .finally(() => {
        isLoading.value = false
      })
  },
  { immediate: true }
)
</script>

<template>
  <!-- Event list: entry point of the Locator -->
  <div v-if="selectedTab === 'events'" class="app-page">
    <EventTab />
  </div>

  <!-- One event: header, tabs, then the selected analysis -->
  <div v-else class="app-page flex flex-col gap-5">
    <header class="flex flex-col gap-4">
      <nav class="flex flex-wrap items-center gap-1.5 text-sm text-base-content/60" aria-label="Breadcrumb">
        <RouterLink to="/origin-locator-view/events" class="inline-flex items-center gap-1 hover:text-base-content">
          <v-icon name="ri-arrow-left-line" scale="0.85" /> Origin Locator
        </RouterLink>
        <span class="text-base-content/30">/</span>
        <span class="truncate font-medium text-primary">{{ data?.name ?? id }}</span>
      </nav>

      <div v-if="data" class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div class="flex min-w-0 items-center gap-4">
          <div
            class="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl border border-base-300 bg-base-100 leading-none shadow-sm">
            <span class="text-xl font-bold tabular-nums text-base-content">{{ formatMagnitude(magnitude?.value) ?? '-' }}</span>
            <span class="mt-0.5 text-[11px] text-base-content/50">{{ magnitude?.type }}</span>
          </div>
          <div class="min-w-0">
            <h1 class="truncate text-2xl font-bold tracking-tight text-base-content">{{ title }}</h1>
            <div class="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-base-content/60">
              <span class="inline-flex items-center gap-1.5">
                <v-icon name="ri-time-line" scale="0.85" /> {{ formatDateTimeUTC(getOriginTimeFromEvent(data)) }}
              </span>
              <span class="inline-flex items-center gap-1.5">
                <span class="h-2 w-2 rounded-full" :style="{ backgroundColor: getDepthColor(data.depth) }" />
                {{ formatDepth(data.depth) }} km
              </span>
              <span class="inline-flex items-center gap-1.5">
                <v-icon name="ri-base-station-line" scale="0.85" /> {{ stationCount }} stasiun
              </span>
            </div>
          </div>
        </div>
        <TabList :id="id ?? ''" :selected-tab="selectedTab" />
      </div>
    </header>

    <div v-if="isLoading" class="app-card">
      <EmptyState title="Memuat kejadian…" loading />
    </div>
    <div v-else-if="loadError || !data" class="app-card">
      <EmptyState
        title="Kejadian tidak ditemukan"
        description="Event ini tidak ada atau gagal dimuat. Kembali ke daftar kejadian dan pilih yang lain."
        icon="la-dot-circle">
        <RouterLink to="/origin-locator-view/events" class="btn btn-sm btn-primary mt-2">Ke daftar kejadian</RouterLink>
      </EmptyState>
    </div>
    <template v-else>
      <LocationDetail v-if="selectedTab === 'location'" :key="`loc-${data._id}`" :event="data" />
      <MagnitudeTab v-else-if="selectedTab === 'magnitude'" :key="`mag-${data._id}`" :event="data" />
      <PickingPage v-else-if="selectedTab === 'picking'" :key="`pick-${data._id}`" :event="data" />
    </template>
  </div>
</template>
