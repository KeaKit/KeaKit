package com.example.demo.service;

import com.example.demo.model.Article;
import com.example.demo.model.ArticleAvailabilityRequest;
import com.example.demo.model.ArticleStatus;
import com.example.demo.model.User;
import com.example.demo.repository.ArticleAvailabilityRequestRepository;
import com.example.demo.repository.ArticleRepository;
import com.example.demo.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ArticleAvailabilityRequestServiceTest {

    @Mock
    private ArticleAvailabilityRequestRepository requestRepository;

    @Mock
    private ArticleRepository articleRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private ArticleAvailabilityRequestService availabilityRequestService;

    private Article unavailableArticle;
    private User requester;

    @BeforeEach
    void setUp() {
        unavailableArticle = new Article();
        unavailableArticle.setId(100L);
        unavailableArticle.setTitle("Sofá cama");
        unavailableArticle.setStatus(ArticleStatus.RENTED);
        User owner = new User();
        owner.setId(200L);
        unavailableArticle.setOwner(owner);

        requester = new User();
        requester.setId(300L);
        requester.setName("Arrendatario prueba");
    }

    @Test
    void requestAvailabilityNotification_success() {
        when(articleRepository.findById(100L)).thenReturn(Optional.of(unavailableArticle));
        when(userRepository.findById(300L)).thenReturn(Optional.of(requester));
        when(requestRepository.findByArticleIdAndRequesterId(100L, 300L)).thenReturn(Optional.empty());
        when(requestRepository.save(any(ArticleAvailabilityRequest.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ArticleAvailabilityRequest result = availabilityRequestService.requestAvailabilityNotification(100L, 300L);

        assertNotNull(result);
        assertEquals(100L, result.getArticle().getId());
        assertEquals(300L, result.getRequester().getId());
        verify(requestRepository).save(any(ArticleAvailabilityRequest.class));
    }

    @Test
    void requestAvailabilityNotification_articleAvailable_throws() {
        unavailableArticle.setStatus(ArticleStatus.AVAILABLE);
        when(articleRepository.findById(100L)).thenReturn(Optional.of(unavailableArticle));

        IllegalStateException exception = assertThrows(IllegalStateException.class,
                () -> availabilityRequestService.requestAvailabilityNotification(100L, 300L));

        assertEquals("El artículo ya está disponible. No es necesario crear un aviso.", exception.getMessage());
        verify(requestRepository, never()).save(any());
    }
}
