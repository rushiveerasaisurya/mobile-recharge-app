import React, { useState, useEffect } from "react";
import { Form, Button, Alert } from "react-bootstrap";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Phone, Lock, Eye, EyeOff } from "lucide-react";
import "../index.css";
const Login = () => {
  const [mobileNumber, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log("useEffect ran", { isAuthenticated, user });
    if (isAuthenticated && user) {
      if (user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    }
  }, [isAuthenticated, user, navigate]);

  const validateForm = () => {
    if (!mobileNumber) {
      setError("Mobile number is required");
      return false;
    }
    if (!/^\d{10}$/.test(mobileNumber)) {
      setError("Please enter a valid 10-digit mobile number");
      return false;
    }
    if (!password) {
      setError("Password is required");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const user = await login(mobileNumber, password);
      if (user) {
        // The useEffect will handle redirection based on user.role
        console.log("Login successful, user:", user);
        if (user.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/");
        }
      } else {
        setError("Invalid mobile number or password");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "An error occurred during login. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-inner">
        <h3>Sign In</h3>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>
              <Phone size={18} className="me-2" />
              Mobile Number
            </Form.Label>
            <Form.Control
              type="tel"
              placeholder="Enter your 10-digit mobile number"
              value={mobileNumber}
              onChange={(e) => {
                setMobile(e.target.value);
                setError("");
              }}
              maxLength={10}
              required
            />
          </Form.Group>
          <Form.Group className="mb-4">
            <Form.Label>
              <Lock size={18} className="me-2" />
              Password
            </Form.Label>
            <Form.Control
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              required
            />
            <span
                onClick={() => setShowPassword(!showPassword)}
                className="cursor-pointer d-flex align-items-center"
                style={{ color: 'var(--primary)', top: '50%', transform: 'translateY(-10%)' }}
              >
                {showPassword ? (
                  <>
                    <EyeOff size={18} className="me-1" />
                    <span>Hide Password</span>
                  </>
                ) : (
                  <>
                    <Eye size={18} className="me-1" />
                    <span>Show Password</span>
                  </>
                )}
              </span>
          </Form.Group>
          <Button
            variant="primary"
            type="submit"
            className="w-100"
            disabled={isLoading}
          >
            {isLoading ? "Signing In..." : "Sign In"}
          </Button>
          <div className="text-center mt-3">
            <Link to="/register" className="d-block mb-2">Create new account</Link>
            <Link to="/forgot-password" className="text-decoration-none">Forgot password?</Link>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default Login;
