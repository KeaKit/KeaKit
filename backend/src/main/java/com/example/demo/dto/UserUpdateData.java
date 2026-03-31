package com.example.demo.dto;

import jakarta.persistence.Column;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class UserUpdateData {

    @Column(nullable = false)
    @Size(min = 2, max = 100, message = "Name size must be between 2 and 100")
    private String name;

    @Column(nullable = false)
    @Pattern(regexp = "^(\\+\\d{1,3})?\\d{8,12}$", message = "Phone number must be valid")
    private String phone;

    @Column(nullable = false)
    @Size(min = 5, max = 255, message = "Address size must be between 5 and 255")
    private String address;

    @Column(nullable = false)
    private String city;

    @Column(nullable = false)
    private String country;

    @Column(nullable = true)
    private String profilePhotoUrl;

    public UserUpdateData() {}

    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    public String getProfilePhotoUrl() {
        return profilePhotoUrl;
    }

    public void setProfilePhotoUrl(String profilePhotoUrl) {
        this.profilePhotoUrl = profilePhotoUrl;
    }
}
