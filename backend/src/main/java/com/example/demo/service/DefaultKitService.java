package com.example.demo.service;

import com.example.demo.dto.DefaultKitCreateRequest;
import com.example.demo.exception.AccessForbiddenException;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.exception.UnauthorizedException;
import com.example.demo.exception.UserNotFoundException;
import com.example.demo.model.Article;
import com.example.demo.model.DefaultKit;
import com.example.demo.model.DefaultKitItem;
import com.example.demo.model.Item;
import com.example.demo.model.User;
import com.example.demo.model.UserRole;
import com.example.demo.repository.ArticleRepository;
import com.example.demo.repository.DefaultKitItemRepository;
import com.example.demo.repository.DefaultKitRepository;
import com.example.demo.repository.ItemRepository;
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
    private ItemRepository itemRepository;

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
    }

    public List<DefaultKit> getAllDefaultKits() {
        return defaultKitRepository.findAll();
    }

    public DefaultKit getDefaultKitById(Long id) {
        return defaultKitRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("No se ha encontrado el Kit Predeterminado con ID: " + id));
    }

    private void calculateAndSetBasePrice(DefaultKit defaultKit) {
        double total = 0.0;
        if (defaultKit.getItems() != null) {
            for (DefaultKitItem kitItem : defaultKit.getItems()) {
                // ATENCIÓN: Cambia getPricePerDay() por getPrice() si tu modelo Article se llama así
                total += kitItem.getItem().getPricePerMonth(); 
            }
        }
        defaultKit.setBasePrice(total);
    }

    @Transactional
    public DefaultKit createDefaultKit(DefaultKitCreateRequest request) {
        checkUserAdmin();
        validateDefaultKitRequest(request);

        DefaultKit defaultKit = new DefaultKit();
        defaultKit.setName(request.getName());
        defaultKit.setDescription(request.getDescription());

        if (request.getItemsIds() != null && !request.getItemsIds().isEmpty()) {
            for (Long itemId : request.getItemsIds()) {
                Item item = itemRepository.findById(itemId)
                        .orElseThrow(() -> new ResourceNotFoundException("No se puede crear el kit. Item no encontrado con ID: " + itemId));
                
                DefaultKitItem defatulDefaultKitItem = new DefaultKitItem(defaultKit, item);
                defaultKit.getItems().add(defatulDefaultKitItem);
            }
        }
        calculateAndSetBasePrice(defaultKit);
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

        if (request.getItemsIds() != null) {
            defaultKit.getItems().clear(); 
            
            for (Long itemId : request.getItemsIds()) {
                Item item = itemRepository.findById(itemId)
                        .orElseThrow(() -> new ResourceNotFoundException("Item no encontrado con ID: " + itemId));
                
                DefaultKitItem defaultKitItem = new DefaultKitItem(defaultKit, item);
                defaultKit.getItems().add(defaultKitItem);
            }
        }

        calculateAndSetBasePrice(defaultKit);
        return defaultKitRepository.save(defaultKit);
    }

    @Transactional
    public void deleteDefaultKit(Long id) {
        checkUserAdmin();
        DefaultKit defaultKit = getDefaultKitById(id);
        defaultKitRepository.delete(defaultKit);
    }

    @Transactional
    public void removeItemFromAllDefaultKits(Long itemId) {
        List<DefaultKitItem> itemsToRemove = defaultKitItemRepository.findByItemId(itemId);
        
        if (itemsToRemove.isEmpty()) {
            return;
        }

        for (DefaultKitItem kitItem : itemsToRemove) {
            DefaultKit defaultKit = kitItem.getDefaultKit();
            
            defaultKit.getItems().removeIf(i -> i.getItem().getId().equals(itemId));
            
            calculateAndSetBasePrice(defaultKit); 
            
            defaultKitRepository.save(defaultKit); 
        }
        
        defaultKitItemRepository.deleteByItemId(itemId);
    }

}