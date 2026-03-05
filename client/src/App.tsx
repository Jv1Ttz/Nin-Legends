import { AuthProvider, useAuth } from './contexts/AuthContext';
import { GameProvider, useGame } from './contexts/GameContext';
import LoginPage from './components/Auth/LoginPage';
import CharacterSelect from './components/Auth/CharacterSelect';
import GameScreen from './components/Game/GameScreen';

function AppContent() {
  const { user, loading } = useAuth();
  const { session } = useGame();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-pulse">忍</div>
          <p className="text-gray-500 text-sm">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) return <LoginPage />;
  if (!session) return <CharacterSelect />;
  return <GameScreen />;
}

export default function App() {
  return (
    <AuthProvider>
      <GameProvider>
        <AppContent />
      </GameProvider>
    </AuthProvider>
  );
}
