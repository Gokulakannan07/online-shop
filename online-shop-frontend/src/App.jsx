import { useEffect, useMemo, useState } from "react";
import "./App.css";

// ======================================================
// API CONFIGURATION
// ======================================================

const API =
  import.meta.env.VITE_API_URL || "http://localhost:8080/api";

const CART_KEY = "shop-cart";
const USER_KEY = "shop-user";
const TOKEN_KEY = "shop-token";

// ======================================================
// CATEGORIES
// ======================================================

const CATEGORIES = [
  "All",
  "Electronics",
  "Fashion",
  "Home",
  "Beauty",
  "Accessories",
];

// ======================================================
// DEMO PRODUCT IMAGES
// ======================================================

const DEMO_IMAGES = {
  Electronics:
    "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=700",
  Fashion:
    "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=700",
  Home:
    "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=700",
  Beauty:
    "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=700",
  Accessories:
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=700",
};

// ======================================================
// FALLBACK PRODUCTS
// Used if the backend products endpoint is unavailable.
// ======================================================

const FALLBACK_PRODUCTS = [
  {
    id: 1,
    name: "Wireless Headphones",
    description: "Comfortable wireless headphones with rich sound.",
    price: 1499,
    category: "Electronics",
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=700",
    stock: 20,
  },
  {
    id: 2,
    name: "Smart Watch",
    description: "Modern smartwatch for everyday activities.",
    price: 2499,
    category: "Electronics",
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=700",
    stock: 20,
  },
  {
    id: 3,
    name: "Bluetooth Speaker",
    description: "Portable speaker with powerful audio.",
    price: 999,
    category: "Electronics",
    image:
      "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=700",
    stock: 20,
  },
  {
    id: 4,
    name: "Running Shoes",
    description: "Lightweight shoes designed for daily comfort.",
    price: 1799,
    category: "Fashion",
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=700",
    stock: 20,
  },
  {
    id: 5,
    name: "Classic Backpack",
    description: "A practical backpack for work and travel.",
    price: 899,
    category: "Fashion",
    image:
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=700",
    stock: 20,
  },
  {
    id: 6,
    name: "Desk Lamp",
    description: "Minimal desk lamp for your workspace.",
    price: 799,
    category: "Home",
    image:
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=700",
    stock: 20,
  },
  {
    id: 7,
    name: "Skin Care Set",
    description: "A simple skincare set for your daily routine.",
    price: 1199,
    category: "Beauty",
    image:
      "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=700",
    stock: 20,
  },
  {
    id: 8,
    name: "Classic Wrist Watch",
    description: "Elegant watch suitable for everyday use.",
    price: 1999,
    category: "Accessories",
    image:
      "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=700",
    stock: 20,
  },
];

// ======================================================
// HELPER FUNCTIONS
// ======================================================

function readJSON(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function normalizeProduct(product, index = 0) {
  const id =
    product.id ??
    product.productId ??
    product._id ??
    index + 1;

  const category = product.category || "Electronics";

  return {
    ...product,
    id,
    name: product.name || product.productName || "Product",
    description:
      product.description || "Quality product from ShopSphere.",
    price: Number(product.price ?? product.amount ?? 0),
    category,
    image:
      product.image ||
      product.imageUrl ||
      product.imageURL ||
      product.productImage ||
      DEMO_IMAGES[category] ||
      DEMO_IMAGES.Electronics,
    stock: Number(product.stock ?? product.quantity ?? 999),
  };
}

async function requestJSON(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const text = await response.text();

  let data = {};

  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { message: text };
  }

  if (!response.ok) {
    throw new Error(
      data.message ||
        data.error ||
        `Request failed with status ${response.status}`
    );
  }

  return data;
}

function formatPrice(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(amount || 0));
}

// ======================================================
// MAIN COMPONENT
// ======================================================

export default function App() {
  // ----------------------------------------------------
  // STATE
  // ----------------------------------------------------

  const [products, setProducts] = useState(FALLBACK_PRODUCTS);

  const [cart, setCart] = useState(() => {
    const savedCart = readJSON(CART_KEY, []);
    return Array.isArray(savedCart) ? savedCart : [];
  });

  const [user, setUser] = useState(() =>
    readJSON(USER_KEY, null)
  );

  const [token, setToken] = useState(
    () => localStorage.getItem(TOKEN_KEY) || ""
  );

  const [search, setSearch] = useState("");

  const [selectedCategory, setSelectedCategory] =
    useState("All");

  const [sortBy, setSortBy] = useState("featured");

  const [loadingProducts, setLoadingProducts] =
    useState(true);

  const [apiWarning, setApiWarning] = useState("");

  const [cartOpen, setCartOpen] = useState(false);

  const [authOpen, setAuthOpen] = useState(false);

  const [authMode, setAuthMode] = useState("login");

  const [authLoading, setAuthLoading] = useState(false);

  const [checkoutLoading, setCheckoutLoading] =
    useState(false);

  const [message, setMessage] = useState("");

  const [authForm, setAuthForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  // ----------------------------------------------------
  // SAVE CART
  // ----------------------------------------------------

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart]);

  // ----------------------------------------------------
  // SAVE USER
  // ----------------------------------------------------

  useEffect(() => {
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_KEY);
    }
  }, [user]);

  // ----------------------------------------------------
  // LOAD PRODUCTS FROM SPRING BOOT
  // ----------------------------------------------------

  useEffect(() => {
    let cancelled = false;

    async function loadProducts() {
      setLoadingProducts(true);

      try {
        const data = await requestJSON(`${API}/products`);

        if (cancelled) return;

        const productList = Array.isArray(data)
          ? data
          : data.products || data.content || data.data || [];

        if (productList.length > 0) {
          setProducts(productList.map(normalizeProduct));
          setApiWarning("");
        } else {
          setProducts(FALLBACK_PRODUCTS);
          setApiWarning(
            "No products were returned by the backend. Showing demo products."
          );
        }
      } catch (error) {
        if (cancelled) return;

        console.error("Product loading error:", error);

        setProducts(FALLBACK_PRODUCTS);

        setApiWarning(
          "Backend products could not be loaded. Demo products are shown; checkout still requires a working backend."
        );
      } finally {
        if (!cancelled) {
          setLoadingProducts(false);
        }
      }
    }

    loadProducts();

    return () => {
      cancelled = true;
    };
  }, []);

  // ----------------------------------------------------
  // FILTER AND SORT PRODUCTS
  // ----------------------------------------------------

  const filteredProducts = useMemo(() => {
    let result = products.filter((product) => {
      const matchesSearch =
        product.name
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        product.description
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        product.category
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesCategory =
        selectedCategory === "All" ||
        product.category.toLowerCase() ===
          selectedCategory.toLowerCase();

      return matchesSearch && matchesCategory;
    });

    if (sortBy === "price-low") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-high") {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === "name") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [products, search, selectedCategory, sortBy]);

  // ----------------------------------------------------
  // CART TOTALS
  // ----------------------------------------------------

  const cartCount = cart.reduce(
    (total, item) => total + Number(item.quantity || 0),
    0
  );

  const subtotal = cart.reduce(
    (total, item) =>
      total +
      Number(item.price || 0) *
        Number(item.quantity || 0),
    0
  );

  // ----------------------------------------------------
  // ADD TO CART
  // ----------------------------------------------------

  function addToCart(product) {
    const normalized = normalizeProduct(product);

    setCart((previousCart) => {
      const existing = previousCart.find(
        (item) => String(item.id) === String(normalized.id)
      );

      if (existing) {
        return previousCart.map((item) =>
          String(item.id) === String(normalized.id)
            ? {
                ...item,
                quantity: Number(item.quantity || 1) + 1,
              }
            : item
        );
      }

      return [
        ...previousCart,
        {
          ...normalized,
          quantity: 1,
        },
      ];
    });

    setMessage(`${normalized.name} added to cart.`);
    setCartOpen(true);
  }

  // ----------------------------------------------------
  // UPDATE CART QUANTITY
  // ----------------------------------------------------

  function updateQuantity(productId, change) {
    setCart((previousCart) =>
      previousCart
        .map((item) => {
          if (String(item.id) !== String(productId)) {
            return item;
          }

          return {
            ...item,
            quantity: Number(item.quantity || 1) + change,
          };
        })
        .filter((item) => item.quantity > 0)
    );
  }

  // ----------------------------------------------------
  // REMOVE FROM CART
  // ----------------------------------------------------

  function removeFromCart(productId) {
    setCart((previousCart) =>
      previousCart.filter(
        (item) => String(item.id) !== String(productId)
      )
    );
  }

  // ----------------------------------------------------
  // LOGIN AND REGISTER FORM
  // ----------------------------------------------------

  function handleAuthInput(event) {
    const { name, value } = event.target;

    setAuthForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  // ----------------------------------------------------
  // LOGIN / REGISTER
  // ----------------------------------------------------

  async function handleAuthSubmit(event) {
    event.preventDefault();

    setAuthLoading(true);
    setMessage("");

    try {
      const isRegister = authMode === "register";

      const endpoint = isRegister
        ? `${API}/auth/register`
        : `${API}/auth/login`;

      const payload = isRegister
        ? {
            name: authForm.name.trim(),
            fullName: authForm.name.trim(),
            email: authForm.email.trim(),
            password: authForm.password,
          }
        : {
            email: authForm.email.trim(),
            password: authForm.password,
          };

      const result = await requestJSON(endpoint, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      const responseUser =
        result.user ||
        result.customer ||
        result.data?.user ||
        result.data ||
        result;

      const name =
        responseUser.name ||
        responseUser.fullName ||
        responseUser.customerName ||
        (isRegister ? authForm.name.trim() : "") ||
        authForm.email.split("@")[0];

      const email =
        responseUser.email || authForm.email.trim();

      const authenticatedUser = {
        ...responseUser,
        name,
        fullName: name,
        customerName: name,
        email,
      };

      const receivedToken =
        result.token ||
        result.accessToken ||
        result.jwt ||
        result.data?.token ||
        "";

      setUser(authenticatedUser);
      setToken(receivedToken);

      if (receivedToken) {
        localStorage.setItem(TOKEN_KEY, receivedToken);
      }

      setAuthOpen(false);

      setAuthForm({
        name: "",
        email: "",
        password: "",
      });

      setMessage(
        isRegister
          ? "Account created successfully."
          : "Login successful."
      );
    } catch (error) {
      console.error("Authentication error:", error);

      setMessage(
        `Authentication failed: ${error.message}`
      );
    } finally {
      setAuthLoading(false);
    }
  }

  // ----------------------------------------------------
  // LOGOUT
  // ----------------------------------------------------

  function handleLogout() {
    setUser(null);
    setToken("");

    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(TOKEN_KEY);

    setMessage("You have logged out.");
  }

  // ----------------------------------------------------
  // CHECKOUT - CASH ON DELIVERY
  // ----------------------------------------------------

  async function checkout() {
    if (checkoutLoading) return;

    setMessage("");

    if (!cart.length) {
      setMessage("Your cart is empty.");
      return;
    }

    // Retrieve the customer name from the current user.
    const storedUser = readJSON(USER_KEY, null);

    let customerName = String(
      user?.customerName ||
        user?.fullName ||
        user?.name ||
        user?.username ||
        storedUser?.customerName ||
        storedUser?.fullName ||
        storedUser?.name ||
        storedUser?.username ||
        ""
    ).trim();

    // If no name was saved during login, ask for it.
    if (!customerName) {
      const enteredName = window.prompt(
        "Enter your full name for delivery:"
      );

      if (!enteredName || !enteredName.trim()) {
        setMessage("Customer name is required.");
        return;
      }

      customerName = enteredName.trim();

      const updatedUser = {
        ...(user || {}),
        name: customerName,
        fullName: customerName,
        customerName,
      };

      setUser(updatedUser);
    }

    const phone = window.prompt(
      "Enter your phone number:"
    );

    if (!phone || !phone.trim()) {
      setMessage("Phone number is required.");
      return;
    }

    const address = window.prompt(
      "Enter your complete delivery address:"
    );

    if (!address || !address.trim()) {
      setMessage("Delivery address is required.");
      return;
    }

    // Convert cart items to the DTO structure expected
    // by CreateOrderRequest and OrderItemRequest.
    const items = cart.map((item) => ({
      productId: Number(item.productId ?? item.id),
      name: item.name,
      price: Number(item.price),
      quantity: Number(item.quantity || 1),
    }));

    const invalidItem = items.some(
      (item) =>
        !Number.isFinite(item.productId) ||
        item.productId <= 0 ||
        !Number.isFinite(item.price) ||
        item.price < 0 ||
        !Number.isInteger(item.quantity) ||
        item.quantity <= 0
    );

    if (invalidItem) {
      setMessage(
        "One or more cart items have invalid product details. Please refresh the products and try again."
      );
      return;
    }

    const orderPayload = {
      customerName,
      phone: phone.trim(),
      address: address.trim(),
      paymentMethod: "COD",
      items,
    };

    // Inspect this payload in the browser console if needed.
    console.log("Submitting COD order:", orderPayload);

    setCheckoutLoading(true);

    try {
      const headers = {
        "Content-Type": "application/json",
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const result = await requestJSON(`${API}/orders`, {
        method: "POST",
        headers,
        body: JSON.stringify(orderPayload),
      });

      console.log("Order response:", result);

      setCart([]);
      setCartOpen(false);

      const orderId =
        result.orderId ?? result.id ?? "Confirmed";

      setMessage(
        `Order placed successfully! Order ID: ${orderId}. Payment method: Cash on Delivery.`
      );

      window.alert(
        `Order placed successfully!\n\nOrder ID: ${orderId}\nCustomer: ${customerName}\nTotal: ${formatPrice(subtotal)}\nPayment: Cash on Delivery`
      );
    } catch (error) {
      console.error("Checkout error:", error);

      setMessage(`Could not place order: ${error.message}`);
    } finally {
      setCheckoutLoading(false);
    }
  }

  // ----------------------------------------------------
  // UI
  // ----------------------------------------------------

  return (
    <div className="shop-app">
      {/* HEADER */}
      <header className="shop-header">
        <div className="shop-container header-content">
          <a
            href="#home"
            className="shop-logo"
            onClick={() => {
              setSearch("");
              setSelectedCategory("All");
            }}
          >
            <span className="logo-icon">S</span>
            <span>ShopSphere</span>
          </a>

          <nav className="shop-navigation">
            <a href="#home">Home</a>
            <a href="#products">Products</a>
            <a href="#categories">Categories</a>
          </nav>

          <div className="header-actions">
            <button
              type="button"
              className="icon-button cart-button"
              onClick={() => setCartOpen(true)}
              aria-label="Open shopping cart"
            >
              🛒
              <span>Cart</span>
              <span className="cart-count">{cartCount}</span>
            </button>

            {user ? (
              <div className="user-actions">
                <span className="welcome-user">
                  Hi, {user.name || user.fullName || "Customer"}
                </span>

                <button
                  type="button"
                  className="secondary-button"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="primary-button"
                onClick={() => {
                  setAuthMode("login");
                  setAuthOpen(true);
                }}
              >
                Login
              </button>
            )}
          </div>
        </div>
      </header>

      {/* NOTIFICATION */}
      {message && (
        <div className="shop-container">
          <div className="status-message" role="status">
            <span>{message}</span>

            <button
              type="button"
              onClick={() => setMessage("")}
              aria-label="Dismiss message"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* HERO */}
      <main>
        <section className="shop-hero" id="home">
          <div className="shop-container hero-content">
            <div className="hero-text">
              <span className="hero-badge">
                ✨ Welcome to ShopSphere
              </span>

              <h1>
                Discover Products.
                <br />
                <span>Love Every Purchase.</span>
              </h1>

              <p>
                Explore quality products across electronics,
                fashion, home essentials, beauty, and accessories.
                Find your favorites in one place.
              </p>

              <div className="hero-actions">
                <a href="#products" className="primary-button">
                  Shop Now →
                </a>

                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setCartOpen(true)}
                >
                  View Cart ({cartCount})
                </button>
              </div>

              <div className="hero-features">
                <span>✓ Quality Products</span>
                <span>✓ Secure Accounts</span>
                <span>✓ Cash on Delivery</span>
              </div>
            </div>

            <div className="hero-image">
              <img
                src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1000"
                alt="ShopSphere shopping collection"
              />

              <div className="hero-floating-card">
                <span className="floating-icon">📦</span>

                <div>
                  <strong>Easy Shopping</strong>
                  <p>Order online, pay on delivery</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CATEGORIES */}
        <section
          className="shop-section categories-section"
          id="categories"
        >
          <div className="shop-container">
            <div className="section-heading">
              <span className="section-eyebrow">
                SHOP BY CATEGORY
              </span>

              <h2>Explore Our Collections</h2>

              <p>
                Find the products you need from your favorite
                categories.
              </p>
            </div>

            <div className="category-list">
              {CATEGORIES.map((category) => (
                <button
                  type="button"
                  key={category}
                  className={
                    selectedCategory === category
                      ? "category-button active"
                      : "category-button"
                  }
                  onClick={() => {
                    setSelectedCategory(category);

                    document
                      .getElementById("products")
                      ?.scrollIntoView({
                        behavior: "smooth",
                      });
                  }}
                >
                  {category === "All" && "✨"}
                  {category === "Electronics" && "💻"}
                  {category === "Fashion" && "👕"}
                  {category === "Home" && "🏠"}
                  {category === "Beauty" && "✨"}
                  {category === "Accessories" && "⌚"}

                  <span>{category}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* PRODUCTS */}
        <section className="shop-section products-section" id="products">
          <div className="shop-container">
            <div className="products-heading">
              <div className="section-heading">
                <span className="section-eyebrow">
                  OUR STORE
                </span>

                <h2>Featured Products</h2>

                <p>
                  Discover products selected for your everyday needs.
                </p>
              </div>

              <div className="product-controls">
                <input
                  type="search"
                  className="search-input"
                  placeholder="Search products..."
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  aria-label="Search products"
                />

                <select
                  className="sort-select"
                  value={sortBy}
                  onChange={(event) =>
                    setSortBy(event.target.value)
                  }
                  aria-label="Sort products"
                >
                  <option value="featured">Featured</option>
                  <option value="price-low">
                    Price: Low to High
                  </option>
                  <option value="price-high">
                    Price: High to Low
                  </option>
                  <option value="name">Name: A to Z</option>
                </select>
              </div>
            </div>

            {apiWarning && (
              <div className="api-warning">
                {apiWarning}
              </div>
            )}

            {loadingProducts ? (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>Loading products...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🔍</div>

                <h3>No products found</h3>

                <p>
                  Try a different search term or category.
                </p>

                <button
                  type="button"
                  className="primary-button"
                  onClick={() => {
                    setSearch("");
                    setSelectedCategory("All");
                  }}
                >
                  Show All Products
                </button>
              </div>
            ) : (
              <div className="product-grid">
                {filteredProducts.map((product) => (
                  <article
                    className="product-card"
                    key={product.id}
                  >
                    <div className="product-image-wrap">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="product-image"
                        loading="lazy"
                        onError={(event) => {
                          event.currentTarget.onerror = null;
                          event.currentTarget.src =
                            DEMO_IMAGES[product.category] ||
                            DEMO_IMAGES.Electronics;
                        }}
                      />

                      <span className="product-category">
                        {product.category}
                      </span>
                    </div>

                    <div className="product-info">
                      <h3>{product.name}</h3>

                      <p className="product-description">
                        {product.description}
                      </p>

                      <div className="product-price-row">
                        <span className="product-price">
                          {formatPrice(product.price)}
                        </span>
                      </div>

                      <button
                        type="button"
                        className="add-cart-button"
                        onClick={() => addToCart(product)}
                      >
                        + Add to Cart
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* COD BANNER */}
        <section className="shop-section cod-section">
          <div className="shop-container">
            <div className="cod-banner">
              <div className="cod-icon">💵</div>

              <div>
                <span className="section-eyebrow">
                  EASY CHECKOUT
                </span>

                <h2>Pay When Your Order Arrives</h2>

                <p>
                  Choose Cash on Delivery during checkout.
                  Place your order and pay when it is delivered.
                </p>
              </div>

              <button
                type="button"
                className="primary-button"
                onClick={() => setCartOpen(true)}
              >
                View My Cart →
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="shop-footer">
        <div className="shop-container footer-content">
          <a href="#home" className="shop-logo footer-logo">
            <span className="logo-icon">S</span>
            <span>ShopSphere</span>
          </a>

          <p>
            Your everyday shopping destination.
          </p>

          <span>
            © {new Date().getFullYear()} ShopSphere. All rights
            reserved.
          </span>
        </div>
      </footer>

      {/* CART DRAWER */}
      {cartOpen && (
        <div
          className="overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setCartOpen(false);
            }
          }}
        >
          <aside className="cart-drawer">
            <div className="drawer-header">
              <div>
                <h2>Your Shopping Cart</h2>

                <p>
                  {cartCount} item{cartCount !== 1 ? "s" : ""}
                </p>
              </div>

              <button
                type="button"
                className="close-button"
                onClick={() => setCartOpen(false)}
                aria-label="Close cart"
              >
                ×
              </button>
            </div>

            <div className="cart-items">
              {cart.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">🛒</div>

                  <h3>Your cart is empty</h3>

                  <p>Add some products to get started.</p>

                  <button
                    type="button"
                    className="primary-button"
                    onClick={() => setCartOpen(false)}
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    className="cart-item"
                    key={item.id}
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      onError={(event) => {
                        event.currentTarget.onerror = null;
                        event.currentTarget.src =
                          DEMO_IMAGES[item.category] ||
                          DEMO_IMAGES.Electronics;
                      }}
                    />

                    <div className="cart-item-info">
                      <h3>{item.name}</h3>

                      <p>{formatPrice(item.price)}</p>

                      <div className="quantity-controls">
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(item.id, -1)
                          }
                          aria-label={`Decrease ${item.name} quantity`}
                        >
                          −
                        </button>

                        <span>{item.quantity}</span>

                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(item.id, 1)
                          }
                          aria-label={`Increase ${item.name} quantity`}
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="cart-item-end">
                      <strong>
                        {formatPrice(
                          item.price * item.quantity
                        )}
                      </strong>

                      <button
                        type="button"
                        className="remove-item"
                        onClick={() =>
                          removeFromCart(item.id)
                        }
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="cart-summary">
                <div className="summary-row">
                  <span>Subtotal</span>
                  <strong>{formatPrice(subtotal)}</strong>
                </div>

                <div className="summary-row">
                  <span>Delivery</span>
                  <strong>Calculated by store</strong>
                </div>

                <div className="summary-row total-row">
                  <span>Cart Total</span>
                  <strong>{formatPrice(subtotal)}</strong>
                </div>

                <div className="payment-note">
                  <span>💵</span>

                  <div>
                    <strong>Cash on Delivery</strong>
                    <p>Pay when your order arrives.</p>
                  </div>
                </div>

                <button
                  type="button"
                  className="checkout-button"
                  onClick={checkout}
                  disabled={checkoutLoading}
                >
                  {checkoutLoading
                    ? "Placing Order..."
                    : `Place COD Order · ${formatPrice(subtotal)}`}
                </button>

                <button
                  type="button"
                  className="continue-shopping"
                  onClick={() => setCartOpen(false)}
                  disabled={checkoutLoading}
                >
                  Continue Shopping
                </button>
              </div>
            )}
          </aside>
        </div>
      )}

      {/* LOGIN / REGISTER MODAL */}
      {authOpen && (
        <div
          className="overlay auth-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setAuthOpen(false);
            }
          }}
        >
          <div className="auth-modal">
            <button
              type="button"
              className="close-button auth-close"
              onClick={() => setAuthOpen(false)}
              aria-label="Close authentication dialog"
            >
              ×
            </button>

            <div className="auth-logo">
              <span className="logo-icon">S</span>
            </div>

            <h2>
              {authMode === "login"
                ? "Welcome Back"
                : "Create Your Account"}
            </h2>

            <p className="auth-subtitle">
              {authMode === "login"
                ? "Log in to continue shopping."
                : "Join ShopSphere and start shopping."}
            </p>

            <form
              className="auth-form"
              onSubmit={handleAuthSubmit}
            >
              {authMode === "register" && (
                <label>
                  Full Name

                  <input
                    type="text"
                    name="name"
                    placeholder="Enter your full name"
                    value={authForm.name}
                    onChange={handleAuthInput}
                    required
                    autoComplete="name"
                  />
                </label>
              )}

              <label>
                Email Address

                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={authForm.email}
                  onChange={handleAuthInput}
                  required
                  autoComplete="email"
                />
              </label>

              <label>
                Password

                <input
                  type="password"
                  name="password"
                  placeholder="Enter your password"
                  value={authForm.password}
                  onChange={handleAuthInput}
                  required
                  minLength={6}
                  autoComplete={
                    authMode === "login"
                      ? "current-password"
                      : "new-password"
                  }
                />
              </label>

              <button
                type="submit"
                className="checkout-button"
                disabled={authLoading}
              >
                {authLoading
                  ? "Please wait..."
                  : authMode === "login"
                    ? "Login"
                    : "Create Account"}
              </button>
            </form>

            <div className="auth-switch">
              {authMode === "login"
                ? "Don't have an account?"
                : "Already have an account?"}

              <button
                type="button"
                onClick={() => {
                  setAuthMode(
                    authMode === "login"
                      ? "register"
                      : "login"
                  );

                  setAuthForm({
                    name: "",
                    email: "",
                    password: "",
                  });
                }}
              >
                {authMode === "login"
                  ? "Register"
                  : "Login"}
              </button>
            </div>

            <p className="auth-security-note">
              Your account must be authenticated by the backend.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}