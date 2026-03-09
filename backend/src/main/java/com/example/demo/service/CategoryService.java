package com.example.demo.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

import com.example.demo.model.Category;
import com.example.demo.repository.CategoryRepository;
import com.example.demo.repository.ItemRepository;

@Service
public class CategoryService {
    
    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private ItemRepository itemRepository;

    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }
    
    public Category getCategoryById(Long id) {
        return categoryRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Category not found"));
    }

    public Category createCategory(Category category) {
        validateCategoryRules(category);
        return categoryRepository.save(category);
    }

    public Category updateCategory(Long id, Category updateData) {
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
