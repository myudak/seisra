<script setup lang="ts">
import { defineProps } from 'vue'
import { RouterLink } from 'vue-router'

import { HOMEPAGE_MENUS } from '../constants'

defineProps<{
  menu: (typeof HOMEPAGE_MENUS)[number]
}>()
</script>

<template>
  <RouterLink
    :to="menu.url"
    class="app-card group flex flex-col overflow-hidden transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary">
    <div class="aspect-[16/9] overflow-hidden border-b border-base-300 bg-base-200">
      <img
        :src="menu.image"
        :alt="menu.label"
        loading="lazy"
        class="h-full w-full object-cover object-top transition duration-300 group-hover:scale-[1.02]" />
    </div>
    <div class="flex flex-1 flex-col gap-1.5 p-4">
      <div class="flex items-center gap-2">
        <span class="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <v-icon :name="menu.icon" scale="0.9" />
        </span>
        <h3 class="text-sm font-semibold text-base-content">{{ menu.label }}</h3>
        <span
          v-if="menu.live"
          class="ml-auto inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-[11px] font-medium text-success">
          <span class="h-1.5 w-1.5 rounded-full bg-success" /> Live
        </span>
      </div>
      <p class="text-xs leading-relaxed text-base-content/60">{{ menu.description }}</p>
      <span class="mt-auto pt-2 text-xs font-semibold text-primary">
        Buka <span class="inline-block transition group-hover:translate-x-0.5">→</span>
      </span>
    </div>
  </RouterLink>
</template>
