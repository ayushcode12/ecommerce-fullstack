package com.example.Ecommerce_Backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AdminDashboardResponseDTO {

    private Long totalUsers;
    private Long totalProducts;
    private Long totalOrders;

    private Long pendingOrders;
    private Long confirmedOrders;
    private Long shippedOrders;
    private Long deliveredOrders;
    private Long canceledOrders;

    private BigDecimal totalRevenue;

    private List<OrderResponseDTO> recentOrders;
}
