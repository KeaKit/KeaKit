package com.example.demo.model;

import org.springframework.data.jpa.domain.Specification;
import jakarta.persistence.criteria.Predicate; 
import java.util.ArrayList;
import java.util.List;

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


    public static Specification<Article> isPriceInRange(Double minPrice, Double maxPrice) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (minPrice != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("pricePerMonth"), minPrice));
            }

            if (maxPrice != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("pricePerMonth"), maxPrice));
            }

            return predicates.isEmpty() ? null : cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    public static Specification<Article> hasCountry(String country) {
        return (root, query, cb) -> {
            if (country == null || country.trim().isEmpty()) {
                return null;
            }
            return cb.equal(cb.lower(root.get("country")), country.trim().toLowerCase());
        };
    }

    public static Specification<Article> hasStatus(ArticleStatus status) {
        return (root, query, cb) -> (status == null) ? null : cb.equal(root.get("status"), status);
    }
}