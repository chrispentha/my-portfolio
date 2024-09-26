// Import modules
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { RecaptchaEnterpriseServiceClient } = require('@google-cloud/recaptcha-enterprise');
const { LocalStorage } = require('node-localstorage');
const localStorage = new LocalStorage('../local_storage');

// Create an Express app
const app = express();
const port = process.env.PORT || 3000;

// Count Total Visitors
const visitorFile = path.join(__dirname, 'local_storage', 'visitors');

// Set up Google Cloud Recaptcha client
const client = new RecaptchaEnterpriseServiceClient();
const projectID = 'savvy-webbing-341304';

// Google reCAPTCHA secret key
const gRecaptchaUrl = 'https://www.google.com/recaptcha/api/siteverify';
const gRecaptchaSecretKey = '6LdMZEoqAAAAAChSlA8D8GDwxyCBzMJ6oth6V2dT';

// Function for get total visitors
function getVisitorCount() {
  if (!fs.existsSync(visitorFile)) {
    return 0;
  }

  const data = fs.readFileSync(visitorFile, 'utf-8');
  return parseInt(data) || 0;
}

// Function for increase total visitors
function incrementVisitorCount() {
  let count = getVisitorCount();
  count += 1;

  fs.writeFileSync(visitorFile, count.toString());
  return count;
}

// Use cMiddleware
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "frame-ancestors 'self' https://www.google.com"
  );
  next();
});

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Define a route for the homepage
app.get('/', (req, res) => {
  const totalVisitors = incrementVisitorCount();
  const lang = localStorage.getItem('lang');
  let file = null;

  switch (lang) {
    case 'en':
      file = 'index.html';
      break;
    case 'id':
      file = 'index-indo.html';
      break;
    default:
      file = 'index.html';
      // file = 'not-found.html';
  }

  res.sendFile(path.join(__dirname, '..', file), {
    headers: {
      'X-Total-Visitors': totalVisitors
    }
  });
});

// Save Lang
app.post('/save-lang', (req, res) => {
  localStorage.setItem('lang', req.body.lang);
  res.sendStatus(200);
});

// Route to validate reCAPTCHA token
app.post('/validate-token', async (req, res) => {
  const token = req.body['g_recaptcha_token'];

  if (!token || token === '') {
    return res.status(400).json(
      {
        success: false
        , message: 'No reCAPTCHA token provided.'
      }
    );
  }

  try {
    // Make a request to Google's reCAPTCHA API to validate the token
    const response = await axios.post(
      `${gRecaptchaUrl}?secret=${gRecaptchaSecretKey}&response=${token}`
    );

    const data = response.data;

    // Check if reCAPTCHA validation was successful
    if (data.success) {
      return res.json(
        {
          success: true
          , message: 'reCAPTCHA validation succeeded.'
        }
      );
    } else {
      return res.status(400).json(
        {
          success: false
          , message: 'reCAPTCHA validation failed.'
        }
      );
    }
  } catch (error) {
    return res.status(500).json(
      {
        success: false
        , message: 'Server error during reCAPTCHA validation.'
      }
    );
  }
});

// Serve static files from the root directory
app.use(express.static(path.join(__dirname, '..')));

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});