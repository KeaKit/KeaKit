package com.example.demo.service;

import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

import com.example.demo.model.Article;
import com.example.demo.model.User;
import com.example.demo.repository.ArticleRepository;
import com.example.demo.repository.UserRepository;

@Service
public class ArticleService {

    private final ArticleRepository articleRepository;
    private final UserRepository userRepository;

    public ArticleService(ArticleRepository articleRepository, UserRepository userRepository) {
        this.articleRepository = articleRepository;
        this.userRepository = userRepository;
    }

    public List<Article> findAll() {
        return articleRepository.findAll();
    }

    public Article findById(Long id) {
        return articleRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Article not found"));
    }

    public Article save(Article article) {
        if (article == null) throw new RuntimeException("Article payload is required");
        if (article.getTitle() == null || article.getTitle().trim().isEmpty()) throw new RuntimeException("Title is required");
        if (article.getDescription() == null || article.getDescription().trim().isEmpty()) throw new RuntimeException("Description is required");
        if (article.getCity() == null || article.getCity().trim().isEmpty()) throw new RuntimeException("City is required");
        if (article.getPricePerMonth() == null || article.getPricePerMonth() < 0) throw new RuntimeException("pricePerMonth must be >= 0");

        LocalDate from = article.getAvailableFrom();
        LocalDate until = article.getAvailableUntil();
        if (from != null && until != null && from.isAfter(until)) throw new RuntimeException("availableFrom must be before or equal to availableUntil");

        User owner = article.getOwner();
        if (owner == null || owner.getId() == null) {
            throw new RuntimeException("Owner (with valid id) is required");
        }

        userRepository.findById(owner.getId())
            .orElseThrow(() -> new RuntimeException("Owner not found"));

        return articleRepository.save(article);
    }

    public Article update(Long id, Article updateData) {
        Article article = articleRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Article not found"));

        if (updateData.getTitle() != null) article.setTitle(updateData.getTitle());
        if (updateData.getDescription() != null) article.setDescription(updateData.getDescription());
        if (updateData.getCity() != null) article.setCity(updateData.getCity());
        if (updateData.getPricePerMonth() != null) article.setPricePerMonth(updateData.getPricePerMonth());
        if (updateData.getAvailableFrom() != null) article.setAvailableFrom(updateData.getAvailableFrom());
        if (updateData.getAvailableUntil() != null) article.setAvailableUntil(updateData.getAvailableUntil());
        if (updateData.getCategory() != null) article.setCategory(updateData.getCategory());
        if (updateData.getOwner() != null) article.setOwner(updateData.getOwner());

        if (updateData.getImageUrl() != null) article.setImageUrl(updateData.getImageUrl());
        if (updateData.getStatus() != null) article.setStatus(updateData.getStatus());
        if (updateData.getPurchaseDate() != null) article.setPurchaseDate(updateData.getPurchaseDate());

        return articleRepository.save(article);
    }

    public void deleteById(Long id) {
        if (!articleRepository.existsById(id)) {
            throw new RuntimeException("Article not found");
        }
        articleRepository.deleteById(id);
    }
}

