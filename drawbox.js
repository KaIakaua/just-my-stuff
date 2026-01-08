/*
        
        FILL IN THESE VARIABLES BASED ON THE GUIDE AT https://drawbox.nekoweb.org
        
        
				      /`·.¸
				     /¸...¸`:·
				 ¸.·´  ¸   `·.¸.·´)
				: © ):´;      ¸  {
				 `·.¸ `·  ¸.·´\`·¸)
				     `\\´´\¸.·´
        
*/
const GOOGLE_FORM_ID = "1FAIpQLSey6O-yqBfPfyNGOcAT4MpftMcVRmfG44P2-L4ouSK1pXYnQw";
const ENTRY_ID = "entry.86254164";
const GOOGLE_SHEET_ID = "16DarafIA0EjKZlcCyvyCHP_V_86MVZnqhqz5toxnFMQ";
const DISPLAY_IMAGES = true;

/*
        
        DONT EDIT BELOW THIS POINT IF YOU DONT KNOW WHAT YOU ARE DOING.
        
*/

const CLIENT_ID = "b4fb95e0edc434c";
const GOOGLE_SHEET_URL = "https://docs.google.com/spreadsheets/d/" + GOOGLE_SHEET_ID + "/export?format=csv";
const GOOGLE_FORM_URL = "https://docs.google.com/forms/d/e/" + GOOGLE_FORM_ID + "/formResponse";

let canvas = document.getElementById("drawboxcanvas");
let context;



let restore_array = [];
let start_index = -1;
let stroke_color = "black";
let stroke_width = "2";
let is_drawing = false;

if (canvas) {
    context = canvas.getContext("2d");
    context.fillStyle = "white";
    context.fillRect(0, 0, canvas.width, canvas.height);

    canvas.addEventListener("touchstart", start, false);
    canvas.addEventListener("touchmove", draw, false);
    canvas.addEventListener("touchend", stop, false);
    canvas.addEventListener("mousedown", start, false);
    canvas.addEventListener("mousemove", draw, false);
    canvas.addEventListener("mouseup", stop, false);
    canvas.addEventListener("mouseout", stop, false);
}

window.change_color = function(element) { stroke_color = element.style.background; };
window.Restore = function() {
    if (start_index <= 0) { window.Clear(); } 
    else { start_index--; restore_array.pop(); context.putImageData(restore_array[start_index], 0, 0); }
};
window.Clear = function() {
    if (!context) return;
    context.fillStyle = "white";
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillRect(0, 0, canvas.width, canvas.height);
    restore_array = []; start_index = -1;
};

function getX(event) {
    const rect = canvas.getBoundingClientRect();
    return (event.clientX || event.targetTouches[0].clientX) - rect.left;
}
function getY(event) {
    const rect = canvas.getBoundingClientRect();
    return (event.clientY || event.targetTouches[0].clientY) - rect.top;
}
function start(event) {
    is_drawing = true;
    context.beginPath();
    context.moveTo(getX(event), getY(event));
    if(event.type !== "mousedown") event.preventDefault();
}
function draw(event) {
    if (!is_drawing) return;
    context.lineTo(getX(event), getY(event));
    context.strokeStyle = stroke_color;
    context.lineWidth = stroke_width;
    context.lineCap = "round";
    context.lineJoin = "round";
    context.stroke();
    if(event.type !== "mousemove") event.preventDefault();
}
function stop(event) {
    if (!is_drawing) return;
    context.stroke();
    context.closePath();
    is_drawing = false;
    restore_array.push(context.getImageData(0, 0, canvas.width, canvas.height));
    start_index++;
}
function isCanvasBlank() {
    if (!canvas) return true;
    const context = canvas.getContext("2d");
    const pixelBuffer = new Uint32Array(
        context.getImageData(0, 0, canvas.width, canvas.height).data.buffer
    );
    return !pixelBuffer.some(color => color !== 0xFFFFFFFF);
}


if (document.getElementById("submit")) {
    document.getElementById("submit").addEventListener("click", async function () {
        const btn = document.getElementById("submit");
        const status = document.getElementById("status");
        if (isCanvasBlank()) {
            status.textContent = "Canvas is blank.";
            return;
        }
        btn.disabled = true;
        status.textContent = "Uploading...";

        try {
            const imageData = canvas.toDataURL("image/png");
            const blob = await (await fetch(imageData)).blob();
            const formData = new FormData();
            formData.append("image", blob, "drawing.png");

            const response = await fetch("https://api.imgur.com/3/image", {
                method: "POST",
                headers: { Authorization: `Client-ID ${CLIENT_ID}` },
                body: formData,
            });

            const data = await response.json();
            if (!data.success) throw new Error("Imgur Failed");

            const imageUrl = data.data.link;
            const googleData = new FormData();
            googleData.append(ENTRY_ID, imageUrl);

            await fetch(GOOGLE_FORM_URL, {
                method: "POST",
                body: googleData,
                mode: "no-cors",
            });

            status.textContent = "Sent!";
            // alert("Drawing submitted!");
            // location.reload();
            window.Clear();

        } catch (e) {
            status.textContent = "Error.";
            btn.disabled = false;
        }
    });
}

const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightbox-img");

if (lightbox && lightboxImg) {
    lightbox.addEventListener("click", () => {
        lightbox.style.display = "none";
        lightbox.classList.remove("is-zoomed");
        lightboxImg.src = "";
    })

    lightboxImg.addEventListener("click", (event) => {
        event.stopPropagation();
        lightbox.classList.toggle("is-zoomed");
    })
}

async function fetchImages() {
    const gallery = document.getElementById("gallery");
    if (!gallery || !DISPLAY_IMAGES) return;

    try {
        const response = await fetch(GOOGLE_SHEET_URL);
        const csvText = await response.text();
        const rows = csvText.split("\n").filter(r => r.trim() !== "").slice(1);

        gallery.innerHTML = "";
        rows.reverse().forEach((row) => {
            const columns = row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
            if (columns.length < 2) return;

            const time = columns[0].replace(/"/g, "");
            const url = columns[1].trim().replace(/"/g, "");

            if (url.startsWith("http")) {
                const div = document.createElement("div");
                div.classList.add("image-container");
                div.innerHTML = `<img src="${url}" referrerpolicy="no-referrer"><p>${time}</p>`;
                
                div.addEventListener("click",() => {
                    if (lightbox && lightboxImg) {
                        const imgSrc = div.querySelector("img").src;
                        lightboxImg.src = imgSrc;
                        lightbox.style.display = "flex";
                    }                    
                })
                gallery.appendChild(div);
            }
        });
    } catch (e) { console.error(e); }
}

fetchImages();
