<script setup lang="ts">
import { Magnitude } from '@src/types/magnitude'

defineProps<{
  magnitudes: Magnitude[]
}>()
</script>

<template>
  <table class="app-table">
    <thead>
      <tr>
        <th>Jenis</th>
        <th class="text-right">Nilai</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="magnitude in magnitudes" :key="magnitude._id">
        <td>{{ magnitude.type }}</td>
        <td class="text-right font-medium tabular-nums">{{ magnitude.value.toFixed(2) }}</td>
      </tr>
    </tbody>
  </table>
</template>
