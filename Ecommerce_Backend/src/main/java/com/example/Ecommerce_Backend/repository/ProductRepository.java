package com.example.Ecommerce_Backend.repository;

import com.example.Ecommerce_Backend.model.ProductEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<ProductEntity, Long> {

    public Page<ProductEntity> findByNameContainingIgnoreCase(String keyword, Pageable pageable);

    public Page<ProductEntity> findByCategoryId(Long categoryId, Pageable pageable);

    public Page<ProductEntity> findByNameContainingIgnoreCaseAndCategoryId(String keyword, Long categoryId,  Pageable pageable);

}
