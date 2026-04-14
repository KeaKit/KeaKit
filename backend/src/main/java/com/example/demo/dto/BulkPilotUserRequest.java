package com.example.demo.dto;

import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public record BulkPilotUserRequest(
    @NotEmpty List<Long> ids,
    boolean active
) {}