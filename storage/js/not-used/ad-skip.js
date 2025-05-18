const button = document.createElement("button");
button.innerText = "Skip Ad";
button.style.position = "fixed";
button.style.bottom = "20px";
button.style.right = "20px";
button.style.padding = "10px 20px";
button.style.background = "#808080";
button.style.color = "#fff";
button.style.border = "none";
button.style.borderRadius = "8px";
button.style.cursor = "pointer";
button.style.fontSize = "16px";
button.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)";
button.style.zIndex = "9999";
button.style.transition = "background 0.3s";

button.onmouseover = () => button.style.background = "#2F2F2F";
button.onmouseout = () => button.style.background = "#808080";

button.onclick = () => {
    if (document.getElementsByClassName("video-ads")[0].innerHTML !== "") {
        var banner = false;
        for (var i = 0; i < document.getElementsByClassName("ytp-ad-overlay-close-button").length; i++) {
            document.getElementsByClassName("ytp-ad-overlay-close-button")[i].click();
            banner = true;
        }
        if (banner === false) {
            document.getElementsByClassName("html5-main-video")[0].currentTime = document.getElementsByClassName("html5-main-video")[0].duration;
            document.getElementsByClassName("ytp-ad-skip-button")[0].click();
        }
    }
};

document.body.appendChild(button);
