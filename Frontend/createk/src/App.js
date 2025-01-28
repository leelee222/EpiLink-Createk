import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './components/Authentification/Login';
import Success from './components/Authentification/Sucess';
import HomePage from './components/Pages/Explore';
import OverviewPosts from './components/Pages/OverviewPosts/OverviewPosts';
import ProfilePage from './components/Pages/Profile';

const Check = () => {
  const ProtectedRoute = ({ children }) => {
    const accessToken = localStorage.getItem('access_token');
    console.log('Access Token:', accessToken);
    return accessToken ? (
      <>
        {children}
      </>
    ) : (
      <Navigate to="/login" replace />
    );  };

  return (
    <div className="App">
      <Routes>
        <Route exact path='/login' element={<LoginPage />} />
        <Route path="/success" element={<Success />} />
        <Route exact path='/' element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
        <Route exact path='/overviews' element={<ProtectedRoute><OverviewPosts /></ProtectedRoute>} />
        <Route exact path='/profile' element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      </Routes>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <Check />
    </BrowserRouter>
  );
};

export default App;