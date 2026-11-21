<script setup lang="ts">
// Navbar chip with the newest event in the last 7 days; links to its analysis page.
import useRecentEvents from '@src/hooks/use-recent-events'
import { formatMagnitude, getDisplayMagnitude, getOriginTimeFromEvent, newISODate, timeAgo } from '@src/utils/string'
import { useNow } from '@vueuse/core'
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

const { data } = useRecentEvents()
const now = useNow({ interval: 30_000 })

const latest = computed(() => data.value?.[0] ?? null)
const origin = computed(() => {
  const value = latest.value ? getOriginTimeFromEvent(latest.value) : null
  return value ? newISODate(value) : null
})
</script>

<template>
  <RouterLink
    v-if="latest"
    :to="`/origin-locator-view/location/${latest._id}`"
    class="inline-flex max-w-[340px] items-center gap-2 rounded-full border border-base-300 bg-base-100 py-1 pl-1 pr-3 text-xs text-base-content/70 transition-colors hover:border-primary/40 hover:text-base-content"
    :title="`Gempa terbaru: ${[latest.sub_region, latest.region].filter(Boolean).join(', ')}`">
    <span class="rounded-full bg-primary/10 px-2 py-0.5 font-bold tabular-nums text-primary">
      M {{ formatMagnitude(getDisplayMagnitude(latest.magnitudes)?.value) }}
    </span>
    <span class="truncate font-medium text-base-content">{{ latest.sub_region || latest.region }}</span>
    <span v-if="origin" class="shrink-0 tabular-nums">{{ timeAgo(origin, now) }}</span>
  </RouterLink>
</template>
