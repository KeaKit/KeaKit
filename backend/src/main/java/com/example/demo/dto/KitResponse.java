package com.example.demo.dto;

import com.example.demo.model.DeliveryMethod;
import com.example.demo.model.ItemMemento;
import com.example.demo.model.Kit;
import com.example.demo.model.KitStatus;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public class KitResponse {
    private static final int DELIVERY_LEAD_DAYS = 7;

    public static class KitItemResponse {
        private Long itemId;
        private Long ownerId;
        private Integer quantity;
        private Double pricePerMonth;
        private String name;
        private String category;
        private String imageUrl;
        private String ownerName;

        public KitItemResponse(
            Long itemId,
            Long ownerId,
            Integer quantity,
            Double pricePerMonth,
            String name,
            String category,
            String imageUrl,
            String ownerName
        ) {
            this.itemId = itemId;
            this.ownerId = ownerId;
            this.quantity = quantity;
            this.pricePerMonth = pricePerMonth;
            this.name = name;
            this.category = category;
            this.imageUrl = imageUrl;
            this.ownerId = ownerId;
            this.ownerName = ownerName;
        }

        public Long getItemId() {
            return itemId;
        }

        public Long getOwnerId() {
            return ownerId;
        }

        public Integer getQuantity() {
            return quantity;
        }

        public Double getPricePerMonth() {
            return pricePerMonth;
        }

        public String getName() {
            return name;
        }

        public String getCategory() {
            return category;
        }

        public String getImageUrl() {
            return imageUrl;
        }

        public String getOwnerName() {
            return ownerName;
        }
    }

    private Long id;
    private String name;
    private String country;
    private String city;
    private LocalDate orderDate;
    private LocalDate startDate;
    private LocalDate endDate;
    private LocalDate estimatedDeliveryDate;
    private String deliveryNotification;
    private KitStatus status;
    private DeliveryMethod deliveryMethod;
    private String meetingPoint;
    private Double courierPrice;
    private Long tenantId;
    private String tenantName;
    private String tenantEmail;
    private List<Long> itemIds;
    private List<KitItemResponse> items;
    private Integer totalSelectedItems;
    private Double subtotalPrice;
    private Double guaranteePrice;
    private Double platformFee;
    private Double totalPrice;
    private Double appliedCommissionRate;
    private Double appliedGuaranteeRate;
    private Double appliedDiscount;

    public KitResponse(Kit kit) {
        this.id = kit.getId();
        this.name = kit.getName();
        this.country = kit.getCountry();
        this.city = kit.getCity();
        this.orderDate = kit.getOrderDate();
        this.startDate = kit.getStartDate();
        this.endDate = kit.getEndDate();
        this.deliveryMethod = kit.getDeliveryMethod();
        this.estimatedDeliveryDate = calculateEstimatedDeliveryDate(this.orderDate, this.startDate);
        this.deliveryNotification = buildDeliveryNotification(this.estimatedDeliveryDate, this.deliveryMethod);
        this.status = kit.getStatus();
        this.meetingPoint = kit.getMeetingPoint();
        this.courierPrice = kit.getCourierPrice();
        this.tenantId = kit.getTenant() != null ? kit.getTenant().getId() : null;
        this.tenantName = kit.getTenant() != null ? kit.getTenant().getName() : null;
        this.tenantEmail = kit.getTenant() != null ? kit.getTenant().getEmail() : null;

        List<ItemMemento> snapshots = kit.getSnapshots() != null ? kit.getSnapshots() : List.of();

        this.items = snapshots.stream()
            .map(s -> new KitItemResponse(
                s.getOriginalItemId(),
                s.getOwnerAtRental() != null ? s.getOwnerAtRental().getId() : null,
                s.getSelectedUnits(),
                s.getPriceAtRental(),
                s.getNameAtRental(),
                s.getCategoryAtRental() != null ? s.getCategoryAtRental().getName() : null,
                s.getImageUrlAtRental(),
                s.getOwnerAtRental() != null ? s.getOwnerAtRental().getName() : null
            ))
            .collect(Collectors.toList());

        this.totalSelectedItems = this.items.stream()
            .map(selection -> selection.getQuantity() != null ? selection.getQuantity() : 0)
            .reduce(0, Integer::sum);

        this.itemIds = this.items.stream()
            .map(KitItemResponse::getItemId)
            .distinct()
            .collect(Collectors.toCollection(ArrayList::new));

        double rentalMonths = calculateMonthsBetween(kit.getStartDate(), kit.getEndDate());
        double subtotal = snapshots.stream()
            .filter(s -> s.getPriceAtRental() != null && s.getSelectedUnits() != null)
            .mapToDouble(s -> s.getPriceAtRental() * s.getSelectedUnits() * rentalMonths)
            .sum();
        double guaranteeRate = kit.getAppliedGuaranteeRate() != null ? kit.getAppliedGuaranteeRate() : 0.0;
        double commissionRate = kit.getAppliedCommissionRate() != null ? kit.getAppliedCommissionRate() : 0.0;
        double courier = kit.getCourierPrice() != null ? kit.getCourierPrice() : 0.0;

        this.subtotalPrice = roundMoney(subtotal);
        this.guaranteePrice = roundMoney(subtotal * guaranteeRate);
        this.platformFee = roundMoney(subtotal * commissionRate);
        this.totalPrice = roundMoney(this.subtotalPrice + this.guaranteePrice + courier);
        this.appliedCommissionRate = kit.getAppliedCommissionRate();
        this.appliedGuaranteeRate = kit.getAppliedGuaranteeRate();
        this.appliedDiscount = kit.getAppliedDiscount();
    }

    private static double calculateMonthsBetween(LocalDate start, LocalDate end) {
        if (start == null || end == null) {
            return 0.0;
        }

        long diffDays = ChronoUnit.DAYS.between(start, end) + 1;
        return diffDays / 30.0;
    }

    private static double roundMoney(double amount) {
        return Math.round(amount * 100.0) / 100.0;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getCountry() {
        return country;
    }

    public String getCity() {
        return city;
    }

    public LocalDate getOrderDate() {
        return orderDate;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public LocalDate getEstimatedDeliveryDate() {
        return estimatedDeliveryDate;
    }

    public String getDeliveryNotification() {
        return deliveryNotification;
    }

    public KitStatus getStatus() {
        return status;
    }

    public DeliveryMethod getDeliveryMethod() {
        return deliveryMethod;
    }

    public String getMeetingPoint() {
        return meetingPoint;
    }

    public Double getCourierPrice() {
        return courierPrice;
    }

    public List<Long> getItemIds() {
        return itemIds;
    }

    public List<KitItemResponse> getItems() {
        return items;
    }

    public Integer getTotalSelectedItems() {
        return totalSelectedItems;
    }

    public Long getTenantId() {
        return tenantId;
    }

    public String getTenantName() {
        return tenantName;
    }

    public String getTenantEmail() {
        return tenantEmail;
    }

    public Double getSubtotalPrice() {
        return subtotalPrice;
    }

    public Double getGuaranteePrice() {
        return guaranteePrice;
    }

    public Double getPlatformFee() {
        return platformFee;
    }

    public Double getTotalPrice() {
        return totalPrice;
    }

    public Double getAppliedCommissionRate() {
        return appliedCommissionRate;
    }

    public Double getAppliedGuaranteeRate() {
        return appliedGuaranteeRate;
    }

    public Double getAppliedDiscount() {
        return appliedDiscount;
    }

    private LocalDate calculateEstimatedDeliveryDate(LocalDate orderDate, LocalDate startDate) {
        if (startDate == null) {
            return null;
        }
        if (orderDate == null) {
            return startDate.minusDays(1);
        }

        LocalDate preferredDeliveryDate = startDate.minusDays(1);
        LocalDate minimumLeadDeliveryDate = orderDate.plusDays(DELIVERY_LEAD_DAYS - 1L);

        if (minimumLeadDeliveryDate.isAfter(preferredDeliveryDate)) {
            return minimumLeadDeliveryDate;
        }
        return preferredDeliveryDate;
    }

    private String buildDeliveryNotification(LocalDate estimatedDeliveryDate, DeliveryMethod deliveryMethod) {
        if (estimatedDeliveryDate == null) {
            return null;
        }

        LocalDate today = LocalDate.now();
        String prefix = deliveryMethod == DeliveryMethod.COURIER
            ? "Tu pedido"
            : "Tu kit";

        if (today.isEqual(estimatedDeliveryDate.minusDays(1))) {
            return prefix + " llegará mañana";
        }
        if (today.isEqual(estimatedDeliveryDate)) {
            return prefix + " llega hoy";
        }
        if (today.isAfter(estimatedDeliveryDate)) {
            return prefix + " tenía entrega prevista para el " + estimatedDeliveryDate;
        }
        return prefix + " llegará el " + estimatedDeliveryDate;
    }
}
