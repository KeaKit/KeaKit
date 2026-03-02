package com.example.demo.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

import com.example.demo.dto.ReturnRequest;
import com.example.demo.dto.ReturnResponse;
import com.example.demo.dto.UserArticle;
import com.example.demo.model.Article;
import com.example.demo.model.User;
import com.example.demo.model.ArticleStatus;
import com.example.demo.model.Kit;
import com.example.demo.model.KitStatus;
import com.example.demo.repository.ArticleRepository;
import com.example.demo.repository.KitRepository;
import com.example.demo.repository.UserRepository;

@Service
public class ArticleService {

    private final ArticleRepository articleRepository;
    private final UserRepository userRepository;
    private final KitRepository kitRepository;

    public ArticleService(ArticleRepository articleRepository, UserRepository userRepository, KitRepository kitRepository) {
        this.articleRepository = articleRepository;
        this.userRepository = userRepository;
        this.kitRepository = kitRepository;
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
        if(from != null && from.isBefore(LocalDate.now())) throw new RuntimeException("availableFrom cannot be in the past");
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

    public Article update(Long id, Long ownerId, Article updateData) {
        Article article = articleRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Article not found"));

        // Cannot edit if currently rented
        if (article.getStatus() == ArticleStatus.RENTED) {
            throw new RuntimeException("Article is currently rented and cannot be edited");
        }

        // Only owner can edit
        User owner = article.getOwner();
        if (owner == null || !owner.getId().equals(ownerId)) {
            throw new RuntimeException("Only the owner can modify this article");
        }

        // Do not allow changing status via update
        if (updateData.getStatus() != null) {
            throw new RuntimeException("Cannot change status via update; use toggleRent endpoint");
        }

        if (updateData.getTitle() != null) article.setTitle(updateData.getTitle());
        if (updateData.getDescription() != null) article.setDescription(updateData.getDescription());
        if (updateData.getCity() != null) article.setCity(updateData.getCity());
        if (updateData.getPricePerMonth() != null) article.setPricePerMonth(updateData.getPricePerMonth());
        if (updateData.getAvailableFrom() != null) article.setAvailableFrom(updateData.getAvailableFrom());
        if (updateData.getAvailableUntil() != null) article.setAvailableUntil(updateData.getAvailableUntil());
        if (updateData.getCategory() != null) article.setCategory(updateData.getCategory());
        if (updateData.getImageUrl() != null) article.setImageUrl(updateData.getImageUrl());
        if (updateData.getPurchaseDate() != null) article.setPurchaseDate(updateData.getPurchaseDate());

        return articleRepository.save(article);
    }

    public void deleteById(Long id, Long ownerId) {
        Article article = articleRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Article not found"));

        if (article.getStatus() == ArticleStatus.RENTED) {
            throw new RuntimeException("Article is currently rented and cannot be deleted");
        }

        User owner = article.getOwner();
        if (owner == null || !owner.getId().equals(ownerId)) {
            throw new RuntimeException("Only the owner can delete this article");
        }

        articleRepository.deleteById(id);
    }

    public Article toggleRent(Long id, Long ownerId) {
        Article article = articleRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Article not found"));

        User owner = article.getOwner();
        if (owner == null || !owner.getId().equals(ownerId)) {
            throw new RuntimeException("Only the owner can change rental status");
        }

        ArticleStatus status = article.getStatus();
        if (status == ArticleStatus.INACTIVE) {
            throw new RuntimeException("Inactive articles cannot be rented");
        }

        if (status == ArticleStatus.AVAILABLE) {
            article.setStatus(ArticleStatus.RENTED);
        } else if (status == ArticleStatus.RENTED) {
            article.setStatus(ArticleStatus.AVAILABLE);
        }

        return articleRepository.save(article);
    }

    public List<UserArticle> findArticlesByUserId(Long userId) {

        List<Article> articles = articleRepository.findByOwnerId(userId);
        return articles.stream().map(article -> {
            boolean isRented = article.getStatus() != null && 
                               "RENTED".equalsIgnoreCase(article.getStatus().name());
            
            LocalDate rentedUntil = isRented ? article.getAvailableUntil() : null;
            return new UserArticle(
                article.getId(),
                article.getTitle(),        // Heredado de Item
                article.getImageUrl(),     // Propio de Article
                article.getPricePerMonth(),// Heredado de Item
                article.getStatus() != null ? article.getStatus().name() : "UNKNOWN",
                rentedUntil
            );
        }).collect(Collectors.toList());
    }

    @Transactional
    public ReturnResponse processReturn(Long articleId, Long ownerId, ReturnRequest request) {

        Article article = (Article) articleRepository.findById(articleId)
                .orElseThrow(() -> new RuntimeException("Article not found"));

        if (!article.getOwner().getId().equals(ownerId)) {
            throw new RuntimeException("Only the owner can confirm the return");
        }
        
        if (article.getStatus() != ArticleStatus.RENTED) {
            throw new RuntimeException("This article is not currently rented");
        }

        Kit activeKit = kitRepository.findActiveKitByItemId(articleId, KitStatus.ACTIVE)
                .orElseThrow(() -> new RuntimeException("No active Kit found for this article"));

        double depositAmount = article.getPricePerMonth() * 0.20;
        
        String resolution;
        double amountProcessed;
        String message;

        if ("GOOD".equalsIgnoreCase(request.condition())) {
            resolution = "DEPOSIT_RETURNED";
            amountProcessed = depositAmount;
            message = "Artículo devuelto en buen estado. Se devuelve el 20% de garantía (" + depositAmount + "€) al arrendatario.";
            // TODO: Llamar a Stripe para transferir el dinero de vuelta al arrendatario
        } else if ("DAMAGED".equalsIgnoreCase(request.condition())) {
            resolution = "DEPOSIT_RETAINED";
            amountProcessed = depositAmount; // Cantidad retenida
            message = "Artículo con daños. Se retiene la garantía de " + depositAmount + "€ al arrendatario.";
            // TODO: Transferir el dinero retenido a la cuenta del dueño
        } else {
            throw new IllegalArgumentException("Condición no válida. Usa GOOD o DAMAGED.");
        }

        article.setStatus(ArticleStatus.AVAILABLE);
        article.setAvailableUntil(null);
        articleRepository.save(article);

        return new ReturnResponse(
                articleId,
                activeKit.getTenant().getEmail(),
                resolution,
                amountProcessed,
                message
        );
    }
    
}

