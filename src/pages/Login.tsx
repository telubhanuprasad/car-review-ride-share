
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to home page with login popup trigger
    navigate('/?showLogin=true');
  }, [navigate]);

  return null;
};

export default Login;
