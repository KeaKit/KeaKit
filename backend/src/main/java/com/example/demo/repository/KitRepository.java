package com.example.demo.repository;

import com.example.demo.model.Kit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface KitRepository extends JpaRepository<Kit, Long> {
    List<Kit> findByTenantId(Long tenantId);
    List<Kit> findByTenantIdAndEndDateGreaterThanEqual(Long tenantId, LocalDate date);
}