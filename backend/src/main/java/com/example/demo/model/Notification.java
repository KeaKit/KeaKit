package com.example.demo.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonIgnore;

import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

@Entity
@Table(name = "notifications")
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JsonIgnore
    private User user; // El destinatario (arrendador)

    @Column(nullable = false)
    private String message;

    @Column(nullable = false)
    private boolean isRead = false;

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationType type;

    // Guardamos el ID del kit por si el frontend quiere hacer un enlace (deep link) al detalle
    private Long relatedKitId; 

    // Constructor vacío para JPA
    public Notification() {}

    public Notification(User user, String message, NotificationType type, Long relatedKitId) {
        this.user = user;
        this.message = message;
        this.type = type;
        this.relatedKitId = relatedKitId;
        this.createdAt = LocalDateTime.now();
        this.isRead = false;
    }

    // Getters y Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public boolean isRead() {
        return isRead;
    }

    public void setRead(boolean read) {
        isRead = read;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public NotificationType getType() {
        return type;
    }

    public void setType(NotificationType type) {
        this.type = type;
    }

    public Long getRelatedKitId() {
        return relatedKitId;
    }

    public void setRelatedKitId(Long relatedKitId) {
        this.relatedKitId = relatedKitId;
    }
}