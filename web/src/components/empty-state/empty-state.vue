<script setup lang="ts">
withDefaults(
  defineProps<{
    title: string
    description?: string
    icon?: string
    loading?: boolean
  }>(),
  { description: '', icon: 'fa-search', loading: false }
)
</script>

<template>
  <div class="flex flex-col items-center justify-center gap-2 px-4 py-12 text-center">
    <div class="mb-1 flex h-11 w-11 items-center justify-center rounded-full bg-base-200 text-base-content/50">
      <span v-if="loading" class="loading loading-spinner loading-sm" />
      <v-icon v-else :name="icon" scale="1.1" />
    </div>
    <p class="text-sm font-semibold text-base-content">{{ title }}</p>
    <p v-if="description" class="max-w-sm text-sm text-base-content/60">{{ description }}</p>
    <slot />
  </div>
</template>
