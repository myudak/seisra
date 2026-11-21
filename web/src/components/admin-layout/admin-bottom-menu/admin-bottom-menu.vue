<script setup lang="ts">
import { NAVBAR_MENUS } from '@src/constants/navbar'
import { isNavActive } from '@src/utils/nav'
import { RouterLink, useRoute } from 'vue-router'

const route = useRoute()
</script>

<template>
  <nav class="hidden border-t border-base-300 bg-base-100 max-md:block" aria-label="Navigasi utama">
    <div class="grid grid-cols-6">
      <RouterLink
        v-for="menu in NAVBAR_MENUS"
        :key="menu.path"
        :to="menu.path"
        class="flex flex-col items-center gap-0.5 py-2 text-[11px] font-medium transition-colors"
        :class="isNavActive(menu.path, route.path) ? 'text-primary' : 'text-base-content/60'">
        <v-icon :name="menu.icon" scale="1.05" />
        <span>{{ menu.label }}</span>
      </RouterLink>
    </div>
  </nav>
</template>
