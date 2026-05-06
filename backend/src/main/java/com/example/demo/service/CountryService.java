package com.example.demo.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.demo.repository.CountryRepository;

@Service
public class CountryService {
    
    @Autowired
    CountryRepository countryRepository;

    public List<String> getAllCountriesNames() {
        return countryRepository.findAll()
        .stream().map(c -> c.getName()).sorted()
        .collect(Collectors.toList());
    }
}
