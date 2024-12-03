import React, { useState } from 'react';
import { Container, Typography, TextField, Button, Select, MenuItem, Paper } from '@mui/material';
import axios from 'axios';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';

function CodeGenerationPage() {
  const [instructions, setInstructions] = useState('');
  const [language, setLanguage] = useState('python');
  const [generatedCode, setGeneratedCode] = useState('');
  const [output, setOutput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const BASE_URL = import.meta.env.VITE_BASE_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setGeneratedCode('');
    setOutput('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${BASE_URL}/api/containers/generate`, 
        { instructions, language },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setGeneratedCode(response.data.code);
      setOutput(response.data.output);
    } catch (error) {
      console.error('Code generation failed:', error);
      setError(error.response?.data?.error || 'An error occurred during code generation');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h4" align="center" gutterBottom>
        AI Code Generation
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Instructions"
          multiline
          rows={4}
          fullWidth
          margin="normal"
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          required
        />
        <Select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          fullWidth
          margin="normal"
        >
          <MenuItem value="python">Python</MenuItem>
          <MenuItem value="javascript">JavaScript</MenuItem>
        </Select>
        <Button type="submit" variant="contained" color="primary" fullWidth disabled={isLoading}>
          {isLoading ? 'Generating...' : 'Generate Code'}
        </Button>
      </form>
      {error && (
        <Typography color="error" align="center" gutterBottom>
          {error}
        </Typography>
      )}
      {generatedCode && (
        <Paper elevation={3} style={{ marginTop: '20px', padding: '20px' }}>
          <Typography variant="h6" gutterBottom>
            Generated Code:
          </Typography>
          <CodeMirror
            value={generatedCode}
            height="200px"
            extensions={[language === 'python' ? python() : javascript()]}
            editable={false}
            theme="dark"
          />
        </Paper>
      )}
      {output && (
        <Paper elevation={3} style={{ marginTop: '20px', padding: '20px' }}>
          <Typography variant="h6" gutterBottom>
            Output:
          </Typography>
          <pre>{output}</pre>
        </Paper>
      )}
    </Container>
  );
}

export default CodeGenerationPage;