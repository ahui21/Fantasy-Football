import React, { useState } from 'react';
import * as d3 from 'd3';
import { useDispatch } from 'react-redux';
import { Trophy } from 'lucide-react';
import { Matchup, Team } from '../types';
import { predictMatchup, updateMatchupScore } from '../store/predictorSlice';

interface MatchupCardProps {
  matchup: Matchup;
  homeTeam: Team;
  awayTeam: Team;
}

export const MatchupCard: React.FC<MatchupCardProps> = ({ matchup, homeTeam, awayTeam }) => {
  const dispatch = useDispatch();
  const [homeScore, setHomeScore] = useState<string>(matchup.homeScore?.toString() || '');
  const [awayScore, setAwayScore] = useState<string>(matchup.awayScore?.toString() || '');

  const handleTeamClick = (teamId: string) => {
    if (matchup.predicted !== teamId) {
      dispatch(predictMatchup({ matchupId: matchup.id, winnerId: teamId }));
    }
  };

  const handleScoreChange = (teamId: string, value: string) => {
    const score = parseFloat(value);
    if (!isNaN(score)) {
      dispatch(updateMatchupScore({ matchupId: matchup.id, teamId, score }));
    }
    if (teamId === homeTeam.id) {
      setHomeScore(value);
    } else {
      setAwayScore(value);
    }
  };

  const getWinProbabilityColor = (percentage: number) => {
    if(percentage < 25) {
      percentage = 25;
    } else if(percentage > 75) {
      percentage = 75;
    }
    return d3.interpolateRdYlBu((percentage-25)/50);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-stretch space-x-4">
        <div 
          className={`flex-1 p-4 rounded-lg cursor-pointer transition-all ${
            matchup.predicted === homeTeam.id ? 'ring-2 ring-white' : 'hover:brightness-110'
          }`}
          onClick={() => handleTeamClick(homeTeam.id)}
          data-tooltip-id="team-tooltip"
          data-tooltip-content={`Click to predict ${homeTeam.name} as winner`}
          style={{ backgroundColor: getWinProbabilityColor(matchup.homeWinPercentage) }}
        >
          <div className="flex flex-col items-center text-white">
            <span className="font-bold text-lg">{homeTeam.name}</span>
            <span className="text-sm mt-1">{matchup.homeWinPercentage.toFixed(1)}%</span>
            <input
              type="number"
              className="mt-2 w-20 px-2 py-1 rounded text-black text-center"
              placeholder="Score"
              value={homeScore}
              onChange={(e) => handleScoreChange(homeTeam.id, e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
            {matchup.predicted === homeTeam.id && (
              <Trophy className="w-4 h-4 mt-2" />
            )}
          </div>
        </div>

        <div className="flex items-center">
          <span className="text-gray-500 font-medium">VS</span>
        </div>

        <div 
          className={`flex-1 p-4 rounded-lg cursor-pointer transition-all ${
            matchup.predicted === awayTeam.id ? 'ring-2 ring-white' : 'hover:brightness-110'
          }`}
          onClick={() => handleTeamClick(awayTeam.id)}
          data-tooltip-id="team-tooltip"
          data-tooltip-content={`Click to predict ${awayTeam.name} as winner`}
          style={{ backgroundColor: getWinProbabilityColor(100 - matchup.homeWinPercentage) }}
        >
          <div className="flex flex-col items-center text-white">
            <span className="font-bold text-lg">{awayTeam.name}</span>
            <span className="text-sm mt-1">{(100 - matchup.homeWinPercentage).toFixed(1)}%</span>
            <input
              type="number"
              className="mt-2 w-20 px-2 py-1 rounded text-black text-center"
              placeholder="Score"
              value={awayScore}
              onChange={(e) => handleScoreChange(awayTeam.id, e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
            {matchup.predicted === awayTeam.id && (
              <Trophy className="w-4 h-4 mt-2" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};