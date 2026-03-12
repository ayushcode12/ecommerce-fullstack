package com.example.Ecommerce_Backend.repository;

import com.example.Ecommerce_Backend.model.OrderEntity;
import com.example.Ecommerce_Backend.model.OrderStatus;
import com.example.Ecommerce_Backend.model.UserEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<OrderEntity, Long> {

    List<OrderEntity> findByUser(UserEntity user);

    Page<OrderEntity> findByStatus(OrderStatus status, Pageable pageable);

    Page<OrderEntity> findByUserEmailContainingIgnoreCase(String email, Pageable pageable);

    Page<OrderEntity> findByStatusAndUserEmailContainingIgnoreCase(OrderStatus status, String email, Pageable pageable);

    List<OrderEntity> findTop5ByOrderByCreatedAtDesc();

    Long countByStatus(OrderStatus status);
}
