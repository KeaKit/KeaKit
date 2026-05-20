package com.example.demo.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import org.springframework.security.access.AccessDeniedException;
import java.util.List;

import com.example.demo.model.Category;
import com.example.demo.model.CategoryStatus;
import com.example.demo.model.User;
import com.example.demo.model.UserRole;
import com.example.demo.repository.CategoryRepository;
import com.example.demo.repository.ItemRepository;
import com.example.demo.repository.UserRepository;

@Service
public class CategoryService {
    
    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private ItemRepository itemRepository;

    @Autowired
    private UserRepository userRepository;

    private void checkAdminRole() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth.getPrincipal() == null || auth.getPrincipal().equals("anonymousUser")) {
            throw new AccessDeniedException("No hay usuario autenticado.");
        }

        Object principal = auth.getPrincipal();
        String email = (principal instanceof UserDetails) ?
                        ((UserDetails) principal).getUsername() : principal.toString();
        
        User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
                    
        if (user.getRole() != UserRole.ADMIN) {
            throw new AccessDeniedException("Solo los administradores pueden realizar esta operación.");
        }    
    }

    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }
    
    public Category getCategoryById(Long id) {
        return categoryRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Categoría no encontrada"));
    }

    public Category createCategory(Category category) {
        checkAdminRole();
        validateCategoryRules(category);
        if (category.getStatus() == null) {
            category.setStatus(CategoryStatus.DRAFT);
        }
        return categoryRepository.save(category);
    }

    public Category updateCategory(Long id, Category updateData) {
        checkAdminRole();
        Category category = getCategoryById(id);

        if (updateData.getName() != null) {
            category.setName(updateData.getName());
        }
        if (updateData.getDescription() != null) {
            category.setDescription(updateData.getDescription());
        }
        if (updateData.getStatus() != null) {
            category.setStatus(updateData.getStatus());
        }
        if (updateData.getMinPrice() != null) {
            category.setMinPrice(updateData.getMinPrice());
        }
        if (updateData.getMaxPrice() != null) {
            category.setMaxPrice(updateData.getMaxPrice());
        }
        validateCategoryRules(category);
        return categoryRepository.save(category);
    }

    public void deleteCategory(Long id) {
        checkAdminRole();
        Category category = getCategoryById(id);
        if (itemRepository.existsByCategoryId(id)) {
            throw new IllegalStateException("No se puede eliminar la categoría porque tiene artículos asociados.");
        }
        categoryRepository.delete(category);
    }

    public void validateCategoryRules(Category category) {
        if (category.getName() == null || category.getName().isBlank()) {
            throw new IllegalArgumentException("El nombre de la categoría es obligatorio y no puede estar vacío.");
        }
        if (category.getDescription() == null || category.getDescription().isBlank()) {
            throw new IllegalArgumentException("La descripción de la categoría es obligatoria y no puede estar vacía");
        }
        if (category.getName().length() > 100) {
            throw new IllegalArgumentException("El nombre de la categoría no puede superar los 100 caracteres.");
        }
        if (category.getDescription().length() > 1000) {
            throw new IllegalArgumentException("La descripción de la categoría no puede superar los 1000 caracteres.");
        }
        if (category.getMinPrice() == null || category.getMinPrice() < 0) {
            throw new IllegalArgumentException("El precio mínimo es obligatorio y debe ser mayor o igual a 0.");
        }
        if (category.getMaxPrice() == null || category.getMaxPrice() <= 0) {
            throw new IllegalArgumentException("El precio máximo es obligatorio y debe ser mayor que 0.");
        }
        if (category.getMaxPrice() < category.getMinPrice()) {
            throw new IllegalArgumentException("El precio máximo debe ser mayor o igual al precio mínimo.");
        }
    }

}
