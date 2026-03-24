import { API_ROUTES } from '../config/api';

export async function fetchCities(country: string): Promise<string[]> {
  const response = await fetch(`${API_ROUTES.GET_CITIES}?country=${encodeURIComponent(country)}`);

  if (!response.ok) {
    throw new Error("No se pudieron cargar las ciudades");
  }

  return response.json();
}

export async function fetchCountries(): Promise<string[]> {
  const response = await fetch(API_ROUTES.GET_COUNTRIES);
  if (!response.ok) throw new Error('Error al obtener los países');
  return response.json();
}