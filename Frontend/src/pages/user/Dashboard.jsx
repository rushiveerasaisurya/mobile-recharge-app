import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Form, Button, Alert, Tabs, Tab } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Phone, CreditCard, CheckCircle, ShieldCheck } from "lucide-react";
import apiService from "../../services/api";

const UserDashboard = () => {
  const [mobileNumber, setMobileNumber] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState(null);
  const [subscriber, setSubscriber] = useState(null);
  const [isLoadingSubscriber, setIsLoadingSubscriber] = useState(true);
  const [error, setError] = useState("");
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.id) {
      const fetchSubscriber = async () => {
        try {
          setIsLoadingSubscriber(true);
          const response = await apiService.getSubscriberByUserId(user.id);
          if (response.success && response.data) {
            setSubscriber(response.data);
            setMobileNumber(user.mobileNumber || "");
          } else {
            setError("Failed to load subscriber data");
          }
        } catch (err) {
          console.error("Error fetching subscriber:", err);
          setError("An error occurred while fetching subscriber data");
        } finally {
          setIsLoadingSubscriber(false);
        }
      };
      fetchSubscriber();
    } else {
      setIsLoadingSubscriber(false);
      setError("User not authenticated");
    }
  }, [user]);

  const handleMobileChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    if (value.length <= 10) {
      setMobileNumber(value);
    }
    if (validationResult) {
      setValidationResult(null);
    }
  };

  const validateMobileNumber = () => {
    // Reset validation state
    setValidationResult(null);
    setIsValidating(true);

    // Check if user is authenticated
    if (!user) {
      setValidationResult({
        valid: false,
        message: "Please log in to validate your mobile number",
      });
      setIsValidating(false);
      return;
    }

    // Check if mobile number is empty
    if (!mobileNumber) {
      setValidationResult({
        valid: false,
        message: "Please enter a mobile number",
      });
      setIsValidating(false);
      return;
    }

    // Check if mobile number is 10 digits
    if (mobileNumber.length !== 10) {
      setValidationResult({
        valid: false,
        message: "Please enter a valid 10-digit mobile number",
      });
      setIsValidating(false);
      return;
    }

    // Check if mobile number matches user's mobile number
    if (mobileNumber !== user.mobileNumber) {
      setValidationResult({
        valid: false,
        message: "Mobile number does not match your account",
      });
      setIsValidating(false);
      return;
    }

    // Validation successful
    setValidationResult({
      valid: true,
      message: "Mobile number validated successfully",
    });
    setIsValidating(false);
  };

  const handleRecharge = () => {
    navigate("/plans/popular");
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <Container className="page-transition" >
      <h2 className="mb-4">RechargeMeeet</h2>
      <Row>
        <Col lg={8}>
          <Card className="mb-4">
            <Card.Body>
              <Card.Title className="mb-3">Enter Mobile Number</Card.Title>
              <Form className="mb-3">
                <Form.Group className="mb-3">
                  <div className="input-group">
                    <span className="input-group-text bg-light">
                      <Phone size={18} />
                    </span>
                    <Form.Control
                      type="tel"
                      placeholder="10-digit mobile number"
                      value={mobileNumber}
                      onChange={handleMobileChange}
                      maxLength={10}
                      isInvalid={validationResult && !validationResult.valid}
                    />
                    <Button
                      variant="primary"
                      onClick={validateMobileNumber}
                      disabled={isValidating || !mobileNumber}
                    >
                      {isValidating ? "Validating..." : "Validate"}
                    </Button>
                  </div>
                </Form.Group>
              </Form>
              {validationResult && (
                <Alert
                  variant={validationResult.valid ? "success" : "danger"}
                  className="d-flex align-items-center mb-4"
                >
                  {validationResult.valid ? (
                    <CheckCircle size={18} className="me-2" />
                  ) : (
                    <ShieldCheck size={18} className="me-2" />
                  )}
                  {validationResult.message}
                </Alert>
              )}
              {validationResult?.valid && (
                <div className="text-center">
                  <Button
                    variant="primary"
                    size="lg"
                    className="px-4"
                    onClick={handleRecharge}
                    disabled={isValidating}
                  >
                    <CreditCard size={18} className="me-2" />
                    Recharge Now
                  </Button>
                </div>
              )}
            </Card.Body>
          </Card>
          <Card>
            <Card.Body>
              <Tabs defaultActiveKey="popular" className="mb-3">
                <Tab eventKey="popular" title="Popular Plans">
                  <p>Explore our most popular recharge plans with great benefits.</p>
                  <Button variant="outline-primary" onClick={() => navigate("/plans/popular")}>
                    View Popular Plans
                  </Button>
                </Tab>
                <Tab eventKey="data" title="Data Plans">
                  <p>Get high-speed data plans for streaming, gaming, and browsing.</p>
                  <Button variant="outline-primary" onClick={() => navigate("/plans/data")}>
                    View Data Plans
                  </Button>
                </Tab>
                <Tab eventKey="validity" title="Validity Plans">
                  <p>Extend your service with our long-term validity plans.</p>
                  <Button variant="outline-primary" onClick={() => navigate("/plans/validity")}>
                    View Validity Plans
                  </Button>
                </Tab>
                <Tab eventKey="unlimited" title="Unlimited Plans">
                  <p>Unlimited calls, data, and more with our comprehensive plans.</p>
                  <Button variant="outline-primary" onClick={() => navigate("/plans/unlimited")}>
                    View Unlimited Plans
                  </Button>
                </Tab>
              </Tabs>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={4}>
          <Card className="mb-4">
            <Card.Header className="bg-primary text-white">Account Summary</Card.Header>
            <Card.Body>
              {isLoadingSubscriber ? (
                <p>Loading account details...</p>
              ) : (
                <>
                  <div className="mb-3">
                    <strong>Name:</strong> {user?.name || "N/A"}
                  </div>
                  <div className="mb-3">
                    <strong>Mobile:</strong> {user?.mobileNumber || "N/A"}
                  </div>
                  <div className="mb-3">
                    <strong>Plan:</strong> {subscriber?.plan || "No Active Plan"}
                  </div>
                  <div className="mb-4">
                    <strong>Validity:</strong>{" "}
                    {subscriber?.expiryDate ? formatDate(subscriber.expiryDate) : "N/A"}
                  </div>
                  
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default UserDashboard;