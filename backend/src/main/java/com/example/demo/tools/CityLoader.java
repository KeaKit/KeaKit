package com.example.demo.tools;

import java.util.List;
import java.util.Map;

import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;

import com.example.demo.model.City;
import com.example.demo.model.Country;
import com.example.demo.repository.CityRepository;
import com.example.demo.repository.CountryRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

public class CityLoader{

    public static void loadFromJson(CountryRepository countryRepo, CityRepository cityRepo) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            Resource resource = new ClassPathResource("europe-cities.json");
            List<Map<String, Object>> data = mapper.readValue(
                resource.getInputStream(),
                new TypeReference<List<Map<String, Object>>>() {}
            );
 
            data.forEach(entry -> {
                String countryName = (String) entry.get("country");
 
                Country country = countryRepo.findByName(countryName)
                    .orElseGet(() -> {
                        Country c = new Country(countryName);
                        return countryRepo.save(c);
                    });
 
                if (cityRepo.findByCountryName(countryName).isEmpty()) {
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
            System.out.println("Error cargando ciudades desde JSON: " + e.getMessage());
        }
    }
}
