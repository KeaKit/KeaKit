import { useState, useEffect } from "react";
import { fetchCities } from "../services/cityService";

export function useLocationPicker(initialCountry = '', initialCity = '') {
  const [selectedCountry, setSelectedCountry] = useState<string>(initialCountry);
  const [selectedCity, setSelectedCity]       = useState<string>(initialCity);
  const [cities, setCities]                   = useState<string[]>([]);
  const [loadingCities, setLoadingCities]     = useState(false);
  const [error, setError]                     = useState<string | null>(null);

  useEffect(() => {
    if (!initialCountry) return; // sin país, no cargamos nada; la ciudad inicial ya está en el estado
    (async () => {
      try {
        setLoadingCities(true);
        const data = await fetchCities(initialCountry);
        setCities(data);
        setSelectedCity(initialCity);
      } catch (e) {
        setError('Error al cargar las ciudades. Inténtalo de nuevo.');
      } finally {
        setLoadingCities(false);
      }
    })();
  }, []);

  async function onCountryChange(country: string) {
    setSelectedCountry(country);
    setSelectedCity('');
    setCities([]);
    setError(null);
    if (!country) return;
    try {
      setLoadingCities(true);
      const data = await fetchCities(country);
      setCities(data);
    } catch (e) {
      setError('Error al cargar las ciudades. Inténtalo de nuevo.');
    } finally {
      setLoadingCities(false);
    }
  }

  return {
    selectedCountry,
    selectedCity,
    setSelectedCity,
    cities,
    loadingCities,
    error,
    onCountryChange,
  };
}