import React, { useState, useEffect } from "react";
import { Container, Card, Row, Col, Form, Button, Alert } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import apiService from "../../services/api";
import emailjs from "@emailjs/browser";
import { CreditCard, CheckCircle, AlertTriangle } from "lucide-react";

const PaymentConfirmation = () => {
  const { planId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [plan, setPlan] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [step, setStep] = useState("confirm");
  const [paymentMethod, setPaymentMethod] = useState("card");

  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [nameOnCard, setNameOnCard] = useState("");

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    return parts.length ? parts.join(" ") : value;
  };

  const formatExpiryDate = (value) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    if (v.length > 2) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
    }
    return v;
  };

  const validateCardDetails = () => {
    if (paymentMethod !== "card") return true;
    const cardRegex = /^\d{4}\s\d{4}\s\d{4}\s\d{4}$/;
    const expiryRegex = /^(0[1-9]|1[0-2])\/[0-9]{2}$/;
    const cvvRegex = /^\d{3}$/;
    if (!cardRegex.test(cardNumber)) {
      setError("Invalid card number (16 digits required)");
      return false;
    }
    if (!expiryRegex.test(expiryDate)) {
      setError("Invalid expiry date (MM/YY)");
      return false;
    }
    if (!cvvRegex.test(cvv)) {
      setError("Invalid CVV (3 digits required)");
      return false;
    }
    if (!nameOnCard.trim()) {
      setError("Name on card is required");
      return false;
    }
    return true;
  };

  useEffect(() => {
    const fetchPlanDetails = async () => {
      if (!planId) {
        setError("Plan ID is missing");
        setIsLoading(false);
        return;
      }
      try {
        setIsLoading(true);
        const response = await apiService.getPlan(planId);
        if (response.success && response.data) {
          setPlan(response.data);
        } else {
          setError("Failed to load plan details");
        }
      } catch (err) {
        console.error("Error fetching plan details:", err);
        setError("An error occurred while fetching plan details");
      } finally {
        setIsLoading(false);
      }
    };
    fetchPlanDetails();
  }, [planId]);

  const handleProceedToPayment = () => {
    setStep("payment");
  };
const calculateValidityDate = () => {
    if (!plan?.validity) return "N/A";
    const match = plan.validity.match(/^(\d+)\s+days$/i);
    const days = match ? parseInt(match[1]) : 30;
    const currentDate = new Date("2025-06-10T01:15:00+05:30"); // June 10, 2025, 01:15 AM IST
    const validityEndDate = new Date(currentDate.getTime() + days * 24 * 60 * 60 * 1000);
    return validityEndDate.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };
  const formatRechargeDate = () => {
    const currentDate = new Date("2025-06-05T01:02:00+05:30"); // June 05, 2025, 01:02 AM IST
    return currentDate.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };
  const handleSubmitPayment = async (e) => {
    e.preventDefault();
    if (!plan || !user) {
      setError("User or plan details missing");
      return;
    }
    if (!validateCardDetails()) return;

    try {
     setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const validityDays = plan.validity.match(/^(\d+)\s+days$/i)?.[1] || 30; // Extract validity days
      const rechargeData = {
        userId: user.id,
        userName: user.name,
        mobile: user.mobileNumber, // Added mobile
        planName: plan.name,
        validityDays: parseInt(validityDays),
        amount: plan.price,
        paymentMethod,
      };
      const response = await apiService.performRecharge(rechargeData);
      if (response.success) {
        // Fetch user's email to send the confirmation
        const emailResponse = await apiService.getEmail({ mobileNumber: user.mobileNumber });
        if (emailResponse.success) {
          const emailParams = {
            user_name: user.name || "User",
            mobile_number: user.mobileNumber,
            plan_name: plan.name,
            amount: plan.price,
            validity: plan.validity, // e.g., "28 days"
            validity_date: calculateValidityDate(), // e.g., "03 Jul 2025"
            data: plan.data || "N/A",
            calls: plan.calls || "N/A",
            sms: plan.sms || "N/A",
            benefits: plan.benefits ? plan.benefits.join(", ") : "None", // Join array into string
            payment_method: paymentMethod.toUpperCase(), // e.g., "CARD"
            date: formatRechargeDate(), // e.g., "05 Jun 2025"
            email: emailResponse.email,
          };

          // Send email using EmailJS
          await emailjs.send(
            "service_bpf6k09",
            "template_oo64rft",
            emailParams,
            "BCqiBOn_dR7hgJgFQ"
          );
          
        } else {
          console.error("Failed to fetch user email for confirmation:", emailResponse.message);
        }

        setStep("success");
      } else {
        setError(response.error || "Payment failed. Please try again.");
      }
    } catch (err) {
      console.error("Error processing payment or sending email:", err);
      setError("An error occurred during payment processing or email sending");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToPlans = () => {
    navigate("/plans/popular");
  };

  const handleBackToDashboard = () => {
    navigate("/");
  };

  if (isLoading) {
    return (
      <Container className="page-transition py-5 text-center">
        <p>Loading plan details...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="page-transition py-5">
        <Alert variant="danger" onClose={() => setError("")} dismissible>
          <AlertTriangle size={18} className="me-2" />
          {error}
        </Alert>
        <div className="text-center mt-4">
          <Button variant="primary" onClick={handleBackToPlans}>
            Back to Plans
          </Button>
        </div>
      </Container>
    );
  }

  if (!plan) {
    return (
      <Container className="page-transition py-5">
        <Alert variant="warning" onClose={() => setError("")} dismissible>
          <AlertTriangle size={18} className="me-2" />
          Plan not found. Please select another plan.
        </Alert>
        <div className="text-center mt-4">
          <Button variant="primary" onClick={handleBackToPlans}>
            Browse Plans
          </Button>
        </div>
      </Container>
    );
  }

  if (step === "success") {
    return (
      <Container className="page-transition py-5">
        <Row className="justify-content-center">
          <Col md={8} lg={6}>
            <Card className="border-0 shadow">
              <Card.Body className="text-center p-5">
                <div className="mb-4">
                  <CheckCircle size={80} className="text-success" />
                </div>
                <h2 className="mb-4">Recharge Successful!</h2>
                <p className="mb-3">
                  You have successfully recharged <strong>{user?.mobileNumber}</strong> with{" "}
                  <strong>{plan.name}</strong>.
                </p>
                <p className="mb-4">
                  Your plan is now active and valid till <strong>{calculateValidityDate()}</strong>.
                </p>
                <Button
                  variant="primary"
                  size="lg"
                  className="px-4"
                  onClick={handleBackToDashboard}
                >
                  Back to Dashboard
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }

  if (step === "payment") {
    return (
      <Container className="page-transition py-4">
        <h2 className="mb-4">Payment</h2>
        {error && (
          <Alert variant="danger" onClose={() => setError("")} dismissible>
            {error}
          </Alert>
        )}
        <Row>
          <Col lg={8}>
            <Card className="mb-4">
              <Card.Body>
                <h5 className="mb-4">Select Payment Method</h5>
                <Form.Group className="mb-4">
                  <div className="d-flex flex-wrap gap-3">
                    <div className="form-check payment-method">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="paymentMethod"
                        id="card"
                        value="card"
                        checked={paymentMethod === "card"}
                        onChange={() => setPaymentMethod("card")}
                      />
                      <label className="form-check-label d-flex align-items-center" htmlFor="card">
                        <CreditCard size={20} className="me-2" />
                        Credit/Debit Card
                      </label>
                    </div>
                    <div className="form-check payment-method">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="paymentMethod"
                        id="netbanking"
                        value="netbanking"
                        checked={paymentMethod === "netbanking"}
                        onChange={() => setPaymentMethod("netbanking")}
                      />
                      <label className="form-check-label" htmlFor="netbanking">
                        Net Banking
                      </label>
                    </div>
                    <div className="form-check payment-method">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="paymentMethod"
                        id="upi"
                        value="upi"
                        checked={paymentMethod === "upi"}
                        onChange={() => setPaymentMethod("upi")}
                      />
                      <label className="form-check-label" htmlFor="upi">
                        UPI
                      </label>
                    </div>
                    <div className="form-check payment-method">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="paymentMethod"
                        id="wallet"
                        value="wallet"
                        checked={paymentMethod === "wallet"}
                        onChange={() => setPaymentMethod("wallet")}
                      />
                      <label className="form-check-label" htmlFor="wallet">
                        Wallet
                      </label>
                    </div>
                  </div>
                </Form.Group>
                {paymentMethod === "card" && (
                  <Form onSubmit={handleSubmitPayment}>
                    <Form.Group className="mb-3">
                      <Form.Label>Card Number</Form.Label>
                      <Form.Control
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                        required
                      />
                    </Form.Group>
                    <Row className="mb-3">
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>Expiry Date</Form.Label>
                          <Form.Control
                            type="text"
                            value={expiryDate}
                            onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
                            placeholder="MM/YY"
                            maxLength={5}
                            required
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>CVV</Form.Label>
                          <Form.Control
                            type="password"
                            value={cvv}
                            onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 3))}
                            placeholder="123"
                            maxLength={3}
                            required
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    <Form.Group className="mb-4">
                      <Form.Label>Name on Card</Form.Label>
                      <Form.Control
                        type="text"
                        value={nameOnCard}
                        onChange={(e) => setNameOnCard(e.target.value)}
                        placeholder="John Smith"
                        required
                      />
                    </Form.Group>
                    <div className="d-grid gap-2">
                      <Button variant="primary" type="submit" disabled={isLoading}>
                        {isLoading ? "Processing..." : `Pay ₹${plan.price}`}
                      </Button>
                      <Button variant="outline-secondary" onClick={() => setStep("confirm")}>
                        Back
                      </Button>
                    </div>
                  </Form>
                )}
                {paymentMethod !== "card" && (
                  <div className="text-center py-4">
                    <p className="mb-4">For demo purposes, only card payment is implemented.</p>
                    <Button
                      variant="primary"
                      onClick={handleSubmitPayment}
                      disabled={isLoading}
                    >
                      {isLoading ? "Processing..." : `Complete Payment (₹${plan.price})`}
                    </Button>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
          <Col lg={4}>
            <Card>
              <Card.Header className="bg-primary text-white">Order Summary</Card.Header>
              <Card.Body>
                <div className="mb-3">
                  <strong>Mobile Number:</strong> {user?.mobileNumber}
                </div>
                <div className="mb-3">
                  <strong>Plan:</strong> {plan.name}
                </div>
                <div className="mb-3">
                  <strong>Validity:</strong> {plan.validity}
                </div>
                <div className="mb-3">
                  <strong>Data:</strong> {plan.data}
                </div>
                <hr />
                <div className="d-flex justify-content-between mb-3">
                  <span>Plan Price:</span>
                  <span>₹{plan.price}</span>
                </div>
                <div className="d-flex justify-content-between mb-3">
                  <span>Taxes & Fees:</span>
                  <span>₹0</span>
                </div>
                <div className="d-flex justify-content-between fw-bold">
                  <span>Total Amount:</span>
                  <span>₹{plan.price}</span>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <Container className="page-transition">
      <h2 className="mb-4">Confirm Recharge</h2>
      {error && (
        <Alert variant="danger" onClose={() => setError("")} dismissible>
          {error}
        </Alert>
      )}
      <Row>
        <Col md={8}>
          <Card className="mb-4">
            <Card.Body>
              <h4 className="mb-4">{plan.name}</h4>
              <Row className="mb-4">
                <Col sm={4}>
                  <div className="mb-3">
                    <strong>Price:</strong>
                    <div className="fs-4 text-primary">₹{plan.price}</div>
                  </div>
                </Col>
                <Col sm={4}>
                  <div className="mb-3">
                    <strong>Validity:</strong>
                    <div>{plan.validity}</div>
                  </div>
                </Col>
                <Col sm={4}>
                  <div className="mb-3">
                    <strong>Data:</strong>
                    <div>{plan.data}</div>
                  </div>
                </Col>
              </Row>
              <div className="mb-3">
                <strong>Calls:</strong> {plan.calls}
              </div>
              <div className="mb-3">
                <strong>SMS:</strong> {plan.sms}
              </div>
              <div className="mb-4">
                <strong>Benefits:</strong>
                <ul className="mt-2">
                  {plan.benefits.map((benefit, index) => (
                    <li key={index}>{benefit}</li>
                  ))}
                </ul>
              </div>
              <div className="d-flex gap-2">
                <Button variant="primary" onClick={handleProceedToPayment}>
                  Proceed to Payment
                </Button>
                <Button variant="outline-secondary" onClick={handleBackToPlans}>
                  Back to Plans
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card>
            <Card.Header className="bg-primary text-white">Mobile Details</Card.Header>
            <Card.Body>
              <div className="mb-3">
                <strong>Number:</strong> {user?.mobileNumber}
              </div>
              <div className="mb-3">
                <strong>Operator:</strong> MobilePrepaid
              </div>
              <div className="mb-3">
                <strong>Circle:</strong> National
              </div>
              <hr />
              <Alert variant="info" className="mb-0">
                This recharge will extend your current plan validity.
              </Alert>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default PaymentConfirmation;