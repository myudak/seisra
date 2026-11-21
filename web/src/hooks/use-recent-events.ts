import { getAllEventListAPI } from '@src/api-service/event'
import { EarthQuakeEvent } from '@src/types/event'
import { getOriginTimeFromEvent, newISODate } from '@src/utils/string'
import { useQuery } from '@tanstack/vue-query'
import { endOfDay, startOfDay, subDays } from 'date-fns'

export const RECENT_EVENT_DAYS = 7

const originMs = (event: EarthQuakeEvent) => {
  const origin = getOriginTimeFromEvent(event)
  return origin ? newISODate(origin).getTime() : 0
}

/**
 * Events from the last 7 days, newest first. Shared by the home dashboard and the
 * navbar's latest-event chip (one cache entry), refreshed every minute.
 */
const useRecentEvents = () =>
  useQuery({
    queryKey: ['events', 'recent', RECENT_EVENT_DAYS],
    queryFn: async () => {
      const now = new Date()
      const response = await getAllEventListAPI({
        page: 1,
        totalPerPage: 1000,
        startDate: startOfDay(subDays(now, RECENT_EVENT_DAYS - 1)).toISOString(),
        endDate: endOfDay(now).toISOString()
      })
      return [...(response.data ?? [])].sort((a, b) => originMs(b) - originMs(a))
    },
    staleTime: 30_000,
    refetchInterval: 60_000
  })

export { originMs }
export default useRecentEvents
