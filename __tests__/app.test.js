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

    test('gets favorites', async () => {
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

    test('deletes a resource, returns respond from db', async () => {
      const expectation = {
        'thumbnails': 'https://i.ytimg.com/vi/E0id9kAMS4k/default.jpg',
        'title': 'Dan + Shay - Tequila (Karaoke Version)',
        'videoid': 'E0id9kAMS4k',
        'owner_id': 2,
        'id': 2
      };
      const data = await fakeRequest(app)
        .delete('/api/favorites/2')
        .set('Authorization', token)
        .expect('Content-Type', /json/)

        .expect(200);

      expect(data.body).toEqual(expectation);
    });
    test('returns all names', async () => {

      const expectation = [
        {
          id: 1,
          name: 'Bard',
          last_name: 'Aesir',
        },
        {
          id: 2,
          name: 'Helgi',
          last_name: 'Biscuit',
        },
        {
          id: 3,
          name: 'Sokolf',
          last_name: 'Blade',
        },
        {
          id: 4,
          name: 'Dar',
          last_name: 'Cage',
        },
        {
          id: 5,
          name: 'Klaengr',
          last_name: 'Cave',
        },
        {
          id: 6,
          name: 'Throst',
          last_name: 'Bone',
        },
        {
          id: 7,
          name: 'Baror',
          last_name: 'Bear',
        },
        {
          id: 8,
          name: 'Thorod',
          last_name: 'Coffee',
        },
        {
          id: 9,
          name: 'Sokolf',
          last_name: 'Cloud',
        },
        {
          id: 10,
          name: 'Alivi',
          last_name: 'Code',
        },
        {
          id: 11,
          name: 'Vika',
          last_name: 'Elk',
        },
        {
          id: 12,
          name: 'Ulf',
          last_name: 'Dwarf',
        },
        {
          id: 13,
          name: 'Floki',
          last_name: 'Dragon',
        },
        {
          id: 14,
          name: 'Waltheof',
          last_name: 'Dwarf',
        },
        {
          id: 15,
          name: 'Sokolf',
          last_name: 'Cheese',
        },
        {
          id: 16,
          name: 'Geri',
          last_name: 'Caregiver',
        },
        {
          id: 17,
          name: 'Waltheof',
          last_name: 'Stainester',
        },
        {
          id: 18,
          name: 'Surt',
          last_name: 'Wildrough',
        },
        {
          id: 19,
          name: 'Seen',
          last_name: 'Ger',
        },
        {
          id: 20,
          name: 'Soe',
          last_name: 'Prano',
        },
        {
          id: 21,
          name: 'Crew',
          last_name: 'Ner',
        },
        {
          id: 22,
          name: 'Marry',
          last_name: 'Banilow',
        },
        {
          id: 23,
          name: 'Melvis',
          last_name: 'Dresley',
        },
      ];

      const data = await fakeRequest(app)

        .get('/random-name')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });

    test('returns a single name', async () => {
      const expectation = [{
        id: 1,
        name: 'Bard',
        last_name: 'Aesir',
      }];

      const data = await fakeRequest(app)
        .get('/api/random-name/1')
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });

  });
});
