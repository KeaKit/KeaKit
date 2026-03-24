package com.example.demo.model;

import com.example.demo.model.Article;
import org.springframework.data.jpa.domain.Specification;
import java.time.LocalDate;

public class ArticleFilter {

    public static Specification<Article> hasOwnerId(Long ownerId) {
        return (root, query, cb) -> cb.equal(root.get("owner").get("id"), ownerId);
    }

    public static Specification<Article> hasCategoryId(Long categoryId) {
        return (root, query, cb) -> (categoryId == null) ? null : cb.equal(root.get("category").get("id"), categoryId);
    }

    public static Specification<Article> hasCondition(String condition) {
        return (root, query, cb) -> (condition == null || condition.isEmpty()) ? null : cb.equal(root.get("condition"), condition);
    }

    public static Specification<Article> hasPurchaseDate(LocalDate date) {
        return (root, query, cb) -> (date == null) ? null : cb.equal(root.get("purchaseDate"), date);
    }
} 
