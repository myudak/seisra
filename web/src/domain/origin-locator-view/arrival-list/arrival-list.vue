<script setup lang="ts">
import { PutEventCommitAPIArrival } from '@src/api-service/event/types'
import { CommitConfirmationModal } from '@src/domain/picking/commit-confirmation-modal'
import usePutEventCommit from '@src/hooks/use-put-event-commit'
import { usePickerStore } from '@src/stores/picker'
import { Arrival } from '@src/types/arrival'
import { EarthQuakeEvent } from '@src/types/event'
import { Pick } from '@src/types/pick'
import { Station } from '@src/types/station'
import { formatDateUTC, formatTimeUTC } from '@src/utils/string'
import { computed, ref, watch } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { toast } from 'vue3-toastify'

interface SelectedPick {
  [pickId: string]: {
    selected: boolean
  }
}

const { event } = defineProps<{
  event: EarthQuakeEvent
}>()

const pickerStore = usePickerStore()
const { mutateAsync: commitEvent } = usePutEventCommit()
const router = useRouter()

const isConfirmationModalShow = ref(false)
const selectedPicks = ref<SelectedPick>({})

const updatedPick = pickerStore.events[event._id]
const arrivals = computed(() => event.arrivals ?? [])
const selectedPickIds = computed(() =>
  Object.keys(selectedPicks.value).filter((pickId) => selectedPicks.value[pickId].selected)
)

const groupedArrivals = computed(() => {
  const groupedArrival: Record<
    string,
    {
      pick: Pick
      station: Station
      phase: {
        p?: Arrival & {
          original: string
          updated?: string
        }
        s?: Arrival & {
          original: string
          updated?: string
        }
      }
    }
  > = {}

  for (const arrival of arrivals.value) {
    if (!arrival.pick_details?._id) {
      continue
    }

    if (!groupedArrival[arrival.pick_details._id]) {
      groupedArrival[arrival.pick_details._id] = {
        pick: arrival.pick_details,
        station: arrival.station_details,
        phase: {}
      }
    }

    if (arrival.phase_type === 'P') {
      groupedArrival[arrival.pick_details._id].phase['p'] = {
        ...arrival,
        ...getPickerTimestamp(arrival)
      }
    } else {
      groupedArrival[arrival.pick_details._id].phase['s'] = {
        ...arrival,
        ...getPickerTimestamp(arrival)
      }
    }
  }

  return Object.values(groupedArrival)
})

const getPickerTimestamp = (arrival: Arrival) => {
  if (!updatedPick || !updatedPick[arrival.pick_details._id]) {
    return {
      original: arrival.timestamp
    }
  }

  if (arrival.phase_type === 'P') {
    return {
      original: arrival.timestamp,
      updated: updatedPick[arrival.pick_details._id]?.p?.timestamp
    }
  }

  return {
    original: arrival.timestamp,
    updated: updatedPick[arrival.pick_details._id]?.s?.timestamp
  }
}

const toggleSelectedArrival = (pickId: string) => {
  selectedPicks.value = {
    ...selectedPicks.value,
    [pickId]: {
      selected: !selectedPicks.value[pickId].selected
    }
  }
}

const onConfirmCommit = async () => {
  const usedArrivals: PutEventCommitAPIArrival[] = []

  const filteredPicks = groupedArrivals.value.filter((arrival) => selectedPickIds.value.includes(arrival.pick._id))

  filteredPicks.forEach((pick) => {
    if (pick.phase.s) {
      usedArrivals.push({
        ...pick.phase.s,
        pick_source_id: pick.pick._id,
        station_id: pick.station._id,
        timestamp: pick.phase.s.updated ?? pick.phase.s.original
      })
    }
    if (pick.phase.p) {
      usedArrivals.push({
        ...pick.phase.p,
        pick_source_id: pick.pick._id,
        station_id: pick.station._id,
        timestamp: pick.phase.p.updated ?? pick.phase.p.original
      })
    }
  })

  try {
    isConfirmationModalShow.value = false

    const { status, data: newEventData } = await commitEvent({
      eventId: event._id,
      arrivals: usedArrivals
    })

    if (!status) {
      throw Error('unsuccessfull commit event')
    }

    toast.success('Successfully commit the event arrivals')
    if (newEventData._id === event._id) {
      window.location.reload()
    } else {
      router.replace(`/origin-locator-view/location/${newEventData._id}`)
    }
  } catch (e) {
    toast.error('Failed to commit the event arrivals')
  }
}

watch(
  groupedArrivals,
  (newGroupedArrivals) => {
    const newSelectedPicks: SelectedPick = {}

    for (const groupedArrival of newGroupedArrivals) {
      const isPChecked = groupedArrival.phase.p?.checked ?? false
      const isSChecked = groupedArrival.phase.s?.checked ?? false
      newSelectedPicks[groupedArrival.pick._id] = {
        selected: isPChecked || isSChecked || false
      }
    }

    selectedPicks.value = newSelectedPicks
  },
  { immediate: true }
)
</script>

<template>
  <div class="flex flex-col">
    <header class="flex flex-wrap items-center justify-between gap-3 border-b border-base-300 px-4 py-3">
      <div>
        <h2 class="text-sm font-semibold text-base-content">Arrival</h2>
        <p class="text-xs text-base-content/60">
          {{ selectedPickIds.length }} dari {{ groupedArrivals.length }} pick dipakai untuk relokasi · minimal 4
        </p>
      </div>
      <div class="flex items-center gap-2">
        <RouterLink :to="`/origin-locator-view/picking/${event._id}`" class="btn btn-sm btn-ghost border-base-300">
          <v-icon name="gi-sound-waves" scale="0.9" /> Koreksi fase
        </RouterLink>
        <div
          :class="{ 'tooltip tooltip-left': selectedPickIds.length < 4 }"
          :data-tip="selectedPickIds.length < 4 ? 'Pilih minimal 4 pick untuk commit' : undefined">
          <button
            class="btn btn-sm btn-primary"
            :disabled="selectedPickIds.length < 4"
            @click="isConfirmationModalShow = true">
            Commit {{ selectedPickIds.length || '' }}
          </button>
        </div>
      </div>
    </header>

    <div v-if="arrivals.length === 0" class="px-4 py-10 text-center text-sm text-base-content/60">
      Kejadian ini belum punya arrival.
    </div>

    <div v-else class="max-h-[360px] overflow-auto">
      <table class="app-table">
        <thead class="sticky top-0 z-10">
          <tr>
            <th class="w-12">Pakai</th>
            <th>Stasiun</th>
            <th class="text-right">P (UTC)</th>
            <th class="text-right">S (UTC)</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="groupedArrival in groupedArrivals"
            :key="groupedArrival.pick._id"
            class="cursor-pointer"
            @click="toggleSelectedArrival(groupedArrival.pick._id)">
            <td>
              <input
                v-if="typeof selectedPicks[groupedArrival.pick._id]?.selected === 'boolean'"
                :id="groupedArrival.pick._id"
                v-model="selectedPicks[groupedArrival.pick._id].selected"
                type="checkbox"
                class="checkbox checkbox-primary checkbox-sm"
                :aria-label="`Pakai pick ${groupedArrival.station.code}`"
                @click.stop />
            </td>
            <td class="whitespace-nowrap">
              <span class="font-mono font-semibold text-base-content">{{ groupedArrival.station.code }}</span>
              <span class="ml-1.5 text-xs text-base-content/50">{{ groupedArrival.station.network }}</span>
            </td>
            <td v-for="phase in (['p', 's'] as const)" :key="phase" class="whitespace-nowrap text-right tabular-nums">
              <template v-if="groupedArrival.phase[phase]">
                <div
                  :class="groupedArrival.phase[phase]!.updated ? 'text-base-content/40 line-through' : 'text-base-content'"
                  :title="formatDateUTC(groupedArrival.phase[phase]!.original)">
                  {{ formatTimeUTC(groupedArrival.phase[phase]!.original, true) }}
                </div>
                <div v-if="groupedArrival.phase[phase]!.updated" class="flex items-center justify-end gap-1.5">
                  <span class="badge badge-warning badge-xs">diubah</span>
                  <span class="font-medium text-base-content">{{ formatTimeUTC(groupedArrival.phase[phase]!.updated!, true) }}</span>
                </div>
              </template>
              <span v-else class="text-base-content/30">-</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <CommitConfirmationModal
    :total-arrivals="selectedPickIds.length"
    :is-open="isConfirmationModalShow"
    @close="isConfirmationModalShow = false"
    @confirm="onConfirmCommit()" />
</template>
