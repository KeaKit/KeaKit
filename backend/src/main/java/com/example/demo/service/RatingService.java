package com.example.demo.service;

import com.example.demo.dto.RatingCreateRequest;
import com.example.demo.dto.RatingResponse;
import com.example.demo.exception.DuplicateRatingException;
import com.example.demo.exception.InvalidRatingException;
import com.example.demo.exception.RatingNotFoundException;
import com.example.demo.exception.UserNotFoundException;
import com.example.demo.model.*;
import com.example.demo.repository.KitRepository;
import com.example.demo.repository.RatingRepository;
import com.example.demo.repository.UserRepository;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class RatingService {

    private final RatingRepository ratingRepository;
    private final UserRepository userRepository;
    private final KitRepository kitRepository;

    public RatingService(RatingRepository ratingRepository, UserRepository userRepository, KitRepository kitRepository) {
        this.ratingRepository = ratingRepository;
        this.userRepository = userRepository;
        this.kitRepository = kitRepository;
    }

    public RatingResponse create(RatingCreateRequest request, String reviewerEmail) {
        User reviewer = userRepository.findByEmail(reviewerEmail)
                .orElseThrow(() -> new UserNotFoundException("Reviewer not found"));

        User reviewee = userRepository.findById(request.getRevieweeId())
                .orElseThrow(() -> new UserNotFoundException("Reviewee not found with id: " + request.getRevieweeId()));

        Kit kit = kitRepository.findById(request.getKitId())
                .orElseThrow(() -> new RuntimeException("Kit not found with id: " + request.getKitId()));

        if (reviewer.getId().equals(reviewee.getId())) {
            throw new InvalidRatingException("You cannot rate yourself");
        }

        if (!kit.getStatus().equals(KitStatus.FINISHED)) {
            throw new InvalidRatingException("You cannot rate a not finished kit rent");
        }

        if (ratingRepository.existsByReviewerIdAndRevieweeIdAndKitId(
                reviewer.getId(), reviewee.getId(), kit.getId())) {
            throw new DuplicateRatingException("You have already rated this user for this kit");
        }

        RatingType type = determineRatingType(reviewer, reviewee, kit);

        Rating rating = new Rating();
        rating.setReviewer(reviewer);
        rating.setReviewee(reviewee);
        rating.setKit(kit);
        rating.setScore(request.getScore());
        rating.setComment(request.getComment());
        rating.setType(type);
        rating.setCreatedAt(LocalDateTime.now());

        Rating saved = ratingRepository.save(rating);
        return new RatingResponse(saved);
    }

    public List<RatingResponse> findByRevieweeId(Long revieweeId) {
        return ratingRepository.findByRevieweeId(revieweeId).stream()
                .map(RatingResponse::new)
                .collect(Collectors.toList());
    }

    public List<RatingResponse> findByReviewerId(Long reviewerId) {
        return ratingRepository.findByReviewerId(reviewerId).stream()
                .map(RatingResponse::new)
                .collect(Collectors.toList());
    }

    public RatingResponse findById(Long id) {
        Rating rating = ratingRepository.findById(id)
                .orElseThrow(() -> new RatingNotFoundException("Rating not found with id: " + id));
        return new RatingResponse(rating);
    }

    public void deleteById(Long id, String email) {
        Rating rating = ratingRepository.findById(id)
                .orElseThrow(() -> new RatingNotFoundException("Rating not found with id: " + id));

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        if (!rating.getReviewer().getId().equals(user.getId()) && user.getRole() != UserRole.ADMIN) {
            throw new InvalidRatingException("You are not authorized to delete this rating");
        }

        ratingRepository.deleteById(id);
    }

    private RatingType determineRatingType(User reviewer, User reviewee, Kit kit) {
        boolean reviewerIsTenant = kit.getTenant() != null && kit.getTenant().getId().equals(reviewer.getId());
        boolean reviewerIsOwner = kit.getSnapshots().stream()
                .anyMatch(snapshot -> snapshot.getOwnerAtRental() != null
                        && snapshot.getOwnerAtRental().getId().equals(reviewer.getId()));

        if (reviewerIsTenant) {
            return RatingType.RENTER_TO_OWNER;
        } else if (reviewerIsOwner) {
            return RatingType.OWNER_TO_RENTER;
        }

        throw new InvalidRatingException("Reviewer is not a party to this kit");
    }

    public Map<Long, Boolean> hasReviewedItems(Long reviewerId, Long kitId, List<Long> itemIds) {
        Kit kit = kitRepository.findById(kitId)
                .orElseThrow(() -> new RuntimeException("Kit not found with id: " + kitId));

        Map<Long, Long> itemToOwnerMap = kit.getSnapshots().stream()
                .filter(snapshot -> itemIds.contains(snapshot.getOriginalItemId()))
                .collect(Collectors.toMap(
                        snapshot -> snapshot.getOriginalItemId(),
                        snapshot -> snapshot.getOwnerAtRental().getId()
                ));

        Map<Long, Boolean> result = new HashMap<>();
        for (Long itemId : itemIds) {
            Long revieweeId = itemToOwnerMap.get(itemId);
            if (revieweeId == null) {
                result.put(itemId, false);
            } else {
                boolean alreadyRated = ratingRepository.existsByReviewerIdAndRevieweeIdAndKitId(
                        reviewerId, revieweeId, kitId
                );
                result.put(itemId, alreadyRated);
            }
        }

        return result;
    }
}
