<script setup lang="ts">
import { AdminNavbar } from '../admin-navbar'
import { AdminBottomMenu } from './admin-bottom-menu'
</script>

<template>
  <div class="flex h-dvh w-full flex-col overflow-hidden bg-base-200/40">
    <AdminNavbar />
    <main class="h-full flex-1 overflow-y-auto">
      <slot />
    </main>
    <AdminBottomMenu />
  </div>
</template>
