package com.example.demo.repository;

import com.example.demo.model.Kit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


@Repository
public interface KitRepository extends JpaRepository<Kit, Long> {
}