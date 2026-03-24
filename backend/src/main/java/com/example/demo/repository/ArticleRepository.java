package com.example.demo.repository;

import com.example.demo.model.Article;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface ArticleRepository extends JpaRepository<Article, Long>, JpaSpecificationExecutor<Article> {

    List<Article> findByOwnerId(Long ownerId);

    long countByCategoryId(Long categoryId);

    List<Article> findTop10ByCategoryIdOrderByIdDesc(Long categoryId);
}
