import React from "react";
import {
    Box,
    Typography,
    InputBase,
    Paper,
    List,
    ListItem,
    ListItemText,
  } from '@mui/material';
  import {
    Search,
  } from '@mui/icons-material';

const RightBar = () => {
    return (
        <Box sx={{ display: 'flex', height: '100vh', bgcolor: '#000000' }}>
            <Box sx={{ width: 400, p: 2 }}>
                <Paper
                    sx={{
                        p: 2,
                        bgcolor: '#273340',
                        borderRadius: 4,
                        mb: 2
                    }}
                >
                    <InputBase
                        placeholder="Search EpiLink"
                        startAdornment={<Search sx={{ color: '#6E767D', mr: 1 }} />}
                        fullWidth
                        sx={{ color: 'white' }}
                    />
                </Paper>

                <Paper
                    sx={{
                        bgcolor: '#273340',
                        borderRadius: 4,
                        overflow: 'hidden'
                    }}
                >
                    <Typography
                        variant="h6"
                        sx={{ p: 2, color: 'white', fontWeight: 700 }}
                    >
                        What's happening
                    </Typography>
                    <List>
                        {/* Trending Topics */}
                        {[1, 2, 3].map((item) => (
                            <ListItem
                                key={item}
                                button
                                sx={{ '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' } }}
                            >
                                <ListItemText
                                    primary={
                                        <Typography variant="body2" sx={{ color: '#6E767D' }}>
                                            Trending
                                        </Typography>
                                    }
                                    secondary={
                                        <Typography variant="body1" sx={{ color: 'white' }}>
                                            #Trending Topic {item}
                                        </Typography>
                                    }
                                />
                            </ListItem>
                        ))}
                    </List>
                </Paper>
            </Box>
        </Box>
    );
}

export default RightBar;
