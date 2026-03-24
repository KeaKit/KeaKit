import { useState, useEffect } from "react";
import { fetchCities, fetchCountries } from "../services/cityService";

export function useLocationPicker(initialCountry = '', initialCity = '') {
  const [selectedCountry, setSelectedCountry] = useState<string>(initialCountry);
  const [selectedCity, setSelectedCity]       = useState<string>(initialCity);
  const [cities, setCities]                   = useState<string[]>([]);
  const [countries, setCountries]             = useState<{ label: string; value: string }[]>([]);
  const [loadingCities, setLoadingCities]     = useState(false);
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [error, setError]                     = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoadingCountries(true);
        const data = await fetchCountries();
        setCountries(data.map(c => ({ label: c, value: c })));
      } catch (e) {
        setError('Error al cargar los países. Inténtalo de nuevo.');
      } finally {
        setLoadingCountries(false);
      }
    })();
  }, []);

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
    countries,
    loadingCities,
    loadingCountries,
    error,
    onCountryChange,
  };
}