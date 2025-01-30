import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Avatar,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Divider,
    InputBase,
    IconButton,
    CircularProgress
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import LeftBar from './Sidebars/LeftBar';
import RightBar from './Sidebars/RightBar';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const MessagesPage = () => {
    const navigate = useNavigate();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [conversations, setConversations] = useState([]);
    const [currentUserId, setCurrentUserId] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCurrentUser = async () => {
            const token = localStorage.getItem('access_token');
            if (!token) {
                toast.error('Please login to view messages');
                navigate('/login');
                return;
            }

            try {
                const response = await fetch('http://0.0.0.0:8080/api/users/me', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                const data = await response.json();
                setCurrentUserId(data.id);
            } catch (error) {
                console.error('Error fetching current user:', error);
            }
        };
        fetchCurrentUser();
    }, [navigate]);

    useEffect(() => {
        const fetchConversations = async () => {
            const token = localStorage.getItem('access_token');
            if (!currentUserId || !token) return;

            try {
                const response = await fetch(`http://0.0.0.0:8080/messages/conversations/${currentUserId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                const data = await response.json();
                setConversations(data);
            } catch (error) {
                toast.error('Failed to load conversations');
            } finally {
                setLoading(false);
            }
        };
        fetchConversations();
    }, [currentUserId]);

    useEffect(() => {
        const fetchMessages = async () => {
            const token = localStorage.getItem('access_token');
            if (!selectedConversation || !token) return;

            try {
                const response = await fetch(
                    `http://0.0.0.0:8080/messages/conversations/${selectedConversation.id}`, 
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    }
                );
                const data = await response.json();
                setMessages(data);
            } catch (error) {
                toast.error('Failed to load messages');
            }
        };
        fetchMessages();
    }, [selectedConversation]);

    const handleSendMessage = async () => {
        const token = localStorage.getItem('access_token');
        if (!newMessage.trim() || !selectedConversation || !token) return;

        try {
            const response = await fetch('http://0.0.0.0:8080/messages/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    content: newMessage,
                    recipient_id: selectedConversation.participant.id
                })
            });

            if (response.ok) {
                const newMsg = await response.json();
                setMessages([...messages, newMsg]);
                setNewMessage('');
            }
        } catch (error) {
            toast.error('Failed to send message');
        }
    };

    return (
        <Box sx={{ display: 'flex', height: '100vh', bgcolor: '#000000' }}>
            <LeftBar />
            
            <Box sx={{ 
                flex: 1, 
                display: 'flex', 
                borderRight: '1px solid #38444D'
            }}>
                {/* Conversations List */}
                <Box sx={{ 
                    width: 300, 
                    borderRight: '1px solid #38444D',
                    overflowY: 'auto'
                }}>
                    <Box sx={{ p: 2, borderBottom: '1px solid #38444D' }}>
                        <Typography variant="h6" sx={{ color: 'white', fontWeight: 700 }}>
                            Messages
                        </Typography>
                    </Box>

                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <List>
                            {conversations.map(convo => (
                                <ListItem
                                    key={convo.id}
                                    button
                                    onClick={() => setSelectedConversation(convo)}
                                    sx={{
                                        bgcolor: selectedConversation?.id === convo.id ? '#192734' : 'inherit',
                                        '&:hover': { bgcolor: '#15181c' }
                                    }}
                                >
                                    <ListItemAvatar>
                                        <Avatar src={convo.participant?.profile_picture} />
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={
                                            <Typography sx={{ color: 'white', fontWeight: 500 }}>
                                                {convo.participant?.username}
                                            </Typography>
                                        }
                                        secondary={
                                            <Typography sx={{ color: '#6E767D', textOverflow: 'ellipsis' }}>
                                                {convo.last_message?.content}
                                            </Typography>
                                        }
                                    />
                                </ListItem>
                            ))}
                        </List>
                    )}
                </Box>

                {/* Messages Panel */}
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    {selectedConversation ? (
                        <>
                            <Box sx={{ 
                                p: 2, 
                                borderBottom: '1px solid #38444D',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 2
                            }}>
                                <Avatar src={selectedConversation.participant?.profile_picture} />
                                <Typography variant="h6" sx={{ color: 'white' }}>
                                    {selectedConversation.participant?.username}
                                </Typography>
                            </Box>

                            <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
                                {messages.map((message) => (
                                    <Box
                                        key={message.id}
                                        sx={{
                                            display: 'flex',
                                            justifyContent: message.sender_id === currentUserId ? 'flex-end' : 'flex-start',
                                            mb: 2
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                maxWidth: '70%',
                                                p: 1.5,
                                                borderRadius: 3,
                                                bgcolor: message.sender_id === currentUserId ? '#1DA1F2' : '#192734',
                                                color: 'white'
                                            }}
                                        >
                                            <Typography variant="body1">{message.content}</Typography>
                                            <Typography variant="caption" sx={{ 
                                                color: message.sender_id === currentUserId ? '#e0e0e0' : '#6E767D',
                                                display: 'block',
                                                textAlign: 'right',
                                                mt: 0.5
                                            }}>
                                                {new Date(message.timestamp).toLocaleTimeString([], { 
                                                    hour: '2-digit', 
                                                    minute: '2-digit' 
                                                })}
                                            </Typography>
                                        </Box>
                                    </Box>
                                ))}
                            </Box>

                            <Box sx={{ p: 2, borderTop: '1px solid #38444D' }}>
                                <Box sx={{ 
                                    display: 'flex', 
                                    gap: 1,
                                    bgcolor: '#192734',
                                    borderRadius: 4,
                                    p: 1
                                }}>
                                    <InputBase
                                        fullWidth
                                        placeholder="Écrire un message..."
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                        sx={{ 
                                            color: 'white',
                                            pl: 2
                                        }}
                                    />
                                    <IconButton
                                        onClick={handleSendMessage}
                                        sx={{ 
                                            color: '#1DA1F2',
                                            '&:hover': { bgcolor: 'rgba(29, 161, 242, 0.1)' }
                                        }}
                                    >
                                        <SendIcon />
                                    </IconButton>
                                </Box>
                            </Box>
                        </>
                    ) : (
                        <Box sx={{ 
                            flex: 1, 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            color: '#6E767D'
                        }}>
                            Sélectionnez une conversation
                        </Box>
                    )}
                </Box>
            </Box>

            <RightBar />
        </Box>
    );
};

export default MessagesPage;