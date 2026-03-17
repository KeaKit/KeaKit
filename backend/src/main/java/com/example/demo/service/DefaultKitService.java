package com.example.demo.service;

import com.example.demo.dto.DefaultKitCreateRequest;
import com.example.demo.exception.AccessForbiddenException;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.exception.UnauthorizedException;
import com.example.demo.exception.UserNotFoundException;
import com.example.demo.model.Article;
import com.example.demo.model.DefaultKit;
import com.example.demo.model.DefaultKitItem;
import com.example.demo.model.User;
import com.example.demo.model.UserRole;
import com.example.demo.repository.ArticleRepository;
import com.example.demo.repository.DefaultKitItemRepository;
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

    @Autowired
    private DefaultKitItemRepository defaultKitItemRepository;

    private String getCurrentUserEmail() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getPrincipal() == null) {
            throw new UnauthorizedException("No se ha proporcionado un token de autenticación válido");
        }
        
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
            .orElseThrow(() -> new UserNotFoundException("Usuario autenticado no encontrado"));

        if (currentUser.getRole() != UserRole.ADMIN) {
            throw new AccessForbiddenException("No tienes permiso para ver el siguiente contenido");
        }
    }

    private void validateDefaultKitRequest(DefaultKitCreateRequest request) {
        if (request.getName() == null || request.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("El nombre del kit predeterminado no puede estar vacío.");
        }
        if (request.getName().length() > 255) {
            throw new IllegalArgumentException("El nombre del kit predeterminado no puede superar los 255 caracteres.");
        }
        
        if (request.getDescription() == null || request.getDescription().trim().isEmpty()) {
            throw new IllegalArgumentException("La descripción del kit predeterminado no puede estar vacía.");
        }
        if (request.getDescription().length() > 1000) {
            throw new IllegalArgumentException("La descripción del kit predeterminado no puede superar los 1000 caracteres.");
        }
        
        if (request.getBasePrice() == null) {
            throw new IllegalArgumentException("El precio base del kit predeterminado es obligatorio.");
        }
        if (request.getBasePrice() < 0) {
            throw new IllegalArgumentException("El precio base del kit predeterminado no puede ser un valor negativo.");
        }
    }

    public List<DefaultKit> getAllDefaultKits() {
        return defaultKitRepository.findAll();
    }

    public DefaultKit getDefaultKitById(Long id) {
        return defaultKitRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("No se ha encontrado el Kit Predeterminado con ID: " + id));
    }

    @Transactional
    public DefaultKit createDefaultKit(DefaultKitCreateRequest request) {
        checkUserAdmin();
        validateDefaultKitRequest(request);

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

        if (request.getName() != null) {
            if (request.getName().trim().isEmpty() || request.getName().length() > 255) {
                throw new IllegalArgumentException("El nombre del kit predeterminado es inválido o demasiado largo.");
            }
            defaultKit.setName(request.getName().trim());
        }

        if (request.getDescription() != null) {
            if (request.getDescription().trim().isEmpty() || request.getDescription().length() > 1000) {
                throw new IllegalArgumentException("La descripción del kit predeterminado es inválida o demasiado larga.");
            }
            defaultKit.setDescription(request.getDescription().trim());
        }

        if (request.getBasePrice() != null) {
            if (request.getBasePrice() < 0) {
                throw new IllegalArgumentException("El precio base del kit predeterminado no puede ser un valor negativo.");
            }
            defaultKit.setBasePrice(request.getBasePrice());
        }

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

    @Transactional
    public void removeArticleFromAllDefaultKits(Long articleId) {
    defaultKitItemRepository.deleteByArticleId(articleId);
}

}