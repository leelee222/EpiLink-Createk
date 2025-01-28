// Success.jsx
import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const Success = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');

    if (token) {
      localStorage.setItem('access_token', token);
      window.dispatchEvent(new Event('loginStateChange'));
      toast.success("Successfully logged in! 😊", {
        position: "top-right",
        autoClose: 2000
      });
      navigate('/');
    } else {
      toast.error("Authentication failed 🤯", {
        position: "top-right",
        autoClose: 2000
      });
      navigate('/login');
    }
  }, [location, navigate]);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh' 
    }}>
      Processing authentication...
    </div>
  );
};

export default Success;