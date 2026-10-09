import { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Sparkles, Navigation } from 'lucide-react';
import { useLang } from '@/context/LanguageContext';
import { aiSuggestions, mapMarkers, busRoutes, distanceTargets, cityPulseData, emergencyNumbers } from '@/data';
import type { Lang } from '@/types';

interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
  navMarkerId?: string;
}

interface IntentRule {
  keywords: string[];
  weight?: number;
  answer: (lang: Lang) => string;
}

function normalize(s: string): string {
  return s.toLowerCase().trim()
    .replace(/ё/g, 'е')
    .replace(/ә/g, 'а')
    .replace(/і/g, 'и')
    .replace(/ң/g, 'н')
    .replace(/ғ/g, 'г')
    .replace(/ү/g, 'у')
    .replace(/ұ/g, 'у')
    .replace(/қ/g, 'к')
    .replace(/ө/g, 'о')
    .replace(/h/g, '');
}

function fuzzyMatch(query: string, keyword: string): boolean {
  const q = normalize(query);
  const k = normalize(keyword);
  if (q.includes(k)) return true;
  if (q.length > 3 && k.length > 3) {
    let matches = 0;
    for (let i = 0; i < k.length - 1; i++) {
      if (q.includes(k.substring(i, i + 2))) matches++;
    }
    return matches >= Math.ceil(k.length * 0.4);
  }
  return false;
}

function findMarkersByQuery(query: string) {
  const q = normalize(query);
  return mapMarkers.filter(
    (m) =>
      normalize(m.name.kk).includes(q) ||
      normalize(m.name.ru).includes(q) ||
      normalize(m.description.kk).includes(q) ||
      normalize(m.description.ru).includes(q)
  );
}

// Slang / abbreviation / typo resolver — maps informal terms to marker IDs
const slangMap: { patterns: string[]; markerId: string; labelKk: string; labelRu: string }[] = [
  { patterns: ['пед', 'арпи', 'пединститут', 'педагог', 'куда поступить', 'куды поступить', 'окуга'], markerId: 'arkpi', labelKk: 'АрҚПИ им. И. Алтынсарина', labelRu: 'АрҚПИ им. И. Алтынсарина' },
  { patterns: ['базар', 'орталык базар', 'рынок', 'нарык', 'где покушать', 'покушать', 'азык'], markerId: 'market', labelKk: 'Орталық нарық', labelRu: 'Центральный рынок' },
  { patterns: ['больничка', 'црб', 'поликлиник', 'больниц', 'аурухан', 'врач', 'даригер', 'скорая'], markerId: 'hospital', labelKk: 'Қала ауруханасы', labelRu: 'Городская больница' },
  { patterns: ['вокзал', 'поезд', 'темиржол', 'станци', 'жол'], markerId: 'station', labelKk: 'Теміржол вокзалы', labelRu: 'Железнодорожный вокзал' },
  { patterns: ['цон', 'справка', 'паспорт', 'документ', 'кужат', 'госуслуг', 'акон'], markerId: 'con', labelKk: 'ЦОН (Бөлім №1)', labelRu: 'ЦОН (Отдел №1)' },
  { patterns: ['акимат', 'аким', 'әкимдік', 'администрац'], markerId: 'akimat', labelKk: 'Әкімдік', labelRu: 'Акимат г. Аркалык' },
  { patterns: ['каспи', 'kaspi', 'банк', 'снять бабки', 'бабки', 'деньги', 'акша', 'теңге'], markerId: 'kaspi-bank', labelKk: 'Kaspi Bank', labelRu: 'Kaspi Bank' },
  { patterns: ['халык', 'halyk', 'halik'], markerId: 'halyk-bank', labelKk: 'Halyk Bank', labelRu: 'Halyk Bank' },
  { patterns: ['трц', 'азия', 'торговый', 'сауда', 'магазин', 'дастархан', 'супермаркет'], markerId: 'asia-mall', labelKk: 'Азия сауда үйі', labelRu: 'Торговый дом "Азия"' },
  { patterns: ['мечет', 'мешіт', 'месџит', 'намаз', 'ислам', 'мусулман'], markerId: 'city-mosque', labelKk: 'Қалалық мешіт', labelRu: 'Городская мечеть' },
  { patterns: ['церков', 'шіркеу', 'храм', 'троиц', 'православ', 'бог'], markerId: 'trinity-church', labelKk: 'Үшбірлік шіркеуі', labelRu: 'Храм Святой Троицы' },
  { patterns: ['прокуратур', 'прокурор', 'сот', 'суд', 'полици', 'полиц', 'закон', 'адилет'], markerId: 'prosecutor', labelKk: 'Прокуратура', labelRu: 'Прокуратура' },
  { patterns: ['стадион', 'жигер', 'спорт', 'дене'], markerId: 'stadium-zhiger', labelKk: 'Жігер стадионы', labelRu: 'Стадион "Жигер"' },
  { patterns: ['парк', 'саябак', 'женис', 'жеңіс', 'побед', 'демалыс'], markerId: 'park-zhenis', labelKk: 'Жеңіс саябағы', labelRu: 'Парк "Жеңіс"' },
  { patterns: ['автовокзал', 'автобус терминал', 'колик терминал'], markerId: 'bus-station', labelKk: 'Автовокзал', labelRu: 'Автовокзал' },
  { patterns: ['аялдама', 'останов', 'тачка', 'автобус аялдамасы', 'bus stop'], markerId: 'bus-stop-akimat', labelKk: 'Аялдама "Әкімдік"', labelRu: 'Остановка "Акимат"' },
];

function resolveSlang(query: string): { markerId: string; labelKk: string; labelRu: string } | null {
  const q = normalize(query);
  for (const entry of slangMap) {
    for (const pat of entry.patterns) {
      if (q.includes(normalize(pat))) return entry;
    }
  }
  return null;
}

const intentRules: IntentRule[] = [
  // Greetings
  {
    keywords: ['привет', 'салем', 'hello', 'hi', 'здравствуй', 'калайсыз', 'что ты умеешь', 'не умеешь', 'помочь', 'көмектес'],
    answer: (lang) => lang === 'kk'
      ? 'Сәлем! Мен Арқалық қаласының ЖИ көмекшісімін. Мен көмектесе аламын: көлік кестесі, білім беру мекемелері, денсаулық сақтау, сауда орталықтары, қашықтық есептеу, ауа райы, экстрендік қызметтер, прокуратура және сот туралы ақпарат. Сұрауыңызды жазыңыз!'
      : 'Здравствуйте! Я ИИ-помощник города Аркалык. Я могу помочь с: расписанием транспорта, образовательными учреждениями, здравоохранением, торговыми точками, расчётом расстояний, погодой, экстренными службами, прокуратурой и судом. Напишите свой вопрос!',
  },
  // Emergency
  {
    keywords: ['экстрен', 'шұғыл', 'телефон', 'вызвать', 'скор', 'пожар', '112', '101', '102', '103', 'полиция', 'помощь'],
    answer: (lang) => {
      const nums = emergencyNumbers.map((e) => `${e.number} — ${e.service}`).join('\n');
      return lang === 'kk'
        ? `Шұғыл қызметтердің телефон нөмірлері:\n${nums}\nЖедел қызмет 112 — барлық шұғыл жағдайлар үшін.`
        : `Телефоны экстренных служб:\n${nums}\nЕдиный номер 112 — для всех экстренных случаев.`;
    },
  },
  // Routes & Transport
  {
    keywords: ['как доехать', 'калай бару', 'доехать до', 'вокзал', 'станци', 'темиржол', 'жол', 'автобус', 'колик', 'транспорт', 'расписан', 'кесте', 'маршрут', 'багыт'],
    answer: (lang) => {
      const station = mapMarkers.find((m) => m.id === 'station');
      const busStation = mapMarkers.find((m) => m.id === 'bus-station');
      const routes = busRoutes.map((r) => `${r.number}: ${r.schedule} ${r.interval}`).join(', ');
      if (lang === 'kk') {
        return `Қалада ${busRoutes.length} автобус бағыты жұмыс істейді: ${routes}.\nТеміржол вокзалы (${station?.lat.toFixed(4)}, ${station?.lng.toFixed(4)}) — автобус №2 арқылы. Автовокзал (${busStation?.lat.toFixed(4)}, ${busStation?.lng.toFixed(4)}) — №1, №3 бағыттарымен.`;
      }
      return `В городе ${busRoutes.length} автобусных маршрута: ${routes}.\nЖ/д вокзал (${station?.lat.toFixed(4)}, ${station?.lng.toFixed(4)}) — автобус №2. Автовокзал (${busStation?.lat.toFixed(4)}, ${busStation?.lng.toFixed(4)}) — маршруты №1, №3.`;
    },
  },
  // Education
  {
    keywords: ['аркпи', 'институт', 'вуз', 'педагог', 'колледж', 'гуманитар', 'политех', 'поступ', 'оку', 'специальност', 'мамандык'],
    answer: (lang) => {
      const arkpi = mapMarkers.find((m) => m.id === 'arkpi');
      const torgay = mapMarkers.find((m) => m.id === 'torgay-college');
      const polytech = mapMarkers.find((m) => m.id === 'polytech-college');
      if (lang === 'kk') {
        return `Арқалықта жоғары және орта арнаулы білім:\n• АрҚПИ им. И. Алтынсарина (${arkpi?.lat.toFixed(4)}) — педагогика, филология, тарих\n• Торғай гуманитарлық колледжі (${torgay?.lat.toFixed(4)})\n• Арқалық политехникалық колледжі (${polytech?.lat.toFixed(4)})\nКартадан индего маркерлерден таба аласыз.`;
      }
      return `Высшее и среднее специальное образование в Аркалыке:\n• АрҚПИ им. И. Алтынсарина (${arkpi?.lat.toFixed(4)}) — педагогика, филология, история\n• Торгайский гуманитарный колледж (${torgay?.lat.toFixed(4)})\n• Аркалыкский политехнический колледж (${polytech?.lat.toFixed(4)})\nНа карте найдёте по индиго маркерам.`;
    },
  },
  // Schools
  {
    keywords: ['школа', 'мектеп', 'гимнази', 'лицей', 'образован', 'билим', 'байтурсын', 'байтурынов'],
    answer: (lang) => {
      const schools = mapMarkers.filter((m) => m.category === 'school');
      const arts = mapMarkers.filter((m) => m.id === 'music-school' || m.id === 'art-school');
      const schoolNames = schools.map((s) => s.name[lang]).join(', ');
      const artsNames = arts.map((a) => a.name[lang]).join(', ');
      return lang === 'kk'
        ? `Арқалықтың мектептері (${schools.length}): ${schoolNames}.\nӨнер мектептері: ${artsNames}. Барлығы картада индего маркерлермен белгіленген.`
        : `Школы Аркалыка (${schools.length}): ${schoolNames}.\nХудожественные школы: ${artsNames}. Все отмечены на карте индиго маркерами.`;
    },
  },
  // Government services
  {
    keywords: ['цон', 'акон', 'акимдик', 'акимат', 'госуслуг', 'мадениет', 'дворец', 'культур', 'парк', 'стадион', 'женис', 'жигер'],
    answer: (lang) => {
      const akimat = mapMarkers.find((m) => m.id === 'akimat');
      const con = mapMarkers.find((m) => m.id === 'con');
      if (lang === 'kk') {
        return `Әкімдік (${akimat?.lat.toFixed(4)}) — қала әкімдігі. ЦОН (${con?.lat.toFixed(4)}) — қоғамдық қызметтер орталығы, дүйсенбі-жұма 09:00-18:00. Сондай-ақ Мәдениет сарайы, Жеңіс саябағы және Жігер стадионы бар.`;
      }
      return `Акимат (${akimat?.lat.toFixed(4)}) — городская администрация. ЦОН (${con?.lat.toFixed(4)}) — центр обслуживания населения, пн-пт 09:00-18:00. Также есть Дворец культуры, парк Жеңіс и стадион Жигер.`;
    },
  },
  // Justice
  {
    keywords: ['прокуратур', 'суд', 'полици', 'правосуд', 'адилет', 'кылмыс', 'закон', 'юрид'],
    answer: (lang) => {
      const prosecutor = mapMarkers.find((m) => m.id === 'prosecutor');
      const court = mapMarkers.find((m) => m.id === 'city-court');
      const police = mapMarkers.find((m) => m.id === 'police-dept');
      if (lang === 'kk') {
        return `Әділет органдары:\n• Прокуратура (${prosecutor?.lat.toFixed(4)}) — дүйсенбі-жұма 09:00-18:00\n• Қала соты (${court?.lat.toFixed(4)})\n• Полиция басқармасы (${police?.lat.toFixed(4)}) — 112 шұғыл қызмет\nКартада қара-көк маркерлермен белгіленген.`;
      }
      return `Правоохранительные органы:\n• Прокуратура (${prosecutor?.lat.toFixed(4)}) — пн-пт 09:00-18:00\n• Городской суд (${court?.lat.toFixed(4)})\n• Управление полиции (${police?.lat.toFixed(4)}) — 112 экстренная служба\nНа карте отмечены тёмно-синими маркерами.`;
    },
  },
  // Health
  {
    keywords: ['больниц', 'аурухан', 'поликлиник', 'здоров', 'денсаулык', 'врач', 'даригер', 'медиц', 'скорая'],
    answer: (lang) => {
      const hospital = mapMarkers.find((m) => m.id === 'hospital');
      const polyclinic = mapMarkers.find((m) => m.id === 'polyclinic');
      if (lang === 'kk') {
        return `Денсаулық сақтау:\n• Қала ауруханасы (${hospital?.lat.toFixed(4)}) — тәулік бойы\n• Орталық поликлиника (${polyclinic?.lat.toFixed(4)}) — дүйсенбі-жұма 08:00-17:00\nКартадан қызыл маркерден таба аласыз. Шұғыл жәрдем — 103.`;
      }
      return `Здравоохранение:\n• Городская больница (${hospital?.lat.toFixed(4)}) — круглосуточно\n• Центральная поликлиника (${polyclinic?.lat.toFixed(4)}) — пн-пт 08:00-17:00\nНа карте найдёте по красным маркерам. Скорая помощь — 103.`;
    },
  },
  // Distance & cities
  {
    keywords: ['расстоян', 'кашыктык', 'сколько км', 'дорога до', 'до города', 'алмат', 'астан', 'костан', 'шымкент', 'акто', 'атыра', 'актау', 'павлод', 'семей', 'тараз', 'кызылор', 'уральск', 'петропав', 'торгай', 'жезказ', 'караганд'],
    answer: (lang) => {
      const example = distanceTargets.find((d) => d.id === 'kostanay');
      return lang === 'kk'
        ? `Калькулятор бөлімінен кез келген Қазақстан қаласына дейінгі қашықтық, уақыт және отын шығынын есептей аласыз. Мысалы, Қостанайға дейін ${example?.distanceKm} км, ${example?.driveHours} сағат. Барлығы ${distanceTargets.length} қала қолжетімді. Отын бағасы: АИ-92, 215 ₸/л, 8.5 л/100км.`
        : `В разделе калькулятора можно рассчитать расстояние, время и расход топлива до любого города Казахстана. Например, до Костаная ${example?.distanceKm} км, ${example?.driveHours} ч. Доступно ${distanceTargets.length} городов. Топливо: АИ-92, 215 ₸/л, 8.5 л/100км.`;
    },
  },
  // Weather & air
  {
    keywords: ['погод', 'ауа райы', 'температур', 'ветер', 'жел', 'влажност', 'ылгал', 'aqi', 'качество воздуха', 'ауа сапасы', 'чистый воздух'],
    answer: (lang) => {
      const w = cityPulseData.weather;
      const a = cityPulseData.aqi;
      return lang === 'kk'
        ? `Қазір Арқалықта +${w.temp}°C, ${w.condition}. Ылғалдылық ${w.humidity}%, жел ${w.wind} м/с. Ауа сапасы таза (AQI ${a.value}).`
        : `Сейчас в Аркалыке +${w.temp}°C, ${w.condition}. Влажность ${w.humidity}%, ветер ${w.wind} м/с. Качество воздуха чистое (AQI ${a.value}).`;
    },
  },
  // History & Tourism
  {
    keywords: ['истори', 'тарих', 'посетить', 'коруге', 'достопримечатель', 'тура', 'парк', 'саябак', 'стадион', 'жигер', 'женис', 'побед', 'культур', 'мадениет', 'расскажи про аркалык', 'аркалык туралы'],
    answer: (lang) => {
      const park = mapMarkers.find((m) => m.id === 'park-zhenis');
      const stadium = mapMarkers.find((m) => m.id === 'stadium-zhiger');
      const palace = mapMarkers.find((m) => m.id === 'culture-palace');
      if (lang === 'kk') {
        return `Арқалық — 1956 жылы құрылған боксит өндіру қаласы. Көруге тұрарлық орындар:\n• Жеңіс саябағы (${park?.lat.toFixed(4)})\n• Жігер стадионы (${stadium?.lat.toFixed(4)})\n• Мәдениет сарайы (${palace?.lat.toFixed(4)})\n• АрҚПИ кампусы\nСондай-ақ Орталық нарықта жергілікті тауарларды сатып алуға болады.`;
      }
      return `Аркалык — город добычи бокситов, основан в 1956 году. Достопримечательности:\n• Парк Жеңіс (${park?.lat.toFixed(4)})\n• Стадион Жигер (${stadium?.lat.toFixed(4)})\n• Дворец культуры (${palace?.lat.toFixed(4)})\n• Кампус АрҚПИ\nТакже на Центральном рынке можно купить местные товары.`;
    },
  },
  // Commerce & Banking
  {
    keywords: ['банк', 'halyk', 'kaspi', 'рынок', 'нарык', 'торгов', 'сауда', 'магазин', 'трц', 'дастархан', 'азия', 'жастар', 'shopping', 'супермаркет'],
    answer: (lang) => {
      const market = mapMarkers.find((m) => m.id === 'market');
      const halyk = mapMarkers.find((m) => m.id === 'halyk-bank');
      const kaspi = mapMarkers.find((m) => m.id === 'kaspi-bank');
      const dastarkhan = mapMarkers.find((m) => m.id === 'dastarkhan');
      if (lang === 'kk') {
        return `Сауда және банктер:\n• Орталық нарық (${market?.lat.toFixed(4)}) — 08:00-20:00\n• Дастархан супермаркеті (${dastarkhan?.lat.toFixed(4)}) — 08:00-22:00\n• Halyk Bank (${halyk?.lat.toFixed(4)})\n• Kaspi Bank (${kaspi?.lat.toFixed(4)}) — 09:00-20:00\nКартада сары маркерлермен белгіленген.`;
      }
      return `Торговля и банки:\n• Центральный рынок (${market?.lat.toFixed(4)}) — 08:00-20:00\n• Супермаркет Дастархан (${dastarkhan?.lat.toFixed(4)}) — 08:00-22:00\n• Halyk Bank (${halyk?.lat.toFixed(4)})\n• Kaspi Bank (${kaspi?.lat.toFixed(4)}) — 09:00-20:00\nНа карте отмечены жёлтыми маркерами.`;
    },
  },
  // Fuel
  {
    keywords: ['топлив', 'отын', 'бензин', 'ai-92', 'литр', 'расход', 'шыгын', 'цен', 'бага'],
    answer: (lang) => lang === 'kk'
      ? 'АИ-92 отынының бағасы 215 ₸/литр. Орташа отын шығыны 8.5 л/100 км. Калькуляторда кез келген қалаға дейінгі отын шығынын есептей аласыз.'
      : 'Цена топлива АИ-92 — 215 ₸/литр. Средний расход 8.5 л/100 км. В калькуляторе можно рассчитать расход до любого города.',
  },
];

function generateAnswer(query: string, lang: Lang): { text: string; navMarkerId?: string } {
  const q = query.toLowerCase().trim();

  // Try slang/abbreviation resolver first
  const slang = resolveSlang(q);
  if (slang) {
    const marker = mapMarkers.find((m) => m.id === slang.markerId);
    if (marker) {
      if (lang === 'kk') {
        return {
          text: `${marker.name.kk}: ${marker.description.kk}\nКартадан көру үшін төмендегі батырманы басыңыз.`,
          navMarkerId: marker.id,
        };
      }
      return {
        text: `${marker.name.ru}: ${marker.description.ru}\nНажмите кнопку ниже, чтобы увидеть на карте и построить маршрут.`,
        navMarkerId: marker.id,
      };
    }
  }

  // Try exact match from suggestions first
  const match = aiSuggestions.find(
    (s) => q.includes(s.question.kk.toLowerCase()) || q.includes(s.question.ru.toLowerCase())
  );
  if (match) return { text: match.answer[lang] };

  // Try intent rules with fuzzy matching
  let bestRule: IntentRule | null = null;
  let bestScore = 0;
  for (const rule of intentRules) {
    let score = 0;
    for (const kw of rule.keywords) {
      if (fuzzyMatch(q, kw)) {
        score += (kw.length / 10) * (rule.weight ?? 1);
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestRule = rule;
    }
  }
  if (bestRule && bestScore > 0) {
    return { text: bestRule.answer(lang) };
  }

  // Try to find specific markers by name
  const foundMarkers = findMarkersByQuery(q);
  if (foundMarkers.length > 0) {
    const m = foundMarkers[0];
    if (lang === 'kk') {
      return {
        text: `${m.name.kk}: ${m.description.kk}\nКоординаталары: ${m.lat.toFixed(4)}, ${m.lng.toFixed(4)}. Картадан көру үшін батырманы басыңыз.`,
        navMarkerId: m.id,
      };
    }
    return {
      text: `${m.name.ru}: ${m.description.ru}\nКоординаты: ${m.lat.toFixed(4)}, ${m.lng.toFixed(4)}. Нажмите кнопку, чтобы увидеть на карте.`,
      navMarkerId: m.id,
    };
  }

  // Intelligent fallback
  const cats = lang === 'kk'
    ? 'білім беру (АрҚПИ, колледждер, мектептер), көлік (автобус кестесі, вокзал), денсаулық (аурухана, поликлиника), сауда (нарық, банктер), әділет (прокуратура, сот), ауа райы, қашықтық есептеу, экстрендік қызметтер, дін (мешіт, шіркеу)'
    : 'образование (АрҚПИ, колледжи, школы), транспорт (расписание автобусов, вокзал), здравоохранение (больница, поликлиника), торговля (рынок, банки), правосудие (прокуратура, суд), погода, расчёт расстояний, экстренные службы, религия (мечеть, церковь)';
  return {
    text: lang === 'kk'
      ? `Сұрауыңызды толық түсінбедім, бірақ Арқалық туралы мына тақырыптар бойынша ақпарат бере аламын: ${cats}.\nСұрауыңызды қайта жасап көріңіз немесе іздету жолағын пайдаланыңыз.`
      : `Не совсем понял ваш вопрос, но я могу рассказать об Аркалыке по следующим темам: ${cats}.\nПопробуйте переформулировать вопрос или воспользуйтесь строкой поиска.`,
  };
}

interface AIAssistantProps {
  open: boolean;
  onClose: () => void;
  onNavigate?: (markerId: string) => void;
}

export default function AIAssistant({ open, onClose, onNavigate }: AIAssistantProps) {
  const { lang, t, theme } = useLang();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([
        {
          role: 'assistant',
          text:
            lang === 'kk'
              ? 'Сәлем! Мен Арқалық қаласының ЖИ көмекшісімін. Көлік, білім, денсаулық, сауда, әділет, тарих, қашықтық, ауа райы және экстрендік қызметтер туралы сұрай аласыз.'
              : 'Здравствуйте! Я ИИ-помощник города Аркалык. Можете спрашивать о транспорте, образовании, здравоохранении, торговле, правосудии, истории, расстояниях, погоде и экстренных службах.',
        },
      ]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const handleSend = (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg) return;

    setMessages((prev) => [...prev, { role: 'user', text: msg }]);
    setInput('');

    setTimeout(() => {
      const answer = generateAnswer(msg, lang);
      setMessages((prev) => [...prev, { role: 'assistant' as const, text: answer.text, navMarkerId: answer.navMarkerId }]);
    }, 500);
  };

  if (!open) return null;

  const isDark = theme === 'dark';

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/30 z-[2000] animate-[fadeIn_0.2s]" onClick={onClose} />

      <div className={`fixed right-0 top-0 bottom-0 w-full sm:w-[400px] z-[2001] flex flex-col shadow-2xl animate-[slideIn_0.3s_ease-out] ${
        isDark ? 'bg-zinc-900' : 'bg-white'
      }`}>
        {/* Header */}
        <div className={`flex items-center gap-3 px-4 py-3 border-b ${isDark ? 'border-zinc-800' : 'border-slate-100'}`}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shadow-md">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <div className={`text-sm font-semibold ${isDark ? 'text-zinc-100' : 'text-slate-800'}`}>{t.aiAssistant}</div>
            <div className="flex items-center gap-1 text-[10px] text-emerald-500">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              онлайн
            </div>
          </div>
          <button
            onClick={onClose}
            className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDark ? 'text-zinc-400 hover:bg-zinc-800' : 'text-slate-500 hover:bg-slate-100'}`}
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className={`flex-1 overflow-y-auto px-4 py-3 space-y-3 ${isDark ? 'bg-zinc-950' : 'bg-slate-50'}`}>
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed whitespace-pre-line ${
                  msg.role === 'user'
                    ? 'bg-cyan-500 text-white rounded-br-sm'
                    : isDark
                      ? 'bg-zinc-800 text-zinc-200 rounded-bl-sm border border-zinc-700 shadow-sm'
                      : 'bg-white text-slate-700 rounded-bl-sm border border-slate-100 shadow-sm'
                }`}
              >
                {msg.role === 'assistant' && (
                  <div className="flex items-center gap-1 mb-1 text-[10px] text-cyan-500">
                    <Sparkles className="w-3 h-3" />
                    {lang === 'kk' ? 'ЖИ көмекші' : 'ИИ помощник'}
                  </div>
                )}
                {msg.text}
                {msg.navMarkerId && onNavigate && (
                  <button
                    onClick={() => {
                      onNavigate(msg.navMarkerId!);
                      onClose();
                    }}
                    className="mt-2 flex items-center gap-1.5 bg-blue-500 hover:bg-blue-600 text-white text-[11px] font-semibold rounded-lg px-3 py-1.5 transition-all w-full justify-center"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    {lang === 'kk' ? 'Картадан көру және маршрут салу' : 'Показать на карте и построить маршрут'}
                  </button>
                )}
              </div>
            </div>
          ))}

          {messages.length <= 1 && (
            <div className="pt-2">
              <div className={`text-[10px] mb-2 px-1 ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>
                {lang === 'kk' ? 'Жылдам сұрақтар:' : 'Быстрые вопросы:'}
              </div>
              <div className="space-y-1.5">
                {aiSuggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(s.question[lang])}
                    className={`w-full text-left text-xs bg-white hover:bg-cyan-50 border rounded-lg px-3 py-2 transition-all ${
                      isDark
                        ? 'text-zinc-300 bg-zinc-800 border-zinc-700 hover:bg-zinc-700 hover:border-cyan-700'
                        : 'text-slate-600 border-slate-100 hover:border-cyan-200'
                    }`}
                  >
                    {s.question[lang]}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className={`border-t p-3 ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-100'}`}>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={t.askQuestion}
              className={`flex-1 border rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 transition-all ${
                isDark
                  ? 'bg-zinc-800 border-zinc-700 text-zinc-100 placeholder-zinc-500'
                  : 'bg-slate-100 border-slate-200 text-slate-800 placeholder-slate-400'
              }`}
            />
            <button
              onClick={() => handleSend()}
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white shadow-md hover:shadow-lg transition-all shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
