package com.example.demo.repository;

import com.example.demo.model.Article;
import com.example.demo.model.Kit;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ArticleRepository extends JpaRepository<Article, Long> {

    List<Article> findByOwnerId(Long ownerId);

    long countByCategoryId(Long categoryId);

    List<Article> findTop10ByCategoryIdOrderByIdDesc(Long categoryId);

    @Query("SELECT k FROM Kit k JOIN k.snapshots s WHERE s.originalItemId = :articleId")
    List<Kit> findAllKitsWhereArticleHasBeen(@Param("articleId") Long articleId);
}
