import React, { useState } from 'react';
import {
  Box,
  Button,
  Modal,
  Typography,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl
} from '@mui/material';
import { toast } from 'react-toastify';

const MakePosts = ({ open, onClose }) => {
  const [postType, setPostType] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handlePostTypeChange = (event) => {
    setPostType(event.target.value);
  };

  const handleSubmit = async () => {
    try {
      const combinedTitle = `${postType} ${title}`;
      const response = await fetch('http://0.0.0.0:8080/posts/create', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Authorization': 'Bearer ' + localStorage.getItem('access_token'),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title: combinedTitle, content })
      });

      if (response.ok) {
        toast.success('Post created successfully!');
        onClose();
      } else {
        toast.error('Failed to create post.');
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
    }
  };


  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          bgcolor: 'background.paper',
          border: '2px solid #000',
          boxShadow: 24,
          p: 4,
          borderRadius: 6
        }}
      >
        <Typography id="modal-title" variant="h6" component="h2">
          Create a Post
        </Typography>
        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel id="post-type-label">Post Type</InputLabel>
          <Select
            labelId="post-type-label"
            id="post-type"
            value={postType}
            label="Post Type"
            onChange={handlePostTypeChange}
          >
            <MenuItem value="mood">Mood</MenuItem>
            <MenuItem value="project">Project</MenuItem>
            <MenuItem value="help">Help</MenuItem>
            <MenuItem value="me">Me</MenuItem>
          </Select>
        </FormControl>
        <TextField
          fullWidth
          label="Title"
          variant="outlined"
          sx={{ mt: 2 }}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <TextField
          fullWidth
          label="Content"
          variant="outlined"
          multiline
          rows={4}
          sx={{ mt: 2 }}
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <Button
          variant="contained"
          sx={{ mt: 2 }}
          onClick={handleSubmit}
        >
          Submit
        </Button>
      </Box>
    </Modal>
  );
};

export default MakePosts;