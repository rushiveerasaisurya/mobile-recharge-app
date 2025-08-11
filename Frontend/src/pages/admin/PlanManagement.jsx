import React, { useState, useEffect } from "react"
import { Container, Card, Table, Button, Badge } from "react-bootstrap"
import { PlusCircle, Edit, Trash2 } from "lucide-react"
import apiService from "../../services/api"
import PlanFormModal from "../../components/PlanFormModal"
import DeleteConfirmationModal from "../../components/DeleteConfirmationModal"

const PlanManagement = () => {
  const [plans, setPlans] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  const [showFormModal, setShowFormModal] = useState(false)
  const [editingPlan, setEditingPlan] = useState(undefined)

  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [planToDelete, setPlanToDelete] = useState(null)

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setIsLoading(true)
        const response = await apiService.getPlans()
        if (response.success) {
          setPlans(response.data)
        } else {
          setError("Failed to load plans")
        }
      } catch (err) {
        console.error("Error fetching plans:", err)
        setError("An error occurred while fetching plans")
      } finally {
        setIsLoading(false)
      }
    }

    fetchPlans()
  }, [])

  const handleOpenAddModal = () => {
    setEditingPlan(undefined)
    setShowFormModal(true)
  }

  const handleOpenEditModal = plan => {
    setEditingPlan(plan)
    setShowFormModal(true)
  }

  const handleOpenDeleteModal = planId => {
    setPlanToDelete(planId)
    setShowDeleteModal(true)
  }

  const handleCloseFormModal = () => {
    setShowFormModal(false)
  }

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false)
    setPlanToDelete(null)
  }

  const handleSubmitPlan = async formData => {
    try {
      if (editingPlan) {
        // Update existing plan
        const response = await apiService.updatePlan(editingPlan.id, formData)
        if (response.success) {
          setPlans(prevPlans =>
            prevPlans.map(plan =>
              plan.id === editingPlan.id ? response.data : plan
            )
          )
          setShowFormModal(false)
        } else {
          setError("Failed to update plan")
        }
      } else {
        // Create new plan
        const response = await apiService.createPlan(formData)
        if (response.success) {
          setPlans(prevPlans => [...prevPlans, response.data])
          setShowFormModal(false)
        } else {
          setError("Failed to create plan")
        }
      }
    } catch (err) {
      console.error("Error saving plan:", err)
      setError("An error occurred while saving the plan")
    }
  }

  const handleDeletePlan = async () => {
    if (!planToDelete) return

    try {
      const response = await apiService.deletePlan(planToDelete)
      if (response.success) {
        setPlans(prevPlans =>
          prevPlans.filter(plan => plan.id !== planToDelete)
        )
        handleCloseDeleteModal()
      } else {
        setError("Failed to delete plan")
      }
    } catch (err) {
      console.error("Error deleting plan:", err)
      setError("An error occurred while deleting the plan")
    }
  }

  // Helper to get badge color for category
  const getCategoryBadgeColor = category => {
    switch (category) {
      case "Popular":
        return "primary"
      case "Data":
        return "info"
      case "Validity":
        return "success"
      case "Unlimited":
        return "warning"
      default:
        return "secondary"
    }
  }

  return (
    <Container className="page-transition">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Recharge Plan Management</h2>
        <Button variant="primary" onClick={handleOpenAddModal}>
          <PlusCircle size={18} className="me-2" />
          Add New Plan
        </Button>
      </div>

      {error && <div className="alert alert-danger mb-4">{error}</div>}

      <Card>
        <Card.Body>
          {isLoading ? (
            <p className="text-center my-4">Loading plans...</p>
          ) : plans.length === 0 ? (
            <p className="text-center my-4">
              No plans found. Add your first plan!
            </p>
          ) : (
            <Table responsive hover>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Price</th>
                  <th>Validity</th>
                  <th>Data</th>
                  <th>Category</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {plans.map(plan => (
                  <tr key={plan.id}>
                    <td>{plan.name}</td>
                    <td>₹{plan.price}</td>
                    <td>{plan.validity}</td>
                    <td>{plan.data}</td>
                    <td>
                      <Badge bg={getCategoryBadgeColor(plan.category)}>
                        {plan.category}
                      </Badge>
                    </td>
                    <td>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="me-2"
                        onClick={() => handleOpenEditModal(plan)}
                      >
                        <Edit size={16} />
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleOpenDeleteModal(plan.id)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* Plan Form Modal */}
      <PlanFormModal
        show={showFormModal}
        onHide={handleCloseFormModal}
        onSubmit={handleSubmitPlan}
        initialData={editingPlan}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        show={showDeleteModal}
        onHide={handleCloseDeleteModal}
        onConfirm={handleDeletePlan}
        title="Delete Recharge Plan"
        message="Are you sure you want to delete this recharge plan? Users will no longer be able to purchase this plan."
      />
    </Container>
  )
}

export default PlanManagement
