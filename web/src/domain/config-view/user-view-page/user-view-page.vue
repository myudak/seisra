<script setup lang="ts">
import { deleteUserAPI, getUsersAPI, postUserAPI, putUserAPI } from '@src/api-service/users'
import { GetAllUserListQuery } from '@src/api-service/users/types'
import { EmptyState } from '@src/components/empty-state'
import { Input } from '@src/components/input/input'
import { PageHeader } from '@src/components/page-header'
import { Pagination } from '@src/components/pagination'
import { AddUserPayload, UpdateUserPayload, User } from '@src/types/user'
import { useDebounceFn } from '@vueuse/core'
import { onMounted, ref, VNodeRef, watch } from 'vue'
import { toast } from 'vue3-toastify'

import { ConfigLayout } from '../config-layout'
import { UserForm } from '../user-form'
import { UserStationForm } from '../user-station-form'

const userFormModalRef = ref<VNodeRef | null>(null)
const userDeleteModalRef = ref<VNodeRef | null>(null)
const userStationModalRef = ref<VNodeRef | null>(null)

const users = ref<User[] | []>([])
const userPayload = ref<AddUserPayload | null>(null)
const fetchQuery = ref<GetAllUserListQuery>({ page: 1, limit: 10 })
const isDataFetching = ref(false)
const isDeleting = ref(false)
const searchQuery = ref('')

// form
const isFormReset = ref(false)
const isFormLoading = ref(false)
const selectedUser = ref<User | null>(null)
const userFormUsage = ref('create')
const userFormTitle = ref('Tambah Pengguna')
const selectedUserStation = ref<string[] | []>([])

// pagination
const totalPages = ref(1)
const totalData = ref(1)
const perPage = ref(10)
const currentPage = ref(1)

const debouncedSearch = useDebounceFn(() => {
  fetchUsers()
}, 1000)

watch(
  () => searchQuery.value,
  (newValue) => {
    fetchQuery.value = { ...fetchQuery.value, page: 1, q: newValue }
    debouncedSearch()
  }
)

onMounted(() => {
  fetchUsers()
})

function resetPageProperty() {
  searchQuery.value = ''
  fetchQuery.value = { page: 1, limit: 10 }
  resetPage()
  fetchUsers()
}

function fetchUsers() {
  users.value = []
  isDataFetching.value = true
  getUsersAPI(fetchQuery.value).then(({ data, total }) => {
    users.value = data
    totalData.value = total
    totalPages.value = Math.ceil(total / perPage.value)
    isDataFetching.value = false
  })
}

function addUser() {
  isFormLoading.value = true
  postUserAPI(userPayload.value as AddUserPayload)
    .then(() => {
      isFormReset.value = true
      onUserFormModalClose()
      resetPageProperty()
      toast.success(`Berhasil menambahkan ${userPayload.value?.username}.`, {
        autoClose: 3000,
        position: 'top-center'
      })
    })
    .catch((e: Error) => {
      toast.error(`Gagal menambahkan ${userPayload.value?.username}. \n ${e.message}`, {
        autoClose: 3000,
        position: 'top-center'
      })
    })
    .finally(() => {
      isFormLoading.value = false
    })
}

function updateUser() {
  isFormLoading.value = true
  //eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, ...updatePayload } = userPayload.value as AddUserPayload
  putUserAPI(selectedUser.value?._id as string, updatePayload as UpdateUserPayload)
    .then(() => {
      isFormReset.value = true
      onUserFormModalClose()
      resetPageProperty()

      toast.success(`Berhasil memperbaruin ${selectedUser.value?.username}.`, {
        autoClose: 3000,
        position: 'top-center'
      })
    })
    .catch((e: Error) => {
      toast.error(`Gagal memperbaruin ${selectedUser.value?.username}. \n ${e.message}`, {
        autoClose: 3000,
        position: 'top-center'
      })
    })
    .finally(() => {
      isFormLoading.value = false
    })
}

function removeUser() {
  isDeleting.value = true
  deleteUserAPI(selectedUser.value?._id as string)
    .then(() => {
      onModalDeleteClose()
      resetPageProperty()
      toast.success(`Berhasil menghapus ${selectedUser.value?.username}.`, {
        autoClose: 3000,
        position: 'top-center'
      })
      selectedUser.value = null
      isDeleting.value = false
    })
    .catch((e: Error) => {
      toast.error(`Gagal menghapus ${selectedUser.value?.username}. \n ${e.message}`, {
        autoClose: 3000,
        position: 'top-center'
      })
    })
}

function resetPage() {
  fetchQuery.value = { page: 1, limit: 10 }
  currentPage.value = 1
}

function onSubmitUserForm(payload: AddUserPayload) {
  isFormReset.value = false
  userPayload.value = payload
  switch (userFormUsage.value) {
    case 'create':
      addUser()
      break
    case 'edit':
      updateUser()
      break
    default:
      toast.error(`Unregister form usage`, {
        autoClose: 3000,
        position: 'top-center'
      })
      break
  }
}

function onUserStationFormSubmit(selectedStation: string[]) {
  console.log(selectedStation)
}

function onDeleteButtonClick(user: User) {
  isDeleting.value = false
  userDeleteModalRef.value.showModal()
  selectedUser.value = user
}

function onEditButtonClick(user: User) {
  selectedUser.value = user
  userFormTitle.value = 'Ubah Pengguna'
  userFormUsage.value = 'edit'
  userFormModalRef.value.showModal()
}

function onStationBadgeClick(userStations: string[]) {
  selectedUserStation.value = userStations
  userStationModalRef.value.showModal()
}

function onUserFormModalClose() {
  userFormModalRef.value.close()
}

function onModalDeleteClose() {
  userDeleteModalRef.value.close()
}

function onUserStationFormModalClose() {
  selectedUserStation.value = []
  userStationModalRef.value.close()
}

function onAddUserButtonClick() {
  userFormUsage.value = 'create'
  userFormTitle.value = 'Tambah Pengguna'
  selectedUser.value = null
  userFormModalRef.value.showModal()
}

function showMore(page: number) {
  currentPage.value = page
  fetchQuery.value = { ...fetchQuery.value, page }
  fetchUsers()
}
</script>

<template>
  <ConfigLayout>
    <div class="app-page">
      <PageHeader
        title="Pengguna"
        description="Kelola akun operator, wilayah, dan stasiun yang dapat mereka pantau."
        :breadcrumbs="[{ label: 'Konfigurasi', to: '/config/user' }, { label: 'Pengguna' }]">
        <template #actions>
          <button class="btn btn-primary btn-sm h-10 px-4" @click="onAddUserButtonClick">+ Tambah Pengguna</button>
        </template>
      </PageHeader>

      <section class="app-card overflow-hidden">
        <div class="flex flex-col gap-3 border-b border-base-300 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div class="w-full sm:max-w-xs">
            <Input v-model="searchQuery" icon="fa-search" placeholder="Cari username…" />
          </div>
          <div class="text-sm text-base-content/60">{{ totalData }} pengguna</div>
        </div>

        <div class="w-full overflow-x-auto">
          <table class="app-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Peran</th>
                <th>Wilayah</th>
                <th class="min-w-[150px]">Stasiun</th>
                <th class="w-24 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody v-if="users.length">
              <tr v-for="user in users" :key="user._id">
                <td>
                  <div class="flex items-center gap-3">
                    <span
                      class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                      {{ user.username?.[0]?.toUpperCase() }}
                    </span>
                    <span class="whitespace-nowrap font-medium text-base-content">{{ user.username }}</span>
                  </div>
                </td>
                <td>
                  <span class="app-chip capitalize">{{ user.role || 'user' }}</span>
                </td>
                <td class="whitespace-nowrap text-base-content/80">{{ user.region || '—' }}</td>
                <td>
                  <button class="app-chip-primary hover:bg-primary/15" @click="onStationBadgeClick(user.stations)">
                    {{ user.stations.length }} stasiun
                  </button>
                </td>
                <td>
                  <div class="flex justify-end gap-1">
                    <button
                      class="app-icon-btn"
                      title="Ubah"
                      aria-label="Ubah pengguna"
                      @click="onEditButtonClick(user)">
                      <v-icon name="hi-pencil-alt" />
                    </button>
                    <button
                      class="app-icon-btn-danger"
                      title="Hapus"
                      aria-label="Hapus pengguna"
                      @click="onDeleteButtonClick(user)">
                      <v-icon name="fa-regular-trash-alt" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
          <EmptyState v-if="!users.length && isDataFetching" loading title="Memuat pengguna…" />
          <EmptyState
            v-else-if="!users.length"
            title="Pengguna tidak ditemukan"
            description="Coba kata kunci lain atau tambahkan pengguna baru." />
        </div>

        <div v-if="totalPages > 1" class="border-t border-base-300 p-4">
          <Pagination
            :total-pages="totalPages"
            :total="totalData"
            :per-page="perPage"
            :current-page="currentPage"
            @pagechanged="showMore" />
        </div>
      </section>

      <dialog ref="userFormModalRef" class="modal">
        <div class="modal-box app-modal-box">
          <UserForm
            :usage="userFormUsage"
            :user-data="selectedUser"
            :title="userFormTitle"
            :is-loading="isFormLoading"
            :is-reset="isFormReset"
            @on-cancel="onUserFormModalClose"
            @on-submit="onSubmitUserForm" />
        </div>
        <form method="dialog" class="modal-backdrop"><button>close</button></form>
      </dialog>
      <dialog ref="userDeleteModalRef" class="modal">
        <div class="modal-box app-modal-box max-w-md">
          <div class="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-error/10 text-error">
            <v-icon name="fa-regular-trash-alt" />
          </div>
          <h3 class="text-lg font-semibold">Hapus pengguna?</h3>
          <p class="mt-1 text-sm text-base-content/70">
            Akun <span class="font-semibold text-base-content">{{ selectedUser?.username }}</span> akan dihapus
            permanen.
          </p>
          <div class="mt-6 flex justify-end gap-2">
            <button class="btn btn-ghost btn-sm h-10" @click="onModalDeleteClose">Batal</button>
            <button class="btn btn-error btn-sm h-10" :disabled="isDeleting" @click="removeUser">
              <span v-if="isDeleting" class="loading loading-spinner loading-xs" />
              Hapus
            </button>
          </div>
        </div>
        <form method="dialog" class="modal-backdrop"><button>close</button></form>
      </dialog>
      <dialog ref="userStationModalRef" class="modal">
        <div class="modal-box app-modal-box">
          <UserStationForm
            :is-loading="false"
            :user-station="selectedUserStation"
            @on-cancel="onUserStationFormModalClose"
            @on-submit="onUserStationFormSubmit" />
        </div>
        <form method="dialog" class="modal-backdrop"><button>close</button></form>
      </dialog>
    </div>
  </ConfigLayout>
</template>
