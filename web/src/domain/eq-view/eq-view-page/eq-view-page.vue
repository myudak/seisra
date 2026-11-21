<script setup lang="ts">
import { getAllEventListAPI, getEventDetailAPI } from '@src/api-service/event'
import { GetAllEventListQuery } from '@src/api-service/event/types'
import { OLMap } from '@src/components/ol-map'
import { EarthQuakeEvent } from '@src/types/event'
import { createEventStationLine, createMagnitudeFeature, createSelectedEventStationFeatures } from '@src/utils/ol-map'
import { useMediaQuery, useToggle } from '@vueuse/core'
import { endOfDay, startOfDay, subWeeks } from 'date-fns'
import { Feature, Map, MapBrowserEvent } from 'ol'
import { LineString, Point } from 'ol/geom'
import VectorLayer from 'ol/layer/Vector'
import { fromLonLat } from 'ol/proj'
import VectorSource from 'ol/source/Vector'
import { computed, ref, watch } from 'vue'

import { DepthMagnitudeInfo } from '../depth-magnitude-info'
import { EventDetailDrawer } from '../event-detail-info'
import { EventPanel } from '../event-panel'

const eventSource = new VectorSource()
const eventLayer = new VectorLayer({
  source: eventSource
})

const map = ref<Map | null>(null)
const totalPerPage = ref(1000)
const totalEvents = ref(0)
const page = ref(1)
const dateRange = ref({
  start: startOfDay(subWeeks(new Date(), 1)),
  end: endOfDay(new Date())
})
const startDate = computed(() => dateRange.value.start.toISOString())
const endDate = computed(() => dateRange.value.end.toISOString())
const selectedEvent = ref<EarthQuakeEvent | null>(null)
const data = ref<EarthQuakeEvent[]>([])
const selectedStationsLayer = ref<VectorLayer<Feature<Point>>>()
const selectedLineLayer = ref<VectorLayer<Feature<LineString>>>()

const [isSettingOpen, toggleSettingOpen] = useToggle()
const isDesktop = useMediaQuery('(min-width: 768px)')
// Desktop keeps the event list open beside the map; phones open it on demand.
const isListOpen = ref(isDesktop.value)
const isFetching = ref(false)

const fetchEventList = (newParams: GetAllEventListQuery) => {
  closeEventDetailDrawer()
  isFetching.value = true
  getAllEventListAPI(newParams)
    .then((response) => {
      console.log('[EQView] events fetched:', response.data.length, 'total:', response.total)
      data.value = response.data
      totalEvents.value = response.total
    })
    .catch((err) => {
      console.error('[EQView] Failed to fetch events:', err)
      data.value = []
      totalEvents.value = 0
    })
    .finally(() => {
      isFetching.value = false
    })
}

const params = computed(() => ({
  page: page.value,
  totalPerPage: totalPerPage.value,
  startDate: startDate.value,
  endDate: endDate.value
}))
const eventList = computed(() => data.value ?? [])

const closeEventDetailDrawer = () => {
  selectedEvent.value = null

  if (selectedStationsLayer.value && map.value) {
    map.value.removeLayer(selectedStationsLayer.value)
  }
  if (selectedLineLayer.value && map.value) {
    map.value.removeLayer(selectedLineLayer.value)
  }
}

const onNewEvent = () => {
  const newStartDate = startOfDay(subWeeks(new Date(), 1))
  const newEndDate = endOfDay(new Date())
  const newPage = 1

  dateRange.value = {
    start: newStartDate,
    end: newEndDate
  }
  page.value = newPage

  fetchEventList({
    ...params.value,
    startDate: newStartDate.toISOString(),
    endDate: newEndDate.toISOString(),
    page: newPage
  })
}

const onMapCreated = (createdMap: Map) => {
  map.value = createdMap
  createdMap.addLayer(eventLayer)
}

watch([map, eventList], ([newMap, newEventList], [, oldEventList]) => {
  if (!newMap) return

  eventSource.clear(true)

  if (newEventList !== oldEventList) {
    newEventList.forEach((event) => {
      // Prefer Mw, fallback to first available magnitude
      const magnitude = event.magnitudes.find((info) => info.type.toLowerCase() === 'mw')
        ?? event.magnitudes[0]
      if (magnitude) {
        const feature = createMagnitudeFeature(event, magnitude)
        feature.setProperties({ event })
        eventSource.addFeature(feature)
      }
    })
  }
})

const animateToEvent = (event: EarthQuakeEvent) => {
  map.value?.getView().animate({
    center: fromLonLat([event.longitude, event.latitude]),
    duration: 600
  })
}

const renderSelectedEventStations = async (event: EarthQuakeEvent) => {
  if (!map.value) return

  const eventDetail = await getEventDetailAPI(event._id)

  const linesSource = new VectorSource({
    features: createEventStationLine(eventDetail)
  })

  const stationsSource = new VectorSource({
    features: createSelectedEventStationFeatures(eventDetail)
  })

  const linesLayer = new VectorLayer({
    source: linesSource
  })

  const stationsLayer = new VectorLayer({
    source: stationsSource
  })

  selectedStationsLayer.value = stationsLayer
  selectedLineLayer.value = linesLayer

  map.value.addLayer(linesLayer)
  map.value.addLayer(stationsLayer)
}

const selectEvent = (event: EarthQuakeEvent) => {
  closeEventDetailDrawer()
  if (!isDesktop.value) isListOpen.value = false

  setTimeout(() => {
    selectedEvent.value = event
    animateToEvent(event)
    renderSelectedEventStations(event)
  }, 100)
}

const onMapClick = (event: MapBrowserEvent<any>) => {
  eventLayer.getFeatures(event.pixel).then((clickedFeatures) => {
    if (!clickedFeatures.length) return

    const event = clickedFeatures[0].get('event') as EarthQuakeEvent | undefined

    if (event) {
      selectEvent(event)
    }
  })
}

watch(
  params,
  (newParams, oldParams) => {
    if (oldParams) {
      if (oldParams?.startDate !== newParams.startDate || oldParams?.endDate !== newParams.endDate) {
        page.value = 1
        fetchEventList({
          ...newParams,
          page: 1
        })
      } else {
        fetchEventList(newParams)
      }
    } else {
      fetchEventList(newParams)
    }
  },
  { immediate: true, deep: true }
)
</script>

<template>
  <div class="relative h-full w-full overflow-hidden">
    <OLMap
      :is-settings-open="isSettingOpen"
      @close-settings="toggleSettingOpen"
      @new-event="onNewEvent()"
      @map-created="onMapCreated"
      @map-click="onMapClick" />

    <!-- Event feed: left column on desktop, bottom sheet on phones -->
    <EventPanel
      v-if="isListOpen"
      v-model:range="dateRange"
      class="absolute z-[999] max-md:inset-x-0 max-md:bottom-0 max-md:max-h-[60%] max-md:rounded-b-none md:bottom-3 md:left-3 md:top-3 md:w-[360px] xl:bottom-[148px]"
      :events="eventList"
      :selected-id="selectedEvent?._id"
      :loading="isFetching"
      @select="selectEvent"
      @collapse="isListOpen = false" />

    <!-- Map toolbar -->
    <div class="absolute right-3 top-3 z-[999] flex flex-col gap-2" :class="{ 'md:right-[444px]': !!selectedEvent }">
      <button
        class="app-map-btn"
        :class="{ 'app-map-btn-active': isSettingOpen }"
        title="Lapisan peta"
        aria-label="Lapisan peta"
        @click="toggleSettingOpen()">
        <v-icon name="ri-stack-line" />
      </button>
      <button
        v-if="!isListOpen"
        class="app-map-btn"
        title="Tampilkan daftar gempa"
        aria-label="Tampilkan daftar gempa"
        @click="isListOpen = true">
        <v-icon name="fa-list" scale="0.85" />
      </button>
    </div>

    <DepthMagnitudeInfo class="absolute bottom-3 right-3 z-[998] max-md:hidden" :class="{ 'md:hidden': !!selectedEvent }" />

    <EventDetailDrawer v-if="!!selectedEvent" :key="selectedEvent._id" :event="selectedEvent" @close="closeEventDetailDrawer" />
  </div>
</template>
