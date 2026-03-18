package com.example.demo.defaultkit;

import com.example.demo.dto.DefaultKitCreateRequest;
import com.example.demo.exception.AccessForbiddenException;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.exception.UnauthorizedException;
import com.example.demo.model.*;
import com.example.demo.repository.ArticleRepository;
import com.example.demo.repository.DefaultKitItemRepository;
import com.example.demo.repository.DefaultKitRepository;
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
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class DefaultKitServiceTest {

    @Mock private DefaultKitRepository defaultKitRepository;
    @Mock private ArticleRepository articleRepository;
    @Mock private UserRepository userRepository;
    @Mock private DefaultKitItemRepository defaultKitItemRepository;

    @InjectMocks
    private DefaultKitService defaultKitService;

    private User adminUser;
    private User regularUser;
    private Article article1;
    private Article article2;

    @BeforeEach
    void setUp() {
        adminUser = new User();
        adminUser.setId(1L);
        adminUser.setName("Admin");
        adminUser.setEmail("admin@test.com");
        adminUser.setPassword("password");
        adminUser.setRole(UserRole.ADMIN);

        regularUser = new User();
        regularUser.setId(2L);
        regularUser.setName("User");
        regularUser.setEmail("user@test.com");
        regularUser.setPassword("password");
        regularUser.setRole(UserRole.USER);

        article1 = new Article();
        article1.setId(10L);
        article1.setTitle("Taladro");

        article2 = new Article();
        article2.setId(20L);
        article2.setTitle("Destornillador");
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
        return new DefaultKitCreateRequest("Kit Básico", "Kit con herramientas básicas", 49.99, List.of(10L, 20L));
    }

    // ═══════════════════════════════════════════════════════════════════════
    // RN-ADM-06: El administrador puede crear, editar y eliminar tipos de objetos
    // RN-ADM-07: El administrador puede asociar cada tipo de objeto a una categoría concreta
    // RN-ADM-08: El administrador puede modificar la categoría asociada a un tipo de objeto
    // ═══════════════════════════════════════════════════════════════════════

    // ── CREATE ────────────────────────────────────────────────────────────

    @Test
    void createDefaultKit_asAdmin_success() {
        authenticateAs(adminUser);
        when(articleRepository.findById(10L)).thenReturn(Optional.of(article1));
        when(articleRepository.findById(20L)).thenReturn(Optional.of(article2));
        when(defaultKitRepository.save(any(DefaultKit.class))).thenAnswer(inv -> {
            DefaultKit dk = inv.getArgument(0);
            dk.setId(1L);
            return dk;
        });

        DefaultKit result = defaultKitService.createDefaultKit(validRequest());

        assertThat(result.getName()).isEqualTo("Kit Básico");
        assertThat(result.getDescription()).isEqualTo("Kit con herramientas básicas");
        assertThat(result.getBasePrice()).isEqualTo(49.99);
        assertThat(result.getItems()).hasSize(2);
        verify(defaultKitRepository).save(any(DefaultKit.class));
    }

    @Test
    void createDefaultKit_asAdmin_withoutArticles_success() {
        authenticateAs(adminUser);
        DefaultKitCreateRequest request = new DefaultKitCreateRequest("Kit Vacío", "Sin artículos", 0.0, null);
        when(defaultKitRepository.save(any(DefaultKit.class))).thenAnswer(inv -> {
            DefaultKit dk = inv.getArgument(0);
            dk.setId(2L);
            return dk;
        });

        DefaultKit result = defaultKitService.createDefaultKit(request);

        assertThat(result.getName()).isEqualTo("Kit Vacío");
        assertThat(result.getItems()).isEmpty();
    }

    @Test
    void createDefaultKit_asAdmin_withEmptyArticleIds_success() {
        authenticateAs(adminUser);
        DefaultKitCreateRequest request = new DefaultKitCreateRequest("Kit Lista Vacía", "Desc", 10.0, List.of());
        when(defaultKitRepository.save(any(DefaultKit.class))).thenAnswer(inv -> {
            DefaultKit dk = inv.getArgument(0);
            dk.setId(3L);
            return dk;
        });

        DefaultKit result = defaultKitService.createDefaultKit(request);

        assertThat(result.getItems()).isEmpty();
    }

    @Test
    void createDefaultKit_asRegularUser_throwsForbidden() {
        authenticateAs(regularUser);

        assertThrows(AccessForbiddenException.class,
                () -> defaultKitService.createDefaultKit(validRequest()));
        verify(defaultKitRepository, never()).save(any());
    }

    @Test
    void createDefaultKit_withoutAuthentication_throwsUnauthorized() {
        // No SecurityContext set
        assertThrows(UnauthorizedException.class,
                () -> defaultKitService.createDefaultKit(validRequest()));
    }

    // ── CREATE – Validation: nombre obligatorio (RN-KIT-02 adaptado) ─────

    @Test
    void createDefaultKit_nullName_throwsIllegalArgument() {
        authenticateAs(adminUser);
        DefaultKitCreateRequest request = new DefaultKitCreateRequest(null, "Desc", 10.0, null);

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> defaultKitService.createDefaultKit(request));
        assertThat(ex.getMessage()).contains("nombre");
    }

    @Test
    void createDefaultKit_emptyName_throwsIllegalArgument() {
        authenticateAs(adminUser);
        DefaultKitCreateRequest request = new DefaultKitCreateRequest("   ", "Desc", 10.0, null);

        assertThrows(IllegalArgumentException.class,
                () -> defaultKitService.createDefaultKit(request));
    }

    @Test
    void createDefaultKit_nameTooLong_throwsIllegalArgument() {
        authenticateAs(adminUser);
        String longName = "A".repeat(256);
        DefaultKitCreateRequest request = new DefaultKitCreateRequest(longName, "Desc", 10.0, null);

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> defaultKitService.createDefaultKit(request));
        assertThat(ex.getMessage()).contains("255");
    }

    // ── CREATE – Validation: descripción obligatoria (RN-CAT-03 adaptado) ─

    @Test
    void createDefaultKit_nullDescription_throwsIllegalArgument() {
        authenticateAs(adminUser);
        DefaultKitCreateRequest request = new DefaultKitCreateRequest("Kit", null, 10.0, null);

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> defaultKitService.createDefaultKit(request));
        assertThat(ex.getMessage()).contains("descripción");
    }

    @Test
    void createDefaultKit_emptyDescription_throwsIllegalArgument() {
        authenticateAs(adminUser);
        DefaultKitCreateRequest request = new DefaultKitCreateRequest("Kit", "  ", 10.0, null);

        assertThrows(IllegalArgumentException.class,
                () -> defaultKitService.createDefaultKit(request));
    }

    @Test
    void createDefaultKit_descriptionTooLong_throwsIllegalArgument() {
        authenticateAs(adminUser);
        String longDesc = "B".repeat(1001);
        DefaultKitCreateRequest request = new DefaultKitCreateRequest("Kit", longDesc, 10.0, null);

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> defaultKitService.createDefaultKit(request));
        assertThat(ex.getMessage()).contains("1000");
    }

    // ── CREATE – Validation: precio base obligatorio y >= 0 ──────────────

    @Test
    void createDefaultKit_nullBasePrice_throwsIllegalArgument() {
        authenticateAs(adminUser);
        DefaultKitCreateRequest request = new DefaultKitCreateRequest("Kit", "Desc", null, null);

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> defaultKitService.createDefaultKit(request));
        assertThat(ex.getMessage()).contains("precio base");
    }

    @Test
    void createDefaultKit_negativeBasePrice_throwsIllegalArgument() {
        authenticateAs(adminUser);
        DefaultKitCreateRequest request = new DefaultKitCreateRequest("Kit", "Desc", -5.0, null);

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> defaultKitService.createDefaultKit(request));
        assertThat(ex.getMessage()).contains("negativo");
    }

    @Test
    void createDefaultKit_zeroBasePrice_success() {
        authenticateAs(adminUser);
        DefaultKitCreateRequest request = new DefaultKitCreateRequest("Kit Gratis", "Desc", 0.0, null);
        when(defaultKitRepository.save(any(DefaultKit.class))).thenAnswer(inv -> inv.getArgument(0));

        DefaultKit result = defaultKitService.createDefaultKit(request);

        assertThat(result.getBasePrice()).isEqualTo(0.0);
    }

    // ── CREATE – Validation: artículos válidos ────────────────────────────

    @Test
    void createDefaultKit_articleNotFound_throwsResourceNotFound() {
        authenticateAs(adminUser);
        DefaultKitCreateRequest request = new DefaultKitCreateRequest("Kit", "Desc", 10.0, List.of(999L));
        when(articleRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> defaultKitService.createDefaultKit(request));
    }

    // ── GET ALL ───────────────────────────────────────────────────────────

    @Test
    void getAllDefaultKits_returnsAll() {
        DefaultKit dk1 = new DefaultKit("Kit 1", "Desc 1", 10.0);
        DefaultKit dk2 = new DefaultKit("Kit 2", "Desc 2", 20.0);
        when(defaultKitRepository.findAll()).thenReturn(List.of(dk1, dk2));

        List<DefaultKit> result = defaultKitService.getAllDefaultKits();

        assertThat(result).hasSize(2);
        assertThat(result.get(0).getName()).isEqualTo("Kit 1");
        assertThat(result.get(1).getName()).isEqualTo("Kit 2");
    }

    @Test
    void getAllDefaultKits_empty_returnsEmpty() {
        when(defaultKitRepository.findAll()).thenReturn(List.of());

        List<DefaultKit> result = defaultKitService.getAllDefaultKits();

        assertThat(result).isEmpty();
    }

    // ── GET BY ID ─────────────────────────────────────────────────────────

    @Test
    void getDefaultKitById_found_returnsKit() {
        DefaultKit dk = new DefaultKit("Kit", "Desc", 10.0);
        dk.setId(1L);
        when(defaultKitRepository.findById(1L)).thenReturn(Optional.of(dk));

        DefaultKit result = defaultKitService.getDefaultKitById(1L);

        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getName()).isEqualTo("Kit");
    }

    @Test
    void getDefaultKitById_notFound_throwsResourceNotFound() {
        when(defaultKitRepository.findById(anyLong())).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> defaultKitService.getDefaultKitById(999L));
    }

    // ── UPDATE (HU-ADMIN-05: editar tipos de objetos) ─────────────────────

    @Test
    void updateDefaultKit_asAdmin_fullUpdate_success() {
        authenticateAs(adminUser);
        DefaultKit existing = new DefaultKit("Viejo", "Desc vieja", 10.0);
        existing.setId(1L);
        when(defaultKitRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(articleRepository.findById(10L)).thenReturn(Optional.of(article1));
        when(defaultKitRepository.save(any(DefaultKit.class))).thenAnswer(inv -> inv.getArgument(0));

        DefaultKitCreateRequest request = new DefaultKitCreateRequest("Nuevo", "Desc nueva", 99.0, List.of(10L));
        DefaultKit result = defaultKitService.updateDefaultKit(1L, request);

        assertThat(result.getName()).isEqualTo("Nuevo");
        assertThat(result.getDescription()).isEqualTo("Desc nueva");
        assertThat(result.getBasePrice()).isEqualTo(99.0);
        assertThat(result.getItems()).hasSize(1);
    }

    @Test
    void updateDefaultKit_asAdmin_partialUpdate_onlyName() {
        authenticateAs(adminUser);
        DefaultKit existing = new DefaultKit("Viejo", "Desc original", 50.0);
        existing.setId(1L);
        when(defaultKitRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(defaultKitRepository.save(any(DefaultKit.class))).thenAnswer(inv -> inv.getArgument(0));

        DefaultKitCreateRequest request = new DefaultKitCreateRequest();
        request.setName("Nuevo Nombre");

        DefaultKit result = defaultKitService.updateDefaultKit(1L, request);

        assertThat(result.getName()).isEqualTo("Nuevo Nombre");
        assertThat(result.getDescription()).isEqualTo("Desc original");
        assertThat(result.getBasePrice()).isEqualTo(50.0);
    }

    @Test
    void updateDefaultKit_asRegularUser_throwsForbidden() {
        authenticateAs(regularUser);

        assertThrows(AccessForbiddenException.class,
                () -> defaultKitService.updateDefaultKit(1L, validRequest()));
    }

    @Test
    void updateDefaultKit_notFound_throwsResourceNotFound() {
        authenticateAs(adminUser);
        when(defaultKitRepository.findById(anyLong())).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> defaultKitService.updateDefaultKit(999L, validRequest()));
    }

    @Test
    void updateDefaultKit_emptyName_throwsIllegalArgument() {
        authenticateAs(adminUser);
        DefaultKit existing = new DefaultKit("Viejo", "Desc", 10.0);
        existing.setId(1L);
        when(defaultKitRepository.findById(1L)).thenReturn(Optional.of(existing));

        DefaultKitCreateRequest request = new DefaultKitCreateRequest();
        request.setName("  ");

        assertThrows(IllegalArgumentException.class,
                () -> defaultKitService.updateDefaultKit(1L, request));
    }

    @Test
    void updateDefaultKit_nameTooLong_throwsIllegalArgument() {
        authenticateAs(adminUser);
        DefaultKit existing = new DefaultKit("Viejo", "Desc", 10.0);
        existing.setId(1L);
        when(defaultKitRepository.findById(1L)).thenReturn(Optional.of(existing));

        DefaultKitCreateRequest request = new DefaultKitCreateRequest();
        request.setName("A".repeat(256));

        assertThrows(IllegalArgumentException.class,
                () -> defaultKitService.updateDefaultKit(1L, request));
    }

    @Test
    void updateDefaultKit_emptyDescription_throwsIllegalArgument() {
        authenticateAs(adminUser);
        DefaultKit existing = new DefaultKit("Kit", "Desc", 10.0);
        existing.setId(1L);
        when(defaultKitRepository.findById(1L)).thenReturn(Optional.of(existing));

        DefaultKitCreateRequest request = new DefaultKitCreateRequest();
        request.setDescription("  ");

        assertThrows(IllegalArgumentException.class,
                () -> defaultKitService.updateDefaultKit(1L, request));
    }

    @Test
    void updateDefaultKit_descriptionTooLong_throwsIllegalArgument() {
        authenticateAs(adminUser);
        DefaultKit existing = new DefaultKit("Kit", "Desc", 10.0);
        existing.setId(1L);
        when(defaultKitRepository.findById(1L)).thenReturn(Optional.of(existing));

        DefaultKitCreateRequest request = new DefaultKitCreateRequest();
        request.setDescription("B".repeat(1001));

        assertThrows(IllegalArgumentException.class,
                () -> defaultKitService.updateDefaultKit(1L, request));
    }

    @Test
    void updateDefaultKit_negativePrice_throwsIllegalArgument() {
        authenticateAs(adminUser);
        DefaultKit existing = new DefaultKit("Kit", "Desc", 10.0);
        existing.setId(1L);
        when(defaultKitRepository.findById(1L)).thenReturn(Optional.of(existing));

        DefaultKitCreateRequest request = new DefaultKitCreateRequest();
        request.setBasePrice(-1.0);

        assertThrows(IllegalArgumentException.class,
                () -> defaultKitService.updateDefaultKit(1L, request));
    }

    @Test
    void updateDefaultKit_articleNotFound_throwsResourceNotFound() {
        authenticateAs(adminUser);
        DefaultKit existing = new DefaultKit("Kit", "Desc", 10.0);
        existing.setId(1L);
        when(defaultKitRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(articleRepository.findById(999L)).thenReturn(Optional.empty());

        DefaultKitCreateRequest request = new DefaultKitCreateRequest();
        request.setArticleIds(List.of(999L));

        assertThrows(ResourceNotFoundException.class,
                () -> defaultKitService.updateDefaultKit(1L, request));
    }

    @Test
    void updateDefaultKit_replacesArticles() {
        authenticateAs(adminUser);
        DefaultKit existing = new DefaultKit("Kit", "Desc", 10.0);
        existing.setId(1L);
        DefaultKitItem oldItem = new DefaultKitItem(existing, article1);
        existing.getItems().add(oldItem);

        when(defaultKitRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(articleRepository.findById(20L)).thenReturn(Optional.of(article2));
        when(defaultKitRepository.save(any(DefaultKit.class))).thenAnswer(inv -> inv.getArgument(0));

        DefaultKitCreateRequest request = new DefaultKitCreateRequest();
        request.setArticleIds(List.of(20L));

        DefaultKit result = defaultKitService.updateDefaultKit(1L, request);

        assertThat(result.getItems()).hasSize(1);
        assertThat(result.getItems().get(0).getArticle().getId()).isEqualTo(20L);
    }

    // ── DELETE (HU-ADMIN-06: eliminar tipos de objetos) ───────────────────

    @Test
    void deleteDefaultKit_asAdmin_success() {
        authenticateAs(adminUser);
        DefaultKit dk = new DefaultKit("Kit", "Desc", 10.0);
        dk.setId(1L);
        when(defaultKitRepository.findById(1L)).thenReturn(Optional.of(dk));

        defaultKitService.deleteDefaultKit(1L);

        verify(defaultKitRepository).delete(dk);
    }

    @Test
    void deleteDefaultKit_asRegularUser_throwsForbidden() {
        authenticateAs(regularUser);

        assertThrows(AccessForbiddenException.class,
                () -> defaultKitService.deleteDefaultKit(1L));
        verify(defaultKitRepository, never()).delete(any());
    }

    @Test
    void deleteDefaultKit_notFound_throwsResourceNotFound() {
        authenticateAs(adminUser);
        when(defaultKitRepository.findById(anyLong())).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> defaultKitService.deleteDefaultKit(999L));
    }

    // ── removeArticleFromAllDefaultKits ───────────────────────────────────

    @Test
    void removeArticleFromAllDefaultKits_callsRepository() {
        defaultKitService.removeArticleFromAllDefaultKits(10L);

        verify(defaultKitItemRepository).deleteByArticleId(10L);
    }
}
