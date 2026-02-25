package com.example.Ecommerce_Backend.service;

import com.example.Ecommerce_Backend.dto.CartItemResponseDTO;
import com.example.Ecommerce_Backend.dto.CartResponseDTO;
import com.example.Ecommerce_Backend.model.CartEntity;
import com.example.Ecommerce_Backend.model.CartItemEntity;
import com.example.Ecommerce_Backend.model.ProductEntity;
import com.example.Ecommerce_Backend.model.UserEntity;
import com.example.Ecommerce_Backend.repository.CartItemRepository;
import com.example.Ecommerce_Backend.repository.CartRepository;
import com.example.Ecommerce_Backend.repository.ProductRepository;
import com.example.Ecommerce_Backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.*;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final UserRepository userRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;

    public void addToCart(Long productId, Integer quantity) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        UserEntity user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));

        ProductEntity product = productRepository.findById(productId)
            .orElseThrow(() -> new RuntimeException("Product not found"));

        if (quantity <= 0) throw new RuntimeException("Quantity must be greater than zero");

        if (quantity > product.getStockQuantity()) {
            throw new RuntimeException("Quantity must be less than or equal to stock quantity");
        }

        CartEntity cart = cartRepository.findByUser(user)
            .orElseGet(() -> {
                CartEntity newCart = CartEntity.builder()
                    .user(user)
                    .build();
                return cartRepository.save(newCart);
            });

        Optional<CartItemEntity> cartItem = cartItemRepository.findByCartAndProduct(cart, product);
        if (cartItem.isPresent()) {
            int newQuantity = cartItem.get().getQuantity() + quantity;

            if (newQuantity > product.getStockQuantity()) {
                throw new RuntimeException("Quantity must be less than or equal to stock quantity");
            }
            cartItem.get().setQuantity(newQuantity);
            cartItemRepository.save(cartItem.get());
        }
        else {
            CartItemEntity newCartItem = new CartItemEntity();
            newCartItem.setCart(cart);
            newCartItem.setQuantity(quantity);
            newCartItem.setProduct(product);
            cartItemRepository.save(newCartItem);
        }
    }

    public CartResponseDTO  getCart() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        UserEntity user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));

        Optional<CartEntity> optionalCart = cartRepository.findByUser(user);
        if(optionalCart.isEmpty()){
            return CartResponseDTO.builder()
                .cartItems(Collections.emptyList())
                .totalCartAmount(BigDecimal.ZERO)
                .build();
        }
        CartEntity cart = optionalCart.get();

        List<CartItemEntity> cartItems = cartItemRepository.findByCart(cart);
        List<CartItemResponseDTO> responseItems = new ArrayList<>();
        BigDecimal totalAmount = BigDecimal.ZERO;

        for(CartItemEntity item : cartItems){
            BigDecimal price = item.getProduct().getPrice();
            Integer quantity = item.getQuantity();
            BigDecimal totalPrice = price.multiply(BigDecimal.valueOf(quantity));

            CartItemResponseDTO dto = CartItemResponseDTO.builder()
                    .productId(item.getProduct().getId())
                    .productName(item.getProduct().getName())
                    .price(price)
                    .quantity(quantity)
                    .totalPrice(totalPrice)
                    .build();
            responseItems.add(dto);
            totalAmount = totalAmount.add(totalPrice);
        }

        return CartResponseDTO.builder()
                .cartItems(responseItems)
                .totalCartAmount(totalAmount)
                .build();
    }

    public void updateQuantity(Long productId, Integer quantity) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        UserEntity user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));

        CartEntity cart = cartRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Cart not found"));

        ProductEntity product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        CartItemEntity cartItem = cartItemRepository.findByCartAndProduct(cart, product)
                .orElseThrow(() -> new RuntimeException("CartItem not found"));

        if(quantity < 0) throw  new RuntimeException();
        if(quantity == 0){
            cartItemRepository.delete(cartItem);
            return;
        }
        if(quantity > product.getStockQuantity()) throw new RuntimeException();

        cartItem.setQuantity(quantity);
        cartItemRepository.save(cartItem);
    }
}
