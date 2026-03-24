package com.example.demo.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import com.example.demo.service.CityService;
import java.util.List;

@RestController
@RequestMapping("/api/cities")
@CrossOrigin(origins = "*") 
public class CityController {

    private final CityService cityService;

    public CityController(CityService cityService) {
        this.cityService = cityService;
    }

    @GetMapping("")
    public ResponseEntity<List<String>> getAllCityNamesByCountryName(@RequestParam String country) {
        List<String> cities = cityService.getAllCityNamesByCountryName(country);
        
        if (cities == null || cities.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(cities);
    }
}