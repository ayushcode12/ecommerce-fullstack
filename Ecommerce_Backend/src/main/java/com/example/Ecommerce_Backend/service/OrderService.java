package com.example.Ecommerce_Backend.service;

import com.example.Ecommerce_Backend.dto.OrderItemResponseDTO;
import com.example.Ecommerce_Backend.dto.OrderResponseDTO;
import com.example.Ecommerce_Backend.exception.BadRequestException;
import com.example.Ecommerce_Backend.exception.ResourceNotFoundException;
import com.example.Ecommerce_Backend.model.*;
import com.example.Ecommerce_Backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderService {

    private static final BigDecimal SHIPPING_FREE_THRESHOLD = BigDecimal.valueOf(499);
    private static final BigDecimal SHIPPING_FEE = BigDecimal.valueOf(49);
    private static final BigDecimal PLATFORM_FEE = BigDecimal.valueOf(9);
    private static final BigDecimal TAX_RATE = BigDecimal.valueOf(0.05);

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final OrderItemRepository orderItemRepository;
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final AddressRepository addressRepository;

    @Transactional
    public void checkout() {
        UserEntity user = getCurrentUser();

        CartEntity cart = cartRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Cart not found"));

        List<CartItemEntity> cartItems = cartItemRepository.findByCart(cart);

        if (cartItems.isEmpty()) {
            throw new BadRequestException("Cart is empty");
        }

        AddressEntity selectedAddress = addressRepository.findByUserAndSelectedTrue(user)
                .orElseThrow(() -> new BadRequestException("Please select a delivery address before checkout"));

        OrderEntity order = new OrderEntity();
        order.setUser(user);
        order.setStatus(OrderStatus.PENDING);
        order.setSubTotalAmount(BigDecimal.ZERO);
        order.setShippingAmount(BigDecimal.ZERO);
        order.setPlatformFeeAmount(BigDecimal.ZERO);
        order.setTaxAmount(BigDecimal.ZERO);
        order.setTotalAmount(BigDecimal.ZERO);
        applyShippingSnapshot(order, selectedAddress);
        order = orderRepository.save(order);

        BigDecimal subTotal = BigDecimal.ZERO;

        for (CartItemEntity cartItem : cartItems) {
            ProductEntity product = cartItem.getProduct();
            Integer quantity = cartItem.getQuantity();

            if (quantity == null || quantity <= 0) {
                throw new BadRequestException("Invalid quantity for product: " + product.getName());
            }

            if (product.getStockQuantity() < quantity) {
                throw new BadRequestException("Insufficient stock for product: " + product.getName());
            }

            BigDecimal priceAtPurchase = product.getPrice();
            BigDecimal lineTotal = priceAtPurchase.multiply(BigDecimal.valueOf(quantity));

            OrderItemEntity orderItem = new OrderItemEntity();
            orderItem.setOrder(order);
            orderItem.setProductId(product.getId());
            orderItem.setProductName(product.getName());
            orderItem.setPriceAtPurchase(priceAtPurchase);
            orderItem.setQuantity(quantity);
            orderItem.setTotalPrice(lineTotal);
            orderItemRepository.save(orderItem);

            subTotal = subTotal.add(lineTotal);

            product.setStockQuantity(product.getStockQuantity() - quantity);
            productRepository.save(product);
        }

        BigDecimal shipping = subTotal.compareTo(SHIPPING_FREE_THRESHOLD) > 0
                ? BigDecimal.ZERO
                : SHIPPING_FEE;
        BigDecimal platformFee = subTotal.compareTo(BigDecimal.ZERO) > 0
                ? PLATFORM_FEE
                : BigDecimal.ZERO;
        BigDecimal tax = subTotal.multiply(TAX_RATE).setScale(0, RoundingMode.HALF_UP);
        BigDecimal payable = subTotal.add(shipping).add(platformFee).add(tax);

        order.setSubTotalAmount(subTotal);
        order.setShippingAmount(shipping);
        order.setPlatformFeeAmount(platformFee);
        order.setTaxAmount(tax);
        order.setTotalAmount(payable);
        orderRepository.save(order);

        cartItemRepository.deleteAll(cartItems);
    }

    public List<OrderResponseDTO> getMyOrders() {
        UserEntity user = getCurrentUser();
        List<OrderEntity> orders = orderRepository.findByUser(user);

        List<OrderResponseDTO> responseList = new ArrayList<>();
        for (OrderEntity order : orders) {
            responseList.add(mapOrderToResponse(order));
        }
        return responseList;
    }

    public OrderResponseDTO getOrderDetails(Long orderId) {
        UserEntity user = getCurrentUser();

        OrderEntity order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        if (!order.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("You are not authorized to view this order");
        }

        return mapOrderToResponse(order);
    }

    private UserEntity getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private OrderResponseDTO mapOrderToResponse(OrderEntity order) {
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

        return OrderResponseDTO.builder()
                .orderId(order.getId())
                .totalAmount(order.getTotalAmount())
                .subTotalAmount(order.getSubTotalAmount())
                .shippingAmount(order.getShippingAmount())
                .platformFeeAmount(order.getPlatformFeeAmount())
                .taxAmount(order.getTaxAmount())
                .status(order.getStatus())
                .createdAt(order.getCreatedAt())
                .shippingFullName(order.getShippingFullName())
                .shippingPhone(order.getShippingPhone())
                .shippingLine1(order.getShippingLine1())
                .shippingLine2(order.getShippingLine2())
                .shippingCity(order.getShippingCity())
                .shippingState(order.getShippingState())
                .shippingPostalCode(order.getShippingPostalCode())
                .shippingLandmark(order.getShippingLandmark())
                .shippingLabel(order.getShippingLabel())
                .items(itemDTOs)
                .build();
    }

    private void applyShippingSnapshot(OrderEntity order, AddressEntity address) {
        order.setShippingFullName(address.getFullName());
        order.setShippingPhone(address.getPhone());
        order.setShippingLine1(address.getLine1());
        order.setShippingLine2(address.getLine2());
        order.setShippingCity(address.getCity());
        order.setShippingState(address.getState());
        order.setShippingPostalCode(address.getPostalCode());
        order.setShippingLandmark(address.getLandmark());
        order.setShippingLabel(address.getLabel());
    }
}
