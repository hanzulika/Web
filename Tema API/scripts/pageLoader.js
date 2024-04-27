export class HtmlLoader {
    loadHtml(fetchFrom, whereToLoad) {
        let xhr = new XMLHttpRequest()
        xhr.open("GET", fetchFrom, true)
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4 && xhr.status == 200) {
                let targetElement = document.querySelector(`.${whereToLoad}`);

                // Check if the element exists
                if (targetElement) {
                    // Set the inner HTML of the element to the fetched HTML content
                    targetElement.innerHTML = xhr.responseText;
                } else {
                    console.error(`Element with class "${whereToLoad}" not found`);
                }
            }
        }
        xhr.send()
    }
}