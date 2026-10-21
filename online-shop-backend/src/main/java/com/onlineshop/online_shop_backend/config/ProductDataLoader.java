
package com.onlineshop.online_shop_backend.config;

import java.util.List;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.onlineshop.online_shop_backend.entity.Product;
import com.onlineshop.online_shop_backend.repository.ProductRepository;

@Configuration
public class ProductDataLoader {

    @Bean
    CommandLineRunner loadProducts(ProductRepository repository) {

        return args -> {

            List<Product> products = List.of(

                // ELECTRONICS - 10 PRODUCTS

                new Product("Wireless Headphones", "Electronics", 1499.0,
                    "Wireless headphones with clear sound.",
                    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=700&q=80", 4.5),

                new Product("Smart Watch", "Electronics", 2299.0,
                    "Smart watch for daily fitness tracking.",
                    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=700&q=80", 4.4),

                new Product("Bluetooth Speaker", "Electronics", 999.0,
                    "Portable speaker with rich audio.",
                    "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=700&q=80", 4.3),

                new Product("Gaming Headset", "Electronics", 1899.0,
                    "Comfortable headset for gaming.",
                    "https://images.unsplash.com/photo-1599669454699-248893623440?auto=format&fit=crop&w=700&q=80", 4.6),

                new Product("Digital Camera", "Electronics", 15999.0,
                    "Capture memorable moments.",
                    "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=700&q=80", 4.7),

                new Product("Laptop", "Electronics", 45999.0,
                    "Laptop suitable for work and study.",
                    "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=700&q=80", 4.5),

                new Product("Mechanical Keyboard", "Electronics", 2499.0,
                    "Mechanical keyboard for typing and gaming.",
                    "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=700&q=80", 4.4),

                new Product("Computer Mouse", "Electronics", 599.0,
                    "Ergonomic computer mouse.",
                    "https://images.unsplash.com/photo-1527814050087-3793815479db?auto=format&fit=crop&w=700&q=80", 4.2),

                new Product("Mobile Phone", "Electronics", 19999.0,
                    "Modern smartphone for everyday use.",
                    "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=700&q=80", 4.5),

                new Product("Tablet", "Electronics", 12999.0,
                    "Tablet for entertainment and productivity.",
                    "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=700&q=80", 4.3),


                // FASHION - 10 PRODUCTS

                new Product("Classic T-Shirt", "Fashion", 499.0,
                    "Comfortable everyday cotton T-shirt.",
                    "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=700&q=80", 4.3),

                new Product("Denim Jacket", "Fashion", 1799.0,
                    "Classic denim jacket.",
                    "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=700&q=80", 4.5),

                new Product("Running Shoes", "Fashion", 2499.0,
                    "Lightweight shoes for running.",
                    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=700&q=80", 4.6),

                new Product("Casual Sneakers", "Fashion", 1999.0,
                    "Versatile sneakers for everyday wear.",
                    "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=700&q=80", 4.4),

                new Product("Backpack", "Fashion", 1199.0,
                    "Spacious backpack for work and travel.",
                    "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=700&q=80", 4.3),

                new Product("Winter Hoodie", "Fashion", 1299.0,
                    "Soft hoodie for cooler weather.",
                    "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=700&q=80", 4.5),

                new Product("Formal Shirt", "Fashion", 999.0,
                    "Smart formal shirt for work.",
                    "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=700&q=80", 4.2),

                new Product("Sunglasses", "Fashion", 799.0,
                    "Stylish sunglasses for sunny days.",
                    "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=700&q=80", 4.1),

                new Product("Wrist Watch", "Fashion", 1499.0,
                    "Classic watch with a modern look.",
                    "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=700&q=80", 4.4),

                new Product("Casual Dress", "Fashion", 1599.0,
                    "Comfortable casual dress.",
                    "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=700&q=80", 4.3),


                // ACCESSORIES - 10 PRODUCTS

                new Product("Leather Wallet", "Accessories", 699.0,
                    "Compact wallet for everyday essentials.",
                    "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=700&q=80", 4.2),

                new Product("Travel Backpack", "Accessories", 1599.0,
                    "Backpack designed for travel.",
                    "https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?auto=format&fit=crop&w=700&q=80", 4.4),

                new Product("Laptop Bag", "Accessories", 1299.0,
                    "Protective laptop bag.",
                    "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=700&q=80", 4.3),

                new Product("Wireless Earbuds", "Accessories", 1799.0,
                    "Compact earbuds for music and calls.",
                    "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?auto=format&fit=crop&w=700&q=80", 4.5),

                new Product("Phone Case", "Accessories", 399.0,
                    "Protective case for your phone.",
                    "https://images.unsplash.com/photo-1601593346740-925612772716?auto=format&fit=crop&w=700&q=80", 4.0),

                new Product("Travel Bottle", "Accessories", 499.0,
                    "Reusable bottle for everyday hydration.",
                    "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=700&q=80", 4.1),

                new Product("Leather Belt", "Accessories", 599.0,
                    "Classic belt for casual and formal wear.",
                    "https://images.unsplash.com/photo-1624222247344-550fb8f1b120?auto=format&fit=crop&w=700&q=80", 4.2),

                new Product("Cap", "Accessories", 349.0,
                    "Casual cap for outdoor activities.",
                    "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=700&q=80", 4.0),

                new Product("Minimalist Necklace", "Accessories", 899.0,
                    "Minimalist jewelry for everyday styling.",
                    "https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=700&q=80", 4.4),

                new Product("Handbag", "Accessories", 2199.0,
                    "Stylish handbag with practical storage.",
                    "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=700&q=80", 4.5),


                // HOME & LIFESTYLE - 10 PRODUCTS

                new Product("Coffee Maker", "Home & Lifestyle", 2499.0,
                    "Make coffee at home with ease.",
                    "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=700&q=80", 4.4),

                new Product("Desk Lamp", "Home & Lifestyle", 899.0,
                    "Desk lamp for reading and studying.",
                    "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=700&q=80", 4.2),

                new Product("Indoor Plant", "Home & Lifestyle", 399.0,
                    "Decorative plant for your living space.",
                    "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=700&q=80", 4.5),

                new Product("Decorative Vase", "Home & Lifestyle", 699.0,
                    "Decorative vase for modern interiors.",
                    "https://images.unsplash.com/photo-1578500494198-246f612d3b3d?auto=format&fit=crop&w=700&q=80", 4.1),

                new Product("Ceramic Mug", "Home & Lifestyle", 299.0,
                    "Ceramic mug for your favorite drink.",
                    "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=700&q=80", 4.2),

                new Product("Throw Pillow", "Home & Lifestyle", 599.0,
                    "Soft cushion for your sofa.",
                    "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=700&q=80", 4.3),

                new Product("Wall Clock", "Home & Lifestyle", 799.0,
                    "Modern wall clock for your home.",
                    "https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?auto=format&fit=crop&w=700&q=80", 4.0),

                new Product("Table Organizer", "Home & Lifestyle", 499.0,
                    "Keep your desk neat and organized.",
                    "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&w=700&q=80", 4.2),

                new Product("Scented Candle", "Home & Lifestyle", 349.0,
                    "Scented candle for a relaxing atmosphere.",
                    "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=700&q=80", 4.4),

                new Product("Ceramic Planter", "Home & Lifestyle", 449.0,
                    "Planter for indoor plants and decor.",
                    "https://images.unsplash.com/photo-1487700160041-babef9c3cb55?auto=format&fit=crop&w=700&q=80", 4.3)
            );

            int inserted = 0;

            for (Product product : products) {

                if (!repository.existsByName(product.getName())) {

                    repository.save(product);
                    inserted++;
                }
            }

            System.out.println(
                "Product loader finished. New products inserted: "
                + inserted
                + "; total products in database: "
                + repository.count()
            );
        };
    }
}

