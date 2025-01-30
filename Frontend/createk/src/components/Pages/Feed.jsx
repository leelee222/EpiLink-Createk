import React, { useState, useEffect } from 'react';

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState({ title: '', content: '' });
  const [commentContent, setCommentContent] = useState('');
  const [selectedPost, setSelectedPost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Charger le flux initial
  useEffect(() => {
    const fetchFeed = async () => {
      try {
        const response = await fetch('http://127.0.0.1:3000/feed/');
        if (!response.ok) throw new Error('Erreur de chargement du flux');
        const data = await response.json();
        console.log(data);
        setPosts(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchFeed();
  }, []);

  // Création d'un nouveau post
  const handleCreatePost = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/posts/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPost)
      });
      
      if (!response.ok) throw new Error('Échec de la création');
      
      const createdPost = await response.json();
      setPosts([createdPost, ...posts]);
      setNewPost({ title: '', content: '' });
    } catch (err) {
      setError(err.message);
    }
  };

  // Ajout d'un commentaire
  const handleAddComment = async (postId) => {
    if (!commentContent.trim()) return;

    try {
      const response = await fetch(`/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: commentContent })
      });
      
      if (!response.ok) throw new Error('Échec du commentaire');
      
      const newComment = await response.json();
      setPosts(posts.map(post => 
        post.id === postId 
          ? { ...post, comments: [...post.comments, newComment] } 
          : post
      ));
      setCommentContent('');
    } catch (err) {
      setError(err.message);
    }
  };

  // Chargement des détails d'un post
  const fetchPostDetails = async (postId) => {
    try {
      const response = await fetch(`/posts/${postId}`);
      if (!response.ok) throw new Error('Erreur de chargement du post');
      return await response.json();
    } catch (err) {
      setError(err.message);
    }
  };

  if (isLoading) return <div className="text-center p-8">Chargement...</div>;
  if (error) return <div className="text-red-500 p-8">Erreur : {error}</div>;

  return (
    <div className="max-w-2xl mx-auto bg-black text-white min-h-screen">
      {/* Formulaire de création de post */}
      <div className="p-4 border-b border-gray-800">
        <form onSubmit={handleCreatePost} className="space-y-2">
          <input
            type="text"
            placeholder="Titre du projet"
            value={newPost.title}
            onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
            className="w-full bg-gray-900 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <textarea
            placeholder="Décrivez votre projet..."
            value={newPost.content}
            onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
            className="w-full bg-gray-900 rounded-lg p-2 h-32 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="bg-blue-500 px-4 py-2 rounded-full hover:bg-blue-600 float-right"
          >
            Publier
          </button>
        </form>
      </div>

      {/* Liste des posts */}
      {posts.map(post => (
        <div key={post.id} className="p-4 border-b border-gray-800">
          {/* En-tête du post */}
          <div className="flex items-start gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
              {post.author_initials}
            </div>
            <div>
              <h3 className="font-bold">{post.author_name}</h3>
              <p className="text-gray-500 text-sm">@{post.author_username}</p>
            </div>
          </div>

          {/* Contenu du post */}
          <div className="mb-4">
            <h4 className="font-bold text-lg mb-2">{post.title}</h4>
            <p className="text-gray-300">{post.content}</p>
          </div>

          {/* Interactions */}
          <div className="flex gap-4 text-gray-500">
            <button className="hover:text-blue-500">❤️ {post.likes}</button>
            
            {/* Section commentaires */}
            <div className="flex-1">
              <input
                type="text"
                placeholder="Ajouter un commentaire..."
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                className="bg-gray-900 rounded-full px-4 py-2 w-full focus:outline-none"
                onKeyPress={(e) => e.key === 'Enter' && handleAddComment(post.id)}
              />
              
              {/* Liste des commentaires */}
              {post.comments?.map(comment => (
                <div key={comment.id} className="mt-2 ml-4 p-2 bg-gray-900 rounded-lg">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-bold">{comment.author}</span>
                    <span className="text-gray-500">{comment.content}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Feed;