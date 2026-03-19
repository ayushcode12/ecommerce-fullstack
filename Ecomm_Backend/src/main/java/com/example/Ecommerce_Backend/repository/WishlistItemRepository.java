package com.example.Ecommerce_Backend.repository;

import com.example.Ecommerce_Backend.model.UserEntity;
import com.example.Ecommerce_Backend.model.WishlistItemEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Set;

@Repository
public interface WishlistItemRepository extends JpaRepository<WishlistItemEntity, Long> {

    boolean existsByUserAndProductId(UserEntity user, Long productId);

    void deleteByUserAndProductId(UserEntity user, Long productId);

    List<WishlistItemEntity> findByUserOrderByCreatedAtDesc(UserEntity user);

    @Query("select w.product.id from WishlistItemEntity w where w.user.id = :userId")
    Set<Long> findProductIdsByUserId(@Param("userId") Long userId);
}
