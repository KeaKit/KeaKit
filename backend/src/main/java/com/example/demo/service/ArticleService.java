package com.example.demo.service;


import java.io.IOException;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.example.demo.dto.ArticleNearbyDTO;
import com.example.demo.dto.ArticleRecordDTO;
import com.example.demo.dto.CityCoordinatesDTO;
import com.example.demo.dto.ReturnRequest;
import com.example.demo.dto.ReturnResponse;
import com.example.demo.dto.UserArticle;
import com.example.demo.dto.PromoCodeValidationResponse;
import com.example.demo.model.Article;
import com.example.demo.model.ArticleFilter;
import com.example.demo.model.ArticleStatus;
import com.example.demo.model.Category;
import com.example.demo.model.CategoryStatus;
import com.example.demo.model.ItemMemento;
import com.example.demo.model.Kit;
import com.example.demo.model.KitStatus;
import com.example.demo.model.User;
import com.example.demo.repository.ArticleRepository;
import com.example.demo.repository.CategoryRepository;
import com.example.demo.repository.KitRepository;
import com.example.demo.repository.UserRepository;

@Service
public class ArticleService {

    private static final String FUTURE_PURCHASE_DATE_MESSAGE = "La fecha de compra no puede ser posterior a hoy";

    private final ArticleRepository articleRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final PaymentService paymentService;
    private final KitRepository kitRepository;
    private final DefaultKitService defaultKitService;
    private final CloudinaryService cloudinaryService;
    private final CityService cityService;
    private final ArticleAvailabilityRequestService availabilityRequestService;
    private final PromoCodeService promoCodeService;

    public ArticleService(ArticleRepository articleRepository, UserRepository userRepository,
                          KitRepository kitRepository, CategoryRepository categoryRepository,
                          PaymentService paymentService,
                          CloudinaryService cloudinaryService, DefaultKitService defaultKitService,
                          CityService cityService, ArticleAvailabilityRequestService availabilityRequestService,
                          PromoCodeService promoCodeService) {
        this.articleRepository = articleRepository;
        this.userRepository = userRepository;
        this.kitRepository = kitRepository;
        this.categoryRepository = categoryRepository;
        this.cloudinaryService = cloudinaryService;
        this.defaultKitService = defaultKitService;
        this.paymentService = paymentService;
        this.cityService = cityService;
        this.availabilityRequestService = availabilityRequestService; // Se inyecta manualmente para evitar dependencia circular
        this.promoCodeService = promoCodeService;
    }



    public Article createWithImage(Article article, MultipartFile image, Long ownerId, Long categoryId) throws IOException {
        User owner = userRepository.findById(ownerId)
            .orElseThrow(() -> new RuntimeException("Propietario no encontrado"));

        Category category = categoryRepository.findById(categoryId)
            .orElseThrow(() -> new RuntimeException("Categoría no encontrada"));

        // Upload image to Cloudinary
        String imageUrl = cloudinaryService.uploadImage(image);

        article.setOwner(owner);
        article.setCategory(category);
        article.setImageUrl(imageUrl);
        article.setStatus(ArticleStatus.AVAILABLE);

        return save(article);
    }

    public List<Article> findAll() {
        return articleRepository.findAll();
    }

    public Article findById(Long id) {
        return articleRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Artículo no encontrado"));
    }

    public Article save(Article article) {
        if (article == null) throw new RuntimeException("Payload del artículo requerido");

        if (article.getTitle() == null || article.getTitle().trim().isEmpty())
            throw new RuntimeException("Título requerido");

        if (article.getDescription() == null || article.getDescription().trim().isEmpty())
            throw new RuntimeException("Descripción requerida");
        if (article.getDescription().length() > 1000)
            throw new RuntimeException("La descripción no puede exceder los 1000 caracteres");

        if (article.getCity() == null || article.getCity().trim().isEmpty())
            throw new RuntimeException("Ciudad requerida");

        if (article.getPricePerMonth() == null || article.getPricePerMonth() < 0)
            throw new RuntimeException("El precio por mes debe ser un valor positivo");

        if (article.getCategory() != null && article.getCategory().getId() != null) {
            Category category = categoryRepository.findById(article.getCategory().getId())
                .orElseThrow(() -> new RuntimeException("Categoría no encontrada"));
            double price = article.getPricePerMonth();
            if (price < category.getMinPrice() || price > category.getMaxPrice()) {
                throw new RuntimeException(
                    "El precio por mes debe estar entre " + category.getMinPrice() +
                    " y " + category.getMaxPrice() + " para esta categoría"
                );
            }
        }

        if (article.getTotalUnits() == null || article.getTotalUnits() < 1)
            article.setTotalUnits(1);

        LocalDate from = article.getAvailableFrom();
        if (from != null && from.isBefore(LocalDate.now()))
            throw new RuntimeException("La fecha de inicio de disponibilidad no puede ser pasada a la actual");

        LocalDate until = article.getAvailableUntil();
        if (from != null && until != null && from.isAfter(until))
            throw new RuntimeException("La fecha de inicio de disponibilidad debe ser posterior o igual a la fecha de finalización");

        validatePurchaseDate(article.getPurchaseDate());

        User owner = article.getOwner();
        if (owner == null || owner.getId() == null)
            throw new RuntimeException("Propietario con id válido es requerido");
        userRepository.findById(owner.getId())
            .orElseThrow(() -> new RuntimeException("Propietario no encontrado"));

        normalizeOwnerCommissionPromoState(article, false);

        validateOwnerCommissionPromoCode(article.getOwnerCommissionPromoCode(), owner.getEmail());
        reserveOwnerSingleUseIfNeeded(article.getOwnerCommissionPromoCode(), owner.getEmail());

        defaultKitService.removeItemFromAllDefaultKits(article.getId());
        return articleRepository.save(article);
    }

    public Article update(Long id, Long ownerId, Article updateData) {
        Article article = articleRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Artículo no encontrado"));

        if (article.getStatus() == ArticleStatus.RENTED || isArticleCurrentlyRented(id)) {
            throw new RuntimeException("El artículo está actualmente alquilado y no puede ser editado");
        }

        User owner = article.getOwner();
        if (owner == null || !owner.getId().equals(ownerId))
            throw new RuntimeException("Solo el propietario puede modificar este artículo");

        if (updateData.getStatus() != null)
            throw new RuntimeException("No se puede cambiar el estado a través de la actualización; use el endpoint toggleRent");

        updateArticleFields(article, updateData);

        if (updateData.getOwnerCommissionPromoCode() != null) {
            String previousCode = article.getOwnerCommissionPromoCode();
            article.setOwnerCommissionPromoCode(updateData.getOwnerCommissionPromoCode());
            normalizeOwnerCommissionPromoState(article, !sameCode(previousCode, article.getOwnerCommissionPromoCode()));
        }

        validateOwnerCommissionPromoCode(article.getOwnerCommissionPromoCode(), owner.getEmail());
        reserveOwnerSingleUseIfNeeded(article.getOwnerCommissionPromoCode(), owner.getEmail());

        return articleRepository.save(article);
    }

    private void validateOwnerCommissionPromoCode(String promoCode, String ownerEmail) {
        if (promoCode == null || promoCode.isBlank()) {
            return;
        }

        if (promoCodeService == null) {
            return;
        }

        if (ownerEmail == null || ownerEmail.isBlank()) {
            throw new RuntimeException("Owner email is required to validate owner promo code");
        }

        PromoCodeValidationResponse validation = promoCodeService
            .validateForOwnerCommissionReductionAllowReservedByUser(promoCode.trim(), ownerEmail);

        if (!validation.isValid()) {
            throw new RuntimeException(validation.getMessage());
        }
    }

    private void normalizeOwnerCommissionPromoState(Article article, boolean resetConsumedFlag) {
        String normalized = normalizePromoCode(article.getOwnerCommissionPromoCode());
        article.setOwnerCommissionPromoCode(normalized);

        if (normalized == null) {
            article.setOwnerCommissionPromoConsumed(false);
            return;
        }

        if (resetConsumedFlag) {
            article.setOwnerCommissionPromoConsumed(false);
        }
    }

    private void reserveOwnerSingleUseIfNeeded(String promoCode, String ownerEmail) {
        if (promoCodeService == null || promoCode == null || promoCode.isBlank()) {
            return;
        }
        promoCodeService.reserveOwnerSingleUseIfNeeded(promoCode, ownerEmail);
    }

    private String normalizePromoCode(String code) {
        if (code == null) {
            return null;
        }
        String normalized = code.trim().toUpperCase();
        return normalized.isBlank() ? null : normalized;
    }

    private boolean sameCode(String left, String right) {
        String l = normalizePromoCode(left);
        String r = normalizePromoCode(right);
        if (l == null && r == null) {
            return true;
        }
        if (l == null || r == null) {
            return false;
        }
        return l.equals(r);
    }

    private void validatePurchaseDate(LocalDate purchaseDate) {
        if (purchaseDate != null && purchaseDate.isAfter(LocalDate.now())) {
            throw new IllegalArgumentException(FUTURE_PURCHASE_DATE_MESSAGE);
        }
    }

    public void deleteById(Long id, Long ownerId) {
        Article article = articleRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Artículo no encontrado"));

        if (article.getStatus() == ArticleStatus.RENTED || isArticleCurrentlyRented(id)) {
            throw new RuntimeException("El artículo está actualmente alquilado y no puede ser eliminado");
        }

        User owner = article.getOwner();
        if (owner == null || !owner.getId().equals(ownerId))
            throw new RuntimeException("Solo el propietario puede eliminar este artículo");

        if (article.getImageUrl() != null && !article.getImageUrl().isEmpty()) {
            try {
                cloudinaryService.deleteImage(article.getImageUrl());
            } catch (IOException e) {
                System.err.println("Aviso: Fallo al eliminar la imagen de Cloudinary: " + e.getMessage());
            }
        }

        articleRepository.deleteById(id);
    }

    public Article toggleRent(Long id, Long ownerId) {
        Article article = articleRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Artículo no encontrado"));

        User owner = article.getOwner();
        if (owner == null || !owner.getId().equals(ownerId))
            throw new RuntimeException("Solo el propietario puede cambiar el estado de alquiler");

        ArticleStatus status = article.getStatus();

        if (status == ArticleStatus.INACTIVE)
            throw new RuntimeException("Los artículos inactivos no pueden ser alquilados");

        if (status == ArticleStatus.AVAILABLE) {
            article.setStatus(ArticleStatus.RENTED);
        } else if (status == ArticleStatus.RENTED) {
            article.setStatus(ArticleStatus.AVAILABLE);
        }

        Article updatedArticle = articleRepository.save(article);
        if (updatedArticle.getStatus() == ArticleStatus.AVAILABLE) {
            availabilityRequestService.notifyWatchersWhenAvailable(updatedArticle);
        }
        return updatedArticle;
    }

   public List<UserArticle> findArticlesByUserId(Long userId, Long categoryId, String condition, Double minPrice, Double maxPrice) {
    Specification<Article> spec = Specification.where(ArticleFilter.hasOwnerId(userId))
            .and(ArticleFilter.hasCategoryId(categoryId))
            .and(ArticleFilter.hasCondition(condition))
            .and(ArticleFilter.isPriceInRange(minPrice, maxPrice));
            
        List<Article> articles = articleRepository.findAll(spec);

        return articles.stream()
            .map(this::convertToUserArticle)
            .collect(Collectors.toList());
    }

    private UserArticle convertToUserArticle(Article article) {
        String currentStatus = article.getStatus() != null ? article.getStatus().name() : "UNKNOWN";

        // Consultar dinámicamente en qué kits ha estado
        List<Kit> kits = articleRepository.findAllKitsWhereArticleHasBeen(article.getId());

        // Verificamos en qué tipo de kits está metido ahora mismo
        boolean isInActiveKit = kits.stream().anyMatch(k -> k.getStatus() == KitStatus.ACTIVE);
        boolean isInPaidKit = kits.stream().anyMatch(k -> k.getStatus() == KitStatus.PAID);

        String finalStatus;
        
        if (isInActiveKit) {
            finalStatus = "RENTED";
        } 
        else if (isInPaidKit) {
            finalStatus = "PAID";
        } 
        else {
            finalStatus = currentStatus;
        }

        LocalDate rentedUntil = null;
        List<Kit> activeOrPaidKits = kits.stream()
            .filter(k -> k.getStatus() == KitStatus.PAID || k.getStatus() == KitStatus.ACTIVE)
            .collect(Collectors.toList());

        if (!activeOrPaidKits.isEmpty()) {
            rentedUntil = activeOrPaidKits.stream()
                .map(Kit::getEndDate)
                .max(LocalDate::compareTo)
                .orElse(null);
        } else if ("RENTED".equals(finalStatus)) {
            rentedUntil = article.getAvailableUntil();
        }

        return new UserArticle(
                article.getId(),
                article.getTitle(),
                article.getImageUrl(),
                article.getPricePerMonth(),
                finalStatus,
                rentedUntil,
                article.getOwnerCommissionPromoCode()
        );
    }

    @Transactional
    public ReturnResponse processReturn(Long articleId, Long ownerId, ReturnRequest request) {
        // 0. Validación estricta de la condición
        if (!"GOOD".equalsIgnoreCase(request.condition()) && !"DAMAGED".equalsIgnoreCase(request.condition())) {
            throw new IllegalArgumentException("Condición no válida. Usa GOOD o DAMAGED.");
        }

        // 1. Validaciones iniciales
        Article article = articleRepository.findById(articleId)
            .orElseThrow(() -> new RuntimeException("Artículo no encontrado"));

        if (!article.getOwner().getId().equals(ownerId))
            throw new RuntimeException("Solo el propietario puede confirmar la devolución");

        // NUEVO: Verificar que el artículo esté actualmente alquilado
        if (article.getStatus() != ArticleStatus.RENTED) {
            throw new RuntimeException("El artículo ya ha sido devuelto o no está alquilado.");
        }

        // Buscar el kit activo. Si no hay, ya se devolvió todo el kit.
        Kit activeKit = kitRepository.findActiveKitByItemId(articleId, KitStatus.ACTIVE)
            .orElseThrow(() -> new RuntimeException("No se encontró un Kit activo para este artículo. Es posible que ya se haya cerrado."));

        if (activeKit.getEndDate() != null && activeKit.getEndDate().isAfter(LocalDate.now())) {
            throw new RuntimeException("No se puede procesar la devolución antes de la fecha de fin del contrato.");
        }

        Long tenantId = activeKit.getTenant().getId();
        String tenantEmail = activeKit.getTenant().getEmail();

        // 2. Actualizar estado del artículo individual
        if ("DAMAGED".equalsIgnoreCase(request.condition())) {
            article.setStatus(ArticleStatus.DAMAGED);
        } else {
            article.setStatus(ArticleStatus.AVAILABLE);
        }
        article.setAvailableUntil(null);
        articleRepository.save(article);

        // 3. Verificar si quedan artículos pendientes.
        // OJO: activeKit.getSnapshots() tiene el estado VIEJO de los artículos.
        // Al iterar, cuando buscamos el artículo recién guardado, su estado ya NO es RENTED.
        boolean isKitPending = activeKit.getSnapshots().stream()
            .anyMatch(snapshot -> {
                Long originalId = snapshot.getOriginalItemId();
                // Buscar el artículo actualizado en la base de datos
                Article a = articleRepository.findById(originalId).orElse(null);
                return a != null && a.getStatus() == ArticleStatus.RENTED;
            });

        Double amountProcessed = 0.0;
        String resolution = "PENDING_KITS_ITEMS";
        String message = "Artículo devuelto. La fianza se procesará cuando se devuelvan todos los artículos del kit.";

        // 4. Cierre del Kit
        if (!isKitPending) {
            activeKit.setStatus(KitStatus.FINISHED);
            kitRepository.save(activeKit);

            List<Article> damagedArticles = activeKit.getSnapshots().stream()
                .map(snapshot -> articleRepository.findById(snapshot.getOriginalItemId()).orElse(null))
                .filter(a -> a != null && a.getStatus() == ArticleStatus.DAMAGED)
                .collect(Collectors.toList());

            String finalCondition = damagedArticles.isEmpty() ? "GOOD" : "DAMAGED";

            try {
                amountProcessed = paymentService.processGuaranteeReturn(
                    activeKit.getId(),
                    ownerId,
                    tenantId,
                    finalCondition
                );

                if (!damagedArticles.isEmpty()) {
                    resolution = "DEPOSIT_RETAINED";
                    if (damagedArticles.size() < activeKit.getSnapshots().size()) {
                        message = "Se han retenido " + amountProcessed + "€ de la garantía por los artículos dañados y el resto se ha devuelto al arrendatario.";
                    } else {
                        message = "Artículo con daños. Se retiene la garantía de " + amountProcessed + "€ y se ha añadido al monedero del propietario.";
                    }
                } else {
                    resolution = "DEPOSIT_RETURNED";
                    message = "Artículo devuelto en buen estado. Se devuelve la garantía exacta (" + amountProcessed + "€) al monedero del arrendatario.";
                }
            } catch (Exception e) {
                throw new RuntimeException("Error procesando la devolución de la garantía: " + e.getMessage());
            }
        }

        // 5. Notificar
        if (article.getStatus() == ArticleStatus.AVAILABLE) {
            availabilityRequestService.notifyWatchersWhenAvailable(article);
        }

        return new ReturnResponse(
            articleId,
            tenantEmail,
            resolution,
            amountProcessed,
            message
        );
    }


    public long countArticlesByCategory(Long categoryId) {
        return articleRepository.countByCategoryId(categoryId);
    }

    public List<UserArticle> findLatestArticlesByCategory(Long categoryId) {
        List<Article> articles = articleRepository.findTop10ByCategoryIdOrderByIdDesc(categoryId);
        return articles.stream().map(article -> {
            boolean isRented = article.getStatus() != null &&
                               "RENTED".equalsIgnoreCase(article.getStatus().name());
            LocalDate rentedUntil = isRented ? article.getAvailableUntil() : null;
            return new UserArticle(
                article.getId(),
                article.getTitle(),
                article.getImageUrl(),
                article.getPricePerMonth(),
                article.getStatus() != null ? article.getStatus().name() : "UNKNOWN",
                rentedUntil,
                article.getOwnerCommissionPromoCode()
            );
        }).collect(Collectors.toList());
    }

    public List<ArticleNearbyDTO> findNearbyArticles(String targetCity, String country, double radiusKm) {
        CityCoordinatesDTO targetCoords = cityService.getCityCoordinates(targetCity, country);
        if (targetCoords == null) {
            return List.of();
        }

        List<String> availableCities = articleRepository.findDistinctCitiesByStatus(ArticleStatus.AVAILABLE);

        List<String> nearbyCities = availableCities.stream()
            .filter(city -> !city.equalsIgnoreCase(targetCity))
            .filter(city -> {
                CityCoordinatesDTO coords = cityService.getCityCoordinates(city, country);
                if (coords == null) return false;
                return haversineKm(targetCoords.lat(), targetCoords.lng(), coords.lat(), coords.lng()) <= radiusKm;
            })
            .collect(Collectors.toList());

        if (nearbyCities.isEmpty()) {
            return List.of();
        }

        List<Article> articles = articleRepository.findByStatusAndCityIn(ArticleStatus.AVAILABLE, nearbyCities);

        return articles.stream().map(article -> {
            CityCoordinatesDTO cityCoords = cityService.getCityCoordinates(article.getCity(), country);
            double lat = cityCoords != null ? cityCoords.lat() : 0.0;
            double lng = cityCoords != null ? cityCoords.lng() : 0.0;
            double distance = haversineKm(targetCoords.lat(), targetCoords.lng(), lat, lng);

            String categoryName = article.getCategory() != null ? article.getCategory().getName() : null;
            String ownerName = article.getOwner() != null ? article.getOwner().getName() : null;
            Long ownerId = article.getOwner() != null ? article.getOwner().getId() : null;

            return new ArticleNearbyDTO(
                article.getId(),
                "ARTICLE",
                article.getTitle(),
                article.getDescription(),
                article.getCity(),
                article.getPricePerMonth(),
                article.getAvailableFrom(),
                article.getAvailableUntil(),
                categoryName,
                article.getTotalUnits(),
                ownerId,
                ownerName,
                article.getStatus() != null ? article.getStatus().name() : null,
                article.getImageUrl(),
                lat,
                lng,
                Math.round(distance * 10.0) / 10.0
            );
        }).collect(Collectors.toList());
    }

    public List<ArticleNearbyDTO> findAllWithCoords(String country) {
        return findAllWithCoords(country, false);
    }

    public List<ArticleNearbyDTO> findAllWithCoords(String country, boolean includeRented) {
        List<Article> articles = includeRented
            ? articleRepository.findByStatusIn(List.of(ArticleStatus.AVAILABLE, ArticleStatus.RENTED))
            : articleRepository.findByStatus(ArticleStatus.AVAILABLE);
        return articles.stream().map(article -> {
            String resolvedCountry = article.getCountry() != null ? article.getCountry() : country;
            CityCoordinatesDTO coords = resolvedCountry != null
                ? cityService.getCityCoordinates(article.getCity(), resolvedCountry)
                : null;
            double lat = coords != null ? coords.lat() : 0.0;
            double lng = coords != null ? coords.lng() : 0.0;
            String categoryName = article.getCategory() != null ? article.getCategory().getName() : null;
            String ownerName = article.getOwner() != null ? article.getOwner().getName() : null;
            Long ownerId = article.getOwner() != null ? article.getOwner().getId() : null;
            return new ArticleNearbyDTO(
                article.getId(),
                "ARTICLE",
                article.getTitle(),
                article.getDescription(),
                article.getCity(),
                article.getPricePerMonth(),
                article.getAvailableFrom(),
                article.getAvailableUntil(),
                categoryName,
                article.getTotalUnits(),
                ownerId,
                ownerName,
                article.getStatus() != null ? article.getStatus().name() : null,
                article.getImageUrl(),
                lat,
                lng,
                0.0
            );
        }).collect(Collectors.toList());
    }

    private double haversineKm(double lat1, double lon1, double lat2, double lon2) {
        final double R = 6371.0;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                 + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                 * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    public List<ArticleRecordDTO> findArticleRecord(Long articleId) {
        List<Kit> kitsWhereArticleHasBeen = articleRepository.findAllKitsWhereArticleHasBeen(articleId);
        List<ArticleRecordDTO> articleRecord = kitsWhereArticleHasBeen.stream()
        .filter(k -> k.getStatus() != KitStatus.DRAFT && k.getStatus() != KitStatus.CANCELLED)
        .map(k -> {
            ArticleRecordDTO row = new ArticleRecordDTO();
            row.setTenantName(k.getTenant().getName());
            row.setTenantId(k.getTenant().getId());
            row.setStartDate(k.getStartDate());
            row.setEndDate(k.getEndDate());
            row.setStatus(k.getStatus());
            row.setCity(k.getCity());
            row.setCountry(k.getCountry());
            row.setKitId(k.getId());
            return row;
        }).collect(Collectors.toList());
        return articleRecord;
    }

    @Transactional
    public Article updateWithImage(Long id, Long ownerId, Article updateData, MultipartFile image) throws IOException {
        Article article = articleRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Artículo no encontrado"));

        if (article.getStatus() == ArticleStatus.RENTED || isArticleCurrentlyRented(id)) {
            throw new RuntimeException("El artículo está actualmente alquilado y no puede ser editado");
        }

        User owner = article.getOwner();
        if (owner == null || !owner.getId().equals(ownerId))
            throw new RuntimeException("Solo el propietario puede modificar este artículo");

        // Subir nueva imagen si viene
        if (image != null && !image.isEmpty()) {
            // Eliminar imagen anterior si existe
            if (article.getImageUrl() != null && !article.getImageUrl().isEmpty()) {
                try {
                    cloudinaryService.deleteImage(article.getImageUrl());
                } catch (IOException e) {
                    System.err.println("Aviso: Fallo al eliminar la imagen antigua: " + e.getMessage());
                }
            }
            
            // Subir nueva imagen
            String imageUrl = cloudinaryService.uploadImage(image);
            article.setImageUrl(imageUrl);
        }

        updateArticleFields(article, updateData);
        
        return articleRepository.save(article);
    }

    // Método auxiliar para no duplicar código
    private void updateArticleFields(Article article, Article updateData) {
        if (updateData.getTitle() != null) {
            if (updateData.getTitle().trim().isEmpty())
                throw new RuntimeException("Título requerido");
            article.setTitle(updateData.getTitle());
        }

        if (updateData.getDescription() != null) {
            if (updateData.getDescription().trim().isEmpty())
                throw new RuntimeException("Descripción requerida");
            if (updateData.getDescription().length() > 1000)
                throw new RuntimeException("La descripción no puede exceder 1000 caracteres");
            article.setDescription(updateData.getDescription());
        }

        if (updateData.getCity() != null) {
            if (updateData.getCity().trim().isEmpty())
                throw new RuntimeException("La ciudad no puede estar vacía");
            article.setCity(updateData.getCity());
        }

        if (updateData.getPricePerMonth() != null) {
            if (updateData.getPricePerMonth() < 0)
                throw new RuntimeException("El precio por mes debe ser un valor positivo");
            article.setPricePerMonth(updateData.getPricePerMonth());
        }

        Category resolvedCategory = article.getCategory();
        if (updateData.getCategory() != null && updateData.getCategory().getId() != null) {
            resolvedCategory = categoryRepository.findById(updateData.getCategory().getId())
                .orElseThrow(() -> new RuntimeException("Categoría no encontrada"));
            if (resolvedCategory.getStatus() == CategoryStatus.DRAFT) {
                throw new RuntimeException("No se puede asignar una categoría en estado Borrador a un artículo");
            }
            article.setCategory(resolvedCategory);
        }
        if (resolvedCategory != null && article.getPricePerMonth() != null) {
            double price = article.getPricePerMonth();
            if (price < resolvedCategory.getMinPrice() || price > resolvedCategory.getMaxPrice()) {
                throw new RuntimeException(
                    "El precio por mes debe estar entre " + resolvedCategory.getMinPrice() +
                    " y " + resolvedCategory.getMaxPrice() + " para esta categoría"
                );
            }
        }

        if (updateData.getTotalUnits() != null) {
            if (updateData.getTotalUnits() < 1)
                throw new RuntimeException("El número total de unidades debe ser mayor que 1");
            article.setTotalUnits(updateData.getTotalUnits());
        }

        if (updateData.getAvailableFrom() != null) {
            if (updateData.getAvailableFrom().isBefore(LocalDate.now()))
                throw new RuntimeException("La fecha de inicio de disponibilidad no puede ser pasada a la actual");
            article.setAvailableFrom(updateData.getAvailableFrom());
        }
        if (updateData.getAvailableUntil() != null) {
            article.setAvailableUntil(updateData.getAvailableUntil());
        }
        LocalDate from = article.getAvailableFrom();
        LocalDate until = article.getAvailableUntil();
        if (from != null && until != null && from.isAfter(until))
            throw new RuntimeException("La fecha de inicio de disponibilidad debe ser posterior o igual a la fecha de finalización");

        if (updateData.getPurchaseDate() != null) {
            validatePurchaseDate(updateData.getPurchaseDate());
            article.setPurchaseDate(updateData.getPurchaseDate());
        }

        if (updateData.getCondition() != null)
            article.setCondition(updateData.getCondition());
            
        if (updateData.getImageUrl() != null) 
            article.setImageUrl(updateData.getImageUrl());
    }

    private boolean isArticleCurrentlyRented(Long articleId) {
    List<Kit> kits = articleRepository.findAllKitsWhereArticleHasBeen(articleId);
    return kits.stream().anyMatch(k -> 
        k.getStatus() == KitStatus.PAID || k.getStatus() == KitStatus.ACTIVE
    );
}
    
    @Transactional
    public void autoCloseExpiredKitItems(Kit expiredKit) {
        Long tenantId = expiredKit.getTenant().getId();
        boolean hasDamagedItems = false;
        for (ItemMemento snapshot : expiredKit.getSnapshots()) {
            Long originalId = snapshot.getOriginalItemId();
            Article article = articleRepository.findById(originalId).orElse(null);
            
            if (article != null) {
                if (article.getStatus() == ArticleStatus.DAMAGED) {
                    hasDamagedItems = true;
                }
                else if (article.getStatus() == ArticleStatus.RENTED) {
                    article.setStatus(ArticleStatus.AVAILABLE);
                    article.setAvailableUntil(null);
                    articleRepository.save(article);
                    availabilityRequestService.notifyWatchersWhenAvailable(article);
                }
            }
        }

        expiredKit.setStatus(KitStatus.FINISHED);
        kitRepository.save(expiredKit);

        String finalCondition = hasDamagedItems ? "DAMAGED" : "GOOD";
        Long effectiveOwnerId = expiredKit.getSnapshots().get(0).getKit().getTenant().getId(); 
        
        try {
            paymentService.processGuaranteeReturn(
                expiredKit.getId(),
                effectiveOwnerId,
                tenantId,
                finalCondition
            );
            System.out.println("Kit " + expiredKit.getId() + " auto-cerrado tras 7 días. Condición final: " + finalCondition);
        } catch (Exception e) {
            System.err.println("Error procesando fianza automática para Kit " + expiredKit.getId() + ": " + e.getMessage());
        }
    }
}
