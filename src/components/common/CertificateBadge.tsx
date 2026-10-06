import React, { useEffect, useState } from 'react';
import axiosInstance from '../../api/axiosInstance';

interface CertificateBadgeProps {
  userId: string;
}

const CertificateBadge: React.FC<CertificateBadgeProps> = ({ userId }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!userId) return;

    const fetchUnreadCount = async () => {
      try {
        const res = await axiosInstance.get('/certificates/my');
        const certificates = res.data?.data?.certificates || [];
        // Count certificates that are newly uploaded (unread)
        const unread = certificates.filter(
          (c: any) => c.status === 'uploaded' && !c.notifRead
        ).length;
        setCount(unread);
      } catch {
        setCount(0);
      }
    };

    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
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