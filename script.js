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

const gripImage = document.querySelector("#grip img");
const bullet = document.querySelector("#grip #bullet");
const explosion = document.querySelector("#explosion");

let clickCount = 0;
let resetTimer;
let stopTimer;

gripImage.addEventListener("click", () => {

    clearTimeout(resetTimer);
    clearTimeout(stopTimer);

    gripImage.classList.remove("shake-mild", "shake-med", "shake-hard", "shake-stopping");

    void gripImage.offsetWidth;

    clickCount++;
    // console.log(`Grip clicked ${clickCount} time(s)`);

    if (clickCount > 10) {
        // console.log("CHAOS SHAKE");
        gripImage.classList.add("shake-hard");
    } 
    else if (clickCount > 6) {
        // console.log("Intense shake");
        gripImage.classList.add("shake-med");
    } 
    else if (clickCount > 3) {
        // console.log("Mild shake");
        gripImage.classList.add("shake-mild");
    }

    if (clickCount === 15) {

        // console.log("BULLET FIRED!");
        bullet.classList.remove("shoot-active");
        explosion.classList.remove("explode-active");
        void bullet.offsetWidth;
        void explosion.offsetWidth;
        bullet.classList.add("shoot-active");

        setTimeout(() => {
            const bulletRect = bullet.getBoundingClientRect();
            explosion.style.top = (bulletRect.top + 80) + "px";
            bullet.classList.remove("shoot-active");
            explosion.classList.add("explode-active");
        }, 1000);
    }

    resetTimer = setTimeout(() => {

        clickCount = 0;
        gripImage.classList.remove("shake-mild", "shake-med", "shake-hard");
        gripImage.classList.add("shake-stopping");
        explosion.classList.remove("explode-active");
        bullet.classList.remove("shoot-active");

        stopTimer = setTimeout(() => {
            gripImage.classList.remove("shake-stopping");
        }, 1000)

        bullet.classList.remove("shoot-active");
        // console.log("Click count reset");
    }, 1200)
})


