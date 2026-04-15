package com.example.demo.dto;

public class DemandAnalysisDTO {

    private Long itemId;
    private String title;
    private String categoryName;
    private String imageUrl;
    private Long totalTimesRented;
    private Long totalUnitsRented;

    public DemandAnalysisDTO() {}

    public DemandAnalysisDTO(Long itemId, String title, String categoryName,
                             String imageUrl, Long totalTimesRented, Long totalUnitsRented) {
        this.itemId = itemId;
        this.title = title;
        this.categoryName = categoryName;
        this.imageUrl = imageUrl;
        this.totalTimesRented = totalTimesRented;
        this.totalUnitsRented = totalUnitsRented;
    }

    public Long getItemId() {
        return itemId;
    }

    public void setItemId(Long itemId) {
        this.itemId = itemId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public Long getTotalTimesRented() {
        return totalTimesRented;
    }

    public void setTotalTimesRented(Long totalTimesRented) {
        this.totalTimesRented = totalTimesRented;
    }

    public Long getTotalUnitsRented() {
        return totalUnitsRented;
    }

    public void setTotalUnitsRented(Long totalUnitsRented) {
        this.totalUnitsRented = totalUnitsRented;
    }
}
