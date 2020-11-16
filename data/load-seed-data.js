const client = require('../lib/client');
// import our seed data:
const videos = require('./videos.js');
const usersData = require('./users.js');
const { getEmoji } = require('../lib/emoji.js');

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
      videos.map(video => {
        return client.query(`
                    INSERT INTO videos (playlistId, videoId, title, thumbnails, owner_id)
                    VALUES ($1, $2, $3, $4, $5);
                `,
        // eslint-disable-next-line no-undef
        [video.playlistId, video.videoId, video.title, video.thumbnails, user.id]);
      })
    );
    

    console.log('seed data load complete', getEmoji(), getEmoji(), getEmoji());
  }
  catch(err) {
    console.log(err);
  }
  finally {
    client.end();
  }
    
}
