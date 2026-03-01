package com.example.demo.dto;

import com.example.demo.model.Rating;

import java.time.LocalDateTime;

public class RatingResponse {

    private Long id;
    private Long reviewerId;
    private String reviewerName;
    private Long revieweeId;
    private String revieweeName;
    private Long kitId;
    private String kitName;
    private Integer score;
    private String comment;
    private String type;
    private LocalDateTime createdAt;

    public RatingResponse(Rating rating) {
        this.id = rating.getId();
        this.reviewerId = rating.getReviewer().getId();
        this.reviewerName = rating.getReviewer().getName();
        this.revieweeId = rating.getReviewee().getId();
        this.revieweeName = rating.getReviewee().getName();
        this.kitId = rating.getKit().getId();
        this.kitName = rating.getKit().getName();
        this.score = rating.getScore();
        this.comment = rating.getComment();
        this.type = rating.getType().name();
        this.createdAt = rating.getCreatedAt();
    }

    public Long getId() {
        return id;
    }

    public Long getReviewerId() {
        return reviewerId;
    }

    public String getReviewerName() {
        return reviewerName;
    }

    public Long getRevieweeId() {
        return revieweeId;
    }

    public String getRevieweeName() {
        return revieweeName;
    }

    public Long getKitId() {
        return kitId;
    }

    public String getKitName() {
        return kitName;
    }

    public Integer getScore() {
        return score;
    }

    public String getComment() {
        return comment;
    }

    public String getType() {
        return type;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
