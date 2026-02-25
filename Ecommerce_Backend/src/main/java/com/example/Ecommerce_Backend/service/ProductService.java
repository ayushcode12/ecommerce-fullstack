package com.example.Ecommerce_Backend.service;

import com.example.Ecommerce_Backend.dto.ProductRequestDTO;
import com.example.Ecommerce_Backend.dto.ProductResponseDTO;
import com.example.Ecommerce_Backend.model.CategoryEntity;
import com.example.Ecommerce_Backend.model.ProductEntity;
import com.example.Ecommerce_Backend.repository.CategoryRepository;
import com.example.Ecommerce_Backend.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    public Page<ProductResponseDTO> getAllProducts(int  page, int size, String sortBy, String direction, String keyword, Long categoryId) {

        Sort sort = direction.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<ProductEntity> productPage;

        if(keyword != null && !keyword.trim().isEmpty() && categoryId != null) {
            productPage = productRepository.findByNameContainingIgnoreCaseAndCategoryId(keyword, categoryId, pageable);
        }
        else if (keyword != null && !keyword.trim().isEmpty()) {
            productPage = productRepository.findByNameContainingIgnoreCase(keyword, pageable);
        }

        else if(categoryId != null) {
            productPage = productRepository.findByCategoryId(categoryId, pageable);
        }

        else {
            productPage = productRepository.findAll(pageable);
        }

        return productPage.map(product -> ProductResponseDTO.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .price(product.getPrice())
                .stockQuantity(product.getStockQuantity())
                .imageUrl(product.getImageUrl())
                .categoryName(product.getCategory().getName())
                .build());
    }

    public ProductResponseDTO createProduct(ProductRequestDTO request) {
        CategoryEntity category = categoryRepository.findById(request.getCategoryId())
            .orElseThrow(() -> new RuntimeException("Category not found"));
        ProductEntity product = ProductEntity.builder()
            .name(request.getName())
            .description(request.getDescription())
            .price(request.getPrice())
            .stockQuantity(request.getStockQuantity())
            .imageUrl(request.getImageUrl())
            .category(category)
            .build();

        ProductEntity savedProduct = productRepository.save(product);

        return ProductResponseDTO.builder()
            .id(savedProduct.getId())
            .name(savedProduct.getName())
            .description(savedProduct.getDescription())
            .price(savedProduct.getPrice())
            .stockQuantity(savedProduct.getStockQuantity())
            .imageUrl(savedProduct.getImageUrl())
            .categoryName(savedProduct.getCategory().getName())
            .build();
    }

    public void deleteProduct(Long id) {
        if(!productRepository.existsById(id)){
            throw new RuntimeException("Product not found");
        }
        productRepository.deleteById(id);
    }

}
