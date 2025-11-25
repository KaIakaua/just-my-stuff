// help
console.log("Script working out!");

document.getElementById("grip").onclick = function() {
    console.log("GOTTA GET A GRIP!")
}

const themeButton = document.getElementById("theme-switch");
const themeIcon =document.getElementById("theme-icon");
const body = document.body;

themeButton.addEventListener("click", () => {

    if (body.classList.contains("dark-mode")) {
        body.classList.replace("dark-mode", "light-mode");
        themeIcon.src = "images/Icon-light.png";
        themeIcon.alt = "Switch to Light Mode";
    } else {
        body.classList.replace("light-mode", "dark-mode");
        themeIcon.src = "images/Icon-dark.png";
        themeIcon.alt = "Switch to Dark Mode";
    }
})