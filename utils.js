  
function mungedVideos(video) {
  return video.items.map(song => {
    return {
      videoId: song.id.videoId,
      title: song.snippet.title,
      thumbnails: song.snippet.thumbnails.default.url
  
    }; 
  });
}

function mungeRandom(random){
  const videos =  random.randoms.map(song => {
    return {
      videoId: song.id.videoId,
      title: song.snippet.title,
      thumbnails: song.snippet.thumbnails.default.url
    };  
      
  });
  
  return videos[Math.floor(Math.random() * (videos.length - 1))];
    
}
  

module.exports = { mungedVideos, mungeRandom };
 
