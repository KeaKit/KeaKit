package com.example.demo.service;

import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.dto.KitCreateRequest;
import com.example.demo.dto.KitResponse;
import com.example.demo.model.DeliveryMethod;
import com.example.demo.model.Item;
import com.example.demo.model.Kit;
import com.example.demo.model.KitItem;
import com.example.demo.model.KitStatus;
import com.example.demo.model.User;
import com.example.demo.model.Wallet;
import com.example.demo.repository.ItemRepository;
import com.example.demo.repository.KitRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.repository.WalletRepository;

@Service
public class KitService {

    private static final double PLATFORM_COURIER_PRICE = 9.99;

    private final KitRepository kitRepository;
    private final UserRepository userRepository;
    private final ItemRepository itemRepository;
    private final OrderConfirmationEmailService orderConfirmationEmailService;

    private final WalletRepository walletRepository;

    public KitService(
        KitRepository kitRepository,
        UserRepository userRepository,
        ItemRepository itemRepository,
        OrderConfirmationEmailService orderConfirmationEmailService,
        WalletRepository walletRepository
    ) {
        this.kitRepository = kitRepository;
        this.userRepository = userRepository;
        this.itemRepository = itemRepository;
        this.orderConfirmationEmailService = orderConfirmationEmailService;
        this.walletRepository = walletRepository;
    }

    public List<Kit> findAll() {
        return kitRepository.findAll();
    }

    public KitResponse findById(Long id) {
        Kit kit = kitRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Kit not found"));
        return new KitResponse(kit);
    }

    @Transactional
    public KitResponse create(KitCreateRequest request) {
        Kit kit = new Kit();
        kit.setName(request.getName());
        kit.setCountry(request.getCountry());
        kit.setCity(request.getCity());
        kit.setStartDate(request.getStartDate());
        kit.setEndDate(request.getEndDate());
        kit.setStatus(request.getStatus() != null ? request.getStatus() : KitStatus.PENDING);

        DeliveryMethod deliveryMethod = request.getDeliveryMethod() != null
            ? request.getDeliveryMethod()
            : DeliveryMethod.COURIER;
        kit.setDeliveryMethod(deliveryMethod);

        String meetingPoint = request.getMeetingPoint() != null ? request.getMeetingPoint().trim() : null;
        if (deliveryMethod == DeliveryMethod.MEETING_POINT && (meetingPoint == null || meetingPoint.isEmpty())) {
            throw new RuntimeException("Meeting point is required when delivery method is MEETING_POINT");
        }
        kit.setMeetingPoint(deliveryMethod == DeliveryMethod.MEETING_POINT ? meetingPoint : null);

        if (deliveryMethod == DeliveryMethod.COURIER) {
            kit.setCourierPrice(PLATFORM_COURIER_PRICE);
        } else {
            kit.setCourierPrice(null);
        }

        if (request.getTenantId() != null) {
            User tenant = userRepository.findById(request.getTenantId())
                .orElseThrow(() -> new RuntimeException("Tenant not found"));
            kit.setTenant(tenant);
        }

        List<KitItem> kitItems = buildKitItemsFromRequest(request);
        if (!kitItems.isEmpty()) {
            kit.setKitItems(kitItems);
        }

        validateDates(kit.getStartDate(), kit.getEndDate());

        Kit savedKit = kitRepository.save(kit);
        for (KitItem kitItem : savedKit.getKitItems()) {
    Item item = kitItem.getItem();
    User owner = item.getOwner(); // asumiendo que Item tiene referencia a su dueño
    if (owner != null) {
        Wallet ownerWallet = walletRepository.findByUserId(owner.getId());

        // Precio total del item: precio por unidad * cantidad
        double totalAmount = item.getPricePerMonth() * kitItem.getQuantity();

        // Sumar a la wallet disponible
        ownerWallet.setAvailableBalance(ownerWallet.getAvailableBalance() + totalAmount);

        walletRepository.save(ownerWallet);
    }
}
        return new KitResponse(savedKit);
    }

    public KitResponse update(Long id, Kit updateData) {
        Kit kit = kitRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Kit not found"));

        if (updateData.getName() != null) kit.setName(updateData.getName());
        if (updateData.getCountry() != null) kit.setCountry(updateData.getCountry());
        if (updateData.getCity() != null) kit.setCity(updateData.getCity());
        if (updateData.getStartDate() != null) kit.setStartDate(updateData.getStartDate());
        if (updateData.getEndDate() != null) kit.setEndDate(updateData.getEndDate());
        if (updateData.getStatus() != null) kit.setStatus(updateData.getStatus());
        if (updateData.getDeliveryMethod() != null) kit.setDeliveryMethod(updateData.getDeliveryMethod());
        if (updateData.getMeetingPoint() != null) kit.setMeetingPoint(updateData.getMeetingPoint());
        if (updateData.getTenant() != null) kit.setTenant(updateData.getTenant());
        if (updateData.getKitItems() != null && !updateData.getKitItems().isEmpty()) {
            kit.setKitItems(updateData.getKitItems());
        } else if (updateData.getItems() != null) {
            kit.setItems(updateData.getItems());
        }

        if (kit.getDeliveryMethod() == DeliveryMethod.COURIER) {
            kit.setCourierPrice(PLATFORM_COURIER_PRICE);
        } else {
            kit.setCourierPrice(null);
        }

        validateDates(kit.getStartDate(), kit.getEndDate());

        Kit savedKit = kitRepository.save(kit);
        return new KitResponse(savedKit);
    }

    public void deleteById(Long id) {
        if (!kitRepository.existsById(id)) {
            throw new RuntimeException("Kit not found");
        }
        kitRepository.deleteById(id);
    }

    public void validateDates(LocalDate startDate, LocalDate endDate) {
        if (startDate != null && endDate != null && endDate.isBefore(startDate)) {
            throw new RuntimeException("End date cannot be before start date");
        }
    }

    public List<KitResponse> findByTenantId(Long tenantId) {
        List<Kit> kits = kitRepository.findByTenantId(tenantId);
        return kits.stream()
            .map(KitResponse::new)
            .collect(java.util.stream.Collectors.toList());
    }

    public KitResponse findTrackingKitById(Long kitId, Long tenantId) {
        Kit kit = kitRepository.findById(kitId)
            .orElseThrow(() -> new RuntimeException("Kit not found"));
        if (kit.getTenant() == null || !kit.getTenant().getId().equals(tenantId)) {
            throw new RuntimeException("Kit does not belong to the specified tenant");
        }
        return new KitResponse(kit);
    }

    public void confirmKitStatus(Long id) {
        Kit kit = kitRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Kit not found"));

        if (kit.getStatus() != KitStatus.PENDING_VALIDATION) {
            throw new RuntimeException(
                "The kit can only be confirmed if its status is PENDING_VALIDATION"
            );
        }

        kit.setStatus(KitStatus.ACTIVE);
        Kit savedKit = kitRepository.save(kit);
        orderConfirmationEmailService.sendOrderConfirmation(savedKit);
    }

    private List<KitItem> buildKitItemsFromRequest(KitCreateRequest request) {
        Map<Long, Integer> quantitiesByItemId = new LinkedHashMap<>();

        if (request.getItemSelections() != null && !request.getItemSelections().isEmpty()) {
            for (KitCreateRequest.KitItemSelectionRequest selection : request.getItemSelections()) {
                if (selection == null || selection.getItemId() == null) {
                    throw new RuntimeException("Each selected item must include itemId");
                }
                int quantity = selection.getQuantity() != null ? selection.getQuantity() : 1;
                if (quantity < 1) {
                    throw new RuntimeException("Quantity must be at least 1");
                }
                quantitiesByItemId.merge(selection.getItemId(), quantity, Integer::sum);
            }
        } else if (request.getItemIds() != null && !request.getItemIds().isEmpty()) {
            for (Long itemId : request.getItemIds()) {
                if (itemId == null) {
                    throw new RuntimeException("Item id cannot be null");
                }
                quantitiesByItemId.merge(itemId, 1, Integer::sum);
            }
        }

        if (quantitiesByItemId.isEmpty()) {
            return List.of();
        }

        List<Item> foundItems = itemRepository.findAllById(quantitiesByItemId.keySet());
        Set<Long> foundItemIds = foundItems.stream()
            .map(Item::getId)
            .collect(Collectors.toSet());

        for (Long itemId : quantitiesByItemId.keySet()) {
            if (!foundItemIds.contains(itemId)) {
                throw new RuntimeException("Item not found: " + itemId);
            }
        }

        Map<Long, Item> itemById = foundItems.stream()
            .collect(Collectors.toMap(Item::getId, item -> item));

        return quantitiesByItemId.entrySet().stream()
            .map(entry -> {
                Item item = itemById.get(entry.getKey());
                int requestedQuantity = entry.getValue();
                int totalUnits = item.getTotalUnits() != null ? item.getTotalUnits() : 1;

                if (requestedQuantity > totalUnits) {
                    throw new RuntimeException(
                        "Requested quantity for item " + item.getId() + " exceeds available units (" + totalUnits + ")"
                    );
                }

                KitItem kitItem = new KitItem();
                kitItem.setItem(item);
                kitItem.setQuantity(requestedQuantity);
                return kitItem;
            })
            .collect(Collectors.toList());
    }

}

