package com.example.demo.defaultkit;

import com.example.demo.dto.DefaultKitCreateRequest;
import com.example.demo.dto.DefaultKitResponse;
import com.example.demo.exception.AccessForbiddenException;
import com.example.demo.model.*;
import com.example.demo.repository.DefaultKitItemRepository;
import com.example.demo.repository.DefaultKitRepository;
import com.example.demo.repository.ItemRepository; // Cambiado de ArticleRepository
import com.example.demo.repository.UserRepository;
import com.example.demo.security.CustomUserDetails;
import com.example.demo.service.DefaultKitService;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class DefaultKitServiceTest {

    @Mock private DefaultKitRepository defaultKitRepository;
    @Mock private ItemRepository itemRepository; // Mock del Repositorio de Items
    @Mock private UserRepository userRepository;
    @Mock private DefaultKitItemRepository defaultKitItemRepository;

    @InjectMocks
    private DefaultKitService defaultKitService;

    private User adminUser;
    private User regularUser;
    private Article article1; // Usamos Article porque Item es abstract
    private Article article2;

    @BeforeEach
    void setUp() {
        adminUser = new User();
        adminUser.setId(1L);
        adminUser.setName("Admin");
        adminUser.setEmail("admin@test.com");
        adminUser.setRole(UserRole.ADMIN);

        regularUser = new User();
        regularUser.setId(2L);
        regularUser.setName("User");
        regularUser.setEmail("user@test.com");
        regularUser.setRole(UserRole.USER);

        // Instanciamos Article en lugar de Item
        article1 = new Article();
        article1.setId(10L);
        article1.setTitle("Taladro");
        article1.setPricePerMonth(10.0); // Importante para el cálculo automático del precio

        article2 = new Article();
        article2.setId(20L);
        article2.setTitle("Destornillador");
        article2.setPricePerMonth(20.0);
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private void authenticateAs(User user) {
        CustomUserDetails userDetails = new CustomUserDetails(user);
        UsernamePasswordAuthenticationToken auth =
                new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(auth);
        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
    }

    private DefaultKitCreateRequest validRequest() {
        // Constructor actualizado: (name, description, itemIds) - Sin precio base
        return new DefaultKitCreateRequest("Kit Básico", "Descripción", List.of(10L, 20L));
    }

    // ── TESTS ────────────────────────────────────────────────────────────

    @Test
    void createDefaultKit_asAdmin_success() {
        authenticateAs(adminUser);
        
        // El servicio ahora busca en itemRepository
        when(itemRepository.findById(10L)).thenReturn(Optional.of(article1));
        when(itemRepository.findById(20L)).thenReturn(Optional.of(article2));
        
        when(defaultKitRepository.save(any(DefaultKit.class))).thenAnswer(inv -> {
            DefaultKit dk = inv.getArgument(0);
            dk.setId(1L);
            return dk;
        });

        DefaultKit result = defaultKitService.createDefaultKit(validRequest());

        assertThat(result.getName()).isEqualTo("Kit Básico");
        // El precio se calcula automáticamente: 10.0 + 20.0 = 30.0
        assertThat(result.getBasePrice()).isEqualTo(30.0);
        assertThat(result.getItems()).hasSize(2);
        verify(defaultKitRepository).save(any(DefaultKit.class));
    }

    @Test
    void createDefaultKit_asRegularUser_throwsForbidden() {
        authenticateAs(regularUser);
        assertThrows(AccessForbiddenException.class, () -> defaultKitService.createDefaultKit(validRequest()));
        verify(defaultKitRepository, never()).save(any());
    }

    @Test
    void updateDefaultKit_PartialUpdate_Success() {
        authenticateAs(adminUser);
        
        DefaultKit existingKit = new DefaultKit();
        existingKit.setId(1L);
        existingKit.setName("Nombre Antiguo");
        existingKit.setBasePrice(0.0);

        when(defaultKitRepository.findById(1L)).thenReturn(Optional.of(existingKit));
        when(defaultKitRepository.save(any(DefaultKit.class))).thenAnswer(i -> i.getArgument(0));

        DefaultKitCreateRequest updateRequest = new DefaultKitCreateRequest();
        updateRequest.setName("Nombre Nuevo"); // Solo mandamos el nombre

        DefaultKitResponse result = defaultKitService.updateDefaultKit(1L, updateRequest);

        assertEquals(updateRequest.getName(), result.getName());
        assertThat(result.getName()).isEqualTo("Nombre Nuevo");
        verify(defaultKitRepository).save(existingKit);
    }

    @Test
    void removeItemFromAllDefaultKits_RecalculatesPrice() {
        // Configuramos un kit con un item
        DefaultKit kit = new DefaultKit();
        kit.setId(1L);
        kit.setBasePrice(10.0);
        
        DefaultKitItem link = new DefaultKitItem(kit, article1);
        kit.getItems().add(link);

        when(defaultKitItemRepository.findByItemId(10L)).thenReturn(List.of(link));
        
        defaultKitService.removeItemFromAllDefaultKits(10L);

        // Al quitar el item de 10.0, el precio debe bajar a 0.0
        assertThat(kit.getBasePrice()).isEqualTo(0.0);
        verify(defaultKitRepository).save(kit);
        verify(defaultKitItemRepository).deleteByItemId(10L);
    }
}