import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Avatar,
    Card,
    CardContent,
    IconButton,
    CircularProgress
} from '@mui/material';
import {
    Circle as UnreadIndicator,
    Comment as CommentIcon,
    Favorite as LikeIcon,
    Repeat as ShareIcon
} from '@mui/icons-material';
import LeftBar from './Sidebars/LeftBar';
import RightBar from './Sidebars/RightBar';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const NotificationsPage = () => {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNotifications = async () => {
            const token = localStorage.getItem('access_token');
            if (!token) {
                toast.error('Please login to view notifications');
                navigate('/login');
                return;
            }

            try {
                const response = await fetch('http://0.0.0.0:8080/notifications/', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) throw new Error('Failed to fetch notifications');
                
                const data = await response.json();
                setNotifications(data);
            } catch (error) {
                toast.error(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchNotifications();
    }, []);

    const handleMarkAsRead = async (notificationId) => {
        const token = localStorage.getItem('access_token');
        try {
            const response = await fetch(`http://0.0.0.0:8080/notifications/${notificationId}/read`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error('Failed to mark as read');
            
            setNotifications(prev => prev.map(n => 
                n.id === notificationId ? { ...n, read: true } : n
            ));
        } catch (error) {
            toast.error(error.message);
        }
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'like':
                return <LikeIcon color="error" />;
            case 'comment':
                return <CommentIcon color="primary" />;
            case 'share':
                return <ShareIcon color="success" />;
            default:
                return <UnreadIndicator color="primary" />;
        }
    };

    return (
        <Box sx={{ display: 'flex', height: '100vh', bgcolor: '#000000' }}>
            <LeftBar />
            
            <Box sx={{ flex: 1, borderRight: '1px solid #38444D', overflowY: 'auto' }}>
                <Box sx={{ p: 2, borderBottom: '1px solid #38444D' }}>
                    <Typography variant="h6" sx={{ color: 'white', fontWeight: 700 }}>
                        Notifications
                    </Typography>
                </Box>

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    notifications.map(notification => (
                        <Card 
                            key={notification.id}
                            sx={{ 
                                bgcolor: notification.read ? '#000000' : '#192734',
                                boxShadow: 'none',
                                borderBottom: '1px solid #38444D',
                                cursor: 'pointer',
                                '&:hover': { bgcolor: '#15181c' }
                            }}
                            onClick={() => handleMarkAsRead(notification.id)}
                        >
                            <CardContent sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                <Box sx={{ position: 'relative' }}>
                                    <Avatar src={notification.sender?.profile_picture} />
                                    {!notification.read && (
                                        <UnreadIndicator 
                                            sx={{ 
                                                position: 'absolute', 
                                                bottom: 0,
                                                right: 0,
                                                fontSize: '12px',
                                                color: '#1DA1F2'
                                            }} 
                                        />
                                    )}
                                </Box>
                                
                                <Box sx={{ flexGrow: 1 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        {getNotificationIcon(notification.type)}
                                        <Typography variant="body2" sx={{ color: '#6E767D' }}>
                                            {new Date(notification.created_at).toLocaleDateString()}
                                        </Typography>
                                    </Box>
                                    <Typography variant="body1" sx={{ color: 'white', mt: 1 }}>
                                        <strong>{notification.sender?.username}</strong> {notification.message}
                                    </Typography>
                                </Box>
                            </CardContent>
                        </Card>
                    ))
                )}
            </Box>

            <RightBar />
        </Box>
    );
};

export default NotificationsPage;