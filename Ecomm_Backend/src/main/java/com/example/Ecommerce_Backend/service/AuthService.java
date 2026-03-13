package com.example.Ecommerce_Backend.service;

import com.example.Ecommerce_Backend.dto.AuthResponseDTO;
import com.example.Ecommerce_Backend.dto.LoginRequestDTO;
import com.example.Ecommerce_Backend.dto.RefreshTokenRequestDTO;
import com.example.Ecommerce_Backend.dto.RegisterRequestDTO;
import com.example.Ecommerce_Backend.exception.EmailAlreadyExistsException;
import com.example.Ecommerce_Backend.exception.InvalidCredentialsException;
import com.example.Ecommerce_Backend.model.Role;
import com.example.Ecommerce_Backend.model.UserEntity;
import com.example.Ecommerce_Backend.repository.UserRepository;
import com.example.Ecommerce_Backend.security.jwt.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Value("${jwt.refresh-expiration}")
    private Long refreshExpirationMs;

    public AuthResponseDTO register(RegisterRequestDTO request) {

        Boolean isExist = userRepository.existsByEmail(request.getEmail());

        if (isExist) {
            throw new EmailAlreadyExistsException("Email already exists");
        }

        UserEntity userEntity = new UserEntity();
        userEntity.setName(request.getName());
        userEntity.setEmail(request.getEmail());
        userEntity.setPassword(passwordEncoder.encode(request.getPassword()));
        userEntity.setRole(Role.USER);

        userRepository.save(userEntity);
        String token = jwtService.generateToken(userEntity);
        String refreshToken = issueRefreshToken(userEntity);

        return AuthResponseDTO.builder()
                .token(token)
                .refreshToken(refreshToken)
                .role(Role.USER)
                .build();
    }

    public AuthResponseDTO login(LoginRequestDTO request) {
        UserEntity user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new InvalidCredentialsException("Invalid Credentials"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())){
            throw new InvalidCredentialsException("Invalid Credentials");
        }

        String token = jwtService.generateToken(user);
        String refreshToken = issueRefreshToken(user);

        return AuthResponseDTO.builder()
                .token(token)
                .refreshToken(refreshToken)
                .role(user.getRole())
                .build();
    }

    public AuthResponseDTO refresh(RefreshTokenRequestDTO request) {
        String refreshTokenHash = hashRefreshToken(request.getRefreshToken());
        UserEntity user = userRepository.findByRefreshTokenHash(refreshTokenHash)
                .orElseThrow(() -> new InvalidCredentialsException("Invalid refresh token"));

        if (user.getRefreshTokenExpiresAt() == null || user.getRefreshTokenExpiresAt().isBefore(LocalDateTime.now())) {
            user.setRefreshTokenHash(null);
            user.setRefreshTokenExpiresAt(null);
            userRepository.save(user);
            throw new InvalidCredentialsException("Refresh token expired. Please login again.");
        }

        String token = jwtService.generateToken(user);
        String newRefreshToken = issueRefreshToken(user);

        return AuthResponseDTO.builder()
                .token(token)
                .refreshToken(newRefreshToken)
                .role(user.getRole())
                .build();
    }

    public void logout(String email) {
        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new InvalidCredentialsException("User not found"));

        user.setRefreshTokenHash(null);
        user.setRefreshTokenExpiresAt(null);
        userRepository.save(user);
    }

    private String issueRefreshToken(UserEntity user) {
        String refreshToken = UUID.randomUUID().toString();
        user.setRefreshTokenHash(hashRefreshToken(refreshToken));
        user.setRefreshTokenExpiresAt(LocalDateTime.now().plus(Duration.ofMillis(refreshExpirationMs)));
        userRepository.save(user);
        return refreshToken;
    }

    private String hashRefreshToken(String refreshToken) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(refreshToken.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("Failed to hash refresh token", e);
        }
    }

}
