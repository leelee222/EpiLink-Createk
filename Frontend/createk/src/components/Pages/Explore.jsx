import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    IconButton,
    InputBase,
    Avatar,
    Card,
    CardContent,
    CardActions,
    CardMedia
} from '@mui/material';
import {
    FavoriteBorder,
    ChatBubbleOutline,
    Repeat,
    Share
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import LeftBar from './Sidebars/LeftBar';
import RightBar from './Sidebars/RightBar';
import { toast } from 'react-toastify';

const HomePage = () => {
    const navigate = useNavigate();

    const [feed, setFeed] = useState([]);
    const [profile, setProfile] = useState({});

    useEffect(() => {
        const fetchFeed = async () => {
            try {
                const token = localStorage.getItem('access_token');
                if (!token) {
                toast.error('No access token found. Please log in.');
                navigate('/login');
                return;
                }
                const response = await fetch('http://0.0.0.0:8080/feed/', {
                    headers: {
                        'accept': 'application/json',
                        'Authorization': 'Bearer ' + token
                    }
                });
                const data = await response.json();
                console.log('Feed:', data);
                setFeed(data);
                if (response.status === 401 || response.status === 403) {
                    toast.error('Unauthorized access. Please log in again.');
                    navigate('/login');
                } else {
                    toast.error('Failed to load feed. Please try again later.');
                }
            } catch (error) {
                console.error('Error fetching feed:', error);
            }
        };

        fetchFeed();
    }, []);

    useEffect(() => {
            const fetchProfile = async () => {
                const token = localStorage.getItem('access_token');
                if (!token) {
                    toast.error('No access token found. Please log in.');
                    navigate('/login');
                    return;
                }
                try {
                    const response = await fetch('http://0.0.0.0:8080/api/users/me', {
                        headers: {
                            'accept': 'application/json',
                            'Authorization': 'Bearer ' + token
                        }
                    });
                    if (response.ok) {
                        const data = await response.json();
                        setProfile(data);
                    } else if (response.status === 401 || response.status === 403) {
                        toast.error('Unauthorized access. Please log in again.');
                        navigate('/login');
                    } else {
                        toast.error('Failed to load profile. Please try again later.');
                    }
                } catch (error) {
                    console.error('Error fetching profile:', error);
                }
            };
    
            fetchProfile();
        }, []);

    return (
        <Box sx={{ display: 'flex', height: '100vh', bgcolor: '#000000' }}>
            <LeftBar />

            <Box sx={{ flex: 1, borderRight: '1px solid #38444D' }}>
                <Box sx={{ p: 2, borderBottom: '1px solid #38444D' }}>
                    <Typography variant="h6" sx={{ color: 'white', fontWeight: 700 }}>
                        Home
                    </Typography>
                </Box>

                {/* Tweet Input */}
                <Box sx={{ p: 2, borderBottom: '1px solid #38444D' }}>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Avatar src={profile.profile_picture}/>
                        <InputBase
                            placeholder="What's happening?"
                            fullWidth
                            sx={{ color: 'white' }}
                        />
                    </Box>
                </Box>

                {/* Tweet Feed */}
                <Box>
                    {/* Sample Tweet */}
                    {feed.map((tweet) => (
                        <Card key={tweet.id} sx={{ bgcolor: 'transparent', boxShadow: 'none', borderBottom: '1px solid #38444D' }}>
                            <CardContent sx={{ p: 2 }}>
                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    <Avatar />
                                    <Box>
                                        <Typography variant="subtitle1" sx={{ color: 'white' }}>
                                            {tweet.author_id}
                                        </Typography>
                                        <Typography variant="body1" sx={{ color: 'white', mt: 1 }}>
                                            {tweet.content}
                                        </Typography>
                                        {tweet.image && (
                                            <CardMedia
                                                component="img"
                                                image={tweet.image}
                                                sx={{ borderRadius: 4, mt: 2 }}
                                            />
                                        )}
                                    </Box>
                                </Box>
                            </CardContent>
                            <CardActions sx={{ px: 2 }}>
                                <IconButton size="small" sx={{ color: '#6E767D' }}>
                                    <ChatBubbleOutline />
                                </IconButton>
                                <IconButton size="small" sx={{ color: '#6E767D' }}>
                                    <Repeat />
                                </IconButton>
                                <IconButton size="small" sx={{ color: '#6E767D' }}>
                                    <FavoriteBorder />
                                </IconButton>
                                <IconButton size="small" sx={{ color: '#6E767D' }}>
                                    <Share />
                                </IconButton>
                            </CardActions>
                        </Card>
                    ))}
                </Box>
            </Box>
            <RightBar />
        </Box>
    );
};

export default HomePage;