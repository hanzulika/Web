const NEW_ALBUMS = "https://api.spotify.com/v1/browse/new-releases?limit=50";
const BEST_PLAYLISTS = "https://api.spotify.com/v1/users/o6qdc6hp5871x29s9y2hfwamw/playlists";

function loadNewAlbums() {
    return fetch('./extra/homepage.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('homepage').innerHTML = data;
        })
        .catch(error => {
            console.error(error);
        });
}

function addNav() {
    fetch('./extra/navbar.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('navbar').innerHTML = data;
        })
        .catch(error => {
            console.error(error);
        });
}

function callApi1(method, url, body, callback) {
    const access_token = localStorage.getItem("access_token");
    let xhr = new XMLHttpRequest();

    xhr.open(method, url, true);
    xhr.setRequestHeader('Authorization', 'Bearer ' + access_token);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                try {
                    const responseText = xhr.responseText;
                    if (responseText) {
                        const responseJson = JSON.parse(responseText);
                        callback(responseJson);
                    } else {
                        console.warn("Empty response received.");
                        callback(null); // or handle empty response case as needed
                    }
                } catch (e) {
                    console.error("Error parsing JSON response:", e);
                    console.error("Response text:", xhr.responseText);
                    alert("Error parsing response from server.");
                }
            } else {
                console.error(xhr.responseText);
                if (xhr.status === 429) {
                    setTimeout(function() {
                        location.reload();
                    }, 4000);
                } else {
                    let errorMessage = `Error ${xhr.status}: ${xhr.statusText}`;
                    alert(errorMessage);
                }
            }
        }
    };
    xhr.send(JSON.stringify(body));
}

function onHomePageLoad() {
    addNav();
    document.getElementById('loadingInfo').style.display = 'block';
    document.getElementById('homepage').style.display = 'none'; // Hide the 'homepage' element

    if (localStorage.getItem("access_token")) {
        Promise.all([loadNewAlbums(), newAlbumSearch(), bestPlaylistSearch()])
        .then(() => {
            setTimeout(() => {
                document.getElementById('loadingInfo').style.display = 'none';
                document.getElementById('homepage').style.display = 'block'; // Show the 'homepage' element
            }, 2000); // Delay of 2 seconds
        })
        .catch((error) => {
            console.error(error.message || error);
        });
    } else {
        window.location.href = "./html/account.html";
        alert("You need to log in first!");
    }
}

function newAlbumSearch() {
    callApi1("GET", NEW_ALBUMS, null, handleNewAlbumsResponse);
}

function bestPlaylistSearch() {
    callApi1("GET", BEST_PLAYLISTS, null, handleBestPlaylistsResponse);
}

function handleBestPlaylistsResponse(data) {
    if (data && data.items) {
        data.items.forEach(item => {
            if (item.owner.id === "o6qdc6hp5871x29s9y2hfwamw") {
                addToPage(item.name, item.images[0].url, item.external_urls.spotify, "best-playlists");
            }
        });
    } else {
        console.error('Invalid data received:', data);
        alert('Failed to load playlists');
    }
}

function handleNewAlbumsResponse(data) {
    if (data && data.albums && data.albums.items) {
        data.albums.items.forEach(item => {
            let excludeArtist = item.artists.some(artist => artist.id === "06HL4z0CvFAxyc27GXpf02");
            if (!excludeArtist) {
                let imgUrl = item.images && item.images.length > 0 ? item.images[0].url : "./extra/smile.jpg";
                addToPage(item.name, imgUrl, item.external_urls.spotify, "new-albums");
            }
        });
    } else {
        console.error('Invalid data received:', data);
        alert('Failed to load new albums');
    }
}

function playlistFollowed(playlistId) {
    const followEndpoint = `https://api.spotify.com/v1/playlists/${playlistId}/followers/contains`;

    return new Promise((resolve, reject) => {
        callApi1("GET", followEndpoint, null, function (response) {
            const isFollowing = response && response[0];
            resolve(isFollowing);
        });
    });
}

function albumFollowed(albumId) {
    const followEndpoint = `https://api.spotify.com/v1/me/albums/contains?ids=${albumId}`;

    return new Promise((resolve, reject) => {
        callApi1("GET", followEndpoint, null, function (response) {
            const isFollowing = response && response[0];
            resolve(isFollowing);
        });
    });
}

function followAlbum(albumId) {
    const followEndpoint = `https://api.spotify.com/v1/me/albums?ids=${albumId}`;
    return handleFollowResponse(followEndpoint, "Album followed");
}

function followPlaylist(playlistId) {
    const followEndpoint = `https://api.spotify.com/v1/playlists/${playlistId}/followers`;
    return handleFollowResponse(followEndpoint, "Playlist followed");
}

function unfollowPlaylist(playlistId) {
    const unfollowEndpoint = `https://api.spotify.com/v1/playlists/${playlistId}/followers`;
    return handleFollowResponse(unfollowEndpoint, "Playlist unfollowed", "DELETE");
}

function unfollowAlbum(albumId) {
    const unfollowEndpoint = `https://api.spotify.com/v1/me/albums?ids=${albumId}`;
    return handleFollowResponse(unfollowEndpoint, "Album unfollowed", "DELETE");
}

function handleFollowResponse(endpoint, action, method = "PUT") {
    return new Promise((resolve, reject) => {
        callApi1(method, endpoint, null, function (response) {
            resolve(alert(action + " successfully."));
        });
    });
}

async function followOrUnfollow(link) {
    let action = "";

    const itemId = link.split('/').pop();

    if (link.includes("playlist")) {
        try {
            const isFollowing = await playlistFollowed(itemId);
            if (isFollowing) {
                await unfollowPlaylist(itemId);
                action = "Follow";
            } else {
                await followPlaylist(itemId);
                action = "Unfollow";
            }
        } catch (error) {
            console.error(error);
        }
    } else if (link.includes("album")) {
        try {
            const isFollowing = await albumFollowed(itemId);
            if (isFollowing) {
                await unfollowAlbum(itemId);
                action = "Follow";
            } else {
                await followAlbum(itemId);
                action = "Unfollow";
            }
        } catch (error) {
            console.error(error);
        }
    }

    return action;
}

async function addToPage(name, img, link, ID) {
    let node = document.createElement("div");
    node.className = "item";

    let aNode = document.createElement("a");
    aNode.href = link;
    aNode.className = "album-link";
    aNode.target = "_blank";

    let imgNode = document.createElement("img");
    imgNode.src = img;
    imgNode.width = 200;
    imgNode.height = 200;
    imgNode.alt = name;
    aNode.appendChild(imgNode);

    let textNode = document.createElement("p");
    textNode.className = "album-name";
    textNode.innerHTML = name;
    aNode.appendChild(textNode);

    let addNode = document.createElement("button");
    const itemId = link.split('/').pop();

    if (link.includes("playlist")) {
        const isFollowing = await playlistFollowed(itemId);
        addNode.innerHTML = isFollowing ? "Unfollow" : "Follow";
    } else if (link.includes("album")) {
        const isFollowing = await albumFollowed(itemId);
        addNode.innerHTML = isFollowing ? "Unfollow" : "Follow";
    }

    addNode.onclick = async function () {
        addNode.innerText = "Loading...";

        const result = await followOrUnfollow(link);
        console.log("Result:", result);

        addNode.innerText = result;
    };

    node.appendChild(aNode);
    node.appendChild(addNode);

    document.getElementById(ID).appendChild(node);
}

// Make sure to call `onHomePageLoad` when the home page loads
window.onload = onHomePageLoad;
