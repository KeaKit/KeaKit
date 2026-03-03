package com.example.demo.repository;

import com.example.demo.model.Article;
import com.example.demo.model.ArticleStatus;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ArticleRepository extends JpaRepository<Article, Long> {

    List<Article> findByOwnerId(Long ownerId);

    List<Article> findByOwnerIdAndStatus(Long ownerId, ArticleStatus status);

    long countByCategoryId(Long categoryId);

    List<Article> findTop10ByCategoryIdOrderByIdDesc(Long categoryId);
}
