package com.example.demo.config;

import com.example.demo.model.*; // Ajusta a tus modelos
import com.example.demo.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Configuration
public class DatabaseSeeder {

    @Bean
    CommandLineRunner initDatabase(
            UserRepository userRepo,
            CategoryRepository catRepo,
            ItemRepository itemRepo,
            ArticleRepository articleRepo,
            ServiceRepository serviceRepo,
            KitRepository kitRepo,
            RatingRepository ratingRepo) {
        return args -> {
            
            // 1. Usuarios
            User owner = new User();
            owner.setName("Carlos Owner");
            owner.setEmail("owner@example.com");
            owner.setPassword("{noop}password123");
            owner.setRole(UserRole.USER);
            owner.setCountry("España");
            owner.setCity("Sevilla");
            owner.setAddress("Calle 123 matame otra vez");
            owner.setPhone("123456789");
            userRepo.save(owner);

            User tenant = new User();
            tenant.setName("Lucía Renter");
            tenant.setEmail("tenant@example.com");
            tenant.setPassword("{noop}password123");
            tenant.setRole(UserRole.USER);
            tenant.setCountry("España");
            tenant.setCity("Sevilla");
            tenant.setAddress("Calle 123 matame otra vez");
            tenant.setPhone("223456789");
            userRepo.save(tenant);

            // 2. Categorías
            Category catTech = new Category();
            catTech.setName("Tecnología");
            catTech.setDescription("Dispositivos y servicios técnicos");
            catTech.setMinPrice(10.0);
            catTech.setMaxPrice(2000.0);
            catTech.setStatus(CategoryStatus.ACTIVE);
            catRepo.save(catTech);

            // 3. Artículo (Herencia de Item)
            // Según tus logs: id de article referencia a id de item
            Article laptop = new Article();
            laptop.setTitle("MacBook Pro");
            laptop.setDescription("16 pulgadas, M2");
            laptop.setCategory(catTech);
            laptop.setOwner(owner);
            laptop.setPricePerMonth(150.0);
            laptop.setTotalUnits(1);
            laptop.setStatus(ArticleStatus.AVAILABLE);
            laptop.setPurchaseDate(LocalDate.now().minusMonths(6));
            // Al guardar el ArticleRepository, JPA gestiona la tabla 'items' y 'articles'
            articleRepo.save(laptop);

            // 4. Servicio (Herencia de Item)
            Service setupService = new Service();
            setupService.setTitle("Instalación Software");
            setupService.setDescription("Configuración inicial a domicilio");
            setupService.setCategory(catTech);
            setupService.setOwner(owner);
            setupService.setPricePerMonth(50.0);
            setupService.setTotalUnits(10);
            serviceRepo.save(setupService);

            // 5. Kit (El Alquiler)
            Kit myKit = new Kit();
            myKit.setName("Pack Trabajo Remoto");
            myKit.setTenant(tenant);
            myKit.setStatus(KitStatus.ACTIVE);
            myKit.setDeliveryMethod(DeliveryMethod.COURIER);
            myKit.setStartDate(LocalDate.now());
            myKit.setEndDate(LocalDate.now().plusMonths(1));
            kitRepo.save(myKit);

            // Nota: Para kit_items, si no tienes un KitItemRepository inyectado, 
            // asegúrate de tener CascadeType.ALL en la relación dentro de Kit.

            // 6. Rating
            Rating feedback = new Rating();
            feedback.setKit(myKit);
            feedback.setReviewer(tenant);
            feedback.setReviewee(owner);
            feedback.setScore(5);
            feedback.setComment("Increíble estado del equipo.");
            feedback.setType(RatingType.RENTER_TO_OWNER);
            feedback.setCreatedAt(LocalDateTime.now());
            ratingRepo.save(feedback);

            System.out.println("✅ Seeder finalizado: Datos cargados en los 7 repositorios.");
        };
    }
}