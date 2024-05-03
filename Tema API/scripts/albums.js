const ALBUMS = "https://api.spotify.com/v1/me/albums?limit=50";
const ARTISTS = "https://api.spotify.com/v1/me/following?type=artist&limit=50";
const PLAYLISTS = "https://api.spotify.com/v1/me/playlists?limit=50";

let afterID = null;
let offset = 0;

var access_token = localStorage.getItem("access_token");

function clearParams() {
    offset = 0;
    url = null;
    afterID = null;
}

function callApi(method, url, body, callback) {
    let xhr = new XMLHttpRequest();
    xhr.open(method, url, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.setRequestHeader("Authorization", "Bearer " + access_token);
    xhr.send(body);
    xhr.onload = callback;
}

function loadAlbumPage() {
    return new Promise((resolve, reject) => {
        fetch('../extra/getAlbums.html')
            .then(response => response.text())
            .then(data => {
                document.getElementById('followed').innerHTML = data;
                resolve();
            })
            .catch(error => {
                reject(error);
            });
    });
}

function onPageLoad() {
    clearParams();
    if (localStorage.getItem("access_token")) {
        loadAlbumPage().then(() => {
            //albumSearch();
            artistSearch();
        }).catch((error) => {
            console.error(error);
        });
    }
    else {
        alert("You need to log in first!");
    }
}

function albumSearch() {
    callApi("GET", ALBUMS, null, handleAlbumsResponse);
}

function playlistSearch() {
    let url = PLAYLISTS;
    if (offset > 0) {
        url += `&offset=${offset}`;
    }
    callApi("GET", url, null, handlePlaylistsResponse);
}

function artistSearch() {
    let url = ARTISTS;
    if (afterID !== null) {
        url += `&after=${afterID}`;
    }
    callApi("GET", url, null, handleArtistsResponse);
}

function handleAlbumsResponse() {
    console.log(this.responseText);
    if (this.status == 200) {
        var data = JSON.parse(this.responseText);
        console.log(data);
        if (offset === 0) {
            removeAllItems("followedList");
        }
        data.items.forEach(item => {
            let imgUrl = item.album.images && item.album.images.length > 0 ? item.album.images[0].url : "../extra/smile.jpg";
            addAlbum(item.album.name, imgUrl, item.album.external_urls.spotify);
        });
        if (data.total > offset + 49) {
            offset += 50;
            console.log(offset)
            playlistSearch();
        }
    }
    else if (this.status == 401) {
        refreshAccessToken();
    }
    else {
        console.log(this.responseText);
        alert(this.responseText);
    }
}

function handlePlaylistsResponse() {
    console.log(this.responseText);
    if (this.status == 200) {
        var data = JSON.parse(this.responseText);
        console.log(data);
        if (offset === 0) {
            removeAllItems("followedList");
        }
        data.items.forEach(item => {
            let imgUrl = item.images && item.images.length > 0 ? item.images[0].url : "../extra/smile.jpg";
            addAlbum(item.name, imgUrl, item.external_urls.spotify);
        });
        if (data.total > offset + 49) {
            offset += 50;
            console.log(offset)
            playlistSearch();
        }
    }
    else if (this.status == 401) {
        refreshAccessToken();
    }
    else {
        console.log(this.responseText);
        alert(this.responseText);
    }
}

function handleArtistsResponse() {
    console.log(this.responseText);
    if (this.status == 200) {
        var data = JSON.parse(this.responseText);
        console.log(data);
        if (afterID === null) {
            removeAllItems("followedList");
        }
        data.artists.items.forEach(item => {
            let imgUrl = item.images && item.images.length > 0 ? item.images[0].url : "../extra/smile.jpg";
            addAlbum(item.name, imgUrl, item.external_urls.spotify);
        });
        if (data.artists.total > offset + 49) {
            offset += 49;
            afterID = data.artists.cursors.after;
            artistSearch();
        }
    } else if (this.status == 401) {
        refreshAccessToken();
    } else {
        console.log(this.responseText);
        alert(this.responseText);
    }
}




function addAlbum(albumName, imgUrl, albumLink) {
    var container = document.createElement("div");
    container.classList.add("album-container");

    var link = document.createElement("a");
    link.href = albumLink;
    link.classList.add("album-link");
    link.target = "_blank";


    var img = document.createElement("img");
    img.src = imgUrl;
    img.alt = "Album cover";
    img.width = 100;
    img.height = 100;
    img.classList.add("album-cover");
    link.appendChild(img);

    var name = document.createElement("span");
    name.innerHTML = albumName;
    name.classList.add("album-name");
    link.appendChild(name);

    container.appendChild(link);

    if (!albumLink.includes("playlist")) {
        var deleteBtn = document.createElement("button");
        deleteBtn.innerHTML = "Delete";
        deleteBtn.onclick = function () {
            deleteItem(albumLink);
        };
        container.appendChild(deleteBtn);
    }

    document.getElementById("followedList").appendChild(container);
}

function deleteItem(albumLink) {
    let deleteEndpoint;

    if (albumLink.includes("album")) {
        deleteEndpoint = "https://api.spotify.com/v1/me/albums?ids=";
    } else if (albumLink.includes("artist")) {
        deleteEndpoint = "https://api.spotify.com/v1/me/following?type=artist&ids=";
    } else {
        // Handle other cases or display an error message
        console.error("Invalid album link");
        return;
    }

    // Extract the ID from the album link
    const id = albumLink.split("/").pop();

    // Construct the complete delete URL
    deleteEndpoint += id;

    // Make the delete request
    callApi("DELETE", deleteEndpoint, null, handleDeleteResponse);
}

function handleDeleteResponse() {
    console.log(this.responseText);
    if (this.status == 200) {
        alert("Item removed!");
        onPageLoad();
    } else if (this.status == 401) {
        refreshAccessToken();
    } else {
        console.log(this.responseText);
        alert(this.responseText);
    }
}


function removeAllItems(elementId) {
    let node = document.getElementById(elementId);
    while (node.firstChild) {
        node.removeChild(node.firstChild);
    }
}