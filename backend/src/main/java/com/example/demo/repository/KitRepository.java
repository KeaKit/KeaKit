package com.example.demo.repository;

import com.example.demo.model.Kit;
import com.example.demo.model.KitStatus;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface KitRepository extends JpaRepository<Kit, Long> {
    List<Kit> findByTenantId(Long tenantId);
    Page<Kit> findByTenantId(Long tenantId, Pageable pageable);
    Page<Kit> findByTenantIdAndStatusNot(Long tenantId, KitStatus status, Pageable pageable);
    List<Kit> findByTenantIdAndEndDateGreaterThanEqual(Long tenantId, LocalDate date);

    // Busca un Kit que contenga el artículo y que esté actualmente en curso
    @Query("SELECT k FROM Kit k JOIN k.snapshots s WHERE s.originalItemId = :itemId AND k.status = :status")
    Optional<Kit> findActiveKitByItemId(@Param("itemId") Long itemId, @Param("status") KitStatus status);

    List<Kit> findByStatusAndEndDate(KitStatus status, LocalDate endDate);


    // Para eliminar usuarios desde admin sin borrar los items de los kits ya alquilados
    
    @Query("SELECT CASE WHEN COUNT(k) > 0 THEN true ELSE false END " +
           "FROM Kit k JOIN k.snapshots s " +
           "WHERE s.originalItemId = :itemId " +
           "AND k.status NOT IN (:excludedStatuses)")
    boolean existsByItemIdAndStatusNotIn(@Param("itemId") Long itemId, 
                                          @Param("excludedStatuses") List<KitStatus> excludedStatuses);
    
    @Modifying
    @Transactional
    @Query("UPDATE Kit k SET k.tenant = null WHERE k.tenant.id = :userId " +
           "AND k.status IN ('FINISHED', 'CANCELLED')")
    void updateTenantToNullForFinishedKits(@Param("userId") Long userId);
    
    List<Kit> findByTenantIdAndStatus(Long tenantId, KitStatus status);


   // Devuelve los kits pagados/activos que se cruzan con estas fechas
    @Query("SELECT DISTINCT k FROM Kit k JOIN k.snapshots s " +
           "WHERE s.originalItemId = :itemId " +
           "AND k.status IN (:statuses) " +
           "AND k.startDate <= :endDate " +
           "AND k.endDate >= :startDate")
    List<Kit> findOverlappingKitsForItem(@Param("itemId") Long itemId,
                                         @Param("startDate") LocalDate startDate,
                                         @Param("endDate") LocalDate endDate,
                                         @Param("statuses") List<KitStatus> statuses);

    @Query("SELECT COALESCE(SUM(m.selectedUnits), 0) " +
           "FROM Kit k JOIN k.snapshots m " +
           "WHERE m.originalItemId = :serviceId " +
           "AND k.status IN (com.example.demo.model.KitStatus.PAID, com.example.demo.model.KitStatus.ACTIVE) " +
           "AND k.endDate >= :currentDate") 
    int countActiveAndFutureRentedUnits(@Param("serviceId") Long serviceId, @Param("currentDate") LocalDate currentDate);

    @Query("SELECT DISTINCT k FROM Kit k JOIN k.snapshots s " +
            "WHERE (k.status = PAID " +
            "OR k.status = ACTIVE) " +
            "AND k.deliveryMethod = COURIER " +
            "AND k.tenant.id = :tenantId")
    List<Kit> findTrackingUpdateableByTenantId(@Param("tenantId") Long tenantId);
}

