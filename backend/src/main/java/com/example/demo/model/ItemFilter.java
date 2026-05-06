package com.example.demo.model;

import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public class ItemFilter {

    public static Specification<Item> isPriceInRange(Double minPrice, Double maxPrice) {
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

    public static Specification<Item> hasCountry(String country) {
        return (root, query, cb) -> {
            if (country == null || country.trim().isEmpty()) {
                return null;
            }
            return cb.equal(cb.lower(root.get("country")), country.trim().toLowerCase());
        };
    }

    public static Specification<Item> hasCity(String city) {
        return (root, query, cb) -> {
            if (city == null || city.trim().isEmpty()) {
                return null;
            }
            return cb.equal(cb.lower(root.get("city")), city.trim().toLowerCase());
        };
    }

    public static Specification<Item> hasCategoryId(Long categoryId) {
        return (root, query, cb) -> (categoryId == null) ? null : cb.equal(root.get("category").get("id"), categoryId);
    }

    public static Specification<Item> hasArticleCondition(ArticleCondition condition) {
        return (root, query, cb) -> {
            if (condition == null) {
                return null;
            }

            return cb.and(
                    cb.equal(root.type(), Article.class),
                    cb.equal(cb.treat(root, Article.class).get("condition"), condition)
            );
        };
    }

    public static Specification<Item> isRentable() {
        return (root, query, cb) -> cb.or(
            cb.and(
                    cb.equal(root.type(), Article.class),
                    cb.not(cb.treat(root, Article.class).get("status").in(ArticleStatus.INACTIVE))
            ),
            cb.and(
                    cb.equal(root.type(), ServiceItem.class),
                    cb.equal(cb.treat(root, ServiceItem.class).get("status"), ServiceStatus.ACTIVE)
            )
    );
}
}
