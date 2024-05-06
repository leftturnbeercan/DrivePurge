const express = require('express');
const app = express();
const port = 3000;

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Add a specific route for serving CSS files
app.get('/styles.css', (req, res) => {
  res.sendFile(__dirname + '/public/styles.css');
});

// Start the server
app.listen(port, () => {
  console.log(`Frontend application is running on port ${port}`);
});

