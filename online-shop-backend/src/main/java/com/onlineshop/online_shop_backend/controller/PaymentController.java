package com.onlineshop.online_shop_backend.controller;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.Utils;

import org.json.JSONObject;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/payment")
@CrossOrigin(origins = {
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:3000"
})
public class PaymentController {

    @Value("${razorpay.key.id}")
    private String keyId;

    @Value("${razorpay.key.secret}")
    private String keySecret;

    /*
     * Check whether Razorpay credentials are configured.
     */
    private boolean credentialsConfigured() {
        return keyId != null
                && !keyId.isBlank()
                && keySecret != null
                && !keySecret.isBlank();
    }

    /*
     * Create Razorpay order.
     *
     * POST /api/payment/create-order
     *
     * Request example:
     * {
     *     "amount": 10000
     * }
     *
     * Amount is in paise.
     * 10000 paise = Rs. 100.
     */
    @PostMapping("/create-order")
    public ResponseEntity<Map<String, Object>> createOrder(
            @RequestBody(required = false) Map<String, Object> request) {

        try {

            if (!credentialsConfigured()) {
                return errorResponse(
                        HttpStatus.INTERNAL_SERVER_ERROR,
                        "Razorpay credentials are missing. "
                                + "Check your application.properties "
                                + "and environment variables."
                );
            }

            if (request == null || request.get("amount") == null) {
                return errorResponse(
                        HttpStatus.BAD_REQUEST,
                        "Order amount is required."
                );
            }

            long amountPaise;

            try {
                BigDecimal amount = new BigDecimal(
                        request.get("amount").toString()
                );

                amountPaise = amount
                        .setScale(0, RoundingMode.UNNECESSARY)
                        .longValueExact();

            } catch (NumberFormatException
                     | ArithmeticException exception) {

                return errorResponse(
                        HttpStatus.BAD_REQUEST,
                        "Amount must be a valid whole number of paise."
                );
            }

            /*
             * Validate order amount.
             * Minimum: Rs. 1.
             */
            if (amountPaise < 100
                    || amountPaise > 100000000L) {

                return errorResponse(
                        HttpStatus.BAD_REQUEST,
                        "Order amount must be between "
                                + "100 and 100000000 paise."
                );
            }

            /*
             * Initialize Razorpay using the configured credentials.
             */
            RazorpayClient client = new RazorpayClient(
                    keyId.trim(),
                    keySecret.trim()
            );

            JSONObject orderRequest = new JSONObject();

            orderRequest.put("amount", amountPaise);
            orderRequest.put("currency", "INR");

            orderRequest.put(
                    "receipt",
                    "shop_" + UUID.randomUUID()
                            .toString()
                            .replace("-", "")
            );

            /*
             * Create the order with Razorpay.
             */
            Order order = client.orders.create(orderRequest);

            Map<String, Object> response = new HashMap<>();

            response.put("success", true);
            response.put("id", order.get("id"));
            response.put("amount", order.get("amount"));
            response.put("currency", order.get("currency"));

            /*
             * The Key ID is public and is required by Razorpay Checkout.
             * Never send the Key Secret to React.
             */
            response.put("keyId", keyId.trim());

            return ResponseEntity.ok(response);

        } catch (Exception exception) {

            /*
             * Do not log credentials or secret values.
             */
            System.err.println(
                    "Razorpay order creation failed: "
                            + exception.getClass().getSimpleName()
                            + ": "
                            + exception.getMessage()
            );

            String message = exception.getMessage() == null
                    ? ""
                    : exception.getMessage().toLowerCase();

            if (message.contains("authentication failed")
                    || message.contains("unauthorized")
                    || message.contains("401")) {

                return errorResponse(
                        HttpStatus.BAD_GATEWAY,
                        "Razorpay authentication failed. "
                                + "Check that the complete Key ID "
                                + "and matching Key Secret belong "
                                + "to the same account and mode."
                );
            }

            return errorResponse(
                    HttpStatus.BAD_GATEWAY,
                    "Unable to create the Razorpay order. "
                            + "Check the backend terminal for details."
            );
        }
    }

    /*
     * Verify Razorpay payment signature.
     *
     * POST /api/payment/verify
     */
    @PostMapping("/verify")
    public ResponseEntity<Map<String, Object>> verifyPayment(
            @RequestBody(required = false) Map<String, String> request) {

        try {

            if (!credentialsConfigured()) {
                return verificationError(
                        HttpStatus.INTERNAL_SERVER_ERROR,
                        "Razorpay credentials are not configured."
                );
            }

            if (request == null) {
                return verificationError(
                        HttpStatus.BAD_REQUEST,
                        "Payment verification details are missing."
                );
            }

            String orderId = request.get("razorpay_order_id");
            String paymentId = request.get("razorpay_payment_id");
            String signature = request.get("razorpay_signature");

            if (orderId == null || orderId.isBlank()
                    || paymentId == null || paymentId.isBlank()
                    || signature == null || signature.isBlank()) {

                return verificationError(
                        HttpStatus.BAD_REQUEST,
                        "Payment verification details are missing."
                );
            }

            JSONObject attributes = new JSONObject();

            attributes.put("razorpay_order_id", orderId);
            attributes.put("razorpay_payment_id", paymentId);
            attributes.put("razorpay_signature", signature);

            /*
             * Verify the signature using the Key Secret.
             */
            Utils.verifyPaymentSignature(
                    attributes,
                    keySecret.trim()
            );

            Map<String, Object> response = new HashMap<>();

            response.put("verified", true);
            response.put(
                    "message",
                    "Payment signature verified successfully."
            );
            response.put("paymentId", paymentId);
            response.put("orderId", orderId);

            return ResponseEntity.ok(response);

        } catch (Exception exception) {

            System.err.println(
                    "Payment verification failed: "
                            + exception.getClass().getSimpleName()
            );

            return verificationError(
                    HttpStatus.BAD_REQUEST,
                    "Payment verification failed. "
                            + "Check the payment details and signature."
            );
        }
    }

    /*
     * Return a consistent order-creation error response.
     */
    private ResponseEntity<Map<String, Object>> errorResponse(
            HttpStatus status,
            String message) {

        Map<String, Object> response = new HashMap<>();

        response.put("success", false);
        response.put("error", message);

        return ResponseEntity.status(status).body(response);
    }

    /*
     * Return a consistent payment-verification error response.
     */
    private ResponseEntity<Map<String, Object>> verificationError(
            HttpStatus status,
            String message) {

        Map<String, Object> response = new HashMap<>();

        response.put("verified", false);
        response.put("message", message);

        return ResponseEntity.status(status).body(response);
    }
}