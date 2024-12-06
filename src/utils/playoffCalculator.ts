import { Team, Matchup } from '../types';

// Calculate max possible wins for a team based on remaining schedule
export const calculateMaxPossibleWins = (team: Team, matchups: Matchup[]): number => {
  const remainingGames = matchups.filter(m => 
    (m.homeTeam === team.id || m.awayTeam === team.id) && !m.predicted
  ).length;
  return team.wins + remainingGames;
};

// Calculate minimum wins needed for playoffs based on current standings
const calculatePlayoffCutoff = (teams: Team[], matchups: Matchup[]): number => {
  const sortedTeams = [...teams].sort((a, b) => b.wins - a.wins);
  const sixthPlace = sortedTeams[5];
  const remainingMatchups = matchups.filter(m => !m.predicted);
  
  // If all games are predicted, use current 6th place wins
  if (remainingMatchups.length === 0) {
    return sixthPlace.wins;
  }
  
  // Otherwise, use a more conservative estimate
  return Math.max(6, sixthPlace.wins);
};

// Calculate playoff clinch/elimination scenarios
export const calculatePlayoffStatus = (teams: Team[], matchups: Matchup[]): void => {
  // Sort teams by record and tiebreaker
  teams.sort((a, b) => {
    if (b.wins !== a.wins) return b.wins - a.wins;
    return b.tiebreaker - a.tiebreaker;
  });

  // Calculate max possible wins and playoff cutoff
  const playoffCutoff = calculatePlayoffCutoff(teams, matchups);
  teams.forEach(team => {
    team.maxPossibleWins = calculateMaxPossibleWins(team, matchups);
  });

  const remainingGames = matchups.filter(m => !m.predicted).length;
  const allGamesPredicted = remainingGames === 0;

  teams.forEach((team, index) => {
    if (allGamesPredicted) {
      // If all games are predicted, top 6 make playoffs, bottom 6 are eliminated
      if (index < 6) {
        team.playoffStatus = 'clinched';
        team.playoffPercentage = 100;
      } else {
        team.playoffStatus = 'eliminated';
        team.playoffPercentage = 0;
      }
    } else {
      // For games in progress, use mathematical elimination
      if (team.maxPossibleWins! < playoffCutoff) {
        team.playoffStatus = 'eliminated';
        team.playoffPercentage = 0;
      } else if (team.wins >= 7) {
        team.playoffStatus = 'clinched';
        team.playoffPercentage = 100;
      } else {
        team.playoffStatus = 'contending';
        // Placeholder for your dynamic percentage calculation
        team.playoffPercentage = 50;
      }
    }
  });
};