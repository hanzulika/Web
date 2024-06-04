var redirect_uri="https://spotify-guesser-1ab78.web.app/";

var client_id ="91d81366c47b41f9ae1319609aebd3f0";
var client_seccret ="5fe6af063fda42c3b0f85ca1132994cd";

const AUTHORIZE = "https://accounts.spotify.com/authorize";
const TOKEN= "https://accounts.spotify.com/api/token";

function logout(){
    localStorage.clear();
    window.location.href = "https://spotify-guesser-1ab78.web.app/";
}

function onLoad(){
    addNavbar();
    if(window.location.search.length > 0){
        handleRedirect();
    }
}

function addNavbar(){
    fetch('../extra/navbar.html')
    .then(response => response.text())
    .then(data => {
        document.getElementById('navbar').innerHTML = data;
    }
    )
    .catch(error => {
        console.error(error);
    });
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
            loadProfilePage();
        }
        if(data.refresh_token!=undefined){
            refresh_token=data.refresh_token;
            localStorage.setItem("refresh_token", refresh_token);
        }
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
    let url = AUTHORIZE;
    url += "?client_id=" + client_id;
    url += "&response_type=code";
    url += "&redirect_uri=" + encodeURIComponent(redirect_uri);
    url += "&show_dialog=true";
    url += "&scope=" + encodeURIComponent("user-read-private user-read-email user-read-playback-state user-modify-playback-state user-read-playback-position user-library-read user-library-modify user-top-read user-follow-read user-follow-modify playlist-read-private playlist-read-collaborative playlist-modify-public playlist-modify-private user-read-recently-played user-read-currently-playing app-remote-control streaming");
    window.location.href = url;
}

function addText(name, id,newElement){
    var node=document.createElement(newElement);
    node.innerHTML=name;
    document.getElementById(id).appendChild(node);
}

function showImage(src, id){
    var img = document.createElement("img");
    img.src = src;
    document.getElementById(id).appendChild(img);
}

let retryIn = 1000; // Start with waiting 1 second

function callApi(method, url, body, callback) {
    let xhr = new XMLHttpRequest();
    xhr.open(method, url, true);
    xhr.setRequestHeader('Authorization', 'Bearer ' + access_token);
    xhr.send(body);

    xhr.onload = function() {
        if (xhr.status === 429) {
            // If status is 429, retry after the current wait time
            setTimeout(() => callApi(method, url, body, callback), retryIn);
            // Double the wait time for the next potential retry
            retryIn *= 2;
        } else if (xhr.status >= 200 && xhr.status < 300) {
            // If status is between 200 and 299, process the response
            let data = JSON.parse(xhr.responseText);
            callback(data);
            // Reset the wait time
            retryIn = 1000;
        } else {
            // If status is something else, log an error
            console.error(xhr);
        }
    };
}

function removeAllItems(elementId) {
    let node = document.getElementById(elementId);
    while (node.firstChild) {
        node.removeChild(node.firstChild);
    }
}

