package com.example.Ecommerce_Backend.service;

import com.example.Ecommerce_Backend.dto.ProductRequestDTO;
import com.example.Ecommerce_Backend.dto.ProductResponseDTO;
import com.example.Ecommerce_Backend.exception.BadRequestException;
import com.example.Ecommerce_Backend.exception.ResourceNotFoundException;
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

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {

    private static final Set<String> ALLOWED_SORT_FIELDS = Set.of("id", "name", "price", "stockQuantity", "createdAt");

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    public Page<ProductResponseDTO> getAllProducts(int  page, int size, String sortBy, String direction, String keyword, Long categoryId) {
        String normalizedSortBy = sortBy == null ? "id" : sortBy.trim();
        if (!ALLOWED_SORT_FIELDS.contains(normalizedSortBy)) {
            throw new BadRequestException("Invalid sortBy. Allowed values: " + ALLOWED_SORT_FIELDS);
        }

        String normalizedDirection = direction == null ? "asc" : direction.trim().toLowerCase();
        if (!normalizedDirection.equals("asc") && !normalizedDirection.equals("desc")) {
            throw new BadRequestException("Invalid direction. Allowed values: asc, desc");
        }

        Sort sort = normalizedDirection.equals("desc")
                ? Sort.by(normalizedSortBy).descending()
                : Sort.by(normalizedSortBy).ascending();
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
                .imageUrl(resolvePrimaryImage(product))
                .imageUrls(resolveImageUrls(product))
                .categoryName(product.getCategory().getName())
                .build());
    }

    public ProductResponseDTO createProduct(ProductRequestDTO request) {
        CategoryEntity category = categoryRepository.findById(request.getCategoryId())
            .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        ProductEntity product = ProductEntity.builder()
            .name(request.getName())
            .description(request.getDescription())
            .price(request.getPrice())
            .stockQuantity(request.getStockQuantity())
            .imageUrl(resolvePrimaryImage(request.getImageUrl(), request.getImageUrls()))
            .imageUrls(resolveImageUrls(request.getImageUrl(), request.getImageUrls()))
            .category(category)
            .build();

        ProductEntity savedProduct = productRepository.save(product);

        return ProductResponseDTO.builder()
            .id(savedProduct.getId())
            .name(savedProduct.getName())
            .description(savedProduct.getDescription())
            .price(savedProduct.getPrice())
            .stockQuantity(savedProduct.getStockQuantity())
            .imageUrl(resolvePrimaryImage(savedProduct))
            .imageUrls(resolveImageUrls(savedProduct))
            .categoryName(savedProduct.getCategory().getName())
            .build();
    }

    public ProductResponseDTO getProductById(Long id) {
        ProductEntity product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        return mapToResponseDTO(product);
    }

    public ProductResponseDTO updateProduct(Long id, ProductRequestDTO request) {
        ProductEntity product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        CategoryEntity category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setStockQuantity(request.getStockQuantity());
        product.setImageUrl(resolvePrimaryImage(request.getImageUrl(), request.getImageUrls()));
        product.setImageUrls(resolveImageUrls(request.getImageUrl(), request.getImageUrls()));
        product.setCategory(category);

        ProductEntity updated = productRepository.save(product);
        return mapToResponseDTO(updated);
    }

    public void deleteProduct(Long id) {
        if(!productRepository.existsById(id)){
            throw new ResourceNotFoundException("Product not found");
        }
        productRepository.deleteById(id);
    }

    private ProductResponseDTO mapToResponseDTO(ProductEntity product) {

        return ProductResponseDTO.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .price(product.getPrice())
                .stockQuantity(product.getStockQuantity())
                .imageUrl(resolvePrimaryImage(product))
                .imageUrls(resolveImageUrls(product))
                .categoryName(product.getCategory().getName())
                .build();
    }

    private String resolvePrimaryImage(ProductEntity product) {
        List<String> images = resolveImageUrls(product);
        if (!images.isEmpty()) {
            return images.get(0);
        }
        return product.getImageUrl();
    }

    private List<String> resolveImageUrls(ProductEntity product) {
        List<String> normalized = normalizeImageUrls(product.getImageUrls());
        if (normalized.isEmpty() && product.getImageUrl() != null && !product.getImageUrl().isBlank()) {
            normalized.add(product.getImageUrl().trim());
        }
        return normalized;
    }

    private String resolvePrimaryImage(String imageUrl, List<String> imageUrls) {
        List<String> normalized = resolveImageUrls(imageUrl, imageUrls);
        if (!normalized.isEmpty()) {
            return normalized.get(0);
        }
        return imageUrl == null || imageUrl.isBlank() ? null : imageUrl.trim();
    }

    private List<String> resolveImageUrls(String imageUrl, List<String> imageUrls) {
        List<String> normalized = normalizeImageUrls(imageUrls);
        if (normalized.isEmpty() && imageUrl != null && !imageUrl.isBlank()) {
            normalized.add(imageUrl.trim());
        }
        return normalized;
    }

    private List<String> normalizeImageUrls(List<String> imageUrls) {
        if (imageUrls == null) {
            return new ArrayList<>();
        }

        return imageUrls.stream()
                .filter(Objects::nonNull)
                .map(String::trim)
                .filter(url -> !url.isBlank())
                .distinct()
                .collect(Collectors.toCollection(ArrayList::new));
    }

}
