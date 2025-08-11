import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { AlertTriangle } from 'lucide-react';

const DeleteConfirmationModal = ({
  show,
  onHide,
  onConfirm,
  title,
  message
}) => {
  return (
    <Modal 
      show={show} 
      onHide={onHide}
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title className="text-danger">
          <AlertTriangle className="me-2" size={20} />
          {title}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>{message}</p>
        <p className="text-danger fw-bold">This action cannot be undone.</p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button variant="danger" onClick={onConfirm}>
          Delete
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DeleteConfirmationModal;