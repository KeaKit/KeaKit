package com.example.demo.dto;

public record CityCoordinatesDTO(
    String city,
    String country,
    double lat,
    double lng
) {}
