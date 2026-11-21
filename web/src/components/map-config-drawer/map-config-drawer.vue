<script setup lang="ts">
// Map layer switcher: a small popover anchored under the map toolbar (top right).
type SettingName = 'volcanoes' | 'trench' | 'plateBoundaries' | 'pusgen'

const props = defineProps<{
  value: Record<string, boolean>
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'change', name: SettingName, value: boolean): void
}>()

const OPTIONS = [
  { label: 'Gunung api', hint: 'Segitiga merah', name: 'volcanoes' },
  { label: 'Palung', hint: 'Zona subduksi', name: 'trench' },
  { label: 'Batas lempeng', hint: 'Lempeng tektonik', name: 'plateBoundaries' },
  { label: 'Sesar aktif (Pusgen)', hint: 'Peta sumber gempa 2017', name: 'pusgen' }
] as const

const onToggle = (name: SettingName) => {
  emit('change', name, !props.value[name])
}
</script>

<template>
  <div class="app-float absolute right-14 top-3 z-[1001] w-72 max-w-[calc(100%-1.5rem)] p-1" role="dialog" aria-label="Lapisan peta">
    <div class="flex items-center justify-between px-3 pb-1 pt-2">
      <span class="app-section-title">Lapisan peta</span>
      <button class="btn btn-ghost btn-xs btn-square text-base-content/60" aria-label="Tutup" @click="emit('close')">
        <v-icon name="md-close" scale="0.85" />
      </button>
    </div>
    <label
      v-for="option in OPTIONS"
      :key="option.name"
      class="flex cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2 hover:bg-base-200/70">
      <span class="min-w-0">
        <span class="block text-sm font-medium text-base-content">{{ option.label }}</span>
        <span class="block text-xs text-base-content/55">{{ option.hint }}</span>
      </span>
      <input
        type="checkbox"
        class="toggle toggle-sm toggle-primary"
        :checked="value[option.name] ?? false"
        @change="onToggle(option.name)" />
    </label>
  </div>
</template>
