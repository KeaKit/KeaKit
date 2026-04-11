package com.example.demo.dto;

import com.example.demo.model.User;

public class PublicUserProfileDto {
    private String profileImageUrl;
    private boolean founderBadge;

    public PublicUserProfileDto(User user) {
        this.profileImageUrl = user.getProfileImageUrl();
        this.founderBadge = user.isFounderBadge();
    }

    // Getters
    public String getProfileImageUrl() { return profileImageUrl; }
    public boolean isFounderBadge() { return founderBadge; }
}