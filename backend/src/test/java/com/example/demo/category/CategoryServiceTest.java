package com.example.demo.category;

import com.example.demo.model.Category;
import com.example.demo.model.CategoryStatus;
import com.example.demo.model.User;
import com.example.demo.model.UserRole;
import com.example.demo.repository.CategoryRepository;
import com.example.demo.repository.ItemRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.service.CategoryService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

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

    @Mock
    private UserRepository userRepository;

    @Mock
    private SecurityContext securityContext;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private CategoryService categoryService;

    private Category sampleCategory;
    private User adminUser;

    @BeforeEach
    void setUp() {
        sampleCategory = new Category("Herramientas", "Bricolaje", 5.0, 500.0);
        sampleCategory.setId(1L);
        sampleCategory.setStatus(CategoryStatus.ACTIVE);

        adminUser = new User();
        adminUser.setId(1L);
        adminUser.setEmail("admin@test.com");
        adminUser.setRole(UserRole.ADMIN);

        // Simulamos la sesión y FORZAMOS que isAuthenticated() sea true
        lenient().when(securityContext.getAuthentication()).thenReturn(authentication);
        SecurityContextHolder.setContext(securityContext);
        lenient().when(authentication.isAuthenticated()).thenReturn(true);
        lenient().when(authentication.getPrincipal()).thenReturn("admin@test.com");
        lenient().when(userRepository.findByEmail("admin@test.com")).thenReturn(Optional.of(adminUser));
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
    void createCategory_success() {
        Category newCat = new Category("Hogar", "Cosas de casa", 10.0, 100.0);
        when(categoryRepository.save(any(Category.class))).thenAnswer(i -> i.getArgument(0));

        Category result = categoryService.createCategory(newCat);

        assertThat(result.getName()).isEqualTo("Hogar");
        verify(categoryRepository).save(newCat);
    }

    @Test
    void createCategory_throwsAccessDenied_whenNotAdmin() {
        User normalUser = new User();
        normalUser.setEmail("user@test.com");
        normalUser.setRole(UserRole.USER);

        lenient().when(authentication.getPrincipal()).thenReturn("user@test.com");
        lenient().when(userRepository.findByEmail("user@test.com")).thenReturn(Optional.of(normalUser));

        Category newCat = new Category("Hogar", "Cosas de casa", 10.0, 100.0);

        assertThrows(AccessDeniedException.class, () -> categoryService.createCategory(newCat));
        verify(categoryRepository, never()).save(any());
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