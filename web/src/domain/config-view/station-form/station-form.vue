<script setup lang="ts">
import { Input } from '@src/components/input/input'
import { AddStationPayload, Station } from '@src/types/station'
import { ref, watch } from 'vue'

const emit = defineEmits<{
  (e: 'onCancel', value: null): void
  (e: 'onSubmit', value: AddStationPayload): void
}>()

const props = defineProps<{
  usage?: string
  stationData?: Station | null
  title: string
  isLoading: boolean
  isReset: boolean
}>()

const name = ref('')
const code = ref('')
const network = ref('')
const latitude = ref<number | null>(null)
const longitude = ref<number | null>(null)
const elevation = ref<number | null>(null)
const server_seedlink = ref('')
const server_fdsn = ref('')
const channel = ref([''])

function resetForm() {
  name.value = ''
  code.value = ''
  network.value = ''
  latitude.value = null
  longitude.value = null
  elevation.value = null
  server_seedlink.value = ''
  server_fdsn.value = ''
  channel.value = ['']
}

watch(
  () => props.stationData,
  (newValue) => {
    if (newValue) {
      mappedDataToForm(newValue as Station)
    } else {
      resetForm()
    }
  }
)

watch(
  () => props.isReset,
  (newValue) => {
    if (newValue) {
      resetForm()
    }
  }
)

function mappedDataToForm(station: Station) {
  name.value = station.name
  code.value = station.code
  network.value = station.network
  latitude.value = station.latitude
  longitude.value = station.longitude
  elevation.value = station.elevation
  server_seedlink.value = station.server_seedlink
  server_fdsn.value = station.server_fdsn
  channel.value = station.channel
}

function onSubmitForm() {
  emit('onSubmit', {
    name: name.value,
    code: code.value,
    network: network.value,
    latitude: latitude.value as number,
    longitude: longitude.value as number,
    elevation: elevation.value as number,
    server_seedlink: server_seedlink.value,
    server_fdsn: server_fdsn.value,
    channel: channel.value
  })
}

function addChannel() {
  channel.value.push('')
}

function removeChannel(index: number) {
  channel.value.splice(index, 1)
}
</script>

<template>
  <div>
    <h3 class="text-lg font-semibold">{{ title }}</h3>
    <p class="mb-5 mt-1 text-sm text-base-content/60">Identitas, kanal, posisi, dan sumber data seismometer.</p>
    <div class="flex flex-col gap-5">
      <div class="grid gap-4 md:grid-cols-3">
        <div class="md:col-span-3"><Input v-model="name" label="Nama" /></div>
        <Input v-model="code" label="Kode" />
        <Input v-model="network" label="Jaringan" />
      </div>

      <div>
        <div class="mb-1.5 flex items-center justify-between">
          <span class="text-sm font-medium text-base-content/80">Kanal</span>
          <button class="btn btn-ghost btn-xs text-primary" @click="addChannel">+ Tambah kanal</button>
        </div>
        <div class="flex flex-col gap-2">
          <div v-for="(_, idx) in channel" :key="idx" class="flex items-center gap-2">
            <Input v-model="channel[idx]" placeholder="mis. BHZ" />
            <button
              class="app-icon-btn-danger"
              title="Hapus kanal"
              aria-label="Hapus kanal"
              @click="removeChannel(idx)">
              <v-icon name="fa-regular-trash-alt" />
            </button>
          </div>
          <p v-if="!channel.length" class="text-xs text-base-content/50">Belum ada kanal.</p>
        </div>
      </div>

      <div class="grid grid-cols-3 gap-4 max-md:grid-cols-1">
        <Input v-model="latitude" label="Lintang" type="number" />
        <Input v-model="longitude" label="Bujur" type="number" />
        <Input v-model="elevation" label="Elevasi (m)" type="number" />
      </div>
      <div class="grid gap-4 md:grid-cols-2">
        <Input v-model="server_seedlink" label="Server SeedLink" />
        <Input v-model="server_fdsn" label="Server FDSN" />
      </div>
      <div class="mt-2 flex justify-end gap-2 border-t border-base-300 pt-4">
        <button class="btn btn-ghost btn-sm h-10" @click="emit('onCancel', null)">Batal</button>
        <button class="btn btn-primary btn-sm h-10 px-5" :disabled="isLoading" @click="onSubmitForm">
          <span v-if="isLoading" class="loading loading-spinner loading-xs" />
          Simpan
        </button>
      </div>
    </div>
  </div>
</template>
