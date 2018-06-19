(function () {
    window.Ping = (url, userCallback) => {

        let favicon = "/favicon.ico";

        let img = new Image();
        let start = new Date();

        function pingCheck(event) {
            let end = new Date();
            let duration = end - start;
            if (event.type == "error") {
                userCallback.onFailure();
            } else {
                userCallback.onSuccess();
            }
        }

        img.onload = pingCheck;
        img.onerror = pingCheck;

        img.src = url + favicon + "?" + (+new Date());
    }
})();



// window.onload = () => {
//     window.Ping("http://www.google.com", {
//         onSuccess: () => {
//             console.log("success");
//         },
//         onFaliure: () => {
//             console.log("fail");
//         }
//     });
// }
