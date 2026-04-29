package com.example.demo.dto;

import com.example.demo.model.User;
import com.example.demo.model.UserRole;

public class UserResponse {
    private Long id;
    private String email;
    private String name;
    private UserRole role;
    private String phone;
    private String address;
    private String city;
    private String country;
    private boolean founderBadge;
    private String token;
    private String profileImageUrl;
    private Integer tokenVersion;

    public UserResponse() {}

    public UserResponse(User user) {
        this.id = user.getId();
        this.email = user.getEmail();
        this.name = user.getName();
        this.role = user.getRole();
        this.phone = user.getPhone();
        this.address = user.getAddress();
        this.city = user.getCity();
        this.country = user.getCountry();
        this.founderBadge = user.isFounderBadge();
        this.profileImageUrl = user.getProfileImageUrl();
        this.tokenVersion = user.getTokenVersion();
    }

    public UserResponse(User user, String token) {
        this.id = user.getId();
        this.email = user.getEmail();
        this.name = user.getName();
        this.role = user.getRole();
        this.phone = user.getPhone();
        this.address = user.getAddress();
        this.city = user.getCity();
        this.country = user.getCountry();
        this.founderBadge = user.isFounderBadge(); 
        this.profileImageUrl = user.getProfileImageUrl();
        this.tokenVersion = user.getTokenVersion();
        this.token = token;
    }

    public Long getId() {
        return id;
    }

    public String getEmail() {
        return email;
    }

    public String getName() {
        return name;
    }

    public UserRole getRole() {
        return role;
    }

    public String getPhone() {
        return phone;
    }

    public String getAddress() {
        return address;
    }

    public String getCity() {
        return city;
    }

    public String getCountry() {
        return country;
    }

    public String getToken() {
        return token;
    }

    public Integer getTokenVersion() {
        return tokenVersion;
    }

    public boolean isFounderBadge() {
        return founderBadge;
    }

    public void setFounderBadge(boolean founderBadge) {
        this.founderBadge = founderBadge;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getProfileImageUrl() {
        return profileImageUrl;
    }

}
