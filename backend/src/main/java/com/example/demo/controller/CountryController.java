package com.example.demo.controller;

import com.example.demo.service.CountryService;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.service.CityService;
import org.springframework.web.bind.annotation.GetMapping;

@RestController
@RequestMapping("/api/countries")
@CrossOrigin(origins = "*") 
public class CountryController {
    private final CountryService countryService;
    @Autowired
    CityService cityService;

    CountryController(CountryService countryService) {
        this.countryService = countryService;
    }

    @GetMapping("")
    public ResponseEntity<List<String>> getCountriesNames() {
        return ResponseEntity.ok(countryService.getAllCountriesNames());
    }
    
}
