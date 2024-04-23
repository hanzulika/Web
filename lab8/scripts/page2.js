import { Post } from "./Post.js";
import { HtmlLoader } from "./pageLoader.js";
import { PostFetcher } from "./postFetcher.js";

let loader = new HtmlLoader;
loader.loadHtml("./components/menu.html", "menuContent")

let favoritesPosts = JSON.parse(localStorage.getItem("postCollection")) || []

let output = document.getElementById("content")
if(favoritesPosts.length > 0){
    console.log(favoritesPosts);
    let postFetcher = new PostFetcher
    postFetcher.displayPosts(favoritesPosts, false)
}
else{
    let noPosts = document.createElement("p");
    noPosts.innerText = "No favorites posts at the moment";
    output.appendChild(noPosts)
}