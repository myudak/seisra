<script setup lang="ts">
import { RouterLink, useRoute } from 'vue-router'

import { CONFIG_MENU } from '../constants'

const route = useRoute()
</script>

<template>
  <nav class="flex flex-col gap-1 p-3" aria-label="Konfigurasi">
    <div class="app-section-title px-3 pb-2 pt-3">Konfigurasi</div>
    <RouterLink
      v-for="menu in CONFIG_MENU"
      :key="menu.label"
      :to="menu.url"
      class="flex items-start gap-3 rounded-lg px-3 py-2.5 transition-colors"
      :class="
        route.name === menu.routeName
          ? 'bg-primary/10 text-primary'
          : 'text-base-content/70 hover:bg-base-200 hover:text-base-content'
      ">
      <v-icon :name="menu.icon" scale="0.95" class="mt-0.5 shrink-0" />
      <span class="min-w-0">
        <span class="block text-sm font-semibold">{{ menu.label }}</span>
        <span class="block truncate text-xs opacity-70">{{ menu.description }}</span>
      </span>
    </RouterLink>
  </nav>
</template>
