package com.onlineshop.online_shop_backend.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public class CreateOrderRequest {

    @JsonProperty("customerName")
    @JsonAlias({"name", "fullName"})
    private String customerName;

    @JsonProperty("phone")
    @JsonAlias({"customerPhone", "mobile"})
    private String phone;

    @JsonProperty("address")
    @JsonAlias({"deliveryAddress", "customerAddress"})
    private String address;

    private List<OrderItemRequest> items;

    public CreateOrderRequest() {
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public List<OrderItemRequest> getItems() {
        return items;
    }

    public void setItems(List<OrderItemRequest> items) {
        this.items = items;
    }
}