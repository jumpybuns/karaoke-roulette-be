const express = require('express');
const cors = require('cors');
const client = require('./client.js');
const app = express();
const morgan = require('morgan');
const ensureAuth = require('./auth/ensure-auth');
const request = require('superagent');
const createAuthRoutes = require('./auth/create-auth-routes');
const { mungedVideos } = require('../utils.js');


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan('dev')); // http logging

const authRoutes = createAuthRoutes();

// setup authentication routes to give user an auth token
// creates a /auth/signin and a /auth/signup POST route. 
// each requires a POST body with a .email and a .password
app.use('/auth', authRoutes);

// everything that starts with "/api" below here requires an auth token!
app.use('/api', ensureAuth);

// and now every request that has a token in the Authorization header will have a `req.userId` property for us to see who's talking
app.get('/api/test', (req, res) => {
  res.json({
    message: `in this proctected route, we get the user's id like so: ${req.userId}`
  });
});

app.get('/api/favorites', async(req, res) => {
  try {
    const data = await client.query(`
    SELECT * 
    FROM favorites 
    `);
    
    res.json(data.rows);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});

app.put('/api/favorites/:id', async(req, res) => {
  try {
    const data = await client.query(`
      UPDATE favorites
      WHERE favorites.owner_id = $1
      AND favorites.videoId = $2
      RETURNING *;
      `, [req.userId, req.params.id]);
    
    res.json(data.rows);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});

app.delete('/api/favorites/:booger', async(req, res) => {
  try {
    const favoritesId = req.params.booger;

    const data = await client.query(`
      DELETE from favorites 
      WHERE favorites.id=$1
      RETURNING *
    `, 
    [favoritesId]);
  
    res.json(data.rows[0]);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});






app.get('/api/videos', async(req, res) => {
 try {
    const response = await request.get(`https://youtube.googleapis.com/youtube/v3/search?part=snippet&maxResults=1&q=karaoke%20${req.query.search}&key=${process.env.YOUTUBE_API_KEY}`);
    const munged = mungedVideos(response.body);

    res.json(munged);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/names', async(req, res) => {
  try {
    const data = await client.query('SELECT * FROM names WHERE name.owner_id = $1', [req.userId]);
    res.json(data.rows);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});





app.use(require('./middleware/error'));



module.exports = app;
