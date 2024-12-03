import React, { useState, useEffect, useRef } from 'react';
import { 
  Container, 
  Paper, 
  Box, 
  Typography, 
  TextField, 
  IconButton, 
  Avatar, 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  Alert,
  List,
  ListItem,
  Grid
} from '@mui/material';
import { 
  Send,
  AttachFile,
  Check,
  Close,
  Lock
} from '@mui/icons-material';
import { useParams } from 'react-router-dom';

export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [improvementDialog, setImprovementDialog] = useState(null);
  const [assignment, setAssignment] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const { id } = useParams();
  const BASE_URL = import.meta.env.VITE_BASE_URL;

  useEffect(() => {
    fetchMessages();
  }, [id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${BASE_URL}/api/assignments/${id}/chat/messages/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) throw new Error('Failed to fetch messages');
      const data = await response.json();
      setMessages(data.messages || []);
      setAssignment(data.assignment);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() && selectedFiles.length === 0) return;

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('message', newMessage);
      selectedFiles.forEach(file => {
        formData.append('files[]', file);
      });

      const response = await fetch(
        `${BASE_URL}/api/assignments/${id}/chat/improve/`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData
        }
      );

      if (!response.ok) throw new Error('Failed to improve message');
      const data = await response.json();
      
      setImprovementDialog({
        messageId: data.message_id,
        original: data.original,
        improved: data.improved,
        canDeliver: data.can_deliver,
        deliveryStatus: data.delivery_status
      });

    } catch (err) {
      setError('Failed to process message:'+err);
    }
  };

  const handleConfirmMessage = async (useImproved = false) => {
    try {
      const token = localStorage.getItem('token');
      const finalVersion = useImproved ? 
        improvementDialog.improved : 
        improvementDialog.original;

      await fetch(
        `${BASE_URL}/api/assignments/${id}/chat/messages/${improvementDialog.messageId}/`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ final_version: finalVersion })
        }
      );

      setNewMessage('');
      setSelectedFiles([]);
      setImprovementDialog(null);
      fetchMessages();
    } catch (err) {
      setError('Failed to send message:'+err);
    }
  };

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const renderMessage = (message) => (
    <Box>
      {/* Text Content */}
      {message.body && (
        <Typography variant="body1" sx={{ mb: 1 }}>
          {message.body}
        </Typography>
      )}

      {/* Attachments */}
      {message.attachments?.length > 0 && (
        <Grid container spacing={1} sx={{ mb: 1 }}>
          {message.attachments.map((attachment) => (
            attachment.files.map((file, index) => (
              <Grid item xs={12} key={index}>
                <Paper
                  sx={{
                    p: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    cursor: 'pointer'
                  }}
                  onClick={() => window.open(file.url, '_blank')}
                >
                  <AttachFile />
                  <Typography noWrap>
                    {file.name}
                  </Typography>
                </Paper>
              </Grid>
            ))
          ))}
        </Grid>
      )}

      <Typography variant="caption" color="text.secondary">
        {new Date(message.timestamp).toLocaleString()}
      </Typography>
    </Box>
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  const canSendMessages = assignment?.can_deliver || !assignment?.completed;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper 
        elevation={3} 
        sx={{ 
          height: 'calc(100vh - 100px)',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Header */}
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h6">
            {assignment?.subject}
          </Typography>
          {!canSendMessages && assignment?.completed && (
            <Alert 
              severity="warning"
              icon={<Lock />}
              sx={{ mt: 1 }}
            >
              Messages are locked until the 60% delivery time is reached
            </Alert>
          )}
        </Box>

        {/* Messages */}
        <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2, bgcolor: 'grey.50' }}>
          <List>
            {messages.map((message, index) => (
              <ListItem
                key={index}
                sx={{
                  flexDirection: message.creator === 'Us' ? 'row-reverse' : 'row',
                  gap: 2,
                  mb: 2
                }}
              >
                <Avatar
                  sx={{
                    bgcolor: message.creator === 'Us' ? 'primary.main' : 'secondary.main'
                  }}
                >
                  {message.creator === 'Us' ? 'U' : 'C'}
                </Avatar>
                <Paper
                  sx={{
                    p: 2,
                    maxWidth: '70%',
                    bgcolor: message.creator === 'Us' ? 'primary.light' : 'white'
                  }}
                >
                  {renderMessage(message)}
                </Paper>
              </ListItem>
            ))}
            <div ref={messagesEndRef} />
          </List>
        </Box>

        {/* Input Area */}
        <Box sx={{ p: 2, bgcolor: 'background.paper' }}>
          {/* Selected Files */}
          {selectedFiles.length > 0 && (
            <Box sx={{ mb: 2 }}>
              {selectedFiles.map((file, index) => (
                <Typography key={index} variant="body2">
                  {file.name}
                </Typography>
              ))}
            </Box>
          )}

          <Grid container spacing={1} alignItems="center">
            <Grid item>
              <input
                type="file"
                multiple
                onChange={handleFileSelect}
                style={{ display: 'none' }}
                ref={fileInputRef}
              />
              <IconButton 
                onClick={() => fileInputRef.current?.click()}
                disabled={!canSendMessages}
              >
                <AttachFile />
              </IconButton>
            </Grid>
            <Grid item xs>
              <TextField
                fullWidth
                multiline
                maxRows={4}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={canSendMessages ? 
                  "Type your message..." : 
                  "Messages locked until 60% time reached"}
                disabled={!canSendMessages}
              />
            </Grid>
            <Grid item>
              <IconButton 
                color="primary"
                onClick={handleSendMessage}
                disabled={!canSendMessages || (!newMessage.trim() && selectedFiles.length === 0)}
              >
                <Send />
              </IconButton>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      {/* Improvement Dialog */}
      <Dialog
        open={!!improvementDialog}
        onClose={() => setImprovementDialog(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Message Review
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Original Message:
            </Typography>
            <Paper sx={{ p: 2, bgcolor: 'grey.100' }}>
              <Typography>{improvementDialog?.original}</Typography>
            </Paper>
          </Box>
          
          <Box>
            <Typography variant="subtitle2" color="primary" gutterBottom>
              AI Suggested Improvement:
            </Typography>
            <Paper sx={{ p: 2, bgcolor: 'primary.50' }}>
              <Typography>{improvementDialog?.improved}</Typography>
            </Paper>
          </Box>
          
          {!improvementDialog?.canDeliver && improvementDialog?.deliveryStatus && (
            <Alert severity="info" sx={{ mt: 2 }}>
              {improvementDialog.deliveryStatus.message}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setImprovementDialog(null)}
            startIcon={<Close />}
          >
            Cancel
          </Button>
          <Button
            onClick={() => handleConfirmMessage(false)}
            startIcon={<Send />}
          >
            Send Original
          </Button>
          <Button
            onClick={() => handleConfirmMessage(true)}
            variant="contained"
            startIcon={<Check />}
            color="primary"
          >
            Use Improved Version
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}