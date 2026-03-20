package com.example.Ecommerce_Backend.service;

import com.example.Ecommerce_Backend.dto.ProductRequestDTO;
import com.example.Ecommerce_Backend.dto.ProductResponseDTO;
import com.example.Ecommerce_Backend.exception.BadRequestException;
import com.example.Ecommerce_Backend.exception.ResourceNotFoundException;
import com.example.Ecommerce_Backend.model.CategoryEntity;
import com.example.Ecommerce_Backend.model.ProductEntity;
import com.example.Ecommerce_Backend.model.UserEntity;
import com.example.Ecommerce_Backend.repository.CategoryRepository;
import com.example.Ecommerce_Backend.repository.ProductRepository;
import com.example.Ecommerce_Backend.repository.UserRepository;
import com.example.Ecommerce_Backend.repository.WishlistItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {

    private static final Set<String> ALLOWED_SORT_FIELDS = Set.of("id", "name", "price", "stockQuantity", "createdAt");

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final ProductReviewService productReviewService;
    private final WishlistItemRepository wishlistItemRepository;
    private final UserRepository userRepository;
    private final CloudinaryImageService cloudinaryImageService;

    public Page<ProductResponseDTO> getAllProducts(int page, int size, String sortBy, String direction, String keyword, Long categoryId) {
        String normalizedSortBy = sortBy == null ? "id" : sortBy.trim();
        if (!ALLOWED_SORT_FIELDS.contains(normalizedSortBy)) {
            throw new BadRequestException("Invalid sortBy. Allowed values: " + ALLOWED_SORT_FIELDS);
        }

        String normalizedDirection = direction == null ? "asc" : direction.trim().toLowerCase();
        if (!normalizedDirection.equals("asc") && !normalizedDirection.equals("desc")) {
            throw new BadRequestException("Invalid direction. Allowed values: asc, desc");
        }

        Sort sort = normalizedDirection.equals("desc")
                ? Sort.by(normalizedSortBy).descending()
                : Sort.by(normalizedSortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<ProductEntity> productPage;

        if(keyword != null && !keyword.trim().isEmpty() && categoryId != null) {
            productPage = productRepository.findByNameContainingIgnoreCaseAndCategoryId(keyword, categoryId, pageable);
        }
        else if (keyword != null && !keyword.trim().isEmpty()) {
            productPage = productRepository.findByNameContainingIgnoreCase(keyword, pageable);
        }

        else if(categoryId != null) {
            productPage = productRepository.findByCategoryId(categoryId, pageable);
        }

        else {
            productPage = productRepository.findAll(pageable);
        }

        List<ProductEntity> products = productPage.getContent();
        ProductViewContext context = buildViewContext(products);
        List<ProductResponseDTO> response = products.stream()
                .map(product -> mapToResponseDTO(product, context))
                .toList();

        return new PageImpl<>(response, pageable, productPage.getTotalElements());
    }

    public ProductResponseDTO createProduct(ProductRequestDTO request) {
        CategoryEntity category = categoryRepository.findById(request.getCategoryId())
            .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        ProductEntity product = ProductEntity.builder()
            .name(request.getName())
            .description(request.getDescription())
            .price(request.getPrice())
            .stockQuantity(request.getStockQuantity())
            .imageUrl(resolvePrimaryImage(request.getImageUrl(), request.getImageUrls()))
            .imageUrls(resolveImageUrls(request.getImageUrl(), request.getImageUrls()))
            .category(category)
            .build();

        ProductEntity savedProduct = productRepository.save(product);

        return mapToResponseDTO(savedProduct, buildViewContext(List.of(savedProduct)));
    }

    public ProductResponseDTO getProductById(Long id) {
        ProductEntity product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        ProductViewContext context = buildViewContext(List.of(product));
        return mapToResponseDTO(product, context);
    }

    public ProductResponseDTO updateProduct(Long id, ProductRequestDTO request) {
        ProductEntity product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        CategoryEntity category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setStockQuantity(request.getStockQuantity());
        product.setImageUrl(resolvePrimaryImage(request.getImageUrl(), request.getImageUrls()));
        product.setImageUrls(resolveImageUrls(request.getImageUrl(), request.getImageUrls()));
        product.setCategory(category);

        ProductEntity updated = productRepository.save(product);
        return mapToResponseDTO(updated, buildViewContext(List.of(updated)));
    }

    public void deleteProduct(Long id) {
        ProductEntity product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        List<String> imageUrls = resolveImageUrls(product);
        productRepository.delete(product);

        if (!imageUrls.isEmpty()) {
            try {
                cloudinaryImageService.deleteImagesByUrls(imageUrls);
            } catch (Exception ignored) {
                // Product deletion should not fail if Cloudinary cleanup fails.
            }
        }
    }

    private ProductResponseDTO mapToResponseDTO(ProductEntity product, ProductViewContext context) {
        ProductReviewService.ProductRatingStats rating = context.ratingByProductId()
                .getOrDefault(product.getId(), ProductReviewService.ProductRatingStats.EMPTY);
        boolean inWishlist = context.wishlistProductIds().contains(product.getId());

        return ProductResponseDTO.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .price(product.getPrice())
                .stockQuantity(product.getStockQuantity())
                .imageUrl(resolvePrimaryImage(product))
                .imageUrls(resolveImageUrls(product))
                .categoryName(resolveCategoryName(product))
                .averageRating(rating.averageRating())
                .reviewCount(rating.reviewCount())
                .inWishlist(inWishlist)
                .build();
    }

    private ProductViewContext buildViewContext(List<ProductEntity> products) {
        if (products == null || products.isEmpty()) {
            return ProductViewContext.empty();
        }

        List<Long> productIds = products.stream().map(ProductEntity::getId).toList();
        Map<Long, ProductReviewService.ProductRatingStats> ratingMap = productReviewService.buildRatingMap(productIds);
        Set<Long> wishlistProductIds = Collections.emptySet();

        Optional<UserEntity> currentUser = getCurrentUserOptional();
        if (currentUser.isPresent()) {
            wishlistProductIds = new HashSet<>(wishlistItemRepository.findProductIdsByUserId(currentUser.get().getId()));
        }

        return new ProductViewContext(ratingMap, wishlistProductIds);
    }

    private String resolvePrimaryImage(ProductEntity product) {
        String preferred = normalizeSingleImageUrl(product.getImageUrl());
        if (preferred != null) {
            return preferred;
        }

        List<String> images = normalizeImageUrls(product.getImageUrls());
        return images.isEmpty() ? null : images.get(0);
    }

    private List<String> resolveImageUrls(ProductEntity product) {
        return mergePrimaryImage(product.getImageUrl(), product.getImageUrls());
    }

    private String resolvePrimaryImage(String imageUrl, List<String> imageUrls) {
        String preferred = normalizeSingleImageUrl(imageUrl);
        if (preferred != null) {
            return preferred;
        }

        List<String> normalized = normalizeImageUrls(imageUrls);
        return normalized.isEmpty() ? null : normalized.get(0);
    }

    private List<String> resolveImageUrls(String imageUrl, List<String> imageUrls) {
        return mergePrimaryImage(imageUrl, imageUrls);
    }

    private List<String> normalizeImageUrls(List<String> imageUrls) {
        if (imageUrls == null) {
            return new ArrayList<>();
        }

        return imageUrls.stream()
                .filter(Objects::nonNull)
                .map(String::trim)
                .filter(url -> !url.isBlank())
                .distinct()
                .collect(Collectors.toCollection(ArrayList::new));
    }

    private List<String> mergePrimaryImage(String imageUrl, List<String> imageUrls) {
        List<String> normalized = normalizeImageUrls(imageUrls);
        String preferred = normalizeSingleImageUrl(imageUrl);

        if (preferred == null) {
            return normalized;
        }

        normalized.removeIf(preferred::equals);
        normalized.add(0, preferred);
        return normalized;
    }

    private String normalizeSingleImageUrl(String imageUrl) {
        if (imageUrl == null) {
            return null;
        }
        String trimmed = imageUrl.trim();
        return trimmed.isBlank() ? null : trimmed;
    }

    private Optional<UserEntity> getCurrentUserOptional() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return Optional.empty();
        }

        String email = authentication.getName();
        if (email == null || email.isBlank() || "anonymousUser".equalsIgnoreCase(email)) {
            return Optional.empty();
        }

        return userRepository.findByEmailIgnoreCase(email);
    }

    private String resolveCategoryName(ProductEntity product) {
        if (product.getCategory() == null) {
            return null;
        }

        try {
            return product.getCategory().getName();
        } catch (Exception ignored) {
            Long categoryId = product.getCategory().getId();
            if (categoryId == null) {
                return null;
            }
            return categoryRepository.findById(categoryId)
                    .map(CategoryEntity::getName)
                    .orElse(null);
        }
    }

    private record ProductViewContext(
            Map<Long, ProductReviewService.ProductRatingStats> ratingByProductId,
            Set<Long> wishlistProductIds
    ) {
        static ProductViewContext empty() {
            return new ProductViewContext(Map.of(), Set.of());
        }
    }
}
