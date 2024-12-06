import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Team, Matchup } from '../types';
import { teams as initialTeams } from '../data/teams';
import { matchups as initialMatchups } from '../data/matchups';
import { calculatePlayoffStatus } from '../utils/playoffCalculator';

interface PredictorState {
  teams: Team[];
  matchups: Matchup[];
  loading: boolean;
  error: string | null;
}

const initialState: PredictorState = {
  teams: initialTeams.map(team => ({
    ...team,
    playoffStatus: 'contending',
    playoffPercentage: 50,
    maxPossibleWins: 14 - team.losses
  })),
  matchups: initialMatchups,
  loading: false,
  error: null
};

// Calculate initial playoff status
calculatePlayoffStatus(initialState.teams, initialState.matchups);

const predictorSlice = createSlice({
  name: 'predictor',
  initialState,
  reducers: {
    predictMatchup(state, action: PayloadAction<{ matchupId: string; winnerId: string }>) {
      const { matchupId, winnerId } = action.payload;
      const matchup = state.matchups.find(m => m.id === matchupId);
      
      if (matchup && matchup.predicted !== winnerId) {
        // Reset previous prediction if it exists
        if (matchup.predicted) {
          const previousWinner = state.teams.find(t => t.id === matchup.predicted);
          const previousLoser = state.teams.find(t => 
            t.id === (matchup.predicted === matchup.homeTeam ? matchup.awayTeam : matchup.homeTeam)
          );
          if (previousWinner) previousWinner.wins--;
          if (previousLoser) previousLoser.losses--;
        }

        // Set new prediction
        matchup.predicted = winnerId;
        
        // Update team records
        const winner = state.teams.find(t => t.id === winnerId);
        const loserId = winnerId === matchup.homeTeam ? matchup.awayTeam : matchup.homeTeam;
        const loser = state.teams.find(t => t.id === loserId);
        
        if (winner && loser) {
          winner.wins++;
          loser.losses++;
        }

        // Recalculate playoff status for all teams
        calculatePlayoffStatus(state.teams, state.matchups);
      }
    },
    updateMatchupScore(state, action: PayloadAction<{ 
      matchupId: string; 
      teamId: string; 
      score: number;
    }>) {
      const { matchupId, teamId, score } = action.payload;
      const matchup = state.matchups.find(m => m.id === matchupId);
      const team = state.teams.find(t => t.id === teamId);
      
      if (matchup && team) {
        // Get previous score if it exists
        const previousScore = teamId === matchup.homeTeam ? matchup.homeScore : matchup.awayScore;
        
        // Update matchup score
        if (teamId === matchup.homeTeam) {
          matchup.homeScore = score;
        } else {
          matchup.awayScore = score;
        }
        
        // Update team tiebreaker
        // If there was a previous score, subtract it first
        if (previousScore) {
          team.tiebreaker -= previousScore;
        }
        team.tiebreaker += score;
        
        // Sort teams by wins and tiebreaker
        state.teams.sort((a, b) => {
          if (b.wins !== a.wins) return b.wins - a.wins;
          return b.tiebreaker - a.tiebreaker;
        });

        // Recalculate playoff status
        calculatePlayoffStatus(state.teams, state.matchups);
      }
    },
    resetPredictions(state) {
      state.teams = initialTeams.map(team => ({
        ...team,
        playoffStatus: 'contending',
        playoffPercentage: 50,
        maxPossibleWins: 14 - team.losses
      }));
      state.matchups = initialMatchups;
      calculatePlayoffStatus(state.teams, state.matchups);
    }
  }
});

export const { predictMatchup, updateMatchupScore, resetPredictions } = predictorSlice.actions;
export default predictorSlice.reducer;