  
function mungedVideos(video) {
  return video.items.map(song => {
    return {
      videoId: song.id.videoId,
      title: song.snippet.title,
      thumbnails: song.snippet.thumbnails.default.url
  
    }; 
  });
}

module.exports = { mungedVideos };
 
