import React, { useState, useEffect } from "react";
import { Container, Row, Col, ButtonGroup, Button, Form, Alert } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import apiService from "../../services/api";
import PlanCard from "../../components/PlanCard";
import { Filter, SortAsc, SortDesc } from "lucide-react";

const PlanSelection = () => {
  const { category } = useParams();
  const navigate = useNavigate();

  const [plans, setPlans] = useState([]);
  const [filteredPlans, setFilteredPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [validityFilter, setValidityFilter] = useState("all");

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setIsLoading(true);
        setError("");
        const response = await apiService.getPlansByCategory(category || "all");
        if (response.success && response.data) {
          setPlans(response.data);
          setFilteredPlans(response.data);
          if (response.data.length > 0) {
            const prices = response.data.map((plan) => plan.price);
            setPriceRange([Math.min(...prices), Math.max(...prices)]);
          } else {
            setPriceRange([0, 5000]);
          }
        } else {
          setError("Failed to load plans");
        }
      } catch (err) {
        console.error("Error fetching plans:", err);
        setError("An error occurred while fetching plans");
      } finally {
        setIsLoading(false);
      }
    };
    fetchPlans();
  }, [category]);

  useEffect(() => {
    let result = [...plans];
    result = result.filter((plan) => plan.price >= priceRange[0] && plan.price <= priceRange[1]);
    if (validityFilter !== "all") {
      result = result.filter((plan) => {
        const match = plan.validity.match(/^(\d+)\s+days$/i);
        const days = match ? parseInt(match[1]) : 0;
        switch (validityFilter) {
          case "daily":
            return days <= 2;
          case "weekly":
            return days > 2 && days <= 7;
          case "monthly":
            return days > 7 && days <= 35;
          case "quarterly":
            return days > 35 && days <= 100;
          case "yearly":
            return days > 100;
          default:
            return true;
        }
      });
    }
    result.sort((a, b) => (sortOrder === "asc" ? a.price - b.price : b.price - a.price));
    setFilteredPlans(result);
  }, [plans, sortOrder, priceRange, validityFilter]);

  const handleCategoryChange = (newCategory) => {
    navigate(`/plans/${newCategory}`);
  };

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  const handlePriceRangeChange = (e) => {
    const value = parseInt(e.target.value) || 0;
    const type = e.target.name;
    if (type === "min") {
      setPriceRange([value, Math.max(value, priceRange[1])]);
    } else if (type === "max") {
      setPriceRange([Math.min(value, priceRange[0]), value]);
    }
  };

  const resetFilters = () => {
    setSortOrder("asc");
    setValidityFilter("all");
    if (plans.length > 0) {
      const prices = plans.map((plan) => plan.price);
      setPriceRange([Math.min(...prices), Math.max(...prices)]);
    } else {
      setPriceRange([0, 5000]);
    }
  };

  return (
    <Container className="page-transition">
      <h2 className="mb-4">Select Recharge Plan</h2>
      {error && (
        <Alert variant="danger" onClose={() => setError("")} dismissible>
          {error}
        </Alert>
      )}
      <Row className="mb-4">
        <Col>
          <ButtonGroup className="w-100">
            <Button
              variant={category === "popular" ? "primary" : "outline-primary"}
              onClick={() => handleCategoryChange("popular")}
            >
              Popular
            </Button>
            <Button
              variant={category === "data" ? "primary" : "outline-primary"}
              onClick={() => handleCategoryChange("data")}
            >
              Data
            </Button>
            <Button
              variant={category === "validity" ? "primary" : "outline-primary"}
              onClick={() => handleCategoryChange("validity")}
            >
              Validity
            </Button>
            <Button
              variant={category === "unlimited" ? "primary" : "outline-primary"}
              onClick={() => handleCategoryChange("unlimited")}
            >
              Unlimited
            </Button>
          </ButtonGroup>
        </Col>
      </Row>
      <Row>
        <Col md={3} className="mb-4">
          <div className="card">
            <div className="card-header d-flex align-items-center">
              <Filter size={16} className="me-2" />
              <span>Filters</span>
            </div>
            <div className="card-body">
              <div className="mb-4">
                <label className="form-label">Price Range</label>
                <div className="d-flex align-items-center">
                  <div className="input-group mb-2">
                    <span className="input-group-text">₹</span>
                    <Form.Control
                      type="number"
                      name="min"
                      value={priceRange[0]}
                      onChange={handlePriceRangeChange}
                      min={0}
                      max={priceRange[1]}
                    />
                  </div>
                  <span className="mx-2">to</span>
                  <div className="input-group mb-2">
                    <span className="input-group-text">₹</span>
                    <Form.Control
                      type="number"
                      name="max"
                      value={priceRange[1]}
                      onChange={handlePriceRangeChange}
                      min={priceRange[0]}
                    />
                  </div>
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label">Validity</label>
                <Form.Select
                  value={validityFilter}
                  onChange={(e) => setValidityFilter(e.target.value)}
                >
                  <option value="all">All</option>
                  <option value="daily">Daily (1-2 days)</option>
                  <option value="weekly">Weekly (3-7 days)</option>
                  <option value="monthly">Monthly (8-35 days)</option>
                  <option value="quarterly">Quarterly (36-100 days)</option>
                  <option value="yearly">Yearly (100+ days)</option>
                </Form.Select>
              </div>
              <Button
                variant="outline-primary"
                className="d-flex align-items-center w-100 mb-3"
                onClick={toggleSortOrder}
              >
                {sortOrder === "asc" ? (
                  <>
                    <SortAsc size={16} className="me-2" />
                    <span>Price: Low to High</span>
                  </>
                ) : (
                  <>
                    <SortDesc size={16} className="me-2" />
                    <span>Price: High to Low</span>
                  </>
                )}
              </Button>
              <Button variant="outline-secondary" className="w-100" onClick={resetFilters}>
                Reset Filters
              </Button>
            </div>
          </div>
        </Col>
        <Col md={9}>
          {isLoading ? (
            <p className="text-center py-5">Loading plans...</p>
          ) : error ? (
            <Alert variant="danger" onClose={() => setError("")} dismissible>
              {error}
            </Alert>
          ) : filteredPlans.length === 0 ? (
            <Alert variant="info">No plans found matching your criteria. Try adjusting your filters.</Alert>
          ) : (
            <Row>
              {filteredPlans.map((plan) => (
                <Col key={plan.id} md={6} lg={4}>
                  <PlanCard plan={plan} />
                </Col>
              ))}
            </Row>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default PlanSelection;