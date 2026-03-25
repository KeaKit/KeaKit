package com.example.demo.model;

import java.time.LocalDateTime;

import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import jakarta.persistence.*;

@Entity
@Table(name = "incident_comments")
public class IncidentComment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 2000)
    private String text;

    @ManyToOne(optional = false)
    @JoinColumn(name = "author_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private User author;

    @ManyToOne(optional = false)
    @JoinColumn(name = "incident_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Incident incident;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    public IncidentComment() {
        this.createdAt = LocalDateTime.now();
    }

    public IncidentComment(String text, User author, Incident incident) {
        this.text = text;
        this.author = author;
        this.incident = incident;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getText() { return text; }
    public void setText(String text) { this.text = text; }

    public User getAuthor() { return author; }
    public void setAuthor(User author) { this.author = author; }

    public Incident getIncident() { return incident; }
    public void setIncident(Incident incident) { this.incident = incident; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
