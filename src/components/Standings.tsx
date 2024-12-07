import React from 'react';
import { Team } from '../types';

interface StandingsProps {
  teams: Team[];
}

export const Standings: React.FC<StandingsProps> = ({ teams }) => {
  const getStatusStyle = (status?: string) => {
    switch (status) {
      case 'clinched':
        return 'bg-green-600 text-white';
      case 'eliminated':
        return 'bg-red-600 text-white';
      case 'contending':
        return 'bg-yellow-400';
      default:
        return 'bg-white';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4">Standings</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2">Rank</th>
              <th className="text-left py-2">Team</th>
              <th className="text-left py-2">Record</th>
              <th className="text-left py-2">Tiebreaker</th>
            </tr>
          </thead>
          <tbody>
            {teams.map((team, index) => (
              <tr
                key={team.id}
                className={`${getStatusStyle(team.playoffStatus)} transition-colors`}
                data-tooltip-id="standings-tooltip"
                data-tooltip-content={`${
                  team.playoffStatus === 'clinched' 
                    ? 'Playoff spot secured' 
                    : team.playoffStatus === 'eliminated'
                    ? 'Eliminated from playoffs'
                    : 'Still in playoff contention'
                }`}
              >
                <td className="py-2">{index + 1}</td>
                <td className="py-2 font-medium">{team.name}</td>
                <td className="py-2">{team.wins}-{team.losses}</td>
                <td className="py-2">{team.tiebreaker.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};