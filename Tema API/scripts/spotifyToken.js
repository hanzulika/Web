var redirect_uri="http://127.0.0.1:5500/Tema%20API/html/page1.html";

var client_id ="";
var client_seccret ="";

const AUTHORIZE = "https://accounts.spotify.com/authorize";
const TOKEN= "https://accounts.spotify.com/api/token";
const DEVICES = "https://api.spotify.com/v1/me/player/devices";
const PFPIMG = "https://api.spotify.com/v1/me";
const TOPARTISTS="https://api.spotify.com/v1/me/top/artists?limit=10";
const TOPTRACKS="https://api.spotify.com/v1/me/top/tracks?limit=10";

function onPageLoad(){
    client_id = localStorage.getItem("client_id");
    client_seccret = localStorage.getItem("client_secret");

    if(window.location.search.length > 0){
        handleRedirect();
    }
    if (localStorage.getItem("access_token")) {
        getInfo();
        refreshDevices();
        getTopArtists();
        getTopTracks();
    }
}
var access_token = localStorage.getItem("access_token");
function handleRedirect(){
    let code = getCode();
    fetchAccessToken(code);
    window.history.pushState("", "", redirect_uri);
}

function fetchAccessToken(code){
    let body = "grant_type=authorization_code";
    body += "&code=" + code;
    body += "&redirect_uri=" + encodeURI(redirect_uri);
    body += "&client_id=" + client_id;
    body += "&client_secret=" + client_seccret;
    callAuthorizationApi(body);
}

function callAuthorizationApi(body){
    let xhr = new XMLHttpRequest();
    xhr.open("POST", TOKEN, true);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.setRequestHeader("Authorization", "Basic " + btoa(client_id + ":" + client_seccret));
    xhr.send(body);
    xhr.onload = handleAuthorizationResponse;
}

function refreshAccessToken(){
    refresh_token = localStorage.getItem("refresh_token");
    let body = "grant_type=refresh_token";
    body += "&refresh_token=" + refresh_token;
    body += "&client_id=" + client_id;
    callAuthorizationApi(body);
}

function handleAuthorizationResponse(){
    if(this.status==200){
        var data=JSON.parse(this.responseText);
        console.log(data);
        var data=JSON.parse(this.responseText);
        if(data.access_token!=undefined){
            access_token=data.access_token;
            localStorage.setItem("access_token", access_token);
        }
        if(data.refresh_token!=undefined){
            refresh_token=data.refresh_token;
            localStorage.setItem("refresh_token", refresh_token);
        }
        onPageLoad();
    }
    else{
        console.log(this.responseText);
        alert(this.responseText);
    }
}

function getCode(){
    let code = null;
    const queryString = window.location.search;
    if(queryString.length > 0){
        const urlParams = new URLSearchParams(queryString);
        code = urlParams.get("code");
    }
    return code;
}

function requestAuthorization(){
    client_id = document.getElementById("client_id").value;
    client_seccret = document.getElementById("client_secret").value;
    localStorage.setItem("client_id", client_id);
    localStorage.setItem("client_secret", client_seccret);

    let url = AUTHORIZE;
    url += "?client_id=" + client_id;
    url += "&response_type=code";
    url += "&redirect_uri=" + encodeURI(redirect_uri);
    url += "&show_dialog=true";
    url += "&scope=user-read-private user-read-email user-read-playback-state user-modify-playback-state user-read-playback-position user-library-read user-top-read";
    window.location.href = url;
}

function refreshDevices(){
    callApi("GET", DEVICES, null, handleDevicesResponse);
}

function getInfo(){
    callApi("GET", PFPIMG, null, handleInfoResponse);
}

function getTopArtists(){
    callApi("GET", TOPARTISTS, null, handleTopArtistResponse);
}

function getTopTracks(){
    callApi("GET", TOPTRACKS, null, handleTopTracksResponse);
}

function handleTopArtistResponse(){
    console.log(this.responseText);
    if(this.status==200){
        var data=JSON.parse(this.responseText);
        console.log(data);
        removeAllItems("topartists");
        data.items.forEach(item => addArtist(item));
    }
    else if(this.status==401){
        refreshAccessToken();
    }
    else{
        console.log(this.responseText);
        alert(this.responseText);
    }
}

function handleTopTracksResponse(){
    console.log(this.responseText);
    if(this.status==200){
        var data=JSON.parse(this.responseText);
        console.log(data);
        removeAllItems("toptracks");
        data.items.forEach(item => addTrack(item));
    }
    else if(this.status==401){
        refreshAccessToken();
    }
    else{
        console.log(this.responseText);
        alert(this.responseText);
    }
}

function addTrack(item){
    var node = document.createElement("li");
    node.innerHTML = item.name;
    document.getElementById("toptracks").appendChild(node);
}

function addArtist(item){
    var node = document.createElement("li");
    node.innerHTML = item.name;
    document.getElementById("topartists").appendChild(node);
}

function handleInfoResponse(){
    console.log(this.responseText);
    if(this.status==200){
        var data=JSON.parse(this.responseText);
        console.log(data);
        showImage(data.images[0].url, "pfpimg");
        showText(data.display_name, "name","h1");
        showText(data.email, "email","p");
        showText(data.country, "country","p");
        showText(data.followers.total, "followers","h2")
        showText(data.product, "product","h2")
        showText(data.type, "type","h3")
    }
    else if(this.status==401){
        refreshAccessToken();
    }
    else{
        console.log(this.responseText);
        alert(this.responseText);
    }
}

function showText(name, id,newElement){
    var node=document.createElement(newElement);
    node.innerHTML=name;
    document.getElementById(id).appendChild(node);
}

function showImage(src, id){
    var img = document.createElement("img");
    img.src = src;
    document.getElementById(id).appendChild(img);
}

function handleDevicesResponse(){
    console.log(this.responseText);
    if(this.status==200){
        var data=JSON.parse(this.responseText);
        console.log(data);
        removeAllItems("devices");
        data.devices.forEach(item => addDevice(item));
    }
    else if(this.status==401){
        refreshAccessToken();
    }
    else{
        console.log(this.responseText);
        alert(this.responseText);
    }
}

function addDevice(item){
    let node=document.createElement("option");
    node.value=item.id;
    node.innerHTML=item.name;
    document.getElementById("devices").appendChild(node);
}

function callApi(method, url, body, callback){
    let xhr = new XMLHttpRequest();
    xhr.open(method, url, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.setRequestHeader("Authorization", "Bearer " + access_token);
    xhr.send(body);
    xhr.onload = callback;
}

function removeAllItems(elementId) {
    let node = document.getElementById(elementId);
    while (node.firstChild) {
        node.removeChild(node.firstChild);
    }
}

