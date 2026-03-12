package com.example.Ecommerce_Backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class OrderEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity user;

    @Column(nullable = false)
    private BigDecimal totalAmount;

    @Column
    private BigDecimal subTotalAmount;

    @Column
    private BigDecimal shippingAmount;

    @Column
    private BigDecimal platformFeeAmount;

    @Column
    private BigDecimal taxAmount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderStatus status;

    @Column
    private String shippingFullName;

    @Column
    private String shippingPhone;

    @Column
    private String shippingLine1;

    private String shippingLine2;

    @Column
    private String shippingCity;

    @Column
    private String shippingState;

    @Column
    private String shippingPostalCode;

    private String shippingLandmark;

    @Column
    private String shippingLabel;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }

}
