const NEW_ALBUMS = "https://api.spotify.com/v1/browse/new-releases?limit=50";
const BEST_PLAYLISTS = "https://api.spotify.com/v1/users/o6qdc6hp5871x29s9y2hfwamw/playlists";

function loadNewAlbums() {
    return new Promise((resolve, reject) => {
        fetch('../extra/homepage.html')
            .then(response => response.text())
            .then(data => {
                document.getElementById('homepage').innerHTML = data;
                resolve();
            })
            .catch(error => {
                reject(error);
            });
    });
}

function onHomePageLoad() {
    if (localStorage.getItem("access_token")) {
        access_token = localStorage.getItem("access_token");
        loadNewAlbums().then(() => {
            newAlbumSearch();
            bestPlaylistSearch();
        }).catch((error) => {
            console.error(error);
        });
    }
    else {
        alert("You need to log in first!");
    }
}

function callApi(method, url, body, callback) {
    let xhr = new XMLHttpRequest();
    xhr.open(method, url, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.setRequestHeader("Authorization", "Bearer " + access_token);
    xhr.send(body);
    xhr.onload = callback;
}

function newAlbumSearch() {
    callApi("GET", NEW_ALBUMS, null, handleNewAlbumsResponse);
}

function bestPlaylistSearch() {
    callApi("GET", BEST_PLAYLISTS, null, handleBestPlaylistsResponse);
}

function handleBestPlaylistsResponse() {
    if (this.status == 200) {
        let data = JSON.parse(this.responseText);
        console.log(data.items)
        data.items.forEach(item => {
            if (item.owner.id == "o6qdc6hp5871x29s9y2hfwamw")
                addToPage(item.name, item.images[0].url, item.external_urls.spotify, "best-playlists");
        });
    }
    else if (this.status == 401) {
        alert("You need to log in first!");
    }
    else {
        alert("Error: " + this.status);
    }
}

function handleNewAlbumsResponse() {
    if (this.status == 200) {
        let data = JSON.parse(this.responseText);
        data.albums.items.forEach(item => {
            //fara Taylor Swift
            let excludeArtist = item.artists.some(artist => artist.id === "06HL4z0CvFAxyc27GXpf02");
            if (!excludeArtist) {
                let imgUrl = item.images && item.images.length > 0 ? item.images[0].url : "../extra/smile.jpg";
                addToPage(item.name, imgUrl, item.external_urls.spotify, "new-albums");
            }
        });
    }
    else if (this.status == 401) {
        alert("You need to log in first!");
    }
    else {
        alert("Error: " + this.status);
    }
}

function playlistFollowed(playlistId) {
    const followEndpoint = `https://api.spotify.com/v1/playlists/${playlistId}/followers/contains`;

    return new Promise((resolve, reject) => {
        callApi("GET", followEndpoint, null, function () {
            if (this.status == 200) {
                const isFollowing = JSON.parse(this.responseText)[0];
                resolve(isFollowing);
            } else if (this.status == 401) {
                reject("Unauthorized. Please log in.");
            } else {
                reject("Failed to check playlist following status.");
            }
        });
    });
}

function albumFollowed(albumId) {
    const followEndpoint = `https://api.spotify.com/v1/me/albums/contains?ids=${albumId}`;

    return new Promise((resolve, reject) => {
        callApi("GET", followEndpoint, null, function () {
            if (this.status == 200) {
                const isFollowing = JSON.parse(this.responseText)[0];
                resolve(isFollowing);
            } else if (this.status == 401) {
                reject("Unauthorized. Please log in.");
            } else {
                reject("Failed to check album following status.");
            }
        });
    });
}

function followAlbum(albumId) {
    const followEndpoint = `https://api.spotify.com/v1/me/albums?ids=${albumId}`;
    handleFollowResponse(followEndpoint, "Album followed");
}

function followPlaylist(playlistId) {
    const followEndpoint = `https://api.spotify.com/v1/playlists/${playlistId}/followers`;
    handleFollowResponse(followEndpoint, "Playlist followed");
}

function unfollowPlaylist(playlistId) {
    const unfollowEndpoint = `https://api.spotify.com/v1/playlists/${playlistId}/followers`;
    followUnfollowResponse(unfollowEndpoint, "Playlist unfollowed");
}

function unfollowAlbum(albumId) {
    const unfollowEndpoint = `https://api.spotify.com/v1/me/albums?ids=${albumId}`;
    followUnfollowResponse(unfollowEndpoint, "Album unfollowed");
}

function handleFollowResponse(endpoint, action) {
    return new Promise((resolve, reject) => {
        callApi("PUT", endpoint, null, function () {
            if (this.status == 200) {
                resolve(alert(action + " successfully."));
            } else if (this.status == 401) {
                reject("Unauthorized. Please log in.");
            } else {
                reject("Failed to unfollow album.");
            }
        });
    });
}

function followUnfollowResponse(endpoint, action) {
    return new Promise((resolve, reject) => {
        callApi("DELETE", endpoint, null, function () {
            if (this.status == 200) {
                resolve(alert(action + " successfully."));
            } else if (this.status == 401) {
                reject("Unauthorized. Please log in.");
            } else {
                reject("Failed to unfollow album.");
            }
        });
    });
}

async function followOrUnfollow(link) {
    let action = "";

    const itemId = link.split('/').pop();

    if (link.includes("playlist")) {
        try {
            const result = await playlistFollowed(itemId);
            if (result) {
                action = "Follow";
                await unfollowPlaylist(itemId);
            } else {
                action = "Unfollow";
                await followPlaylist(itemId);
            }
        } catch (error) {
            console.error(error);
        }
    } else if (link.includes("album")) {
        try {
            const result = await albumFollowed(itemId);
            if (result) {
                action = "Follow";
                await unfollowAlbum(itemId);
            } else {
                action = "Unfollow";
                await followAlbum(itemId);
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

    var imgNode = document.createElement("img");
    imgNode.src = img;
    imgNode.width = 200;
    imgNode.height = 200;
    imgNode.alt = name;
    aNode.appendChild(imgNode);

    var textNode = document.createElement("p");
    textNode.innerHTML = name;
    aNode.appendChild(textNode);

    var addNode = document.createElement("button");
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



