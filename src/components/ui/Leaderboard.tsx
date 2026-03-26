import React, { useEffect, useState } from 'react';
import { Trophy, Medal } from 'lucide-react';
import Card from './Card';
import { getLeaderboardApi } from '../../api/performanceApi';

interface LeaderboardEntry {
  rank: number;
  studentName: string;
  averageScore: number;
  bestScore: number;
  totalAttempts: number;
}

interface LeaderboardProps {
  courseId: string;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ courseId }) => {
  const [data, setData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!courseId) return;
    fetchLeaderboard();
  }, [courseId]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const res = await getLeaderboardApi({ courseId, limit: 10 });
      const raw: any[] = res.data?.leaderboard ?? [];

      const mapped: LeaderboardEntry[] = raw.map((entry: any, idx: number) => ({
        rank: idx + 1,
        studentName: entry.studentName ?? 'Unknown',
        averageScore: Math.round(entry.averageScore ?? 0),
        bestScore: Math.round(entry.bestScore ?? 0),
        totalAttempts: entry.totalAttempts ?? 0,
      }));

      setData(mapped);
    } catch (err) {
      console.error('Leaderboard fetch error:', err);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

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

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
        </div>
      ) : data.length === 0 ? (
        <p className="text-center text-gray-400 py-10">No data available yet.</p>
      ) : (
        <div className="space-y-3">
          {data.map((student) => (
            <div
              key={student.rank}
              className="flex items-center justify-between p-3 rounded-lg border bg-white border-gray-100 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 flex justify-center">
                  {getRankIcon(student.rank)}
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold bg-gray-100 text-gray-900">
                    {student.studentName.charAt(0)}
                  </div>
                  <span className="text-sm font-medium">{student.studentName}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold">{student.averageScore}%</p>
                <p className="text-xs text-gray-400">avg score</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

export default Leaderboard;