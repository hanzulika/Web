export class HtmlLoader {
    loadHtml(fetchFrom, whereToLoad) {
        let xhr = new XMLHttpRequest()
        xhr.open("GET", fetchFrom, true)
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4 && xhr.status == 200) {
                // console.log(xhr.responseText)
                document.getElementById(whereToLoad).innerHTML = xhr.responseText
            }
            // if(xhr.readyState == 4 ){
            //     // aici avem un raspuns
            //     if(xhr.status== 200)
            //     {
            //         // serveru a raspuns cu succes si avem datele

            //     }

            // }
            // xhr.readyState
            // 0-5 ->
            // 0 = initializsa
            //  1 = in pregatire
            //  2 trimisa 
            //  3 ???
            // 4 executata cu raspunse
            // 5 canceled | eroare
            // xhr.status

        }
        xhr.send()
        // sync si async
        // sync -> operatii care se executa una dupa alta
        // async -> operatii care se executa in paralel
    }
}