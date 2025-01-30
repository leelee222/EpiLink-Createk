import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './components/Authentification/Login';
import Success from './components/Authentification/Sucess';
import HomePage from './components/Pages/Explore';
import OverviewPosts from './components/Pages/OverviewPosts/OverviewPosts';
import NotificationsPage from './components/Pages/Notifications';
import MessagesPage from './components/Pages/Messages';
import ProfilePage from './components/Pages/Profile';
import ExplorePage from './components/Pages/Explore';
import PostPage from './components/Pages/Posts';
const Check = () => {
  const ProtectedRoute = ({ children }) => {
    const accessToken = localStorage.getItem('access_token');
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
        <Route exact path='/notifications' element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
        <Route exact path='/messages' element={<ProtectedRoute><MessagesPage /></ProtectedRoute>} />
        <Route exact path='/explore' element={<ProtectedRoute><ExplorePage /></ProtectedRoute>} />
        <Route exact path='/posts/:id' element={<ProtectedRoute><PostPage /></ProtectedRoute>} />
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