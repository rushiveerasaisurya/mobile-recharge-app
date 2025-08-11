import React, { useState, useEffect } from "react";
import { Form, Button, Alert } from "react-bootstrap";
import { Link } from "react-router-dom";
import { Lock } from "lucide-react";
import apiService from "../services/api";
import emailjs from "@emailjs/browser";

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // Step 1: Enter mobile number, Step 2: Enter OTP and new password, Step 3: Success
  const [mobileNumber, setMobileNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [otpSentTime, setOtpSentTime] = useState(null);
  const [requestCount, setRequestCount] = useState(0); // For rate limiting
  const [lastRequestTime, setLastRequestTime] = useState(null); // For rate limiting

  // Rate limiting and OTP expiration check
  useEffect(() => {
    const checkOtpExpiration = () => {
      if (otpSentTime) {
        const now = new Date();
        const timeDiff = (now - new Date(otpSentTime)) / 1000 / 60; // Time difference in minutes
        if (timeDiff > 10) { // OTP expires after 10 minutes
          setError("OTP has expired. Please request a new one.");
          setStep(1);
          setGeneratedOtp("");
          setOtpSentTime(null);
        }
      }
    };

    const interval = setInterval(checkOtpExpiration, 1000);
    return () => clearInterval(interval);
  }, [otpSentTime]);

  const handleGenerateOtp = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      // Rate limiting: 3 requests per hour
      const now = new Date();
      if (lastRequestTime) {
        const timeDiff = (now - new Date(lastRequestTime)) / 1000 / 60 / 60; // Time difference in hours
        if (timeDiff < 1 && requestCount >= 3) {
          throw new Error("Too many requests. Please try again later.");
        } else if (timeDiff >= 1) {
          setRequestCount(0); // Reset after 1 hour
        }
      }

      // Fetch user email by mobile number
      const response = await apiService.getEmail({ mobileNumber });
      if (response.success) {
        setEmail(response.email);
        setUserName(response.userName);

        // Generate OTP
        const newOtp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
        setGeneratedOtp(newOtp);
        setOtpSentTime(new Date());
        setRequestCount((prev) => prev + 1);
        setLastRequestTime(new Date());

        // Send OTP via EmailJS
        const emailParams = {
          user_name: userName || "User",
          otp: newOtp,
          to_email: response.email,
        };

        await emailjs.send(
          "service_bpf6k09",
          "template_ssc183d",
          emailParams,
          "BCqiBOn_dR7hgJgFQ"
        );

        setSuccess("OTP sent to your email!");
        setStep(2);
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError("Error generating OTP or sending email: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      // Verify OTP on the frontend
      if (otp !== generatedOtp) {
        throw new Error("Invalid OTP");
      }

      // Reset password
      const response = await apiService.resetPassword({
        email,
        newPassword,
      });
      if (response.success) {
        setSuccess("Password reset successfully! You can now log in.");
        setStep(3);
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError("Error resetting password: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-inner">
        <h3>Forgot Password</h3>
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}

        {step === 1 && (
          <Form onSubmit={handleGenerateOtp}>
            <Form.Group className="mb-3">
              <Form.Label>
                <Lock size={18} className="me-2" />
                Mobile Number
              </Form.Label>
              <Form.Control
                type="tel"
                placeholder="Enter your 10-digit mobile number"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                maxLength={10}
                required
              />
            </Form.Group>
            <Button
              variant="primary"
              type="submit"
              className="w-100"
              disabled={isLoading}
            >
              {isLoading ? "Sending OTP..." : "Send OTP"}
            </Button>
            <div className="text-center mt-3">
              <Link to="/login" className="text-decoration-none">
                Back to Login
              </Link>
            </div>
          </Form>
        )}

        {step === 2 && (
          <Form onSubmit={handleResetPassword}>
            <Form.Group className="mb-3">
              <Form.Label>OTP</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter the OTP sent to your email"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>New Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Enter your new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </Form.Group>
            <Button
              variant="primary"
              type="submit"
              className="w-100"
              disabled={isLoading}
            >
              {isLoading ? "Resetting..." : "Reset Password"}
            </Button>
            <div className="text-center mt-3">
              <Link to="/login" className="text-decoration-none">
                Back to Login
              </Link>
            </div>
          </Form>
        )}

        {step === 3 && (
          <div className="text-center">
            <Link to="/login" className="btn btn-primary">
              Go to Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;