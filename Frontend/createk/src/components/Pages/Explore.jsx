import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Avatar,
    Card,
    CardContent,
    CardMedia,
    CardActions,
    IconButton,
    CircularProgress
} from '@mui/material';
import {
    FavoriteBorder,
    ChatBubbleOutline,
    Repeat,
    Share
} from '@mui/icons-material';
import LeftBar from './Sidebars/LeftBar';
import RightBar from './Sidebars/RightBar';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const ExplorePage = () => {
    const navigate = useNavigate();
    const [feed, setFeed] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFeed = async () => {
            const token = localStorage.getItem('access_token');
            if (!token) {
                toast.error('Please login to view feed');
                navigate('/login');
                return;
            }

            try {
                const response = await fetch('http://0.0.0.0:8080/feed/', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                if (!response.ok) {
                    if (response.status === 401) {
                        toast.error('Unauthorized access. Please log in again.');
                        navigate('/login');
                    } else {
                        throw new Error('Failed to load feed');
                    }
                }
                const data = await response.json();
                console.log(data); 
                setFeed(data);
            } catch (error) {
                toast.error(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchFeed();
    }, [navigate]);

    return (
        <Box sx={{ display: 'flex', height: '100vh', bgcolor: '#000000' }}>
            <LeftBar />
            
            <Box sx={{ 
                flex: 1, 
                borderRight: '1px solid #38444D',
                overflowY: 'auto'
            }}>
                <Box sx={{ p: 2, borderBottom: '1px solid #38444D' }}>
                    <Typography variant="h6" sx={{ color: 'white', fontWeight: 700 }}>
                        Explore
                    </Typography>
                </Box>

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <Box sx={{ p: 2 }}>
                        {feed.map(post => (
                            <Card 
                                key={post.id}
                                sx={{ 
                                    bgcolor: 'transparent',
                                    boxShadow: 'none',
                                    border: '1px solid #38444D',
                                    borderRadius: 3,
                                    mb: 3
                                }}
                            >
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
                                </CardContent>

                                <CardActions sx={{ px: 2, pb: 1 }}>
                                    <IconButton sx={{ color: '#6E767D' }}>
                                        <ChatBubbleOutline />
                                        <Typography variant="caption" sx={{ color: '#6E767D', ml: 1 }}>
                                            {post.comments_count}
                                        </Typography>
                                    </IconButton>
                                    
                                    <IconButton sx={{ color: '#6E767D' }}>
                                        <Repeat />
                                        <Typography variant="caption" sx={{ color: '#6E767D', ml: 1 }}>
                                            {post.shares_count}
                                        </Typography>
                                    </IconButton>
                                    
                                    <IconButton sx={{ color: '#6E767D' }}>
                                        <FavoriteBorder />
                                        <Typography variant="caption" sx={{ color: '#6E767D', ml: 1 }}>
                                            {post.likes_count}
                                        </Typography>
                                    </IconButton>
                                    
                                    <IconButton sx={{ color: '#6E767D' }}>
                                        <Share />
                                    </IconButton>
                                </CardActions>
                            </Card>
                        ))}

                        {feed.length === 0 && (
                            <Box sx={{ 
                                display: 'flex', 
                                justifyContent: 'center', 
                                alignItems: 'center',
                                height: '50vh'
                            }}>
                                <Typography variant="h6" sx={{ color: '#6E767D' }}>
                                    Aucune publication à afficher
                                </Typography>
                            </Box>
                        )}
                    </Box>
                )}
            </Box>

            <RightBar />
        </Box>
    );
};

export default ExplorePage;