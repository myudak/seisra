<script setup lang="ts">
import { deleteStationAPI, getStationListAPI, postStationAPI, putStationAPI } from '@src/api-service/station'
import { GetStationListQuery } from '@src/api-service/station/types'
import { EmptyState } from '@src/components/empty-state'
import { Input } from '@src/components/input/input'
import { PageHeader } from '@src/components/page-header'
import { Pagination } from '@src/components/pagination'
import { AddStationPayload, Station } from '@src/types/station'
import { useDebounceFn } from '@vueuse/core'
import { onMounted, ref, VNodeRef, watch } from 'vue'
import { toast } from 'vue3-toastify'

import { ConfigLayout } from '../config-layout'
import { StationForm } from '../station-form'

const stationFormModalRef = ref<VNodeRef | null>(null)
const stationDeleteModalRef = ref<VNodeRef | null>(null)

const stations = ref<Station[] | []>([])
const stationPayload = ref<AddStationPayload | null>(null)
const fetchQuery = ref<GetStationListQuery>({ page: 1, limit: 10 })
const isDataFetching = ref(false)
const isDeleting = ref(false)
const searchQuery = ref('')

// form
const isFormReset = ref(false)
const isFormLoading = ref(false)
const selectedStation = ref<Station | null>(null)
const stationFormUsage = ref('create')
const stationFormTitle = ref('Tambah Stasiun')

// pagination
const totalPages = ref(1)
const totalData = ref(1)
const perPage = ref(10)
const currentPage = ref(1)

const debouncedSearch = useDebounceFn(() => {
  fetchStations()
}, 500)

watch(
  () => searchQuery.value,
  (newValue) => {
    fetchQuery.value = { ...fetchQuery.value, page: 1, q: newValue }
    debouncedSearch()
  }
)

onMounted(() => {
  fetchStations()
})

function resetPageProperty() {
  searchQuery.value = ''
  fetchQuery.value = { page: 1, limit: 10 }
  resetPage()
  fetchStations()
}

function fetchStations() {
  stations.value = []
  isDataFetching.value = true
  const useRealAPI = false
  getStationListAPI(useRealAPI, fetchQuery.value).then(({ data, total }) => {
    stations.value = data
    totalData.value = total as number
    totalPages.value = Math.ceil((total as number) / perPage.value)
    isDataFetching.value = false
  })
}

function addStation() {
  isFormLoading.value = true
  postStationAPI(stationPayload.value as AddStationPayload)
    .then(() => {
      isFormReset.value = true
      onStationFormModalClose()
      resetPageProperty()
      toast.success(`Berhasil menambahkan ${stationPayload.value?.name}.`, {
        autoClose: 3000,
        position: 'top-center'
      })
    })
    .catch((e: Error) => {
      toast.error(`Gagal menambahkan ${stationPayload.value?.name}. \n ${e.message}`, {
        autoClose: 3000,
        position: 'top-center'
      })
    })
    .finally(() => {
      isFormLoading.value = false
    })
}

function updateStation() {
  isFormLoading.value = true
  putStationAPI(selectedStation.value?._id as string, stationPayload.value as AddStationPayload)
    .then(() => {
      isFormReset.value = true
      onStationFormModalClose()
      resetPageProperty()
      toast.success(`Berhasil memperbarui ${stationPayload.value?.name}.`, {
        autoClose: 3000,
        position: 'top-center'
      })
    })
    .catch((e: Error) => {
      toast.error(`Gagal memperbarui ${stationPayload.value?.name}. \n ${e.message}`, {
        autoClose: 3000,
        position: 'top-center'
      })
    })
    .finally(() => {
      isFormLoading.value = false
    })
}

function removeStation() {
  isDeleting.value = true
  deleteStationAPI(selectedStation.value?._id as string)
    .then(() => {
      onModalDeleteClose()
      resetPageProperty()
      toast.success(`Berhasil menghapus ${selectedStation.value?.name}.`, {
        autoClose: 3000,
        position: 'top-center'
      })
      selectedStation.value = null
    })
    .catch((e: Error) => {
      toast.error(`Gagal menghapus ${selectedStation.value?.name}. \n ${e.message}`, {
        autoClose: 3000,
        position: 'top-center'
      })
    })
    .finally(() => {
      isDeleting.value = false
    })
}

function resetPage() {
  fetchQuery.value = { page: 1, limit: 10 }
  currentPage.value = 1
}

function onSubmitStationForm(payload: AddStationPayload) {
  isFormReset.value = false
  stationPayload.value = payload

  stationFormUsage.value === 'create' ? addStation() : updateStation()
}

function onDeleteButtonClick(station: Station) {
  isDeleting.value = false
  stationDeleteModalRef.value.showModal()
  selectedStation.value = station
}

function onEditButtonClick(station: Station) {
  selectedStation.value = station
  stationFormTitle.value = 'Ubah Stasiun'
  stationFormUsage.value = 'edit'
  stationFormModalRef.value.showModal()
}

function onStationFormModalClose() {
  stationFormModalRef.value.close()
}

function onModalDeleteClose() {
  stationDeleteModalRef.value.close()
}

function onAddStationButtonClick() {
  stationFormUsage.value = 'create'
  stationFormTitle.value = 'Tambah Stasiun'
  selectedStation.value = null
  stationFormModalRef.value.showModal()
}

function showMore(page: number) {
  currentPage.value = page
  fetchQuery.value = { ...fetchQuery.value, page }
  fetchStations()
}
</script>

<template>
  <ConfigLayout>
    <div class="app-page">
      <PageHeader
        title="Stasiun"
        description="Daftar seismometer dalam jaringan beserta kanal, posisi, dan server data."
        :breadcrumbs="[{ label: 'Konfigurasi', to: '/config/user' }, { label: 'Stasiun' }]">
        <template #actions>
          <button class="btn btn-primary btn-sm h-10 px-4" @click="onAddStationButtonClick">+ Tambah Stasiun</button>
        </template>
      </PageHeader>

      <section class="app-card overflow-hidden">
        <div class="flex flex-col gap-3 border-b border-base-300 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div class="w-full sm:max-w-xs">
            <Input v-model="searchQuery" icon="fa-search" placeholder="Cari nama atau kode stasiun…" />
          </div>
          <div class="text-sm text-base-content/60">{{ totalData }} stasiun</div>
        </div>

        <div class="w-full overflow-x-auto">
          <table class="app-table">
            <thead>
              <tr>
                <th class="min-w-[240px]">Stasiun</th>
                <th>Jaringan</th>
                <th class="min-w-[180px]">Kanal</th>
                <th class="min-w-[170px]">Posisi</th>
                <th>Server</th>
                <th class="w-24 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody v-if="stations.length">
              <tr v-for="station in stations" :key="station._id">
                <td>
                  <div class="font-mono text-sm font-semibold text-base-content">{{ station.code }}</div>
                  <div class="max-w-[280px] truncate text-xs text-base-content/60">{{ station.name }}</div>
                </td>
                <td>
                  <span class="app-chip font-mono">{{ station.network }}</span>
                </td>
                <td>
                  <div class="flex max-w-80 flex-wrap gap-1">
                    <span v-for="(channel, idx) in station.channel" :key="idx" class="app-chip font-mono">{{
                      channel
                    }}</span>
                  </div>
                </td>
                <td class="font-mono text-xs text-base-content/80">
                  {{ Number(station.latitude).toFixed(4) }}, {{ Number(station.longitude).toFixed(4) }}
                </td>
                <td
                  class="max-w-[200px] truncate font-mono text-xs text-base-content/70"
                  :title="station.server_seedlink">
                  {{ station.server_seedlink }}
                </td>
                <td>
                  <div class="flex justify-end gap-1">
                    <button
                      class="app-icon-btn"
                      title="Ubah"
                      aria-label="Ubah stasiun"
                      @click="onEditButtonClick(station)">
                      <v-icon name="hi-pencil-alt" />
                    </button>
                    <button
                      class="app-icon-btn-danger"
                      title="Hapus"
                      aria-label="Hapus stasiun"
                      @click="onDeleteButtonClick(station)">
                      <v-icon name="fa-regular-trash-alt" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
          <EmptyState v-if="!stations.length && isDataFetching" loading title="Memuat stasiun…" />
          <EmptyState
            v-else-if="!stations.length"
            title="Stasiun tidak ditemukan"
            description="Coba kata kunci lain atau tambahkan stasiun baru." />
        </div>

        <div v-if="totalPages > 1" class="border-t border-base-300 p-4">
          <Pagination
            :max-visible-buttons="5"
            :total-pages="totalPages"
            :total="totalData"
            :per-page="perPage"
            :current-page="currentPage"
            @pagechanged="showMore" />
        </div>
      </section>

      <dialog ref="stationFormModalRef" class="modal">
        <div class="modal-box app-modal-box max-w-3xl">
          <StationForm
            :usage="stationFormUsage"
            :station-data="selectedStation"
            :title="stationFormTitle"
            :is-loading="isFormLoading"
            :is-reset="isFormReset"
            @on-cancel="onStationFormModalClose"
            @on-submit="onSubmitStationForm" />
        </div>
        <form method="dialog" class="modal-backdrop"><button>close</button></form>
      </dialog>
      <dialog ref="stationDeleteModalRef" class="modal">
        <div class="modal-box app-modal-box max-w-md">
          <div class="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-error/10 text-error">
            <v-icon name="fa-regular-trash-alt" />
          </div>
          <h3 class="text-lg font-semibold">Hapus stasiun?</h3>
          <p class="mt-1 text-sm text-base-content/70">
            Stasiun <span class="font-semibold text-base-content">{{ selectedStation?.name }}</span> akan dihapus dari
            jaringan.
          </p>
          <div class="mt-6 flex justify-end gap-2">
            <button class="btn btn-ghost btn-sm h-10" @click="onModalDeleteClose">Batal</button>
            <button class="btn btn-error btn-sm h-10" :disabled="isDeleting" @click="removeStation">
              <span v-if="isDeleting" class="loading loading-spinner loading-xs" />
              Hapus
            </button>
          </div>
        </div>
        <form method="dialog" class="modal-backdrop"><button>close</button></form>
      </dialog>
    </div>
  </ConfigLayout>
</template>
