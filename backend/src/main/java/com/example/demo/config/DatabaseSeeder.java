package com.example.demo.config;

import com.example.demo.model.*; 
import com.example.demo.repository.*;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.example.demo.tools.CityLoader;

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
            KitDeliveryRepository kitDeliveryRepo,
            DefaultKitRepository defaultKitRepo, // <-- AÑADIDO: Repositorio para los kits predeterminados
            RatingRepository ratingRepo,
            CountryRepository countryRepo,
            CityRepository cityRepo,
            PasswordEncoder passwordEncoder) {
        return args -> {
            
            // 1. Usuarios
            User owner = new User();
            owner.setName("Carlos Owner");
            owner.setEmail("owner@example.com");
            owner.setPassword(passwordEncoder.encode("password123"));
            owner.setRole(UserRole.USER);
            owner.setCountry("Spain");
            owner.setCity("Sevilla");
            owner.setAddress("Calle 123 matame otra vez");
            owner.setPhone("123456789");
            userRepo.save(owner);

            User tenant = new User();
            tenant.setName("Lucía Renter");
            tenant.setEmail("tenant@example.com");
            tenant.setPassword(passwordEncoder.encode("password123"));
            tenant.setRole(UserRole.USER);
            tenant.setCountry("Spain");
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
            initialDeposit.setType(TransactionType.TOP_UP);
            initialDeposit.setDestinationWallet(ownerWallet);
            transactionRepo.save(initialDeposit);
            Transaction tenantDeposit = new Transaction();
            tenantDeposit.setAmount(200.0);
            tenantDeposit.setType(TransactionType.TOP_UP);
            tenantDeposit.setDestinationWallet(tenantWallet);
            transactionRepo.save(tenantDeposit);
            Transaction tenantDeposit2 = new Transaction();
            tenantDeposit2.setAmount(2.5);
            tenantDeposit2.setType(TransactionType.TOP_UP);
            tenantDeposit2.setDestinationWallet(tenantWallet);
            transactionRepo.save(tenantDeposit2);
            
            // 4. Categorías
            Category catTech = new Category();
            catTech.setName("Tecnología");
            catTech.setDescription("Dispositivos y servicios técnicos");
            catTech.setMinPrice(10.0);
            catTech.setMaxPrice(2000.0);
            catTech.setStatus(CategoryStatus.ACTIVE);
            catRepo.save(catTech);

            // 5. Artículo (Herencia de Item)
            Article laptop = new Article();
            laptop.setTitle("MacBook Pro");
            laptop.setDescription("16 pulgadas, M2");
            laptop.setCategory(catTech);
            laptop.setCity("Sevilla");
            laptop.setCountry("Spain");
            laptop.setOwner(owner);
            laptop.setPricePerMonth(150.0);
            laptop.setTotalUnits(1);
            laptop.setStatus(ArticleStatus.AVAILABLE);
            laptop.setPurchaseDate(LocalDate.now().minusMonths(6));
            laptop.setAvailableFrom(LocalDate.now());
            laptop.setAvailableUntil(LocalDate.now().plusMonths(36));
            laptop.setImageUrl("https://i.imgur.com/bY7sIB3.png");
            laptop.setCondition(ArticleCondition.NEW);
            articleRepo.save(laptop);

            // Artículos en ciudades cercanas a Sevilla
            Article camara = new Article();
            camara.setTitle("Cámara Sony A7III");
            camara.setDescription("Full frame, 24MP, ideal para fotografía profesional");
            camara.setCategory(catTech);
            camara.setCity("Huelva");
            camara.setCountry("Spain");
            camara.setOwner(owner);
            camara.setPricePerMonth(80.0);
            camara.setTotalUnits(2);
            camara.setStatus(ArticleStatus.AVAILABLE);
            camara.setPurchaseDate(LocalDate.now().minusMonths(12));
            camara.setAvailableFrom(LocalDate.now());
            camara.setAvailableUntil(LocalDate.now().plusMonths(36));
            camara.setImageUrl("https://i.imgur.com/0y8Ftya.png");
            articleRepo.save(camara);

            Article dron = new Article();
            dron.setTitle("DJI Mini 3 Pro");
            dron.setDescription("Dron con cámara 4K y 34 min de autonomía");
            dron.setCategory(catTech);
            dron.setCity("Cadiz");
            dron.setCountry("Spain");
            dron.setOwner(owner);
            dron.setPricePerMonth(120.0);
            dron.setTotalUnits(1);
            dron.setStatus(ArticleStatus.AVAILABLE);
            dron.setPurchaseDate(LocalDate.now().minusMonths(8));
            dron.setAvailableFrom(LocalDate.now());
            dron.setAvailableUntil(LocalDate.now().plusMonths(36));
            dron.setImageUrl("https://i.imgur.com/6xfBrN3.png");
            articleRepo.save(dron);

            Article proyector = new Article();
            proyector.setTitle("Proyector Epson 4K");
            proyector.setDescription("3000 lúmenes, ideal para presentaciones y cine en casa");
            proyector.setCategory(catTech);
            proyector.setCity("Córdoba");
            proyector.setCountry("Spain");
            proyector.setOwner(owner);
            proyector.setPricePerMonth(60.0);
            proyector.setTotalUnits(3);
            proyector.setStatus(ArticleStatus.AVAILABLE);
            proyector.setPurchaseDate(LocalDate.now().minusMonths(4));
            proyector.setAvailableFrom(LocalDate.now());
            proyector.setAvailableUntil(LocalDate.now().plusMonths(36));
            proyector.setImageUrl("https://i.imgur.com/8bvkR1s.png");
            articleRepo.save(proyector);

            Article impresora = new Article();
            impresora.setTitle("Impresora 3D Bambu Lab");
            impresora.setDescription("Impresora FDM de alta velocidad con multi-color");
            impresora.setCategory(catTech);
            impresora.setCity("Jerez de la Frontera");
            impresora.setCountry("Spain");
            impresora.setOwner(owner);
            impresora.setPricePerMonth(45.0);
            impresora.setTotalUnits(1);
            impresora.setStatus(ArticleStatus.AVAILABLE);
            impresora.setPurchaseDate(LocalDate.now().minusMonths(3));
            impresora.setAvailableFrom(LocalDate.now());
            impresora.setAvailableUntil(LocalDate.now().plusMonths(36));
            impresora.setImageUrl("https://i.imgur.com/3n9fIYP.png");
            articleRepo.save(impresora);

            // 6. Servicio (Herencia de Item)
            ServiceItem setupService = new ServiceItem();
            setupService.setTitle("Instalación Software");
            setupService.setDescription("Configuración inicial a domicilio");
            setupService.setCategory(catTech);
            setupService.setCity("Sevilla");
            setupService.setCountry("Spain");
            setupService.setOwner(owner);
            setupService.setPricePerMonth(50.0);
            setupService.setTotalUnits(10);
            setupService.setAvailableFrom(LocalDate.now());
            setupService.setAvailableUntil(LocalDate.now().plusMonths(36));
            setupService.setStatus(ServiceStatus.ACTIVE);
            serviceRepo.save(setupService);

            // 7. Kit (El Alquiler)
            Kit myKit = new Kit();
            myKit.setName("Pack Trabajo Remoto");
            myKit.setTenant(tenant);
            myKit.setStatus(KitStatus.ACTIVE);
            myKit.setDeliveryMethod(DeliveryMethod.COURIER);
            myKit.setStartDate(LocalDate.now());
            myKit.setEndDate(LocalDate.now().plusMonths(1));
            myKit.setCountry("Spain");
            myKit.setCity("Sevilla");
            kitRepo.save(myKit);

            Kit pendingPaidKit = new Kit();
            pendingPaidKit.setName("Pack Trabajo Remoto");
            pendingPaidKit.setTenant(tenant);
            pendingPaidKit.setStatus(KitStatus.DRAFT);
            pendingPaidKit.setDeliveryMethod(DeliveryMethod.COURIER);
            pendingPaidKit.setStartDate(LocalDate.now().plusWeeks(2));
            pendingPaidKit.setEndDate(LocalDate.now().plusMonths(1));
            pendingPaidKit.setCountry("Spain");
            pendingPaidKit.setCity("Sevilla");
            kitRepo.save(pendingPaidKit);

            Kit audiovisualKit = new Kit();
            audiovisualKit.setName("Pack Audiovisual");
            audiovisualKit.setTenant(tenant);
            audiovisualKit.setStatus(KitStatus.FINISHED);
            audiovisualKit.setDeliveryMethod(DeliveryMethod.COURIER);
            audiovisualKit.setStartDate(LocalDate.now().minusMonths(2));
            audiovisualKit.setEndDate(LocalDate.now().minusMonths(2).plusWeeks(2));
            audiovisualKit.setCountry("Spain");
            audiovisualKit.setCity("Sevilla");
            kitRepo.save(audiovisualKit);

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

            ItemMemento snapAv1 = camara.createSnapshot(
                1,
                audiovisualKit.getDeliveryMethod(),
                audiovisualKit.getCourierPrice(),
                audiovisualKit.getMeetingPoint()
            );
            snapAv1.setKit(audiovisualKit);
            snapAv1.setPriceAtRental(camara.getPricePerMonth());

            ItemMemento snapAv2 = dron.createSnapshot(
                1,
                audiovisualKit.getDeliveryMethod(),
                audiovisualKit.getCourierPrice(),
                audiovisualKit.getMeetingPoint()
            );
            snapAv2.setKit(audiovisualKit);
            snapAv2.setPriceAtRental(dron.getPricePerMonth());

            ItemMemento snapAv3 = proyector.createSnapshot(
                1,
                audiovisualKit.getDeliveryMethod(),
                audiovisualKit.getCourierPrice(),
                audiovisualKit.getMeetingPoint()
            );
            snapAv3.setKit(audiovisualKit);
            snapAv3.setPriceAtRental(proyector.getPricePerMonth());

            audiovisualKit.setSnapshots(List.of(snapAv1, snapAv2, snapAv3));
            kitRepo.save(audiovisualKit);

            Kit finished3DKit = new Kit();
            finished3DKit.setName("Pack Prototipado 3D");
            finished3DKit.setTenant(tenant);
            finished3DKit.setStatus(KitStatus.FINISHED);
            finished3DKit.setDeliveryMethod(DeliveryMethod.MEETING_POINT);
            finished3DKit.setMeetingPoint("Plaza de España, Sevilla");
            finished3DKit.setStartDate(LocalDate.now().minusMonths(2));
            finished3DKit.setEndDate(LocalDate.now().minusMonths(1));
            finished3DKit.setCountry("Spain");
            finished3DKit.setCity("Sevilla");
            kitRepo.save(finished3DKit);

            ItemMemento snap3D = impresora.createSnapshot(
                1, 
                finished3DKit.getDeliveryMethod(), 
                finished3DKit.getCourierPrice(), 
                finished3DKit.getMeetingPoint()
            );
            snap3D.setKit(finished3DKit);
            snap3D.setPriceAtRental(impresora.getPricePerMonth());
            
            finished3DKit.setSnapshots(List.of(snap3D));
            kitRepo.save(finished3DKit);

            Kit finishedPhotoKit = new Kit();
            finishedPhotoKit.setName("Pack Eventos Express");
            finishedPhotoKit.setTenant(tenant);
            finishedPhotoKit.setStatus(KitStatus.FINISHED);
            finishedPhotoKit.setDeliveryMethod(DeliveryMethod.COURIER);
            finishedPhotoKit.setStartDate(LocalDate.now().minusWeeks(3));
            finishedPhotoKit.setEndDate(LocalDate.now().minusWeeks(1));
            finishedPhotoKit.setCountry("Spain");
            finishedPhotoKit.setCity("Sevilla");
            kitRepo.save(finishedPhotoKit);

            ItemMemento snapCam = camara.createSnapshot(
                1, 
                finishedPhotoKit.getDeliveryMethod(), 
                finishedPhotoKit.getCourierPrice(), 
                null
            );
            snapCam.setKit(finishedPhotoKit);
            snapCam.setPriceAtRental(camara.getPricePerMonth());

            finishedPhotoKit.setSnapshots(List.of(snapCam));
            kitRepo.save(finishedPhotoKit);

            Kit streamingKit = new Kit();
            streamingKit.setName("Pack Creador de Contenido");
            streamingKit.setTenant(tenant);
            streamingKit.setStatus(KitStatus.FINISHED);
            streamingKit.setDeliveryMethod(DeliveryMethod.COURIER);
            streamingKit.setStartDate(LocalDate.now().minusMonths(4));
            streamingKit.setEndDate(LocalDate.now().minusMonths(3));
            streamingKit.setCountry("Spain");
            streamingKit.setCity("Sevilla");
            kitRepo.save(streamingKit);

            ItemMemento snapStream1 = laptop.createSnapshot(1, streamingKit.getDeliveryMethod(), streamingKit.getCourierPrice(), null);
            snapStream1.setKit(streamingKit);
            snapStream1.setPriceAtRental(laptop.getPricePerMonth());

            ItemMemento snapStream2 = camara.createSnapshot(1, streamingKit.getDeliveryMethod(), streamingKit.getCourierPrice(), null);
            snapStream2.setKit(streamingKit);
            snapStream2.setPriceAtRental(camara.getPricePerMonth());

            streamingKit.setSnapshots(List.of(snapStream1, snapStream2));
            kitRepo.save(streamingKit);

            Kit cinemaKit = new Kit();
            cinemaKit.setName("Pack Cine de Verano");
            cinemaKit.setTenant(tenant);
            cinemaKit.setStatus(KitStatus.FINISHED);
            cinemaKit.setDeliveryMethod(DeliveryMethod.MEETING_POINT);
            cinemaKit.setMeetingPoint("CC Lagoh, Sevilla");
            cinemaKit.setStartDate(LocalDate.now().minusMonths(1));
            cinemaKit.setEndDate(LocalDate.now().minusWeeks(2));
            cinemaKit.setCountry("Spain");
            cinemaKit.setCity("Sevilla");
            kitRepo.save(cinemaKit);

            ItemMemento snapCinema = proyector.createSnapshot(1, cinemaKit.getDeliveryMethod(), 0.0, cinemaKit.getMeetingPoint());
            snapCinema.setKit(cinemaKit);
            snapCinema.setPriceAtRental(proyector.getPricePerMonth());

            cinemaKit.setSnapshots(List.of(snapCinema));
            kitRepo.save(cinemaKit);

            Kit droneKit = new Kit();
            droneKit.setName("Pack Grabación Aérea");
            droneKit.setTenant(tenant);
            droneKit.setStatus(KitStatus.FINISHED);
            droneKit.setDeliveryMethod(DeliveryMethod.COURIER);
            droneKit.setStartDate(LocalDate.now().minusDays(15));
            droneKit.setEndDate(LocalDate.now().minusDays(2));
            droneKit.setCountry("Spain");
            droneKit.setCity("Sevilla");
            kitRepo.save(droneKit);

            ItemMemento snapDrone = dron.createSnapshot(1, droneKit.getDeliveryMethod(), droneKit.getCourierPrice(), null);
            snapDrone.setKit(droneKit);
            snapDrone.setPriceAtRental(dron.getPricePerMonth());

            droneKit.setSnapshots(List.of(snapDrone));
            kitRepo.save(droneKit);

            // ==========================================
            // 7.2 Kit Predeterminado para el Catálogo (FIX REAL)
            // ==========================================

            // ⚠️ NO usar laptop ni setupService directamente

            Article laptopRef = new Article();
            laptopRef.setId(laptop.getId()); // solo referencia por ID

            ServiceItem serviceRef = new ServiceItem();
            serviceRef.setId(setupService.getId());

            // 💰 precio base
            Double basePrice = laptop.getPricePerMonth() + setupService.getPricePerMonth();

            // 🧠 kit
            DefaultKit defaultKit = new DefaultKit(
                "Pack Trabajo Remoto",
                "Kit listo para usar, incluye un MacBook Pro y el servicio de instalación de software.",
                basePrice
            );

            // ⚠️ asegurar lista
            if (defaultKit.getItems() == null) {
                defaultKit.setItems(new java.util.ArrayList<>());
            }

            // 🔗 items SIN cargar entidad completa
            DefaultKitItem dki1 = new DefaultKitItem(defaultKit, laptopRef);
            DefaultKitItem dki2 = new DefaultKitItem(defaultKit, serviceRef);

            defaultKit.getItems().add(dki1);
            defaultKit.getItems().add(dki2);

            // 💾 guardar
            defaultKitRepo.save(defaultKit);


            // 8. Rating
            Rating feedback = new Rating();
            feedback.setKit(finished3DKit);
            feedback.setReviewer(tenant);
            feedback.setReviewee(owner);
            feedback.setScore(5);
            feedback.setComment("Increíble estado del equipo.");
            feedback.setType(RatingType.RENTER_TO_OWNER);
            feedback.setCreatedAt(LocalDateTime.now());
            ratingRepo.save(feedback);

            // 9. Países Y ciudades       
            CityLoader.loadFromJson(countryRepo, cityRepo);     
            
            // 10. Kit Delivery
            KitDelivery delivery1 = new KitDelivery();
            delivery1.setKit(myKit);
            delivery1.setStatus(DeliveryStatus.DELIVERED);
            delivery1.setEstimatedArrival(LocalDateTime.now());
            delivery1.setLastLocation("Sevilla");
            delivery1.setLastUpdate(LocalDateTime.now());
            kitDeliveryRepo.save(delivery1);

            KitDelivery delivery2 = new KitDelivery();
            delivery2.setKit(audiovisualKit);
            delivery2.setStatus(DeliveryStatus.DELIVERED);
            delivery2.setEstimatedArrival(LocalDateTime.now().minusMonths(2));
            delivery2.setLastLocation("Sevilla");
            delivery2.setLastUpdate(LocalDateTime.now().minusMonths(2));
            kitDeliveryRepo.save(delivery2);

            KitDelivery delivery3 = new KitDelivery();
            delivery3.setKit(finishedPhotoKit);
            delivery3.setStatus(DeliveryStatus.DELIVERED);
            delivery3.setEstimatedArrival(LocalDateTime.now().minusWeeks(1));
            delivery3.setLastLocation("Sevilla");
            delivery3.setLastUpdate(LocalDateTime.now().minusWeeks(1));
            kitDeliveryRepo.save(delivery3);

            KitDelivery delivery4 = new KitDelivery();
            delivery4.setKit(streamingKit);
            delivery4.setStatus(DeliveryStatus.DELIVERED);
            delivery4.setEstimatedArrival(LocalDateTime.now().minusMonths(3));
            delivery4.setLastLocation("Sevilla");
            delivery4.setLastUpdate(LocalDateTime.now().minusMonths(3));
            kitDeliveryRepo.save(delivery4);

            KitDelivery delivery5 = new KitDelivery();
            delivery5.setKit(droneKit);
            delivery5.setStatus(DeliveryStatus.DELIVERED);
            delivery5.setEstimatedArrival(LocalDateTime.now().minusDays(2));
            delivery5.setLastLocation("Sevilla");
            delivery5.setLastUpdate(LocalDateTime.now().minusDays(2));
            kitDeliveryRepo.save(delivery5);

            System.out.println("✅ Seeder finalizado: Datos cargados en los repositorios.");

        };
    }
}
