package com.example.demo.repository;

import com.example.demo.model.DefaultKitItem;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DefaultKitItemRepository extends JpaRepository<DefaultKitItem, Long> {
    List<DefaultKitItem> findByItemId(Long itemId);
    void deleteByItemId(Long itemId);
}