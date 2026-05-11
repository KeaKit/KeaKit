package com.example.demo.dto;

import java.util.List;

public class TransactionDetailsDTO {
    private Long kitId;
    private String kitName;
    private List<ItemPaymentDetailDTO> items;
    private Double subtotal;
    private Double guarantee;
    private Double platformFee;
    private Double courierFee;
    private Double discount;
    private Double total;
    private String description;

    // Getters y Setters
    public Long getKitId() { return kitId; }
    public void setKitId(Long kitId) { this.kitId = kitId; }

    public String getKitName() { return kitName; }
    public void setKitName(String kitName) { this.kitName = kitName; }

    public List<ItemPaymentDetailDTO> getItems() { return items; }
    public void setItems(List<ItemPaymentDetailDTO> items) { this.items = items; }

    public Double getSubtotal() { return subtotal; }
    public void setSubtotal(Double subtotal) { this.subtotal = subtotal; }

    public Double getGuarantee() { return guarantee; }
    public void setGuarantee(Double guarantee) { this.guarantee = guarantee; }

    public Double getPlatformFee() { return platformFee; }
    public void setPlatformFee(Double platformFee) { this.platformFee = platformFee; }

    public Double getCourierFee() { return courierFee; }
    public void setCourierFee(Double courierFee) { this.courierFee = courierFee; }

    public Double getDiscount() { return discount; }
    public void setDiscount(Double discount) { this.discount = discount; }

    public Double getTotal() { return total; }
    public void setTotal(Double total) { this.total = total; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}