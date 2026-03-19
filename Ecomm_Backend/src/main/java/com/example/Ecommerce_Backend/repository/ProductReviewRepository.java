package com.example.Ecommerce_Backend.repository;

import com.example.Ecommerce_Backend.model.ProductReviewEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProductReviewRepository extends JpaRepository<ProductReviewEntity, Long> {

    interface ProductRatingSummary {
        Long getProductId();
        Double getAverageRating();
        Long getReviewCount();
    }

    List<ProductReviewEntity> findByProductIdOrderByUpdatedAtDesc(Long productId);

    Optional<ProductReviewEntity> findByProductIdAndUserId(Long productId, Long userId);

    @Query("""
            select r.product.id as productId,
                   avg(r.rating) as averageRating,
                   count(r.id) as reviewCount
            from ProductReviewEntity r
            where r.product.id in :productIds
            group by r.product.id
            """)
    List<ProductRatingSummary> summarizeRatingsByProductIds(@Param("productIds") Collection<Long> productIds);
}
