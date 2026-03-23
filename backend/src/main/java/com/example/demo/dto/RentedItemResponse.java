package com.example.demo.dto;

import com.example.demo.model.ItemMemento;
import com.example.demo.model.Kit;

import java.time.LocalDate;

public class RentedItemResponse {
    private Long itemId;
    private String itemTitle;
    private String ownerName;
    private Long ownerId;
    private Long kitId;
    private String kitName;
    private LocalDate startDate;
    private LocalDate endDate;

    public RentedItemResponse(ItemMemento snapshot, Kit kit) {
        this.itemId = snapshot.getOriginalItemId();
        this.itemTitle = snapshot.getNameAtRental();
        this.ownerName = snapshot.getOwnerAtRental() != null ? snapshot.getOwnerAtRental().getName() : null;
        this.ownerId = snapshot.getOwnerAtRental() != null ? snapshot.getOwnerAtRental().getId() : null;
        this.kitId = kit.getId();
        this.kitName = kit.getName();
        this.startDate = kit.getStartDate();
        this.endDate = kit.getEndDate();
    }

    public Long getItemId() { return itemId; }
    public String getItemTitle() { return itemTitle; }
    public String getOwnerName() { return ownerName; }
    public Long getOwnerId() { return ownerId; }
    public Long getKitId() { return kitId; }
    public String getKitName() { return kitName; }
    public LocalDate getStartDate() { return startDate; }
    public LocalDate getEndDate() { return endDate; }
}
