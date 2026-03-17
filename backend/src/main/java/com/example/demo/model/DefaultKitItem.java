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

    @ManyToOne(fetch = FetchType.EAGER) 
    @JoinColumn(name = "article_id", nullable = false)
    private Article article;

    // Constructores
    public DefaultKitItem() {
    }

    public DefaultKitItem(DefaultKit defaultKit, Article article) {
        this.defaultKit = defaultKit;
        this.article = article;
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

    public Article getArticle() {
        return article;
    }

    public void setArticle(Article article) {
        this.article = article;
    }
}