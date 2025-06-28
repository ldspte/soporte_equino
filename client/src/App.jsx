import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import  Home  from './Views/Home.jsx';
import { useState } from 'react';
import Landing from './Views/Landing.jsx';


const App = () => {
  return (
    <div>
      <Router>
        <Routes>
          <Route path="/" element={ <Landing />}  />
          <Route path="/home" element={<Home />} />
        </Routes>
      </Router>
    </div>
  );
};
export default App;