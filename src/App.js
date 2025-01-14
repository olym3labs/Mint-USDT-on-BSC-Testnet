//import logo from './logo.svg';
import './App.css';
import React from "react";
import MintToken from "./components/MintToken";
//import MintToken1 from "./components/MintToken1";
import MintToken2 from "./components/MintToken2";
function App() {
  return (
    <div className="App">
      <div>
        <MintToken />
        <MintToken2 />
      </div>
    </div>
  );
}

export default App;
