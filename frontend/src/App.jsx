import React, { useState } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './App.css'; // Import custom CSS for styles

const App = () => {
  const [markdownContent, setMarkdownContent] = useState('');
  const [loading, setLoading] = useState(false); // Loading state

  const handleUpload = async (event) => {
    const formData = new FormData();
    formData.append('pdf', event.target.files[0]);

    setLoading(true); // Set loading state to true

    try {
      const response = await axios.post('http://localhost:5000/upload-pdf', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setMarkdownContent(response.data.markdown); // Set the markdown content from response
      console.log("Content got");
    } catch (error) {
      console.error('Error uploading PDF:', error);
    } finally {
      setLoading(false); // Set loading state to false after processing
    }
  };

  return (
    <div className="pdf-uploader">
      <input type="file" accept="application/pdf" onChange={handleUpload} />
      {loading && (
        <div className="loading-icon">
          <img src="loading.gif" alt="Loading..." /> {/* Replace with your loading icon */}
          <p>Generating content...</p>
        </div>
      )}
      {!loading && markdownContent && (
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {markdownContent}
        </ReactMarkdown> // Render the markdown content
      )}
    </div>
  );
};

export default App;
