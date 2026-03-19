package com.example.Ecommerce_Backend.service;

import com.example.Ecommerce_Backend.dto.AuthResponseDTO;
import com.example.Ecommerce_Backend.dto.ForgotPasswordRequestDTO;
import com.example.Ecommerce_Backend.dto.ForgotPasswordResponseDTO;
import com.example.Ecommerce_Backend.dto.LoginRequestDTO;
import com.example.Ecommerce_Backend.dto.RefreshTokenRequestDTO;
import com.example.Ecommerce_Backend.dto.RegisterRequestDTO;
import com.example.Ecommerce_Backend.dto.ResetPasswordRequestDTO;
import com.example.Ecommerce_Backend.exception.EmailAlreadyExistsException;
import com.example.Ecommerce_Backend.exception.BadRequestException;
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

    private static final long RESET_PASSWORD_EXPIRATION_MINUTES = 15;

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
        String refreshTokenHash = hashToken(request.getRefreshToken());
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

    public ForgotPasswordResponseDTO requestPasswordReset(ForgotPasswordRequestDTO requestDTO) {
        String genericMessage = "If this email exists, reset instructions have been generated.";

        UserEntity user = userRepository.findByEmail(requestDTO.getEmail().trim()).orElse(null);
        if (user == null) {
            return ForgotPasswordResponseDTO.builder()
                    .message(genericMessage)
                    .resetToken(null)
                    .build();
        }

        String resetToken = UUID.randomUUID().toString();
        user.setResetPasswordTokenHash(hashToken(resetToken));
        user.setResetPasswordTokenExpiresAt(LocalDateTime.now().plusMinutes(RESET_PASSWORD_EXPIRATION_MINUTES));
        userRepository.save(user);

        return ForgotPasswordResponseDTO.builder()
                .message(genericMessage)
                .resetToken(resetToken)
                .build();
    }

    public void resetPassword(ResetPasswordRequestDTO requestDTO) {
        String tokenHash = hashToken(requestDTO.getToken());
        UserEntity user = userRepository.findByResetPasswordTokenHash(tokenHash)
                .orElseThrow(() -> new BadRequestException("Invalid or expired reset token"));

        if (user.getResetPasswordTokenExpiresAt() == null ||
                user.getResetPasswordTokenExpiresAt().isBefore(LocalDateTime.now())) {
            user.setResetPasswordTokenHash(null);
            user.setResetPasswordTokenExpiresAt(null);
            userRepository.save(user);
            throw new BadRequestException("Invalid or expired reset token");
        }

        user.setPassword(passwordEncoder.encode(requestDTO.getNewPassword()));
        user.setResetPasswordTokenHash(null);
        user.setResetPasswordTokenExpiresAt(null);
        user.setRefreshTokenHash(null);
        user.setRefreshTokenExpiresAt(null);
        userRepository.save(user);
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
        user.setRefreshTokenHash(hashToken(refreshToken));
        user.setRefreshTokenExpiresAt(LocalDateTime.now().plus(Duration.ofMillis(refreshExpirationMs)));
        userRepository.save(user);
        return refreshToken;
    }

    private String hashToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(token.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("Failed to hash token", e);
        }
    }

}
