package com.example.demo.dto;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public class GeoNamesResponse {

    private List<GeoName> geonames;

    public GeoNamesResponse() {
    }

    public GeoNamesResponse(List<GeoName> geonames) {
        this.geonames = geonames;
    }

    public List<GeoName> getGeonames() {
        return geonames;
    }

    public void setGeonames(List<GeoName> geonames) {
        this.geonames = geonames;
    }
}