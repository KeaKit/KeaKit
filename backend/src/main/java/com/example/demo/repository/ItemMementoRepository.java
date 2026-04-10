package com.example.demo.repository;

import com.example.demo.model.ItemMemento;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ItemMementoRepository extends JpaRepository<ItemMemento, Long> {

    @Query("SELECT s.originalItemId, s.nameAtRental, c.name, s.imageUrlAtRental, " +
           "COUNT(s), SUM(s.selectedUnits) " +
           "FROM ItemMemento s " +
           "JOIN s.kit k " +
           "LEFT JOIN s.categoryAtRental c " +
           "WHERE k.status IN (com.example.demo.model.KitStatus.PAID, " +
           "com.example.demo.model.KitStatus.ACTIVE, " +
           "com.example.demo.model.KitStatus.FINISHED) " +
           "GROUP BY s.originalItemId, s.nameAtRental, c.name, s.imageUrlAtRental " +
           "ORDER BY COUNT(s) DESC, SUM(s.selectedUnits) DESC")
    List<Object[]> findTopDemandedItems(Pageable pageable);

    @Query("SELECT s.originalItemId, s.nameAtRental, c.name, s.imageUrlAtRental, " +
           "COUNT(s), SUM(s.selectedUnits) " +
           "FROM ItemMemento s " +
           "JOIN s.kit k " +
           "LEFT JOIN s.categoryAtRental c " +
           "WHERE k.status IN (com.example.demo.model.KitStatus.PAID, " +
           "com.example.demo.model.KitStatus.ACTIVE, " +
           "com.example.demo.model.KitStatus.FINISHED) " +
           "AND c.name = :categoryName " +
           "GROUP BY s.originalItemId, s.nameAtRental, c.name, s.imageUrlAtRental " +
           "ORDER BY COUNT(s) DESC, SUM(s.selectedUnits) DESC")
    List<Object[]> findTopDemandedItemsByCategory(@Param("categoryName") String categoryName, Pageable pageable);
}
