package com.example.Ecommerce_Backend.repository;

import com.example.Ecommerce_Backend.model.CartEntity;
import com.example.Ecommerce_Backend.model.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CartRepository extends JpaRepository<CartEntity, Long> {

    Optional<CartEntity> findByUser(UserEntity user);

}
