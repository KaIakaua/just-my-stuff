

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
function parseMsgDate(str) {
    const [datePart, timePart = "0:0:0"] = str.trim().split(/\s+/);
    const [d, m, y] = datePart.split("/").map(Number);
    const [hh = 0, mm = 0, ss = 0] = timePart.split(":").map(Number);
    return new Date(y, m - 1, d, hh, mm, ss).getTime() || 0;
}

async function fetchMessages() {
    const display = document.querySelector(".message-display");
    if (!display) return;

    const sheetIds = [MSG_SHEET_ID];
    if (typeof EXTRA_MSG_SHEET_ID !== "undefined") sheetIds.push(EXTRA_MSG_SHEET_ID);

    try {
        const allMessages = [];

        await Promise.all(sheetIds.map(async (id) => {
            const url = `https://docs.google.com/spreadsheets/d/${id}/export?format=csv`;
            const response = await fetch(url);
            const csvText = await response.text();
            const rows = csvText.split("\n").filter(r => r.trim() !== "").slice(1);

            rows.forEach((row) => {
                const columns = row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
                if (columns.length < 2) return;

                const fullTimestamp = columns[0].replace(/"/g, "").trim();
                const dateOnly = fullTimestamp.split(" ")[0];
                const text = columns[1].replace(/"/g, "").trim();
                if (!text) return;

                allMessages.push({ dateOnly, text, ms: parseMsgDate(fullTimestamp) });
            });
        }));

        allMessages.sort((a, b) => b.ms - a.ms);

        display.innerHTML = "";
        allMessages.forEach((item) => {
            const div = document.createElement("div");
            div.className = "anon-post";
            div.style.cursor = "zoom-in";

            div.innerHTML = `
                <div class="anon-header">
                    <strong>Anon:</strong>
                    <span>${item.dateOnly}</span>
                </div>
                <div class="msg-body"></div>
            `;

            div.querySelector(".msg-body").textContent = item.text;

            div.onclick = function() {
                const modal = document.getElementById("msg-modal");
                const mBody = document.getElementById("modal-body");
                const mDate = document.getElementById("modal-date");

                mBody.textContent = item.text;
                mDate.textContent = item.dateOnly;
                modal.style.display = "flex";
            };

            display.appendChild(div);
        });
    } catch (e) {
        console.error(e);
        display.textContent = "Error loading messages.";
    }
}

fetchMessages();