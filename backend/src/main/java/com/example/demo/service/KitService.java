package com.example.demo.service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.dto.KitCreateRequest;
import com.example.demo.dto.KitPaymentDTO;
import com.example.demo.dto.KitResponse;
import com.example.demo.dto.RentedItemResponse;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.model.DeliveryMethod;
import com.example.demo.model.Item;
import com.example.demo.model.ItemMemento;
import com.example.demo.model.Kit;
import com.example.demo.model.KitStatus;
import com.example.demo.model.User;
import com.example.demo.repository.ItemRepository;
import com.example.demo.repository.KitRepository;
import com.example.demo.repository.UserRepository;

@Service
public class KitService {
    // TODO: Revisar reglas de negocio, validaciones y excepciones.

    @Autowired
    private KitRepository kitRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ItemRepository itemRepository;

    @Autowired
    private OrderConfirmationEmailService orderConfirmationEmailService;

    private static final double PLATFORM_COURIER_PRICE = 9.99;

    @Autowired
    private PlatformConfigService platformConfigService;

    @Autowired
    private KitDeliveryService kitDeliveryService;

    @Autowired
    private AuthService authService;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private PromoCodeService promoCodeService;

    // TODO: Obtener la garantía de la configuración hecha por el admin
    private static final double PLATFORM_GUARANTEE_PERCENTAGE = 0.2;

    public List<Kit> findAll() {
        return kitRepository.findAll();
    }

    public KitResponse findById(Long id) throws ResourceNotFoundException {
        Kit kit = kitRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Kit no encontrado"));
        return new KitResponse(kit);
    }

    @Transactional
    public Kit create(KitCreateRequest request) {
        Kit kit = new Kit();
        if (request.name() != null && request.name().length() > 255) {
            throw new RuntimeException("El nombre del kit no puede superar los 255 caracteres");
        }
        kit.setName(request.name());
        kit.setCountry(request.country());
        kit.setCity(request.city());
        kit.setStartDate(request.startDate());
        kit.setEndDate(request.endDate());
        KitStatus status = request.status() != null ? request.status() : KitStatus.DRAFT;
        kit.setStatus(status);

        List<KitCreateRequest.ItemSelectionRequest> selections = request.itemSelections() != null
                ? request.itemSelections()
                : List.of();

        if (status != KitStatus.DRAFT && selections.isEmpty()) {
            throw new RuntimeException("Se deben seleccionar items a menos que el kit esté en estado DRAFT");
        }

        DeliveryMethod deliveryMethod = request.deliveryMethod() != null
                ? request.deliveryMethod()
                : DeliveryMethod.COURIER;
        kit.setDeliveryMethod(deliveryMethod);

        String meetingPoint = request.meetingPoint() != null ? request.meetingPoint().trim() : null;
        if (deliveryMethod == DeliveryMethod.MEETING_POINT && (meetingPoint == null || meetingPoint.isEmpty())) {
            throw new RuntimeException("Se requiere punto de encuentro cuando el método de entrega es MEETING_POINT");
        }
        kit.setMeetingPoint(deliveryMethod == DeliveryMethod.MEETING_POINT ? meetingPoint : null);

        if (deliveryMethod == DeliveryMethod.COURIER) {
            kit.setCourierPrice(PLATFORM_COURIER_PRICE);
        } else {
            kit.setCourierPrice(null);
        }

        kit.setAppliedCommissionRate(platformConfigService.getCommissionRate());
        kit.setAppliedGuaranteeRate(PLATFORM_GUARANTEE_PERCENTAGE);

        if (request.tenantId() == null) {
            throw new RuntimeException("Id del arrendatario requerido para crear un kit");
        }

        if (request.tenantId() != null) {
            User tenant = userRepository.findById(request.tenantId())
                    .orElseThrow(() -> new RuntimeException("Arrendatario no encontrado"));
            kit.setTenant(tenant);
        }

        if (!selections.isEmpty()) {
            for (KitCreateRequest.ItemSelectionRequest item : selections) {
                Item foundItem = itemRepository.findById(item.itemId())
                        .orElseThrow(() -> new RuntimeException("Item no encontrado: " + item.itemId()));
                if (request.tenantId() == foundItem.getOwner().getId()) {
                    throw new RuntimeException("El arrendatario no puede seleccionar sus propios items");
                }
                validateItemAvailability(item.itemId(), item.quantity(), kit.getStartDate(), kit.getEndDate());
            }
        }

        List<ItemMemento> snapshots = itemSelectionToSnapshots(
                selections,
                kit.getDeliveryMethod(),
                kit.getCourierPrice(),
                kit.getMeetingPoint());

        if (!snapshots.isEmpty()) {
            kit.setSnapshots(snapshots);
        }
        validateDates(kit.getStartDate(), kit.getEndDate());

        Kit savedKit = kitRepository.save(kit);

        if (savedKit.getStatus() != KitStatus.DRAFT) {
            kitDeliveryService.ensureDeliveryExists(savedKit);
        }

        return savedKit;
    }

    public KitPaymentDTO getKitPayment(KitCreateRequest request, String promoCode, String userEmail) {
        double months = calculateMonthsBetween(request.startDate(), request.endDate());
        double subtotalPrice = request.itemSelections().stream()
            .mapToDouble(item -> item.pricePerMonth() * item.quantity() * months)
            .sum();
        double guarantee = subtotalPrice * PLATFORM_GUARANTEE_PERCENTAGE;
        double courierPrice = 0.0;
        if (request.deliveryMethod() == DeliveryMethod.COURIER) {
            courierPrice = PLATFORM_COURIER_PRICE;
        }

        double discount = 0.0;
        if (promoCode != null && !promoCode.isBlank() && userEmail != null) {
            var validation = promoCodeService.validateForTenantDiscount(promoCode, userEmail);
            if (validation.isValid()) {
                discount = subtotalPrice * validation.getDiscountRate();
            }
        }

        double totalPrice = subtotalPrice + guarantee + courierPrice - discount;

        return new KitPaymentDTO(
                toCents(totalPrice),
                toCents(subtotalPrice),
                toCents(guarantee),
                toCents(courierPrice),
                toCents(discount));
    }

    public KitPaymentDTO getKitPayment(KitCreateRequest request) {
        return getKitPayment(request, null, null);
    }

    public KitPaymentDTO getKitPayment(Long kitId, String promoCode, String userEmail) throws ResourceNotFoundException {
        Kit kit = kitRepository.findById(kitId)
                .orElseThrow(() -> new ResourceNotFoundException("Kit no encontrado"));
        double months = calculateMonthsBetween(kit.getStartDate(), kit.getEndDate());
        double subtotalPrice = kit.getSnapshots().stream()
            .mapToDouble(ki -> ki.getPriceAtRental() * ki.getSelectedUnits() * months)
            .sum();
        double guarantee = subtotalPrice * PLATFORM_GUARANTEE_PERCENTAGE;
        double courierPrice = kit.getDeliveryMethod() == DeliveryMethod.COURIER ? PLATFORM_COURIER_PRICE : 0.0;

        double discount = 0.0;
        if (promoCode != null && !promoCode.isBlank() && userEmail != null) {
            var validation = promoCodeService.validateForTenantDiscount(promoCode, userEmail);
            if (validation.isValid()) {
                discount = subtotalPrice * validation.getDiscountRate();
            }
        }

        double totalPrice = subtotalPrice + guarantee + courierPrice - discount;

        return new KitPaymentDTO(
                toCents(totalPrice),
                toCents(subtotalPrice),
                toCents(guarantee),
                toCents(courierPrice),
                toCents(discount));
    }

    public KitPaymentDTO getKitPayment(Long kitId) throws ResourceNotFoundException {
        return getKitPayment(kitId, null, null);
    }

    private Integer toCents(Double amount) {
        return (amount != null) ? (int) Math.round(amount * 100) : 0;
    }

    public double calculateMonthsBetween(LocalDate start, LocalDate end) {
        long diffDays = ChronoUnit.DAYS.between(start, end) + 1;
        return diffDays / 30.0;

        // con el backend de antes daba problemas esta función, por ejemplo, si era 15 enero-14 de febrero, daba 0 days, porque hacía 14-15+1; y debería ser 1 mes y 31 días, no 1 mes y 0 días
    }

    public KitResponse update(Long id, Kit updateData) {
        Kit kit = kitRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Kit no encontrado"));

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
        if (updateData.getSnapshots() != null && !updateData.getSnapshots().isEmpty()) {
            kit.setSnapshots(updateData.getSnapshots());
        }

        if (kit.getDeliveryMethod() == DeliveryMethod.COURIER) {
            kit.setCourierPrice(PLATFORM_COURIER_PRICE);
        } else {
            kit.setCourierPrice(null);
        }

        if (updateData.getStartDate() != null || updateData.getEndDate() != null) {
            LocalDate newStart = updateData.getStartDate() != null ? updateData.getStartDate() : kit.getStartDate();
            LocalDate newEnd = updateData.getEndDate() != null ? updateData.getEndDate() : kit.getEndDate();
            
            if (kit.getStatus() == KitStatus.DRAFT && kit.getSnapshots() != null) {
                for (ItemMemento snapshot : kit.getSnapshots()) {
                    validateItemAvailability(snapshot.getOriginalItemId(), snapshot.getSelectedUnits(), newStart, newEnd);
                }
            }
        }

        validateDates(kit.getStartDate(), kit.getEndDate());

        Kit savedKit = kitRepository.save(kit);
        return new KitResponse(savedKit);
    }

    public void deleteById(Long id) {
        if (!kitRepository.existsById(id)) {
            throw new RuntimeException("Kit no encontrado");
        }
        kitRepository.deleteById(id);
    }

    public void validateDates(LocalDate startDate, LocalDate endDate) {
        if (startDate != null && endDate != null && endDate.isBefore(startDate)) {
            throw new RuntimeException("La fecha de finalización no puede ser anterior a la fecha de inicio");
        }
    }

    public List<Kit> findActiveKitsByTenant(Long tenantId) {
        return kitRepository.findByTenantIdAndEndDateGreaterThanEqual(tenantId, LocalDate.now());
    }

    public List<RentedItemResponse> findRentedItemsByTenant(Long tenantId) {
        List<Kit> activeKits = findActiveKitsByTenant(tenantId);
        List<RentedItemResponse> result = new ArrayList<>();
        for (Kit kit : activeKits) {
            if (kit.getStatus() == KitStatus.PAID || kit.getStatus() == KitStatus.ACTIVE) {
                for (ItemMemento snapshot : kit.getSnapshots()) {
                    result.add(new RentedItemResponse(snapshot, kit));
                }
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

    public List<KitResponse> findTrackingUpdateableByTenantId(Long tenantId) {
        List<Kit> kits = kitRepository.findTrackingUpdateableByTenantId(tenantId);
        return kits.stream()
                .map(KitResponse::new)
                .collect(java.util.stream.Collectors.toList());
    }

    public Page<KitResponse> findHistoryForAuthenticatedTenant(int page, int size) {
        Long tenantId = authService.getAuthenticatedUserId();

        Pageable pageable = PageRequest.of(
                Math.max(page, 0),
                Math.max(size, 1),
                Sort.by(Sort.Direction.DESC, "orderDate").and(Sort.by(Sort.Direction.DESC, "id")));

        return kitRepository.findByTenantIdAndStatusNot(tenantId, KitStatus.DRAFT, pageable)
                .map(KitResponse::new);
    }

    public KitResponse findTrackingKitById(Long kitId, Long tenantId) {
        Kit kit = kitRepository.findById(kitId)
                .orElseThrow(() -> new RuntimeException("Kit no encontrado"));
        if (kit.getTenant() == null || !kit.getTenant().getId().equals(tenantId)) {
            throw new RuntimeException("Kit no pertenece al arrendatario especificado");
        }
        return new KitResponse(kit);
    }

    public void confirmKitStatus(Long id) {
        Long tenantId = authService.getAuthenticatedUserId();
        Kit kit = kitRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Kit no encontrado"));

        if (kit.getTenant() == null || !kit.getTenant().getId().equals(tenantId)) {
            throw new RuntimeException("Kit does not belong to the specified tenant");
        }

        if (kit.getStatus() != KitStatus.PAID) {
            throw new RuntimeException("El kit solo puede ser confirmado si su estado es PAGADO");
        }
        kit.setStatus(KitStatus.ACTIVE);
        kitRepository.save(kit);
    }

    private List<ItemMemento> itemSelectionToSnapshots(List<KitCreateRequest.ItemSelectionRequest> itemSelections,
            DeliveryMethod selectedMethod,
            Double shippingFee,
            String pickupAddress) {
        return itemSelections.stream()
                .map(sel -> {
                    Item item = itemRepository.findById(sel.itemId())
                            .orElseThrow(() -> new RuntimeException("Art no encontrado: " + sel.itemId()));

                    if (item.getTotalUnits() != null && sel.quantity() > item.getTotalUnits()) {
                        throw new RuntimeException("La cantidad seleccionada excede las unidades disponibles");
                    }

                    ItemMemento snapshot = item.createSnapshot(
                            sel.quantity(),
                            selectedMethod,
                            shippingFee,
                            pickupAddress);
                    snapshot.setPriceAtRental(sel.pricePerMonth());
                    return snapshot;
                })
                .collect(Collectors.toList());
    }

    public KitResponse markAsPaid(Long id) {
        Kit kit = kitRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Kit no encontrado"));

        if (kit.getStatus() != KitStatus.DRAFT) {
            throw new RuntimeException("Solo los kits en estado DRAFT pueden ser pagados");
        }

        if (kit.getSnapshots() != null) {
            for (ItemMemento snapshot : kit.getSnapshots()) {
                validateItemAvailability(snapshot.getOriginalItemId(), snapshot.getSelectedUnits(), kit.getStartDate(), kit.getEndDate());
            }
        }

        kit.setStatus(KitStatus.PAID);
        Kit saved = kitRepository.save(kit);

        kitDeliveryService.ensureDeliveryExists(saved);

        notificationService.notifyLandlordsOnKitActive(saved); 

        return new KitResponse(saved);
    }

    public KitResponse cancel(Long id) {
        Kit kit = kitRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Kit not found"));

        if (kit.getStatus() == KitStatus.ACTIVE || kit.getStatus() == KitStatus.FINISHED) {
            throw new RuntimeException("No se puede cancelar kits ACTIVE o FINISHED");
        }

        kit.setStatus(KitStatus.CANCELLED);
        Kit saved = kitRepository.save(kit);
        return new KitResponse(saved);
    }

    @Transactional
    public KitResponse addItemToKit(Long kitId, Long itemId, Long userId) {
        // 1. Verificamos que el usuario existe
        userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        // 2. Obtenemos el Kit y el Item
        Kit kit = kitRepository.findById(kitId)
                .orElseThrow(() -> new RuntimeException("Kit no encontrado"));

        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Artículo no encontrado"));

        // Aseguramos que la lista de snapshots esté inicializada
        List<ItemMemento> snapshots = kit.getSnapshots();
        if (snapshots == null) {
            snapshots = new ArrayList<>();
            kit.setSnapshots(snapshots);
        }

        // 3. Evitamos duplicados usando getOriginalItemId()
        boolean alreadyExists = snapshots.stream()
                .anyMatch(snapshot -> snapshot.getOriginalItemId() != null &&
                        snapshot.getOriginalItemId().equals(itemId));

        if (alreadyExists) {
            throw new RuntimeException("Este artículo ya está en el kit");
        }

        // Como al añadir un artículo desde cero se mete 1 unidad por defecto
        validateItemAvailability(itemId, 1, kit.getStartDate(), kit.getEndDate());

        // 4. Creamos el Snapshot para el nuevo objeto
        ItemMemento newSnapshot = item.createSnapshot(
                1,
                kit.getDeliveryMethod(),
                kit.getCourierPrice(),
                kit.getMeetingPoint());
        newSnapshot.setPriceAtRental(item.getPricePerMonth());

        // ¡IMPORTANTE! Relación bidireccional: asignamos el kit al memento
        newSnapshot.setKit(kit);

        // 5. Añadimos a la lista y guardamos el kit
        snapshots.add(newSnapshot);

        Kit savedKit = kitRepository.save(kit);
        return new KitResponse(savedKit);
    }

    @Transactional
    public KitResponse removeItemFromKit(Long kitId, Long itemId, Long userId) {
        // 1. Verificamos que el usuario existe
        userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        // 2. Obtenemos el Kit
        Kit kit = kitRepository.findById(kitId)
                .orElseThrow(() -> new RuntimeException("Kit no encontrado"));

        List<ItemMemento> snapshots = kit.getSnapshots();
        if (snapshots == null || snapshots.isEmpty()) {
            throw new RuntimeException("Kit actualmente sin artículos para eliminar");
        }

        // 3. Buscamos el snapshot por su originalItemId
        ItemMemento snapshotToRemove = snapshots.stream()
                .filter(s -> s.getOriginalItemId() != null && s.getOriginalItemId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Este artículo no es parte de este kit"));

        // 4. Regla de negocio: El kit no puede quedar vacío
        if (snapshots.size() <= 1) {
            throw new RuntimeException("Un kit no puede quedar vacío. Debe contener al menos un artículo.");
        }

        // 5. Eliminamos la relación y guardamos
        snapshots.remove(snapshotToRemove);

        // Desvinculamos el kit del memento por buenas prácticas con JPA
        snapshotToRemove.setKit(null);

        Kit savedKit = kitRepository.save(kit);
        return new KitResponse(savedKit);
    }




    private void validateItemAvailability(Long itemId, int requestedQuantity, LocalDate startDate, LocalDate endDate) {
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Artículo no encontrado: " + itemId));

        // 1. Si de base piden más de lo que existe, cortamos directamente
        if (requestedQuantity > item.getTotalUnits()) {
             throw new RuntimeException("El artículo '" + item.getTitle() + "' solo tiene " + item.getTotalUnits() + " unidades en total.");
        }

        List<KitStatus> unavailableStatuses = Arrays.asList(KitStatus.PAID, KitStatus.ACTIVE);
        List<Kit> overlappingKits = kitRepository.findOverlappingKitsForItem(itemId, startDate, endDate, unavailableStatuses);

        if (overlappingKits.isEmpty()) return; // Vía libre

        // 2. Comprobamos día por día para calcular la concurrencia exacta
        for (LocalDate date = startDate; !date.isAfter(endDate); date = date.plusDays(1)) {
            int rentedUnitsOnDate = 0;

            for (Kit kit : overlappingKits) {
                // Si este kit concreto solapa con el día actual del bucle
                if (!date.isBefore(kit.getStartDate()) && !date.isAfter(kit.getEndDate())) {
                    // Buscamos cuántas unidades de nuestro artículo tiene alquiladas
                    for (ItemMemento snapshot : kit.getSnapshots()) {
                        if (snapshot.getOriginalItemId().equals(itemId)) {
                            rentedUnitsOnDate += snapshot.getSelectedUnits();
                        }
                    }
                }
            }

            // 3. Verificamos el stock para este día
            if (rentedUnitsOnDate + requestedQuantity > item.getTotalUnits()) {
                throw new RuntimeException("El artículo '" + item.getTitle() + "' no tiene suficientes unidades disponibles para las fechas seleccionadas.");
            }
        }
    }
    
    @Autowired
    @Lazy 
    private ArticleService articleService;
    @Scheduled(cron = "0 5 0 * * ?") 
    @Transactional
    public void processExpiredKitsAutomatically() {
        LocalDate gracePeriodDeadline = LocalDate.now().minusDays(7);

        List<Kit> expiredKits = kitRepository.findByStatusAndEndDateLessThanEqual(KitStatus.ACTIVE, gracePeriodDeadline);
        
        if (expiredKits.isEmpty()) {
            return;
        }

        System.out.println("Encontrados " + expiredKits.size() + " kits que superaron los 7 días de gracia.");

        for (Kit kit : expiredKits) {
            try {
                articleService.autoCloseExpiredKitItems(kit);
            } catch (Exception e) {
                System.err.println("Fallo al auto-cerrar el kit " + kit.getId() + ": " + e.getMessage());
            }
        }
    }
}
