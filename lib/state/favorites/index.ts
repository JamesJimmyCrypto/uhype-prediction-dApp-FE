import { useAtom } from "jotai";
import { persistentAtom } from "../util/persistent-atom";

export type FavoriteMarket = {
  marketId: string;
};

export type UseFavoriteMarkets = {
  add: (marketId: string) => void;
  remove: (marketId: string) => void;
  isFavorite: (marketId: string) => boolean;
  favorites: FavoriteMarket[];
};

const favoriteMarketsAtom = persistentAtom<{ markets: FavoriteMarket[] }>({
  key: "favorite-markets",
  defaultValue: { markets: [] },
  migrations: [],
});

export const useFavoriteMarketsStorage = (): UseFavoriteMarkets => {
  const [favoriteMarkets, setFavoriteMarkets] = useAtom(favoriteMarketsAtom);

  const add = (marketId: string) => {
    if (
      favoriteMarkets.markets.some((favorite) => favorite.marketId === marketId)
    )
      return;

    setFavoriteMarkets((state) => ({
      markets: [
        ...state.markets,
        {
          marketId,
        },
      ],
    }));
  };

  const remove = (marketId: string) => {
    setFavoriteMarkets((state) => ({
      markets: state.markets.filter(
        (favorite) => favorite.marketId !== marketId,
      ),
    }));
  };

  const isFavorite = (marketId: string) => {
    return favoriteMarkets.markets.some(
      (favorite) => favorite.marketId === marketId,
    );
  };

  return {
    add,
    remove,
    isFavorite,
    favorites: favoriteMarkets.markets,
  };
};
