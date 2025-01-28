import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    IconButton,
    Avatar,
    Button,
    Tabs,
    Tab,
} from '@mui/material';
import {
    ArrowBack,
    Link as LinkIcon,
    CalendarMonth,
    PushPin,
    MoreHoriz,
    FavoriteBorder,
    ChatBubbleOutline,
    Repeat,
    Share,
    Verified
} from '@mui/icons-material';
import LeftBar from './Sidebars/LeftBar';
import RightBar from './Sidebars/RightBar';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const ProfilePage = () => {
    const [selectedTab, setSelectedTab] = useState(0);
    const [profile, setProfile] = useState(null);
    const navigate = useNavigate();

    const handleTabChange = (event, newValue) => {
        setSelectedTab(newValue);
    };

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

    if (!profile) {
        return <Typography sx={{ color: 'white' }}>Loading...</Typography>;
    }

    return (
        <Box sx={{ display: 'flex', height: '100vh', bgcolor: '#000000', overflowY: 'auto' }}>
            {/* Left Sidebar */}
            {/* <Box sx={{ width: 400, borderRight: '1px solid #38444D' }}> */}
            <LeftBar />
            {/* </Box> */}

            {/* Main Content */}
            <Box sx={{ flex: 1 }}>
                {/* Header */}
                <Box
                    sx={{
                        p: 1,
                        display: 'flex',
                        alignItems: 'center',
                        borderBottom: '1px solid #38444D'
                    }}
                >
                    <IconButton sx={{ color: 'white' }}>
                        <ArrowBack onClick={() => navigate('/')} />
                    </IconButton>
                    <Box sx={{ ml: 2 }}>
                        <Typography variant="h6" sx={{ color: 'white', fontWeight: 700 }}>
                            {profile.full_name}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#6E767D' }}>
                            {profile.email}
                        </Typography>
                    </Box>
                </Box>

                {/* Profile Header Image */}
                <Box
                    sx={{
                        height: 200,
                        bgcolor: '#333',
                        position: 'relative'
                    }}
                />

                {/* Profile Info Section */}
                <Box sx={{ px: 2, pb: 2 }}>
                    {/* Profile Picture and Edit Button */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Avatar
                            src={profile.profile_picture}
                            sx={{
                                width: 100,
                                height: 100,
                                border: '4px solid #15202B',
                                mt: -7
                            }}
                        />
                        <Button
                            variant="outlined"
                            sx={{
                                color: 'white',
                                borderColor: 'white',
                                borderRadius: 8,
                                textTransform: 'none',
                                mt: 2
                            }}
                        >
                            Edit profile
                        </Button>
                    </Box>

                    {/* Profile Name and Verification */}
                    <Box sx={{ mt: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Typography variant="h6" sx={{ color: 'white', fontWeight: 700 }}>
                                {profile.full_name}
                            </Typography>
                        </Box>
                        <Typography sx={{ color: '#6E767D' }}>@{profile.email.split('@')[0]}</Typography>
                    </Box>

                    {/* Profile Details */}
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', color: '#6E767D' }}>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', color: '#6E767D' }}>
                            <CalendarMonth sx={{ fontSize: 18, mr: 0.5 }} />
                            <Typography variant="body2">Joined {new Date(profile.created_at).toLocaleDateString()}</Typography>
                        </Box>
                    </Box>

                    {/* Following/Followers */}
                    <Box sx={{ display: 'flex', gap: 3 }}>
                        <Typography sx={{ color: 'white' }}>
                            <strong>{profile.following.length}</strong>{' '}
                            <span style={{ color: '#6E767D' }}>Following</span>
                        </Typography>
                        <Typography sx={{ color: 'white' }}>
                            <strong>{profile.followers.length}</strong>{' '}
                            <span style={{ color: '#6E767D' }}>Followers</span>
                        </Typography>
                    </Box>
                </Box>

                {/* Tabs */}
                <Tabs
                    value={selectedTab}
                    onChange={handleTabChange}
                    sx={{
                        borderBottom: '1px solid #38444D',
                        '& .MuiTab-root': {
                            color: '#6E767D',
                            textTransform: 'none',
                            minWidth: 'auto',
                            px: 4
                        },
                        '& .Mui-selected': {
                            color: 'white !important'
                        },
                        '& .MuiTabs-indicator': {
                            backgroundColor: '#1D9BF0'
                        }
                    }}
                >
                    <Tab label="Posts" />
                </Tabs>

                {/* Post Feed */}
                <Box>
                    {/* Pinned Post */}
                    <Box sx={{ borderBottom: '1px solid #38444D', p: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <PushPin sx={{ color: '#6E767D', fontSize: 16 }} />
                            <Typography variant="body2" sx={{ color: '#6E767D' }}>
                                Pinned Post
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <Avatar />
                            <Box sx={{ flex: 1 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Typography sx={{ color: 'white', fontWeight: 700 }}>
                                        Profile Name
                                    </Typography>
                                    <Typography sx={{ color: '#6E767D' }}>@username · 2h</Typography>
                                </Box>
                                <Typography sx={{ color: 'white', my: 1 }}>
                                    Pinned tweet content goes here. #coding #webdev
                                </Typography>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        maxWidth: 400,
                                        mt: 2
                                    }}
                                >
                                    <IconButton size="small" sx={{ color: '#6E767D' }}>
                                        <ChatBubbleOutline fontSize="small" />
                                    </IconButton>
                                    <IconButton size="small" sx={{ color: '#6E767D' }}>
                                        <Repeat fontSize="small" />
                                    </IconButton>
                                    <IconButton size="small" sx={{ color: '#6E767D' }}>
                                        <FavoriteBorder fontSize="small" />
                                    </IconButton>
                                    <IconButton size="small" sx={{ color: '#6E767D' }}>
                                        <Share fontSize="small" />
                                    </IconButton>
                                </Box>
                            </Box>
                            <IconButton sx={{ color: '#6E767D', alignSelf: 'start' }}>
                                <MoreHoriz />
                            </IconButton>
                        </Box>
                    </Box>

                    {/* Regular Posts */}
                    {[1, 2, 3].map((tweet) => (
                        <Box
                            key={tweet}
                            sx={{ borderBottom: '1px solid #38444D', p: 2 }}
                        >
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <Avatar />
                                <Box sx={{ flex: 1 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Typography sx={{ color: 'white', fontWeight: 700 }}>
                                            Profile Name
                                        </Typography>
                                        <Typography sx={{ color: '#6E767D' }}>
                                            @username · {tweet}d
                                        </Typography>
                                    </Box>
                                    <Typography sx={{ color: 'white', my: 1 }}>
                                        Post content {tweet} goes here. #twitter #clone
                                    </Typography>
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            maxWidth: 400,
                                            mt: 2
                                        }}
                                    >
                                        <IconButton size="small" sx={{ color: '#6E767D' }}>
                                            <ChatBubbleOutline fontSize="small" />
                                        </IconButton>
                                        <IconButton size="small" sx={{ color: '#6E767D' }}>
                                            <Repeat fontSize="small" />
                                        </IconButton>
                                        <IconButton size="small" sx={{ color: '#6E767D' }}>
                                            <FavoriteBorder fontSize="small" />
                                        </IconButton>
                                        <IconButton size="small" sx={{ color: '#6E767D' }}>
                                            <Share fontSize="small" />
                                        </IconButton>
                                    </Box>
                                </Box>
                                <IconButton sx={{ color: '#6E767D', alignSelf: 'start' }}>
                                    <MoreHoriz />
                                </IconButton>
                            </Box>
                        </Box>
                    ))}
                </Box>
            </Box>

            {/* Right Sidebar */}
            {/* <Box sx={{ width: 275, borderLeft: '1px solid #38444D' }}> */}
            <RightBar />
            {/* </Box> */}
        </Box>
    );
};

export default ProfilePage;