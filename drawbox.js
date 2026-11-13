/*
        
        FILL IN THESE VARIABLES BASED ON THE GUIDE AT https://drawbox.nekoweb.org
        
        
				      /`·.¸
				     /¸...¸`:·
				 ¸.·´  ¸   `·.¸.·´)
				: © ):´;      ¸  {
				 `·.¸ `·  ¸.·´\`·¸)
				     `\\´´\¸.·´
        
*/


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
            btn.disabled = false;
            setTimeout(() => { status.textContent = ""; }, 3000);

        } catch (e) {
            status.textContent = "Error.";
            btn.disabled = false;
            setTimeout(() => { status.textContent = ""; }, 3000);
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

function parseSheetDate(str) {
    const [datePart, timePart = "0:0:0"] = str.trim().split(/\s+/);
    const [d, m, y] = datePart.split("/").map(Number);
    const [hh = 0, mm = 0, ss = 0] = timePart.split(":").map(Number);
    return new Date(y, m - 1, d, hh, mm, ss).getTime() || 0;
}

async function fetchImages() {
    const gallery = document.getElementById("gallery");
    if (!gallery || !DISPLAY_IMAGES) return;

    const sheetIds = [GOOGLE_SHEET_ID];
    if (typeof EXTRA_GOOGLE_SHEET_ID !== "undefined") sheetIds.push(EXTRA_GOOGLE_SHEET_ID);

    try {
        const allItems = [];

        await Promise.all(sheetIds.map(async (id) => {
            const url = `https://docs.google.com/spreadsheets/d/${id}/export?format=csv`;
            const response = await fetch(url);
            const csvText = await response.text();
            const rows = csvText.split("\n").filter(r => r.trim() !== "").slice(1);

            rows.forEach((row) => {
                const columns = row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
                if (columns.length < 2) return;

                const time = columns[0].replace(/"/g, "").trim();
                const imgUrl = columns[1].trim().replace(/"/g, "");
                const source = columns[2] ? columns[2].trim().replace(/"/g, "") : "";

                if (imgUrl.includes("i.imgur.com") && (source === SECRET_CODE || source === "")) {
                    allItems.push({ time, imgUrl, ms: parseSheetDate(time) });
                }
            });
        }));

        allItems.sort((a, b) => b.ms - a.ms);

        gallery.innerHTML = "";
        allItems.forEach((item) => {
            const div = document.createElement("div");
            div.classList.add("image-container");
            div.innerHTML = `<img src="${item.imgUrl}" referrerpolicy="no-referrer"><p>${item.time}</p>`;
            
            div.addEventListener("click", () => {
                if (lightbox && lightboxImg) {
                    lightboxImg.src = item.imgUrl;
                    lightbox.style.display = "flex";
                }                    
            });
            gallery.appendChild(div);
        });
    } catch (e) { console.error(e); }
}


fetchImages();
