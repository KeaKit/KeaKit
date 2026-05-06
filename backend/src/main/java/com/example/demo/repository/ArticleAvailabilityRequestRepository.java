package com.example.demo.repository;

import com.example.demo.model.ArticleAvailabilityRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface ArticleAvailabilityRequestRepository extends JpaRepository<ArticleAvailabilityRequest, Long> {

    List<ArticleAvailabilityRequest> findByArticleId(Long articleId);

    Optional<ArticleAvailabilityRequest> findByArticleIdAndRequesterId(Long articleId, Long requesterId);

    @Modifying
    @Transactional
    void deleteByArticleId(Long articleId);
}
