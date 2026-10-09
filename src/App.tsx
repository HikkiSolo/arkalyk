import { useState, useCallback } from 'react';
import { LanguageProvider } from '@/context/LanguageContext';
import CityMap from '@/components/CityMap';
import SearchBar from '@/components/SearchBar';
import Drawer from '@/components/Drawer';
import AIAssistant from '@/components/AIAssistant';
import SettingsPanel from '@/components/SettingsPanel';
import type { MapMarker, MarkerCategory } from '@/types';
import { mapMarkers } from '@/data';

const ALL_LAYERS: MarkerCategory[] = ['education', 'government', 'school', 'transport', 'health', 'commerce', 'justice', 'busStop', 'religion'];

function AppContent() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [flyToId, setFlyToId] = useState<string | null>(null);
  const [distanceTarget, setDistanceTarget] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<MapMarker[]>([]);
  const [visibleLayers, setVisibleLayers] = useState<Set<MarkerCategory>>(new Set(ALL_LAYERS));
  const [navRouteTarget, setNavRouteTarget] = useState<MapMarker | null>(null);
  const [showTrafficNodes, setShowTrafficNodes] = useState(false);

  const handleToggleFilter = useCallback((category: string) => {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (next.has(category)) next.delete(category);
      else next.add(category);
      return next;
    });
  }, []);

  const handleClearFilters = useCallback(() => setActiveFilters(new Set()), []);

  const handleToggleLayer = useCallback((cat: MarkerCategory) => {
    setVisibleLayers((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  }, []);

  const handleShowOnMap = useCallback((marker: MapMarker) => {
    setFlyToId(marker.id);
    setDrawerOpen(false);
    setSearchQuery('');
    setSearchResults([]);
    setTimeout(() => setFlyToId(null), 2500);
  }, []);

  const handleSelectDistanceTarget = useCallback((targetId: string) => {
    setDistanceTarget(targetId);
  }, []);

  const handleBuildRoute = useCallback((marker: MapMarker) => {
    setNavRouteTarget(marker);
    setSearchQuery('');
    setSearchResults([]);
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#f8f9fa] dark:bg-slate-900">
      <CityMap
        activeFilters={activeFilters}
        searchQuery={searchQuery}
        flyToId={flyToId}
        distanceTarget={distanceTarget}
        onMarkerClick={handleShowOnMap}
        visibleLayers={visibleLayers}
        navRouteTarget={navRouteTarget}
        showTrafficNodes={showTrafficNodes}
      />

      <SearchBar
        query={searchQuery}
        onQueryChange={setSearchQuery}
        results={searchResults}
        onResultsChange={setSearchResults}
        onSelectResult={handleShowOnMap}
        onOpenDrawer={() => setDrawerOpen(true)}
        onOpenAI={() => setAiOpen(true)}
        onOpenSettings={() => setSettingsOpen(true)}
        visibleLayers={visibleLayers}
        onBuildRoute={handleBuildRoute}
      />

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        activeFilters={activeFilters}
        onToggleFilter={handleToggleFilter}
        onClearFilters={handleClearFilters}
        onShowOnMap={handleShowOnMap}
        onSelectDistanceTarget={handleSelectDistanceTarget}
        distanceTarget={distanceTarget}
        onOpenAI={() => setAiOpen(true)}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      <AIAssistant
        open={aiOpen}
        onClose={() => setAiOpen(false)}
        onNavigate={(markerId) => {
          const marker = mapMarkers.find((m) => m.id === markerId);
          if (marker) handleBuildRoute(marker);
        }}
      />

      <SettingsPanel
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        visibleLayers={visibleLayers}
        onToggleLayer={handleToggleLayer}
        showTrafficNodes={showTrafficNodes}
        onToggleTrafficNodes={() => setShowTrafficNodes((p) => !p)}
      />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}
