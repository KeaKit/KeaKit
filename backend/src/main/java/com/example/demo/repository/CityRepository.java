package com.example.demo.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.model.City;

public interface CityRepository extends JpaRepository<City, Long> {
    List<City> findByCountryIsoCode(String isoCode);
    List<City> findByCountryName(String name);
}