package com.example.Ecommerce_Backend.dto;

import com.example.Ecommerce_Backend.model.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class OrderResponseDTO {

    private Long orderId;

    private BigDecimal totalAmount;
    private BigDecimal subTotalAmount;
    private BigDecimal shippingAmount;
    private BigDecimal platformFeeAmount;
    private BigDecimal taxAmount;

    private OrderStatus status;

    private LocalDateTime createdAt;

    private String userName;
    private String userEmail;

    private String shippingFullName;
    private String shippingPhone;
    private String shippingLine1;
    private String shippingLine2;
    private String shippingCity;
    private String shippingState;
    private String shippingPostalCode;
    private String shippingLandmark;
    private String shippingLabel;

    private List<OrderItemResponseDTO> items;

}
