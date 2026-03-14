package com.example.demo.config;

import com.example.demo.model.*; 
import com.example.demo.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Configuration
public class DatabaseSeeder {

    @Bean
    CommandLineRunner initDatabase(
            UserRepository userRepo,
            WalletRepository walletRepo,
            TransactionRepository transactionRepo,
            CategoryRepository catRepo,
            ItemRepository itemRepo,
            ArticleRepository articleRepo,
            ServiceRepository serviceRepo,
            KitRepository kitRepo,
            RatingRepository ratingRepo,
            PasswordEncoder passwordEncoder) {
        return args -> {
            
            // 1. Usuarios
            User owner = new User();
            owner.setName("Carlos Owner");
            owner.setEmail("owner@example.com");
            owner.setPassword(passwordEncoder.encode("password123"));
            owner.setRole(UserRole.USER);
            owner.setCountry("España");
            owner.setCity("Sevilla");
            owner.setAddress("Calle 123 matame otra vez");
            owner.setPhone("123456789");
            userRepo.save(owner);

            User tenant = new User();
            tenant.setName("Lucía Renter");
            tenant.setEmail("tenant@example.com");
            tenant.setPassword(passwordEncoder.encode("password123"));
            tenant.setRole(UserRole.USER);
            tenant.setCountry("España");
            tenant.setCity("Sevilla");
            tenant.setAddress("Calle 123 matame otra vez");
            tenant.setPhone("223456789");
            userRepo.save(tenant);

            // 2. Wallets
            Wallet ownerWallet = new Wallet(owner);
            walletRepo.save(ownerWallet);
            Wallet tenantWallet = new Wallet(tenant);
            walletRepo.save(tenantWallet);

            // 3. Transacciones
            Transaction initialDeposit = new Transaction();
            initialDeposit.setAmount(500.0);
            initialDeposit.setType(TransactionType.PAYOUT);
            initialDeposit.setDestinationWallet(ownerWallet);
            transactionRepo.save(initialDeposit);

            // 4. Categorías
            Category catTech = new Category();
            catTech.setName("Tecnología");
            catTech.setDescription("Dispositivos y servicios técnicos");
            catTech.setMinPrice(10.0);
            catTech.setMaxPrice(2000.0);
            catTech.setStatus(CategoryStatus.ACTIVE);
            catRepo.save(catTech);

            // 5. Artículo (Herencia de Item)
            // Según tus logs: id de article referencia a id de item
            Article laptop = new Article();
            laptop.setTitle("MacBook Pro");
            laptop.setDescription("16 pulgadas, M2");
            laptop.setCategory(catTech);
            laptop.setCity("Sevilla");
            laptop.setOwner(owner);
            laptop.setPricePerMonth(150.0);
            laptop.setTotalUnits(1);
            laptop.setStatus(ArticleStatus.AVAILABLE);
            laptop.setPurchaseDate(LocalDate.now().minusMonths(6));
            laptop.setAvailableFrom(LocalDate.now());
            laptop.setAvailableUntil(LocalDate.now().plusMonths(36));

            // Al guardar el ArticleRepository, JPA gestiona la tabla 'items' y 'articles'
            articleRepo.save(laptop);

            // 4. Servicio (Herencia de Item)
            ServiceItem setupService = new ServiceItem();
            setupService.setTitle("Instalación Software");
            setupService.setDescription("Configuración inicial a domicilio");
            setupService.setCategory(catTech);
            setupService.setCity("Sevilla");
            setupService.setOwner(owner);
            setupService.setPricePerMonth(50.0);
            setupService.setTotalUnits(10);
            setupService.setAvailableFrom(LocalDate.now());
            setupService.setAvailableUntil(LocalDate.now().plusMonths(36));
            serviceRepo.save(setupService);

            // 7. Kit (El Alquiler)
            Kit myKit = new Kit();
            myKit.setName("Pack Trabajo Remoto");
            myKit.setTenant(tenant);
            myKit.setStatus(KitStatus.ACTIVE);
            myKit.setDeliveryMethod(DeliveryMethod.COURIER);
            myKit.setStartDate(LocalDate.now());
            myKit.setEndDate(LocalDate.now().plusMonths(1));
            kitRepo.save(myKit);

            Kit pendingPaidKit = new Kit();
            pendingPaidKit.setName("Pack Trabajo Remoto");
            pendingPaidKit.setTenant(tenant);
            pendingPaidKit.setStatus(KitStatus.DRAFT);
            pendingPaidKit.setDeliveryMethod(DeliveryMethod.COURIER);
            pendingPaidKit.setStartDate(LocalDate.now());
            pendingPaidKit.setEndDate(LocalDate.now().plusMonths(1));
            kitRepo.save(pendingPaidKit);

            // 7.1 ItemMemento
            ItemMemento snap1 = laptop.createSnapshot(1, myKit.getDeliveryMethod(), myKit.getCourierPrice(), myKit.getMeetingPoint());
            snap1.setKit(myKit);
            snap1.setPriceAtRental(laptop.getPricePerMonth());

            ItemMemento snap2 = setupService.createSnapshot(1, myKit.getDeliveryMethod(), myKit.getCourierPrice(), myKit.getMeetingPoint());
            snap2.setKit(myKit);
            snap2.setPriceAtRental(setupService.getPricePerMonth());

            myKit.setSnapshots(List.of(snap1, snap2));
            kitRepo.save(myKit);

            ItemMemento snap3 = laptop.createSnapshot(1, pendingPaidKit.getDeliveryMethod(), pendingPaidKit.getCourierPrice(), pendingPaidKit.getMeetingPoint());
            snap3.setKit(pendingPaidKit);
            snap3.setPriceAtRental(laptop.getPricePerMonth());

            ItemMemento snap4 = setupService.createSnapshot(1, pendingPaidKit.getDeliveryMethod(), pendingPaidKit.getCourierPrice(), pendingPaidKit.getMeetingPoint());
            snap4.setKit(pendingPaidKit);
            snap4.setPriceAtRental(setupService.getPricePerMonth());

            pendingPaidKit.setSnapshots(List.of(snap3, snap4));
            kitRepo.save(pendingPaidKit);


            // 8. Rating
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