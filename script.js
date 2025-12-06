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
let explosionTimer;
let decayTimer1, decayTimer2;

gripImage.addEventListener("click", () => {

    if (clickCount === 15) return;

    clearTimeout(resetTimer);
    clearTimeout(stopTimer);
    clearTimeout(explosionTimer);
    clearTimeout(decayTimer1)
    clearTimeout(decayTimer2)

    gripImage.classList.remove("shake-mild", "shake-med", "shake-hard");
    bullet.classList.remove("shoot-active");
    explosion.classList.remove("explode-active");

    void gripImage.offsetWidth;
    void bullet.offsetWidth;
    void explosion.offsetWidth;

    /* SHAKING */

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


    /* FIRE BULLET */

    if (clickCount === 15) {

        // console.log("BULLET FIRED!");
        bullet.classList.add("shoot-active");

        setTimeout(() => {

            const bulletRect = bullet.getBoundingClientRect();
            explosion.style.top = (bulletRect.top + 80) + "px";
            bullet.classList.remove("shoot-active");
            explosion.classList.add("explode-active");

            explosionTimer = setTimeout(() => {
                explosion.classList.remove("explode-active");
            }, 3000)
        }, 1000)
    }

    let resetDuration = (clickCount >= 15) ? 800 : 800;

    resetTimer = setTimeout(() => {

        clickCount = 0;
        // console.log("Click count reset");

        if (gripImage.classList.contains("shake-hard")) {
            gripImage.classList.remove("shake-hard");
            gripImage.classList.add("shake-med")

            decayTimer1 = setTimeout(() => {
                gripImage.classList.remove("shake-med");
                gripImage.classList.add("shake-mild");

                decayTimer2 = setTimeout(() => {
                    gripImage.classList.remove("shake-mild")
                }, 400)
            }, 300)
        } else if (gripImage.classList.contains("shake-med")) {
            gripImage.classList.remove("shake-med");
            gripImage.classList.add("shake-mild");

            decayTimer1 = setTimeout(() => {
                gripImage.classList.remove("shake-mild");
            }, 400)
        } else {
            gripImage.classList.remove("shake-mild");
        }

    }, resetDuration)
})


