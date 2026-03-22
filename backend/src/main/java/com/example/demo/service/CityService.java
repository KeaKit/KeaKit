package com.example.demo.service;

import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.web.reactive.function.client.WebClient;
import com.example.demo.dto.CityCoordinatesDTO;
import com.example.demo.dto.CountriesNowResponse;
import java.util.Comparator;
import java.util.List;
import java.util.Map;

@Service
public class CityService {

    private final WebClient webClient = WebClient.builder()
        .baseUrl("https://countriesnow.space/api/v0.1")
        .defaultHeader("Content-Type", "application/json")
        .defaultHeader("Accept", "application/json")
        .build();

    private final WebClient nominatimClient = WebClient.builder()
        .baseUrl("https://nominatim.openstreetmap.org")
        .defaultHeader("Accept", "application/json")
        .defaultHeader("User-Agent", "KeaKit/1.0 (rental platform)")
        .build();

    @Cacheable("cities")
    public List<String> getCitiesByCountry(String countryName) {
        return webClient.get()
            .uri(uriBuilder -> uriBuilder
                .path("/countries/cities/q")
                .queryParam("country", countryName)
                .build())
            .retrieve()
            .bodyToMono(CountriesNowResponse.class)
            .map(CountriesNowResponse::data)
            .map(cities -> cities.stream().sorted(Comparator.naturalOrder()).toList())
            .defaultIfEmpty(List.of())
            .block();
    }

    @Cacheable("city-coordinates")
    public CityCoordinatesDTO getCityCoordinates(String city, String country) {
        List<Map<String, Object>> results = nominatimClient.get()
            .uri(uriBuilder -> uriBuilder
                .path("/search")
                .queryParam("city", city)
                .queryParam("country", country)
                .queryParam("format", "json")
                .queryParam("limit", "1")
                .build())
            .retrieve()
            .bodyToMono(new ParameterizedTypeReference<List<Map<String, Object>>>() {})
            .defaultIfEmpty(List.of())
            .block();

        if (results == null || results.isEmpty()) {
            return null;
        }

        Map<String, Object> result = results.get(0);
        double lat = Double.parseDouble((String) result.get("lat"));
        double lng = Double.parseDouble((String) result.get("lon"));
        return new CityCoordinatesDTO(city, country, lat, lng);
    }
}