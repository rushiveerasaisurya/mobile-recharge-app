import React, { useState } from "react";
import { Form, Button, Alert } from "react-bootstrap";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { User, Phone, Lock, Mail } from "lucide-react";

const Register = () => {
  const [name, setName] = useState("");
  const [mobileNumber, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const { register, isAuthenticated, isLoading, error, setError } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const validateForm = () => {
    if (!name.trim()) {
      setError("Name is required");
      return false;
    }

    if (!mobileNumber) {
      setError("Mobile number is required");
      return false;
    }

    if (!/^\d{10}$/.test(mobileNumber)) {
      setError("Please enter a valid 10-digit mobile number");
      return false;
    }

    if (!email.trim()) {
      setError("Email is required");
      return false;
    }

    if (!/^[A-Za-z0-9+_.-]+@(.+)$/.test(email)) {
      setError("Please enter a valid email address");
      return false;
    }

    if (!password) {
      setError("Password is required");
      return false;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return false;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Clear any existing error

    if (!validateForm()) {
      return;
    }

    const success = await register(name, mobileNumber, email, password);
    if (success) {
      navigate("/");
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-inner">
        <h3>Create Account</h3>

        {error && <Alert variant="danger">{error}</Alert>}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>
              <User size={18} className="me-2" />
              Full Name
            </Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>
              <Phone size={18} className="me-2" />
              Mobile Number
            </Form.Label>
            <Form.Control
              type="tel"
              placeholder="Enter your 10-digit mobile number"
              value={mobileNumber}
              onChange={(e) => setMobile(e.target.value)}
              maxLength={10}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>
              <Mail size={18} className="me-2" />
              Email Address
            </Form.Label>
            <Form.Control
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>
              <Lock size={18} className="me-2" />
              Password
            </Form.Label>
            <Form.Control
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label>
              <Lock size={18} className="me-2" />
              Confirm Password
            </Form.Label>
            <Form.Control
              type="password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </Form.Group>

          <Button
            variant="primary"
            type="submit"
            className="w-100"
            disabled={isLoading}
          >
            {isLoading ? "Creating Account..." : "Create Account"}
          </Button>

          <div className="text-center mt-3">
            Already have an account? <Link to="/login">Sign In</Link>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default Register;