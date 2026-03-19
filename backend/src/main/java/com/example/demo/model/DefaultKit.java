package com.example.demo.model;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "default_kits")
public class DefaultKit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(length = 1000)
    private String description;

    // Precio base sugerido para el kit predeterminado
    private Double basePrice;

    // Relación con los artículos físicos reales que componen el kit
    @OneToMany(mappedBy = "defaultKit", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DefaultKitItem> items = new ArrayList<>();

    // Constructores
    public DefaultKit() {
    }

    public DefaultKit(String name, String description, Double basePrice) {
        this.name = name;
        this.description = description;
        this.basePrice = basePrice;
    }

    // Getters y Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Double getBasePrice() {
        return basePrice;
    }

    public void setBasePrice(Double basePrice) {
        this.basePrice = basePrice;
    }

    public List<DefaultKitItem> getItems() {
        return items;
    }

    public void setItems(List<DefaultKitItem> items) {
        this.items = items;
    }
}