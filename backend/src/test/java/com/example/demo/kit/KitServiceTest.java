package com.example.demo.kit;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import com.example.demo.dto.KitCreateRequest;
import com.example.demo.dto.KitResponse;
import com.example.demo.model.Article;
import com.example.demo.model.DeliveryMethod;
import com.example.demo.model.Kit;
import com.example.demo.model.KitStatus;
import com.example.demo.model.User;
import com.example.demo.repository.ItemRepository;
import com.example.demo.repository.KitRepository;
import com.example.demo.repository.TransactionRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.repository.CategoryRepository;
import com.example.demo.repository.WalletRepository;
import com.example.demo.service.AuthService;
import com.example.demo.service.KitService;
import com.example.demo.service.OrderConfirmationEmailService;
import com.example.demo.service.PlatformConfigService;

@ExtendWith(MockitoExtension.class)
public class KitServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private KitRepository kitRepository;
    @Mock private ItemRepository itemRepository;
    @Mock private CategoryRepository categoryRepository;
    @Mock private OrderConfirmationEmailService orderConfirmationEmailService;
    @Mock private WalletRepository walletRepository;
    @Mock private TransactionRepository transactionRepository;
    @Mock private PlatformConfigService platformConfigService;
    @Mock private AuthService authService;


    @InjectMocks
    private KitService kitService;

    @Test
    void createKit_withExplicitStatus_success() {
        User tenant = createTestUser(1L, "Juan");
        KitCreateRequest req = new KitCreateRequest("Kit Test", "España", "Madrid",
            LocalDate.now(), LocalDate.now().plusDays(7), KitStatus.DRAFT, null, null, tenant.getId(), List.of());

        mockUserAndKitSave(tenant);
        when(platformConfigService.getCommissionRate()).thenReturn(0.2);

        Kit res = kitService.create(req);
        assertEquals(KitStatus.DRAFT, res.getStatus());
    }

    @Test
    void createKit_withoutStatus_defaultsToDraft() {
        User tenant = createTestUser(1L, "Juan");
        KitCreateRequest req = new KitCreateRequest("Kit Test", "España", "Madrid",
            LocalDate.now(), LocalDate.now().plusDays(7), null, null, null, tenant.getId(), List.of());

        mockUserAndKitSave(tenant);
        when(platformConfigService.getCommissionRate()).thenReturn(0.2);

        Kit res = kitService.create(req);
        assertEquals(KitStatus.DRAFT, res.getStatus());
    }

    @Test
    void updateKit_changeStatus_success() {
        Kit existing = new Kit();
        existing.setId(1L);
        existing.setStatus(KitStatus.DRAFT);

        Kit update = new Kit();
        update.setStatus(KitStatus.ACTIVE);

        when(kitRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(kitRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        KitResponse res = kitService.update(1L, update);

        assertEquals(KitStatus.ACTIVE, res.getStatus());
    }

    @Test
    void createKit_invalidDates_throwsException() {
        KitCreateRequest req = new KitCreateRequest("Kit Test", "ES", "MAD", 
            LocalDate.now().plusDays(10), LocalDate.now(), null, null, null, 1L, List.of());

        assertThrows(RuntimeException.class, () -> kitService.create(req));
    }

    @Test
    void createKit_itemQuantityExceedsTotalUnits_throwsException() {
        User owner = createTestUser(2L, "Owner");
        Article article = createTestArticle(5L, "Tienda", 2, owner);

        // Tenant distinto al owner para no lanzar "Tenant cannot select their own items" antes
        User tenant = createTestUser(1L, "Tenant");

        KitCreateRequest.ItemSelectionRequest selection = new KitCreateRequest.ItemSelectionRequest(5L, 3, 10.0);
        KitCreateRequest req = new KitCreateRequest("Kit Fail", "ES", "MAD",
            LocalDate.now(), LocalDate.now().plusDays(7), null, null, null, tenant.getId(), List.of(selection));

        when(userRepository.findById(tenant.getId())).thenReturn(Optional.of(tenant));
        when(itemRepository.findById(5L)).thenReturn(Optional.of(article));
        when(platformConfigService.getCommissionRate()).thenReturn(0.2);

        assertThrows(RuntimeException.class, () -> kitService.create(req));
    }

    @Test
    void createKit_withItemSelections_success() {
        User tenant = createTestUser(1L, "Tenant");
        User owner = createTestUser(2L, "Owner");
        Article article = createTestArticle(100L, "Tienda", 10, owner);
        
        KitCreateRequest.ItemSelectionRequest selection = new KitCreateRequest.ItemSelectionRequest(article.getId(), 2, 50.0);
        KitCreateRequest req = new KitCreateRequest("Kit Test", "España", "Madrid",
            LocalDate.now(), LocalDate.now().plusDays(7), KitStatus.ACTIVE, null, null, tenant.getId(), List.of(selection));

        when(userRepository.findById(tenant.getId())).thenReturn(Optional.of(tenant));
        when(itemRepository.findById(article.getId())).thenReturn(Optional.of(article));
        when(platformConfigService.getCommissionRate()).thenReturn(0.2);
        mockUserAndKitSave(tenant);

        Kit res = kitService.create(req);
        assertNotNull(res);
        assertEquals(1, res.getSnapshots().size());
        assertEquals(2, res.getSnapshots().get(0).getSelectedUnits());
    }

    @Test
    void confirmKitStatus_when_paid_changesToActive() {
        Kit kit = new Kit();
        kit.setId(1L);
        kit.setStatus(KitStatus.PAID);

        when(kitRepository.findById(1L)).thenReturn(Optional.of(kit));
        when(kitRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        kitService.confirmKitStatus(1L);

        assertEquals(KitStatus.ACTIVE, kit.getStatus());
    }

    // --- MÉTODOS HELPER (Para limpiar los tests) ---

    private User createTestUser(Long id, String name) {
        User user = new User();
        user.setId(id);
        user.setName(name);
        user.setEmail(name.toLowerCase() + "@test.com");
        return user;
    }

    private Article createTestArticle(Long id, String title, int units, User owner) {
        Article article = new Article();
        article.setId(id);
        article.setTitle(title);
        article.setTotalUnits(units);
        article.setOwner(owner);
        article.setPricePerMonth(50.0);
        return article;
    }

    private void mockUserAndKitSave(User tenant) {
        when(userRepository.findById(tenant.getId())).thenReturn(Optional.of(tenant));
        when(kitRepository.save(any(Kit.class))).thenAnswer(inv -> {
            Kit k = inv.getArgument(0);
            k.setId(1L);
            return k;
        });
    }

    // Para histórico de kits


    @Test
    void findHistoryForAuthenticatedTenant_withValidParams_returnsPageOfKits() {
        
        Long tenantId = 1L;
        int page = 0;
        int size = 10;
        
        User tenant = createTestUser(tenantId, "Tenant");
        
        Kit kit1 = new Kit();
        kit1.setId(1L);
        kit1.setName("Kit Histórico 1");
        kit1.setStatus(KitStatus.FINISHED);
        kit1.setTenant(tenant);
        kit1.setOrderDate(LocalDate.now().minusDays(30));
        
        Kit kit2 = new Kit();
        kit2.setId(2L);
        kit2.setName("Kit Histórico 2");
        kit2.setStatus(KitStatus.ACTIVE);
        kit2.setTenant(tenant);
        kit2.setOrderDate(LocalDate.now().minusDays(15));
        
        Page<Kit> kitPage = new PageImpl<>(List.of(kit1, kit2));
        
        when(authService.getAuthenticatedUserId()).thenReturn(tenantId);
        when(kitRepository.findByTenantIdAndStatusNot(eq(tenantId), eq(KitStatus.DRAFT), any(Pageable.class)))
            .thenReturn(kitPage);

        
        Page<KitResponse> result = kitService.findHistoryForAuthenticatedTenant(page, size);

        
        assertNotNull(result);
        assertEquals(2, result.getContent().size());
        assertEquals("Kit Histórico 1", result.getContent().get(0).getName());
        assertEquals(KitStatus.FINISHED, result.getContent().get(0).getStatus());
        assertEquals("Kit Histórico 2", result.getContent().get(1).getName());
        assertEquals(KitStatus.ACTIVE, result.getContent().get(1).getStatus());
    }

    @Test
    void findHistoryForAuthenticatedTenant_withNegativePage_usesDefault() {
        
        Long tenantId = 1L;
        int page = -5;
        int size = 10;
        
        when(authService.getAuthenticatedUserId()).thenReturn(tenantId);
        when(kitRepository.findByTenantIdAndStatusNot(eq(tenantId), eq(KitStatus.DRAFT), any(Pageable.class)))
            .thenReturn(Page.empty());

        
        Page<KitResponse> result = kitService.findHistoryForAuthenticatedTenant(page, size);

        
        assertNotNull(result);
        verify(kitRepository).findByTenantIdAndStatusNot(eq(tenantId), eq(KitStatus.DRAFT), 
            argThat(pageable -> pageable.getPageNumber() == 0));
    }

    @Test
    void findHistoryForAuthenticatedTenant_withZeroSize_usesDefault() {
        
        Long tenantId = 1L;
        int page = 0;
        int size = 0;
        
        when(authService.getAuthenticatedUserId()).thenReturn(tenantId);
        when(kitRepository.findByTenantIdAndStatusNot(eq(tenantId), eq(KitStatus.DRAFT), any(Pageable.class)))
            .thenReturn(Page.empty());

        
        Page<KitResponse> result = kitService.findHistoryForAuthenticatedTenant(page, size);

        
        assertNotNull(result);
        verify(kitRepository).findByTenantIdAndStatusNot(eq(tenantId), eq(KitStatus.DRAFT), 
            argThat(pageable -> pageable.getPageSize() == 1));
    }

    @Test
    void findHistoryForAuthenticatedTenant_returnsSortedByOrderDateDesc() {
        
        Long tenantId = 1L;
        int page = 0;
        int size = 10;
        
        when(authService.getAuthenticatedUserId()).thenReturn(tenantId);
        when(kitRepository.findByTenantIdAndStatusNot(eq(tenantId), eq(KitStatus.DRAFT), any(Pageable.class)))
            .thenReturn(Page.empty());

        
        kitService.findHistoryForAuthenticatedTenant(page, size);

        
        verify(kitRepository).findByTenantIdAndStatusNot(eq(tenantId), eq(KitStatus.DRAFT), 
            argThat(pageable -> {
                Sort.Order orderDateOrder = pageable.getSort().getOrderFor("orderDate");
                Sort.Order idOrder = pageable.getSort().getOrderFor("id");
                return orderDateOrder != null && 
                    orderDateOrder.getDirection() == Sort.Direction.DESC &&
                    idOrder != null && 
                    idOrder.getDirection() == Sort.Direction.DESC;
            }));
    }

    @Test
    void findHistoryForAuthenticatedTenant_excludesDraftKits() {
        
        Long tenantId = 1L;
        int page = 0;
        int size = 10;
        
        when(authService.getAuthenticatedUserId()).thenReturn(tenantId);
        when(kitRepository.findByTenantIdAndStatusNot(eq(tenantId), eq(KitStatus.DRAFT), any(Pageable.class)))
            .thenReturn(Page.empty());

        
        kitService.findHistoryForAuthenticatedTenant(page, size);

        verify(kitRepository).findByTenantIdAndStatusNot(eq(tenantId), eq(KitStatus.DRAFT), any(Pageable.class));
    }

    @Test
    void findHistoryForAuthenticatedTenant_whenUserNotAuthenticated_throwsException() {
        
        int page = 0;
        int size = 10;
        
        when(authService.getAuthenticatedUserId()).thenThrow(new RuntimeException("Usuario no autenticado"));

        assertThrows(RuntimeException.class, () -> {
            kitService.findHistoryForAuthenticatedTenant(page, size);
        });
    }

    @Test
    void findHistoryForAuthenticatedTenant_withMultiplePages_returnsCorrectPagination() {
        
        Long tenantId = 1L;
        int page = 2;
        int size = 5;
        
        User tenant = createTestUser(tenantId, "Tenant");
        List<Kit> kits = new ArrayList<>();
        for (int i = 0; i < size; i++) {
            Kit kit = new Kit();
            kit.setId((long) (i + 10));
            kit.setName("Kit " + i);
            kit.setStatus(KitStatus.FINISHED);
            kit.setTenant(tenant);
            kits.add(kit);
        }
        
        Page<Kit> kitPage = new PageImpl<>(kits, PageRequest.of(page, size), 20L);
        
        when(authService.getAuthenticatedUserId()).thenReturn(tenantId);
        when(kitRepository.findByTenantIdAndStatusNot(eq(tenantId), eq(KitStatus.DRAFT), any(Pageable.class)))
            .thenReturn(kitPage);

        
        Page<KitResponse> result = kitService.findHistoryForAuthenticatedTenant(page, size);

        
        assertNotNull(result);
        assertEquals(page, result.getNumber());
        assertEquals(size, result.getSize());
        assertEquals(20L, result.getTotalElements());
        assertEquals(4, result.getTotalPages());
    }

    @Test
    void findHistoryForAuthenticatedTenant_returnsKitsWithCorrectData() {
        
        Long tenantId = 1L;
        int page = 0;
        int size = 10;
        
        User tenant = createTestUser(tenantId, "Tenant Histórico");
        
        Kit kit = new Kit();
        kit.setId(100L);
        kit.setName("Kit de Prueba Histórico");
        kit.setCountry("España");
        kit.setCity("Barcelona");
        kit.setStartDate(LocalDate.now().minusMonths(2));
        kit.setEndDate(LocalDate.now().minusMonths(1));
        kit.setOrderDate(LocalDate.now().minusMonths(2));
        kit.setStatus(KitStatus.FINISHED);
        kit.setDeliveryMethod(DeliveryMethod.COURIER);
        kit.setCourierPrice(9.99);
        kit.setTenant(tenant);
        
        Page<Kit> kitPage = new PageImpl<>(List.of(kit));
        
        when(authService.getAuthenticatedUserId()).thenReturn(tenantId);
        when(kitRepository.findByTenantIdAndStatusNot(eq(tenantId), eq(KitStatus.DRAFT), any(Pageable.class)))
            .thenReturn(kitPage);

        
        Page<KitResponse> result = kitService.findHistoryForAuthenticatedTenant(page, size);

        
        assertNotNull(result);
        assertEquals(1, result.getContent().size());
        
        KitResponse response = result.getContent().get(0);
        assertEquals(100L, response.getId());
        assertEquals("Kit de Prueba Histórico", response.getName());
        assertEquals("España", response.getCountry());
        assertEquals("Barcelona", response.getCity());
        assertEquals(KitStatus.FINISHED, response.getStatus());
        assertEquals(tenantId, response.getTenantId());
    }
}