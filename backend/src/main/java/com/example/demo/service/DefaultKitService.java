package com.example.demo.service;

import com.example.demo.dto.DefaultKitCreateRequest;
import com.example.demo.exception.AccessForbiddenException;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.model.Article;
import com.example.demo.model.DefaultKit;
import com.example.demo.model.DefaultKitItem;
import com.example.demo.model.User;
import com.example.demo.model.UserRole;
import com.example.demo.repository.ArticleRepository;
import com.example.demo.repository.DefaultKitRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class DefaultKitService {

    @Autowired
    private DefaultKitRepository defaultKitRepository;
    
    @Autowired
    private ArticleRepository articleRepository;

    @Autowired
    private UserRepository userRepository;

    private String getCurrentUserEmail() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof UserDetails) {
            return ((UserDetails) principal).getUsername();
        } else {
            return principal.toString();
        }
    }

    private void checkUserAdmin() {
        String currentUserEmail = getCurrentUserEmail();
        User currentUser = userRepository.findByEmail(currentUserEmail)
            .orElseThrow(() -> new RuntimeException("Usuario autenticado no encontrado"));

        if (currentUser.getRole() != UserRole.ADMIN) {
            throw new AccessForbiddenException("No tienes permiso para ver el siguiente contenido");
        }
    }

    public List<DefaultKit> getAllDefaultKits() {
        return defaultKitRepository.findAll();
    }

    public DefaultKit getDefaultKitById(Long id) {
        checkUserAdmin();
        return defaultKitRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("No se ha encontrado el Kit Predeterminado con ID: " + id));
    }

    @Transactional
    public DefaultKit createDefaultKit(DefaultKitCreateRequest request) {
        checkUserAdmin();

        DefaultKit defaultKit = new DefaultKit();
        defaultKit.setName(request.getName());
        defaultKit.setDescription(request.getDescription());
        defaultKit.setBasePrice(request.getBasePrice());

        if (request.getArticleIds() != null && !request.getArticleIds().isEmpty()) {
            for (Long articleId : request.getArticleIds()) {
                Article article = articleRepository.findById(articleId)
                        .orElseThrow(() -> new ResourceNotFoundException("No se puede crear el kit. Artículo no encontrado con ID: " + articleId));
                
                DefaultKitItem item = new DefaultKitItem(defaultKit, article);
                defaultKit.getItems().add(item);
            }
        }

        return defaultKitRepository.save(defaultKit);
    }

    @Transactional
    public DefaultKit updateDefaultKit(Long id, DefaultKitCreateRequest request) {
        checkUserAdmin();

        DefaultKit defaultKit = getDefaultKitById(id);

        if (request.getName() != null) defaultKit.setName(request.getName());
        if (request.getDescription() != null) defaultKit.setDescription(request.getDescription());
        if (request.getBasePrice() != null) defaultKit.setBasePrice(request.getBasePrice());

        if (request.getArticleIds() != null) {
            defaultKit.getItems().clear(); 
            
            for (Long articleId : request.getArticleIds()) {
                Article article = articleRepository.findById(articleId)
                        .orElseThrow(() -> new ResourceNotFoundException("No se puede actualizar. Artículo no encontrado con ID: " + articleId));
                
                DefaultKitItem item = new DefaultKitItem(defaultKit, article);
                defaultKit.getItems().add(item);
            }
        }

        return defaultKitRepository.save(defaultKit);
    }

    @Transactional
    public void deleteDefaultKit(Long id) {
        checkUserAdmin();

        DefaultKit defaultKit = getDefaultKitById(id);
        defaultKitRepository.delete(defaultKit);
    }
}