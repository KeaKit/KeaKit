package com.example.demo.service;

import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.web.reactive.function.client.WebClient;
import com.example.demo.dto.CityCoordinatesDTO;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;

import com.example.demo.repository.CityRepository;

@Service
public class CityService {

    @Autowired
    CityRepository cityRepository;

    private final WebClient nominatimClient = WebClient.builder()
        .baseUrl("https://nominatim.openstreetmap.org")
        .defaultHeader("Accept", "application/json")
        .defaultHeader("User-Agent", "KeaKit/1.0 (rental platform)")
        .build();

    public List<String> getAllCityNamesByCountryName(String countryName) {
        return cityRepository.findByCountryName(countryName)
        .stream().map(c -> c.getName()).sorted()
        .collect(Collectors.toList());
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