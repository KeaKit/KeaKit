package com.example.demo.model;

import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;

import jakarta.persistence.*;

@Entity
@Table(name = "incidents")
public class Incident {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, length = 1000)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private IncidentType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private IncidentStatus status;

    // El usuario que crea la incidencia
    @ManyToOne(optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JsonIgnoreProperties({"password"})
    private User user;

    // El objeto reportado
    @ManyToOne(optional = true)
    @JoinColumn(name = "related_item_id")
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JsonDeserialize(as = Article.class)
    @JsonIgnoreProperties({"category", "owner", "allowedMethods"})
    private Item relatedItem;

    @ManyToOne(optional = true)
    @JoinColumn(name = "related_kit_id")
    @JsonIgnoreProperties({"snapshots", "tenant"})
    private Kit relatedKit;

    public Incident() {
        this.status = IncidentStatus.OPEN;
    }

    public Incident(String title, String description, IncidentType type, User user, Item relatedItem, Kit relatedKit) {
        this.title = title;
        this.description = description;
        this.type = type;
        this.status = IncidentStatus.OPEN;
        this.user = user;
        this.relatedItem = relatedItem;
        this.relatedKit = relatedKit;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public IncidentType getType() { return type; }
    public void setType(IncidentType type) { this.type = type; }

    public IncidentStatus getStatus() { return status; }
    public void setStatus(IncidentStatus status) { this.status = status; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public Item getRelatedItem() { return relatedItem; }
    public void setRelatedItem(Item relatedItem) { this.relatedItem = relatedItem; }

    public Kit getRelatedKit() { return relatedKit; }
    public void setRelatedKit(Kit relatedKit) { this.relatedKit = relatedKit; }
}