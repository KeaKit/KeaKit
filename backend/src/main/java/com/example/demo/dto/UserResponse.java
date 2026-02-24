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

    public UserResponse(User user) {
        this.id = user.getId();
        this.email = user.getEmail();
        this.name = user.getName();
        this.role = user.getRole();
        this.phone = user.getPhone();
        this.address = user.getAddress();
        this.city = user.getCity();
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
}
