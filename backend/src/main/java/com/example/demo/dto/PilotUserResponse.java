package com.example.demo.dto;

import com.example.demo.model.PilotUser;

public class PilotUserResponse {

    private Long id;
    private String email;
    private boolean active;

    public PilotUserResponse(PilotUser pilotUser) {
        this.id = pilotUser.getId();
        this.email = pilotUser.getEmail();
        this.active = pilotUser.isActive();
    }

    public Long getId() { return id; }
    public String getEmail() { return email; }
    public boolean isActive() { return active; }
}