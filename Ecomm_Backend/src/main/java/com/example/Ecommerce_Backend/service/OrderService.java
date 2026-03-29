package com.example.Ecommerce_Backend.service;

import com.example.Ecommerce_Backend.dto.OrderItemResponseDTO;
import com.example.Ecommerce_Backend.dto.OrderResponseDTO;
import com.example.Ecommerce_Backend.dto.AdminDashboardResponseDTO;
import com.example.Ecommerce_Backend.exception.BadRequestException;
import com.example.Ecommerce_Backend.exception.ResourceNotFoundException;
import com.example.Ecommerce_Backend.model.*;
import com.example.Ecommerce_Backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.EnumSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class OrderService {

    private static final BigDecimal SHIPPING_FREE_THRESHOLD = BigDecimal.valueOf(499);
    private static final BigDecimal SHIPPING_FEE = BigDecimal.valueOf(49);
    private static final BigDecimal PLATFORM_FEE = BigDecimal.valueOf(9);
    private static final BigDecimal TAX_RATE = BigDecimal.valueOf(0.05);
    private static final int LOW_STOCK_THRESHOLD = 5;

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

    public CheckoutPreview getCheckoutPreviewForUser(UserEntity user) {
        AddressEntity selectedAddress = addressRepository.findByUserAndSelectedTrue(user)
                .orElseThrow(() -> new BadRequestException("Please select a delivery address before checkout"));

        CartEntity cart = cartRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Cart not found"));

        List<CartItemEntity> cartItems = cartItemRepository.findByCart(cart);

        if (cartItems.isEmpty()) {
            throw new BadRequestException("Cart is empty");
        }

        BigDecimal subTotal = BigDecimal.ZERO;
        for (CartItemEntity cartItem : cartItems) {
            ProductEntity product = cartItem.getProduct();
            Integer quantity = cartItem.getQuantity();
            validateCartItem(product, quantity);
            BigDecimal lineTotal = product.getPrice().multiply(BigDecimal.valueOf(quantity));
            subTotal = subTotal.add(lineTotal);
        }

        CheckoutAmounts amounts = calculateAmounts(subTotal);
        return new CheckoutPreview(
                user.getId(),
                selectedAddress.getId(),
                amounts.subTotal(),
                amounts.shipping(),
                amounts.platformFee(),
                amounts.tax(),
                amounts.payable());
    }

    @Transactional
    public void finalizePaidCheckout(
            Long userId,
            Long addressId,
            String razorpayOrderId,
            String razorpayPaymentId,
            BigDecimal paidAmount) {
        if (razorpayOrderId == null || razorpayOrderId.isBlank()) {
            throw new BadRequestException("Missing Razorpay order id");
        }

        if (orderRepository.existsByRazorpayOrderId(razorpayOrderId)) {
            return;
        }

        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        AddressEntity selectedAddress = addressRepository.findByIdAndUser(addressId, user)
                .orElseThrow(() -> new BadRequestException("Selected address is invalid"));

        CartEntity cart = cartRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Cart not found"));

        List<CartItemEntity> cartItems = cartItemRepository.findByCart(cart);
        if (cartItems.isEmpty()) {
            throw new BadRequestException("Cart is empty");
        }

        BigDecimal subTotal = BigDecimal.ZERO;
        for (CartItemEntity cartItem : cartItems) {
            ProductEntity product = cartItem.getProduct();
            Integer quantity = cartItem.getQuantity();
            validateCartItem(product, quantity);
            BigDecimal lineTotal = product.getPrice().multiply(BigDecimal.valueOf(quantity));
            subTotal = subTotal.add(lineTotal);
        }

        CheckoutAmounts amounts = calculateAmounts(subTotal);
        if (paidAmount == null || amounts.payable().compareTo(paidAmount) != 0) {
            throw new BadRequestException("Paid amount does not match checkout total");
        }

        OrderEntity order = new OrderEntity();
        order.setUser(user);
        order.setStatus(OrderStatus.PENDING);
        order.setPaymentProvider(PaymentProvider.RAZORPAY);
        order.setPaymentStatus(PaymentStatus.PAID);
        order.setRazorpayOrderId(razorpayOrderId);
        order.setRazorpayPaymentId(razorpayPaymentId);
        order.setSubTotalAmount(amounts.subTotal());
        order.setShippingAmount(amounts.shipping());
        order.setPlatformFeeAmount(amounts.platformFee());
        order.setTaxAmount(amounts.tax());
        order.setTotalAmount(amounts.payable());
        applyShippingSnapshot(order, selectedAddress);
        order = orderRepository.save(order);

        for (CartItemEntity cartItem : cartItems) {
            ProductEntity product = cartItem.getProduct();
            Integer quantity = cartItem.getQuantity();
            validateCartItem(product, quantity);

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

            product.setStockQuantity(product.getStockQuantity() - quantity);
            productRepository.save(product);
        }

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

    @Transactional
    public ReorderResult reorderPastOrder(Long orderId) {
        UserEntity user = getCurrentUser();

        OrderEntity order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        if (!order.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("You are not authorized to reorder this order");
        }

        if (order.getStatus() != OrderStatus.DELIVERED && order.getStatus() != OrderStatus.CANCELED) {
            throw new BadRequestException("Reorder is available only for past delivered or canceled orders");
        }

        List<OrderItemEntity> orderItems = orderItemRepository.findByOrder(order);
        if (orderItems.isEmpty()) {
            throw new BadRequestException("This order has no items to reorder");
        }

        CartEntity cart = cartRepository.findByUser(user)
                .orElseGet(() -> cartRepository.save(CartEntity.builder().user(user).build()));

        int addedItems = 0;
        int skippedItems = 0;

        for (OrderItemEntity orderItem : orderItems) {
            ProductEntity product = productRepository.findById(orderItem.getProductId()).orElse(null);
            if (product == null) {
                skippedItems++;
                continue;
            }

            int availableStock = product.getStockQuantity() == null ? 0 : product.getStockQuantity();
            if (availableStock <= 0) {
                skippedItems++;
                continue;
            }

            CartItemEntity existing = cartItemRepository.findByCartAndProduct(cart, product).orElse(null);
            int currentCartQty = existing == null ? 0 : (existing.getQuantity() == null ? 0 : existing.getQuantity());
            int canStillAdd = availableStock - currentCartQty;
            if (canStillAdd <= 0) {
                skippedItems++;
                continue;
            }

            int desiredQty = orderItem.getQuantity() == null ? 0 : orderItem.getQuantity();
            int qtyToAdd = Math.min(Math.max(desiredQty, 0), canStillAdd);
            if (qtyToAdd <= 0) {
                skippedItems++;
                continue;
            }

            if (existing == null) {
                CartItemEntity cartItem = new CartItemEntity();
                cartItem.setCart(cart);
                cartItem.setProduct(product);
                cartItem.setQuantity(qtyToAdd);
                cartItemRepository.save(cartItem);
            } else {
                existing.setQuantity(currentCartQty + qtyToAdd);
                cartItemRepository.save(existing);
            }

            addedItems++;
        }

        if (addedItems == 0) {
            throw new BadRequestException("No items from this order are currently available to reorder");
        }

        return new ReorderResult(addedItems, skippedItems);
    }

    @Transactional
    public OrderResponseDTO cancelMyOrder(Long orderId) {
        UserEntity user = getCurrentUser();

        OrderEntity order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        if (!order.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("You are not authorized to cancel this order");
        }

        if (order.getStatus() == OrderStatus.CANCELED) {
            return mapOrderToResponse(order);
        }

        if (order.getStatus() == OrderStatus.SHIPPED || order.getStatus() == OrderStatus.DELIVERED) {
            throw new BadRequestException("Order cannot be canceled after it is shipped");
        }

        if (order.getStatus() != OrderStatus.PENDING && order.getStatus() != OrderStatus.CONFIRMED) {
            throw new BadRequestException("Only pending or confirmed orders can be canceled");
        }

        List<OrderItemEntity> orderItems = orderItemRepository.findByOrder(order);
        for (OrderItemEntity item : orderItems) {
            productRepository.findById(item.getProductId()).ifPresent(product -> {
                int currentStock = product.getStockQuantity() == null ? 0 : product.getStockQuantity();
                int restoreQty = item.getQuantity() == null ? 0 : item.getQuantity();
                product.setStockQuantity(currentStock + restoreQty);
                productRepository.save(product);
            });
        }

        order.setStatus(OrderStatus.CANCELED);
        OrderEntity saved = orderRepository.save(order);
        return mapOrderToResponse(saved);
    }

    public Page<OrderResponseDTO> getAllOrdersForAdmin(
            int page,
            int size,
            String sortBy,
            String direction,
            String status,
            String keyword) {
        Sort sort = "desc".equalsIgnoreCase(direction)
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);

        String normalizedKeyword = keyword == null ? null : keyword.trim();
        boolean hasKeyword = normalizedKeyword != null && !normalizedKeyword.isEmpty();

        OrderStatus orderStatus = null;
        if (status != null && !status.trim().isEmpty()) {
            try {
                orderStatus = OrderStatus.valueOf(status.trim().toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new BadRequestException("Invalid order status filter");
            }
        }

        Page<OrderEntity> orderPage;
        if (orderStatus != null && hasKeyword) {
            orderPage = orderRepository.findByStatusAndUserEmailContainingIgnoreCase(orderStatus, normalizedKeyword,
                    pageable);
        } else if (orderStatus != null) {
            orderPage = orderRepository.findByStatus(orderStatus, pageable);
        } else if (hasKeyword) {
            orderPage = orderRepository.findByUserEmailContainingIgnoreCase(normalizedKeyword, pageable);
        } else {
            orderPage = orderRepository.findAll(pageable);
        }

        List<OrderResponseDTO> content = orderPage.getContent().stream()
                .map(this::mapOrderToResponse)
                .toList();

        return new PageImpl<>(content, pageable, orderPage.getTotalElements());
    }

    public OrderResponseDTO getOrderDetailsForAdmin(Long orderId) {
        OrderEntity order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        return mapOrderToResponse(order);
    }

    public OrderResponseDTO updateOrderStatusForAdmin(Long orderId, OrderStatus newStatus) {
        OrderEntity order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        OrderStatus currentStatus = order.getStatus();
        if (currentStatus == newStatus) {
            return mapOrderToResponse(order);
        }

        validateStatusTransition(currentStatus, newStatus);
        order.setStatus(newStatus);
        OrderEntity saved = orderRepository.save(order);
        return mapOrderToResponse(saved);
    }

    public AdminDashboardResponseDTO getDashboardForAdmin() {
        long totalUsers = userRepository.count();
        long totalProducts = productRepository.count();
        long totalOrders = orderRepository.count();
        long outOfStockProducts = productRepository.countByStockQuantity(0);
        long lowStockProducts = Math.max(
                0,
                productRepository.countByStockQuantityLessThanEqual(LOW_STOCK_THRESHOLD) - outOfStockProducts
        );

        long pendingOrders = orderRepository.countByStatus(OrderStatus.PENDING);
        long confirmedOrders = orderRepository.countByStatus(OrderStatus.CONFIRMED);
        long shippedOrders = orderRepository.countByStatus(OrderStatus.SHIPPED);
        long deliveredOrders = orderRepository.countByStatus(OrderStatus.DELIVERED);
        long canceledOrders = orderRepository.countByStatus(OrderStatus.CANCELED);

        BigDecimal totalRevenue = orderRepository.findAll().stream()
                .filter(order -> order.getStatus() != OrderStatus.CANCELED)
                .map(OrderEntity::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<OrderResponseDTO> recentOrders = orderRepository.findTop5ByOrderByCreatedAtDesc().stream()
                .map(this::mapOrderToResponse)
                .toList();

        return AdminDashboardResponseDTO.builder()
                .totalUsers(totalUsers)
                .totalProducts(totalProducts)
                .totalOrders(totalOrders)
                .lowStockProducts(lowStockProducts)
                .outOfStockProducts(outOfStockProducts)
                .pendingOrders(pendingOrders)
                .confirmedOrders(confirmedOrders)
                .shippedOrders(shippedOrders)
                .deliveredOrders(deliveredOrders)
                .canceledOrders(canceledOrders)
                .totalRevenue(totalRevenue)
                .recentOrders(recentOrders)
                .build();
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

        String paymentMethod;
        String paymentState;
        if (order.getPaymentProvider() == PaymentProvider.RAZORPAY) {
            paymentMethod = "Online (Razorpay)";
            paymentState = order.getPaymentStatus() == PaymentStatus.PAID ? "Paid" : "Pending";
        } else {
            paymentMethod = "Cash on Delivery";
            paymentState = order.getStatus() == OrderStatus.CANCELED ? "Not Charged" : "Pay on Delivery";
        }

        return OrderResponseDTO.builder()
                .orderId(order.getId())
                .totalAmount(order.getTotalAmount())
                .subTotalAmount(order.getSubTotalAmount())
                .shippingAmount(order.getShippingAmount())
                .platformFeeAmount(order.getPlatformFeeAmount())
                .taxAmount(order.getTaxAmount())
                .status(order.getStatus())
                .paymentMethod(paymentMethod)
                .paymentState(paymentState)
                .createdAt(order.getCreatedAt())
                .userName(order.getUser() == null ? null : order.getUser().getName())
                .userEmail(order.getUser() == null ? null : order.getUser().getEmail())
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

    private void validateStatusTransition(OrderStatus currentStatus, OrderStatus nextStatus) {
        if (currentStatus == OrderStatus.DELIVERED || currentStatus == OrderStatus.CANCELED) {
            throw new BadRequestException("Completed orders cannot be updated");
        }

        Set<OrderStatus> allowedNext;
        switch (currentStatus) {
            case PENDING -> allowedNext = EnumSet.of(OrderStatus.CONFIRMED, OrderStatus.CANCELED);
            case CONFIRMED -> allowedNext = EnumSet.of(OrderStatus.SHIPPED, OrderStatus.CANCELED);
            case SHIPPED -> allowedNext = EnumSet.of(OrderStatus.DELIVERED);
            default -> allowedNext = EnumSet.noneOf(OrderStatus.class);
        }

        if (!allowedNext.contains(nextStatus)) {
            throw new BadRequestException("Invalid status transition from " + currentStatus + " to " + nextStatus);
        }
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

    private void validateCartItem(ProductEntity product, Integer quantity) {
        if (quantity == null || quantity <= 0) {
            throw new BadRequestException("Invalid quantity for product: " + product.getName());
        }

        if (product.getStockQuantity() < quantity) {
            throw new BadRequestException("Insufficient stock for product: " + product.getName());
        }
    }

    private CheckoutAmounts calculateAmounts(BigDecimal subTotal) {
        BigDecimal shipping = subTotal.compareTo(SHIPPING_FREE_THRESHOLD) > 0
                ? BigDecimal.ZERO
                : SHIPPING_FEE;
        BigDecimal platformFee = subTotal.compareTo(BigDecimal.ZERO) > 0
                ? PLATFORM_FEE
                : BigDecimal.ZERO;
        BigDecimal tax = subTotal.multiply(TAX_RATE).setScale(0, RoundingMode.HALF_UP);
        BigDecimal payable = subTotal.add(shipping).add(platformFee).add(tax);
        return new CheckoutAmounts(subTotal, shipping, platformFee, tax, payable);
    }

    public record CheckoutPreview(
            Long userId,
            Long addressId,
            BigDecimal subTotal,
            BigDecimal shipping,
            BigDecimal platformFee,
            BigDecimal tax,
            BigDecimal payableAmount) {
    }

    private record CheckoutAmounts(
            BigDecimal subTotal,
            BigDecimal shipping,
            BigDecimal platformFee,
            BigDecimal tax,
            BigDecimal payable) {
    }

    public record ReorderResult(int addedItems, int skippedItems) {
    }

}
