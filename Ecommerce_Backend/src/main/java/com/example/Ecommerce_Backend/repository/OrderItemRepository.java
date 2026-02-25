package com.example.Ecommerce_Backend.repository;

import com.example.Ecommerce_Backend.model.OrderEntity;
import com.example.Ecommerce_Backend.model.OrderItemEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderItemRepository extends JpaRepository<OrderItemEntity, Long> {
    List<OrderItemEntity> findByOrder(OrderEntity order);

}
