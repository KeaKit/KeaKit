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

    List<ArticleAvailabilityRequest> findByItemId(Long itemId);

    Optional<ArticleAvailabilityRequest> findByItemIdAndRequesterId(Long itemId, Long requesterId);

    @Modifying
    @Transactional
    void deleteByItemId(Long itemId);
}
