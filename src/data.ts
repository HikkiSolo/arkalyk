import type { MapMarker, BusRoute, DistanceTarget, CityPulse, AISuggestion, BuildingFootprint, BuildingZone, TrafficNode, RoadEdge } from './types';

export const ARKALYK_CENTER: [number, number] = [50.2486, 66.9114];

export const cityPulseData: CityPulse = {
  weather: {
    temp: 12,
    condition: 'Күн ашық',
    conditionKey: 'sunny',
    humidity: 45,
    wind: 3.2,
  },
  aqi: {
    value: 18,
    label: 'Таза ауа',
    labelKey: 'aqi-clean',
    color: '#22c55e',
  },
  badges: [
    { key: 'utilities', label: 'ЖКХ және Водоканал', status: 'Штатный режим', statusKey: 'ok', level: 'ok' },
    { key: 'transport', label: 'Қала транспорты', status: '98% на линии', statusKey: 'ok', level: 'ok' },
  ],
  transportStatus: {
    onLinePercent: 98,
    activeRoutes: ['№1', '№2', '№3'],
  },
};

export const mapMarkers: MapMarker[] = [
  // ===== Education (Indigo blue) =====
  {
    id: 'arkpi',
    lat: 50.2495,
    lng: 66.9150,
    name: { kk: 'АрҚПИ им. И. Алтынсарина', ru: 'АрҚПИ им. И. Алтынсарина' },
    category: 'education',
    description: {
      kk: 'Арқалық педагогикалық институты — қаланың жетекші жоғары оқу орны. Педагогика, филология, тарих мамандықтары',
      ru: 'Аркалыкский педагогический институт — ведущий вуз города. Специальности: педагогика, филология, история',
    },
    height: 28,
  },
  {
    id: 'torgay-college',
    lat: 50.2470,
    lng: 66.9175,
    name: { kk: 'Торғай гуманитарлық колледжі', ru: 'Торгайский гуманитарный колледж' },
    category: 'education',
    description: {
      kk: 'Гуманитарлық бағыттағы орта арнаулы оқу орны',
      ru: 'Среднее специальное учебное заведение гуманитарного профиля',
    },
    height: 20,
  },
  {
    id: 'polytech-college',
    lat: 50.2455,
    lng: 66.9185,
    name: { kk: 'Арқалық политехникалық колледжі', ru: 'Аркалыкский политехнический колледж' },
    category: 'education',
    description: {
      kk: 'Техникалық бағыттағы орта арнаулы оқу орны',
      ru: 'Среднее специальное учебное заведение технического профиля',
    },
    height: 18,
  },
  // Schools
  {
    id: 'school1',
    lat: 50.2510,
    lng: 66.9080,
    name: { kk: '№1 гимназия им. А. Байтұрсынова', ru: 'Школа-гимназия №1 им. А. Байтурсынова' },
    category: 'school',
    description: {
      kk: 'Қаланың ескі мектептерінің бірі, А. Байтұрсынов атындағы гимназия',
      ru: 'Одна из старейших школ города, гимназия им. А. Байтурсынова',
    },
    height: 14,
  },
  {
    id: 'school2',
    lat: 50.2450,
    lng: 66.9060,
    name: { kk: '№2 орта мектеп', ru: 'Общеобразовательная школа №2' },
    category: 'school',
    description: { kk: 'Қалалық орта мектеп', ru: 'Городская средняя школа' },
    height: 12,
  },
  {
    id: 'school3',
    lat: 50.2540,
    lng: 66.9070,
    name: { kk: '№3 орта мектеп', ru: 'Школа №3' },
    category: 'school',
    description: { kk: 'Қалалық орта мектеп', ru: 'Городская средняя школа' },
    height: 12,
  },
  {
    id: 'school4',
    lat: 50.2420,
    lng: 66.9130,
    name: { kk: '№4 орта мектеп', ru: 'Школа №4' },
    category: 'school',
    description: { kk: 'Қалалық орта мектеп', ru: 'Городская средняя школа' },
    height: 12,
  },
  {
    id: 'school5',
    lat: 50.2530,
    lng: 66.9140,
    name: { kk: '№5 орта мектеп', ru: 'Школа №5' },
    category: 'school',
    description: { kk: 'Қалалық орта мектеп', ru: 'Городская средняя школа' },
    height: 12,
  },
  {
    id: 'school6',
    lat: 50.2435,
    lng: 66.9085,
    name: { kk: '№6 орта мектеп', ru: 'Школа №6' },
    category: 'school',
    description: { kk: 'Қалалық орта мектеп', ru: 'Городская средняя школа' },
    height: 12,
  },
  {
    id: 'school8',
    lat: 50.2550,
    lng: 66.9160,
    name: { kk: '№8 орта мектеп', ru: 'Школа №8' },
    category: 'school',
    description: { kk: 'Қалалық орта мектеп', ru: 'Городская средняя школа' },
    height: 12,
  },
  {
    id: 'school10',
    lat: 50.2415,
    lng: 66.9190,
    name: { kk: '№10 орта мектеп', ru: 'Школа №10' },
    category: 'school',
    description: { kk: 'Қалалық орта мектеп', ru: 'Городская средняя школа' },
    height: 12,
  },
  // Arts schools
  {
    id: 'music-school',
    lat: 50.2482,
    lng: 66.9112,
    name: { kk: 'Балалар музыкалық мектебі', ru: 'Детская музыкальная школа' },
    category: 'education',
    description: {
      kk: 'Балаларға арналған музыкалық білім беру орталығы',
      ru: 'Центр музыкального образования для детей',
    },
    height: 12,
  },
  {
    id: 'art-school',
    lat: 50.2470,
    lng: 66.9108,
    name: { kk: 'Балалар көркемсурет мектебі', ru: 'Детская художественная школа' },
    category: 'education',
    description: {
      kk: 'Балаларға арналған көркемсурет білімі',
      ru: 'Художественное образование для детей',
    },
    height: 12,
  },
  // ===== Government (Slate/Navy) =====
  {
    id: 'akimat',
    lat: 50.2478,
    lng: 66.9132,
    name: { kk: 'Әкімдік', ru: 'Акимат г. Аркалык' },
    category: 'government',
    description: {
      kk: 'Арқалық қаласының әкімдігі',
      ru: 'Акимат города Аркалык',
    },
    height: 22,
  },
  {
    id: 'con',
    lat: 50.2508,
    lng: 66.9095,
    name: { kk: 'ЦОН (Бөлім №1)', ru: 'ЦОН (Отдел №1)' },
    category: 'government',
    description: {
      kk: 'Қоғамдық қызметтер орталығы. Дүйсенбі-жұма 09:00-18:00',
      ru: 'Центр обслуживания населения. Пн-Пт 09:00-18:00',
    },
    height: 16,
  },
  {
    id: 'culture-palace',
    lat: 50.2488,
    lng: 66.9105,
    name: { kk: 'Мәдениет сарайы', ru: 'Дворец культуры' },
    category: 'government',
    description: {
      kk: 'Қалалық мәдениет және іс-шаралар орталығы',
      ru: 'Городской центр культуры и мероприятий',
    },
    height: 18,
  },
  {
    id: 'park-zhenis',
    lat: 50.2490,
    lng: 66.9100,
    name: { kk: 'Жеңіс саябағы', ru: 'Парк "Жеңіс" (Парк Победы)' },
    category: 'government',
    description: { kk: 'Жеңіс саябағы — демалыс орны', ru: 'Парк Победы — место отдыха' },
    height: 8,
  },
  {
    id: 'stadium-zhiger',
    lat: 50.2520,
    lng: 66.9120,
    name: { kk: 'Жігер стадионы', ru: 'Стадион "Жигер"' },
    category: 'government',
    description: { kk: 'Қалалық спорт кешені', ru: 'Городской спортивный комплекс' },
    height: 14,
  },
  // ===== Justice (Slate/Navy) =====
  {
    id: 'prosecutor',
    lat: 50.2483,
    lng: 66.9128,
    name: { kk: 'Арқалық қаласының прокуратурасы', ru: 'Прокуратура города Аркалык' },
    category: 'justice',
    description: {
      kk: 'Қала прокуратурасы. Дүйсенбі-жұма 09:00-18:00',
      ru: 'Городская прокуратура. Пн-Пт 09:00-18:00',
    },
    height: 18,
  },
  {
    id: 'city-court',
    lat: 50.2486,
    lng: 66.9140,
    name: { kk: 'Қала соты', ru: 'Городской суд' },
    category: 'justice',
    description: {
      kk: 'Арқалық қалалық соты',
      ru: 'Аркалыкский городской суд',
    },
    height: 18,
  },
  {
    id: 'police-dept',
    lat: 50.2472,
    lng: 66.9118,
    name: { kk: 'Полиция басқармасы', ru: 'Управление полиции' },
    category: 'justice',
    description: {
      kk: 'Арқалық қалалық полиция басқармасы. 112 — шұғыл қызмет',
      ru: 'Управление полиции г. Аркалык. 112 — экстренная служба',
    },
    height: 16,
  },
  // ===== Healthcare (Rose/Red) =====
  {
    id: 'hospital',
    lat: 50.2440,
    lng: 66.9170,
    name: { kk: 'Қала ауруханасы', ru: 'Городская больница' },
    category: 'health',
    description: { kk: 'Арқалық қалалық ауруханасы. Тәулік бойы', ru: 'Аркалыкская городская больница. Круглосуточно' },
    height: 18,
  },
  {
    id: 'polyclinic',
    lat: 50.2465,
    lng: 66.9155,
    name: { kk: 'Орталық поликлиника', ru: 'Центральная поликлиника' },
    category: 'health',
    description: {
      kk: 'Қалалық орталық поликлиника. Дүйсенбі-жұма 08:00-17:00',
      ru: 'Городская центральная поликлиника. Пн-Пт 08:00-17:00',
    },
    height: 14,
  },
  // ===== Transport (Emerald/Green) =====
  {
    id: 'station',
    lat: 50.2412,
    lng: 66.9231,
    name: { kk: 'Теміржол вокзалы', ru: 'Железнодорожный вокзал Аркалык' },
    category: 'transport',
    description: { kk: 'Арқалық теміржол станциясы', ru: 'Станция Аркалык' },
    height: 12,
  },
  {
    id: 'bus-station',
    lat: 50.2460,
    lng: 66.9090,
    name: { kk: 'Автовокзал', ru: 'Автовокзал' },
    category: 'transport',
    description: { kk: 'Қалааралық автобус терминалы', ru: 'Междугородний автовокзал' },
    height: 12,
  },
  // ===== Bus Stops (Emerald/Green, smaller) =====
  {
    id: 'bus-stop-arkpi',
    lat: 50.2490,
    lng: 66.9145,
    name: { kk: 'Аялдама "АрҚПИ"', ru: 'Остановка "АрҚПИ"' },
    category: 'busStop',
    description: { kk: 'Автобус №1. пр. Абая', ru: 'Автобус №1. пр. Абая' },
    height: 6,
  },
  {
    id: 'bus-stop-akimat',
    lat: 50.2475,
    lng: 66.9128,
    name: { kk: 'Аялдама "Әкімдік / Орталық"', ru: 'Остановка "Акимат / Центр"' },
    category: 'busStop',
    description: { kk: 'Автобус №1, №4. ул. Горняков', ru: 'Автобус №1, №4. ул. Горняков' },
    height: 6,
  },
  {
    id: 'bus-stop-station',
    lat: 50.2420,
    lng: 66.9220,
    name: { kk: 'Аялдама "Теміржол вокзалы"', ru: 'Остановка "Железнодорожный вокзал"' },
    category: 'busStop',
    description: { kk: 'Автобус №2. ул. Маяковского', ru: 'Автобус №2. ул. Маяковского' },
    height: 6,
  },
  {
    id: 'bus-stop-hospital',
    lat: 50.2455,
    lng: 66.9162,
    name: { kk: 'Аялдама "Аурухана / Поликлиника"', ru: 'Остановка "Больница / Поликлиника"' },
    category: 'busStop',
    description: { kk: 'Автобус №2. ул. Ш. Жанибека', ru: 'Автобус №2. ул. Ш. Жанибека' },
    height: 6,
  },
  {
    id: 'bus-stop-market',
    lat: 50.2478,
    lng: 66.9140,
    name: { kk: 'Аялдама "Нарық / ТД Азия"', ru: 'Остановка "Рынок / ТД Азия"' },
    category: 'busStop',
    description: { kk: 'Автобус №1, №3. пр. Абая', ru: 'Автобус №1, №3. пр. Абая' },
    height: 6,
  },
  {
    id: 'bus-stop-school1',
    lat: 50.2505,
    lng: 66.9088,
    name: { kk: 'Аялдама "№1 мектеп / Байтұрсынов"', ru: 'Остановка "Школа №1 / Байтурсынов"' },
    category: 'busStop',
    description: { kk: 'Автобус №3. ул. Горняков', ru: 'Автобус №3. ул. Горняков' },
    height: 6,
  },
  {
    id: 'bus-stop-culture',
    lat: 50.2485,
    lng: 66.9110,
    name: { kk: 'Аялдама "Мәдениет сарайы"', ru: 'Остановка "Дворец культуры"' },
    category: 'busStop',
    description: { kk: 'Автобус №4. ул. Горняков', ru: 'Автобус №4. ул. Горняков' },
    height: 6,
  },
  // ===== Commerce & Banking (Amber/Orange) =====
  {
    id: 'market',
    lat: 50.2480,
    lng: 66.9145,
    name: { kk: 'Орталық нарық "Арқалық"', ru: 'Центральный рынок "Аркалык"' },
    category: 'commerce',
    description: {
      kk: 'Қалалық нарық және сауда орталығы. Күн сайын 08:00-20:00',
      ru: 'Городской рынок и торговый центр. Ежедневно 08:00-20:00',
    },
    height: 10,
  },
  {
    id: 'dastarkhan',
    lat: 50.2498,
    lng: 66.9130,
    name: { kk: 'Дастархан супермаркеті', ru: 'Супермаркет "Дастархан"' },
    category: 'commerce',
    description: {
      kk: 'Азық-түлік супермаркеті. Күн сайын 08:00-22:00',
      ru: 'Продуктовый супермаркет. Ежедневно 08:00-22:00',
    },
    height: 10,
  },
  {
    id: 'asia-mall',
    lat: 50.2468,
    lng: 66.9105,
    name: { kk: 'Азия сауда үйі', ru: 'Торговый дом "Азия"' },
    category: 'commerce',
    description: {
      kk: 'Көпәрекеттік сауда орталығы',
      ru: 'Многопрофильный торговый центр',
    },
    height: 10,
  },
  {
    id: 'zhastar-shop',
    lat: 50.2502,
    lng: 66.9168,
    name: { kk: 'Жастар дүкені', ru: 'Магазин "Жастар"' },
    category: 'commerce',
    description: {
      kk: 'Жастарға арналған дүкен',
      ru: 'Магазин для молодёжи',
    },
    height: 8,
  },
  {
    id: 'halyk-bank',
    lat: 50.2492,
    lng: 66.9120,
    name: { kk: 'Halyk Bank', ru: 'Halyk Bank' },
    category: 'commerce',
    description: {
      kk: 'Halyk Bank орталық бөлімшесі. Дүйсенбі-жұма 09:00-17:00',
      ru: 'Halyk Bank центральное отделение. Пн-Пт 09:00-17:00',
    },
    height: 12,
  },
  {
    id: 'kaspi-bank',
    lat: 50.2475,
    lng: 66.9160,
    name: { kk: 'Kaspi Bank', ru: 'Kaspi Bank' },
    category: 'commerce',
    description: {
      kk: 'Kaspi Bank бөлімшесі. Күн сайын 09:00-20:00',
      ru: 'Kaspi Bank отделение. Ежедневно 09:00-20:00',
    },
    height: 10,
  },
  // ===== Extra Commerce: Markets =====
  {
    id: 'central-market',
    lat: 50.2472,
    lng: 66.9150,
    name: { kk: 'Орталық жабық нарық', ru: 'Центральный крытый рынок Аркалыка' },
    category: 'commerce',
    description: {
      kk: 'Қаланың негізгі нарығы. Күн сайын 07:00-19:00',
      ru: 'Главный рынок города. Ежедневно 07:00-19:00',
    },
    height: 10,
  },
  {
    id: 'trade-row',
    lat: 50.2465,
    lng: 66.9130,
    name: { kk: 'Сауда жолағы "Ветлаборатория"', ru: 'Торговый комплекс "Ветлаборатория / Торговый ряд"' },
    category: 'commerce',
    description: {
      kk: 'Сауда жолағы және дүкендер жиынтығы',
      ru: 'Торговый ряд и комплекс магазинов',
    },
    height: 8,
  },
  {
    id: 'ortalyk-bazar',
    lat: 50.2485,
    lng: 66.9160,
    name: { kk: '"Орталық Базар" нарығы', ru: 'Рынок "Орталық Базар"' },
    category: 'commerce',
    description: {
      kk: 'Азық-түлік жәе киім нарығы. Күн сайын 08:00-18:00',
      ru: 'Продуктовый и вещевой рынок. Ежедневно 08:00-18:00',
    },
    height: 8,
  },
  // ===== Religion & Culture (Teal/Cyan) =====
  {
    id: 'city-mosque',
    lat: 50.2460,
    lng: 66.9120,
    name: { kk: 'Арқалық қалалық мешіті', ru: 'Городская мечеть г. Аркалык' },
    category: 'religion',
    description: {
      kk: 'Қаланың бас мешіті. Барлық мұсылман қауымына ашық',
      ru: 'Главная мечеть города. Открыта для всей мусульманской общины',
    },
    height: 16,
  },
  {
    id: 'trinity-church',
    lat: 50.2500,
    lng: 66.9100,
    name: { kk: 'Қасиетті Үшбірлік шіркеуі', ru: 'Храм Святой Троицы / Православная церковь' },
    category: 'religion',
    description: {
      kk: 'Қаланың православиелік шіркеуі. Жексенбі құдайқұлышылық 09:00',
      ru: 'Православный храм города. Воскресная служба 09:00',
    },
    height: 14,
  },
];

export const busRoutes: BusRoute[] = [
  {
    id: '1',
    number: '№1',
    route: { kk: 'Автовокзал → АрҚПИ → Орталық', ru: 'Автовокзал → АрҚПИ → Центр' },
    schedule: '06:00 - 22:00',
    interval: '15 мин',
    color: '#3b82f6',
  },
  {
    id: '2',
    number: '№2',
    route: { kk: 'Теміржол вокзалы → Аурухана → Әкімдік', ru: 'Вокзал → Больница → Акимат' },
    schedule: '06:30 - 21:00',
    interval: '20 мин',
    color: '#10b981',
  },
  {
    id: '3',
    number: '№3',
    route: { kk: 'Гимназия №5 → Мектеп №1 → Автовокзал', ru: 'Гимназия №5 → Школа №1 → Автовокзал' },
    schedule: '07:00 - 20:00',
    interval: '25 мин',
    color: '#f59e0b',
  },
  {
    id: '4',
    number: '№4',
    route: { kk: 'Стадион → Саябақ → Әкімдік', ru: 'Стадион → Парк → Акимат' },
    schedule: '07:00 - 19:00',
    interval: '30 мин',
    color: '#ef4444',
  },
];

export const distanceTargets: DistanceTarget[] = [
  { id: 'astana', name: { kk: 'Астана', ru: 'Астана' }, lat: 51.1605, lng: 71.4704, distanceKm: 480, driveHours: 6 },
  { id: 'kostanay', name: { kk: 'Қостанай', ru: 'Костанай' }, lat: 53.1959, lng: 63.6258, distanceKm: 450, driveHours: 5.5 },
  { id: 'almaty', name: { kk: 'Алматы', ru: 'Алматы' }, lat: 43.2220, lng: 76.8512, distanceKm: 1550, driveHours: 19 },
  { id: 'shymkent', name: { kk: 'Шымкент', ru: 'Шымкент' }, lat: 42.3417, lng: 69.59, distanceKm: 1200, driveHours: 15 },
  { id: 'karaganda', name: { kk: 'Қарағанды', ru: 'Караганда' }, lat: 49.8047, lng: 73.1094, distanceKm: 600, driveHours: 7.5 },
  { id: 'aktobe', name: { kk: 'Ақтөбе', ru: 'Актобе' }, lat: 50.2839, lng: 57.2070, distanceKm: 780, driveHours: 9.5 },
  { id: 'atyrau', name: { kk: 'Атырау', ru: 'Атырау' }, lat: 47.1164, lng: 51.8691, distanceKm: 1300, driveHours: 16 },
  { id: 'aktau', name: { kk: 'Ақтау', ru: 'Актау' }, lat: 43.6521, lng: 51.1539, distanceKm: 1700, driveHours: 21 },
  { id: 'pavlodar', name: { kk: 'Павлодар', ru: 'Павлодар' }, lat: 52.2873, lng: 76.9697, distanceKm: 900, driveHours: 11 },
  { id: 'uskemen', name: { kk: 'Өскемен', ru: 'Усть-Каменогорск' }, lat: 49.9801, lng: 82.6019, distanceKm: 1300, driveHours: 16 },
  { id: 'semey', name: { kk: 'Семей', ru: 'Семей' }, lat: 50.4117, lng: 80.2247, distanceKm: 1100, driveHours: 14 },
  { id: 'taraz', name: { kk: 'Тараз', ru: 'Тараз' }, lat: 42.9035, lng: 71.3667, distanceKm: 1100, driveHours: 14 },
  { id: 'kyzylorda', name: { kk: 'Қызылорда', ru: 'Кызылорда' }, lat: 44.8528, lng: 65.5059, distanceKm: 850, driveHours: 10.5 },
  { id: 'oral', name: { kk: 'Орал', ru: 'Уральск' }, lat: 51.2346, lng: 51.3658, distanceKm: 1150, driveHours: 14 },
  { id: 'petropavl', name: { kk: 'Петропавл', ru: 'Петропавловск' }, lat: 54.8734, lng: 69.1505, distanceKm: 780, driveHours: 9.5 },
  { id: 'torgay', name: { kk: 'Торғай', ru: 'Торгай' }, lat: 50.4500, lng: 65.9700, distanceKm: 290, driveHours: 3.5 },
  { id: 'zhezkazgan', name: { kk: 'Жезқазған', ru: 'Жезказган' }, lat: 47.7836, lng: 67.7106, distanceKm: 330, driveHours: 4 },
];

export const FUEL_PRICE_PER_LITER = 215;
export const FUEL_CONSUMPTION_PER_100KM = 8.5;

export const emergencyNumbers = [
  { service: 'Полиция / Полиция', number: '102' },
  { service: 'Скорая помощь / Жедел жәрдем', number: '103' },
  { service: 'Пожарная служба / Өрт сөндіру', number: '101' },
  { service: 'Шұғыл қызмет / Экстренные службы', number: '112' },
];

export const buildingFootprints: BuildingFootprint[] = [
  {
    id: 'bld-arkpi',
    lat: 50.2495,
    lng: 66.9150,
    name: { kk: 'АрҚПИ кампусы', ru: 'Корпус АрҚПИ' },
    footprint: [
      [50.2498, 66.9145], [50.2498, 66.9158],
      [50.2491, 66.9158], [50.2491, 66.9145],
    ],
    height: 28,
    color: '#4f46e5',
    zones: [
      { nameKk: 'Негізгі корпус', nameRu: 'Главный корпус' },
      { nameKk: 'Қабылдау комиссиясы', nameRu: 'Приёмная комиссия' },
      { nameKk: 'Ректорат', nameRu: 'Ректорат' },
      { nameKk: 'Кітапхана', nameRu: 'Библиотека' },
    ],
  },
  {
    id: 'bld-akimat',
    lat: 50.2478,
    lng: 66.9132,
    name: { kk: 'Әкімдік ғимараты', ru: 'Здание Акимата' },
    footprint: [
      [50.2481, 66.9128], [50.2481, 66.9138],
      [50.2474, 66.9138], [50.2474, 66.9128],
    ],
    height: 22,
    color: '#475569',
    zones: [
      { nameKk: 'Әкім кабинеті', nameRu: 'Кабинет акима' },
      { nameKk: 'Қабылдау бөлмесі', nameRu: 'Приёмная' },
      { nameKk: 'Құжаттар бөлімі', nameRu: 'Отдел документов' },
    ],
  },
  {
    id: 'bld-station',
    lat: 50.2412,
    lng: 66.9231,
    name: { kk: 'Вокзал ғимараты', ru: 'Здание вокзала' },
    footprint: [
      [50.2416, 66.9225], [50.2416, 66.9238],
      [50.2407, 66.9238], [50.2407, 66.9225],
    ],
    height: 16,
    color: '#10b981',
    zones: [
      { nameKk: 'Кассалар залы', nameRu: 'Зал касс' },
      { nameKk: 'Күту залы', nameRu: 'Зал ожидания' },
      { nameKk: 'Билеттер', nameRu: 'Кассы билетов' },
    ],
  },
  {
    id: 'bld-market',
    lat: 50.2480,
    lng: 66.9145,
    name: { kk: 'Нарық ғимараты', ru: 'Здание рынка' },
    footprint: [
      [50.2484, 66.9140], [50.2484, 66.9152],
      [50.2475, 66.9152], [50.2475, 66.9140],
    ],
    height: 12,
    color: '#f59e0b',
  },
  {
    id: 'bld-hospital',
    lat: 50.2440,
    lng: 66.9170,
    name: { kk: 'Аурухана ғимараты', ru: 'Здание больницы' },
    footprint: [
      [50.2444, 66.9162], [50.2444, 66.9178],
      [50.2435, 66.9178], [50.2435, 66.9162],
    ],
    height: 18,
    color: '#f43f5e',
  },
  {
    id: 'bld-trc',
    lat: 50.2468,
    lng: 66.9105,
    name: { kk: 'ТРЦ Азия', ru: 'ТРЦ Азия' },
    footprint: [
      [50.2472, 66.9100], [50.2472, 66.9110],
      [50.2463, 66.9110], [50.2463, 66.9100],
    ],
    height: 14,
    color: '#f59e0b',
    zones: [
      { nameKk: 'Сауда залы', nameRu: 'Торговый зал' },
      { nameKk: 'Азық-түлік бөлімі', nameRu: 'Продуктовый отдел' },
      { nameKk: 'Киім бөлімі', nameRu: 'Отдел одежды' },
      { nameKk: 'Кассалар', nameRu: 'Кассы' },
    ],
  },
  {
    id: 'bld-mosque',
    lat: 50.2460,
    lng: 66.9120,
    name: { kk: 'Мешіт', ru: 'Мечеть' },
    footprint: [
      [50.2464, 66.9115], [50.2464, 66.9125],
      [50.2456, 66.9125], [50.2456, 66.9115],
    ],
    height: 16,
    color: '#0d9488',
    zones: [
      { nameKk: 'Намаз залы', nameRu: 'Молитвенный зал' },
      { nameKk: 'Мінбір', nameRu: 'Минбар' },
      { nameKk: 'Әйелдер бөлімі', nameRu: 'Женский зал' },
    ],
  },
];

// Road network nodes with proper graph edges for Dijkstra routing
export const roadNodes: [number, number][] = [
  // пр. Абая (main east-west avenue) — indices 0-5
  [50.2410, 66.9060], [50.2430, 66.9080], [50.2450, 66.9100],
  [50.2470, 66.9120], [50.2490, 66.9140], [50.2510, 66.9160],
  // ул. Горняков (north-south) — indices 6-11
  [50.2520, 66.9100], [50.2500, 66.9110], [50.2480, 66.9120],
  [50.2460, 66.9130], [50.2440, 66.9140], [50.2420, 66.9150],
  // ул. Ш. Жанибека (diagonal SE) — indices 12-14
  [50.2470, 66.9140], [50.2460, 66.9155], [50.2450, 66.9170],
  // ул. Маяковского (south to station) — indices 15-17
  [50.2450, 66.9180], [50.2430, 66.9200], [50.2415, 66.9220],
  // ул. Ауелбекова (north stretch) — indices 18-20
  [50.2500, 66.9100], [50.2520, 66.9110], [50.2540, 66.9120],
  // Абылай хана (connecting west) — indices 21-23
  [50.2480, 66.9080], [50.2460, 66.9060], [50.2440, 66.9060],
];

// Bidirectional road edges (both road+pedestrian unless marked otherwise)
export const roadEdges: RoadEdge[] = [
  // пр. Абая
  { from: 0, to: 1, type: 'road' }, { from: 1, to: 2, type: 'road' },
  { from: 2, to: 3, type: 'road' }, { from: 3, to: 4, type: 'road' },
  { from: 4, to: 5, type: 'road' },
  // ул. Горняков
  { from: 6, to: 7, type: 'road' }, { from: 7, to: 8, type: 'road' },
  { from: 8, to: 9, type: 'road' }, { from: 9, to: 10, type: 'road' },
  { from: 10, to: 11, type: 'road' },
  // ул. Ш. Жанибека
  { from: 12, to: 13, type: 'road' }, { from: 13, to: 14, type: 'road' },
  // ул. Маяковского
  { from: 15, to: 16, type: 'road' }, { from: 16, to: 17, type: 'road' },
  // ул. Ауелбекова
  { from: 18, to: 19, type: 'road' }, { from: 19, to: 20, type: 'road' },
  // Абылай хана
  { from: 21, to: 22, type: 'road' }, { from: 22, to: 23, type: 'road' },
  // Cross-street connections (intersections)
  { from: 2, to: 23, type: 'road' }, { from: 3, to: 9, type: 'road' },
  { from: 4, to: 12, type: 'road' }, { from: 3, to: 21, type: 'road' },
  { from: 7, to: 18, type: 'road' }, { from: 8, to: 4, type: 'road' },
  { from: 9, to: 15, type: 'road' }, { from: 10, to: 15, type: 'pedestrian' },
  { from: 14, to: 15, type: 'road' }, { from: 11, to: 17, type: 'pedestrian' },
  { from: 9, to: 12, type: 'pedestrian' }, { from: 8, to: 21, type: 'pedestrian' },
];

// Traffic lights and crosswalks at major intersections
export const trafficNodes: TrafficNode[] = [
  { id: 'tl-1', lat: 50.2470, lng: 66.9120, type: 'trafficLight' },
  { id: 'tl-2', lat: 50.2490, lng: 66.9140, type: 'trafficLight' },
  { id: 'tl-3', lat: 50.2460, lng: 66.9130, type: 'trafficLight' },
  { id: 'tl-4', lat: 50.2450, lng: 66.9100, type: 'trafficLight' },
  { id: 'cw-1', lat: 50.2480, lng: 66.9120, type: 'crosswalk' },
  { id: 'cw-2', lat: 50.2500, lng: 66.9110, type: 'crosswalk' },
  { id: 'cw-3', lat: 50.2470, lng: 66.9140, type: 'crosswalk' },
  { id: 'cw-4', lat: 50.2450, lng: 66.9170, type: 'crosswalk' },
  { id: 'cw-5', lat: 50.2430, lng: 66.9200, type: 'crosswalk' },
  { id: 'cw-6', lat: 50.2440, lng: 66.9140, type: 'crosswalk' },
];

export const aiSuggestions: AISuggestion[] = [
  {
    question: { kk: 'АрҚПИ қайда орналасқан?', ru: 'Где находится АрҚПИ?' },
    answer: {
      kk: 'Арқалық педагогикалық институты қаланың солтүстік бөлігінде орналасқан. Картадан индего (көк) маркерді көре аласыз. Автобус №1 бағытымен жетуге болады. АрҚПИ педагогика, филология және тарих мамандықтарын ұсынады.',
      ru: 'Аркалыкский педагогический институт находится в северной части города. На карте вы можете увидеть индиго (синий) маркер. Добраться можно автобусом №1. АрҚПИ предлагает специальности: педагогика, филология, история.',
    },
  },
  {
    question: { kk: 'Қостанайға қанша уақыт кетеді?', ru: 'Сколько времени до Костаная?' },
    answer: {
      kk: 'Арқалықтан Қостанайға дейін шамамен 450 км, көлікпен 5.5 сағат. Отын шығыны шамамен 8 200 теңге (АИ-92, 215 ₸/л, 8.5 л/100км).',
      ru: 'От Аркалыка до Костаная примерно 450 км, на машине 5.5 часа. Расход топлива около 8 200 тенге (АИ-92, 215 ₸/л, 8.5 л/100км).',
    },
  },
  {
    question: { kk: 'Автобус кестесі қандай?', ru: 'Какое расписание автобусов?' },
    answer: {
      kk: 'Қалада 4 автобус бағыты жұмыс істейді. №1: 06:00-22:00 әр 15 мин, №2: 06:30-21:00 әр 20 мин, №3: 07:00-20:00 әр 25 мин, №4: 07:00-19:00 әр 30 мин. Толық кестені көлік бөлімінен қараңыз.',
      ru: 'В городе 4 автобусных маршрута. №1: 06:00-22:00 каждые 15 мин, №2: 06:30-21:00 каждые 20 мин, №3: 07:00-20:00 каждые 25 мин, №4: 07:00-19:00 каждые 30 мин. Полное расписание смотрите в разделе транспорта.',
    },
  },
  {
    question: { kk: 'Ауа райы қалай?', ru: 'Какая погода?' },
    answer: {
      kk: 'Қазір Арқалықта +12°C, күн ашық. Ылғалдылық 45%, жел 3.2 м/с. Ауа сапасы таза (AQI 18).',
      ru: 'Сейчас в Аркалыке +12°C, ясно. Влажность 45%, ветер 3.2 м/с. Качество воздуха чистое (AQI 18).',
    },
  },
  {
    question: { kk: 'Арқалықта нені көруге болады?', ru: 'Что посетить в Аркалыке?' },
    answer: {
      kk: 'Арқалықта Жеңіс саябағы, Жігер стадионы, Мәдениет сарайы және АрҚПИ кампусын көруге болады. Сондай-ақ Орталық нарықта жергілікті тауарларды сатып алуға болады.',
      ru: 'В Аркалыке стоит посетить парк Жеңіс, стадион Жигер, дворец культуры и кампус АрҚПИ. Также на Центральном рынке можно купить местные товары.',
    },
  },
  {
    question: { kk: 'Прокуратура қайда?', ru: 'Где прокуратура?' },
    answer: {
      kk: 'Арқалық қаласының прокуратурасы қала орталығында орналасқан. Картадан қара-көк маркерден таба аласыз. Жұмыс уақыты: дүйсенбі-жұма 09:00-18:00.',
      ru: 'Прокуратура города Аркалык находится в центре города. На карте найдёте по тёмно-синему маркеру. Часы работы: пн-пт 09:00-18:00.',
    },
  },
  {
    question: { kk: 'Қайда оқуға болады?', ru: 'Куда поступить в Аркалыке?' },
    answer: {
      kk: 'Арқалықта АрҚПИ им. И. Алтынсарина (педагогика, филология, тарих), Торғай гуманитарлық колледжі және Арқалық политехникалық колледжі бар. Сондай-ақ музыкалық және көркемсурет мектептері жұмыс істейді.',
      ru: 'В Аркалыке есть АрҚПИ им. И. Алтынсарина (педагогика, филология, история), Торгайский гуманитарный колледж и Аркалыкский политехнический колледж. Также работают музыкальная и художественная школы.',
    },
  },
];
