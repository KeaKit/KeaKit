package com.example.demo.service;

import com.example.demo.dto.KitCreateRequest;
import com.example.demo.dto.KitResponse;
import com.example.demo.model.DeliveryMethod;
import com.example.demo.model.Item;
import com.example.demo.model.Kit;
import com.example.demo.model.KitStatus;
import com.example.demo.model.User;
import com.example.demo.repository.KitRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.repository.ItemRepository;

import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class KitService {

    private static final double PLATFORM_COURIER_PRICE = 9.99;

    private final KitRepository kitRepository;
    private final UserRepository userRepository;
    private final ItemRepository itemRepository;

    public KitService(KitRepository kitRepository, UserRepository userRepository, ItemRepository itemRepository) {
        this.kitRepository = kitRepository;
        this.userRepository = userRepository;
        this.itemRepository = itemRepository;
    }

    public List<Kit> findAll() {
        return kitRepository.findAll();
    }

    public KitResponse findById(Long id) {
        Kit kit = kitRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Kit not found"));
        return new KitResponse(kit);
    }

    public KitResponse create(KitCreateRequest request) {
        Kit kit = new Kit();
        kit.setName(request.getName());
        kit.setCountry(request.getCountry());
        kit.setCity(request.getCity());
        kit.setStartDate(request.getStartDate());
        kit.setEndDate(request.getEndDate());
        kit.setStatus(request.getStatus() != null ? request.getStatus() : KitStatus.UPCOMING);

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

        if (request.getItemIds() != null && !request.getItemIds().isEmpty()) {
            List<Item> items = itemRepository.findAllById(request.getItemIds());
            
            kit.setItems(items);
        }

        validateDates(kit.getStartDate(), kit.getEndDate());

        Kit savedKit = kitRepository.save(kit);
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
        if (updateData.getItems() != null) kit.setItems(updateData.getItems());

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

}

