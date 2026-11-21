<script setup lang="ts">
// Floating detail panel on the right of a workspace (map, trace). Becomes a bottom sheet on phones.
// The parent must be `relative`.
defineProps<{
  title: string
  subtitle?: string
}>()

defineEmits<{
  (e: 'close'): void
}>()
</script>

<template>
  <aside
    class="app-float absolute z-[1000] flex flex-col overflow-hidden max-md:inset-x-0 max-md:bottom-0 max-md:max-h-[75%] max-md:rounded-b-none md:bottom-3 md:right-3 md:top-3 md:w-[420px] md:max-w-[calc(100%-1.5rem)]"
    :aria-label="title">
    <header class="flex items-start gap-3 border-b border-base-300 px-4 py-3">
      <div class="min-w-0 flex-1">
        <h2 class="truncate text-base font-semibold text-base-content">{{ title }}</h2>
        <p v-if="subtitle" class="truncate text-xs text-base-content/60">{{ subtitle }}</p>
        <slot name="meta" />
      </div>
      <slot name="actions" />
      <button class="btn btn-ghost btn-sm btn-square -mr-1 text-base-content/60" aria-label="Tutup" @click="$emit('close')">
        <v-icon name="md-close" />
      </button>
    </header>
    <div class="min-h-0 flex-1 overflow-y-auto">
      <slot />
    </div>
    <footer v-if="$slots.footer" class="border-t border-base-300 px-4 py-3">
      <slot name="footer" />
    </footer>
  </aside>
</template>
