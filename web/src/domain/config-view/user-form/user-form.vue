<script setup lang="ts">
import { Input } from '@src/components/input/input'
import { AddUserPayload, User } from '@src/types/user'
import { ref, watch } from 'vue'

const emit = defineEmits<{
  (e: 'onCancel', value: null): void
  (e: 'onSubmit', value: AddUserPayload): void
}>()

const props = defineProps<{
  usage: string
  userData?: User | null
  title: string
  isLoading: boolean
  isReset: boolean
}>()

const username = ref('')
const region = ref('')
const password = ref('')

function resetForm() {
  username.value = ''
  region.value = ''
  password.value = ''
}

watch(
  () => props.userData,
  (newValue) => {
    username.value = newValue?.username as string
    region.value = newValue?.region as string
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

function onSubmitForm() {
  emit('onSubmit', {
    username: username.value,
    region: region.value,
    password: password.value
  })
}
</script>

<template>
  <div>
    <h3 class="text-lg font-semibold">{{ title }}</h3>
    <p class="mb-5 mt-1 text-sm text-base-content/60">Data akun operator yang dapat masuk ke Lindu.</p>
    <div class="flex flex-col gap-4">
      <Input v-model="username" label="Username" />
      <Input v-model="region" label="Wilayah" />
      <Input v-if="usage !== 'edit'" v-model="password" type="password" label="Password" autocomplete="new-password" />
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
