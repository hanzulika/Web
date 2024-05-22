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
    fetch('../extra/userSearched.html')
    .then(response => response.text())
    .then(data => {
        document.getElementById('friends').innerHTML = data;
        resolve();
    })
    .catch(error => {
        reject(error);
    });
});
}

function search(){
    if(localStorage.getItem("access_token")){
        loadDynamicPage().then(() => {; 
        callApi("GET", "https://api.spotify.com/v1/users/" + document.getElementById("search").value, null, handleSearchResponse);
        }).catch((error) => {
            console.error(error);
        });
    }  
    else{
        window.location.href="../html/page1.html";
        alert("You need to log in first!");
    }
}

function handleSearchResponse(){
    console.log(this.responseText);
    if(this.status==200){
        var data=JSON.parse(this.responseText);
        console.log(data);
        // removeAllItems("pfpimg");
        // removeAllItems("name");
        // removeAllItems("followers");
        // removeAllItems("uri");
        showImage(data.images[0].url, "pfpimg"); 
        addText(data.display_name, "name", "h1");
        addText(data.followers.total, "followers", "p");
        addLink(data.id,"LINK LA CONT", "external_url");
        addText(data.uri, "uri", "p");
    }
    else if(this.status==401){
        console.log(this.responseText);
    }
    else{
        console.log(this.responseText);
        alert(this.responseText);
    }
}

function addLink(userID, text, id) {
    var href = "https://open.spotify.com/user/" + userID;
    var link = document.createElement("a");
    link.href = href;
    link.textContent = text;
    document.getElementById(id).appendChild(link);
}

function showImage(src, id){
    var img = document.createElement("img");
    img.src = src;
    document.getElementById(id).appendChild(img);
}

function addText(name, id,newElement){
    var node=document.createElement(newElement);
    node.innerHTML=name;
    document.getElementById(id).appendChild(node);
}

function removeAllItems(elementId) {
    let node = document.getElementById(elementId);
    while (node.firstChild) {
        node.removeChild(node.firstChild);
    }
}