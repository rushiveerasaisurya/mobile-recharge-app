import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';


const Footer = () => {
  return (
    <footer className="footer">
      <Container>
        <hr className="my-4" />
          <Col className="text-center">
            <p className="mb-0">&copy; {new Date().getFullYear()} RechargeMeeet. All rights reserved.</p>
          </Col>
      </Container>
    </footer>
  );
};

export default Footer;