const ALBUMS="https://api.spotify.com/v1/me/albums?limit=50";

var access_token = localStorage.getItem("access_token");

function callApi(method, url, body, callback){
    let xhr = new XMLHttpRequest();
    xhr.open(method, url, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.setRequestHeader("Authorization", "Bearer " + access_token);
    xhr.send(body);
    xhr.onload = callback;
}

function loadDynamicPage(){
    return new Promise((resolve, reject) => {
    fetch('../extra/getAlbums.html')
    .then(response => response.text())
    .then(data => {
        document.getElementById('dynamicContainer').innerHTML = data;
        resolve();
    })
    .catch(error => {
        reject(error);
    });
});
}

function onPageLoad(){
    if(localStorage.getItem("access_token")){
        loadDynamicPage().then(() => {
            callApi("GET", ALBUMS, null, handleAlbumsResponse);
        }).catch((error) => {
            console.error(error);
        });
    }
    else{
        alert("You need to log in first!");
    }
}

function handleAlbumsResponse(){
    console.log(this.responseText);
    if(this.status==200){
        var data=JSON.parse(this.responseText);
        console.log(data);
        removeAllItems("albums");
        data.items.forEach(item => {
            addAlbum(item.album.name,item.album.images[0].url,item.album.external_urls.spotify);
        });
    }
    else if(this.status==401){
        refreshAccessToken();
    }
    else{
        console.log(this.responseText);
        alert(this.responseText);
    }
}

function handleDeleteAlbumResponse(){
    console.log(this.responseText);
    if(this.status==200){
        onPageLoad();
    }
    else if(this.status==401){
        refreshAccessToken();
    }
    else{
        console.log(this.responseText);
        alert(this.responseText);
    }
}

function addAlbum(albumName, imgUrl, albumLink) {
    var container = document.createElement("div");
    container.classList.add("album-container");

    var link = document.createElement("a");
    link.href = albumLink;
    link.target = "_blank";

    var img = document.createElement("img");
    img.src = imgUrl;
    img.alt = "Album cover";
    img.width=100;
    img.classList.add("album-cover");
    link.appendChild(img);

    var name = document.createElement("span");
    name.innerHTML = albumName;
    name.classList.add("album-name");
    link.appendChild(name);

    container.appendChild(link);

    var deleteBtn = document.createElement("button");
    deleteBtn.innerHTML = "Delete";
    deleteBtn.onclick = function() {
        callApi("DELETE", "https://api.spotify.com/v1/me/albums?ids=" + albumLink.split("/")[4], null, handleDeleteAlbumResponse);
    }

    container.appendChild(deleteBtn);

    document.getElementById("albums").appendChild(container);
}


function removeAllItems(elementId) {
    let node = document.getElementById(elementId);
    while (node.firstChild) {
        node.removeChild(node.firstChild);
    }
}