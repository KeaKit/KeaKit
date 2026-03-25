package com.example.demo.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.model.KitItem;

@Repository
public interface KitItemRepository extends JpaRepository<KitItem, Long> {
    
    @Query("SELECT ki FROM KitItem ki WHERE ki.item.id = :itemId")
    List<KitItem> findByItemId(Long itemId);

    @Modifying
    @Transactional
    @Query("DELETE FROM KitItem ki WHERE ki.item.id = :itemId")
    void deleteByItemId(@Param("itemId") Long itemId);
}
