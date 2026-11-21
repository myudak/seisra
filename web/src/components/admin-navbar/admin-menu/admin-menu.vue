<script setup lang="ts">
import useGetProfile from '@src/hooks/use-get-profile'
import Cookies from 'js-cookie'
import { computed } from 'vue'

const { data: profile } = useGetProfile()

const initial = computed(() => profile.value?.username?.[0]?.toUpperCase() ?? '?')

const logout = () => {
  Cookies.remove('access_token')
  location.reload()
}
</script>

<template>
  <div class="dropdown dropdown-end z-[9999]">
    <button tabindex="0" class="btn btn-ghost btn-sm gap-2 px-1.5" aria-label="Menu akun">
      <span
        class="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-content">
        {{ initial }}
      </span>
      <span class="hidden text-left leading-tight lg:block">
        <span class="block text-sm font-semibold text-base-content">{{ profile?.username }}</span>
        <span class="block text-[11px] font-normal capitalize text-base-content/50">{{ profile?.role }}</span>
      </span>
    </button>
    <div tabindex="0" class="dropdown-content mt-2 w-60 rounded-xl border border-base-300 bg-base-100 p-2 shadow-lg">
      <div class="px-3 py-2">
        <div class="truncate text-sm font-semibold text-base-content">{{ profile?.username }}</div>
        <div class="text-xs text-base-content/60">
          <span class="capitalize">{{ profile?.role }}</span>
          <span v-if="profile?.region"> · {{ profile.region }}</span>
        </div>
      </div>
      <div class="my-1 border-t border-base-300" />
      <button
        class="flex w-full items-center rounded-lg px-3 py-2 text-left text-sm font-medium text-error hover:bg-error/10"
        @click="logout">
        Keluar
      </button>
    </div>
  </div>
</template>
