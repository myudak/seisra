<script setup lang="ts">
import { RouterLink, useRoute } from 'vue-router'

import { ConfigSidebar } from '../config-sidebar'
import { CONFIG_MENU } from '../constants'

const route = useRoute()
</script>

<template>
  <div class="flex h-full overflow-hidden">
    <aside class="h-full w-72 shrink-0 overflow-y-auto border-r border-base-300 bg-base-100 max-md:hidden">
      <ConfigSidebar />
    </aside>
    <div class="h-full w-full overflow-y-auto">
      <!-- Section switcher on small screens (sidebar is hidden) -->
      <div class="flex gap-2 overflow-x-auto border-b border-base-300 bg-base-100 px-4 py-2 md:hidden">
        <RouterLink
          v-for="menu in CONFIG_MENU"
          :key="menu.label"
          :to="menu.url"
          class="btn btn-sm shrink-0"
          :class="route.name === menu.routeName ? 'btn-primary' : 'btn-ghost'">
          {{ menu.label }}
        </RouterLink>
      </div>
      <slot />
    </div>
  </div>
</template>
