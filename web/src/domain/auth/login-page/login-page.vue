<script setup lang="ts">
import { ThemeToggle } from '@src/components/theme-toggle'
import { LoginResponse } from '@src/types/auth'
import api from '@src/utils/api'
import { useMutation } from '@tanstack/vue-query'
import Cookies from 'js-cookie'
import { toast } from 'vue3-toastify'

import { LoginForm, LoginSchema } from '../login-form'

const showLoginError = () => toast.error('Silahkan cek kembali username dan password Anda')

const onLoginSuccess = (data: LoginResponse) => {
  if (!data.status) {
    showLoginError()
    return
  }

  Cookies.set('access_token', data.data.access_token, { expires: 1 })
  location.reload()
}

const { isPending, mutate: login } = useMutation({
  mutationFn: (data: LoginSchema) =>
    api<LoginResponse>({
      method: 'POST',
      url: '/user/login',
      data
    }),
  onSuccess({ data }) {
    if (data) onLoginSuccess(data)
  },
  onError: () => {
    showLoginError()
  }
})
</script>

<template>
  <div class="relative flex min-h-full flex-col bg-base-200/50">
    <div class="absolute right-4 top-4"><ThemeToggle /></div>

    <div class="flex flex-1 items-center justify-center px-4 py-10">
      <div class="w-full max-w-[400px]">
        <div class="mb-8 flex flex-col items-center gap-3 text-center">
          <img src="/lindu.svg" alt="" class="h-12 w-12 object-contain" />
          <div>
            <div class="text-xs font-semibold uppercase tracking-[0.18em] text-base-content/50">Lindu</div>
            <h1 class="mt-1 text-2xl font-bold tracking-tight text-base-content">Masuk ke akun Anda</h1>
            <p class="mt-1 text-sm text-base-content/60">Pemantauan gempa dan jaringan seismik</p>
          </div>
        </div>

        <div class="app-card p-6 sm:p-8">
          <LoginForm :is-loading="isPending" @submit="login" />
        </div>

        <p class="mt-6 text-center text-xs text-base-content/50">Akses terbatas untuk operator terdaftar.</p>
      </div>
    </div>
  </div>
</template>
