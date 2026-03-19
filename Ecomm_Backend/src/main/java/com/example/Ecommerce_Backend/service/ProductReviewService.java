package com.example.Ecommerce_Backend.service;

import com.example.Ecommerce_Backend.dto.ProductReviewRequestDTO;
import com.example.Ecommerce_Backend.dto.ProductReviewResponseDTO;
import com.example.Ecommerce_Backend.dto.ProductReviewsResponseDTO;
import com.example.Ecommerce_Backend.exception.BadRequestException;
import com.example.Ecommerce_Backend.exception.ResourceNotFoundException;
import com.example.Ecommerce_Backend.model.ProductEntity;
import com.example.Ecommerce_Backend.model.ProductReviewEntity;
import com.example.Ecommerce_Backend.model.UserEntity;
import com.example.Ecommerce_Backend.repository.ProductRepository;
import com.example.Ecommerce_Backend.repository.ProductReviewRepository;
import com.example.Ecommerce_Backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductReviewService {

    private final ProductReviewRepository productReviewRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public ProductReviewsResponseDTO getReviewsForProduct(Long productId) {
        if (!productRepository.existsById(productId)) {
            throw new ResourceNotFoundException("Product not found");
        }

        UserEntity currentUser = getCurrentUserOptional().orElse(null);
        List<ProductReviewEntity> reviews = productReviewRepository.findByProductIdOrderByUpdatedAtDesc(productId);
        Map<Long, ProductRatingStats> ratingMap = buildRatingMap(List.of(productId));
        ProductRatingStats stats = ratingMap.getOrDefault(productId, ProductRatingStats.EMPTY);

        List<ProductReviewResponseDTO> reviewDTOs = reviews.stream()
                .map(review -> mapToResponse(review, currentUser))
                .toList();

        return ProductReviewsResponseDTO.builder()
                .averageRating(stats.averageRating())
                .reviewCount(stats.reviewCount())
                .reviews(reviewDTOs)
                .build();
    }

    @Transactional
    public ProductReviewResponseDTO upsertReview(Long productId, ProductReviewRequestDTO requestDTO) {
        if (requestDTO.getRating() == null) {
            throw new BadRequestException("Rating is required");
        }

        UserEntity user = getCurrentUser();
        ProductEntity product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        ProductReviewEntity review = productReviewRepository.findByProductIdAndUserId(productId, user.getId())
                .orElseGet(() -> ProductReviewEntity.builder()
                        .product(product)
                        .user(user)
                        .build());

        review.setRating(requestDTO.getRating());
        review.setComment(normalizeComment(requestDTO.getComment()));

        ProductReviewEntity saved = productReviewRepository.save(review);
        return mapToResponse(saved, user);
    }

    @Transactional
    public void deleteMyReview(Long productId) {
        UserEntity user = getCurrentUser();
        ProductReviewEntity review = productReviewRepository.findByProductIdAndUserId(productId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Review not found"));

        productReviewRepository.delete(review);
    }

    public Map<Long, ProductRatingStats> buildRatingMap(List<Long> productIds) {
        if (productIds == null || productIds.isEmpty()) {
            return Map.of();
        }

        return productReviewRepository.summarizeRatingsByProductIds(productIds).stream()
                .collect(Collectors.toMap(
                        ProductReviewRepository.ProductRatingSummary::getProductId,
                        summary -> {
                            BigDecimal average = BigDecimal
                                    .valueOf(summary.getAverageRating() == null ? 0.0 : summary.getAverageRating())
                                    .setScale(1, RoundingMode.HALF_UP);
                            return new ProductRatingStats(average.doubleValue(), summary.getReviewCount());
                        }
                ));
    }

    private ProductReviewResponseDTO mapToResponse(ProductReviewEntity review, UserEntity currentUser) {
        boolean mine = currentUser != null && review.getUser().getId().equals(currentUser.getId());

        return ProductReviewResponseDTO.builder()
                .reviewId(review.getId())
                .userId(review.getUser().getId())
                .userName(review.getUser().getName())
                .rating(review.getRating())
                .comment(review.getComment())
                .createdAt(review.getCreatedAt())
                .updatedAt(review.getUpdatedAt())
                .mine(mine)
                .build();
    }

    private String normalizeComment(String comment) {
        if (comment == null) {
            return null;
        }
        String trimmed = comment.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private UserEntity getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
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
        return userRepository.findByEmail(email);
    }

    public record ProductRatingStats(Double averageRating, Long reviewCount) {
        static final ProductRatingStats EMPTY = new ProductRatingStats(0.0, 0L);
    }
}
