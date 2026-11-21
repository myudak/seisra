<script setup lang="ts">
import { OLMap } from '@src/components/ol-map'
import useGetProfile from '@src/hooks/use-get-profile'
import useGetStationList from '@src/hooks/use-get-station-list'
import usePickingSocket from '@src/hooks/use-picking-socket'
import { Station } from '@src/types/station'
import { WebsocketPickingResponse } from '@src/types/waveform'
import { createStationCluster } from '@src/utils/ol-map'
import { useMediaQuery, useToggle } from '@vueuse/core'
import { addSeconds, isAfter } from 'date-fns'
import { Feature, Map, MapBrowserEvent } from 'ol'
import { FeatureLike } from 'ol/Feature'
import { Geometry, Point } from 'ol/geom'
import VectorLayer from 'ol/layer/Vector'
import { fromLonLat } from 'ol/proj'
import { Cluster } from 'ol/source'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import { SelectedStationClusterDrawer } from '../selected-station-cluster-drawer'
import { SelectedStationDrawer } from '../selected-station-drawer'
import { StationPanel } from '../station-panel'

const map = ref<Map | null>(null)
const selectedStation = ref<Station | null>(null)
const selectedStations = ref<Station[] | null>(null)
const clusterLayer = ref<VectorLayer<Feature<Geometry>> | null>(null)
const clusterSource = ref<Cluster<Feature<Point>> | null>(null)
const [isSettingOpen, toggleSettingOpen] = useToggle()
const router = useRouter()
const pickStations = ref<Record<string, Date>>({})
const interval = ref<number | null>(null)

usePickingSocket((newPick) => handleNewPick(newPick))
const { data: stationResponse, isLoading: isStationsLoading, refetch: fetchStations } = useGetStationList(true)
const { data: profile } = useGetProfile()
const stationList = computed(() => stationResponse.value?.data ?? [])
const disabledIds = computed(() => profile.value?.disable_stations ?? [])
const pickedKeys = computed(() => Object.keys(pickStations.value))
const isDesktop = useMediaQuery('(min-width: 768px)')
const isListOpen = ref(isDesktop.value)

const blinkState: Record<string, number> = {}

const closeSelectedStationDrawer = () => {
  selectedStation.value = null
}

const closeSelectedStationClusteDrawer = () => {
  selectedStations.value = null
}

const onSelectStation = (station: Station) => {
  selectedStations.value = null
  selectedStation.value = station
}

const focusStation = (station: Station) => {
  onSelectStation(station)
  if (!isDesktop.value) isListOpen.value = false
  map.value?.getView().animate({
    center: fromLonLat([station.longitude, station.latitude]),
    zoom: Math.max(map.value.getView().getZoom() ?? 5, 6),
    duration: 600
  })
}

const onSelectCluster = (stations: Station[]) => {
  selectedStation.value = null
  selectedStations.value = stations
}

const navigateToWaveform = () => {
  router.push('/trace-view')
}

const renderStations = async (mapCanvas: Map) => {
  const { data } = await fetchStations()
  const stations = data?.data ?? []

  const createdCluster = createStationCluster(stations)

  mapCanvas.addLayer(createdCluster.clusters)

  clusterLayer.value = createdCluster.clusters
  clusterSource.value = createdCluster.clusterSource
}

const onMapCreated = (mapCanvas: Map) => {
  map.value = mapCanvas
  renderStations(mapCanvas)
}

const onMapClick = (event: MapBrowserEvent<any>) => {
  if (!clusterLayer.value) return

  const clusters = clusterLayer.value

  clusters.getFeatures(event.pixel).then((clickedFeatures) => {
    if (!clickedFeatures.length) return

    const features = clickedFeatures[0].get('features') as FeatureLike[]
    const stations = features.map((feature) => feature.getProperties()?.station as Station | undefined)
    const isStationMarkers = stations.every((station) => !!station)

    if (!isStationMarkers) return
    if (!stations.length) return

    if (stations.length > 1) {
      setTimeout(() => {
        onSelectCluster(stations)
      }, 100)
    } else {
      onSelectStation(stations[0])
    }
  })
}

const removeBlinkFromFeature = (fullStationName: string, feature: Feature<Point>) => {
  if (blinkState[fullStationName]) {
    clearInterval(blinkState[fullStationName])
  }

  feature.setProperties({ hasPick: false })
}

const addBlinkToFeature = (fullStationName: string, feature: Feature<Point>) => {
  if (blinkState[fullStationName]) {
    clearInterval(blinkState[fullStationName])

    const stationList = document.querySelector(`#${fullStationName}`)
    stationList?.classList.remove('has-pick')
  }

  blinkState[fullStationName] = setInterval(() => {
    const hasPick = feature.getProperties()?.hasPick ?? false
    feature.setProperties({ hasPick: !hasPick })

    const stationList = document.querySelector(`#${fullStationName}`)
    if (hasPick) {
      stationList?.classList.add('has-pick')
    } else {
      stationList?.classList.remove('has-pick')
    }
  }, 1000)
}

const getFeatureByStationName = (fullStationName: string) => {
  if (!clusterSource.value) return

  const features = clusterSource.value.getFeatures()

  for (const feature of features) {
    const childFeatures = (feature.getProperties()?.features as Feature<Point>[]) ?? []
    for (const childFeature of childFeatures) {
      if (childFeature.getId() === fullStationName) {
        return childFeature
      }
    }
  }

  return null
}

const handleNewPick = ({ station, network }: WebsocketPickingResponse) => {
  const fullStationName = `${network}-${station}`

  pickStations.value = {
    ...pickStations.value,
    [fullStationName]: addSeconds(new Date(), 30)
  }

  const feature = getFeatureByStationName(fullStationName)

  if (feature) {
    addBlinkToFeature(fullStationName, feature)
  }
}

const checkPickExpiration = () => {
  let hasDeletedPick = false
  const newPicksStations = { ...pickStations.value }
  for (const stationName of Object.keys(newPicksStations)) {
    if (isAfter(new Date(), newPicksStations[stationName])) {
      delete newPicksStations[stationName]
      const feature = getFeatureByStationName(stationName)
      if (feature) {
        removeBlinkFromFeature(stationName, feature)
      }
      hasDeletedPick = true
    }
  }

  if (hasDeletedPick) {
    pickStations.value = newPicksStations
  }
}

onMounted(() => {
  interval.value = setInterval(() => {
    checkPickExpiration()
  }, 10_000)
})

onUnmounted(() => {
  if (interval.value) {
    clearInterval(interval.value)
  }
})
</script>

<template>
  <div class="relative h-full w-full overflow-hidden">
    <OLMap
      :is-settings-open="isSettingOpen"
      @map-created="onMapCreated"
      @map-click="onMapClick"
      @close-settings="toggleSettingOpen" />

    <StationPanel
      v-if="isListOpen"
      class="absolute z-[999] max-md:inset-x-0 max-md:bottom-0 max-md:max-h-[65%] max-md:rounded-b-none md:bottom-3 md:left-3 md:top-3 md:w-[340px] xl:bottom-[148px]"
      :stations="stationList"
      :disabled-ids="disabledIds"
      :picked-keys="pickedKeys"
      :selected-id="selectedStation?._id"
      :loading="isStationsLoading"
      @select="focusStation"
      @collapse="isListOpen = false" />

    <div
      class="absolute right-3 top-3 z-[999] flex flex-col gap-2"
      :class="{ 'md:right-[444px]': !!selectedStation || !!selectedStations }">
      <button
        class="app-map-btn"
        :class="{ 'app-map-btn-active': isSettingOpen }"
        title="Lapisan peta"
        aria-label="Lapisan peta"
        @click="toggleSettingOpen()">
        <v-icon name="ri-stack-line" />
      </button>
      <button class="app-map-btn" title="Buka Trace" aria-label="Buka Trace" @click="navigateToWaveform">
        <v-icon name="gi-sound-waves" />
      </button>
      <button
        v-if="!isListOpen"
        class="app-map-btn"
        title="Tampilkan daftar stasiun"
        aria-label="Tampilkan daftar stasiun"
        @click="isListOpen = true">
        <v-icon name="fa-list" scale="0.85" />
      </button>
    </div>

    <div
      v-if="!selectedStation && !selectedStations"
      class="app-float absolute bottom-3 right-3 z-[998] flex items-center gap-4 px-3 py-2 text-xs text-base-content/80 max-md:hidden">
      <span class="inline-flex items-center gap-1.5"><span class="h-3 w-3 rotate-[30deg] rounded-[3px] bg-[green]" /> Stasiun</span>
      <span class="inline-flex items-center gap-1.5"><span class="h-3 w-3 rounded-[3px] border-2 border-[yellow] bg-[green]" /> Ada pick</span>
      <span class="inline-flex items-center gap-1.5"><span class="h-3 w-3 rounded-[3px] bg-[green] text-center text-[8px] leading-3 text-white">3</span> Klaster</span>
    </div>

    <SelectedStationDrawer
      v-if="selectedStation"
      :key="selectedStation._id"
      :station="selectedStation"
      @close="closeSelectedStationDrawer" />

    <SelectedStationClusterDrawer
      v-if="selectedStations"
      :stations="selectedStations"
      @select-channel="focusStation"
      @close="closeSelectedStationClusteDrawer" />
  </div>
</template>
