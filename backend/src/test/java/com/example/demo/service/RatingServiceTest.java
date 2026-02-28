package com.example.demo.service;

import com.example.demo.dto.RatingCreateRequest;
import com.example.demo.dto.RatingResponse;
import com.example.demo.exception.DuplicateRatingException;
import com.example.demo.exception.InvalidRatingException;
import com.example.demo.exception.RatingNotFoundException;
import com.example.demo.model.*;
import com.example.demo.repository.KitRepository;
import com.example.demo.repository.RatingRepository;
import com.example.demo.repository.UserRepository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RatingServiceTest {

    @Mock
    private RatingRepository ratingRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private KitRepository kitRepository;

    @InjectMocks
    private RatingService ratingService;

    private User tenant;
    private User owner;
    private Kit kit;

    @BeforeEach
    void setUp() {
        tenant = new User("tenant@test.com", "password", "Tenant", UserRole.USER);
        tenant.setId(1L);

        owner = new User("owner@test.com", "password", "Owner", UserRole.USER);
        owner.setId(2L);

        Article article = new Article();
        article.setId(1L);
        article.setTitle("Test Article");
        article.setDescription("Test description");
        article.setOwner(owner);

        List<Item> items = new ArrayList<>();
        items.add(article);

        kit = new Kit("Test Kit", "Spain", "Madrid", LocalDate.now(), LocalDate.now().plusDays(7), tenant);
        kit.setId(1L);
        kit.setItems(items);
    }

    @Test
    void create_tenantRatesLandlord_success() {
        RatingCreateRequest request = new RatingCreateRequest();
        request.setRevieweeId(2L);
        request.setKitId(1L);
        request.setScore(5);
        request.setComment("Great landlord!");

        when(userRepository.findByEmail("tenant@test.com")).thenReturn(Optional.of(tenant));
        when(userRepository.findById(2L)).thenReturn(Optional.of(owner));
        when(kitRepository.findById(1L)).thenReturn(Optional.of(kit));
        when(ratingRepository.existsByReviewerIdAndRevieweeIdAndKitId(1L, 2L, 1L)).thenReturn(false);
        when(ratingRepository.save(any(Rating.class))).thenAnswer(invocation -> {
            Rating r = invocation.getArgument(0);
            r.setId(1L);
            return r;
        });

        RatingResponse response = ratingService.create(request, "tenant@test.com");

        assertNotNull(response);
        assertEquals(5, response.getScore());
        assertEquals("Great landlord!", response.getComment());
        assertEquals("RENTER_TO_OWNER", response.getType());
        verify(ratingRepository).save(any(Rating.class));
    }

    @Test
    void create_landlordRatesTenant_success() {
        RatingCreateRequest request = new RatingCreateRequest();
        request.setRevieweeId(1L);
        request.setKitId(1L);
        request.setScore(4);
        request.setComment("Good tenant");

        when(userRepository.findByEmail("owner@test.com")).thenReturn(Optional.of(owner));
        when(userRepository.findById(1L)).thenReturn(Optional.of(tenant));
        when(kitRepository.findById(1L)).thenReturn(Optional.of(kit));
        when(ratingRepository.existsByReviewerIdAndRevieweeIdAndKitId(2L, 1L, 1L)).thenReturn(false);
        when(ratingRepository.save(any(Rating.class))).thenAnswer(invocation -> {
            Rating r = invocation.getArgument(0);
            r.setId(2L);
            return r;
        });

        RatingResponse response = ratingService.create(request, "owner@test.com");

        assertNotNull(response);
        assertEquals(4, response.getScore());
        assertEquals("OWNER_TO_RENTER", response.getType());
    }

    @Test
    void create_selfRating_throwsInvalidRatingException() {
        RatingCreateRequest request = new RatingCreateRequest();
        request.setRevieweeId(1L);
        request.setKitId(1L);
        request.setScore(5);

        when(userRepository.findByEmail("tenant@test.com")).thenReturn(Optional.of(tenant));
        when(userRepository.findById(1L)).thenReturn(Optional.of(tenant));
        when(kitRepository.findById(1L)).thenReturn(Optional.of(kit));

        assertThrows(InvalidRatingException.class,
                () -> ratingService.create(request, "tenant@test.com"));
    }

    @Test
    void create_duplicateRating_throwsDuplicateRatingException() {
        RatingCreateRequest request = new RatingCreateRequest();
        request.setRevieweeId(2L);
        request.setKitId(1L);
        request.setScore(5);

        when(userRepository.findByEmail("tenant@test.com")).thenReturn(Optional.of(tenant));
        when(userRepository.findById(2L)).thenReturn(Optional.of(owner));
        when(kitRepository.findById(1L)).thenReturn(Optional.of(kit));
        when(ratingRepository.existsByReviewerIdAndRevieweeIdAndKitId(1L, 2L, 1L)).thenReturn(true);

        assertThrows(DuplicateRatingException.class,
                () -> ratingService.create(request, "tenant@test.com"));
    }

    @Test
    void create_reviewerNotParty_throwsInvalidRatingException() {
        User stranger = new User("stranger@test.com", "password", "Stranger", UserRole.USER);
        stranger.setId(3L);

        RatingCreateRequest request = new RatingCreateRequest();
        request.setRevieweeId(1L);
        request.setKitId(1L);
        request.setScore(5);

        when(userRepository.findByEmail("stranger@test.com")).thenReturn(Optional.of(stranger));
        when(userRepository.findById(1L)).thenReturn(Optional.of(tenant));
        when(kitRepository.findById(1L)).thenReturn(Optional.of(kit));
        when(ratingRepository.existsByReviewerIdAndRevieweeIdAndKitId(3L, 1L, 1L)).thenReturn(false);

        assertThrows(InvalidRatingException.class,
                () -> ratingService.create(request, "stranger@test.com"));
    }

    @Test
    void findByRevieweeId_returnsList() {
        Rating rating = new Rating();
        rating.setId(1L);
        rating.setReviewer(tenant);
        rating.setReviewee(owner);
        rating.setKit(kit);
        rating.setScore(5);
        rating.setType(RatingType.RENTER_TO_OWNER);
        rating.setCreatedAt(java.time.LocalDateTime.now());

        when(ratingRepository.findByRevieweeId(2L)).thenReturn(List.of(rating));

        List<RatingResponse> results = ratingService.findByRevieweeId(2L);

        assertEquals(1, results.size());
        assertEquals(5, results.get(0).getScore());
    }

    @Test
    void findById_notFound_throwsRatingNotFoundException() {
        when(ratingRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(RatingNotFoundException.class,
                () -> ratingService.findById(99L));
    }

    @Test
    void deleteById_byAuthor_success() {
        Rating rating = new Rating();
        rating.setId(1L);
        rating.setReviewer(tenant);
        rating.setReviewee(owner);
        rating.setKit(kit);
        rating.setScore(5);
        rating.setType(RatingType.RENTER_TO_OWNER);
        rating.setCreatedAt(java.time.LocalDateTime.now());

        when(ratingRepository.findById(1L)).thenReturn(Optional.of(rating));
        when(userRepository.findByEmail("tenant@test.com")).thenReturn(Optional.of(tenant));

        ratingService.deleteById(1L, "tenant@test.com");

        verify(ratingRepository).deleteById(1L);
    }

    @Test
    void deleteById_byNonAuthor_throwsInvalidRatingException() {
        Rating rating = new Rating();
        rating.setId(1L);
        rating.setReviewer(tenant);
        rating.setReviewee(owner);
        rating.setKit(kit);
        rating.setScore(5);
        rating.setType(RatingType.RENTER_TO_OWNER);
        rating.setCreatedAt(java.time.LocalDateTime.now());

        when(ratingRepository.findById(1L)).thenReturn(Optional.of(rating));
        when(userRepository.findByEmail("owner@test.com")).thenReturn(Optional.of(owner));

        assertThrows(InvalidRatingException.class,
                () -> ratingService.deleteById(1L, "owner@test.com"));
    }
}
