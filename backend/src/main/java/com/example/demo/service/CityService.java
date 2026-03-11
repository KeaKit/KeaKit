package com.example.demo.service;

import org.springframework.stereotype.Service;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.web.reactive.function.client.WebClient;
import com.example.demo.dto.CountriesNowResponse;
import java.util.Comparator;
import java.util.List;

@Service
public class CityService {

    private final WebClient webClient = WebClient.builder()
        .baseUrl("https://countriesnow.space/api/v0.1")
        .defaultHeader("Content-Type", "application/json")
        .defaultHeader("Accept", "application/json")
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
}