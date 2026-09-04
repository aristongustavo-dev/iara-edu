import React from 'react';

class GameErrorBoundary extends React.Component {
  state = { error: null };
  static getDerivedStateFromError(error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return (
        <div className="fixed inset-0 z-[100] bg-gradient-to-b from-blue-400 to-green-400 flex flex-col items-center justify-center p-6 text-center">
          <span className="text-6xl mb-4">🖥️</span>
          <h2 className="text-xl font-display font-bold text-white mb-2">Não foi possível iniciar o mundo 3D</h2>
          <p className="text-white/80 text-sm mb-4 max-w-xs">
            Seu dispositivo pode não ter suporte a WebGL. Você ainda pode explorar pelo mapa interativo.
          </p>
          <button
            onClick={() => { this.setState({ error: null }); }}
            className="bg-white text-blue-600 font-bold px-5 py-2 rounded-xl shadow"
          >Tentar novamente</button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default GameErrorBoundary;
