package com.example.demo.config;

import com.example.demo.model.*;
import com.example.demo.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

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
            KitItemRepository kitItemRepo,
            RatingRepository ratingRepo,
            WalletRepository walletRepo,
            PasswordEncoder passwordEncoder) {
        return args -> {

            // ══════════════════════════════════════════════════
            // 1. USUARIOS
            // ══════════════════════════════════════════════════

            // Arrendador (owner) — es quien revisa los artículos devueltos
            User owner = new User();
            owner.setName("Carlos Owner");
            owner.setEmail("owner@example.com");
            owner.setPassword(passwordEncoder.encode("password123"));
            owner.setRole(UserRole.USER);
            owner.setCountry("Spain");
            owner.setCity("Sevilla");
            owner.setAddress("Calle Sierpes 12");
            owner.setPhone("612345678");
            userRepo.save(owner);

            // Arrendatario (tenant) — quien alquila los artículos
            User tenant = new User();
            tenant.setName("Lucía Renter");
            tenant.setEmail("tenant@example.com");
            tenant.setPassword(passwordEncoder.encode("password123"));
            tenant.setRole(UserRole.USER);
            tenant.setCountry("Spain");
            tenant.setCity("Sevilla");
            tenant.setAddress("Avenida de la Constitución 5");
            tenant.setPhone("623456789");
            userRepo.save(tenant);

            // Segundo arrendador para más variedad
            User owner2 = new User();
            owner2.setName("Ana Propietaria");
            owner2.setEmail("owner2@example.com");
            owner2.setPassword(passwordEncoder.encode("password123"));
            owner2.setRole(UserRole.USER);
            owner2.setCountry("Spain");
            owner2.setCity("Madrid");
            owner2.setAddress("Gran Vía 25");
            owner2.setPhone("634567890");
            userRepo.save(owner2);

            // Segundo arrendatario
            User tenant2 = new User();
            tenant2.setName("Pedro Inquilino");
            tenant2.setEmail("tenant2@example.com");
            tenant2.setPassword(passwordEncoder.encode("password123"));
            tenant2.setRole(UserRole.USER);
            tenant2.setCountry("Spain");
            tenant2.setCity("Madrid");
            tenant2.setAddress("Calle Alcalá 10");
            tenant2.setPhone("645678901");
            userRepo.save(tenant2);

            // ══════════════════════════════════════════════════
            // 2. WALLETS (necesarias para la lógica de garantías)
            // ══════════════════════════════════════════════════

            Wallet ownerWallet = new Wallet(owner);
            ownerWallet.setAvailableBalance(500.0);
            walletRepo.save(ownerWallet);

            Wallet tenantWallet = new Wallet(tenant);
            tenantWallet.setAvailableBalance(200.0);
            walletRepo.save(tenantWallet);

            Wallet owner2Wallet = new Wallet(owner2);
            owner2Wallet.setAvailableBalance(300.0);
            walletRepo.save(owner2Wallet);

            Wallet tenant2Wallet = new Wallet(tenant2);
            tenant2Wallet.setAvailableBalance(150.0);
            walletRepo.save(tenant2Wallet);

            // ══════════════════════════════════════════════════
            // 3. CATEGORÍAS
            // ══════════════════════════════════════════════════

            Category catTech = new Category();
            catTech.setName("Tecnología");
            catTech.setDescription("Dispositivos y servicios técnicos");
            catTech.setMinPrice(10.0);
            catTech.setMaxPrice(2000.0);
            catTech.setStatus(CategoryStatus.ACTIVE);
            catRepo.save(catTech);

            Category catFurniture = new Category();
            catFurniture.setName("Mobiliario");
            catFurniture.setDescription("Muebles para hogar y oficina");
            catFurniture.setMinPrice(5.0);
            catFurniture.setMaxPrice(500.0);
            catFurniture.setStatus(CategoryStatus.ACTIVE);
            catRepo.save(catFurniture);

            Category catAppliances = new Category();
            catAppliances.setName("Electrodomésticos");
            catAppliances.setDescription("Electrodomésticos de cocina y hogar");
            catAppliances.setMinPrice(5.0);
            catAppliances.setMaxPrice(800.0);
            catAppliances.setStatus(CategoryStatus.ACTIVE);
            catRepo.save(catAppliances);

            Category catServices = new Category();
            catServices.setName("Servicios");
            catServices.setDescription("Servicios profesionales a domicilio");
            catServices.setMinPrice(10.0);
            catServices.setMaxPrice(300.0);
            catServices.setStatus(CategoryStatus.ACTIVE);
            catRepo.save(catServices);

            // ══════════════════════════════════════════════════
            // 4. ARTÍCULOS — Kit principal EndRental (owner, RENTED)
            //    Estos artículos están actualmente alquilados
            // ══════════════════════════════════════════════════

            // Artículo 1: Sofá — garantía = 80 × 0.20 = 16.00€
            Article sofa = new Article();
            sofa.setTitle("Sofá 3 plazas");
            sofa.setDescription("Sofá de tela color gris, 3 plazas, muy cómodo");
            sofa.setCity("Sevilla");
            sofa.setCategory(catFurniture);
            sofa.setOwner(owner);
            sofa.setPricePerMonth(80.0);
            sofa.setTotalUnits(1);
            sofa.setStatus(ArticleStatus.PENDING_REVIEW);
            sofa.setAvailableFrom(LocalDate.of(2026, 1, 1));
            sofa.setAvailableUntil(LocalDate.of(2026, 4, 1));
            sofa.setPurchaseDate(LocalDate.of(2024, 6, 15));
            articleRepo.save(sofa);

            // Artículo 2: Mesa escritorio — garantía = 45 × 0.20 = 9.00€
            Article desk = new Article();
            desk.setTitle("Mesa de escritorio");
            desk.setDescription("Mesa de oficina regulable en altura, madera de roble");
            desk.setCity("Sevilla");
            desk.setCategory(catFurniture);
            desk.setOwner(owner);
            desk.setPricePerMonth(45.0);
            desk.setTotalUnits(1);
            desk.setStatus(ArticleStatus.PENDING_REVIEW);
            desk.setAvailableFrom(LocalDate.of(2026, 1, 1));
            desk.setAvailableUntil(LocalDate.of(2026, 4, 1));
            desk.setPurchaseDate(LocalDate.of(2025, 1, 10));
            articleRepo.save(desk);

            // Artículo 3: Microondas — garantía = 25 × 0.20 = 5.00€
            Article microwave = new Article();
            microwave.setTitle("Microondas Samsung");
            microwave.setDescription("Microondas 23L con grill, color blanco");
            microwave.setCity("Sevilla");
            microwave.setCategory(catAppliances);
            microwave.setOwner(owner);
            microwave.setPricePerMonth(25.0);
            microwave.setTotalUnits(1);
            microwave.setStatus(ArticleStatus.PENDING_REVIEW);
            microwave.setAvailableFrom(LocalDate.of(2026, 1, 1));
            microwave.setAvailableUntil(LocalDate.of(2026, 4, 1));
            microwave.setPurchaseDate(LocalDate.of(2025, 3, 20));
            articleRepo.save(microwave);

            // Artículo 4: MacBook — garantía = 150 × 0.20 = 30.00€
            Article laptop = new Article();
            laptop.setTitle("MacBook Pro 16\"");
            laptop.setDescription("MacBook Pro 16 pulgadas, chip M2, 16GB RAM");
            laptop.setCity("Sevilla");
            laptop.setCategory(catTech);
            laptop.setOwner(owner);
            laptop.setPricePerMonth(150.0);
            laptop.setTotalUnits(1);
            laptop.setStatus(ArticleStatus.PENDING_REVIEW);
            laptop.setAvailableFrom(LocalDate.of(2026, 1, 1));
            laptop.setAvailableUntil(LocalDate.of(2026, 4, 1));
            laptop.setPurchaseDate(LocalDate.of(2024, 9, 1));
            articleRepo.save(laptop);

            // ══════════════════════════════════════════════════
            // 5. ARTÍCULOS ADICIONALES — para otros kits de prueba
            // ══════════════════════════════════════════════════

            // Artículo disponible (no alquilado)
            Article monitor = new Article();
            monitor.setTitle("Monitor Dell 27\"");
            monitor.setDescription("Monitor 4K IPS, USB-C, gran calidad de imagen");
            monitor.setCity("Sevilla");
            monitor.setCategory(catTech);
            monitor.setOwner(owner);
            monitor.setPricePerMonth(60.0);
            monitor.setTotalUnits(2);
            monitor.setStatus(ArticleStatus.AVAILABLE);
            monitor.setAvailableFrom(LocalDate.of(2026, 1, 1));
            monitor.setAvailableUntil(LocalDate.of(2026, 12, 31));
            articleRepo.save(monitor);

            // Artículos de owner2 — para kit en Madrid
            Article washingMachine = new Article();
            washingMachine.setTitle("Lavadora Bosch");
            washingMachine.setDescription("Lavadora 8kg, clase A+++, silenciosa");
            washingMachine.setCity("Madrid");
            washingMachine.setCategory(catAppliances);
            washingMachine.setOwner(owner2);
            washingMachine.setPricePerMonth(35.0);
            washingMachine.setTotalUnits(1);
            washingMachine.setStatus(ArticleStatus.RENTED);
            washingMachine.setAvailableFrom(LocalDate.of(2026, 2, 1));
            washingMachine.setAvailableUntil(LocalDate.of(2026, 5, 1));
            articleRepo.save(washingMachine);

            Article bed = new Article();
            bed.setTitle("Cama doble IKEA");
            bed.setDescription("Cama doble 150cm con colchón viscoelástico incluido");
            bed.setCity("Madrid");
            bed.setCategory(catFurniture);
            bed.setOwner(owner2);
            bed.setPricePerMonth(55.0);
            bed.setTotalUnits(1);
            bed.setStatus(ArticleStatus.RENTED);
            bed.setAvailableFrom(LocalDate.of(2026, 2, 1));
            bed.setAvailableUntil(LocalDate.of(2026, 5, 1));
            articleRepo.save(bed);

            // ══════════════════════════════════════════════════
            // 6. SERVICIO (herencia de Item)
            // ══════════════════════════════════════════════════

            Service setupService = new Service();
            setupService.setTitle("Instalación Software");
            setupService.setDescription("Configuración inicial a domicilio de equipo informático");
            setupService.setCity("Sevilla");
            setupService.setCategory(catServices);
            setupService.setOwner(owner);
            setupService.setPricePerMonth(50.0);
            setupService.setTotalUnits(10);
            serviceRepo.save(setupService);

            // ══════════════════════════════════════════════════
            // 7. KIT PRINCIPAL — "Kit Mudanza Sevilla" (ACTIVE)
            //    Contiene: Sofá, Mesa, Microondas, MacBook
            //    Total garantías: 16 + 9 + 5 + 30 = 60.00€
            // ══════════════════════════════════════════════════

            Kit kitSevilla = new Kit();
            kitSevilla.setName("Kit Mudanza Sevilla");
            kitSevilla.setCountry("Spain");
            kitSevilla.setCity("Sevilla");
            kitSevilla.setTenant(tenant);
            kitSevilla.setStatus(KitStatus.COMPLETED);
            kitSevilla.setDeliveryMethod(DeliveryMethod.MEETING_POINT);
            kitSevilla.setMeetingPoint("Plaza Nueva, Sevilla");
            kitSevilla.setOrderDate(LocalDate.of(2025, 12, 10));
            kitSevilla.setStartDate(LocalDate.of(2025, 12, 15));
            kitSevilla.setEndDate(LocalDate.of(2026, 2, 15));
            kitRepo.save(kitSevilla);

            KitItem ki1 = new KitItem();
            ki1.setKit(kitSevilla);
            ki1.setItem(sofa);
            ki1.setQuantity(1);
            kitItemRepo.save(ki1);

            KitItem ki2 = new KitItem();
            ki2.setKit(kitSevilla);
            ki2.setItem(desk);
            ki2.setQuantity(1);
            kitItemRepo.save(ki2);

            KitItem ki3 = new KitItem();
            ki3.setKit(kitSevilla);
            ki3.setItem(microwave);
            ki3.setQuantity(1);
            kitItemRepo.save(ki3);

            KitItem ki4 = new KitItem();
            ki4.setKit(kitSevilla);
            ki4.setItem(laptop);
            ki4.setQuantity(1);
            kitItemRepo.save(ki4);

            // ══════════════════════════════════════════════════
            // 8. KIT SECUNDARIO — "Kit Madrid" (ACTIVE)
            //    Para probar con otro arrendatario/arrendador
            //    Contiene: Lavadora, Cama
            //    Garantías: 7 + 11 = 18.00€
            // ══════════════════════════════════════════════════

            Kit kitMadrid = new Kit();
            kitMadrid.setName("Kit Prácticas Madrid");
            kitMadrid.setCountry("Spain");
            kitMadrid.setCity("Madrid");
            kitMadrid.setTenant(tenant2);
            kitMadrid.setStatus(KitStatus.ACTIVE);
            kitMadrid.setDeliveryMethod(DeliveryMethod.COURIER);
            kitMadrid.setCourierPrice(9.99);
            kitMadrid.setOrderDate(LocalDate.of(2026, 2, 1));
            kitMadrid.setStartDate(LocalDate.of(2026, 2, 10));
            kitMadrid.setEndDate(LocalDate.of(2026, 5, 1));
            kitRepo.save(kitMadrid);

            KitItem ki5 = new KitItem();
            ki5.setKit(kitMadrid);
            ki5.setItem(washingMachine);
            ki5.setQuantity(1);
            kitItemRepo.save(ki5);

            KitItem ki6 = new KitItem();
            ki6.setKit(kitMadrid);
            ki6.setItem(bed);
            ki6.setQuantity(1);
            kitItemRepo.save(ki6);

            // ══════════════════════════════════════════════════
            // 9. KIT COMPLETADO — para verificar que no se puede
            //    finalizar dos veces
            // ══════════════════════════════════════════════════

            Kit kitCompleted = new Kit();
            kitCompleted.setName("Kit Ya Finalizado");
            kitCompleted.setCountry("Spain");
            kitCompleted.setCity("Sevilla");
            kitCompleted.setTenant(tenant);
            kitCompleted.setStatus(KitStatus.COMPLETED);
            kitCompleted.setDeliveryMethod(DeliveryMethod.MEETING_POINT);
            kitCompleted.setMeetingPoint("Estación Santa Justa");
            kitCompleted.setOrderDate(LocalDate.of(2025, 10, 1));
            kitCompleted.setStartDate(LocalDate.of(2025, 10, 15));
            kitCompleted.setEndDate(LocalDate.of(2025, 12, 15));
            kitRepo.save(kitCompleted);

            // ══════════════════════════════════════════════════
            // 10. KIT MÍNIMO — un solo artículo (caso borde)
            // ══════════════════════════════════════════════════

            Article chair = new Article();
            chair.setTitle("Silla ergonómica");
            chair.setDescription("Silla de oficina con soporte lumbar ajustable");
            chair.setCity("Sevilla");
            chair.setCategory(catFurniture);
            chair.setOwner(owner);
            chair.setPricePerMonth(30.0);
            chair.setTotalUnits(1);
            chair.setStatus(ArticleStatus.RENTED);
            chair.setAvailableFrom(LocalDate.of(2026, 2, 1));
            chair.setAvailableUntil(LocalDate.of(2026, 4, 1));
            articleRepo.save(chair);

            Kit kitMinimo = new Kit();
            kitMinimo.setName("Kit Mínimo (1 artículo)");
            kitMinimo.setCountry("Spain");
            kitMinimo.setCity("Sevilla");
            kitMinimo.setTenant(tenant);
            kitMinimo.setStatus(KitStatus.ACTIVE);
            kitMinimo.setDeliveryMethod(DeliveryMethod.MEETING_POINT);
            kitMinimo.setMeetingPoint("Puerta de Jerez");
            kitMinimo.setOrderDate(LocalDate.of(2026, 2, 1));
            kitMinimo.setStartDate(LocalDate.of(2026, 2, 5));
            kitMinimo.setEndDate(LocalDate.of(2026, 4, 1));
            kitRepo.save(kitMinimo);

            KitItem ki7 = new KitItem();
            ki7.setKit(kitMinimo);
            ki7.setItem(chair);
            ki7.setQuantity(1);
            kitItemRepo.save(ki7);

            // ══════════════════════════════════════════════════
            // 11. RATINGS
            // ══════════════════════════════════════════════════

            Rating feedback = new Rating();
            feedback.setKit(kitCompleted);
            feedback.setReviewer(tenant);
            feedback.setReviewee(owner);
            feedback.setScore(5);
            feedback.setComment("Increíble estado del equipo.");
            feedback.setType(RatingType.RENTER_TO_OWNER);
            feedback.setCreatedAt(LocalDateTime.now().minusDays(30));
            ratingRepo.save(feedback);

            Rating feedback2 = new Rating();
            feedback2.setKit(kitCompleted);
            feedback2.setReviewer(owner);
            feedback2.setReviewee(tenant);
            feedback2.setScore(4);
            feedback2.setComment("Buen inquilino, devolvió todo a tiempo.");
            feedback2.setType(RatingType.OWNER_TO_RENTER);
            feedback2.setCreatedAt(LocalDateTime.now().minusDays(29));
            ratingRepo.save(feedback2);

            System.out.println("✅ Seeder finalizado: Datos cargados en los 7 repositorios.");
        };
    }
}