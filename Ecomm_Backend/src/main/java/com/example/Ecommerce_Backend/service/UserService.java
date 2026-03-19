package com.example.Ecommerce_Backend.service;

import com.example.Ecommerce_Backend.dto.ChangePasswordRequestDTO;
import com.example.Ecommerce_Backend.dto.UpdateProfileRequestDTO;
import com.example.Ecommerce_Backend.dto.UserProfileResponseDTO;
import com.example.Ecommerce_Backend.exception.BadRequestException;
import com.example.Ecommerce_Backend.exception.ResourceNotFoundException;
import com.example.Ecommerce_Backend.model.UserEntity;
import com.example.Ecommerce_Backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserProfileResponseDTO getMyProfile() {
        return toProfileDTO(getCurrentUser());
    }

    @Transactional
    public UserProfileResponseDTO updateMyProfile(UpdateProfileRequestDTO requestDTO) {
        UserEntity user = getCurrentUser();
        user.setName(requestDTO.getName().trim());
        UserEntity saved = userRepository.save(user);
        return toProfileDTO(saved);
    }

    @Transactional
    public void changeMyPassword(ChangePasswordRequestDTO requestDTO) {
        UserEntity user = getCurrentUser();
        if (!passwordEncoder.matches(requestDTO.getCurrentPassword(), user.getPassword())) {
            throw new BadRequestException("Current password is incorrect");
        }

        if (requestDTO.getCurrentPassword().equals(requestDTO.getNewPassword())) {
            throw new BadRequestException("New password must be different from current password");
        }

        user.setPassword(passwordEncoder.encode(requestDTO.getNewPassword()));
        user.setRefreshTokenHash(null);
        user.setRefreshTokenExpiresAt(null);
        userRepository.save(user);
    }

    private UserProfileResponseDTO toProfileDTO(UserEntity user) {
        return UserProfileResponseDTO.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .createdAt(user.getCreatedAt())
                .build();
    }

    private UserEntity getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
}
