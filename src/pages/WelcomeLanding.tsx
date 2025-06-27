import { useNavigate } from "react-router-dom";

const WelcomeLanding = () => {
  const navigate = useNavigate();
  
  return (
    <div>
      <h1>Welcome to Kigali Ride AWA</h1>
      <button onClick={() => navigate('/home')}>Get Started</button>
    </div>
  );
};

export default WelcomeLanding;
