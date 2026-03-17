package com.example.demo.repository;

import com.example.demo.model.PlatformConfig;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PlatformConfigRepository extends JpaRepository<PlatformConfig, Long> {
}