import { useState } from "react";
import "./Login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(event) {
    event.preventDefault();

    setMessage("");
    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:8080/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Invalid email or password");
      }

      // Store the token for this browser session.
      if (data.token) {
        sessionStorage.setItem("token", data.token);
      }

      setMessage("Login successful!");

      // Redirect to your shop after successful login.
      window.location.href = "/shop";
    } catch (error) {
      setMessage(
        error.message === "Failed to fetch"
          ? "Cannot connect to the server. Please try again."
          : error.message
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-container">

        <div className="login-left">
          <div className="brand-logo">
            🛍️ Online Shop
          </div>

          <h1>
            Welcome Back!
          </h1>

          <p>
            Sign in to discover amazing products,
            explore exclusive offers, and enjoy
            a seamless shopping experience.
          </p>

          <div className="login-decoration">
            <span>🛒</span>
            <span>👕</span>
            <span>🎧</span>
            <span>⌚</span>
          </div>

          <p className="login-footer">
            Your shopping journey starts here.
          </p>
        </div>

        <div className="login-right">
          <h2>Sign In</h2>

          <p className="login-subtitle">
            Enter your details to access your account.
          </p>

          <form onSubmit={handleLogin}>

            <div className="form-group">
              <label htmlFor="email">
                Email Address
              </label>

              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                autoComplete="email"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">
                Password
              </label>

              <div className="password-wrapper">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  autoComplete="current-password"
                  required
                />

                <button
                  type="button"
                  className="show-password"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <div className="login-options">
              <label className="remember-me">
                <input type="checkbox" />
                Remember me
              </label>

              <a href="/forgot-password">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              className="login-button"
              disabled={loading}
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>

            {message && (
              <p
                className={
                  message === "Login successful!"
                    ? "login-message success"
                    : "login-message error"
                }
                role="status"
              >
                {message}
              </p>
            )}

          </form>

          <div className="signup-link">
            Don't have an account?
            {" "}
            <a href="/signup">
              Create Account
            </a>
          </div>

          <div className="login-bottom">
            Secure shopping starts with Online Shop.
          </div>
        </div>

      </div>
    </div>
  );
}

export default Login;