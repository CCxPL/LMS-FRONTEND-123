import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Home } from 'lucide-react';
import Button from '../../components/ui/Button';

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <h1 className="text-[120px] font-bold text-gray-200 leading-none">404</h1>
        <h2 className="text-2xl font-bold text-gray-900 mb-2 -mt-4">Page Not Found</h2>
        <p className="text-gray-500 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Button 
            variant="outline" 
            onClick={() => navigate(-1)}
            icon={<ArrowLeft className="w-4 h-4" />}
          >
            Go Back
          </Button>
          <Button 
            onClick={() => navigate('/login')}
            icon={<Home className="w-4 h-4" />}
          >
            Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;