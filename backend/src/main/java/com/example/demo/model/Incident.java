package com.example.demo.model;

import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.PostLoad;

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

    @ManyToOne(optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JsonIgnore
    private User user;

    @ManyToOne(optional = true)
    @JoinColumn(name = "related_item_id")
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JsonIgnore
    private Item relatedItem;

    @ManyToOne(optional = true)
    @JoinColumn(name = "related_kit_id")
    @JsonIgnore
    private Kit relatedKit;

    // Campos transitorios para datos que sí queremos devolver
    @Transient
    @JsonProperty("userId")
    private Long userId;

    @Transient
    @JsonProperty("userName")
    private String userName;

    @Transient
    @JsonProperty("userEmail")
    private String userEmail;

    @Transient
    @JsonProperty("relatedItemId")
    private Long relatedItemId;

    @Transient
    @JsonProperty("relatedItemTitle")
    private String relatedItemTitle;

    @Transient
    @JsonProperty("relatedKitId")
    private Long relatedKitId;

    @Transient
    @JsonProperty("relatedKitName")
    private String relatedKitName;

    @PostLoad
    private void onLoad() {
        if (user != null) {
            this.userId = user.getId();
            this.userName = user.getName();
            this.userEmail = user.getEmail();
        }
        if (relatedItem != null) {
            this.relatedItemId = relatedItem.getId();
            this.relatedItemTitle = relatedItem.getTitle();
        }
        if (relatedKit != null) {
            this.relatedKitId = relatedKit.getId();
            this.relatedKitName = relatedKit.getName();
        }
    }

    // Getters y setters normales
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

    // Getters para campos transitorios
    public Long getUserId() { return userId; }
    public String getUserName() { return userName; }
    public String getUserEmail() { return userEmail; }
    public Long getRelatedItemId() { return relatedItemId; }
    public String getRelatedItemTitle() { return relatedItemTitle; }
    public Long getRelatedKitId() { return relatedKitId; }
    public String getRelatedKitName() { return relatedKitName; }
}