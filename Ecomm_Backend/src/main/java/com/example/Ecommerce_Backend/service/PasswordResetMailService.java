package com.example.Ecommerce_Backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PasswordResetMailService {

    private final JavaMailSender mailSender;

    @Value("${app.mail.from:no-reply@urbanthreads.demo}")
    private String fromAddress;

    @Value("${app.name:Urban Threads}")
    private String appName;

    public void sendPasswordResetOtp(String recipientEmail, String recipientName, String otp, long validityMinutes) {
        String displayName = (recipientName == null || recipientName.isBlank()) ? "User" : recipientName.trim();
        String subject = appName + " Password Reset OTP";
        String body = String.format(
                "Hi %s,%n%nYour OTP for password reset is: %s%n%nThis OTP is valid for %d minutes.%nIf you did not request this, please ignore this email.%n%n- %s Team",
                displayName,
                otp,
                validityMinutes,
                appName
        );

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromAddress);
        message.setTo(recipientEmail);
        message.setSubject(subject);
        message.setText(body);

        try {
            mailSender.send(message);
        } catch (MailException ex) {
            throw new IllegalStateException("Unable to send reset OTP email right now", ex);
        }
    }
}
