import { HtmlLoader } from "./pageLoader.js";
import { PostFetcher } from "./postFetcher.js";

let loader = new HtmlLoader;
loader.loadHtml("./components/menu.html", "menuContent")

let urlSearch = new URLSearchParams(window.location.search)
// console.log(urlSearch);


let id = urlSearch.get("post_id")
console.log(id);

if(!id){
    window.location= "./index.html"
}

let postFetcher = new PostFetcher
postFetcher.fetchPost(id)