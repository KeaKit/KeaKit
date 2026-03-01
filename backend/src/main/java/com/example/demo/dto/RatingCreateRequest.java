package com.example.demo.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class RatingCreateRequest {

    @NotNull(message = "Reviewee ID is required")
    private Long revieweeId;

    @NotNull(message = "Kit ID is required")
    private Long kitId;

    @NotNull(message = "Score is required")
    @Min(value = 1, message = "Score must be at least 1")
    @Max(value = 5, message = "Score must be at most 5")
    private Integer score;

    @Size(max = 1000, message = "Comment must be at most 1000 characters")
    private String comment;

    public Long getRevieweeId() {
        return revieweeId;
    }

    public void setRevieweeId(Long revieweeId) {
        this.revieweeId = revieweeId;
    }

    public Long getKitId() {
        return kitId;
    }

    public void setKitId(Long kitId) {
        this.kitId = kitId;
    }

    public Integer getScore() {
        return score;
    }

    public void setScore(Integer score) {
        this.score = score;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }
}
