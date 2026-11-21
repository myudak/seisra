<script setup lang="ts">
import { EarthQuakeEvent } from '@src/types/event'
import { getDepthColor } from '@src/utils/event'
import {
  formatDateUTC,
  formatDepth,
  formatLatLon,
  formatMagnitude,
  formatTimeUTC,
  getDisplayMagnitude,
  getOriginTimeFromEvent,
  newISODate
} from '@src/utils/string'
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps<{
  events: EarthQuakeEvent[]
}>()

const router = useRouter()

const originMs = (event: EarthQuakeEvent) => {
  const origin = getOriginTimeFromEvent(event)
  return origin ? newISODate(origin).getTime() : 0
}

const sortedEvents = computed(() => [...props.events].sort((a, b) => originMs(b) - originMs(a)))

const openEvent = (event: EarthQuakeEvent) => {
  router.push(`/origin-locator-view/location/${event._id}`)
}
</script>

<template>
  <table class="app-table">
    <thead class="sticky top-0 z-10">
      <tr>
        <th>Waktu asal (UTC)</th>
        <th class="text-right">Mag</th>
        <th>Wilayah</th>
        <th class="text-right">Kedalaman</th>
        <th class="text-right max-md:hidden">Lintang</th>
        <th class="text-right max-md:hidden">Bujur</th>
        <th class="max-lg:hidden">Event ID</th>
      </tr>
    </thead>
    <tbody>
      <tr
        v-for="event in sortedEvents"
        :key="event._id"
        class="cursor-pointer"
        tabindex="0"
        @click="openEvent(event)"
        @keydown.enter="openEvent(event)">
        <td class="whitespace-nowrap">
          <div class="font-medium tabular-nums text-base-content">{{ formatTimeUTC(getOriginTimeFromEvent(event)) }}</div>
          <div class="text-xs text-base-content/55">{{ formatDateUTC(getOriginTimeFromEvent(event)) }}</div>
        </td>
        <td class="text-right">
          <span class="app-chip-primary tabular-nums">
            {{ formatMagnitude(getDisplayMagnitude(event.magnitudes)?.value) ?? '-' }}
            <span class="font-normal opacity-70">{{ getDisplayMagnitude(event.magnitudes)?.type }}</span>
          </span>
        </td>
        <td class="min-w-[180px]">
          <div class="font-medium text-base-content">{{ event.sub_region || event.region }}</div>
          <div class="text-xs text-base-content/55">{{ event.sub_region ? event.region : event.country }}</div>
        </td>
        <td class="whitespace-nowrap text-right tabular-nums">
          <span class="mr-1.5 inline-block h-2 w-2 rounded-full" :style="{ backgroundColor: getDepthColor(event.depth) }" />
          {{ formatDepth(event.depth) }} km
        </td>
        <td class="text-right tabular-nums max-md:hidden">{{ formatLatLon(event.latitude) }}</td>
        <td class="text-right tabular-nums max-md:hidden">{{ formatLatLon(event.longitude) }}</td>
        <td class="font-mono text-xs text-base-content/60 max-lg:hidden">{{ event.name }}</td>
      </tr>
    </tbody>
  </table>
</template>
