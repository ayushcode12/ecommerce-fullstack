package com.example.Ecommerce_Backend.service;

import com.example.Ecommerce_Backend.dto.RazorpayOrderResponseDTO;
import com.example.Ecommerce_Backend.dto.RazorpayVerifyPaymentRequestDTO;
import com.example.Ecommerce_Backend.exception.BadRequestException;
import com.example.Ecommerce_Backend.exception.ResourceNotFoundException;
import com.example.Ecommerce_Backend.model.UserEntity;
import com.example.Ecommerce_Backend.repository.OrderRepository;
import com.example.Ecommerce_Backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Base64;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class RazorpayPaymentService {

    private static final Logger logger = LoggerFactory.getLogger(RazorpayPaymentService.class);
    private static final String RAZORPAY_API_BASE = "https://api.razorpay.com/v1";
    private static final String CURRENCY_INR = "INR";

    private final OrderService orderService;
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    private final HttpClient httpClient = HttpClient.newHttpClient();

    @Value("${razorpay.key-id:}")
    private String razorpayKeyId;

    @Value("${razorpay.key-secret:}")
    private String razorpayKeySecret;

    public RazorpayOrderResponseDTO createCheckoutOrder() {
        ensureConfigured();

        UserEntity user = getCurrentUser();
        OrderService.CheckoutPreview checkoutPreview = orderService.getCheckoutPreviewForUser(user);
        long amountInPaise = toMinorUnits(checkoutPreview.payableAmount());

        String requestBody = buildCreateOrderRequestBody(checkoutPreview, amountInPaise);
        String orderJson = callRazorpay("POST", "/orders", requestBody);

        return RazorpayOrderResponseDTO.builder()
                .keyId(razorpayKeyId)
                .orderId(parseRequiredString(orderJson, "id"))
                .amount(parseRequiredLong(orderJson, "amount"))
                .currency(parseOptionalString(orderJson, "currency").orElse(CURRENCY_INR))
                .build();
    }

    public void verifyPaymentAndPlaceOrder(RazorpayVerifyPaymentRequestDTO requestDTO) {
        ensureConfigured();

        if (orderRepository.existsByRazorpayOrderId(requestDTO.getRazorpayOrderId())) {
            return;
        }

        verifySignature(requestDTO.getRazorpayOrderId(), requestDTO.getRazorpayPaymentId(), requestDTO.getRazorpaySignature());

        String orderJson = callRazorpay("GET", "/orders/" + requestDTO.getRazorpayOrderId(), null);
        String paymentJson = callRazorpay("GET", "/payments/" + requestDTO.getRazorpayPaymentId(), null);

        String paymentOrderId = parseRequiredString(paymentJson, "order_id");
        if (!requestDTO.getRazorpayOrderId().equals(paymentOrderId)) {
            throw new BadRequestException("Razorpay payment does not belong to the provided order");
        }

        String paymentStatus = parseRequiredString(paymentJson, "status");
        if (!"captured".equalsIgnoreCase(paymentStatus)) {
            throw new BadRequestException("Payment is not captured yet");
        }

        Long userIdFromNotes = parseRequiredLong(orderJson, "userId");
        Long addressIdFromNotes = parseRequiredLong(orderJson, "addressId");
        BigDecimal expectedTotal = parseRequiredBigDecimal(orderJson, "expectedTotal");

        UserEntity currentUser = getCurrentUser();
        if (!currentUser.getId().equals(userIdFromNotes)) {
            throw new BadRequestException("Payment does not belong to current user");
        }

        long paidAmountInPaise = parseRequiredLong(paymentJson, "amount");
        if (paidAmountInPaise <= 0) {
            throw new BadRequestException("Invalid paid amount from Razorpay");
        }
        BigDecimal paidAmount = toMajorUnits(paidAmountInPaise);

        if (expectedTotal.compareTo(paidAmount) != 0) {
            throw new BadRequestException("Amount mismatch between expected and paid total");
        }

        orderService.finalizePaidCheckout(
                userIdFromNotes,
                addressIdFromNotes,
                requestDTO.getRazorpayOrderId(),
                requestDTO.getRazorpayPaymentId(),
                paidAmount
        );
    }

    private String callRazorpay(String method, String path, String body) {
        try {
            HttpRequest.Builder requestBuilder = HttpRequest.newBuilder()
                    .uri(URI.create(RAZORPAY_API_BASE + path))
                    .header("Authorization", buildBasicAuthHeader())
                    .header("Content-Type", "application/json");

            if ("POST".equalsIgnoreCase(method)) {
                requestBuilder.POST(HttpRequest.BodyPublishers.ofString(body == null ? "" : body));
            } else {
                requestBuilder.GET();
            }

            HttpResponse<String> response = httpClient.send(requestBuilder.build(), HttpResponse.BodyHandlers.ofString());
            String responseBody = response.body() == null ? "" : response.body();

            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                throw new BadRequestException("Razorpay API error: " + extractRazorpayError(responseBody, response.statusCode()));
            }

            return responseBody;
        } catch (BadRequestException exception) {
            throw exception;
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw new BadRequestException("Razorpay request interrupted");
        } catch (Exception exception) {
            logger.error("Razorpay API call failed", exception);
            throw new BadRequestException("Unable to communicate with Razorpay");
        }
    }

    private String buildCreateOrderRequestBody(OrderService.CheckoutPreview checkoutPreview, long amountInPaise) {
        String expectedTotal = checkoutPreview.payableAmount().toPlainString();
        return "{"
                + "\"amount\":" + amountInPaise + ","
                + "\"currency\":\"" + CURRENCY_INR + "\","
                + "\"receipt\":\"rcpt_" + System.currentTimeMillis() + "\","
                + "\"notes\":{"
                + "\"userId\":\"" + checkoutPreview.userId() + "\","
                + "\"addressId\":\"" + checkoutPreview.addressId() + "\","
                + "\"expectedTotal\":\"" + expectedTotal + "\""
                + "}"
                + "}";
    }

    private String extractRazorpayError(String responseBody, int statusCode) {
        String message = parseOptionalString(responseBody, "description").orElse("");
        if (message.isBlank()) {
            return "HTTP " + statusCode;
        }
        return message;
    }

    private void verifySignature(String orderId, String paymentId, String signature) {
        String payload = orderId + "|" + paymentId;
        String expectedSignature = hmacSha256Hex(payload, razorpayKeySecret);
        if (!MessageDigest.isEqual(
                expectedSignature.getBytes(StandardCharsets.UTF_8),
                signature.getBytes(StandardCharsets.UTF_8)
        )) {
            throw new BadRequestException("Razorpay signature verification failed");
        }
    }

    private String hmacSha256Hex(String data, String secret) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] digest = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder(digest.length * 2);
            for (byte b : digest) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (Exception exception) {
            throw new BadRequestException("Unable to verify payment signature");
        }
    }

    private String buildBasicAuthHeader() {
        String credentials = razorpayKeyId + ":" + razorpayKeySecret;
        String encoded = Base64.getEncoder().encodeToString(credentials.getBytes(StandardCharsets.UTF_8));
        return "Basic " + encoded;
    }

    private long toMinorUnits(BigDecimal amount) {
        return amount.multiply(BigDecimal.valueOf(100)).longValueExact();
    }

    private BigDecimal toMajorUnits(long amountInMinorUnits) {
        return BigDecimal.valueOf(amountInMinorUnits, 2);
    }

    private void ensureConfigured() {
        if (razorpayKeyId == null || razorpayKeyId.isBlank() || razorpayKeySecret == null || razorpayKeySecret.isBlank()) {
            throw new BadRequestException("Razorpay credentials are not configured");
        }
    }

    private String parseRequiredString(String json, String fieldName) {
        return parseOptionalString(json, fieldName)
                .orElseThrow(() -> new BadRequestException("Missing " + fieldName + " in Razorpay response"));
    }

    private Long parseRequiredLong(String json, String fieldName) {
        String numericString = parseOptionalNumberAsString(json, fieldName)
                .or(() -> parseOptionalString(json, fieldName))
                .orElseThrow(() -> new BadRequestException("Missing " + fieldName + " in Razorpay response"));

        try {
            return Long.parseLong(numericString);
        } catch (NumberFormatException exception) {
            throw new BadRequestException("Invalid " + fieldName + " in Razorpay response");
        }
    }

    private BigDecimal parseRequiredBigDecimal(String json, String fieldName) {
        String decimalString = parseOptionalString(json, fieldName)
                .or(() -> parseOptionalDecimalAsString(json, fieldName))
                .orElseThrow(() -> new BadRequestException("Missing " + fieldName + " in Razorpay response"));

        try {
            return new BigDecimal(decimalString);
        } catch (NumberFormatException exception) {
            throw new BadRequestException("Invalid " + fieldName + " in Razorpay response");
        }
    }

    private Optional<String> parseOptionalString(String json, String fieldName) {
        Pattern pattern = Pattern.compile("\"" + Pattern.quote(fieldName) + "\"\\s*:\\s*\"([^\"]*)\"");
        Matcher matcher = pattern.matcher(json == null ? "" : json);
        if (matcher.find()) {
            return Optional.of(matcher.group(1));
        }
        return Optional.empty();
    }

    private Optional<String> parseOptionalNumberAsString(String json, String fieldName) {
        Pattern pattern = Pattern.compile("\"" + Pattern.quote(fieldName) + "\"\\s*:\\s*(-?\\d+)");
        Matcher matcher = pattern.matcher(json == null ? "" : json);
        if (matcher.find()) {
            return Optional.of(matcher.group(1));
        }
        return Optional.empty();
    }

    private Optional<String> parseOptionalDecimalAsString(String json, String fieldName) {
        Pattern pattern = Pattern.compile("\"" + Pattern.quote(fieldName) + "\"\\s*:\\s*(-?\\d+(?:\\.\\d+)?)");
        Matcher matcher = pattern.matcher(json == null ? "" : json);
        if (matcher.find()) {
            return Optional.of(matcher.group(1));
        }
        return Optional.empty();
    }

    private UserEntity getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
}

