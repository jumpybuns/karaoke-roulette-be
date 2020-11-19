const client = require('../lib/client');
// import our seed data:
const favorites = require('./favoriteData.js');
const usersData = require('./users.js');
const { getEmoji } = require('../lib/emoji.js');
const names = require('./names.js');
run();

async function run() {

  try {
    await client.connect();

    const users = await Promise.all(
      usersData.map(user => {
        return client.query(`
                      INSERT INTO users (email, hash)
                      VALUES ($1, $2)
                      RETURNING *;
                  `,
          [user.email, user.hash]);
      })
    );

    const user = users[0].rows[0];

    await Promise.all(
      favorites.map(favorite => {
        return client.query(`
                    INSERT INTO favorites (videoId, title, thumbnails, owner_id)
                    VALUES ($1, $2, $3, $4);
                `,
          [favorite.videoId, favorite.title, favorite.thumbnails, user.id]);
      })
    );

    await Promise.all(
      names.map(name => {
        return client.query(`
                    INSERT INTO names (name, last_name)
                    VALUES ($1, $2);
                `,
          // eslint-disable-next-line no-undef
          [name.name, name.last_name]);
      })
    );

    console.log('seed data load complete', getEmoji(), getEmoji(), getEmoji());
  }
  catch (err) {
    console.log(err);
  }
  finally {
    client.end();
  }

}
