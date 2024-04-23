import { Post } from "./Post.js";

export class PostFetcher {

    fetchPosts() {

        let url = "https://jsonplaceholder.typicode.com/posts";

        /**
         * GET --> SA CITEASCCA DATE
         * POST --> SA SCRIE DATE
         * PUT --> SA MODIFICE DATE
         * PATCH --> SA MODIFICE PARTIAL DATE
         * DELETE --> SA STEARGA  DATE
         */
        let options = {
            method: "GET", // ce vrei sa faci
            headers: { // parametri pentru server

            },
            // body: {
            //     // date:2022-10-11
            // } // continutu pe care vrei sa il trimiti
        }

        // fetch e async
        fetch(url, options)
            .then(response => {
                console.log(response);
                if (response.status !== 200) {
                    throw new Error("NETWORK ISSUE");
                }
                return response.json()

            })
            .then(data => {
                // temp = []
                // data.forEach(element => {
                //     const post = new Post(element)
                //     temp.push(post)
                // });
                return data.map(element => {
                    return new Post(element)
                })
            })
            .then(posts => {
                // console.log(posts);
                this.displayPosts(posts)
            })

    }

    fetchPost(id) {
        let url = `https://jsonplaceholder.typicode.com/posts/${id}`;
        let options = {
            method: "GET",
            headers: {
            },
        }

        fetch(url, options)
            .then(response => {
                if (response.status !== 200) {
                    throw new Error("NETWORK ISSUE");
                }
                return response.json()

            })
            .then(data => {
                return new Post(data)
            })
            .then(post => {
                let output = document.getElementById("postContent")
                let postElement = this.displayPost(post, false)
                output.appendChild(postElement);
            })

    }


    displayPosts(posts, hasButtons = true) {
        let output = document.getElementById("content")
        posts.forEach(element => {
            let post = this.displayPost(element, hasButtons)
            output.appendChild(post)
        });
    }

    displayPost(post, hasButtons = true) {
        let article = document.createElement("article")
        article.classList.add("post")

        let title = document.createElement("h2")
        title.classList.add("post-title")
        title.innerText = post.title

        let text = document.createElement("p")
        text.classList.add("post-body")
        text.innerText = post.body

        article.appendChild(title)
        article.appendChild(text)

        if (hasButtons) {

            let openInNewTabButton = document.createElement("button")
            openInNewTabButton.innerText = "Open in a new tab";
            openInNewTabButton.addEventListener("click", function () {
                window.open(`post.html?post_id=${post.id}`);
            })

            let saveToFavorites = document.createElement("button")
            saveToFavorites.addEventListener("click", function () {
                // localStorage --> ne lasa sa scriem date in memoria aplicatie
                let collection = JSON.parse(localStorage.getItem("postCollection")) || [];
                // if(collection == null){
                //     collection = []
                // }

                let element = collection.filter(element => {
                    return element.id == post.id
                });
                if (element.length > 0)
                    return;

                collection.push(post)
                localStorage.setItem("postCollection", JSON.stringify(collection))
                alert("Added to favorites")
            })
            saveToFavorites.innerText = "Save To favorites";

            article.appendChild(openInNewTabButton)
            article.appendChild(saveToFavorites)
        }


        return article
    }
}
