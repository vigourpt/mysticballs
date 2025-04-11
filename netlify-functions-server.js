// Simple server to run Netlify functions locally
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 9000;

// Enable CORS for all routes
app.use(cors());

// Parse JSON bodies
app.use(bodyParser.json());

// Load environment variables
require('dotenv').config({ path: '.env.development' });

// Middleware to handle function requests
app.all('/.netlify/functions/:name', async (req, res) => {
  try {
    const functionName = req.params.name;
    const functionPath = path.join(__dirname, 'netlify/functions', `${functionName}.ts`);
    
    // Check if the function exists
    if (!fs.existsSync(functionPath)) {
      console.error(`Function not found: ${functionName}`);
      return res.status(404).json({ error: `Function not found: ${functionName}` });
    }
    
    console.log(`Invoking function: ${functionName}`);
    console.log(`Request method: ${req.method}`);
    
    // Create a temporary file to store the request event
    const tempEventFile = path.join(__dirname, 'temp-event.json');
    
    // Prepare the event object similar to what Netlify would provide
    const event = {
      httpMethod: req.method,
      headers: req.headers,
      queryStringParameters: req.query,
      body: JSON.stringify(req.body),
      path: req.path,
      isBase64Encoded: false
    };
    
    // Write the event to the temporary file
    fs.writeFileSync(tempEventFile, JSON.stringify(event));
    
    // Use ts-node to run the function directly
    const command = `cd ${__dirname} && npx ts-node -e "
      const event = require('./temp-event.json');
      const { handler } = require('./netlify/functions/${functionName}');
      handler(event).then(result => {
        console.log(JSON.stringify(result));
        process.exit(0);
      }).catch(error => {
        console.error(error);
        process.exit(1);
      })
    "`;
    
    exec(command, (error, stdout, stderr) => {
      // Clean up the temporary file
      if (fs.existsSync(tempEventFile)) {
        fs.unlinkSync(tempEventFile);
      }
      
      if (error) {
        console.error(`Error executing function: ${error.message}`);
        console.error(`stderr: ${stderr}`);
        return res.status(500).json({ error: 'Function execution failed', details: error.message });
      }
      
      try {
        // Parse the function result
        const result = JSON.parse(stdout);
        
        // Set status code and headers
        res.status(result.statusCode || 200);
        
        if (result.headers) {
          Object.keys(result.headers).forEach(header => {
            res.setHeader(header, result.headers[header]);
          });
        }
        
        // Send the response
        res.send(result.body);
      } catch (parseError) {
        console.error(`Error parsing function result: ${parseError.message}`);
        console.error(`stdout: ${stdout}`);
        res.status(500).json({ error: 'Error parsing function result', details: parseError.message });
      }
    });
  } catch (error) {
    console.error('Error invoking function:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});

app.listen(port, () => {
  console.log(`Netlify Functions server running at http://localhost:${port}`);
});
