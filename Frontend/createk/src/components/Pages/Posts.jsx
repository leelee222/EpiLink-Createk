import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Avatar,
    Card,
    CardContent,
    CardMedia,
    CardActions,
    TextField,
    Button,
    CircularProgress,
    IconButton
} from '@mui/material';
import {
    FavoriteBorder,
    ChatBubbleOutline,
    Repeat,
    Share
} from '@mui/icons-material';
import LeftBar from './Sidebars/LeftBar';
import RightBar from './Sidebars/RightBar';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

const PostPage = () => {
    const { post_id } = useParams();
    const navigate = useNavigate();
    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);

    // Fetch post and comments
    useEffect(() => {
        const fetchPostData = async () => {
            const token = localStorage.getItem('access_token');
            if (!token) {
                toast.error('Please login to view post');
                navigate('/login');
                return;
            }

            try {
                // Fetch post
                const postResponse = await fetch(`http://0.0.0.0:8080/posts/${post_id}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                const postData = await postResponse.json();
                setPost(postData);

                // Fetch comments
                const commentsResponse = await fetch(`http://0.0.0.0:8080/posts/${post_id}/comments`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                const commentsData = await commentsResponse.json();
                setComments(commentsData);

            } catch (error) {
                toast.error('Failed to load post data');
            } finally {
                setLoading(false);
            }
        };

        fetchPostData();
    }, [post_id, navigate]);

    const handleCreateComment = async () => {
        const token = localStorage.getItem('access_token');
        if (!newComment.trim() || !token) return;

        try {
            const response = await fetch(`http://0.0.0.0:8080/posts/${post_id}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    content: newComment
                })
            });

            if (response.ok) {
                const newCommentData = await response.json();
                setComments([...comments, newCommentData]);
                setNewComment('');
                toast.success('Comment posted successfully');
            }
        } catch (error) {
            toast.error('Failed to post comment');
        }
    };

    if (loading) {
        return (
            <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100vh',
                bgcolor: '#000000'
            }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ display: 'flex', height: '100vh', bgcolor: '#000000' }}>
            <LeftBar />
            
            <Box sx={{ 
                flex: 1, 
                borderRight: '1px solid #38444D',
                overflowY: 'auto'
            }}>
                {/* Main Post */}
                <Box sx={{ p: 2 }}>
                    <Card sx={{ 
                        bgcolor: 'transparent',
                        boxShadow: 'none',
                        border: '1px solid #38444D',
                        borderRadius: 3
                    }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                <Avatar src={post.author.profile_picture} />
                                <Box>
                                    <Typography variant="subtitle1" sx={{ color: 'white' }}>
                                        {post.author.username}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: '#6E767D' }}>
                                        {new Date(post.created_at).toLocaleDateString('fr-FR', {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric'
                                        })}
                                    </Typography>
                                </Box>
                            </Box>

                            <Typography variant="body1" sx={{ 
                                color: 'white', 
                                mt: 2,
                                whiteSpace: 'pre-line'
                            }}>
                                {post.content}
                            </Typography>

                            {post.media && (
                                <CardMedia
                                    component="img"
                                    image={post.media}
                                    sx={{ 
                                        borderRadius: 3,
                                        mt: 2,
                                        maxHeight: 500,
                                        objectFit: 'cover'
                                    }}
                                />
                            )}

                            <CardActions sx={{ px: 0, pt: 2 }}>
                                <IconButton sx={{ color: '#6E767D' }}>
                                    <ChatBubbleOutline />
                                    <Typography variant="caption" sx={{ color: '#6E767D', ml: 1 }}>
                                        {comments.length}
                                    </Typography>
                                </IconButton>
                                <IconButton sx={{ color: '#6E767D' }}>
                                    <Repeat />
                                </IconButton>
                                <IconButton sx={{ color: '#6E767D' }}>
                                    <FavoriteBorder />
                                </IconButton>
                                <IconButton sx={{ color: '#6E767D' }}>
                                    <Share />
                                </IconButton>
                            </CardActions>
                        </CardContent>
                    </Card>
                </Box>

                {/* Comments Section */}
                <Box sx={{ p: 2 }}>
                    <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
                        Comments ({comments.length})
                    </Typography>

                    {/* New Comment Input */}
                    <Box sx={{ mb: 4 }}>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <Avatar src={post.author.profile_picture} />
                            <TextField
                                fullWidth
                                variant="outlined"
                                placeholder="Write a comment..."
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        color: 'white',
                                        borderRadius: 4,
                                        borderColor: '#38444D',
                                        '& fieldset': { borderColor: '#38444D' },
                                        '&:hover fieldset': { borderColor: '#1DA1F2' }
                                    }
                                }}
                            />
                            <Button
                                variant="contained"
                                onClick={handleCreateComment}
                                sx={{
                                    bgcolor: '#1DA1F2',
                                    '&:hover': { bgcolor: '#1991DB' },
                                    borderRadius: 4,
                                    textTransform: 'none'
                                }}
                            >
                                Post
                            </Button>
                        </Box>
                    </Box>

                    {/* Comments List */}
                    {comments.map(comment => (
                        <Card 
                            key={comment.id}
                            sx={{ 
                                bgcolor: 'transparent',
                                boxShadow: 'none',
                                border: '1px solid #38444D',
                                borderRadius: 3,
                                mb: 2
                            }}
                        >
                            <CardContent>
                                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                    <Avatar src={comment.author.profile_picture} />
                                    <Box>
                                        <Typography variant="subtitle1" sx={{ color: 'white' }}>
                                            {comment.author.username}
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: '#6E767D' }}>
                                            {new Date(comment.created_at).toLocaleDateString('fr-FR', {
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric'
                                            })}
                                        </Typography>
                                    </Box>
                                </Box>

                                <Typography variant="body1" sx={{ 
                                    color: 'white', 
                                    mt: 2,
                                    whiteSpace: 'pre-line'
                                }}>
                                    {comment.content}
                                </Typography>
                            </CardContent>
                        </Card>
                    ))}

                    {comments.length === 0 && (
                        <Box sx={{ 
                            display: 'flex', 
                            justifyContent: 'center', 
                            alignItems: 'center',
                            height: '20vh'
                        }}>
                            <Typography variant="body1" sx={{ color: '#6E767D' }}>
                                No comments yet
                            </Typography>
                        </Box>
                    )}
                </Box>
            </Box>

            <RightBar />
        </Box>
    );
};

export default PostPage;