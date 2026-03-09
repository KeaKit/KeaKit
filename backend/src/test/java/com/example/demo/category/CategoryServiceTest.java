package com.example.demo.category;

import com.example.demo.model.Category;
import com.example.demo.model.CategoryStatus;
import com.example.demo.repository.CategoryRepository;
import com.example.demo.repository.ItemRepository;
import com.example.demo.service.CategoryService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CategoryServiceTest {

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private ItemRepository itemRepository;

    @InjectMocks
    private CategoryService categoryService;

    private Category sampleCategory;

    @BeforeEach
    void setUp() {
        sampleCategory = new Category("Herramientas", "Bricolaje", 5.0, 500.0);
        sampleCategory.setId(1L);
        sampleCategory.setStatus(CategoryStatus.ACTIVE);
    }

    @Test
    void getAllCategories_returnsList() {
        when(categoryRepository.findAll()).thenReturn(List.of(sampleCategory));

        List<Category> result = categoryService.getAllCategories();

        assertThat(result).hasSize(1);
        verify(categoryRepository).findAll();
    }

    @Test
    void getCategoryById_found() {
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(sampleCategory));

        Category result = categoryService.getCategoryById(1L);

        assertThat(result.getName()).isEqualTo("Herramientas");
    }

    @Test
    void getCategoryById_notFound_throws() {
        when(categoryRepository.findById(99L)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class, () -> categoryService.getCategoryById(99L));
        assertThat(ex.getMessage()).contains("Category not found"); // Ajusta al texto de error que lances en tu servicio real
    }

    @Test
    void createCategory_success() {
        Category newCat = new Category("Hogar", "Cosas de casa", 10.0, 100.0);
        when(categoryRepository.save(any(Category.class))).thenAnswer(i -> i.getArgument(0));

        Category result = categoryService.createCategory(newCat);

        assertThat(result.getName()).isEqualTo("Hogar");
        // Verifica que tu lógica pone el estado por defecto a DRAFT o según le indiques
        verify(categoryRepository).save(newCat);
    }

    @Test
    void updateCategory_success() {
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(sampleCategory));
        when(categoryRepository.save(any(Category.class))).thenAnswer(i -> i.getArgument(0));

        Category updateData = new Category();
        updateData.setName("Nuevas Herramientas");

        Category result = categoryService.updateCategory(1L, updateData);

        assertThat(result.getName()).isEqualTo("Nuevas Herramientas");
        verify(categoryRepository).save(sampleCategory);
    }

    @Test
    void deleteCategory_success() {
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(sampleCategory));
        
        when(itemRepository.existsByCategoryId(1L)).thenReturn(false);

        doNothing().when(categoryRepository).delete(sampleCategory);

        categoryService.deleteCategory(1L);

        verify(categoryRepository).delete(sampleCategory);
    }

    @Test
    void deleteCategory_throwsException_whenItemsExist() {
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(sampleCategory));
        
        when(itemRepository.existsByCategoryId(1L)).thenReturn(true);

        IllegalStateException ex = assertThrows(IllegalStateException.class, () -> {
            categoryService.deleteCategory(1L);
        });

        assertThat(ex.getMessage()).isEqualTo("No se puede eliminar la categoría porque tiene artículos asociados.");

        verify(categoryRepository, never()).delete(any());
    }

}