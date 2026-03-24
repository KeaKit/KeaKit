package com.example.demo.kit;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.lenient;
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
import com.example.demo.dto.KitPaymentDTO;
import com.example.demo.dto.KitResponse;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.model.Article;
import com.example.demo.model.DeliveryMethod;
import com.example.demo.model.ItemMemento;
import com.example.demo.model.Kit;
import com.example.demo.model.KitDelivery;
import com.example.demo.model.KitStatus;
import com.example.demo.model.ServiceItem;
import com.example.demo.model.User;
import com.example.demo.repository.ItemRepository;
import com.example.demo.repository.KitRepository;
import com.example.demo.repository.TransactionRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.repository.CategoryRepository;
import com.example.demo.repository.WalletRepository;
import com.example.demo.service.AuthService;
import com.example.demo.service.KitDeliveryService;
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
    @Mock private KitDeliveryService kitDeliveryService;


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
    void createKit_missingTenantId_throwsException() {
        KitCreateRequest req = new KitCreateRequest(
            "Kit Test", "ES", "MAD",
            LocalDate.now(), LocalDate.now().plusDays(7),
            KitStatus.DRAFT, DeliveryMethod.COURIER, null,
            null, List.of()
        );

        when(platformConfigService.getCommissionRate()).thenReturn(0.2);

        RuntimeException ex = assertThrows(RuntimeException.class, () -> kitService.create(req));
        assertEquals("Tenant ID is required", ex.getMessage());
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
    void createKit_setsCourierPrice_basedOnDeliveryMethod() {
        User tenant = createTestUser(1L, "Tenant");
        when(platformConfigService.getCommissionRate()).thenReturn(0.2);
        mockUserAndKitSave(tenant);

        KitCreateRequest courierReq = new KitCreateRequest(
            "Kit Courier", "ES", "MAD",
            LocalDate.now(), LocalDate.now().plusDays(7),
            KitStatus.DRAFT, DeliveryMethod.COURIER, null,
            tenant.getId(), List.of()
        );

        KitCreateRequest meetingReq = new KitCreateRequest(
            "Kit Meeting", "ES", "MAD",
            LocalDate.now(), LocalDate.now().plusDays(7),
            KitStatus.DRAFT, DeliveryMethod.MEETING_POINT, "Plaza",
            tenant.getId(), List.of()
        );

        Kit courierKit = kitService.create(courierReq);
        Kit meetingKit = kitService.create(meetingReq);

        assertEquals(9.99, courierKit.getCourierPrice());
        assertEquals(null, meetingKit.getCourierPrice());
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
        kit.setSnapshots(new ArrayList<>(List.of(createTestSnapshot(100L, user))));
        
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
        kit.setSnapshots(new ArrayList<>(List.of(createTestSnapshot(100L, user), createTestSnapshot(101L, user))));

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
        kit.setSnapshots(new ArrayList<>(List.of(createTestSnapshot(100L, user)))); // Solo hay 1

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
        kit.setSnapshots(new ArrayList<>(List.of(createTestSnapshot(101L, user), createTestSnapshot(102L, user))));

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

        ItemMemento snap1 = createTestSnapshot(100L, user);
        snap1.setNameAtRental("Taladro");
        snap1.setPriceAtRental(30.0);
        ItemMemento snap2 = createTestSnapshot(101L, user);
        snap2.setNameAtRental("Sierra");
        snap2.setPriceAtRental(40.0);
        ItemMemento snap3 = createTestSnapshot(102L, user);
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

        ItemMemento snap1 = createTestSnapshot(100L, user);
        snap1.setKit(kit);
        ItemMemento snap2 = createTestSnapshot(101L, user);
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
        ItemMemento existingSnap = createTestSnapshot(100L, user);
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
        lenient().when(kitDeliveryService.ensureDeliveryExists(any(Kit.class))).thenReturn(new KitDelivery());
        when(kitRepository.save(any(Kit.class))).thenAnswer(inv -> {
            Kit k = inv.getArgument(0);
            k.setId(1L);
            return k;
        });
    }

    private ItemMemento createTestSnapshot(Long originalItemId, User user) {
        ItemMemento memento = new ItemMemento();
        memento.setOriginalItemId(originalItemId);
        memento.setOwnerAtRental(user);

        return memento;
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

    @Test
    void getKitPayment_fromRequest_withCourier_returnsCorrectPaymentDetails() {
        KitCreateRequest.ItemSelectionRequest selection1 = new KitCreateRequest.ItemSelectionRequest(100L, 2, 50.0);
        KitCreateRequest.ItemSelectionRequest selection2 = new KitCreateRequest.ItemSelectionRequest(101L, 1, 19.99);

        KitCreateRequest request = new KitCreateRequest(
            "Kit Pago", "ES", "MAD",
            LocalDate.now(), LocalDate.now().plusMonths(1),
            KitStatus.DRAFT, DeliveryMethod.COURIER, null,
            1L, List.of(selection1, selection2)
        );

        KitPaymentDTO result = kitService.getKitPayment(request);

        assertEquals(15398, result.totalPrice());
        assertEquals(11999, result.subtotalPrice());
        assertEquals(2400, result.guarantee());
        assertEquals(999, result.courierPrice());
    }

    @Test
    void getKitPayment_fromRequest_meetingPoint_returnsCorrectPaymentDetailsWithZeroCourierPrice() {
        KitCreateRequest.ItemSelectionRequest selection = new KitCreateRequest.ItemSelectionRequest(100L, 3, 10.0);

        KitCreateRequest request = new KitCreateRequest(
            "Kit Pago", "ES", "MAD",
            LocalDate.now(), LocalDate.now().plusMonths(1),
            KitStatus.DRAFT, DeliveryMethod.MEETING_POINT, "Plaza Mayor",
            1L, List.of(selection)
        );

        KitPaymentDTO result = kitService.getKitPayment(request);

        assertEquals(3600, result.totalPrice());
        assertEquals(3000, result.subtotalPrice());
        assertEquals(600, result.guarantee());
        assertEquals(0, result.courierPrice());
    }

    @Test
    void getKitPayment_fromKitId_withCourier_returnsCorrectPaymentDetails() throws ResourceNotFoundException {
        ItemMemento snapshot1 = new ItemMemento();
        snapshot1.setPriceAtRental(40.0);
        snapshot1.setSelectedUnits(2);

        ItemMemento snapshot2 = new ItemMemento();
        snapshot2.setPriceAtRental(15.5);
        snapshot2.setSelectedUnits(1);

        Kit kit = new Kit();
        kit.setId(77L);
    // Ensure start/end dates are set so calculateMonthsBetween does not NPE
    kit.setStartDate(LocalDate.now());
    kit.setEndDate(LocalDate.now().plusMonths(1));
        kit.setDeliveryMethod(DeliveryMethod.COURIER);
        kit.setSnapshots(List.of(snapshot1, snapshot2));

        when(kitRepository.findById(77L)).thenReturn(Optional.of(kit));

        KitPaymentDTO result = kitService.getKitPayment(77L);

        assertEquals(12459, result.totalPrice());
        assertEquals(9550, result.subtotalPrice());
        assertEquals(1910, result.guarantee());
        assertEquals(999, result.courierPrice());
    }

    @Test
    void getKitPayment_fromKitId_whenKitNotFound_throwsResourceNotFoundException() {
        when(kitRepository.findById(999L)).thenReturn(Optional.empty());

        ResourceNotFoundException ex = assertThrows(ResourceNotFoundException.class, () ->
            kitService.getKitPayment(999L));

        assertEquals("Kit not found", ex.getMessage());
    }

    @Test
    void getKitPayment_fromKitId_withServiceItems_returnsCorrectPaymentDetails() throws ResourceNotFoundException {
        User owner = createTestUser(50L, "ServiceOwner");

        ServiceItem service1 = new ServiceItem();
        service1.setId(201L);
        service1.setTitle("Montaje de muebles");
        service1.setPricePerMonth(80.0);
        service1.setOwner(owner);

        ServiceItem service2 = new ServiceItem();
        service2.setId(202L);
        service2.setTitle("Limpieza profunda");
        service2.setPricePerMonth(35.0);
        service2.setOwner(owner);

        ItemMemento serviceSnapshot1 = service1.createSnapshot(1, DeliveryMethod.MEETING_POINT, null, "Centro");
        ItemMemento serviceSnapshot2 = service2.createSnapshot(2, DeliveryMethod.MEETING_POINT, null, "Centro");

        Kit kit = new Kit();
        kit.setId(88L);
    kit.setStartDate(LocalDate.now());
    kit.setEndDate(LocalDate.now().plusMonths(1));
        kit.setDeliveryMethod(DeliveryMethod.MEETING_POINT);
        kit.setSnapshots(List.of(serviceSnapshot1, serviceSnapshot2));

        when(kitRepository.findById(88L)).thenReturn(Optional.of(kit));

        KitPaymentDTO result = kitService.getKitPayment(88L);

        assertEquals(18000, result.totalPrice());
        assertEquals(15000, result.subtotalPrice());
        assertEquals(3000, result.guarantee());
        assertEquals(0, result.courierPrice());
    }

    

}
