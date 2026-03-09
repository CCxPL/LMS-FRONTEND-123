import React, { useState } from 'react';
import Input from './Input';
import Button from './Button';
import { CreditCard, Calendar, Lock, User } from 'lucide-react';
import type { Course } from '../../types/course.types';

export interface EnrollData {
  cardNumber: string;
  expiry: string;
  cvc: string;
  name: string;
}

interface EnrollFormProps {
  course: Course;
  onEnroll: (data: EnrollData) => void;
  isEnrolled: boolean;
}

const EnrollForm: React.FC<EnrollFormProps> = ({ course, onEnroll, isEnrolled }) => {
  const [data, setData] = useState({ cardNumber: '', expiry: '', cvc: '', name: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      onEnroll(data);
      setLoading(false);
    }, 1500);
  };

  if (isEnrolled) return null;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
        <p className="text-sm text-gray-600 font-medium">Total Amount</p>
        <p className="text-2xl font-bold text-gray-900">{course.price ? `$${course.price}` : 'Free'}</p>
      </div>
      
      {course.price ? (
        <>
          <Input 
            label="Cardholder Name" 
            placeholder="John Doe"
            icon={<User className="w-4 h-4" />}
            value={data.name} 
            onChange={e => setData({...data, name: e.target.value})} 
            required 
          />
          <Input 
            label="Card Number" 
            placeholder="0000 0000 0000 0000"
            icon={<CreditCard className="w-4 h-4" />}
            value={data.cardNumber} 
            onChange={e => setData({...data, cardNumber: e.target.value})} 
            required 
          />
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Expiry" 
              placeholder="MM/YY"
              icon={<Calendar className="w-4 h-4" />}
              value={data.expiry} 
              onChange={e => setData({...data, expiry: e.target.value})} 
              required 
            />
            <Input 
              label="CVC" 
              type="password" 
              placeholder="123"
              icon={<Lock className="w-4 h-4" />}
              value={data.cvc} 
              onChange={e => setData({...data, cvc: e.target.value})} 
              required 
            />
          </div>
        </>
      ) : null}
      
      <Button type="submit" fullWidth isLoading={loading}>
        {course.price ? 'Pay & Enroll' : 'Enroll for Free'}
      </Button>
    </form>
  );
};

export default EnrollForm;