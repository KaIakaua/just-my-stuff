const MSG_FORM_ID = "1FAIpQLSd9o6QRP5i8_mvppcbGE3VOwBUvBtoSgRH0YKW_3lQvcWlrdw";
const MSG_ENTRY_ID = "entry.518003348";
const MSG_SHEET_ID = "18zYGzUi1lQ3H-V9wgthUCkRMIRQUEYwfXmQxsW4Z0e4";

const MSG_FORM_URL = `https://docs.google.com/forms/d/e/${MSG_FORM_ID}/formResponse`;
const MSG_SHEET_URL = `https://docs.google.com/spreadsheets/d/${MSG_SHEET_ID}/export?format=csv`;

// Submit 
const msgBtn = document.querySelector(".msg-submit");
if (msgBtn) {
    msgBtn.addEventListener("click", async () => {
        const input = document.getElementById("msg-input");
        const status = document.getElementById("msg-status");

        const val = input.value.trim();
        
        if (!val) {
            status.textContent = "Empty!";
            setTimeout(() => { status.textContent = ""; }, 2000);
            return;
        }

        msgBtn.disabled = true;
        msgBtn.style.opacity = "0.5";
        status.textContent = "Sending...";

        const formData = new FormData();
        formData.append(MSG_ENTRY_ID, val);

        try {
            await fetch(MSG_FORM_URL, {
                method: "POST",
                body: formData,
                mode: "no-cors",
            });

            status.textContent = "Sent message";
            input.value = ""; 
            
            msgBtn.disabled = false;
            msgBtn.style.opacity = "1";

            setTimeout(() => {
                status.textContent = "";
            }, 3000);

        } catch (e) {
            status.textContent = "Error!";
            msgBtn.disabled = false;
            msgBtn.style.opacity = "1";
            setTimeout(() => { status.textContent = ""; }, 3000);
        }
    });
}

// Fetch 
async function fetchMessages() {
    const display = document.querySelector(".message-display");
    if (!display) return;

    try {
        const response = await fetch(MSG_SHEET_URL);
        const csvText = await response.text();
        const rows = csvText.split("\n").filter(r => r.trim() !== "").slice(1);

        display.innerHTML = "";
        rows.reverse().forEach(row => {
            const columns = row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
            if (columns.length < 2) return;

            const time = columns[0].replace(/"/g, "");
            const text = columns[1].replace(/"/g, "");

            const div = document.createElement("div");
            div.className = "anon-post";
            
            const textSpan = document.createElement("span");
            textSpan.textContent = text;

            div.innerHTML = `<strong>Anon:</strong> `;
            div.appendChild(textSpan);
            div.innerHTML += ` <br><small style="opacity:0.5">${time}</small>`;
            
            display.appendChild(div);
        })
    } catch (e) {
        console.error(e);
        display.textContent = "Error loading messages.";
    }
}

fetchMessages();