package com.onlineshop.online_shop_backend.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.onlineshop.online_shop_backend.dto.CreateOrderRequest;
import com.onlineshop.online_shop_backend.dto.OrderItemRequest;
import com.onlineshop.online_shop_backend.entity.CustomerOrder;
import com.onlineshop.online_shop_backend.repository.CustomerOrderRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class CustomerOrderService {

    private final CustomerOrderRepository customerOrderRepository;
    private final ObjectMapper objectMapper;

    public CustomerOrderService(
            CustomerOrderRepository customerOrderRepository,
            ObjectMapper objectMapper) {

        this.customerOrderRepository = customerOrderRepository;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public Map<String, Object> createOrder(CreateOrderRequest request) {

        if (request == null) {
            throw new IllegalArgumentException("Order request is required.");
        }

        if (request.getCustomerName() == null
                || request.getCustomerName().trim().isEmpty()) {
            throw new IllegalArgumentException("Customer name is required.");
        }

        if (request.getPhone() == null
                || request.getPhone().trim().isEmpty()) {
            throw new IllegalArgumentException("Phone number is required.");
        }

        if (request.getAddress() == null
                || request.getAddress().trim().isEmpty()) {
            throw new IllegalArgumentException("Delivery address is required.");
        }

        List<OrderItemRequest> items = request.getItems();

        if (items == null || items.isEmpty()) {
            throw new IllegalArgumentException(
                    "Your cart is empty. Please add products.");
        }

        BigDecimal totalAmount = BigDecimal.ZERO;

        for (OrderItemRequest item : items) {

            if (item == null) {
                throw new IllegalArgumentException("Invalid order item.");
            }

            if (item.getProductId() == null) {
                throw new IllegalArgumentException("Product ID is required.");
            }

            if (item.getQuantity() == null || item.getQuantity() <= 0) {
                throw new IllegalArgumentException(
                        "Product quantity must be greater than zero.");
            }

            if (item.getPrice() == null
                    || item.getPrice().compareTo(BigDecimal.ZERO) < 0) {
                throw new IllegalArgumentException("Invalid product price.");
            }

            BigDecimal itemTotal = item.getPrice().multiply(
                    BigDecimal.valueOf(item.getQuantity()));

            totalAmount = totalAmount.add(itemTotal);
        }

        CustomerOrder order = new CustomerOrder();

        order.setCustomerName(request.getCustomerName().trim());
        order.setPhone(request.getPhone().trim());
        order.setAddress(request.getAddress().trim());
        order.setPaymentMethod("COD");
        order.setOrderStatus("PLACED");
        order.setTotalAmount(totalAmount);
        order.setCreatedAt(LocalDateTime.now());

        try {
            order.setItemsJson(objectMapper.writeValueAsString(items));
        } catch (JsonProcessingException e) {
            throw new IllegalArgumentException(
                    "Unable to process order items.");
        }

        // Save the order and receive the saved entity.
        CustomerOrder savedOrder = customerOrderRepository.save(order);

        // Convert the saved entity into a response map.
        Map<String, Object> response = new HashMap<>();

        response.put("success", true);
        response.put("message", "Order placed successfully.");
        response.put("orderId", savedOrder.getId());
        response.put("customerName", savedOrder.getCustomerName());
        response.put("phone", savedOrder.getPhone());
        response.put("address", savedOrder.getAddress());
        response.put("paymentMethod", savedOrder.getPaymentMethod());
        response.put("orderStatus", savedOrder.getOrderStatus());
        response.put("totalAmount", savedOrder.getTotalAmount());
        response.put("createdAt", savedOrder.getCreatedAt());

        return response;
    }
}