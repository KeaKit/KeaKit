package com.example.demo.dto;

import com.example.demo.model.Item;
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

    public RentedItemResponse(Item item, Kit kit) {
        this.itemId = item.getId();
        this.itemTitle = item.getTitle();
        this.ownerName = item.getOwner() != null ? item.getOwner().getName() : null;
        this.ownerId = item.getOwner() != null ? item.getOwner().getId() : null;
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
