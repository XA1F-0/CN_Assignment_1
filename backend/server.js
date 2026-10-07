// Starts the Express web server.
require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const opportunityRoutes = require('./routes/opportunityRoutes');

const app = express();

app.use(cors());          // CORS: lets a page from another origin/port call this API
app.use(express.json());  // reads JSON request bodies

app.use('/api/opportunities', opportunityRoutes);
app.use(express.static(path.join(__dirname, '..', 'frontend'))); // serves the frontend files

// Bad JSON in the request body -> 400. Any other unexpected error -> 500.
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Request body is not valid JSON.' });
  }
  console.error(err);
  res.status(500).json({ message: 'Internal server error.' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
