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

    // ==========================================
    // TESTS ADICIONALES PARA CU-ARRENDATARIO-07
    // Modificar kits predeterminados (añadir/eliminar productos)
    // Reglas de negocio: RN-KIT-11, RN-KIT-12, RN-KIT-13, RN-KIT-14
    // ==========================================

    // --- addItemToKit: validaciones de entidades ---

    @Test
    void addItemToKit_userNotFound_throwsException() {
        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class, () ->
            kitService.addItemToKit(10L, 100L, 999L));
        assertEquals("User not found", ex.getMessage());
    }

    @Test
    void addItemToKit_kitNotFound_throwsException() {
        User user = createTestUser(1L, "User");
        when(userRepository.findById(user.getId())).thenReturn(Optional.of(user));
        when(kitRepository.findById(999L)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class, () ->
            kitService.addItemToKit(999L, 100L, user.getId()));
        assertEquals("Kit not found", ex.getMessage());
    }

    @Test
    void addItemToKit_itemNotFound_throwsException() {
        // RN-KIT-12: Cada selección de ítem debe incluir un ID de ítem válido y existente
        User user = createTestUser(1L, "User");
        Kit kit = new Kit();
        kit.setId(10L);
        kit.setSnapshots(new ArrayList<>());

        when(userRepository.findById(user.getId())).thenReturn(Optional.of(user));
        when(kitRepository.findById(kit.getId())).thenReturn(Optional.of(kit));
        when(itemRepository.findById(999L)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class, () ->
            kitService.addItemToKit(kit.getId(), 999L, user.getId()));
        assertEquals("Item not found", ex.getMessage());
    }

    @Test
    void addItemToKit_snapshotCapturesCorrectData() {
        // Verificar que el snapshot captura nombre, precio e ID original del artículo
        User user = createTestUser(1L, "Tenant");
        User owner = createTestUser(2L, "Owner");
        Article article = createTestArticle(100L, "Bicicleta", 3, owner);
        article.setPricePerMonth(25.0);

        Kit kit = new Kit();
        kit.setId(10L);
        kit.setSnapshots(new ArrayList<>());

        when(userRepository.findById(user.getId())).thenReturn(Optional.of(user));
        when(kitRepository.findById(kit.getId())).thenReturn(Optional.of(kit));
        when(itemRepository.findById(article.getId())).thenReturn(Optional.of(article));
        when(kitRepository.save(any(Kit.class))).thenAnswer(inv -> inv.getArgument(0));

        kitService.addItemToKit(kit.getId(), article.getId(), user.getId());

        assertEquals(1, kit.getSnapshots().size());
        ItemMemento snapshot = kit.getSnapshots().get(0);
        assertEquals(100L, snapshot.getOriginalItemId());
        assertEquals("Bicicleta", snapshot.getNameAtRental());
        assertEquals(25.0, snapshot.getPriceAtRental());
        assertEquals(1, snapshot.getSelectedUnits());
        assertEquals(owner, snapshot.getOwnerAtRental());
    }

    @Test
    void addItemToKit_multipleItems_allPresent() {
        // RN-KIT-11: Un kit debe tener al menos un ítem seleccionado (se pueden añadir varios)
        User user = createTestUser(1L, "Tenant");
        User owner = createTestUser(2L, "Owner");
        Article article1 = createTestArticle(100L, "Taladro", 5, owner);
        Article article2 = createTestArticle(101L, "Sierra", 3, owner);

        Kit kit = new Kit();
        kit.setId(10L);
        kit.setSnapshots(new ArrayList<>());

        when(userRepository.findById(user.getId())).thenReturn(Optional.of(user));
        when(kitRepository.findById(kit.getId())).thenReturn(Optional.of(kit));
        when(itemRepository.findById(100L)).thenReturn(Optional.of(article1));
        when(itemRepository.findById(101L)).thenReturn(Optional.of(article2));
        when(kitRepository.save(any(Kit.class))).thenAnswer(inv -> inv.getArgument(0));

        kitService.addItemToKit(kit.getId(), 100L, user.getId());
        kitService.addItemToKit(kit.getId(), 101L, user.getId());

        assertEquals(2, kit.getSnapshots().size());
        assertEquals(100L, kit.getSnapshots().get(0).getOriginalItemId());
        assertEquals(101L, kit.getSnapshots().get(1).getOriginalItemId());
    }

    @Test
    void addItemToKit_setsKitReferenceOnSnapshot() {
        // Verificar relación bidireccional: el snapshot debe tener referencia al kit
        User user = createTestUser(1L, "User");
        Article article = createTestArticle(100L, "Martillo", 2, createTestUser(2L, "Owner"));

        Kit kit = new Kit();
        kit.setId(10L);
        kit.setSnapshots(new ArrayList<>());

        when(userRepository.findById(user.getId())).thenReturn(Optional.of(user));
        when(kitRepository.findById(kit.getId())).thenReturn(Optional.of(kit));
        when(itemRepository.findById(article.getId())).thenReturn(Optional.of(article));
        when(kitRepository.save(any(Kit.class))).thenAnswer(inv -> inv.getArgument(0));

        kitService.addItemToKit(kit.getId(), article.getId(), user.getId());

        ItemMemento snapshot = kit.getSnapshots().get(0);
        assertEquals(kit, snapshot.getKit());
    }

    // --- removeItemFromKit: validaciones de entidades ---

    @Test
    void removeItemFromKit_userNotFound_throwsException() {
        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class, () ->
            kitService.removeItemFromKit(10L, 100L, 999L));
        assertEquals("User not found", ex.getMessage());
    }

    @Test
    void removeItemFromKit_kitNotFound_throwsException() {
        User user = createTestUser(1L, "User");
        when(userRepository.findById(user.getId())).thenReturn(Optional.of(user));
        when(kitRepository.findById(999L)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class, () ->
            kitService.removeItemFromKit(999L, 100L, user.getId()));
        assertEquals("Kit not found", ex.getMessage());
    }

    @Test
    void removeItemFromKit_emptySnapshots_throwsException() {
        // Kit sin snapshots → "Kit is already empty"
        User user = createTestUser(1L, "User");
        Kit kit = new Kit();
        kit.setId(10L);
        kit.setSnapshots(new ArrayList<>());

        when(userRepository.findById(user.getId())).thenReturn(Optional.of(user));
        when(kitRepository.findById(kit.getId())).thenReturn(Optional.of(kit));

        RuntimeException ex = assertThrows(RuntimeException.class, () ->
            kitService.removeItemFromKit(kit.getId(), 100L, user.getId()));
        assertEquals("Kit is already empty", ex.getMessage());
    }

    @Test
    void removeItemFromKit_preservesRemainingItems() {
        // RN-KIT-22: Modificar selección → verificar que el resto de ítems no se ve afectado
        User user = createTestUser(1L, "User");
        Kit kit = new Kit();
        kit.setId(10L);

        ItemMemento snap1 = createTestSnapshot(100L);
        snap1.setNameAtRental("Taladro");
        snap1.setPriceAtRental(30.0);
        ItemMemento snap2 = createTestSnapshot(101L);
        snap2.setNameAtRental("Sierra");
        snap2.setPriceAtRental(40.0);
        ItemMemento snap3 = createTestSnapshot(102L);
        snap3.setNameAtRental("Martillo");
        snap3.setPriceAtRental(15.0);

        kit.setSnapshots(new ArrayList<>(List.of(snap1, snap2, snap3)));

        when(userRepository.findById(user.getId())).thenReturn(Optional.of(user));
        when(kitRepository.findById(kit.getId())).thenReturn(Optional.of(kit));
        when(kitRepository.save(any(Kit.class))).thenAnswer(inv -> inv.getArgument(0));

        kitService.removeItemFromKit(kit.getId(), 101L, user.getId());

        assertEquals(2, kit.getSnapshots().size());
        assertEquals(100L, kit.getSnapshots().get(0).getOriginalItemId());
        assertEquals("Taladro", kit.getSnapshots().get(0).getNameAtRental());
        assertEquals(102L, kit.getSnapshots().get(1).getOriginalItemId());
        assertEquals("Martillo", kit.getSnapshots().get(1).getNameAtRental());
    }

    @Test
    void removeItemFromKit_unlinksMementoFromKit() {
        // Verificar que al eliminar se desvincula el snapshot del kit
        User user = createTestUser(1L, "User");
        Kit kit = new Kit();
        kit.setId(10L);

        ItemMemento snap1 = createTestSnapshot(100L);
        snap1.setKit(kit);
        ItemMemento snap2 = createTestSnapshot(101L);
        snap2.setKit(kit);

        kit.setSnapshots(new ArrayList<>(List.of(snap1, snap2)));

        when(userRepository.findById(user.getId())).thenReturn(Optional.of(user));
        when(kitRepository.findById(kit.getId())).thenReturn(Optional.of(kit));
        when(kitRepository.save(any(Kit.class))).thenAnswer(inv -> inv.getArgument(0));

        kitService.removeItemFromKit(kit.getId(), 100L, user.getId());

        // El snapshot eliminado debe tener kit = null
        assertEquals(null, snap1.getKit());
        // El que queda sigue vinculado
        assertEquals(kit, snap2.getKit());
    }

    @Test
    void addThenRemoveItem_roundTrip() {
        // CU-ARRENDATARIO-07 flujo completo: añadir y luego eliminar un producto
        User user = createTestUser(1L, "Tenant");
        User owner = createTestUser(2L, "Owner");
        Article article = createTestArticle(200L, "Cámara", 1, owner);

        Kit kit = new Kit();
        kit.setId(10L);
        ItemMemento existingSnap = createTestSnapshot(100L);
        kit.setSnapshots(new ArrayList<>(List.of(existingSnap)));

        when(userRepository.findById(user.getId())).thenReturn(Optional.of(user));
        when(kitRepository.findById(kit.getId())).thenReturn(Optional.of(kit));
        when(itemRepository.findById(200L)).thenReturn(Optional.of(article));
        when(kitRepository.save(any(Kit.class))).thenAnswer(inv -> inv.getArgument(0));

        // Añadir
        kitService.addItemToKit(kit.getId(), 200L, user.getId());
        assertEquals(2, kit.getSnapshots().size());

        // Eliminar el que acabamos de añadir
        kitService.removeItemFromKit(kit.getId(), 200L, user.getId());
        assertEquals(1, kit.getSnapshots().size());
        assertEquals(100L, kit.getSnapshots().get(0).getOriginalItemId());
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