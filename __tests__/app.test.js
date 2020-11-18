require('dotenv').config();

const { execSync } = require('child_process');
const data = require('../data/favorites.js');
const fakeRequest = require('supertest');
const app = require('../lib/app');
const client = require('../lib/client');
const { mungedVideos } = require('../utils.js');

describe('app routes', () => {
  describe('routes', () => {
    let token;

    beforeAll(async done => {
      execSync('npm run setup-db');

      client.connect();

      const signInData = await fakeRequest(app)
        .post('/auth/signup')
        .send({
          email: 'jon@user.com',
          password: '1234'
        });

      token = signInData.body.token;

      return done();
    });

    afterAll(done => {
      return client.end(done);
    });

    test('returns favorites', async () => {
      const mungedData = mungedVideos(data);
      expect(mungedData).toEqual(
        [
          {
            'thumbnails': 'https://i.ytimg.com/vi/1Y77BelxUQY/default.jpg',
            'title': 'The Champs - Tequila (Karaoke Version)',
            'videoId': '1Y77BelxUQY',
          },
          {
            'thumbnails': 'https://i.ytimg.com/vi/E0id9kAMS4k/default.jpg',
            'title': 'Dan + Shay - Tequila (Karaoke Version)',
            'videoId': 'E0id9kAMS4k',
          }
        ]
      );
    });
    test('post to favorites', async () => {
      const expectation = {
        'thumbnails': 'https://i.ytimg.com/vi/E0id9kAMS4k/default.jpg',
        'title': 'Dan + Shay - Tequila (Karaoke Version)',
        'videoid': 'E0id9kAMS4k',
        'owner_id': 2,
        'id': 2
      };
      const favorites = {
        'thumbnails': 'https://i.ytimg.com/vi/E0id9kAMS4k/default.jpg',
        'title': 'Dan + Shay - Tequila (Karaoke Version)',
        'videoId': 'E0id9kAMS4k',
      };
      const data = await fakeRequest(app)
        .post('/api/favorites')
        .send(favorites)
        .set('Authorization', token);

      expect(data.body).toEqual(expectation);
    });
  });
});
