// Function to search for YouTube videos
function searchVideos() {
    const query = document.getElementById('searchInput').value;
    const apiKey = 'AIzaSyBG5kANMOyLQoRDPC5Q-6wRrCFcoNiY8MM'; // API key
    const maxResults = 10;

    // Construct API request URL
    const apiUrl = `https://www.googleapis.com/youtube/v3/search?key=${apiKey}&part=snippet&type=video&q=${query}&maxResults=${maxResults}`;

    // Make API request
    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            // Process search results
            const videos = data.items.map(item => ({
                videoId: item.id.videoId,
                title: item.snippet.title,
                description: item.snippet.description,
                thumbnailUrl: item.snippet.thumbnails.default.url
            }));

            // Display search results
            const resultsContainer = document.getElementById('results');
            resultsContainer.innerHTML = '';

            videos.forEach(video => {
                const videoElement = `
                    <div class="card mb-3">
                        <div class="row g-0">
                            <div class="col-md-4">
                                <img src="${video.thumbnailUrl}" class="img-fluid rounded-start" alt="Thumbnail">
                            </div>
                            <div class="col-md-8">
                                <div class="card-body">
                                    <h5 class="card-title">${video.title}</h5>
                                    <p class="card-text">${video.description}</p>
                                    <a href="https://www.youtube.com/watch?v=${video.videoId}" class="btn btn-primary" target="_blank">Watch on YouTube</a>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                resultsContainer.innerHTML += videoElement;
            });
        })
        .catch(error => {
            console.error('Error fetching data:', error);
        });
}

// Function to clear search results
function clearResults() {
    document.getElementById('results').innerHTML = '';
}