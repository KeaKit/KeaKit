package com.example.demo.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
@Table(name = "default_kit_items")
public class DefaultKitItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "default_kit_id", nullable = false)
    @JsonIgnore // Evita bucles infinitos al serializar a JSON
    private DefaultKit defaultKit;

    @ManyToOne(fetch = FetchType.LAZY) 
    @JoinColumn(name = "item_id", nullable = false) // Ahora apunta a item_id
    @org.hibernate.annotations.OnDelete(action = org.hibernate.annotations.OnDeleteAction.CASCADE)
    private Item item;

    // Constructores
    public DefaultKitItem() {
    }

    public DefaultKitItem(DefaultKit defaultKit, Item item) {
        this.defaultKit = defaultKit;
        this.item = item;
    }

    // Getters y Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public DefaultKit getDefaultKit() {
        return defaultKit;
    }

    public void setDefaultKit(DefaultKit defaultKit) {
        this.defaultKit = defaultKit;
    }

    public Item getItem() {
        return item;
    }

    public void setItem(Item item) {
        this.item = item;
    }
}