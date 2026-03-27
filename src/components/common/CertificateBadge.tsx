import React, { useEffect, useState } from 'react';
import { getUnreadCertNotificationCount } from '../../services/certificateService';

interface CertificateBadgeProps {
  userId: string;
}

const CertificateBadge: React.FC<CertificateBadgeProps> = ({ userId }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const update = () => setCount(getUnreadCertNotificationCount(userId));
    update();
    const interval = setInterval(update, 5000);
    return () => clearInterval(interval);
  }, [userId]);

  if (count === 0) return null;

  return (
    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
      {count > 9 ? '9+' : count}
    </span>
  );
};

export default CertificateBadge;