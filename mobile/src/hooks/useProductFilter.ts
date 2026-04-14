// hooks/useProductFilter.ts
import { useMemo } from 'react';
import { CatalogProduct } from '../types';

interface FilterOptions {
  searchText: string;
  categoryFilter: string;
  showOnlyMyCity: boolean;
  userCity: string;
  showOnlyAvailable?: boolean;
}

export function useProductFilter(
  products: CatalogProduct[],
  options: FilterOptions
) {
  return useMemo(() => {
    const { searchText, categoryFilter, showOnlyMyCity, userCity, showOnlyAvailable = true } = options;
    const q = searchText.trim().toLowerCase();

    return products.filter((p) => {
      // Filtro de disponibilidad
      const notInactive = p.itemType === "SERVICE" || p.status !== "INACTIVE";
      if (!notInactive && showOnlyAvailable) return false;

      // Filtro de categoría
      const byCategory = categoryFilter === "ALL" || p.category === categoryFilter;
      if (!byCategory) return false;

      // Filtro de ciudad
      const byCity = !showOnlyMyCity || !userCity.trim() || 
        (p.city ?? "").toLowerCase() === userCity.trim().toLowerCase();
      if (!byCity) return false;

      // Filtro de búsqueda
      const bySearch = q.length === 0 ||
        p.title.toLowerCase().includes(q) ||
        (p.city ?? "").toLowerCase().includes(q) ||
        (p.category ?? "").toLowerCase().includes(q);

      return bySearch;
    });
  }, [products, options.searchText, options.categoryFilter, options.showOnlyMyCity, options.userCity, options.showOnlyAvailable]);
}