import React from 'react';
import { Trophy, Medal } from 'lucide-react';
import Card from './Card';

interface LeaderboardEntry {
  id: string;
  name: string;
  score: number;
  rank: number;
}

const MOCK_DATA: Record<string, LeaderboardEntry[]> = {
  '1': [
    { id: '1', name: 'Arjun Sharma', score: 980, rank: 1 },
    { id: '2', name: 'Priya Verma', score: 950, rank: 2 },
    { id: '3', name: 'Rahul Singh', score: 920, rank: 3 },
    { id: '4', name: 'You', score: 850, rank: 4 },
    { id: '5', name: 'Amit Patel', score: 800, rank: 5 },
  ]
};

interface LeaderboardProps {
  courseId: string;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ courseId }) => {
  const data = MOCK_DATA[courseId] || MOCK_DATA['1'];

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-5 h-5 text-yellow-600 fill-yellow-100" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-600" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-orange-600" />;
    return <span className="font-bold text-gray-500 text-sm">#{rank}</span>;
  };

  return (
    <Card className="h-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-lg text-gray-900">Top Performers</h3>
        <Trophy className="w-5 h-5 text-gray-400" />
      </div>

      <div className="space-y-3">
        {data.map((student) => (
          <div 
            key={student.id} 
            className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
              student.name === 'You' 
                ? 'bg-black text-white border-black' 
                : 'bg-white border-gray-100'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 flex justify-center">
                {getRankIcon(student.rank)}
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                  student.name === 'You' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-900'
                }`}>
                  {student.name.charAt(0)}
                </div>
                <span className="text-sm font-medium">{student.name}</span>
              </div>
            </div>
            <span className="text-sm font-bold">{student.score} pts</span>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default Leaderboard;