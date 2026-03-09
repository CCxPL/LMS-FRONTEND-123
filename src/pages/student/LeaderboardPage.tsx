import React, { useState } from 'react';
import Leaderboard from '../../components/ui/Leaderboard';
import Card from '../../components/ui/Card';

const LeaderboardPage: React.FC = () => {
  const [selectedCourse, setSelectedCourse] = useState('1');

  const courses = [
    { id: '1', name: 'React.js Complete Course' },
    { id: '2', name: 'Python for Data Science' },
    { id: '3', name: 'AWS Cloud Practitioner' }
  ];

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Global Leaderboard</h1>
          <p className="page-subtitle">See where you stand among your peers</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Course Selection */}
        <div className="space-y-4">
          <Card>
            <h3 className="font-bold text-gray-900 mb-4">Select Course</h3>
            <div className="space-y-2">
              {courses.map((course) => (
                <button
                  key={course.id}
                  onClick={() => setSelectedCourse(course.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    selectedCourse === course.id
                      ? 'bg-black text-white shadow-md'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {course.name}
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* Right: Leaderboard Display */}
        <div className="lg:col-span-2">
          <Leaderboard courseId={selectedCourse} />
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;