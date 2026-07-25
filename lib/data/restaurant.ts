export const RESTAURANT = {
  name: 'Boteco Montreal',
  tagline: 'Sabores do Brasil',
  description: {
    pt: 'Boteco Montreal — Sabores autênticos do Brasil no coração de Montreal. Música ao vivo, cerveja gelada e a melhor comida brasileira.',
    fr: 'Boteco Montreal — Saveurs authentiques du Brésil au cœur de Montréal. Musique live, bière froide et la meilleure cuisine brésilienne.',
    en: 'Boteco Montreal — Authentic Brazilian flavors in the heart of Montreal. Live music, cold beer, and the best Brazilian food.',
  },
  address: {
    full: '5414 Av. Gatineau, Montreal, QC H3T 1L9',
    short: 'Montreal, QC H3T 1L9',
    street: '5414 Av. Gatineau',
    streetReservas: '5414 Av. Gatineau',
    city: 'Montreal',
    province: 'QC',
    postal: 'H3T 1L9',
  },
  phone: '(514) 903-0730',
  email: 'ola@botecomontreal.com',
  emailAdmin: 'admin@botecomontreal.com',
  hours: {
    mon: { label: { pt: 'Seg', fr: 'Lun', en: 'Mon' }, status: 'closed' },
    tue: { label: { pt: 'Ter', fr: 'Mar', en: 'Tue' }, hours: { pt: '15h - 23h', fr: '15h - 23h', en: '3PM - 11PM' } },
    wed: { label: { pt: 'Qua', fr: 'Mer', en: 'Wed' }, hours: { pt: '15h - 23h', fr: '15h - 23h', en: '3PM - 11PM' } },
    thu: { label: { pt: 'Qui', fr: 'Jeu', en: 'Thu' }, hours: { pt: '15h - 23h', fr: '15h - 23h', en: '3PM - 11PM' } },
    fri: { label: { pt: 'Sex', fr: 'Ven', en: 'Fri' }, hours: { pt: '15h - 01h', fr: '15h - 01h', en: '3PM - 1AM' } },
    sat: { label: { pt: 'Sáb', fr: 'Sam', en: 'Sat' }, hours: { pt: '15h - 01h', fr: '15h - 01h', en: '3PM - 1AM' } },
    sun: { label: { pt: 'Dom', fr: 'Dim', en: 'Sun' }, hours: { pt: '15h - 23h', fr: '15h - 23h', en: '3PM - 11PM' } },
  },
  social: {
    instagram: 'https://www.instagram.com/botecobrmontreal/',
    instagramHandle: '@botecobrmontreal',
    facebook: 'https://www.facebook.com/BotecoMontreal',
    hashtag: '#BOTECOMONTREAL',
  },
  rating: {
    google: 4.9,
    googleMax: 5,
    reviews: '150+',
  },
  coordinates: {
    lat: 45.5017,
    lng: -73.5673,
  },
  links: {
    website: 'https://www.botecomontreal.com',
    menu: '/menu',
    eventos: '/eventos',
    reservas: '/reservas',
  },
} as const;

export const RESTAURANT_HOURS_ARRAY = [
  { key: 'mon', closed: true },
  { key: 'tue', closed: false },
  { key: 'wed', closed: false },
  { key: 'thu', closed: false },
  { key: 'fri', closed: false },
  { key: 'sat', closed: false },
  { key: 'sun', closed: false },
] as const;
