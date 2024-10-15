const express = require('express');
const multer = require('multer');
const fs = require('fs');
const cors = require('cors');
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
app.use(cors());

// Initialize Google Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

const upload = multer({ dest: 'uploads/' });

// Function to convert file to Gemini-compatible format
function fileToGenerativePart(path, mimeType) {
  return {
    inlineData: {
      data: Buffer.from(fs.readFileSync(path)).toString('base64'),
      mimeType,
    },
  };
}

// Endpoint to handle PDF uploads
app.post('/upload-pdf', upload.single('pdf'), async (req, res) => {
  try {
    // File path and MIME type for PDF (you can modify for images as well)
    const filePath = req.file.path;
    const mimeType = 'application/pdf';

    // Prepare the file part for the Gemini model (assuming PDFs are acceptable)
    const filePart = fileToGenerativePart(filePath, mimeType);

    const prompt = "Extract specifications and parameters from this PDF.";
    
    // Call the Gemini API with the prompt and file part
    const result = await model.generateContent([prompt, filePart]);
    console.log(JSON.stringify(result.response, null, 2));
    fs.unlink(filePath, (err) => {
        if (err) {
          console.error('Error deleting file:', err);
        } else {
          console.log('PDF file deleted successfully:', filePath);
        }
      });
    // Send back the response
    res.json(result.response);
  } catch (err) {
    console.error('Error processing PDF:', err);
    res.status(500).send('Error processing PDF');
  }
});

app.listen(5000, () => {
  console.log('Backend server running on port 5000');
});
