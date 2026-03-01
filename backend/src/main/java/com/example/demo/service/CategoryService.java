package com.example.demo.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

import com.example.demo.model.Category;
import com.example.demo.repository.CategoryRepository;

@Service
public class CategoryService {
    
    @Autowired
    private CategoryRepository categoryRepository;

    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }
    
    public Category getCategoryById(Long id) {
        return categoryRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Category not found"));
    }

    public Category createCategory(Category category) {
        return categoryRepository.save(category);
    }

    public Category updateCategory(Long id, Category updateData) {
        Category category = getCategoryById(id);

        if (updateData.getName() != null && !updateData.getName().trim().isEmpty()) {
            category.setName(updateData.getName());
        }
        if (updateData.getDescription() != null && !updateData.getDescription().trim().isEmpty()) {
            category.setDescription(updateData.getDescription());
        }
        if (updateData.getStatus() != null) {
            category.setStatus(updateData.getStatus());
        }
        if (updateData.getMinPrice() != null && updateData.getMinPrice() >= 0) {
            category.setMinPrice(updateData.getMinPrice());
        }
        if (updateData.getMaxPrice() != null && updateData.getMaxPrice() > 0) {
            category.setMaxPrice(updateData.getMaxPrice());
        }
        return categoryRepository.save(category);
    }

    public void deleteCategory(Long id) {
        Category category = getCategoryById(id);
        categoryRepository.delete(category);
    }

}
