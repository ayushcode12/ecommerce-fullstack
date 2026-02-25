package com.example.Ecommerce_Backend.repository;

import com.example.Ecommerce_Backend.model.CartEntity;
import com.example.Ecommerce_Backend.model.CartItemEntity;
import com.example.Ecommerce_Backend.model.ProductEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CartItemRepository extends JpaRepository<CartItemEntity, Long> {

    Optional<CartItemEntity> findByCartAndProduct(CartEntity cart, ProductEntity product);

    List<CartItemEntity> findByCart(CartEntity cart);

}
