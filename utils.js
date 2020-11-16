  
function mungedVideos(items) {
  return {
    videoId: items.id.videoId,
    title: items.snippet.title,
    thumbnails: items.snippet.thumbnails.default.url
  
  }; 
}

module.exports = { mungedVideos };
 
