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
                .orElseThrow(() -> new UserNotFoundException("Reseñador no encontrado"));

        User reviewee = userRepository.findById(request.getRevieweeId())
                .orElseThrow(() -> new UserNotFoundException("Reseñador no encontrado con id: " + request.getRevieweeId()));

        Kit kit = kitRepository.findById(request.getKitId())
                .orElseThrow(() -> new RuntimeException("Kit no encontrado con id: " + request.getKitId()));

        if (reviewer.getId().equals(reviewee.getId())) {
            throw new InvalidRatingException("No puedes puntuarte a ti mismo");
        }

        if (!kit.getStatus().equals(KitStatus.FINISHED)) {
            throw new InvalidRatingException("No puedes puntuar un alquiler de kit que no está terminado");
        }

        if (ratingRepository.existsByReviewerIdAndRevieweeIdAndKitId(
                reviewer.getId(), reviewee.getId(), kit.getId())) {
            throw new DuplicateRatingException("Ya has puntuado a este usuario para este kit");
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
                .orElseThrow(() -> new RatingNotFoundException("Reseña no encontrada con id: " + id));
        return new RatingResponse(rating);
    }

    public void deleteById(Long id, String email) {
        Rating rating = ratingRepository.findById(id)
                .orElseThrow(() -> new RatingNotFoundException("Reseña no encontrada con id: " + id));

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("Usuario no encontrado"));
        if (!rating.getReviewer().getId().equals(user.getId()) && user.getRole() != UserRole.ADMIN) {
            throw new InvalidRatingException("No estás autorizado para eliminar esta reseña");
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

        throw new InvalidRatingException("Reseñador no pertenece a este kit");
    }

    public Map<Long, Boolean> hasReviewedItems(Long reviewerId, Long kitId, List<Long> itemIds) {
        Kit kit = kitRepository.findById(kitId)
                .orElseThrow(() -> new RuntimeException("Kit no encontrado con id: " + kitId));

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

    public Map<Long, Boolean> hasReviewedItemInKits(Long reviewerId, Long itemId, List<Long> kitIds) {
    Map<Long, Boolean> result = new HashMap<>();

    for (Long kitId : kitIds) {
        Kit kit = kitRepository.findById(kitId)
                .orElse(null);

        if (kit == null) {
            result.put(kitId, false);
            continue;
        }

        Long revieweeId = kit.getTenant().getId();

        if (revieweeId == null) {
            result.put(kitId, false);
        } else {
            boolean alreadyRated = ratingRepository.existsByReviewerIdAndRevieweeIdAndKitId(
                    reviewerId, revieweeId, kitId
            );
            result.put(kitId, alreadyRated);
        }
    }

    return result;
}
}
