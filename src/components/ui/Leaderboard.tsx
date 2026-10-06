import React, { useEffect, useState } from 'react';
import { Trophy, Medal } from 'lucide-react';
import Card from './Card';
import { useAuth } from '../../hooks/useAuth';
import { getLeaderboardApi } from '../../api/performanceApi';

interface LeaderboardEntry {
  studentId: string;
  studentName: string;
  averageScore: number;
  bestScore: number;
  totalAttempts: number;
  passedAttempts: number;
}

interface LeaderboardProps {
  courseId: string;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ courseId }) => {
  const { user } = useAuth();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (courseId) fetchLeaderboard();
  }, [courseId]);

  // ─── REAL API ─────────────────────────────────────────────────────────────
  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const res = await getLeaderboardApi({ courseId, limit: 10 });
      setEntries(res.data?.leaderboard || []);
    } catch (err) {
      console.error('Leaderboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };
  // ─────────────────────────────────────────────────────────────────────────

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-5 h-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-orange-400" />;
    return <span className="font-bold text-gray-500 text-sm">#{rank}</span>;
  };

  if (loading) {
    return (
      <Card className="h-full">
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
        </div>
      </Card>
    );
  }

  if (entries.length === 0) {
    return (
      <Card className="h-full text-center py-16">
        <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500 text-sm">No data yet. Complete quizzes to appear here!</p>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-lg text-gray-900">Top Performers</h3>
        <Trophy className="w-5 h-5 text-gray-400" />
      </div>

      <div className="space-y-3">
        {entries.map((entry, idx) => {
          const rank = idx + 1;
          const isMe = entry.studentId === user?.id;

          return (
            <div
              key={entry.studentId}
              className={`flex items-center justify-between p-3 rounded-lg border transition-all ${isMe
                  ? 'bg-black text-white border-black'
                  : 'bg-white border-gray-100 hover:bg-gray-50'
                }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 flex justify-center">
                  {getRankIcon(rank)}
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${isMe ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-900'
                    }`}>
                    {entry.studentName?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {entry.studentName} {isMe && '(You)'}
                    </p>
                    <p className={`text-xs ${isMe ? 'text-gray-400' : 'text-gray-500'}`}>
                      {entry.totalAttempts} attempt{entry.totalAttempts !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold">{Math.round(entry.averageScore)}%</p>
                <p className={`text-xs ${isMe ? 'text-gray-400' : 'text-gray-500'}`}>avg score</p>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default Leaderboard;