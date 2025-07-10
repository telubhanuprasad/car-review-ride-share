
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const SignUp = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to home page with signup popup trigger
    navigate('/?showSignup=true');
  }, [navigate]);

  return null;
};

export default SignUp;
