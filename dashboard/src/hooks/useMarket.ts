/**
 * useMarket — convenience hook for market selection from AppContext.
 */

import { useAppContext } from '../context/AppContext';

export function useMarket() {
  const { selectedMarket, marketInfo, markets, loading, setMarket } =
    useAppContext();

  return { selectedMarket, marketInfo, markets, loading, setMarket };
}
