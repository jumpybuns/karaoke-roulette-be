const express = require('express');
const cors = require('cors');
const client = require('./client.js');
const app = express();
const morgan = require('morgan');
const ensureAuth = require('./auth/ensure-auth');
const request = require('superagent');
const createAuthRoutes = require('./auth/create-auth-routes');
const { mungedVideos, mungeRandom } = require('../utils.js');


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
    const response = await request.get(`https://youtube.googleapis.com/youtube/v3/search?part=snippet&maxResults=1&q=karaoke%20sing%20king%20${req.query.search}&type=video&videoEmbeddable=true&key=${process.env.YOUTUBE_API_KEY}`);
    const munged = mungedVideos(response.body);

    res.json(munged);
  } catch(e) {

    res.status(500).json({ error: e.message });
  }
});

app.get('/api/random-videos', async(req, res) => {
  try {
    const response = await request.get(`https://youtube.googleapis.com/youtube/v3/search?part=snippet&maxResults=100&q=karaoke%20"(karaoke%20version)"&relevanceLanguage=en&safeSearch=none&type=video&videoEmbeddable=true&key=${process.env.YOUTUBE_API_KEY}`);
    const munged = mungeRandom(response.body);

    res.json(munged);                 
  } catch(e) {

    res.status(500).json({ error: e.message });
  }
});



app.get('/random-name', async(req, res) => {
  try {
    const data = await client.query('SELECT * FROM names ');
    res.json(data.rows[Math.floor(Math.random() * (data.rows.length - 1))]);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});





app.use(require('./middleware/error'));



module.exports = app;
