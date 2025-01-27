import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import OverviewPosts from './components/Pages/OverviewPosts/OverviewPosts';

function App() {
  return (
    <div className="App">
    hello
      <BrowserRouter>
        <Routes>
          <Route exact path='/'/>
          <Route exact path="/overview" element={<OverviewPosts />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
