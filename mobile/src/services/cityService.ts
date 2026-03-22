import { API_ROUTES } from '../config/api';

export async function fetchCities(country: string): Promise<string[]> {
  const response = await fetch(`${API_ROUTES.GET_CITIES}?country=${encodeURIComponent(country)}`);

  if (!response.ok) {
    throw new Error("No se pudieron cargar las ciudades");
  }

  return response.json();
}

export async function getCityCoordinates(
  city: string,
  country: string,
): Promise<{ lat: number; lng: number } | null> {
  const response = await fetch(API_ROUTES.CITY_COORDINATES(city, country));
  if (!response.ok) return null;
  const data = await response.json();
  return { lat: data.lat, lng: data.lng };
}