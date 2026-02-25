package com.example.Ecommerce_Backend.service;

import com.example.Ecommerce_Backend.dto.OrderItemResponseDTO;
import com.example.Ecommerce_Backend.dto.OrderResponseDTO;
import com.example.Ecommerce_Backend.model.*;
import com.example.Ecommerce_Backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final OrderItemRepository orderItemRepository;
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;

    @Transactional
    public void checkout(){
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        CartEntity cart  = cartRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Cart not found"));

        List<CartItemEntity> cartItems = cartItemRepository.findByCart(cart);

        if(cartItems.isEmpty()){
            throw new RuntimeException("Cart is empty");
        }

        for(CartItemEntity cartItem : cartItems){
            ProductEntity product = cartItem.getProduct();

            if( product.getStockQuantity() < cartItem.getQuantity() ){
                throw new RuntimeException("Insufficient stock for product: " + product.getName());
            }

            product.setStockQuantity(product.getStockQuantity() - cartItem.getQuantity());
            productRepository.save(product);
        }

        OrderEntity order = new OrderEntity();
        order.setUser(user);
        order.setStatus(OrderStatus.PENDING);
        order.setTotalAmount(BigDecimal.ZERO);
        order = orderRepository.save(order);

        BigDecimal totalAmount = BigDecimal.ZERO;

        for(CartItemEntity cartItem : cartItems){

            ProductEntity product = cartItem.getProduct();

            BigDecimal price = product.getPrice();
            Integer quantity = cartItem.getQuantity();
            BigDecimal totalPrice = price.multiply(BigDecimal.valueOf(quantity));

            OrderItemEntity orderItem = new OrderItemEntity();
            orderItem.setOrder(order);
            orderItem.setProductId(product.getId());
            orderItem.setProductName(product.getName());
            orderItem.setPriceAtPurchase(price);
            orderItem.setQuantity(quantity);
            orderItem.setTotalPrice(totalPrice);

            orderItemRepository.save(orderItem);

            totalAmount = totalAmount.add(totalPrice);
        }
        order.setTotalAmount(totalAmount);
        orderRepository.save(order);
        cartItemRepository.deleteAll(cartItems);
    }

    public List<OrderResponseDTO> getMyOrders(){
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        String email = authentication.getName();
        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<OrderEntity> orders = orderRepository.findByUser(user);

        List<OrderResponseDTO> responseList = new ArrayList<>();

        for(OrderEntity order : orders){

            List<OrderItemEntity> items = orderItemRepository.findByOrder(order);
            List<OrderItemResponseDTO> itemDTOs = new ArrayList<>();
            for (OrderItemEntity item : items) {
                OrderItemResponseDTO itemDTO = OrderItemResponseDTO.builder()
                        .productId(item.getProductId())
                        .productName(item.getProductName())
                        .priceAtPurchase(item.getPriceAtPurchase())
                        .quantity(item.getQuantity())
                        .totalPrice(item.getTotalPrice())
                        .build();

                itemDTOs.add(itemDTO);
            }
            OrderResponseDTO orderDTO = OrderResponseDTO.builder()
                    .orderId(order.getId())
                    .totalAmount(order.getTotalAmount())
                    .status(order.getStatus())
                    .createdAt(order.getCreatedAt())
                    .items(itemDTOs)
                    .build();

            responseList.add(orderDTO);
        }
        return responseList;
    }
}
