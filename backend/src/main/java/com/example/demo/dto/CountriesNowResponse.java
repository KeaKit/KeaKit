package com.example.demo.dto;

import java.util.List;

public record CountriesNowResponse(
    boolean error,
    String msg,
    List<String> data
) {}