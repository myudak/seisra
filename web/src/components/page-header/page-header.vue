<script setup lang="ts">
import { RouterLink } from 'vue-router'

defineProps<{
  title: string
  description?: string
  breadcrumbs?: Array<{ label: string; to?: string }>
}>()
</script>

<template>
  <header class="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
    <div class="min-w-0">
      <nav v-if="breadcrumbs?.length" class="mb-2 flex flex-wrap items-center gap-1.5 text-sm text-base-content/60">
        <template v-for="(crumb, idx) in breadcrumbs" :key="crumb.label">
          <RouterLink v-if="crumb.to" :to="crumb.to" class="hover:text-base-content">{{ crumb.label }}</RouterLink>
          <span v-else class="font-medium text-primary">{{ crumb.label }}</span>
          <span v-if="idx < breadcrumbs.length - 1" class="text-base-content/30">/</span>
        </template>
      </nav>
      <div class="flex flex-wrap items-center gap-3">
        <h1 class="text-2xl font-bold tracking-tight text-base-content md:text-[28px]">{{ title }}</h1>
        <slot name="badge" />
      </div>
      <p v-if="description" class="mt-1 max-w-2xl text-sm text-base-content/60">{{ description }}</p>
    </div>
    <div v-if="$slots.actions" class="flex shrink-0 flex-wrap items-center gap-2">
      <slot name="actions" />
    </div>
  </header>
</template>
