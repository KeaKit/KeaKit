package com.example.demo.service;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;

import com.example.demo.repository.CityRepository;

@Service
public class CityService {
    @Autowired
    CityRepository cityRepository;

    public List<String> getAllCityNamesByCountryName(String countryName) {
        return cityRepository.findByCountryName(countryName)
        .stream().map(c -> c.getName()).sorted()
        .collect(Collectors.toList());
    }
}