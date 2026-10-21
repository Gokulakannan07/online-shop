package com.onlineshop.online_shop_backend.repository;

import com.onlineshop.online_shop_backend.entity.CustomerOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CustomerOrderRepository
        extends JpaRepository<CustomerOrder, Long> {
}