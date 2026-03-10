package com.example.demo.service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.dto.KitCreateRequest;
import com.example.demo.dto.KitPaymentDTO;
import com.example.demo.dto.KitResponse;
import com.example.demo.model.DeliveryMethod;
import com.example.demo.dto.RentedItemResponse;
import com.example.demo.model.Item;
import com.example.demo.model.Kit;
import com.example.demo.model.KitItem;
import com.example.demo.model.KitStatus;
import com.example.demo.model.Transaction;
import com.example.demo.model.TransactionType;
import com.example.demo.model.User;
import com.example.demo.model.Wallet;
import com.example.demo.repository.ItemRepository;
import com.example.demo.repository.KitRepository;
import com.example.demo.repository.TransactionRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.repository.WalletRepository;
import java.util.ArrayList;

@Service
public class KitService {
    @Autowired
    private KitRepository kitRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ItemRepository itemRepository;

    @Autowired
    private WalletRepository walletRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private OrderConfirmationEmailService orderConfirmationEmailService;

    private static final double PLATFORM_COURIER_PRICE = 9.99;
    private static final double PLATFORM_FEE_PERCENTAGE = 0.2; // TODO: Obtener la comisión de la configuración hecha por el admin
    private static final double PLATFORM_GUARANTEE_PERCENTAGE = 0.2; // TODO: Obtener la garantía de la configuración hecha por el admin

    public List<Kit> findAll() {
        return kitRepository.findAll();
    }

    public KitResponse findById(Long id) {
        Kit kit = kitRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Kit not found"));
        return new KitResponse(kit);
    }

    @Transactional
    public Kit create(KitCreateRequest request) {
        Kit kit = new Kit();
        kit.setName(request.name());
        kit.setCountry(request.country());
        kit.setCity(request.city());
        kit.setStartDate(request.startDate());
        kit.setEndDate(request.endDate());
        kit.setStatus(request.status() != null ? request.status() : KitStatus.PENDING);

        DeliveryMethod deliveryMethod = request.deliveryMethod() != null
                ? request.deliveryMethod()
                : DeliveryMethod.COURIER;
        kit.setDeliveryMethod(deliveryMethod);

        String meetingPoint = request.meetingPoint() != null ? request.meetingPoint().trim() : null;
        if (deliveryMethod == DeliveryMethod.MEETING_POINT && (meetingPoint == null || meetingPoint.isEmpty())) {
            throw new RuntimeException("Meeting point is required when delivery method is MEETING_POINT");
        }
        kit.setMeetingPoint(deliveryMethod == DeliveryMethod.MEETING_POINT ? meetingPoint : null);

        if (deliveryMethod == DeliveryMethod.COURIER) {
            kit.setCourierPrice(PLATFORM_COURIER_PRICE);
        } else {
            kit.setCourierPrice(null);
        }

        if (request.tenantId() != null) {
            User tenant = userRepository.findById(request.tenantId())
                    .orElseThrow(() -> new RuntimeException("Tenant not found"));
            kit.setTenant(tenant);
        }

        List<KitItem> kitItems = itemSelectionToKitItems(request.itemSelections());
        if (!kitItems.isEmpty()) {
            kit.setKitItems(kitItems);
        }

        validateDates(kit.getStartDate(), kit.getEndDate());

        Kit savedKit = kitRepository.save(kit);
        
        for (KitItem item : kitItems) {
            // TODO: Revisar si estamos pagando al dueño dos veces
            Item itemEntity = item.getItem();
            User owner = itemEntity.getOwner(); // asumiendo que Item tiene referencia a su dueño
            if (owner != null) {

                Optional<Wallet> ownerWallet = walletRepository.findByUserId(owner.getId());
                if (ownerWallet.isEmpty()) {
                    throw new RuntimeException("Owner wallet not found for user: " + owner.getId());
                }

                Wallet targetWallet = ownerWallet.get();

                // Precio total del item: precio por unidad * cantidad
                double totalAmount = item.getPricePerMonth() * item.getQuantity();

                Transaction transaction = new Transaction();
                transaction.setAmount(totalAmount);
                transaction.setType(TransactionType.PAYOUT);
                transaction.setDestinationWallet(targetWallet);

                transactionRepository.save(transaction);
            }
        }
        return savedKit;
    }

    public KitPaymentDTO getKitPayment(KitCreateRequest request) {
        double subtotalPrice = request.itemSelections().stream()
                .mapToDouble(item -> item.pricePerMonth() * item.quantity())
                .sum();
        double guarantee = subtotalPrice * PLATFORM_GUARANTEE_PERCENTAGE;
        double courierPrice = 0.0;
        if (request.deliveryMethod() == DeliveryMethod.COURIER) {
            courierPrice = PLATFORM_COURIER_PRICE;
        }
        double totalPrice = subtotalPrice + guarantee + courierPrice;

        return new KitPaymentDTO(
                toCents(totalPrice),
                toCents(subtotalPrice),
                toCents(guarantee),
                toCents(courierPrice)
        );
    }

    private Integer toCents(Double amount) {
        return (amount != null) ? (int) Math.round(amount * 100) : 0;
    }

    public KitResponse update(Long id, Kit updateData) {
        Kit kit = kitRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Kit not found"));

        if (updateData.getName() != null)
            kit.setName(updateData.getName());
        if (updateData.getCountry() != null)
            kit.setCountry(updateData.getCountry());
        if (updateData.getCity() != null)
            kit.setCity(updateData.getCity());
        if (updateData.getStartDate() != null)
            kit.setStartDate(updateData.getStartDate());
        if (updateData.getEndDate() != null)
            kit.setEndDate(updateData.getEndDate());
        if (updateData.getStatus() != null)
            kit.setStatus(updateData.getStatus());
        if (updateData.getDeliveryMethod() != null)
            kit.setDeliveryMethod(updateData.getDeliveryMethod());
        if (updateData.getMeetingPoint() != null)
            kit.setMeetingPoint(updateData.getMeetingPoint());
        if (updateData.getTenant() != null)
            kit.setTenant(updateData.getTenant());
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

    public List<Kit> findActiveKitsByTenant(Long tenantId) {
        return kitRepository.findByTenantIdAndEndDateGreaterThanEqual(tenantId, LocalDate.now());
    }

    public List<RentedItemResponse> findRentedItemsByTenant(Long tenantId) {
        List<Kit> activeKits = findActiveKitsByTenant(tenantId);
        List<RentedItemResponse> result = new ArrayList<>();
        for (Kit kit : activeKits) {
            for (Item item : kit.getItems()) {
                result.add(new RentedItemResponse(item, kit));
            }
        }
        return result;
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
                    "The kit can only be confirmed if its status is PENDING_VALIDATION");
        }

        kit.setStatus(KitStatus.ACTIVE);
        Kit savedKit = kitRepository.save(kit);
        orderConfirmationEmailService.sendOrderConfirmation(savedKit);
    }

    private List<KitItem> itemSelectionToKitItems(List<KitCreateRequest.ItemSelectionRequest> itemSelections) {
        return itemSelections.stream()
                .map(sel -> {
                    Item item = itemRepository.findById(sel.itemId())
                            .orElseThrow(() -> new RuntimeException("Item not found: " + sel.itemId()));
                    KitItem kitItem = new KitItem();
                    kitItem.setItem(item);
                    kitItem.setQuantity(sel.quantity());
                    kitItem.setPricePerMonth(sel.pricePerMonth());
                    return kitItem;
                })
                .collect(Collectors.toList());
    }

}
