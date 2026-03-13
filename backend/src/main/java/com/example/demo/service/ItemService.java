package com.example.demo.service;

import com.example.demo.model.Item;
import com.example.demo.repository.ItemRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ItemService {

    private final ItemRepository itemRepository;

    public ItemService(ItemRepository itemRepository) {
        this.itemRepository = itemRepository;
    }

    public List<Item> findAll() {
        return itemRepository.findAll();
    }

    public List<Item> findItemsForRent(Long ownerId) {
        List<Item> allItemsForRent = itemRepository.findAll()
            .stream().filter(x-> x.getOwner().getId() != ownerId).toList();
        return allItemsForRent;
    }

    public Item findById(Long id) {
        return itemRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Item not found"));
    }

    public Item save(Item item) {
        return itemRepository.save(item);
    }

    public Item update(Long id, Item updateData) {
        Item item = itemRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Item not found"));

        if (updateData.getTitle() != null) item.setTitle(updateData.getTitle());
        if (updateData.getDescription() != null) item.setDescription(updateData.getDescription());
        if (updateData.getCity() != null) item.setCity(updateData.getCity());
        if (updateData.getPricePerMonth() != null) item.setPricePerMonth(updateData.getPricePerMonth());
        if (updateData.getAvailableFrom() != null) item.setAvailableFrom(updateData.getAvailableFrom());
        if (updateData.getAvailableUntil() != null) item.setAvailableUntil(updateData.getAvailableUntil());
        if (updateData.getCategory() != null) item.setCategory(updateData.getCategory());
        if (updateData.getTotalUnits() != null) {
            if (updateData.getTotalUnits() < 1) {
                throw new RuntimeException("totalUnits must be >= 1");
            }
            item.setTotalUnits(updateData.getTotalUnits());
        }
        if (updateData.getOwner() != null) item.setOwner(updateData.getOwner());

        return itemRepository.save(item);
    }

    public void deleteById(Long id) {
        if (!itemRepository.existsById(id)) {
            throw new RuntimeException("Item not found");
        }
        itemRepository.deleteById(id);
    }
}
