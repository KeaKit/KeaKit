package com.example.demo.service;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.domain.Specification;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

import com.example.demo.dto.ArticleNearbyDTO;
import com.example.demo.dto.CityCoordinatesDTO;
import com.example.demo.dto.ArticleRecordDTO;
import com.example.demo.dto.ReturnRequest;
import com.example.demo.dto.ReturnResponse;
import com.example.demo.dto.UserArticle;
import com.example.demo.model.Article;
import com.example.demo.model.ArticleFilter;
import com.example.demo.model.User;
import com.example.demo.model.Category;
import com.example.demo.model.ArticleStatus;
import com.example.demo.model.Kit;
import com.example.demo.model.KitStatus;
import com.example.demo.repository.ArticleRepository;
import com.example.demo.repository.KitRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.repository.CategoryRepository;

@Service
public class ArticleService {

    private final ArticleRepository articleRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final PaymentService paymentService;
    private final KitRepository kitRepository;
    private final DefaultKitService defaultKitService;
    private final CloudinaryService cloudinaryService;
    private final CityService cityService;
    private final ArticleAvailabilityRequestService availabilityRequestService;

    public ArticleService(ArticleRepository articleRepository, UserRepository userRepository,
                          KitRepository kitRepository, CategoryRepository categoryRepository,
                          PaymentService paymentService,
                          CloudinaryService cloudinaryService, DefaultKitService defaultKitService,
                          CityService cityService, ArticleAvailabilityRequestService availabilityRequestService) {
        this.articleRepository = articleRepository;
        this.userRepository = userRepository;
        this.kitRepository = kitRepository;
        this.categoryRepository = categoryRepository;
        this.cloudinaryService = cloudinaryService;
        this.defaultKitService = defaultKitService;
        this.paymentService = paymentService;
        this.cityService = cityService;
        this.availabilityRequestService = availabilityRequestService; // Se inyecta manualmente para evitar dependencia circular
    }



    public Article createWithImage(Article article, MultipartFile image, Long ownerId, Long categoryId) throws IOException {
        User owner = userRepository.findById(ownerId)
            .orElseThrow(() -> new RuntimeException("Owner not found"));

        Category category = categoryRepository.findById(categoryId)
            .orElseThrow(() -> new RuntimeException("Category not found"));

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
            .orElseThrow(() -> new RuntimeException("Article not found"));
    }

    public Article save(Article article) {
        if (article == null) throw new RuntimeException("Article payload is required");

        if (article.getTitle() == null || article.getTitle().trim().isEmpty())
            throw new RuntimeException("Title is required");

        if (article.getDescription() == null || article.getDescription().trim().isEmpty())
            throw new RuntimeException("Description is required");
        if (article.getDescription().length() > 1000)
            throw new RuntimeException("Description cannot exceed 1000 characters");

        if (article.getCity() == null || article.getCity().trim().isEmpty())
            throw new RuntimeException("City is required");

        if (article.getPricePerMonth() == null || article.getPricePerMonth() < 0)
            throw new RuntimeException("pricePerMonth must be >= 0");

        if (article.getCategory() != null && article.getCategory().getId() != null) {
            Category category = categoryRepository.findById(article.getCategory().getId())
                .orElseThrow(() -> new RuntimeException("Category not found"));
            double price = article.getPricePerMonth();
            if (price < category.getMinPrice() || price > category.getMaxPrice()) {
                throw new RuntimeException(
                    "pricePerMonth must be between " + category.getMinPrice() +
                    " and " + category.getMaxPrice() + " for this category"
                );
            }
        }

        if (article.getTotalUnits() == null || article.getTotalUnits() < 1)
            article.setTotalUnits(1);

        LocalDate from = article.getAvailableFrom();
        if (from != null && from.isBefore(LocalDate.now()))
            throw new RuntimeException("availableFrom cannot be in the past");

        LocalDate until = article.getAvailableUntil();
        if (from != null && until != null && from.isAfter(until))
            throw new RuntimeException("availableFrom must be before or equal to availableUntil");

        User owner = article.getOwner();
        if (owner == null || owner.getId() == null)
            throw new RuntimeException("Owner (with valid id) is required");
        userRepository.findById(owner.getId())
            .orElseThrow(() -> new RuntimeException("Owner not found"));
        defaultKitService.removeItemFromAllDefaultKits(article.getId());
        return articleRepository.save(article);
    }

    public Article update(Long id, Long ownerId, Article updateData) {
        Article article = articleRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Article not found"));

        if (article.getStatus() == ArticleStatus.RENTED)
            throw new RuntimeException("Article is currently rented and cannot be edited");

        User owner = article.getOwner();
        if (owner == null || !owner.getId().equals(ownerId))
            throw new RuntimeException("Only the owner can modify this article");

        if (updateData.getStatus() != null)
            throw new RuntimeException("Cannot change status via update; use toggleRent endpoint");

        updateArticleFields(article, updateData);

        return articleRepository.save(article);
    }

    public void deleteById(Long id, Long ownerId) {
        Article article = articleRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Article not found"));

        if (article.getStatus() == ArticleStatus.RENTED)
            throw new RuntimeException("Article is currently rented and cannot be deleted");

        User owner = article.getOwner();
        if (owner == null || !owner.getId().equals(ownerId))
            throw new RuntimeException("Only the owner can delete this article");

        if (article.getImageUrl() != null && !article.getImageUrl().isEmpty()) {
            try {
                cloudinaryService.deleteImage(article.getImageUrl());
            } catch (IOException e) {
                System.err.println("Warning: Failed to delete image from Cloudinary: " + e.getMessage());
            }
        }

        articleRepository.deleteById(id);
    }

    public Article toggleRent(Long id, Long ownerId) {
        Article article = articleRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Article not found"));

        User owner = article.getOwner();
        if (owner == null || !owner.getId().equals(ownerId))
            throw new RuntimeException("Only the owner can change rental status");

        ArticleStatus status = article.getStatus();

        if (status == ArticleStatus.INACTIVE)
            throw new RuntimeException("Inactive articles cannot be rented");

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
        boolean isRented = article.getStatus() != null &&
                "RENTED".equalsIgnoreCase(article.getStatus().name());
        LocalDate rentedUntil = isRented ? article.getAvailableUntil() : null;
        
        return new UserArticle(
                article.getId(),
                article.getTitle(),
                article.getImageUrl(),
                article.getPricePerMonth(),
                article.getStatus() != null ? article.getStatus().name() : "UNKNOWN",
                rentedUntil
        );
    }

    @Transactional
    public ReturnResponse processReturn(Long articleId, Long ownerId, ReturnRequest request) {
        Article article = articleRepository.findById(articleId)
            .orElseThrow(() -> new RuntimeException("Article not found"));

        if (!article.getOwner().getId().equals(ownerId))
            throw new RuntimeException("Only the owner can confirm the return");

        if (article.getStatus() != ArticleStatus.RENTED)
            throw new RuntimeException("This article is not currently rented");

        Kit activeKit = kitRepository.findActiveKitByItemId(articleId, KitStatus.ACTIVE)
            .orElseThrow(() -> new RuntimeException("No active Kit found for this article"));

        Long tenantId = activeKit.getTenant().getId();
        String tenantEmail = activeKit.getTenant().getEmail();
        
        Double amountProcessed;
        try {
            // Delegamos TODA la lógica de transacciones al PaymentService
            amountProcessed = paymentService.processGuaranteeReturn(
                activeKit.getId(), 
                ownerId, 
                tenantId, 
                request.condition()
            );
        } catch (Exception e) {
            throw new RuntimeException("Error procesando la devolución de la garantía: " + e.getMessage());
        }

        String resolution;
        String message;

        if ("GOOD".equalsIgnoreCase(request.condition())) {
            resolution = "DEPOSIT_RETURNED";
            message = "Artículo devuelto en buen estado. Se devuelve la garantía exacta (" + amountProcessed + "€) al monedero del arrendatario.";
        } else if ("DAMAGED".equalsIgnoreCase(request.condition())) {
            resolution = "DEPOSIT_RETAINED";
            message = "Artículo con daños. Se retiene la garantía de " + amountProcessed + "€ y se ha añadido al monedero del propietario.";
        } else {
            throw new IllegalArgumentException("Condición no válida. Usa GOOD o DAMAGED.");
        }

        // Liberar el artículo
        article.setStatus(ArticleStatus.AVAILABLE);
        article.setAvailableUntil(null);
        Article updatedArticle = articleRepository.save(article);
        availabilityRequestService.notifyWatchersWhenAvailable(updatedArticle);

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
                rentedUntil
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
        List<Article> articles = articleRepository.findByStatus(ArticleStatus.AVAILABLE);
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
            .orElseThrow(() -> new RuntimeException("Article not found"));

        if (article.getStatus() == ArticleStatus.RENTED)
            throw new RuntimeException("Article is currently rented and cannot be edited");

        User owner = article.getOwner();
        if (owner == null || !owner.getId().equals(ownerId))
            throw new RuntimeException("Only the owner can modify this article");

        // Subir nueva imagen si viene
        if (image != null && !image.isEmpty()) {
            // Eliminar imagen anterior si existe
            if (article.getImageUrl() != null && !article.getImageUrl().isEmpty()) {
                try {
                    cloudinaryService.deleteImage(article.getImageUrl());
                } catch (IOException e) {
                    System.err.println("Warning: Failed to delete old image: " + e.getMessage());
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
                throw new RuntimeException("Title cannot be empty");
            article.setTitle(updateData.getTitle());
        }

        if (updateData.getDescription() != null) {
            if (updateData.getDescription().trim().isEmpty())
                throw new RuntimeException("Description cannot be empty");
            if (updateData.getDescription().length() > 1000)
                throw new RuntimeException("Description cannot exceed 1000 characters");
            article.setDescription(updateData.getDescription());
        }

        if (updateData.getCity() != null) {
            if (updateData.getCity().trim().isEmpty())
                throw new RuntimeException("City cannot be empty");
            article.setCity(updateData.getCity());
        }

        if (updateData.getPricePerMonth() != null) {
            if (updateData.getPricePerMonth() < 0)
                throw new RuntimeException("pricePerMonth must be >= 0");
            article.setPricePerMonth(updateData.getPricePerMonth());
        }

        Category resolvedCategory = article.getCategory();
        if (updateData.getCategory() != null && updateData.getCategory().getId() != null) {
            resolvedCategory = categoryRepository.findById(updateData.getCategory().getId())
                .orElseThrow(() -> new RuntimeException("Category not found"));
            article.setCategory(resolvedCategory);
        }
        if (resolvedCategory != null && article.getPricePerMonth() != null) {
            double price = article.getPricePerMonth();
            if (price < resolvedCategory.getMinPrice() || price > resolvedCategory.getMaxPrice()) {
                throw new RuntimeException(
                    "pricePerMonth must be between " + resolvedCategory.getMinPrice() +
                    " and " + resolvedCategory.getMaxPrice() + " for this category"
                );
            }
        }

        if (updateData.getTotalUnits() != null) {
            if (updateData.getTotalUnits() < 1)
                throw new RuntimeException("totalUnits must be >= 1");
            article.setTotalUnits(updateData.getTotalUnits());
        }

        if (updateData.getAvailableFrom() != null) {
            if (updateData.getAvailableFrom().isBefore(LocalDate.now()))
                throw new RuntimeException("availableFrom cannot be in the past");
            article.setAvailableFrom(updateData.getAvailableFrom());
        }
        if (updateData.getAvailableUntil() != null) {
            article.setAvailableUntil(updateData.getAvailableUntil());
        }
        LocalDate from = article.getAvailableFrom();
        LocalDate until = article.getAvailableUntil();
        if (from != null && until != null && from.isAfter(until))
            throw new RuntimeException("availableFrom must be before or equal to availableUntil");

        if (updateData.getPurchaseDate() != null) 
            article.setPurchaseDate(updateData.getPurchaseDate());

        if (updateData.getCondition() != null) 
            article.setCondition(updateData.getCondition());
            
        if (updateData.getImageUrl() != null) 
            article.setImageUrl(updateData.getImageUrl());
    }
}