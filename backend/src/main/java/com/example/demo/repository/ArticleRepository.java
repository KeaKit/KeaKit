package com.example.demo.repository;

import com.example.demo.model.Article;
import com.example.demo.model.ArticleStatus;
import com.example.demo.model.Kit;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public interface ArticleRepository extends JpaRepository<Article, Long>, JpaSpecificationExecutor<Article> {

    List<Article> findByOwnerId(Long ownerId);

    long countByCategoryId(Long categoryId);

    List<Article> findTop10ByCategoryIdOrderByIdDesc(Long categoryId);

    @Query("SELECT DISTINCT a.city FROM Article a WHERE a.status = :status")
    List<String> findDistinctCitiesByStatus(@Param("status") ArticleStatus status);

    List<Article> findByStatusAndCityIn(ArticleStatus status, List<String> cities);

    List<Article> findByStatus(ArticleStatus status);

    List<Article> findByStatusIn(List<ArticleStatus> statuses);

    @Query("SELECT k FROM Kit k JOIN k.snapshots s WHERE s.originalItemId = :articleId")
    List<Kit> findAllKitsWhereArticleHasBeen(@Param("articleId") Long articleId);

    @Modifying
    @Transactional
    @Query("DELETE FROM Article a WHERE a.owner.id = :ownerId")
    void deleteByOwnerId(@Param("ownerId") Long ownerId);
}
