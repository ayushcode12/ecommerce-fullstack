package com.example.Ecommerce_Backend.service;

import com.example.Ecommerce_Backend.dto.WishlistItemResponseDTO;
import com.example.Ecommerce_Backend.exception.ResourceNotFoundException;
import com.example.Ecommerce_Backend.model.ProductEntity;
import com.example.Ecommerce_Backend.model.UserEntity;
import com.example.Ecommerce_Backend.model.WishlistItemEntity;
import com.example.Ecommerce_Backend.repository.ProductRepository;
import com.example.Ecommerce_Backend.repository.UserRepository;
import com.example.Ecommerce_Backend.repository.WishlistItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class WishlistService {

    private final WishlistItemRepository wishlistItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final ProductReviewService productReviewService;

    public List<WishlistItemResponseDTO> getMyWishlist() {
        UserEntity user = getCurrentUser();
        List<WishlistItemEntity> items = wishlistItemRepository.findByUserOrderByCreatedAtDesc(user);
        List<Long> productIds = items.stream().map(item -> item.getProduct().getId()).toList();
        Map<Long, ProductReviewService.ProductRatingStats> ratingMap = productReviewService.buildRatingMap(productIds);

        return items.stream()
                .map(item -> {
                    ProductEntity product = item.getProduct();
                    ProductReviewService.ProductRatingStats stats = ratingMap.getOrDefault(
                            product.getId(),
                            ProductReviewService.ProductRatingStats.EMPTY
                    );
                    return WishlistItemResponseDTO.builder()
                            .productId(product.getId())
                            .name(product.getName())
                            .description(product.getDescription())
                            .price(product.getPrice())
                            .categoryName(product.getCategory().getName())
                            .imageUrl(product.getImageUrl())
                            .imageUrls(product.getImageUrls())
                            .stockQuantity(product.getStockQuantity())
                            .averageRating(stats.averageRating())
                            .reviewCount(stats.reviewCount())
                            .addedAt(item.getCreatedAt())
                            .build();
                })
                .toList();
    }

    public Set<Long> getMyWishlistProductIds() {
        UserEntity user = getCurrentUser();
        return wishlistItemRepository.findProductIdsByUserId(user.getId());
    }

    @Transactional
    public void addToWishlist(Long productId) {
        UserEntity user = getCurrentUser();
        if (wishlistItemRepository.existsByUserAndProductId(user, productId)) {
            return;
        }

        ProductEntity product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        WishlistItemEntity item = WishlistItemEntity.builder()
                .user(user)
                .product(product)
                .build();
        wishlistItemRepository.save(item);
    }

    @Transactional
    public void removeFromWishlist(Long productId) {
        UserEntity user = getCurrentUser();
        wishlistItemRepository.deleteByUserAndProductId(user, productId);
    }

    private UserEntity getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
}
