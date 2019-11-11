import React from 'react';
import './App.css';
import ws from './ws'
import Motion from './Motion'

const App: React.FC = () => {
  return (
    <div className="App">
      <div className="App-header">
        <Motion/>
        <button onClick={() => ws.send({type: 'ping'})}>send ok</button>
      </div>
    </div>
  );
}

export default App;
