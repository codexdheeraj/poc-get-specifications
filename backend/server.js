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
    // File path and MIME type for PDF
    const filePath = req.file.path;
    const mimeType = 'application/pdf';

    // Prepare the file part for the Gemini model
    const filePart = fileToGenerativePart(filePath, mimeType);

    // const prompt = "Extract all the Important Information from this PDF and return the markdown code to show them in table with the headers in arranged manner with all the informations present in pdf. Make sure not a single information should be missed";
    const prompt = "Extract all the informations from this pdf and return the markdown code to show all the informations present in the pdf in form of tables with the headers and make sure no information should be missed and make tables attractive with all the informations"
    // Call the Gemini API with the prompt and file part
    const result = await model.generateContent([prompt, filePart]);
    
    // Assuming result.response.text contains the markdown
    const markdownResponse = result.response.candidates[0].content.parts[0].text;
    
    // Delete the uploaded PDF file
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error('Error deleting file:', err);
      } else {
        console.log('PDF file deleted successfully:', filePath);
      }
    });
    

    // Send back the markdown response
    res.json({ markdown: markdownResponse });
  } catch (err) {
    console.error('Error processing PDF:', err);
    res.status(500).send('Error processing PDF');
  }
});

app.listen(5000, () => {
  console.log('Backend server running on port 5000');
});
