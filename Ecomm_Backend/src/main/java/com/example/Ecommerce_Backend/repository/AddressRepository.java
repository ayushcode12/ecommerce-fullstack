package com.example.Ecommerce_Backend.repository;

import com.example.Ecommerce_Backend.model.AddressEntity;
import com.example.Ecommerce_Backend.model.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AddressRepository extends JpaRepository<AddressEntity, Long> {

    List<AddressEntity> findByUserOrderBySelectedDescCreatedAtDesc(UserEntity user);

    List<AddressEntity> findByUser(UserEntity user);

    Optional<AddressEntity> findByIdAndUser(Long id, UserEntity user);

    Optional<AddressEntity> findByUserAndSelectedTrue(UserEntity user);
}
