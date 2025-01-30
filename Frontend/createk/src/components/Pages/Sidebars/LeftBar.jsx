import React from "react";
import { Box, List, ListItem, ListItemIcon, ListItemText, Typography, Avatar, Button } from "@mui/material";
import { Home, Tag, NotificationsNone, MailOutline, PersonOutline, MoreHoriz } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import LogoutIcon from '@mui/icons-material/Logout';


const LeftBar = () => {
    const navigate = useNavigate();
    const handleLogout = () => {
        // Implement logout functionality here
        console.log('Logout');
        // Example: Clear local storage and navigate to login page
        localStorage.removeItem('access_token');
        navigate('/login');
    };
    const menuItems = [
          { icon: <Home />, text: 'Home', path: '/' },
          { icon: <Tag />, text: 'Explore', path: '/explore' },
          { icon: <NotificationsNone />, text: 'Notifications', path: '/notifications' },
          { icon: <MailOutline />, text: 'Messages', path: '/messages' },
          { icon: <PersonOutline />, text: 'Profile', path: '/profile' },
          { icon: <LogoutIcon />, text: 'Logout',  function: handleLogout}
        ];

    

    return (
        <Box sx={{ display: 'flex', height: '100vh', bgcolor: '#000000' }}>
            {/* Left Sidebar */}
            <Box sx={{ width: 400, p: 2, borderRight: '1px solid #38444D' }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                    <Avatar src="/epilink.png" alt="Logo" sx={{ width: 56, height: 56 }} />
                </Box>
                <List>
                    {menuItems.map((item) => (
                        <ListItem
                            key={item.text}
                            button
                            onClick={() => item.path ? navigate(item.path) : item.function && item.function()}
                            sx={{
                                borderRadius: 8,
                                mb: 1,
                                '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' }
                            }}
                        >
                            <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>
                                {item.icon}
                            </ListItemIcon>
                            <ListItemText
                                primary={
                                    <Typography
                                        sx={{
                                            color: 'white',
                                            fontWeight: item.active ? 700 : 400
                                        }}
                                    >
                                        {item.text}
                                    </Typography>
                                }
                            />
                        </ListItem>
                    ))}
                </List>
                <Button
                    variant="contained"
                    fullWidth
                    sx={{
                        mt: 2,
                        borderRadius: 8,
                        bgcolor: '#1D9BF0',
                        textTransform: 'none',
                        py: 1.5
                    }}
                    onClick={() => navigate('/posts')}
                >
                    Post
                </Button>
            </Box>
        </Box>
    );
}

export default LeftBar;
