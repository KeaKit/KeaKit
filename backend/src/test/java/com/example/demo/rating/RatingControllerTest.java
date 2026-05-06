package com.example.demo.rating;

import com.example.demo.controller.RatingController;
import com.example.demo.dto.RatingCreateRequest;
import com.example.demo.dto.RatingResponse;
import com.example.demo.exception.RatingNotFoundException;
import com.example.demo.model.Kit;
import com.example.demo.model.Rating;
import com.example.demo.model.RatingType;
import com.example.demo.model.User;
import com.example.demo.service.AuthService;
import com.example.demo.service.RatingService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.boot.autoconfigure.security.servlet.SecurityFilterAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = RatingController.class, excludeAutoConfiguration = {
        SecurityAutoConfiguration.class,
        SecurityFilterAutoConfiguration.class
})
class RatingControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private RatingService ratingService;

    @MockitoBean
    private AuthService authService;

    @MockitoBean
    private com.example.demo.security.JwtUtil jwtUtil;

    @MockitoBean
    private com.example.demo.security.CustomUserDetailsService customUserDetailsService;

    @MockitoBean
    private com.example.demo.security.TokenBlacklistService tokenBlacklistService;

    private RatingResponse buildRatingResponse() {
        User reviewer = new User("tenant@test.com", "pass", "Tenant", null, "", "", "", "");
        reviewer.setId(1L);

        User reviewee = new User("owner@test.com", "pass", "Owner", null, "", "", "", "");
        reviewee.setId(2L);

        Kit kit = new Kit();
        kit.setId(1L);
        kit.setName("Kit One");

        Rating rating = new Rating();
        rating.setId(1L);
        rating.setReviewer(reviewer);
        rating.setReviewee(reviewee);
        rating.setKit(kit);
        rating.setScore(5);
        rating.setComment("Excelente");
        rating.setType(RatingType.RENTER_TO_OWNER);
        rating.setCreatedAt(LocalDateTime.now());

        return new RatingResponse(rating);
    }

    @Test
    void createRating_success_returnsCreated() throws Exception {
        RatingResponse response = buildRatingResponse();

        when(authService.getAuthenticatedUserEmail()).thenReturn("tenant@test.com");
        when(ratingService.create(any(RatingCreateRequest.class), eq("tenant@test.com"))).thenReturn(response);

        mockMvc.perform(post("/api/ratings")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"revieweeId\":2,\"kitId\":1,\"score\":5,\"comment\":\"Excelente\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.score").value(5))
                .andExpect(jsonPath("$.type").value("RENTER_TO_OWNER"));
    }

    @Test
    void getRatingsForUser_success_returnsOk() throws Exception {
        RatingResponse response = buildRatingResponse();

        when(ratingService.findByRevieweeId(2L)).thenReturn(List.of(response));

        mockMvc.perform(get("/api/ratings/user/2"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].revieweeId").value(2));
    }

    @Test
    void getRating_notFound_returnsNotFound() throws Exception {
        when(ratingService.findById(99L)).thenThrow(new RatingNotFoundException("Rating not found with id: 99"));

        mockMvc.perform(get("/api/ratings/99"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Rating not found with id: 99"));
    }

    @Test
    void deleteRating_success_returnsOk() throws Exception {
        when(authService.getAuthenticatedUserEmail()).thenReturn("tenant@test.com");

        mockMvc.perform(delete("/api/ratings/1"))
                .andExpect(status().isOk());
    }
}
