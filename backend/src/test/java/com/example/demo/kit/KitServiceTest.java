package com.example.demo.kit;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.example.demo.dto.KitCreateRequest;
import com.example.demo.dto.KitResponse;
import com.example.demo.model.Article;
import com.example.demo.model.Kit;
import com.example.demo.model.KitStatus;
import com.example.demo.model.User;
import com.example.demo.model.Wallet;
import com.example.demo.repository.ItemRepository;
import com.example.demo.repository.KitRepository;
import com.example.demo.repository.TransactionRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.repository.CategoryRepository;
import com.example.demo.repository.WalletRepository;
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
}