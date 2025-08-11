import React from 'react';
import { Navbar, Container, Nav, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Phone } from 'lucide-react';

const NavbarComponent = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Navbar bg="light" expand="lg" className="mb-4">
      <Container>
        <Navbar.Brand>
          <Phone size={24} className="me-2" />
          <span>RechargeMeeet</span>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            {isAuthenticated && user?.role === 'user' && (
              <>
                <Nav.Link as={Link} to="/">Dashboard</Nav.Link>
                <Nav.Link as={Link} to="/plans/popular">Browse Plans</Nav.Link>
                <Nav.Link as={Link} to="/user/history">Recharge History</Nav.Link>
              </>
            )}
            {isAuthenticated && user?.role === 'admin' && (
              <>
                <Nav.Link as={Link} to="/admin">Dashboard</Nav.Link>
                <Nav.Link as={Link} to="/admin/plans">Manage Plans</Nav.Link>
                <Nav.Link as={Link} to="/admin/history">Recharge History</Nav.Link>
              </>
            )}
          </Nav>
          <Nav>
            {isAuthenticated ? (
              <div className="d-flex align-items-center">
                <span className="me-3">
                  {user?.role === 'admin' ? '👑 ' : ''}
                  {user?.name} ({user?.mobileNumber})
                </span>
                <Button 
                  variant="outline-primary" 
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </div>
            ) : (
              ( window.location.pathname === '/login') ? ( 
              <Button 
                variant="primary" 
                as={Link} 
                to="/register"
              >
                SignUp
              </Button>):
              (<Button 
                variant="primary" 
                as={Link} 
                to="/login"
              >
                Signin
              </Button>
            ))}
            
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavbarComponent;