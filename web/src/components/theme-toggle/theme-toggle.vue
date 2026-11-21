<script setup lang="ts">
import { useTheme } from '@src/hooks/use-theme'
import { computed } from 'vue'

const { preference, cycle } = useTheme()

const ICONS = { light: 'ri-sun-line', dark: 'ri-moon-line', system: 'ri-computer-line' } as const
const LABELS = { light: 'Tema terang', dark: 'Tema gelap', system: 'Ikuti sistem' } as const

const icon = computed(() => ICONS[preference.value])
const label = computed(() => `${LABELS[preference.value]} — klik untuk ganti`)
</script>

<template>
  <button type="button" class="btn btn-ghost btn-sm btn-square" :title="label" :aria-label="label" @click="cycle">
    <v-icon :name="icon" scale="1.1" />
  </button>
</template>
