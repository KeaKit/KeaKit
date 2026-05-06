package com.example.demo.service;

import com.example.demo.model.Kit;

import java.time.LocalDate;
import java.util.List;

/**
 * Shared utility for calculating how many units of an item are rented
 * during a date range, based on overlapping active/paid kits.
 */
public final class KitAvailabilityHelper {

    private KitAvailabilityHelper() {}

    /**
     * Returns the maximum number of units of {@code itemId} rented on any
     * single day within [{@code startDate}, {@code endDate}].
     */
    public static int computeMaxRented(
            Long itemId,
            List<Kit> overlappingKits,
            LocalDate startDate,
            LocalDate endDate) {

        int maxRented = 0;
        for (LocalDate date = startDate; !date.isAfter(endDate); date = date.plusDays(1)) {
            int rentedToday = 0;
            for (Kit kit : overlappingKits) {
                if (!date.isBefore(kit.getStartDate()) && !date.isAfter(kit.getEndDate())) {
                    rentedToday += kit.getSnapshots().stream()
                            .filter(snap -> snap.getOriginalItemId().equals(itemId))
                            .mapToInt(snap -> snap.getSelectedUnits())
                            .sum();
                }
            }
            if (rentedToday > maxRented) {
                maxRented = rentedToday;
            }
        }
        return maxRented;
    }
}
