<script setup lang="ts">
import useGetProfile from '@src/hooks/use-get-profile'
import useGetStationList from '@src/hooks/use-get-station-list'
import useRecentEvents, { originMs, RECENT_EVENT_DAYS } from '@src/hooks/use-recent-events'
import { formatMagnitude, formatTimeUTC, getDisplayMagnitude } from '@src/utils/string'
import { useNow } from '@vueuse/core'
import { computed } from 'vue'

import { ActivityChart } from '../activity-chart'
import { HOMEPAGE_MENUS } from '../constants'
import { LatestEventCard } from '../latest-event-card'
import { MenuBox } from '../menu-box'
import { RecentFeed } from '../recent-feed'

const { data: profile } = useGetProfile()
const { data: recentEvents, isLoading: isEventsLoading, dataUpdatedAt } = useRecentEvents()
const { data: stationResponse } = useGetStationList(true)
const now = useNow({ interval: 30_000 })

const greeting = computed(() => {
  const hour = now.value.getHours()
  if (hour < 11) return 'Selamat pagi'
  if (hour < 15) return 'Selamat siang'
  if (hour < 19) return 'Selamat sore'
  return 'Selamat malam'
})

const events = computed(() => recentEvents.value ?? [])
const latest = computed(() => events.value[0] ?? null)
const last24h = computed(() => events.value.filter((e) => now.value.getTime() - originMs(e) <= 86_400_000))
const strongest = computed(() =>
  events.value.reduce<(typeof events.value)[number] | null>((best, e) => {
    const m = getDisplayMagnitude(e.magnitudes)?.value ?? -Infinity
    const b = best ? getDisplayMagnitude(best.magnitudes)?.value ?? -Infinity : -Infinity
    return m > b ? e : best
  }, null)
)
const shallowCount = computed(() => events.value.filter((e) => e.depth < 70).length)

const stations = computed(() => stationResponse.value?.data ?? [])
const inactiveStations = computed(() => {
  const disabled = new Set(profile.value?.disable_stations ?? [])
  return stations.value.filter((s) => s.status === 'disabled' || disabled.has(s._id)).length
})

const updatedLabel = computed(() => (dataUpdatedAt.value ? formatTimeUTC(new Date(dataUpdatedAt.value)) : null))

const tiles = computed(() => [
  {
    label: 'Gempa 24 jam',
    value: String(last24h.value.length),
    hint: `${events.value.length} dalam ${RECENT_EVENT_DAYS} hari`,
    icon: 'la-dot-circle'
  },
  {
    label: `Terbesar ${RECENT_EVENT_DAYS} hari`,
    value: strongest.value
      ? `M ${formatMagnitude(getDisplayMagnitude(strongest.value.magnitudes)?.value)}`
      : '-',
    hint: strongest.value ? [strongest.value.sub_region, strongest.value.region].filter(Boolean).join(', ') : 'Belum ada data',
    icon: 'ri-pulse-line'
  },
  {
    label: 'Gempa dangkal',
    value: String(shallowCount.value),
    hint: '< 70 km, 7 hari',
    icon: 'ri-focus-3-line'
  },
  {
    label: 'Stasiun aktif',
    value: stations.value.length ? `${stations.value.length - inactiveStations.value}/${stations.value.length}` : '-',
    hint: inactiveStations.value ? `${inactiveStations.value} nonaktif` : 'Semua stasiun aktif',
    icon: 'ri-base-station-line'
  }
])
</script>

<template>
  <div class="app-page flex flex-col gap-6">
    <header class="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-base-content md:text-[28px]">
          {{ greeting }}<template v-if="profile?.username">, {{ profile.username }}</template>
        </h1>
        <p class="mt-1 text-sm text-base-content/60">Ringkasan aktivitas gempa dan jaringan stasiun Indonesia.</p>
      </div>
      <div class="flex items-center gap-3 text-xs text-base-content/60">
        <span class="inline-flex items-center gap-1.5 tabular-nums">
          <v-icon name="ri-time-line" scale="0.8" /> {{ formatTimeUTC(now) }} UTC
        </span>
        <span v-if="updatedLabel" class="inline-flex items-center gap-1.5">
          <span class="h-1.5 w-1.5 rounded-full bg-success" /> Data {{ updatedLabel }} UTC
        </span>
      </div>
    </header>

    <!-- Key figures -->
    <section class="grid grid-cols-2 gap-3 lg:grid-cols-4" aria-label="Ringkasan">
      <div v-for="tile in tiles" :key="tile.label" class="app-card flex flex-col gap-1 p-4">
        <div class="flex items-center justify-between gap-2 text-xs font-medium text-base-content/60">
          <span>{{ tile.label }}</span>
          <v-icon :name="tile.icon" scale="0.85" class="text-base-content/35" />
        </div>
        <div class="text-2xl font-bold tabular-nums tracking-tight text-base-content">{{ tile.value }}</div>
        <div class="truncate text-xs text-base-content/55" :title="tile.hint">{{ tile.hint }}</div>
      </div>
    </section>

    <!-- Latest event + activity | recent feed -->
    <div class="grid gap-4 lg:grid-cols-3">
      <div class="flex min-w-0 flex-col gap-4 lg:col-span-2">
        <LatestEventCard v-if="latest" :key="latest._id" :event="latest" :now="now" />
        <div v-else class="app-card px-5 py-10 text-center text-sm text-base-content/60">
          {{ isEventsLoading ? 'Memuat gempa terbaru…' : 'Belum ada gempa dalam 7 hari terakhir.' }}
        </div>
        <ActivityChart :events="events" :days="RECENT_EVENT_DAYS" :now="now" />
      </div>
      <RecentFeed class="lg:max-h-[640px]" :events="events.slice(0, 12)" :now="now" :loading="isEventsLoading" />
    </div>

    <!-- Modules -->
    <section class="flex flex-col gap-3" aria-label="Modul">
      <h2 class="app-section-title">Modul</h2>
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <MenuBox v-for="menu in HOMEPAGE_MENUS" :key="menu.url" :menu="menu" />
      </div>
    </section>
  </div>
</template>
