package com.example.Ecommerce_Backend.repository;

import com.example.Ecommerce_Backend.model.OrderEntity;
import com.example.Ecommerce_Backend.model.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<OrderEntity, Long> {

    List<OrderEntity> findByUser(UserEntity user);

}
