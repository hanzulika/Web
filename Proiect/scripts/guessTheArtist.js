FOLLOWED_ARTISTS = 'https://api.spotify.com/v1/me/following?type=artist&limit=50';

function onPageLoad() {
    onLoad();
    if (localStorage.getItem("access_token")) {
        loadProfilePage();
        loadArtists();
    }
}

function loadProfilePage() {
    fetch('../extra/guesser.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('container').innerHTML = data;
        })
        .catch(error => {
            console.error(error);
        });
}

function loadArtists() {
    // Call the API to get the followed artists
    callApi('GET', FOLLOWED_ARTISTS, null, handleArtistResponse);
}

let artists = []; // Array to store the artists

function handleArtistResponse(data) {
    console.log(data);
    // Check if data and data.artists.items are defined
    if (data && data.artists && data.artists.items) {
        // Process each artist in the data
        data.artists.items.forEach(item => {
            // Check if any of the artist's parameters are null
            if (item.name && item.genres && item.genres[0] && item.id && item.popularity && item.images && item.images[0]) {
                let artist = {
                    name: item.name,
                    genre: item.genres[0],
                    id: item.id,
                    popularity: item.popularity,
                    image: item.images[0]
                };
                // Add the artist to the array
                artists.push(artist);
            } else {
                console.error('One or more parameters are null for artist ' + item.name);
            }
        });

        // If there are more artists to fetch
        if (data.artists.next !== null) {
            // Get the ID of the last artist in the current batch
            let lastArtistId = data.artists.items[data.artists.items.length - 1].id;
            // Call the API again with the after parameter set to the last artist ID
            callApi('GET', FOLLOWED_ARTISTS + '&after=' + lastArtistId, null, handleArtistResponse);
        } else {
            // Load the first album for each artist
            artists.forEach(artist => {
                loadFirstAlbum(artist, function (updatedArtist) {
                    // Replace the artist in the array with the updated artist
                    let index = artists.findIndex(a => a.id === updatedArtist.id);
                    if (index !== -1) {
                        artists[index] = updatedArtist;
                    }
                });
            });
            artists.forEach(artist => {
                loadFirstRelatedArtist(artist, function(updatedArtist) {
                    // Replace the artist in the array with the updated artist
                    let index = artists.findIndex(a => a.id === updatedArtist.id);
                    if (index !== -1) {
                        artists[index] = updatedArtist;
                    }
                });
            });
            // Log the artists array when there are no more artists to fetch
            console.log(artists);
        }
    } else {
        console.error('Data or data.artists.items is undefined');
    }
}

function loadFirstAlbum(artist, callback) {
    callApi('GET', 'https://api.spotify.com/v1/artists/' + artist.id + '/albums', null, function (data) {
        if (data && data.items && data.items.length > 0) {
            // Sort the albums by release date in ascending order
            data.items.sort((a, b) => a.release_date.localeCompare(b.release_date));
            // Add the release year of the oldest album to the artist
            artist.firstAlbum = data.items[0].release_date.split('-')[0];
        } else {
            console.error('No albums found for artist ' + artist.name);
            // Set firstAlbum to "unknown" if the artist does not have any albums
            artist.firstAlbum = "unknown";
        }
        // Call the callback function
        callback(artist);
    });
}

function loadFirstRelatedArtist(artist, callback) {
    callApi('GET', 'https://api.spotify.com/v1/artists/' + artist.id + '/related-artists', null, function (data) {
        if (data && data.artists && data.artists.length > 0) {
            // Add the name of the first related artist to the artist
            artist.related = data.artists[0].name;
        } else {
            console.error('No related artists found for artist ' + artist.name);
            // Set related to "unknown" if the artist does not have any related artists
            artist.related = "unknown";
        }
        // Call the callback function
        callback(artist);
    });
}
