package com.example.demo.service;

import com.example.demo.model.Article;
import com.example.demo.model.ArticleAvailabilityRequest;
import com.example.demo.model.ArticleStatus;
import com.example.demo.model.NotificationType;
import com.example.demo.model.User;
import com.example.demo.repository.ArticleAvailabilityRequestRepository;
import com.example.demo.repository.ArticleRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ArticleAvailabilityRequestService {

    @Autowired
    private ArticleAvailabilityRequestRepository requestRepository;

    @Autowired
    private ArticleRepository articleRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationService notificationService;

    @Transactional
    public ArticleAvailabilityRequest requestAvailabilityNotification(Long articleId, Long requesterId) {
        Article article = articleRepository.findById(articleId)
                .orElseThrow(() -> new RuntimeException("Artículo con id " + articleId + " no encontrado"));

        if (article.getStatus() == ArticleStatus.AVAILABLE) {
            throw new IllegalStateException("El artículo ya está disponible. No es necesario crear un aviso.");
        }

        User requester = userRepository.findById(requesterId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con id: " + requesterId));

        if (article.getOwner() == null) {
            throw new IllegalStateException("El artículo no tiene propietario asignado");
        }

        if (article.getOwner().getId().equals(requesterId)) {
            throw new IllegalStateException("El propietario no puede solicitar el aviso para su propio artículo");
        }

        if (requestRepository.findByArticleIdAndRequesterId(articleId, requesterId).isPresent()) {
            throw new IllegalStateException("Ya has solicitado un aviso para este artículo");
        }

        ArticleAvailabilityRequest request = new ArticleAvailabilityRequest();
        request.setArticle(article);
        request.setRequester(requester);
        return requestRepository.save(request);
    }

    @Transactional
    public void notifyWatchersWhenAvailable(Article article) {
        if (article == null || article.getId() == null || article.getStatus() != ArticleStatus.AVAILABLE) {
            return;
        }

        List<ArticleAvailabilityRequest> requests = requestRepository.findByArticleId(article.getId());
        if (requests.isEmpty()) {
            return;
        }

        for (ArticleAvailabilityRequest request : requests) {
            User requester = request.getRequester();
            if (requester == null) {
                continue;
            }
            String message = "El artículo '" + article.getTitle() + "' ya está disponible.";
            notificationService.createNotification(
                    requester,
                    message,
                    NotificationType.ARTICLE_AVAILABLE,
                    null,
                    article.getId()
            );
        }

        requestRepository.deleteByArticleId(article.getId());
    }

}
