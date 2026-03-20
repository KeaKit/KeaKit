package com.example.demo.repository;

import com.example.demo.model.DefaultKit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DefaultKitRepository extends JpaRepository<DefaultKit, Long> {
}