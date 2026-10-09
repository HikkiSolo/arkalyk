export type Lang = 'kk' | 'ru';
export type Theme = 'light' | 'dark';

export interface CityPulse {
  weather: {
    temp: number;
    condition: string;
    conditionKey: string;
    humidity: number;
    wind: number;
  };
  aqi: {
    value: number;
    label: string;
    labelKey: string;
    color: string;
  };
  badges: {
    key: string;
    label: string;
    status: string;
    statusKey: string;
    level: 'ok' | 'warn' | 'err';
  }[];
  transportStatus: {
    onLinePercent: number;
    activeRoutes: string[];
  };
}

export type MarkerCategory = 'education' | 'government' | 'school' | 'transport' | 'health' | 'commerce' | 'justice' | 'busStop' | 'religion';

export interface TrafficNode {
  id: string;
  lat: number;
  lng: number;
  type: 'trafficLight' | 'crosswalk';
}

export interface RoadEdge {
  from: number;
  to: number;
  type: 'road' | 'pedestrian';
}

export interface BuildingZone {
  nameKk: string;
  nameRu: string;
}

export interface BuildingFootprint {
  id: string;
  lat: number;
  lng: number;
  name: { kk: string; ru: string };
  footprint: [number, number][];
  height: number;
  color: string;
  zones?: BuildingZone[];
}

export interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  name: { kk: string; ru: string };
  category: MarkerCategory;
  description: { kk: string; ru: string };
  height: number;
}

export interface BusRoute {
  id: string;
  number: string;
  route: { kk: string; ru: string };
  schedule: string;
  interval: string;
  color: string;
}

export interface DistanceTarget {
  id: string;
  name: { kk: string; ru: string };
  lat: number;
  lng: number;
  distanceKm: number;
  driveHours: number;
}

export interface AISuggestion {
  question: { kk: string; ru: string };
  answer: { kk: string; ru: string };
}
