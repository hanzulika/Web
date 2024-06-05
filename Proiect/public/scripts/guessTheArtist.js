FOLLOWED_ARTISTS = 'https://api.spotify.com/v1/me/following?type=artist&limit=50';

function onPageLoad() {
    onLoad();
    if (localStorage.getItem("access_token")) {
        loadProfilePage();
        loadArtists();
    }
}

function loadProfilePage() {
    fetch('./extra/guesser.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('container').innerHTML = data;
        })
        .then(() => {
            //addEventListeners('guess-input', 'dropdown', artists);
            updateTries(0);
        })
        .catch(error => {
            console.error(error);
        });
}

function loadArtists() {
    // Call the API to get the followed artists
    callApi('GET', FOLLOWED_ARTISTS, null, function(response) {
        // Handle the artist response
        handleArtistResponse(response);
        // After the artists have been loaded, get a random artist
        getRandomArtist();
    });
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
                let genre = item.genres[0].toLowerCase();
                if (genre.includes('indie')) {
                    genre = 'indie';
                } else if (genre.includes('metal')|| genre.includes('death') || genre.includes('black') || genre.includes('thrash') || genre.includes('doom') || genre.includes('power') || genre.includes('progressive') || genre.includes('symphonic') || genre.includes('folk') || genre.includes('viking') || genre.includes('gothic') || genre.includes('nu') || genre.includes('grindcore') || genre.includes('hardcore') || genre.includes('metalcore') || genre.includes('post') || genre.includes('sludge') || genre.includes('stoner') || genre.includes('glam') || genre.includes('hair') || genre.includes('speed') || genre.includes('thrash')){
                    genre = 'metal';
                } else if (genre.includes('rock') || genre.includes('punk')) {
                    genre = 'rock';
                } else if (genre.includes('pop')) {
                    genre = 'pop';
                } else if (genre.includes('rap') || genre.includes('hip hop')) {
                    genre = 'rap';
                }
                
                let artist = {
                    name: item.name,
                    genre: genre,
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

            // Load the first related artist for each artist
            artists.forEach(artist => {
                loadFirstRelatedArtist(artist, function (updatedArtist) {
                    // Replace the artist in the array with the updated artist
                    let index = artists.findIndex(a => a.id === updatedArtist.id);
                    if (index !== -1) {
                        artists[index] = updatedArtist;
                    }
                });
            });

            console.log(artists);

            addEventListeners('guess-input', 'dropdown', artists);
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

let randomArtist = null;

function getRandomArtist() {
    // Check if artists array is not empty
    if (artists.length > 0) {
        // Generate a random index
        let randomIndex = Math.floor(Math.random() * artists.length);
        // Store the artist at the random index
        randomArtist = artists[randomIndex];
        console.log(randomArtist);
    } else {
        console.error('No artists available');
    }
}

function addEventListeners(inputFieldId, dropdownId, artists) {
    var inputField = document.getElementById(inputFieldId);
    var dropdown = document.getElementById(dropdownId);

    inputField.addEventListener('input', function() {
        dropdown.innerHTML = '';
        var inputText = inputField.value;

        if (inputText === '') {
            dropdown.style.display = 'none';
            return;
        }

        var matchingArtists = artists.filter(artist => artist.name.toLowerCase().includes(inputText.toLowerCase()));

        // Limit the number of options to 4
        matchingArtists.slice(0, 4).forEach(artist => {
            var option = document.createElement('div');
            option.textContent = artist.name;
            option.addEventListener('mouseover', function() {
                option.style.backgroundColor = '#ccc';
                option.style.cursor = 'pointer';
            });
            option.addEventListener('mouseout', function() {
                option.style.backgroundColor = ''; // Reset the background color
            });
            option.addEventListener('click', function() {
                inputField.value = artist.name; // Set the input field value to the artist name
                dropdown.style.display = 'none'; // Hide the dropdown
            });
            dropdown.appendChild(option);
        });

        dropdown.style.display = 'block';
    });

    inputField.addEventListener('change', function() {
        var options = Array.from(dropdown.children).map(option => option.textContent);
        if (!options.includes(inputField.value)) {
            inputField.value = '';
        }
    });
}

function updateTries(x) {
    var triesElement = document.getElementById('tries');
    if (triesElement) {
        triesElement.textContent = `Tries: ${x}/10`;
    } else {
        console.error('Element with id "tries" not found');
    }
}

let counter = 1;

function guessArtist() {
    var inputField = document.getElementById('guess-input');
    var guessedArtistName = inputField.value;

    var artist = artists.find(artist => artist.name.toLowerCase() === guessedArtistName.toLowerCase());

    if (artist) {
        var genreBox = document.getElementById('genre');
        var popularityBox = document.getElementById('popularity');
        var firstAlbumBox = document.getElementById('firstAlbum');
    
        genreBox.innerHTML = artist.genre;
        popularityBox.innerHTML = artist.popularity;
        firstAlbumBox.innerHTML = artist.firstAlbum;
        document.getElementById('relatedArtist').innerHTML = artist.related;
    
        var bigBoxImage = document.querySelector('#big-box img');
        if (bigBoxImage) {
            bigBoxImage.src = artist.image.url;
        }
    
        // Compare genres
        if (artist.genre === randomArtist.genre) {
            genreBox.style.backgroundColor = 'green';
        } else {
            genreBox.style.backgroundColor = 'red';
        }

        // Compare popularity
        if (artist.popularity === randomArtist.popularity) {
            popularityBox.style.backgroundColor = 'green';
        } else if (Math.abs(artist.popularity - randomArtist.popularity) <= 10) {
            popularityBox.style.backgroundColor = 'orange';
        } else {
            popularityBox.style.backgroundColor = 'red';
        }
        // Add arrow for popularity
        if (artist.popularity > randomArtist.popularity) {
            popularityBox.innerHTML += ' ↓';
        } else if (artist.popularity < randomArtist.popularity) {
            popularityBox.innerHTML += ' ↑';
        }

        // Compare firstAlbum
        if (artist.firstAlbum === randomArtist.firstAlbum) {
            firstAlbumBox.style.backgroundColor = 'green';
        } else if (Math.abs(artist.firstAlbum - randomArtist.firstAlbum) <= 4) {
            firstAlbumBox.style.backgroundColor = 'orange';
        } else {
            firstAlbumBox.style.backgroundColor = 'red';
        }
        // Add arrow for firstAlbum
        if (artist.firstAlbum > randomArtist.firstAlbum) {
            firstAlbumBox.innerHTML += ' ↓';
        } else if (artist.firstAlbum < randomArtist.firstAlbum) {
            firstAlbumBox.innerHTML += ' ↑';
        }
    
        if (artist.name === randomArtist.name &&
            artist.genre === randomArtist.genre &&
            artist.popularity === randomArtist.popularity &&
            artist.firstAlbum === randomArtist.firstAlbum &&
            artist.related === randomArtist.related &&
            artist.image.url === randomArtist.image.url) {
            alert('You guessed the artist');
        }
    
    } else {
        alert('Artist not found');
    }

    if (counter <= 10) {
        updateTries(counter);
        counter++;
    } else {
        alert('You have reached the maximum number of tries');
        counter=1;
        getRandomArtist();
        updateTries(0);
    }
}