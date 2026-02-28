package com.example.demo.repository;

import com.example.demo.model.Rating;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RatingRepository extends JpaRepository<Rating, Long> {

    List<Rating> findByRevieweeId(Long revieweeId);

    List<Rating> findByReviewerId(Long reviewerId);

    boolean existsByReviewerIdAndRevieweeIdAndKitId(Long reviewerId, Long revieweeId, Long kitId);
}
