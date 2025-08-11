import React, { useState, useEffect } from "react";
import {
  Container,
  Card,
  Table,
  Form,
  Row,
  Col,
  Badge,
  Button,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import apiService from "../../services/api";
import { Search, Download, Calendar } from "lucide-react";

const RechargeHistory = () => {
  const [rechargeHistory, setRechargeHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [displayedHistory, setDisplayedHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(5);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await apiService.getRechargeHistoryById(user.id); // Fixed user.userId to user.id
        console.log(response.success);
        if (response.success) {
          setRechargeHistory(response.data);
          setFilteredHistory(response.data);
        } else {
          setError("Failed to load recharge history");
        }
      } catch (err) {
        console.error("Error fetching recharge history:", err);
        setError("An error occurred while fetching data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user, navigate]);

  useEffect(() => {
    // Apply filters
    let filtered = rechargeHistory;

  

    // Filter by date
    if (dateFilter !== "all") {
      const now = new Date()
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // Start of today
      const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000 - 1); // End of today
      filtered = filtered.filter(record => {
        const recordDate = new Date(record.date)
        const diffDays = Math.floor(
          (todayStart.getTime() - new Date(recordDate.getFullYear(), recordDate.getMonth(), recordDate.getDate()).getTime()) /
            (1000 * 60 * 60 * 24)
        );

        switch (dateFilter) {
          case "today":
            return recordDate >= todayStart && recordDate <= todayEnd;
          case "yesterday":
            return diffDays === 1
          case "last7days":
            return diffDays < 7
          case "last30days":
            return diffDays < 30
          default:
            return true;
        }
      });
    }

    setFilteredHistory(filtered);
    setCurrentPage(1);
  }, [searchTerm, dateFilter, rechargeHistory]);

  useEffect(() => {
    // Apply pagination
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    setDisplayedHistory(filteredHistory.slice(startIndex, endIndex));
  }, [filteredHistory, currentPage, pageSize]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    const totalPages = Math.ceil(filteredHistory.length / pageSize);
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <Container className="page-transition">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Recharge History</h2>
      </div>

      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col md={6}>
              <Form.Group>
                <div className="input-group">
                  <span className="input-group-text bg-light">
                    <Calendar size={18} />
                  </span>
                  <Form.Select
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                  >
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="yesterday">Yesterday</option>
                    <option value="last7days">Last 7 Days</option>
                    <option value="last30days">Last 30 Days</option>
                  </Form.Select>
                </div>
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Card>
        <Card.Body>
          {isLoading ? (
            <p className="text-center my-4">Loading...</p>
          ) : error ? (
            <p className="text-danger text-center my-4">{error}</p>
          ) : filteredHistory.length === 0 ? (
            <p className="text-center my-4">No recharge records found.</p>
          ) : (
            <Table responsive hover>
              <thead>
                <tr>
                  <th>Date & Time</th>
                  <th>User</th>
                  <th>Mobile</th>
                  <th>Plan</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {displayedHistory.map((record) => ( // Fixed to use displayedHistory
                  <tr key={record.id}>
                     <td>{formatDate(record.date)}</td>
                    <td>{record.userName}</td>
                    <td>{record.mobile}</td>
                    <td>{record.planName}</td>
                    <td>₹{record.amount}</td>
                    <td>
                      <Badge
                        bg={
                          record.status === "Successful"
                            ? "success"
                            : record.status === "Pending"
                            ? "warning"
                            : "danger"
                        }
                      >
                        {record.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}

          <div className="d-flex justify-content-between align-items-center mt-3">
            <p className="mb-0">
              Showing {displayedHistory.length} of {filteredHistory.length}{" "}
              records
            </p>
            <div>
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline-primary"
                size="sm"
                className="ms-2"
                onClick={handleNextPage}
                disabled={
                  currentPage === Math.ceil(filteredHistory.length / pageSize)
                }
              >
                Next
              </Button>
            </div>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default RechargeHistory;