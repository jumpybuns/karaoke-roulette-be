  
function mungedVideos(video) {
  return video.items.map(song => {
    return {
      videoId: song.items.id.videoId,
      title: song.items.snippet.title,
      thumbnails: song.items.snippet.thumbnails.default.url
  
    }; 
  });
}

module.exports = { mungedVideos };
 
