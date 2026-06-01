const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// API Health checkup whether it is alive or not
app.get('/api/health', (req, res) => {
  res.json({status : 'OK', message : "API HEALTHY"});
});

// Start the server
const port = 5000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});