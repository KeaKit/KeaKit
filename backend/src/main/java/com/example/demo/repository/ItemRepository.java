package com.example.demo.repository;

import com.example.demo.model.Item;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;


@Repository
public interface ItemRepository extends JpaRepository<Item, Long>, JpaSpecificationExecutor<Item> {
    boolean existsByCategoryId(Long categoryId);

    List<Item> findByOwnerId(Long ownerId);

    @Modifying
    @Transactional
    @Query("DELETE FROM Item i WHERE i.owner.id = :ownerId")
    void deleteByOwnerId(@Param("ownerId") Long ownerId);
}
