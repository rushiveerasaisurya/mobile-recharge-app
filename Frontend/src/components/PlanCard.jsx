import React from 'react';
import { Card, Button } from 'react-bootstrap';
import { Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PlanCard = ({ plan }) => {
  const navigate = useNavigate();

  const handleSelectPlan = () => {
    navigate(`/payment/${plan.id}`);
  };

  return (
    <Card className="plan-card">
      <Card.Header>{plan.name}</Card.Header>
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div className="price">₹{plan.price}</div>
          <div className="validity">Validity: {plan.validity}</div>
        </div>
        
        <div className="mb-3">
          <strong>Data:</strong> {plan.data}
        </div>
        
        <div className="mb-3">
          <strong>Calls:</strong> {plan.calls}
        </div>
        
        <div className="mb-3">
          <strong>SMS:</strong> {plan.sms}
        </div>
        
        <div className="benefits">
          <strong>Benefits:</strong>
          {plan.benefits.map((benefit, index) => (
            <div key={index} className="benefit-item">
              <span className="benefit-icon"><Check size={16} /></span>
              <span>{benefit}</span>
            </div>
          ))}
        </div>
        
        <div className="mt-4">
          <Button 
            variant="primary" 
            className="w-100"
            onClick={handleSelectPlan}
          >
            Select Plan
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default PlanCard;