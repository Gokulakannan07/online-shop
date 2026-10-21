import { useEffect, useMemo, useState } from "react";
import "./App.css";

const API = "/api";
const API_URL = "http://localhost:8080/api/products";

const CREATE_ORDER_URL =
  "http://localhost:8080/api/payment/create-order";

const VERIFY_PAYMENT_URL =
  "http://localhost:8080/api/payment/verify";

const RAZORPAY_SCRIPT =
  "https://checkout.razorpay.com/v1/checkout.js";

const CATEGORIES = [
  "All",
  "Electronics",
  "Fashion",
  "Accessories",
  "Home",
  "Beauty",
  "Sports",
];

const DEMO_IMAGES = {
  Electronics:
    "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=700&q=80",
  Fashion:
    "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=700&q=80",
  Accessories:
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=700&q=80",
  Home:
    "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&w=700&q=80",
  Beauty:
    "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=700&q=80",
  Sports:
    "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=700&q=80",
  Default:
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=700&q=80",
};

function getProductId(product) {
  return product.id ?? product.productId;
}

function getProductName(product) {
  return product.name ?? product.title ?? "Product";
}

function getProductPrice(product) {
  return Number(product.price ?? product.productPrice ?? 0);
}

function getProductImage(product) {
  const image =
    product.imageUrl ??
    product.image ??
    product.image_url ??
    product.thumbnail;

  if (typeof image === "string" && image.trim()) {
    return image;
  }

  const category = String(product.category ?? "").toLowerCase();

  if (category.includes("electronic")) {
    return DEMO_IMAGES.Electronics;
  }

  if (category.includes("fashion") || category.includes("cloth")) {
    return DEMO_IMAGES.Fashion;
  }

  if (category.includes("accessor")) {
    return DEMO_IMAGES.Accessories;
  }

  if (category.includes("home")) {
    return DEMO_IMAGES.Home;
  }

  if (category.includes("beauty")) {
    return DEMO_IMAGES.Beauty;
  }

  if (category.includes("sport")) {
    return DEMO_IMAGES.Sports;
  }

  return DEMO_IMAGES.Default;
}

function formatPrice(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
}

function readCart() {
  try {
    const cart = JSON.parse(localStorage.getItem("shop-cart") || "[]");
    return Array.isArray(cart) ? cart : [];
  } catch {
    return [];
  }
}

function readUser() {
  try {
    return JSON.parse(localStorage.getItem("shop-user") || "null");
  } catch {
    return null;
  }
}

function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productError, setProductError] = useState("");

  const [user, setUser] = useState(readUser);
  const [authMode, setAuthMode] = useState("login");
  const [authOpen, setAuthOpen] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authSuccess, setAuthSuccess] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("featured");

  const [cart, setCart] = useState(readCart);
  const [cartOpen, setCartOpen] = useState(false);

  const [paymentLoading, setPaymentLoading] = useState(false);
  const [notice, setNotice] = useState("");

  // Fetch products from Spring Boot.
  useEffect(() => {
    const controller = new AbortController();

    async function loadProducts() {
      setLoading(true);
      setProductError("");

      try {
        const response = await fetch(`${API}/products`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Products API returned HTTP ${response.status}`);
        }

        const data = await response.json();

        const list = Array.isArray(data)
          ? data
          : Array.isArray(data.content)
            ? data.content
            : Array.isArray(data.products)
              ? data.products
              : null;

        if (!list) {
          throw new Error("The products API did not return a product array.");
        }

        setProducts(list);
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Product loading failed:", error);
          setProductError(error.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadProducts();

    return () => controller.abort();
  }, []);

  // Persist cart.
  useEffect(() => {
    localStorage.setItem("shop-cart", JSON.stringify(cart));
  }, [cart]);

  // Product filtering and sorting.
  const filteredProducts = useMemo(() => {
    let result = products.filter((product) => {
      const name = getProductName(product).toLowerCase();
      const description = String(product.description ?? "").toLowerCase();
      const productCategory = String(product.category ?? "");

      const matchesSearch =
        name.includes(search.toLowerCase()) ||
        description.includes(search.toLowerCase());

      const matchesCategory =
        category === "All" ||
        productCategory.toLowerCase() === category.toLowerCase();

      return matchesSearch && matchesCategory;
    });

    if (sort === "low") {
      result = [...result].sort(
        (a, b) => getProductPrice(a) - getProductPrice(b)
      );
    }

    if (sort === "high") {
      result = [...result].sort(
        (a, b) => getProductPrice(b) - getProductPrice(a)
      );
    }

    if (sort === "name") {
      result = [...result].sort((a, b) =>
        getProductName(a).localeCompare(getProductName(b))
      );
    }

    return result;
  }, [products, search, category, sort]);

  const cartCount = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const subtotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  function addToCart(product) {
    const id = getProductId(product);

    if (id == null) {
      setNotice("This product is missing its ID.");
      return;
    }

    const price = getProductPrice(product);

    if (!Number.isFinite(price) || price <= 0) {
      setNotice("This product has an invalid price.");
      return;
    }

    setCart((current) => {
      const existing = current.find(
        (item) => String(item.id) === String(id)
      );

      if (existing) {
        return current.map((item) =>
          String(item.id) === String(id)
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [
        ...current,
        {
          id,
          name: getProductName(product),
          price,
          image: getProductImage(product),
          quantity: 1,
        },
      ];
    });

    setNotice(`${getProductName(product)} added to your cart.`);
  }

  function changeQuantity(id, amount) {
    setCart((current) =>
      current
        .map((item) =>
          String(item.id) === String(id)
            ? { ...item, quantity: item.quantity + amount }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  }

  function removeFromCart(id) {
    setCart((current) =>
      current.filter((item) => String(item.id) !== String(id))
    );
  }

  function openAuth(mode = "login") {
    setAuthMode(mode);
    setAuthError("");
    setAuthSuccess("");
    setAuthOpen(true);
  }

  function updateForm(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function submitAuth(event) {
    event.preventDefault();

    setAuthError("");
    setAuthSuccess("");
    setAuthLoading(true);

    try {
      const endpoint =
        authMode === "login"
          ? `${API}/auth/login`
          : `${API}/auth/register`;

      const payload =
        authMode === "login"
          ? {
              email: form.email.trim(),
              password: form.password,
            }
          : {
              name: form.name.trim(),
              email: form.email.trim(),
              password: form.password,
            };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          result.message ||
            result.error ||
            `Authentication failed: HTTP ${response.status}`
        );
      }

      if (authMode === "register") {
        setAuthSuccess("Registration successful. Please log in.");
        setAuthMode("login");

        setForm((current) => ({
          ...current,
          name: "",
          password: "",
        }));

        return;
      }

      const authenticatedUser =
        result.user ??
        result.customer ??
        (result.email ? result : null);

      const token = result.token ?? result.accessToken;

      if (!authenticatedUser && !token) {
        throw new Error(
          "Login succeeded, but the API response did not include a user or token. Check your backend response format."
        );
      }

      const savedUser = {
        name:
          authenticatedUser?.name ??
          authenticatedUser?.fullName ??
          form.email.split("@")[0],
        email: authenticatedUser?.email ?? form.email.trim(),
      };

      localStorage.setItem("shop-user", JSON.stringify(savedUser));

      if (token) {
        localStorage.setItem("shop-token", token);
      }

      setUser(savedUser);
      setAuthOpen(false);

      setForm({
        name: "",
        email: "",
        password: "",
      });

      setNotice("Welcome! You are logged in.");
    } catch (error) {
      console.error("Authentication error:", error);
      setAuthError(error.message);
    } finally {
      setAuthLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem("shop-user");
    localStorage.removeItem("shop-token");

    setUser(null);
    setNotice("You have logged out.");
  }

  function loadRazorpay() {
    return new Promise((resolve, reject) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const existing = document.querySelector(
        'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
      );

      if (existing) {
        existing.addEventListener("load", () => resolve(true), {
          once: true,
        });

        existing.addEventListener(
          "error",
          () => reject(new Error("Could not load Razorpay checkout.")),
          { once: true }
        );

        return;
      }

      const script = document.createElement("script");

      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve(true);

      script.onerror = () =>
        reject(new Error("Could not load Razorpay checkout."));

      document.body.appendChild(script);
    });
  }

  async function checkout() {
    if (cart.length === 0) {
      setNotice("Your cart is empty.");
      return;
    }

    if (!user) {
      setCartOpen(false);
      openAuth("login");
      setAuthError("Please log in before checking out.");
      return;
    }

    setPaymentLoading(true);
    setNotice("");

    try {
      await loadRazorpay();

      // This sends the amount in paise.
      // Production apps should validate product IDs, prices and quantities
      // on the backend before creating an order.
      const orderResponse = await fetch(
        `${API}/payment/create-order`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(localStorage.getItem("shop-token")
              ? {
                  Authorization: `Bearer ${localStorage.getItem("shop-token")}`,
                }
              : {}),
          },
          body: JSON.stringify({
            amount: Math.round(subtotal * 100),
          }),
        }
      );

      const order = await orderResponse.json().catch(() => ({}));

      if (!orderResponse.ok) {
        throw new Error(
          order.message ||
            order.error ||
            "Could not create the Razorpay order."
        );
      }

      const orderId = order.id ?? order.orderId;
      const key = order.key ?? order.keyId ?? order.razorpayKeyId;

      if (!orderId || !key) {
        throw new Error(
          "The backend response is missing the Razorpay order ID or key."
        );
      }

      const options = {
        key,
        amount: order.amount ?? Math.round(subtotal * 100),
        currency: order.currency ?? "INR",
        name: "ShopSphere",
        description: "Online Shop Purchase",
        order_id: orderId,

        prefill: {
          name: user.name,
          email: user.email,
        },

        theme: {
          color: "#635bff",
        },

        handler: async function (payment) {
          try {
            const verifyResponse = await fetch(
              `${API}/payment/verify`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  ...(localStorage.getItem("shop-token")
                    ? {
                        Authorization: `Bearer ${localStorage.getItem("shop-token")}`,
                      }
                    : {}),
                },
                body: JSON.stringify({
                  razorpay_order_id: payment.razorpay_order_id,
                  razorpay_payment_id: payment.razorpay_payment_id,
                  razorpay_signature: payment.razorpay_signature,
                }),
              }
            );

            const verification = await verifyResponse
              .json()
              .catch(() => ({}));

            if (
              !verifyResponse.ok ||
              verification.verified !== true
            ) {
              throw new Error(
                verification.message ||
                  verification.error ||
                  "Payment verification failed."
              );
            }

            setCart([]);
            setCartOpen(false);

            setNotice(
              `Payment successful! Payment ID: ${payment.razorpay_payment_id}`
            );
          } catch (error) {
            console.error("Payment verification error:", error);

            setNotice(
              `Payment was submitted, but verification failed. Do not retry blindly. Payment ID: ${payment.razorpay_payment_id}`
            );
          } finally {
            setPaymentLoading(false);
          }
        },

        modal: {
          ondismiss: () => {
            setPaymentLoading(false);
            setNotice("Payment window closed.");
          },
        },
      };

      const razorpay = new window.Razorpay(options);

      razorpay.on("payment.failed", (event) => {
        console.error("Razorpay payment failed:", event.error);

        setPaymentLoading(false);

        setNotice(
          event.error?.description || "Payment failed. Please try again."
        );
      });

      razorpay.open();
    } catch (error) {
      console.error("Checkout error:", error);

      setNotice(error.message || "Unable to start payment.");

      setPaymentLoading(false);
    }
  }

  return (
    <div className="shop">
      <div className="announcement">
        ✨ Discover something you'll love — welcome to ShopSphere
      </div>

      <header className="header">
        <a href="#home" className="brand">
          <span className="brand-icon">S</span>
          <span>ShopSphere</span>
        </a>

        <nav className="desktop-nav">
          <a href="#home">Home</a>
          <a href="#products">Products</a>
          <a href="#benefits">Why us?</a>
        </nav>

        <div className="header-actions">
          {user ? (
            <div className="user-area">
              <span className="welcome-user">Hi, {user.name}</span>

              <button className="text-button" onClick={logout}>
                Logout
              </button>
            </div>
          ) : (
            <button
              className="login-button"
              onClick={() => openAuth("login")}
            >
              Log in
            </button>
          )}

          <button
            className="cart-button"
            onClick={() => setCartOpen(true)}
            aria-label="Open shopping cart"
          >
            🛍️ Cart <span>{cartCount}</span>
          </button>
        </div>
      </header>

      <main>
        <section className="hero" id="home">
          <div className="hero-content">
            <span className="eyebrow">
              YOUR EVERYDAY DISCOVERY STORE
            </span>

            <h1>
              Find your next
              <br />
              <span>favorite thing.</span>
            </h1>

            <p>
              Explore thoughtfully selected products, discover
              great finds, and enjoy a smoother shopping experience.
            </p>

            <a href="#products" className="primary-button">
              Explore products <span>→</span>
            </a>

            <div className="hero-stats">
              <div>
                <strong>{products.length}+</strong>
                <span>Products</span>
              </div>

              <div>
                <strong>Secure</strong>
                <span>Checkout</span>
              </div>

              <div>
                <strong>Easy</strong>
                <span>Shopping</span>
              </div>
            </div>
          </div>

          <div className="hero-image">
            <img
              src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1100&q=85"
              alt="Modern shopping store"
            />

            <div className="floating-card">
              <span className="floating-icon">✦</span>
              <div>
                <strong>Your next great find</strong>
                <p>Just a click away.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="benefits" id="benefits">
          <div>
            <span>🚚</span>
            <div>
              <strong>Easy ordering</strong>
              <p>Simple shopping experience</p>
            </div>
          </div>

          <div>
            <span>🔒</span>
            <div>
              <strong>Secure payments</strong>
              <p>Razorpay checkout integration</p>
            </div>
          </div>

          <div>
            <span>💬</span>
            <div>
              <strong>Simple support</strong>
              <p>Clear order feedback</p>
            </div>
          </div>
        </section>

        <section className="products-section" id="products">
          <div className="section-heading">
            <div>
              <span className="eyebrow">MADE FOR YOUR STYLE</span>
              <h2>Explore our collection</h2>
              <p>Find something you'll want to take home.</p>
            </div>

            <span className="product-count">
              {filteredProducts.length} products
            </span>
          </div>

          <div className="product-tools">
            <label className="search-box">
              <span>⌕</span>

              <input
                type="search"
                placeholder="Search products..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </label>

            <select
              aria-label="Sort products"
              value={sort}
              onChange={(event) => setSort(event.target.value)}
            >
              <option value="featured">Featured</option>
              <option value="low">Price: Low to high</option>
              <option value="high">Price: High to low</option>
              <option value="name">Name: A to Z</option>
            </select>
          </div>

          <div className="category-list">
            {CATEGORIES.map((item) => (
              <button
                key={item}
                className={category === item ? "active" : ""}
                onClick={() => setCategory(item)}
              >
                {item}
              </button>
            ))}
          </div>

          {loading && (
            <div className="status-box">
              <div className="spinner" />
              <p>Loading your products...</p>
            </div>
          )}

          {!loading && productError && (
            <div className="error-box">
              <h3>Unable to load products</h3>

              <p>{productError}</p>

              <p>
                Check that Spring Boot is running on port 8080 and
                that <code>/api/products</code> returns JSON.
              </p>

              <button
                className="primary-button"
                onClick={() => window.location.reload()}
              >
                Try again
              </button>
            </div>
          )}

          {!loading &&
            !productError &&
            filteredProducts.length === 0 && (
              <div className="status-box">
                <h3>No products found</h3>
                <p>Try a different search or category.</p>

                <button
                  className="secondary-button"
                  onClick={() => {
                    setSearch("");
                    setCategory("All");
                  }}
                >
                  Clear filters
                </button>
              </div>
            )}

          {!loading && !productError && filteredProducts.length > 0 && (
            <div className="product-grid">
              {filteredProducts.map((product, index) => {
                const id = getProductId(product);
                const name = getProductName(product);
                const price = getProductPrice(product);
                const image = getProductImage(product);

                return (
                  <article
                    className="product-card"
                    key={id ?? `${name}-${index}`}
                  >
                    <div className="product-image">
                      <img
                        src={image}
                        alt={name}
                        loading="lazy"
                        onError={(event) => {
                          event.currentTarget.onerror = null;
                          event.currentTarget.src = DEMO_IMAGES.Default;
                        }}
                      />

                      <span className="product-tag">
                        {product.category || "Discover"}
                      </span>

                      <button
                        className="quick-add"
                        onClick={() => addToCart(product)}
                        aria-label={`Add ${name} to cart`}
                      >
                        +
                      </button>
                    </div>

                    <div className="product-info">
                      <span className="product-category">
                        {product.category || "SHOPSPHERE COLLECTION"}
                      </span>

                      <h3>{name}</h3>

                      <p className="product-description">
                        {product.description ||
                          "A great addition to your everyday essentials."}
                      </p>

                      <div className="product-bottom">
                        <strong>{formatPrice(price)}</strong>

                        <button
                          onClick={() => addToCart(product)}
                          className="add-button"
                        >
                          Add to cart
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>

      <footer className="footer">
        <a href="#home" className="brand">
          <span className="brand-icon">S</span>
          <span>ShopSphere</span>
        </a>

        <p>Discover more. Shop smarter.</p>

        <span>© {new Date().getFullYear()} ShopSphere</span>
      </footer>

      {notice && (
        <div className="toast" role="status">
          <span>{notice}</span>

          <button onClick={() => setNotice("")} aria-label="Dismiss">
            ×
          </button>
        </div>
      )}

      {/* Login and registration modal */}
      {authOpen && (
        <div
          className="modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setAuthOpen(false);
            }
          }}
        >
          <section className="auth-modal">
            <button
              className="modal-close"
              onClick={() => setAuthOpen(false)}
              aria-label="Close login"
            >
              ×
            </button>

            <div className="auth-logo">S</div>

            <span className="eyebrow">WELCOME TO SHOPSPHERE</span>

            <h2>
              {authMode === "login"
                ? "Welcome back"
                : "Create your account"}
            </h2>

            <p className="auth-subtitle">
              {authMode === "login"
                ? "Log in to continue shopping."
                : "Join us and discover your next favorite thing."}
            </p>

            <form onSubmit={submitAuth}>
              {authMode === "register" && (
                <label>
                  Full name

                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={updateForm}
                    placeholder="Enter your full name"
                    autoComplete="name"
                    required
                  />
                </label>
              )}

              <label>
                Email address

                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={updateForm}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
              </label>

              <label>
                Password

                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={updateForm}
                  placeholder="Enter your password"
                  autoComplete={
                    authMode === "login"
                      ? "current-password"
                      : "new-password"
                  }
                  minLength={6}
                  required
                />
              </label>

              {authError && (
                <div className="form-error">{authError}</div>
              )}

              {authSuccess && (
                <div className="form-success">{authSuccess}</div>
              )}

              <button
                type="submit"
                className="primary-button auth-submit"
                disabled={authLoading}
              >
                {authLoading
                  ? "Please wait..."
                  : authMode === "login"
                    ? "Log in"
                    : "Create account"}
              </button>
            </form>

            <p className="auth-switch">
              {authMode === "login"
                ? "Don't have an account?"
                : "Already have an account?"}

              <button
                onClick={() => {
                  setAuthMode(
                    authMode === "login" ? "register" : "login"
                  );

                  setAuthError("");
                  setAuthSuccess("");
                }}
              >
                {authMode === "login" ? " Sign up" : " Log in"}
              </button>
            </p>
          </section>
        </div>
      )}

      {/* Shopping cart drawer */}
      {cartOpen && (
        <div
          className="drawer-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setCartOpen(false);
            }
          }}
        >
          <aside className="cart-drawer">
            <div className="drawer-header">
              <div>
                <span className="eyebrow">YOUR SELECTION</span>
                <h2>Shopping cart ({cartCount})</h2>
              </div>

              <button
                className="modal-close"
                onClick={() => setCartOpen(false)}
                aria-label="Close cart"
              >
                ×
              </button>
            </div>

            {cart.length === 0 ? (
              <div className="empty-cart">
                <span>🛍️</span>
                <h3>Your cart is empty</h3>
                <p>Explore the collection and find something you love.</p>

                <button
                  className="primary-button"
                  onClick={() => setCartOpen(false)}
                >
                  Continue shopping
                </button>
              </div>
            ) : (
              <>
                <div className="cart-items">
                  {cart.map((item) => (
                    <div className="cart-item" key={item.id}>
                      <img src={item.image} alt={item.name} />

                      <div className="cart-item-details">
                        <h3>{item.name}</h3>

                        <strong>{formatPrice(item.price)}</strong>

                        <div className="quantity-controls">
                          <button
                            onClick={() =>
                              changeQuantity(item.id, -1)
                            }
                            aria-label="Decrease quantity"
                          >
                            −
                          </button>

                          <span>{item.quantity}</span>

                          <button
                            onClick={() =>
                              changeQuantity(item.id, 1)
                            }
                            aria-label="Increase quantity"
                          >
                            +
                          </button>

                          <button
                            className="remove-button"
                            onClick={() => removeFromCart(item.id)}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="cart-summary">
                  <div className="summary-line">
                    <span>Subtotal</span>
                    <strong>{formatPrice(subtotal)}</strong>
                  </div>

                  <p>
                    Final payable amount must be validated by the
                    backend before payment.
                  </p>

                  <button
                    className="primary-button checkout-button"
                    onClick={checkout}
                    disabled={paymentLoading}
                  >
                    {paymentLoading
                      ? "Processing..."
                      : `Pay ${formatPrice(subtotal)}`}
                  </button>

                  <div className="secure-note">
                    🔒 Checkout powered by Razorpay
                  </div>
                </div>
              </>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}

export default App;