import React from 'react';
import './OverviewPosts.css';

const OverviewPosts = () => {
  return (
    <div className="overview-container">
      {/* Left Sidebar */}
      <div className="left-sidebar">
        <ul>
          <li>Home</li>
          <li>Explore</li>
          <li>Notifications</li>
          <li>Messages</li>
          <li>Bookmarks</li>
          <li>Lists</li>
          <li>Profile</li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="post-section">
          <h2>Recent Posts</h2>
          {/* Here, you can add posts dynamically */}
          <div className="post">
            <div className="post-header">
              <span>User Name</span>
              <span>@username</span>
            </div>
            <div className="post-body">
              <p>Here is an example post text.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="right-sidebar">
        <div className="follow-section">
          <h3>Who to follow</h3>
          <ul>
            <li>User1</li>
            <li>User2</li>
            <li>User3</li>
          </ul>
        </div>

        <div className="search-section">
          <h3>Search</h3>
          <input type="text" placeholder="Search Twitter" />
        </div>
      </div>
    </div>
  );
}

export default OverviewPosts;


/*import React from 'react';
import './OverviewPosts.css';

const OverviewPosts = () => {
  return (
    <div className="overview-container">
      {/* Sidebar gauche }
      <div className="left-sidebar">
        <ul>
          <li>Home</li>
          <li>Explore</li>
          <li>Notifications</li>
          <li>Messages</li>
          <li>Bookmarks</li>
          <li>Lists</li>
          <li>Profile</li>
          <li>More</li>
        </ul>
      </div>

      {/* Contenu principal *}
      <div className="main-content">
        <div className="post-box">
          <textarea placeholder="What's happening?" />
          <button>Tweet</button>
        </div>
        <div className="posts">
          {/* Exemple de post *}
          <div className="post">
            <p>Hello, this is a post!</p>
          </div>
          <div className="post">
            <p>Another post here!</p>
          </div>
        </div>
      </div>

      {/* Sidebar droite *}
      <div className="right-sidebar">
        <div className="search-box">
          <input type="text" placeholder="Search Twitter" />
        </div>
        <div className="follow-suggestions">
          <h3>Who to follow</h3>
          {/* Exemple de suggestions *}
          <div className="suggestion">
            <p>User 1</p>
            <button>Follow</button>
          </div>
          <div className="suggestion">
            <p>User 2</p>
            <button>Follow</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewPosts;*/