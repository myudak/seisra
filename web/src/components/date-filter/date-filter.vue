<script setup lang="ts">
import 'v-calendar/style.css'

import { format as formatDate } from 'date-fns'
import { DatePicker } from 'v-calendar'
import { defineModel, ref } from 'vue'

const range = defineModel<{
  start: Date
  end: Date
}>('range', { default: () => ({ start: new Date(), end: new Date() }) })

const hasError = ref(false)
</script>

<template>
  <div>
    <DatePicker
      v-if="!hasError"
      v-model.range="range"
      @error="hasError = true">
      <template #default="{ togglePopover }">
        <button
          class="btn btn-sm h-9 min-h-9 gap-2 border-base-300 bg-base-100 font-medium text-base-content shadow-sm hover:border-base-300 hover:bg-base-200"
          @click="togglePopover">
          <v-icon name="io-calendar-outline" class="text-base-content/60" />
          {{ formatDate(range?.start ?? new Date(), 'dd MMM yyyy') }} -
          {{ formatDate(range?.end ?? new Date(), 'dd MMM yyyy') }}
        </button>
      </template>
    </DatePicker>

    <!-- Fallback input when v-calendar fails -->
    <div v-else class="flex gap-2">
      <input
        type="date"
        :value="formatDate(range?.start ?? new Date(), 'yyyy-MM-dd')"
        @input="(e: Event) => { const d = new Date((e.target as HTMLInputElement).value); if (!isNaN(d.getTime())) range.start = d }"
        class="input input-sm input-bordered" />
      <span>–</span>
      <input
        type="date"
        :value="formatDate(range?.end ?? new Date(), 'yyyy-MM-dd')"
        @input="(e: Event) => { const d = new Date((e.target as HTMLInputElement).value); if (!isNaN(d.getTime())) range.end = d }"
        class="input input-sm input-bordered" />
    </div>
  </div>
</template>
