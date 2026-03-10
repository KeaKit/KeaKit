package com.example.demo.repository;

import com.example.demo.model.Kit;
import com.example.demo.model.KitStatus;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface KitRepository extends JpaRepository<Kit, Long> {
    List<Kit> findByTenantId(Long tenantId);
    List<Kit> findByTenantIdAndEndDateGreaterThanEqual(Long tenantId, LocalDate date);

    // Busca un Kit que contenga el artículo y que esté actualmente en curso
    @Query("SELECT k FROM Kit k JOIN k.snapshots s WHERE s.originalItemId = :itemId AND k.status = :status")
    Optional<Kit> findActiveKitByItemId(@Param("itemId") Long itemId, @Param("status") KitStatus status);

}

