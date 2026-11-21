import './style.css'
import 'vue3-toastify/dist/index.css'

import { VueQueryPlugin } from '@tanstack/vue-query'
import { addIcons, OhVueIcon } from 'oh-vue-icons'
import {
  BiPinAngle,
  FaCalendar,
  FaList,
  FaMap,
  FaRegularTrashAlt,
  FaSearch,
  GiSoundWaves,
  HiPencilAlt,
  IoCalendarOutline,
  IoCheckmark,
  IoCloseSharp,
  IoHomeOutline,
  LaDotCircle,
  LaFilterSolid,
  MdClose,
  MdHomeOutlined,
  MdSettings,
  RiArrowLeftLine,
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiBaseStationLine,
  RiComputerLine,
  RiFileList3Line,
  RiFocus3Line,
  RiMapPin2Line,
  RiMoonLine,
  RiPulseLine,
  RiRadarLine,
  RiSettings3Line,
  RiStackLine,
  RiSunLine,
  RiTimeLine,
  WiEarthquake
} from 'oh-vue-icons/icons'
import { createPinia } from 'pinia'
import { setupCalendar } from 'v-calendar'
import { createApp } from 'vue'

import App from './App.vue'
import { useTheme } from './hooks/use-theme'
import { IS_PREVIEW } from './preview/flag'
import router from './routes'

addIcons(
  BiPinAngle,
  FaCalendar,
  FaList,
  FaMap,
  FaRegularTrashAlt,
  FaSearch,
  GiSoundWaves,
  HiPencilAlt,
  IoCalendarOutline,
  IoCheckmark,
  IoCloseSharp,
  IoHomeOutline,
  LaDotCircle,
  LaFilterSolid,
  MdClose,
  MdHomeOutlined,
  MdSettings,
  RiArrowLeftLine,
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiBaseStationLine,
  RiComputerLine,
  RiFileList3Line,
  RiFocus3Line,
  RiMapPin2Line,
  RiMoonLine,
  RiPulseLine,
  RiRadarLine,
  RiSettings3Line,
  RiStackLine,
  RiSunLine,
  RiTimeLine,
  WiEarthquake
)

useTheme() // apply saved light/dark preference before first render

const pinia = createPinia()
const app = createApp(App)
app.component('VIcon', OhVueIcon)

app.use(pinia)
app.use(setupCalendar, {})
app.use(VueQueryPlugin, {
  queryClientConfig: {
    defaultOptions: {
      queries: {
        staleTime: Infinity,
        refetchOnWindowFocus: false,
        retry: false
      }
    }
  }
})
app.use(router)

const boot = IS_PREVIEW ? import('./preview').then((m) => m.installPreview()) : Promise.resolve()
boot.then(() => app.mount('#app'))
