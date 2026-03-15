package com.example.demo.kit;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
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

import com.example.demo.dto.KitCreateRequest;
import com.example.demo.dto.KitResponse;
import com.example.demo.model.Article;
import com.example.demo.model.ItemMemento;
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

@ExtendWith(MockitoExtension.class)
public class KitServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private KitRepository kitRepository;
    @Mock private ItemRepository itemRepository;
    @Mock private CategoryRepository categoryRepository;
    @Mock private OrderConfirmationEmailService orderConfirmationEmailService;
    @Mock private WalletRepository walletRepository;
    @Mock private TransactionRepository transactionRepository;

    @InjectMocks
    private KitService kitService;

    @Test
    void createKit_withExplicitStatus_success() {
        User tenant = createTestUser(1L, "Juan");
        KitCreateRequest req = new KitCreateRequest("Kit Test", "España", "Madrid",
            LocalDate.now(), LocalDate.now().plusDays(7), KitStatus.DRAFT, null, null, tenant.getId(), List.of());

        mockUserAndKitSave(tenant);

        Kit res = kitService.create(req);

        assertEquals(KitStatus.DRAFT, res.getStatus());
    }


    @Test
    void createKit_withoutStatus_defaultsToDraft() {
        User tenant = createTestUser(1L, "Juan");
        KitCreateRequest req = new KitCreateRequest("Kit Test", "España", "Madrid", 
            LocalDate.now(), LocalDate.now().plusDays(7), null, null, null, tenant.getId(), List.of());

        mockUserAndKitSave(tenant);

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
        Article article = createTestArticle(5L, "Tienda", 2, createTestUser(2L, "Owner"));
        KitCreateRequest.ItemSelectionRequest selection = new KitCreateRequest.ItemSelectionRequest(5L, 3, 10.0);
        
        KitCreateRequest req = new KitCreateRequest("Kit Fail", "ES", "MAD", 
            LocalDate.now(), LocalDate.now().plusDays(7), null, null, null, 1L, List.of(selection));

        // Debemos mockear el tenant y el item para llegar a la validación de unidades
        when(userRepository.findById(any())).thenReturn(Optional.of(new User()));
        when(itemRepository.findById(5L)).thenReturn(Optional.of(article));

        assertThrows(RuntimeException.class, () -> kitService.create(req));
    }

    @Test
    void createKit_withItemSelections_success() {
        // Preparar datos
        User tenant = createTestUser(1L, "Tenant");
        User owner = createTestUser(2L, "Owner");
        Article article = createTestArticle(100L, "Tienda", 10, owner);
        
        KitCreateRequest.ItemSelectionRequest selection = new KitCreateRequest.ItemSelectionRequest(article.getId(), 2, 50.0);
        KitCreateRequest req = new KitCreateRequest("Kit Test", "España", "Madrid", 
            LocalDate.now(), LocalDate.now().plusDays(7), KitStatus.ACTIVE, null, null, tenant.getId(), List.of(selection));

        // Mocks
        when(userRepository.findById(tenant.getId())).thenReturn(Optional.of(tenant));
        when(itemRepository.findById(article.getId())).thenReturn(Optional.of(article));
        mockUserAndKitSave(tenant);

        // Ejecutar
        Kit res = kitService.create(req);

        // Verificar
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

    // ==========================================
    // TESTS PARA ADD / REMOVE ITEM (KITS PREDETERMINADOS)
    // ==========================================

    @Test
    void addItemToKit_success() {
        User user = createTestUser(1L, "Admin");
        Kit kit = new Kit();
        kit.setId(10L);
        kit.setSnapshots(new ArrayList<>());
        
        Article article = createTestArticle(100L, "Taladro", 5, createTestUser(2L, "Owner"));

        when(userRepository.findById(user.getId())).thenReturn(Optional.of(user));
        when(kitRepository.findById(kit.getId())).thenReturn(Optional.of(kit));
        when(itemRepository.findById(article.getId())).thenReturn(Optional.of(article));
        when(kitRepository.save(any(Kit.class))).thenAnswer(inv -> inv.getArgument(0));

        KitResponse res = kitService.addItemToKit(kit.getId(), article.getId(), user.getId());

        assertNotNull(res);
        assertEquals(1, kit.getSnapshots().size());
        assertEquals(article.getId(), kit.getSnapshots().get(0).getOriginalItemId());
        assertEquals(kit, kit.getSnapshots().get(0).getKit()); // Validar que se enlazó el kit
    }

    @Test
    void addItemToKit_itemAlreadyExists_throwsException() {
        User user = createTestUser(1L, "Admin");
        Kit kit = new Kit();
        kit.setId(10L);
        kit.setSnapshots(new ArrayList<>(List.of(createTestSnapshot(100L))));
        
        Article article = createTestArticle(100L, "Taladro", 5, createTestUser(2L, "Owner"));

        when(userRepository.findById(user.getId())).thenReturn(Optional.of(user));
        when(kitRepository.findById(kit.getId())).thenReturn(Optional.of(kit));
        when(itemRepository.findById(article.getId())).thenReturn(Optional.of(article));

        RuntimeException ex = assertThrows(RuntimeException.class, () -> 
            kitService.addItemToKit(kit.getId(), article.getId(), user.getId()));
        assertEquals("This item is already in the kit", ex.getMessage());
    }

    @Test
    void removeItemFromKit_success() {
        User user = createTestUser(1L, "Admin");
        Kit kit = new Kit();
        kit.setId(10L);
        // Metemos 2 items para que pase la validación de no dejar el kit vacío
        kit.setSnapshots(new ArrayList<>(List.of(createTestSnapshot(100L), createTestSnapshot(101L))));

        when(userRepository.findById(user.getId())).thenReturn(Optional.of(user));
        when(kitRepository.findById(kit.getId())).thenReturn(Optional.of(kit));
        when(kitRepository.save(any(Kit.class))).thenAnswer(inv -> inv.getArgument(0));

        KitResponse res = kitService.removeItemFromKit(kit.getId(), 100L, user.getId());

        assertNotNull(res);
        assertEquals(1, kit.getSnapshots().size());
        assertEquals(101L, kit.getSnapshots().get(0).getOriginalItemId()); // Comprobamos que quedó el otro
    }

    @Test
    void removeItemFromKit_kitWouldBeEmpty_throwsException() {
        User user = createTestUser(1L, "Admin");
        Kit kit = new Kit();
        kit.setId(10L);
        kit.setSnapshots(new ArrayList<>(List.of(createTestSnapshot(100L)))); // Solo hay 1

        when(userRepository.findById(user.getId())).thenReturn(Optional.of(user));
        when(kitRepository.findById(kit.getId())).thenReturn(Optional.of(kit));

        RuntimeException ex = assertThrows(RuntimeException.class, () -> 
            kitService.removeItemFromKit(kit.getId(), 100L, user.getId()));
        assertEquals("A kit cannot be empty. It must contain at least one item.", ex.getMessage());
    }

    @Test
    void removeItemFromKit_itemNotInKit_throwsException() {
        User user = createTestUser(1L, "Admin");
        Kit kit = new Kit();
        kit.setId(10L);
        kit.setSnapshots(new ArrayList<>(List.of(createTestSnapshot(101L), createTestSnapshot(102L))));

        when(userRepository.findById(user.getId())).thenReturn(Optional.of(user));
        when(kitRepository.findById(kit.getId())).thenReturn(Optional.of(kit));

        RuntimeException ex = assertThrows(RuntimeException.class, () -> 
            kitService.removeItemFromKit(kit.getId(), 100L, user.getId())); // Intentamos borrar el 100
        assertEquals("Item is not part of this kit", ex.getMessage());
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

    private ItemMemento createTestSnapshot(Long originalItemId) {
        ItemMemento memento = new ItemMemento();
        memento.setOriginalItemId(originalItemId);
        return memento;
    }

    
}