import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';

const defaultPlan = {
  name: '',
  price: 0,
  validity: '',
  data: '',
  calls: '',
  sms: '',
  category: 'Popular',
  benefits: ['']
};

const PlanFormModal = ({
  show,
  onHide,
  onSubmit,
  initialData
}) => {
  const [formData, setFormData] = useState(defaultPlan);
  const [validated, setValidated] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData(defaultPlan);
    }
    setValidated(false);
  }, [initialData, show]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleBenefitChange = (index, value) => {
    const updatedBenefits = [...formData.benefits];
    updatedBenefits[index] = value;
    setFormData(prev => ({ ...prev, benefits: updatedBenefits }));
  };

  const addBenefit = () => {
    setFormData(prev => ({ ...prev, benefits: [...prev.benefits, ''] }));
  };

  const removeBenefit = (index) => {
    const updatedBenefits = [...formData.benefits];
    updatedBenefits.splice(index, 1);
    setFormData(prev => ({ ...prev, benefits: updatedBenefits }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }
    
    // Filter out empty benefits
    const filteredBenefits = formData.benefits.filter(benefit => benefit.trim() !== '');
    
    onSubmit({
      ...formData,
      benefits: filteredBenefits,
      price: Number(formData.price)
    });
  };

  return (
    <Modal 
      show={show} 
      onHide={onHide}
      size="lg"
      centered
    >
      <Form noValidate validated={validated} onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>
            {initialData ? 'Edit Plan' : 'Add New Plan'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row className="mb-3">
            <Form.Group as={Col} md={8}>
              <Form.Label>Plan Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
              <Form.Control.Feedback type="invalid">
                Please enter a plan name.
              </Form.Control.Feedback>
            </Form.Group>
            
            <Form.Group as={Col} md={4}>
              <Form.Label>Price (₹)</Form.Label>
              <Form.Control
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                min="0"
              />
              <Form.Control.Feedback type="invalid">
                Please enter a valid price.
              </Form.Control.Feedback>
            </Form.Group>
          </Row>

          <Row className="mb-3">
            <Form.Group as={Col} md={6}>
              <Form.Label>Validity</Form.Label>
              <Form.Control
                type="text"
                name="validity"
                value={formData.validity}
                onChange={handleChange}
                required
                placeholder="e.g. 28 days"
              />
              <Form.Control.Feedback type="invalid">
                Please enter validity period.
              </Form.Control.Feedback>
            </Form.Group>
            
            <Form.Group as={Col} md={6}>
              <Form.Label>Category</Form.Label>
              <Form.Select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
              >
                <option value="Popular">Popular</option>
                <option value="Data">Data</option>
                <option value="Validity">Validity</option>
                <option value="Unlimited">Unlimited</option>
              </Form.Select>
            </Form.Group>
          </Row>

          <Row className="mb-3">
            <Form.Group as={Col} md={4}>
              <Form.Label>Data</Form.Label>
              <Form.Control
                type="text"
                name="data"
                value={formData.data}
                onChange={handleChange}
                required
                placeholder="e.g. 1.5 GB/day"
              />
              <Form.Control.Feedback type="invalid">
                Please enter data details.
              </Form.Control.Feedback>
            </Form.Group>
            
            <Form.Group as={Col} md={4}>
              <Form.Label>Calls</Form.Label>
              <Form.Control
                type="text"
                name="calls"
                value={formData.calls}
                onChange={handleChange}
                required
                placeholder="e.g. Unlimited"
              />
              <Form.Control.Feedback type="invalid">
                Please enter calls details.
              </Form.Control.Feedback>
            </Form.Group>
            
            <Form.Group as={Col} md={4}>
              <Form.Label>SMS</Form.Label>
              <Form.Control
                type="text"
                name="sms"
                value={formData.sms}
                onChange={handleChange}
                required
                placeholder="e.g. 100/day"
              />
              <Form.Control.Feedback type="invalid">
                Please enter SMS details.
              </Form.Control.Feedback>
            </Form.Group>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Benefits</Form.Label>
            {formData.benefits.map((benefit, index) => (
              <div key={index} className="d-flex mb-2">
                <Form.Control
                  type="text"
                  value={benefit}
                  onChange={(e) => handleBenefitChange(index, e.target.value)}
                  placeholder="e.g. Free Netflix Basic"
                />
                <Button 
                  variant="outline-danger" 
                  className="ms-2"
                  onClick={() => removeBenefit(index)}
                  disabled={formData.benefits.length <= 1}
                >
                  Remove
                </Button>
              </div>
            ))}
            <Button 
              variant="outline-primary" 
              size="sm" 
              onClick={addBenefit}
              className="mt-2"
            >
              Add Benefit
            </Button>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            {initialData ? 'Update Plan' : 'Add Plan'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default PlanFormModal;