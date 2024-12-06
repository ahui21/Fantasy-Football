import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Tooltip } from 'react-tooltip';
import { RotateCcw, Share2 } from 'lucide-react';
import { RootState } from './store/store';
import { resetPredictions } from './store/predictorSlice';
import { MatchupCard } from './components/MatchupCard';
import { Standings } from './components/Standings';
import 'react-tooltip/dist/react-tooltip.css';

function App() {
  const dispatch = useDispatch();
  const { teams, matchups, loading, error } = useSelector((state: RootState) => state.predictor);

  const handleReset = () => {
    dispatch(resetPredictions());
  };

  const handleShare = () => {
    const predictionsText = matchups
      .map(m => {
        const winner = teams.find(t => t.id === m.predicted);
        return winner ? `${winner.name} wins against ${
          teams.find(t => t.id === (m.homeTeam === winner.id ? m.awayTeam : m.homeTeam))?.name
        }` : 'Undecided';
      })
      .filter(p => !p.includes('Undecided'))
      .join('\n');
    
    if (!predictionsText) {
      alert('Make some predictions first!');
      return;
    }
    
    navigator.clipboard.writeText(
      `My Fantasy Football Playoff Predictions:\n\n${predictionsText}\n\nCurrent Playoff Picture:\n${
        teams.slice(0, 6).map((t, i) => `${i + 1}. ${t.name} (${t.wins}-${t.losses})`).join('\n')
      }`
    )
      .then(() => alert('Predictions copied to clipboard!'))
      .catch(() => alert('Failed to copy predictions'));
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-red-50 p-4 rounded-lg text-red-700">
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold text-gray-900">Fantasy Football Playoff Predictor</h1>
          <div className="flex space-x-4">
            <button
              onClick={handleShare}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              data-tooltip-id="action-tooltip"
              data-tooltip-content="Share your predictions"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share Predictions
            </button>
            <button
              onClick={handleReset}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              data-tooltip-id="action-tooltip"
              data-tooltip-content="Reset all predictions"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {loading ? (
                <div className="col-span-2 flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                matchups.map(matchup => {
                  const homeTeam = teams.find(t => t.id === matchup.homeTeam)!;
                  const awayTeam = teams.find(t => t.id === matchup.awayTeam)!;
                  return (
                    <MatchupCard
                      key={matchup.id}
                      matchup={matchup}
                      homeTeam={homeTeam}
                      awayTeam={awayTeam}
                    />
                  );
                })
              )}
            </div>
          </div>
          
          <div className="lg:col-span-1">
            <Standings teams={teams} />
          </div>
        </div>

        <Tooltip id="action-tooltip" />
        <Tooltip id="team-tooltip" />
        <Tooltip id="standings-tooltip" />
      </div>
    </div>
  );
}

export default App;