import React, { useState, useEffect } from "react"
import { Container, Row, Col, Card, Table, Badge } from "react-bootstrap"
import { Link } from "react-router-dom"
import apiService from "../../services/api"
import { Users, CreditCard, AlertTriangle, Calendar } from "lucide-react"

const AdminDashboard = () => {
  const [expiringSubscribers, setExpiringSubscribers] = useState([])
  const [totalSubscribers, setTotalSubscribers] = useState();
  const [monthlyRevenue, setMonthlyRevenue] = useState();
  const [activePlans, setActivePlans] = useState();
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const response = await apiService.getExpiringSubscriptions(3)
        if (response.success) {
          setExpiringSubscribers(response.data)
        } else {
          setError("Failed to load expiring subscriptions")
        }
        const [subscribersResponse, revenueResponse, plansResponse] = await Promise.all([
          apiService.getTotalSubscribers(),
          apiService.getMonthlyRevenue(),
          apiService.getActivePlans(),
        ]);

        if (subscribersResponse.success) {
          setTotalSubscribers(subscribersResponse.data.total || 0);
        }
        if (revenueResponse.success) {
          setMonthlyRevenue(revenueResponse.data.revenue || 0);
        }
        if (plansResponse.success) {
          setActivePlans(plansResponse.data.count || 0);
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err)
        setError("An error occurred while fetching data")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const formatDate = dateString => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    })
  }

  // Calculate days until expiry
  const getDaysUntilExpiry = expiryDateString => {
    const expiryDate = new Date(expiryDateString)
    const currentDate = new Date()

    // Set time to 0 to compare only dates
    currentDate.setHours(0, 0, 0, 0)
    expiryDate.setHours(0, 0, 0, 0)

    const diffTime = expiryDate.getTime() - currentDate.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    return diffDays
  }

  // Get badge variant based on days until expiry
  const getExpiryBadgeVariant = days => {
    if (days <= 0) return "danger"
    if (days === 1) return "warning"
    return "info"
  }

  return (
    <Container className="page-transition">
      <h2 className="mb-4">Admin Dashboard</h2>

      <Row className="mb-4">
        <Col md={4}>
          <div className="dashboard-stats">
            <Users size={24} className="mb-2" />
            <h4>Total Subscribers</h4>
            <p>
              {isLoading ? "Loading..." : error ? "N/A" : totalSubscribers.toLocaleString()}
            </p>
          </div>
        </Col>
        <Col md={4}>
          <div className="dashboard-stats">
            <CreditCard size={24} className="mb-2" />
            <h4>Monthly Revenue</h4>
            <p>
              {isLoading ? "Loading..." : error ? "N/A" : `₹${monthlyRevenue.toLocaleString()}`}
            </p>
          </div>
        </Col>
        <Col md={4}>
          <div className="dashboard-stats">
            <Calendar size={24} className="mb-2" />
            <h4>Active Plans</h4>
            <p>
              {isLoading ? "Loading..." : error ? "N/A" : activePlans.toLocaleString()}
            </p>
          </div>
        </Col>
      </Row>

      <Card className="mb-4">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <div>
            <AlertTriangle size={18} className="me-2 text-warning" />
            <span className="fw-bold">Plans Expiring in Next 3 Days</span>
          </div>
          <Badge bg="warning" className="py-2 px-3">
            {expiringSubscribers.length} Subscribers
          </Badge>
        </Card.Header>
        <Card.Body>
          {isLoading ? (
            <p className="text-center">Loading...</p>
          ) : error ? (
            <p className="text-danger">{error}</p>
          ) : expiringSubscribers.length === 0 ? (
            <p className="text-center">No plans expiring in the next 3 days.</p>
          ) : (
            <Table responsive hover>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Mobile</th>
                  <th>Plan</th>
                  <th>Expiry Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {expiringSubscribers.map(subscriber => {
                  const daysUntilExpiry = getDaysUntilExpiry(
                    subscriber.expiryDate
                  )
                  const badgeVariant = getExpiryBadgeVariant(daysUntilExpiry)

                  return (
                    <tr key={subscriber.id}>
                      <td>{subscriber.name}</td>
                      <td>{subscriber.mobile}</td>
                      <td>{subscriber.plan}</td>
                      <td>
                        {formatDate(subscriber.expiryDate)}
                        <Badge bg={badgeVariant} className="ms-2">
                          {daysUntilExpiry < 0
                            ? "Expired"
                            :daysUntilExpiry === 0
                            ? "Today"
                            : `${daysUntilExpiry} day${
                                daysUntilExpiry !== 1 ? "s" : ""
                              }`}
                        </Badge>
                      </td>
                      <td>
                        <Badge bg="success">{subscriber.status}</Badge>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      <Row>
        <Col md={6}>
          <Card>
            <Card.Header className="fw-bold">Quick Links</Card.Header>
            <Card.Body>
              <ul className="list-group list-group-flush">
                <li className="list-group-item d-flex justify-content-between align-items-center">
                  <span>Manage Recharge Plans</span>
                  <Link
                    to="/admin/plans"
                    className="btn btn-sm btn-outline-primary"
                  >
                    View
                  </Link>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center">
                  <span>View Recharge History</span>
                  <Link
                    to="/admin/history"
                    className="btn btn-sm btn-outline-primary"
                  >
                    View
                  </Link>
                </li>
              </ul>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card>
            <Card.Header className="fw-bold">System Status</Card.Header>
            <Card.Body>
              <ul className="list-group list-group-flush">
                <li className="list-group-item d-flex justify-content-between align-items-center">
                  <span>Payment Gateway</span>
                  <Badge bg="success">Online</Badge>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center">
                  <span>SMS Service</span>
                  <Badge bg="success">Online</Badge>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center">
                  <span>Notification System</span>
                  <Badge bg="success">Online</Badge>
                </li>
              </ul>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}

export default AdminDashboard
