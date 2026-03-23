package com.example.demo.tools;

import java.time.Duration;
import java.util.List;
import java.util.Map;

import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.web.reactive.function.client.WebClient;

import com.example.demo.dto.GeoNamesResponse;
import com.example.demo.model.City;
import com.example.demo.model.Country;
import com.example.demo.repository.CityRepository;
import com.example.demo.repository.CountryRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

public class CityLoaders {
    
    private static final List<String> EUROPEAN_ISO_CODES = List.of(
        "AL","AD","AT","BY","BE","BA","BG","HR","CY","CZ",
        "DK","EE","FI","FR","DE","GR","HU","IS","IE","IT",
        "XK","LV","LI","LT","LU","MT","MD","MC","ME","NL",
        "MK","NO","PL","PT","RO","RU","SM","RS","SK","SI",
        "ES","SE","CH","UA","GB","VA"
    );

    public static boolean loadFromGeoNames(CountryRepository countryRepo, CityRepository cityRepo, String geoNamesUsername) {
        try {
            WebClient webClient = WebClient.builder()
                    .baseUrl("http://api.geonames.org")
                    .codecs(configurer -> configurer
                            .defaultCodecs()
                            .maxInMemorySize(2 * 1024 * 1024))
                    .build();

            for (String isoCode : EUROPEAN_ISO_CODES) {
                Country country = countryRepo.findByIsoCode(isoCode)
                        .orElseGet(() -> {
                            Country c = new Country();
                            c.setIsoCode(isoCode);
                            c.setName(resolveCountryName(isoCode));
                            return countryRepo.save(c);
                        });

                GeoNamesResponse response = webClient.get()
                        .uri(uri -> uri
                                .path("/searchJSON")
                                .queryParam("country", isoCode)
                                .queryParam("featureClass", "P")
                                .queryParam("cities", "cities15000")
                                .queryParam("maxRows", "1000")
                                .queryParam("username", geoNamesUsername)
                                .build())
                        .retrieve()
                        .bodyToMono(GeoNamesResponse.class)
                        .timeout(Duration.ofSeconds(10))
                        .block();

                if (response != null && response.getGeonames() != null) {
                    List<City> cities = response.getGeonames().stream()
                            .map(g -> {
                                City city = new City();
                                city.setName(g.getName());
                                city.setCountry(country);
                                return city;
                            }).toList();

                    cityRepo.saveAll(cities);
                }

                Thread.sleep(100);
            }

            return true;

        } catch (Exception e) {
            System.out.println("Fallo de Geonames: " + e.getMessage());
            return false;
        }
    }

    public static void loadFromJson(CountryRepository countryRepo, CityRepository cityRepo) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            Resource resource = new ClassPathResource("europe-cities.json");
            List<Map<String, Object>> data = mapper.readValue(
                resource.getInputStream(),
                new TypeReference<List<Map<String, Object>>>() {}
            );

            data.forEach(entry -> {
                String isoCode = (String) entry.get("isoCode");
                    
                Country country = countryRepo.findByIsoCode(isoCode)
                    .orElseGet(() -> {
                        Country c = new Country(
                            (String) entry.get("name"),
                            isoCode
                        );
                        return countryRepo.save(c);
                    });

                if (cityRepo.findByCountryIsoCode(isoCode).isEmpty()) {
                    List<String> cityNames = (List<String>) entry.get("cities");
                    List<City> cities = cityNames.stream()
                        .map(cityName -> {
                            City city = new City();
                            city.setName(cityName);
                            city.setCountry(country);
                            return city;
                        }).toList();
                    cityRepo.saveAll(cities);
                }
            });
        } catch (Exception e) {
            System.out.println("Error cargando desde JSON local: " + e.getMessage());
        }
    }

    

    private static String resolveCountryName(String isoCode) {
        return switch (isoCode) {
            case "AL" -> "Albania"; case "AD" -> "Andorra";
            case "AT" -> "Austria"; case "BY" -> "Belarus";
            case "BE" -> "Belgium"; case "BA" -> "Bosnia and Herzegovina";
            case "BG" -> "Bulgaria"; case "HR" -> "Croatia";
            case "CY" -> "Cyprus"; case "CZ" -> "Czech Republic";
            case "DK" -> "Denmark"; case "EE" -> "Estonia";
            case "FI" -> "Finland"; case "FR" -> "France";
            case "DE" -> "Germany"; case "GR" -> "Greece";
            case "HU" -> "Hungary"; case "IS" -> "Iceland";
            case "IE" -> "Ireland"; case "IT" -> "Italy";
            case "XK" -> "Kosovo"; case "LV" -> "Latvia";
            case "LI" -> "Liechtenstein"; case "LT" -> "Lithuania";
            case "LU" -> "Luxembourg"; case "MT" -> "Malta";
            case "MD" -> "Moldova"; case "MC" -> "Monaco";
            case "ME" -> "Montenegro"; case "NL" -> "Netherlands";
            case "MK" -> "North Macedonia"; case "NO" -> "Norway";
            case "PL" -> "Poland"; case "PT" -> "Portugal";
            case "RO" -> "Romania"; case "RU" -> "Russia";
            case "SM" -> "San Marino"; case "RS" -> "Serbia";
            case "SK" -> "Slovakia"; case "SI" -> "Slovenia";
            case "ES" -> "Spain"; case "SE" -> "Sweden";
            case "CH" -> "Switzerland"; case "UA" -> "Ukraine";
            case "GB" -> "United Kingdom"; case "VA" -> "Vatican City";
            default -> isoCode;
        };
    }
}
