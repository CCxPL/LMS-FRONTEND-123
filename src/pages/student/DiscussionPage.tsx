import React, { useState } from 'react';
import DiscussionBoard from '../../components/ui/DiscussionBoard';
import Card from '../../components/ui/Card';

const DiscussionPage: React.FC = () => {
  const [selectedTopic, setSelectedTopic] = useState('general');

  const topics = [
    { id: 'general', name: 'General Discussion' },
    { id: 'react', name: 'React.js Q&A' },
    { id: 'python', name: 'Python Doubts' },
    { id: 'career', name: 'Career Guidance' }
  ];

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Community Forum</h1>
          <p className="page-subtitle">Discuss, ask questions, and learn together</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Topics */}
        <div className="space-y-4">
          <Card>
            <h3 className="font-bold text-gray-900 mb-4">Topics</h3>
            <div className="space-y-1">
              {topics.map((topic) => (
                <button
                  key={topic.id}
                  onClick={() => setSelectedTopic(topic.id)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    selectedTopic === topic.id
                      ? 'bg-gray-100 text-black border-l-4 border-black'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {topic.name}
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* Main Discussion Area */}
        <div className="lg:col-span-3">
          <DiscussionBoard />
        </div>
      </div>
    </div>
  );
};

export default DiscussionPage;