export const HOMEPAGE_MENUS = [
  {
    label: 'Events',
    icon: 'la-dot-circle',
    url: '/eq-view',
    live: true,
    image: '/screenshots/eq-view.png',
    description: 'Pantau gempa terbaru secara langsung atau telusuri riwayat kejadian.'
  },
  {
    label: 'Stations',
    icon: 'ri-base-station-line',
    url: '/station-view',
    live: true,
    description: 'Kelola status jaringan stasiun dan lihat aktivitas terkini.',
    image: '/screenshots/station-view.png'
  },
  {
    label: 'Trace',
    icon: 'wi-earthquake',
    url: '/trace-view',
    live: true,
    description: 'Pilih stasiun dan amati data gelombang seismik yang masuk secara real-time.',
    image: '/screenshots/trace-view.png'
  },
  {
    label: 'Origin Locator',
    icon: 'bi-pin-angle',
    url: '/origin-locator-view/events',
    live: false,
    description: 'Analisis kejadian secara interaktif, koreksi fase, lalu commit hasilnya.',
    image: '/screenshots/origin-locator-view.png'
  },
  {
    label: 'Config',
    icon: 'md-settings',
    url: '/config/user',
    live: false,
    description: 'Kelola pengguna, stasiun, dan pipeline AI pendeteksi gempa.',
    image: '/screenshots/config-view.png'
  }
]
