export interface Team {
  id: string;
  name: string;
  wins: number;
  losses: number;
  seed?: number;
  playoffStatus?: 'clinched' | 'eliminated' | 'contending';
  tiebreaker: number;
  playoffPercentage: number;
  maxPossibleWins?: number;
}

export interface Matchup {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeWinPercentage: number;
  week: number;
  predicted?: string;
  homeScore?: number;
  awayScore?: number;
}

export interface RootState {
  predictor: {
    teams: Team[];
    matchups: Matchup[];
    loading: boolean;
    error: string | null;
  };
}