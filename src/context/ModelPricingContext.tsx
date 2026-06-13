import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  fetchModelPricing,
  getCachedPricing,
  getDisplayPrice,
  getStaleCachedPricing,
  formatLastUpdated,
  ensureCoverageForCurrent,
  type ModelPricingInfo,
} from '../lib/modelPricing';
import { MODEL_GROUPS } from '../lib/models';  // to compute current configured for coverage

interface ModelPricingContextValue {
  pricingMap: Record<string, ModelPricingInfo>;
  isLoading: boolean;
  error: string | null;
  lastFetched: number | null;
  fromCache: boolean;
  lastUpdatedLabel: string;
  refreshPricing: (force?: boolean) => Promise<void>;
  getPrice: (modelId: string) => ModelPricingInfo;
}

const ModelPricingContext = createContext<ModelPricingContextValue | null>(null);

export function ModelPricingProvider({
  apiKey,
  activeTab,
  children,
}: {
  apiKey: string;
  activeTab: string;
  children: ReactNode;
}) {
  const [pricingMap, setPricingMap] = useState<Record<string, ModelPricingInfo>>(() => {
    const cached = getCachedPricing() ?? getStaleCachedPricing();
    const base = cached?.models ?? {};
    const configured = Object.values(MODEL_GROUPS).flatMap(g => g.models.map(m => m.value));
    return ensureCoverageForCurrent(base, configured);
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<number | null>(() => {
    const cached = getCachedPricing() ?? getStaleCachedPricing();
    return cached?.fetchedAt ?? null;
  });
  const [fromCache, setFromCache] = useState(true);

  const refreshPricing = useCallback(async (force = false) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchModelPricing(apiKey, force);
      const configured = Object.values(MODEL_GROUPS).flatMap(g => g.models.map(m => m.value));
      const full = ensureCoverageForCurrent(result.models, configured);
      setPricingMap(full);
      setLastFetched(result.fetchedAt);
      setFromCache(result.fromCache);
    } catch (err) {
      const stale = getStaleCachedPricing();
      if (stale) {
        const configured = Object.values(MODEL_GROUPS).flatMap(g => g.models.map(m => m.value));
        const full = ensureCoverageForCurrent(stale.models, configured);
        setPricingMap(full);
        setLastFetched(stale.fetchedAt);
        setFromCache(true);
        setError('Using cached prices — live refresh failed');
      } else {
        setError(err instanceof Error ? err.message : 'Failed to fetch pricing');
      }
    } finally {
      setIsLoading(false);
    }
  }, [apiKey]);

  // Fetch on app load
  useEffect(() => {
    refreshPricing(false);
  }, [refreshPricing]);

  // Refresh when Model Lab opens (uses cache if fresh)
  useEffect(() => {
    if (activeTab === 'models') {
      refreshPricing(false);
    }
  }, [activeTab, refreshPricing]);

  const getPrice = useCallback(
    (modelId: string) => getDisplayPrice(pricingMap, modelId),
    [pricingMap]
  );

  const lastUpdatedLabel = useMemo(() => formatLastUpdated(lastFetched), [lastFetched]);

  const value = useMemo(
    () => ({ pricingMap, isLoading, error, lastFetched, fromCache, lastUpdatedLabel, refreshPricing, getPrice }),
    [pricingMap, isLoading, error, lastFetched, fromCache, lastUpdatedLabel, refreshPricing, getPrice]
  );

  return (
    <ModelPricingContext.Provider value={value}>
      {children}
    </ModelPricingContext.Provider>
  );
}

export function useModelPricing(): ModelPricingContextValue {
  const ctx = useContext(ModelPricingContext);
  if (!ctx) {
    throw new Error('useModelPricing must be used within ModelPricingProvider');
  }
  return ctx;
}