import { PipelineViewPage } from '@src/domain/config-view/pipeline-view-page'
import { ConfigStationViewPage } from '@src/domain/config-view/station-view-page'
import { UserViewPage } from '@src/domain/config-view/user-view-page'
import { EQViewPage } from '@src/domain/eq-view/eq-view-page'
import { OriginLocatorViewPage } from '@src/domain/origin-locator-view/origin-locator-view-page'
import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

import { HomePage } from '../domain/home/home-page'
import { StationViewPage } from '../domain/station-view/station-view-page'
import { TraceViewPage } from '../domain/trace-view/trace-view-page'

// Authentication is decided in App.vue (no profile → login screen on any URL),
// so there is no separate /login page inside the signed-in shell.
const routes: RouteRecordRaw[] = [
  { path: '/', name: 'home', component: HomePage, meta: { title: 'Beranda' } },
  { path: '/login', redirect: '/' },

  { path: '/eq-view', name: 'events', component: EQViewPage, meta: { title: 'Events' } },
  { path: '/station-view', name: 'stations', component: StationViewPage, meta: { title: 'Stations' } },
  { path: '/trace-view', name: 'trace', component: TraceViewPage, meta: { title: 'Trace' } },

  { path: '/origin-locator-view', redirect: '/origin-locator-view/events' },
  {
    path: '/origin-locator-view/events',
    name: 'locator-events',
    component: OriginLocatorViewPage,
    meta: { title: 'Origin Locator' }
  },
  {
    path: '/origin-locator-view/:tab(location|magnitude|picking)/:id',
    name: 'locator-event',
    component: OriginLocatorViewPage,
    meta: { title: 'Origin Locator' }
  },
  // An event tab without an id has nothing to show: send it to the list.
  { path: '/origin-locator-view/:tab(location|magnitude|picking)', redirect: '/origin-locator-view/events' },

  { path: '/config', redirect: '/config/user' },
  { path: '/config/user', name: 'config-user', component: UserViewPage, meta: { title: 'Pengguna' } },
  { path: '/config/station', name: 'config-station', component: ConfigStationViewPage, meta: { title: 'Stasiun' } },
  { path: '/config/pipeline', name: 'config-pipeline', component: PipelineViewPage, meta: { title: 'AI Pipeline' } },

  { path: '/:pathMatch(.*)*', redirect: '/' }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.afterEach((to) => {
  const title = to.meta.title as string | undefined
  document.title = title ? `${title} · Lindu` : 'Lindu'
})

export default router
