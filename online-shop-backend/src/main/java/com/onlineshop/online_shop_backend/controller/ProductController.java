package com.onlineshop.online_shop_backend.controller;

import com.onlineshop.online_shop_backend.entity.Product;
import com.onlineshop.online_shop_backend.repository.ProductRepository;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = {
"http://localhost:5173",
"http://localhost:5174",
"http://localhost:3000"
})
public class ProductController {

private final ProductRepository productRepository;

public ProductController(ProductRepository productRepository) {
    this.productRepository = productRepository;
}

// Get all products
@GetMapping
public ResponseEntity<List<Product>> getAllProducts() {
    return ResponseEntity.ok(productRepository.findAll());
}

// Get product by ID
@GetMapping("/{id}")
public ResponseEntity<Product> getProductById(@PathVariable Long id) {
    Optional<Product> product = productRepository.findById(id);

    return product.map(ResponseEntity::ok)
            .orElseGet(() -> ResponseEntity.notFound().build());
}

// Add product
@PostMapping
public ResponseEntity<?> addProduct(@RequestBody Product product) {

    if (product.getName() == null || product.getName().isBlank()) {
        return ResponseEntity.badRequest().body("Product name is required.");
    }

    if (product.getPrice() == null || product.getPrice() < 0) {
        return ResponseEntity.badRequest().body("A valid product price is required.");
    }

    if (product.getStock() == null) {
        product.setStock(0);
    }

    product.setId(null);

    Product savedProduct = productRepository.save(product);

    return ResponseEntity.status(HttpStatus.CREATED).body(savedProduct);
}

// Update product
@PutMapping("/{id}")
public ResponseEntity<?> updateProduct(
        @PathVariable Long id,
        @RequestBody Product updatedProduct) {

    Optional<Product> result = productRepository.findById(id);

    if (result.isEmpty()) {
        return ResponseEntity.notFound().build();
    }

    if (updatedProduct.getName() == null || updatedProduct.getName().isBlank()) {
        return ResponseEntity.badRequest().body("Product name is required.");
    }

    if (updatedProduct.getPrice() == null || updatedProduct.getPrice() < 0) {
        return ResponseEntity.badRequest().body("A valid product price is required.");
    }

    Product existing = result.get();

    existing.setName(updatedProduct.getName());
    existing.setDescription(updatedProduct.getDescription());
    existing.setPrice(updatedProduct.getPrice());
    existing.setCategory(updatedProduct.getCategory());
    existing.setImage(updatedProduct.getImage());

    if (updatedProduct.getStock() != null) {
        existing.setStock(updatedProduct.getStock());
    }

    return ResponseEntity.ok(productRepository.save(existing));
}

// Delete product
@DeleteMapping("/{id}")
public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {

    if (!productRepository.existsById(id)) {
        return ResponseEntity.notFound().build();
    }

    productRepository.deleteById(id);

    return ResponseEntity.noContent().build();
}


}
