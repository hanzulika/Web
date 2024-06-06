const DEVICES = "https://api.spotify.com/v1/me/player/devices";
const PFPIMG = "https://api.spotify.com/v1/me";
const TOPARTISTS = "https://api.spotify.com/v1/me/top/artists?limit=10";
const TOPTRACKS = "https://api.spotify.com/v1/me/top/tracks?limit=10";

function onProfileLoad(){
    onLoad();
    document.getElementById('userInfo').style.display = 'none'; // Hide the 'userInfo' element
    if(window.location.search.length > 0){
        handleRedirect();
    }
    if (localStorage.getItem("access_token")) {
        document.getElementById('loadingInfo').style.display = 'block';
        Promise.all([loadProfilePage(), getInfo(), refreshDevices(), getTopArtists(), getTopTracks()])
        .then(() => {
            setTimeout(() => {
                document.getElementById('loadingInfo').style.display = 'none';
                document.getElementById('userInfo').style.display = 'block'; // Show the 'userInfo' element
            }, 1000); // Delay of 2 seconds
        });
    }
}

function loadProfilePage() {
    return fetch('../extra/profile.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('userInfo').innerHTML = data;
        })
        .catch(error => {
            console.error(error);
        });
}



function refreshDevices() {
    callApi("GET", DEVICES, null, (response) => handleDevicesResponse(response));
}

function getInfo() {
    callApi("GET", PFPIMG, null, (response) => handleInfoResponse(response));
}

function getTopArtists() {
    callApi("GET", TOPARTISTS, null, (response) => handleTopArtistResponse(response));
}

function getTopTracks() {
    callApi("GET", TOPTRACKS, null, (response) => handleTopTracksResponse(response));
}

function handleDevicesResponse(data) {
    console.log(data);
    if (data) {
        removeAllItems("devices");
        data.devices.forEach(item => addDevice(item));
    }
    else {
        console.log(data.responseText);
        alert(data.responseText);
    }
}

function handleTopArtistResponse(data) {
    console.log(data);
    if (data) {
        removeAllItems("topartists");
        data.items.forEach(item => addArtist(item));
    }
    else {
        console.log(data.responseText);
        alert(data.responseText);
    }
}

function handleTopTracksResponse(data) {
    console.log(data);
    if (data) {
        removeAllItems("toptracks");
        data.items.forEach(item => addTrack(item));
    }
    else {
        console.log(data.responseText);
        alert(data.responseText);
    }
}

function handleInfoResponse(data) {
    console.log(data);
    if (data) {
        removeAllItems("pfpimg");
        removeAllItems("name");
        removeAllItems("email");
        removeAllItems("country");
        removeAllItems("followers");
        removeAllItems("product");
        removeAllItems("type");
        showImage(data.images[0].url, "pfpimg");
        addText(data.display_name, "name", "h1");
        addText(data.email, "email", "p");
        addText("Country: "+data.country, "country", "p");
        addText("Followers: "+data.followers.total, "followers", "h2");
        addText("Subscription: "+data.product, "product", "h2");
        addText("Type: "+data.type, "type", "h3");
    }
    else {
        console.log(data.responseText);
        alert(data.responseText);
    }
}

function addText(name, id, newElement) {
    var node = document.createElement(newElement);
    node.innerHTML = name;
    document.getElementById(id).appendChild(node);
}

function showImage(src, id) {
    var img = document.createElement("img");
    img.src = src;
    document.getElementById(id).appendChild(img);
}

function addTrack(item) {
    var node = document.createElement("li");
    node.innerHTML = item.name;
    document.getElementById("toptracks").appendChild(node);
}

function addArtist(item) {
    var node = document.createElement("li");
    node.innerHTML = item.name;
    document.getElementById("topartists").appendChild(node);
}

function addDevice(item) {
    let node = document.createElement("option");
    node.value = item.id;
    node.innerHTML = item.name;
    document.getElementById("devices").appendChild(node);
}

function removeAllItems(elementId) {
    let node = document.getElementById(elementId);
    while (node.firstChild) {
        node.removeChild(node.firstChild);
    }
}