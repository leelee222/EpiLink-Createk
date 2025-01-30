// import React, { useEffect, useState } from 'react';
// import {
//     Box,
//     Typography,
//     IconButton,
//     Avatar,
//     Button,
//     Tabs,
//     Tab,
// } from '@mui/material';
// import {
//     ArrowBack,
//     Link as LinkIcon,
//     CalendarMonth,
//     PushPin,
//     MoreHoriz,
//     FavoriteBorder,
//     ChatBubbleOutline,
//     Repeat,
//     Share,
//     Verified
// } from '@mui/icons-material';
// import LeftBar from './Sidebars/LeftBar';
// import RightBar from './Sidebars/RightBar';
// import { useNavigate } from 'react-router-dom';
// import { toast } from 'react-toastify';

// const ProfilePage = () => {
//     const [selectedTab, setSelectedTab] = useState(0);
//     const [profile, setProfile] = useState(null);
//     const navigate = useNavigate();

//     const handleTabChange = (event, newValue) => {
//         setSelectedTab(newValue);
//     };

//     useEffect(() => {
//         const fetchProfile = async () => {
//             const token = localStorage.getItem('access_token');
//             if (!token) {
//                 toast.error('No access token found. Please log in.');
//                 navigate('/login');
//                 return;
//             }

//             try {
//                 const response = await fetch('http://0.0.0.0:8080/api/users/me', {
//                     headers: {
//                         'accept': 'application/json',
//                         'Authorization': 'Bearer ' + token
//                     }
//                 });
//                 if (response.ok) {
//                     const data = await response.json();
//                     setProfile(data);
//                 } else if (response.status === 401 || response.status === 403) {
//                     toast.error('Unauthorized access. Please log in again.');
//                     navigate('/login');
//                 } else {
//                     toast.error('Failed to load profile. Please try again later.');
//                 }
//             } catch (error) {
//                 console.error('Error fetching profile:', error);
//             }
//         };

//         fetchProfile();
//     }, []);

//     if (!profile) {
//         return <Typography sx={{ color: 'white' }}>Loading...</Typography>;
//     }

//     return (
//         <Box sx={{ display: 'flex', height: '100vh', bgcolor: '#000000', overflowY: 'auto' }}>
//             {/* Left Sidebar */}
//             {/* <Box sx={{ width: 400, borderRight: '1px solid #38444D' }}> */}
//             <LeftBar />
//             {/* </Box> */}

//             {/* Main Content */}
//             <Box sx={{ flex: 1 }}>
//                 {/* Header */}
//                 <Box
//                     sx={{
//                         p: 1,
//                         display: 'flex',
//                         alignItems: 'center',
//                         borderBottom: '1px solid #38444D'
//                     }}
//                 >
//                     <IconButton sx={{ color: 'white' }}>
//                         <ArrowBack onClick={() => navigate('/')} />
//                     </IconButton>
//                     <Box sx={{ ml: 2 }}>
//                         <Typography variant="h6" sx={{ color: 'white', fontWeight: 700 }}>
//                             {profile.full_name}
//                         </Typography>
//                         <Typography variant="body2" sx={{ color: '#6E767D' }}>
//                             {profile.email}
//                         </Typography>
//                     </Box>
//                 </Box>

//                 {/* Profile Header Image */}
//                 <Box
//                     sx={{
//                         height: 200,
//                         bgcolor: '#333',
//                         position: 'relative'
//                     }}
//                 />

//                 {/* Profile Info Section */}
//                 <Box sx={{ px: 2, pb: 2 }}>
//                     {/* Profile Picture and Edit Button */}
//                     <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
//                         <Avatar
//                             src={profile.profile_picture}
//                             sx={{
//                                 width: 100,
//                                 height: 100,
//                                 border: '4px solid #15202B',
//                                 mt: -7
//                             }}
//                         />
//                         <Button
//                             variant="outlined"
//                             sx={{
//                                 color: 'white',
//                                 borderColor: 'white',
//                                 borderRadius: 8,
//                                 textTransform: 'none',
//                                 mt: 2
//                             }}
//                         >
//                             Edit profile
//                         </Button>
//                     </Box>

//                     {/* Profile Name and Verification */}
//                     <Box sx={{ mt: 1 }}>
//                         <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
//                             <Typography variant="h6" sx={{ color: 'white', fontWeight: 700 }}>
//                                 {profile.full_name}
//                             </Typography>
//                         </Box>
//                         <Typography sx={{ color: '#6E767D' }}>@{profile.email.split('@')[0]}</Typography>
//                     </Box>

//                     {/* Profile Details */}
//                     <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
//                         <Box sx={{ display: 'flex', alignItems: 'center', color: '#6E767D' }}>
//                         </Box>
//                         <Box sx={{ display: 'flex', alignItems: 'center', color: '#6E767D' }}>
//                             <CalendarMonth sx={{ fontSize: 18, mr: 0.5 }} />
//                             <Typography variant="body2">Joined {new Date(profile.created_at).toLocaleDateString()}</Typography>
//                         </Box>
//                     </Box>

//                     {/* Following/Followers */}
//                     <Box sx={{ display: 'flex', gap: 3 }}>
//                         <Typography sx={{ color: 'white' }}>
//                             <strong>{profile.following.length}</strong>{' '}
//                             <span style={{ color: '#6E767D' }}>Following</span>
//                         </Typography>
//                         <Typography sx={{ color: 'white' }}>
//                             <strong>{profile.followers.length}</strong>{' '}
//                             <span style={{ color: '#6E767D' }}>Followers</span>
//                         </Typography>
//                     </Box>
//                 </Box>

//                 {/* Tabs */}
//                 <Tabs
//                     value={selectedTab}
//                     onChange={handleTabChange}
//                     sx={{
//                         borderBottom: '1px solid #38444D',
//                         '& .MuiTab-root': {
//                             color: '#6E767D',
//                             textTransform: 'none',
//                             minWidth: 'auto',
//                             px: 4
//                         },
//                         '& .Mui-selected': {
//                             color: 'white !important'
//                         },
//                         '& .MuiTabs-indicator': {
//                             backgroundColor: '#1D9BF0'
//                         }
//                     }}
//                 >
//                     <Tab label="Posts" />
//                 </Tabs>

//                 {/* Post Feed */}
//                 <Box>
//                     {/* Pinned Post */}
//                     <Box sx={{ borderBottom: '1px solid #38444D', p: 2 }}>
//                         <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
//                             <PushPin sx={{ color: '#6E767D', fontSize: 16 }} />
//                             <Typography variant="body2" sx={{ color: '#6E767D' }}>
//                                 Pinned Post
//                             </Typography>
//                         </Box>
//                         <Box sx={{ display: 'flex', gap: 2 }}>
//                             <Avatar />
//                             <Box sx={{ flex: 1 }}>
//                                 <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//                                     <Typography sx={{ color: 'white', fontWeight: 700 }}>
//                                         Profile Name
//                                     </Typography>
//                                     <Typography sx={{ color: '#6E767D' }}>@username · 2h</Typography>
//                                 </Box>
//                                 <Typography sx={{ color: 'white', my: 1 }}>
//                                     Pinned tweet content goes here. #coding #webdev
//                                 </Typography>
//                                 <Box
//                                     sx={{
//                                         display: 'flex',
//                                         justifyContent: 'space-between',
//                                         maxWidth: 400,
//                                         mt: 2
//                                     }}
//                                 >
//                                     <IconButton size="small" sx={{ color: '#6E767D' }}>
//                                         <ChatBubbleOutline fontSize="small" />
//                                     </IconButton>
//                                     <IconButton size="small" sx={{ color: '#6E767D' }}>
//                                         <Repeat fontSize="small" />
//                                     </IconButton>
//                                     <IconButton size="small" sx={{ color: '#6E767D' }}>
//                                         <FavoriteBorder fontSize="small" />
//                                     </IconButton>
//                                     <IconButton size="small" sx={{ color: '#6E767D' }}>
//                                         <Share fontSize="small" />
//                                     </IconButton>
//                                 </Box>
//                             </Box>
//                             <IconButton sx={{ color: '#6E767D', alignSelf: 'start' }}>
//                                 <MoreHoriz />
//                             </IconButton>
//                         </Box>
//                     </Box>

//                     {/* Regular Posts */}
//                     {[1, 2, 3].map((tweet) => (
//                         <Box
//                             key={tweet}
//                             sx={{ borderBottom: '1px solid #38444D', p: 2 }}
//                         >
//                             <Box sx={{ display: 'flex', gap: 2 }}>
//                                 <Avatar />
//                                 <Box sx={{ flex: 1 }}>
//                                     <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//                                         <Typography sx={{ color: 'white', fontWeight: 700 }}>
//                                             Profile Name
//                                         </Typography>
//                                         <Typography sx={{ color: '#6E767D' }}>
//                                             @username · {tweet}d
//                                         </Typography>
//                                     </Box>
//                                     <Typography sx={{ color: 'white', my: 1 }}>
//                                         Post content {tweet} goes here. #twitter #clone
//                                     </Typography>
//                                     <Box
//                                         sx={{
//                                             display: 'flex',
//                                             justifyContent: 'space-between',
//                                             maxWidth: 400,
//                                             mt: 2
//                                         }}
//                                     >
//                                         <IconButton size="small" sx={{ color: '#6E767D' }}>
//                                             <ChatBubbleOutline fontSize="small" />
//                                         </IconButton>
//                                         <IconButton size="small" sx={{ color: '#6E767D' }}>
//                                             <Repeat fontSize="small" />
//                                         </IconButton>
//                                         <IconButton size="small" sx={{ color: '#6E767D' }}>
//                                             <FavoriteBorder fontSize="small" />
//                                         </IconButton>
//                                         <IconButton size="small" sx={{ color: '#6E767D' }}>
//                                             <Share fontSize="small" />
//                                         </IconButton>
//                                     </Box>
//                                 </Box>
//                                 <IconButton sx={{ color: '#6E767D', alignSelf: 'start' }}>
//                                     <MoreHoriz />
//                                 </IconButton>
//                             </Box>
//                         </Box>
//                     ))}
//                 </Box>
//             </Box>

//             {/* Right Sidebar */}
//             {/* <Box sx={{ width: 275, borderLeft: '1px solid #38444D' }}> */}
//             <RightBar />
//             {/* </Box> */}
//         </Box>
//     );
// };

// export default ProfilePage;


import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    IconButton,
    Avatar,
    Button,
    Tabs,
    Tab,
    Chip,
    Card,
    CardContent,
    CircularProgress
} from '@mui/material';
import {
    ArrowBack,
    Work,
    Group,
    Edit,
    LinkedIn,
    GitHub
} from '@mui/icons-material';
import LeftBar from './Sidebars/LeftBar';
import RightBar from './Sidebars/RightBar';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const ProfilePage = () => {
    const [selectedTab, setSelectedTab] = useState(0);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const handleTabChange = (event, newValue) => {
        setSelectedTab(newValue);
    };

    useEffect(() => {
        const fetchProfile = async () => {
            const token = localStorage.getItem('access_token');
            if (!token) {
                navigate('/login');
                return;
            }

            try {
                const response = await fetch('http://127.0.0.1:8080/api/users/me', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                const data = await response.json();
                setProfile(data);
                console.log(data)
            } catch (error) {
                toast.error('Error loading profile data');
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [navigate]);

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
        <Box sx={{ display: 'flex', height: '100vh', bgcolor: '#000000', overflowY: 'auto' }}>
            <LeftBar />

            {/* Main Content */}
            <Box sx={{ flex: 1, borderRight: '1px solid #38444D' }}>
                {/* Header */}
                <Box sx={{ p: 2, borderBottom: '1px solid #38444D', display: 'flex', alignItems: 'center' }}>
                    <IconButton onClick={() => navigate(-1)} sx={{ color: 'white' }}>
                        <ArrowBack />
                    </IconButton>
                    <Typography variant="h6" sx={{ color: 'white', ml: 2 }}>
                        Profile
                    </Typography>
                </Box>

                {/* Profile Header */}
                <Box sx={{ position: 'relative', bgcolor: '#192734', height: 150 }}>
                    <Avatar
                        src={profile.profile_picture}
                        sx={{
                            width: 100,
                            height: 100,
                            border: '4px solid #000',
                            position: 'absolute',
                            bottom: -50,
                            left: 20
                        }}
                    />
                </Box>

                {/* Profile Info */}
                <Box sx={{ p: 3, mt: 4 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box>
                            <Typography variant="h4" sx={{ color: 'white' }}>
                                {profile.full_name}
                                <Typography component="span" sx={{ color: '#6E767D', ml: 2 }}>
                                    {profile.email}
                                </Typography>
                            </Typography>
                            <Typography sx={{ color: '#6E767D', mt: 1 }}>
                                Member since {new Date(profile.created_at).toLocaleDateString()}
                            </Typography>
                        </Box>
                        <Button
                            variant="outlined"
                            startIcon={<Edit />}
                            sx={{
                                color: 'white',
                                borderColor: '#38444D',
                                borderRadius: 2,
                                textTransform: 'none'
                            }}
                        >
                            Edit Profile
                        </Button>
                    </Box>

                    {/* Social Links */}
                    <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                        {profile.social_links?.linkedin && (
                            <IconButton 
                                href={profile.social_links.linkedin} 
                                target="_blank"
                                sx={{ color: '#0A66C2' }}
                            >
                                <LinkedIn />
                            </IconButton>
                        )}
                        {profile.social_links?.github && (
                            <IconButton 
                                href={profile.social_links.github} 
                                target="_blank"
                                sx={{ color: 'white' }}
                            >
                                <GitHub />
                            </IconButton>
                        )}
                    </Box>

                    {/* Network Stats */}
                    <Box sx={{ display: 'flex', gap: 4, mt: 3 }}>
                        <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h6" sx={{ color: 'white' }}>
                                {profile.following?.length || 0}
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#6E767D' }}>
                                Following
                            </Typography>
                        </Box>
                        <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h6" sx={{ color: 'white' }}>
                                {profile.followers?.length || 0}
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#6E767D' }}>
                                Followers
                            </Typography>
                        </Box>
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
                            px: 4,
                            '&.Mui-selected': { color: '#1DA1F2' }
                        }
                    }}
                >
                    <Tab icon={<Work />} label="Projects" />
                    <Tab icon={<Group />} label="Collaborations" />
                </Tabs>

                {/* Content Area */}
                <Box sx={{ p: 3 }}>
                    {selectedTab === 0 && (
                        <Typography sx={{ color: 'white' }}>
                            Projects content here...
                        </Typography>
                    )}
                    
                    {selectedTab === 1 && (
                        <Typography sx={{ color: 'white' }}>
                            Collaborations content here...
                        </Typography>
                    )}
                </Box>
            </Box>

            <RightBar />
        </Box>
    );
};

export default ProfilePage;