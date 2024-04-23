import { Post } from "./Post.js";
import { HtmlLoader } from "./pageLoader.js";
import { PostFetcher } from "./postFetcher.js";

let loader = new HtmlLoader;
loader.loadHtml("./components/menu.html", "menuContent")
// loader.loadHtml("./components/test.html","a")

let postFetcher = new PostFetcher
postFetcher.fetchPosts();
