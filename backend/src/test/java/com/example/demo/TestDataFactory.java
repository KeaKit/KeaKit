package com.example.demo;

import com.example.demo.model.*;
import com.example.demo.dto.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import org.springframework.test.util.ReflectionTestUtils;

public class TestDataFactory {
    public static User createMockUser(Long id, String email, String name, UserRole role) {
        User user = new User(
                email,
                "password123",
                name,
                role,
                "123456789",
                "Calle Test, 1",
                "Test City",
                "Test Country");
        ReflectionTestUtils.setField(user, "id", id);
        return user;
    }

    public static User createMockAdminUser() {
        return createMockUser(1L, "admin@keakit.com", "Admin User", UserRole.ADMIN);
    }

    public static User createMockTenantUser() {
        return createMockUser(2L, "tenant@test.com", "Tenant User", UserRole.USER);
    }

    public static User createMockOwnerUser() {
        return createMockUser(3L, "owner@test.com", "Owner User", UserRole.USER);
    }

    public static UserResponse createMockUserResponse(User user) {
        return new UserResponse(user);
    }

    public static Wallet createMockWallet(Long walletId, User user, Double balance) {
        Wallet wallet = new Wallet();
        ReflectionTestUtils.setField(wallet, "id", walletId);
        ReflectionTestUtils.setField(wallet, "user", user);

        if(balance != null) {
            Transaction transaction = createMockTransaction(1L, wallet, balance, TransactionType.PAYOUT);
            ReflectionTestUtils.setField(wallet, "transactions", List.of(transaction));
        } else {
            // balance = 150.0
            Transaction transaction = createMockTransaction(1L, wallet, 50.0, TransactionType.PAYOUT);
            ReflectionTestUtils.setField(wallet, "transactions", List.of(transaction, transaction, transaction));
        }

        return wallet;
    }

    public static Transaction createMockTransaction(Long transactionId, Wallet wallet, Double amount, TransactionType type) {
        Transaction transaction = new Transaction();
        ReflectionTestUtils.setField(transaction, "id", transactionId);
        ReflectionTestUtils.setField(transaction, "destinationWallet", wallet);
        ReflectionTestUtils.setField(transaction, "amount", amount);
        ReflectionTestUtils.setField(transaction, "type", type);
        return transaction;
    }

    public static Kit createMockKit(User tenant, KitStatus status) {
        Kit kit = new Kit(
                "Summer Adventure Kit",
                "España",
                "Sevilla",
                LocalDate.now().plusDays(1),
                LocalDate.now().plusMonths(1),
                tenant,
                status);

        ReflectionTestUtils.setField(kit, "id", 1L);

        kit.setOrderDate(LocalDate.now());
        kit.setAppliedCommissionRate(0.10);
        kit.setAppliedGuaranteeRate(0.05);
        kit.setCourierPrice(15.0);
        kit.setDeliveryMethod(DeliveryMethod.COURIER);

        List<ItemMemento> snapshots = new ArrayList<>();
        snapshots.add(createMockItemMemento(1L, 100.0, 2));
        snapshots.add(createMockItemMemento(2L, 50.0, 1));
        snapshots.add(createMockItemMemento(3L, 10.0, 5));

        kit.setSnapshots(snapshots);

        return kit;
    }

    // Método auxiliar para los items dentro del Kit
    private static ItemMemento createMockItemMemento(Long itemId, Double price, Integer units) {
        ItemMemento memento = new ItemMemento();
        User ownerAtRental = createMockOwnerUser();
        ReflectionTestUtils.setField(memento, "originalItemId", itemId);
        ReflectionTestUtils.setField(memento, "priceAtRental", price);
        ReflectionTestUtils.setField(memento, "selectedUnits", units);
        ReflectionTestUtils.setField(memento, "nameAtRental", "Item de prueba");
        ReflectionTestUtils.setField(memento, "ownerAtRental", ownerAtRental);
        return memento;
    }

    public static KitResponse createMockKitResponse(User tenant, KitStatus status) {
        Kit kit = createMockKit(tenant, status);
        return new KitResponse(kit);
    }

    public static KitResponse createMockKitResponse() {
        User tenant = createMockTenantUser();
        return createMockKitResponse(tenant, KitStatus.DRAFT);
    }

    public static KitPaymentDTO createMockKitPaymentDTO(Integer total, Integer subtotal, Integer guarantee,
            Integer courier) {
        return new KitPaymentDTO(
                total,
                subtotal,
                guarantee,
                courier);
    }

    /**
     * Crea un KitPaymentDTO con valores por defecto para facilitar su uso en
     * múltiples tests sin necesidad de repetir la creación de datos.
     * Valores por defecto:
     * - Total: 150.00€ (15000 en céntimos)
     * - Subtotal: 100.00€ (10000 en céntimos)
     * - Guarantee (Fianza): 40.00€ (4000 en céntimos)
     * - Courier (Envío): 10.00€ (1000 en céntimos)
     * 
     * @return
     */
    public static KitPaymentDTO createDefaultKitPaymentDTO() {
        return new KitPaymentDTO(
                15000,
                10000,
                4000,
                1000);
    }

    public static Item createMockItem(Long id, String title, Double price, User owner) {
        Item item = new Item() {
        };

        ReflectionTestUtils.setField(item, "id", id);
        item.setTitle(title);
        item.setDescription("Descripción de prueba para " + title);
        item.setCity("Sevilla");
        item.setPricePerMonth(price);
        item.setOwner(owner);
        item.setTotalUnits(1);
        item.setAvailableFrom(LocalDate.now());
        item.setAvailableUntil(LocalDate.now().plusMonths(6));

        item.setAllowedMethods(new ArrayList<>(List.of(DeliveryMethod.MEETING_POINT)));

        return item;
    }

    public static Item createDefaultItem() {
        User owner = createMockOwnerUser();
        return createMockItem(1L, "Cámara Reflex", 50.0, owner);
    }
}
