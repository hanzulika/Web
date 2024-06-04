FOLLOWED_ARTISTS = 'https://api.spotify.com/v1/me/following?type=artist&limit=50';

function onPageLoad() {
    onLoad();
    if (localStorage.getItem("access_token")) {
        loadProfilePage();
        console.log('Profile page loaded');
        loadArtists();
        console.log('Artists loaded');
        //getRandomArtist();
        console.log('Random artist selected');
        //updateTries(0);
    }
}

function loadProfilePage() {
    fetch('../extra/guesser.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('container').innerHTML = data;
        })
        .then(() => {
            addEventListeners('guess-input','dropdown', artists);
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

let delay = 0; // Start with no delay

function loadFirstAlbum(artist, callback) {
    // Increase the delay by 100 ms for each artist
    delay += 100;
    setTimeout(() => {
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
            callback();
        });
    }, delay);
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


let selectedArtist = null;

function getRandomArtist() {
    // Check if artists array is not empty
    if (artists.length > 0) {
        // Generate a random index
        let randomIndex = Math.floor(Math.random() * artists.length);
        // Store the artist at the random index
        selectedArtist = artists[randomIndex];
        console.log(selectedArtist);
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
        triesElement.textContent = `${x}/10`;
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
        document.getElementById('genre').innerHTML = '<p>Genre</p>' + artist.genre;
        document.getElementById('popularity').innerHTML = '<p>Popularity</p>' + artist.popularity;
        document.getElementById('firstAlbum').innerHTML = '<p>First Album</p>' + artist.firstAlbum;
        document.getElementById('relatedArtist').innerHTML = '<p>Related Artist</p>' + artist.related;
        var bigBoxImage = document.querySelector('#big-box img');
        if (bigBoxImage) {
            bigBoxImage.src = artist.image.url;
        }

        if (artist.name === selectedArtist.name &&
            artist.genre === selectedArtist.genre &&
            artist.popularity === selectedArtist.popularity &&
            artist.firstAlbum === selectedArtist.firstAlbum &&
            artist.related === selectedArtist.related &&
            artist.image.url === selectedArtist.image.url) {
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
    }
}


