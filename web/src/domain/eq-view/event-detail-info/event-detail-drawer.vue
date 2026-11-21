<script setup lang="ts">
import { SidePanel } from '@src/components/side-panel'
import { PickingArrivalWaveformItem } from '@src/domain/picking/picking-arrival-waveform-item'
import { TimestampAxis } from '@src/domain/trace-view/timestamp-axis'
import useGetEventDetail from '@src/hooks/use-get-event-detail'
import { Arrival } from '@src/types/arrival'
import { EarthQuakeEvent } from '@src/types/event'
import { Station } from '@src/types/station'
import {
  formatDateTimeUTC,
  formatDepth,
  formatLatLon,
  formatMagnitude,
  getDisplayMagnitude,
  getOriginTimeFromEvent,
  newISODate
} from '@src/utils/string'
import * as d3 from 'd3'
import { addMinutes, subMinutes } from 'date-fns'
import { computed, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'

const { event } = defineProps<{
  event: EarthQuakeEvent
}>()

defineEmits<{
  (e: 'close'): void
}>()

const { data: eventDetail, isLoading: isEventDetailLoading } = useGetEventDetail(event._id)

const arrivals = computed(() => eventDetail.value?.arrivals ?? [])

const mappedArrival = computed(() =>
  arrivals.value.reduce<Record<string, { station: Station; arrivals: Arrival[] }>>((curr, arrival) => {
    if (!curr[arrival.pick_details._id]) {
      curr[arrival.pick_details._id] = {
        station: arrival.station_details,
        arrivals: [arrival]
      }
    } else {
      curr[arrival.pick_details._id].arrivals.push(arrival)
    }
    return curr
  }, {})
)
const originTime = computed(() =>
  eventDetail.value ? newISODate(eventDetail.value.cluster_detail[0].origin_time) : null
)
const startTime = computed(() => (originTime.value ? subMinutes(originTime.value, 5) : null))
const endTime = computed(() => (originTime.value ? addMinutes(originTime.value, 5) : null))
const container = ref<HTMLDivElement | null>(null)
const width = ref<number | null>(null)
const xScale = ref<d3.ScaleTime<number, number, never> | null>(null)
const magnitude = computed(() => getDisplayMagnitude(eventDetail.value?.magnitudes ?? event.magnitudes))
const stationCount = computed(() => Object.keys(mappedArrival.value).length)
const facts = computed(() => [
  { label: 'Waktu asal', value: formatDateTimeUTC(getOriginTimeFromEvent(event)) },
  {
    label: 'Magnitudo',
    value: magnitude.value ? `${formatMagnitude(magnitude.value.value)} ${magnitude.value.type}` : '-'
  },
  { label: 'Kedalaman', value: `${formatDepth(event.depth)} km` },
  { label: 'Koordinat', value: `${formatLatLon(event.latitude)}, ${formatLatLon(event.longitude)}` },
  { label: 'Stasiun', value: eventDetail.value ? String(stationCount.value) : '…' }
])

watch(
  [container, startTime, endTime],
  ([newContainer, newStartTime, newEndTime]) => {
    if (newContainer && newStartTime && newEndTime) {
      const newWidth = newContainer.clientWidth - 24
      width.value = newWidth
      xScale.value = d3.scaleUtc().domain([newStartTime.getTime(), newEndTime.getTime()]).range([0, newWidth])
    }
  },
  { immediate: true }
)
</script>

<template>
  <SidePanel
    :title="event.sub_region ? `${event.sub_region}, ${event.region}` : event.region"
    :subtitle="event.name"
    @close="$emit('close')">
    <template #actions>
      <RouterLink :to="`/origin-locator-view/location/${event._id}`" class="btn btn-sm btn-primary">Analisis</RouterLink>
    </template>

    <div class="flex h-full flex-col">
      <dl class="app-dl border-b border-base-300 px-4 py-3">
        <template v-for="fact in facts" :key="fact.label">
          <dt>{{ fact.label }}</dt>
          <dd :title="fact.value">{{ fact.value }}</dd>
        </template>
      </dl>

      <div class="flex items-center justify-between px-4 pb-1 pt-3">
        <span class="app-section-title">Rekaman di stasiun</span>
        <span class="text-xs text-base-content/50">± 5 menit dari waktu asal</span>
      </div>

      <div ref="container" class="min-h-[220px] flex-1 overflow-hidden">
        <div v-if="isEventDetailLoading" class="flex h-full items-center justify-center text-sm text-base-content/60">
          <span class="loading loading-spinner loading-sm mr-2" /> Memuat rekaman…
        </div>
        <div v-else-if="!Object.keys(mappedArrival).length" class="px-4 py-6 text-sm text-base-content/60">
          Belum ada arrival untuk kejadian ini.
        </div>
        <div
          v-else-if="!!originTime && !!endTime && !!startTime && !!width && !!xScale"
          class="flex h-full flex-col px-3 pb-2">
          <div class="flex-1 overflow-y-auto rounded-lg border border-base-300">
            <PickingArrivalWaveformItem
              v-for="(arrival, index) in Object.values(mappedArrival)"
              :key="index"
              :selected="false"
              :width="width"
              :origin-time="originTime"
              :start-time="startTime"
              :end-time="endTime"
              :station="arrival.station"
              :arrivals="arrival.arrivals"
              :x-scale="xScale" />
          </div>
          <TimestampAxis
            :width="width"
            :start-time="startTime.getTime()"
            :end-time="endTime.getTime()"
            time-format="%M:%S" />
        </div>
      </div>
    </div>
  </SidePanel>
</template>
