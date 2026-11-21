<script setup lang="ts">
import { NAVBAR_MENUS } from '@src/constants/navbar'
import { isNavActive } from '@src/utils/nav'
import { RouterLink, useRoute } from 'vue-router'

import { ThemeToggle } from '../theme-toggle'
import { AdminMenu } from './admin-menu'
import { LatestEventChip } from './latest-event-chip'

const route = useRoute()

const filteredMenus = NAVBAR_MENUS.filter((menu) => menu.label !== 'Home')
</script>

<template>
  <header
    class="z-[1000] border-b border-base-300 bg-base-100/95 backdrop-blur supports-[backdrop-filter]:bg-base-100/80">
    <div class="flex h-14 items-center gap-4 px-4 md:px-6">
      <RouterLink to="/" class="flex shrink-0 items-center gap-2.5" aria-label="Seisra beranda">
        <img src="/seisra.svg" alt="" class="h-7 w-7 object-contain" />
        <div class="leading-tight">
          <div class="text-[15px] font-bold tracking-tight text-base-content">Seisra</div>
          <div class="hidden text-[10px] font-medium uppercase tracking-[0.14em] text-base-content/50 sm:block">
            Seismic Monitoring
          </div>
        </div>
      </RouterLink>

      <nav class="ml-4 hidden items-center gap-1 md:flex" aria-label="Navigasi utama">
        <RouterLink
          v-for="menu in filteredMenus"
          :key="menu.path"
          :to="menu.path"
          class="app-nav-link"
          :class="{ 'app-nav-link-active': isNavActive(menu.path, route.path) }"
          :aria-current="isNavActive(menu.path, route.path) ? 'page' : undefined">
          <v-icon :name="menu.icon" scale="0.95" />
          <span>{{ menu.label }}</span>
        </RouterLink>
      </nav>

      <div class="ml-auto flex items-center gap-1">
        <LatestEventChip class="mr-2 max-xl:hidden" />
        <ThemeToggle />
        <AdminMenu />
      </div>
    </div>
  </header>
</template>
