<script setup lang="ts">
import { Input } from '@src/components/input/input'
import { computed, ref } from 'vue'

defineEmits<{
  (
    e: 'submit',
    value: {
      username: string
      password: string
    }
  ): void
}>()

defineProps<{
  isLoading?: boolean
}>()

const username = ref('')
const password = ref('')

const isValid = computed(() => username.value.length > 0 && password.value.length > 0)
</script>

<template>
  <form class="flex flex-col gap-5" @submit.prevent="isValid && !isLoading && $emit('submit', { username, password })">
    <Input v-model="username" label="Username" placeholder="Masukkan username" autocomplete="username" />

    <Input v-model="password" type="password" label="Password" placeholder="••••••••" autocomplete="current-password" />

    <button type="submit" class="btn btn-primary mt-1 w-full" :disabled="!isValid || isLoading">
      <span v-if="isLoading" class="loading loading-spinner loading-sm" />
      {{ isLoading ? 'Memproses…' : 'Masuk' }}
    </button>
  </form>
</template>
