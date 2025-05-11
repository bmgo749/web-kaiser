const text = "Hey, This is our Moon! Centa.\nUh, and this is information about us!";
const typewriter = document.getElementById("Moon");
let index = 0;

function type() {
    if (index < text.length) {
        const currentChar = text.charAt(index);

        // Tambahkan karakter ke dalam HTML (gunakan <br> untuk \n)
        if (currentChar === "\n") {
            typewriter.innerHTML += "<br>";
        } else {
            typewriter.innerHTML += currentChar;
        }

        index++;

        // Atur jeda sesuai karakter
        let delay = 230;
        if (currentChar === "." || currentChar === "!") delay = 750;
        else if (currentChar === ",") delay = 400;
        else if (currentChar === " ") delay = 230;

        setTimeout(type, delay);
    } else {
        setTimeout(erase, 2300); // jeda sebelum hapus
    }
}

function erase() {
    const content = typewriter.innerHTML;

    if (content.length > 0) {
        // Jika terakhir adalah <br>, hapus 4 karakter terakhir (karena <br>)
        if (content.endsWith("<br>")) {
            typewriter.innerHTML = content.slice(0, -4);
        } else {
            typewriter.innerHTML = content.slice(0, -1);
        }

        setTimeout(erase, 100); // jeda hapus
    } else {
        index = 0;
        setTimeout(type, 1000); // mulai lagi
    }
}

type();

const texts = [
    { text: "JETSU BUGIS JETSU BUGIS JETSU BUGIS", chance: 0.000001 },   // 0.0001%
    { text: `OKRA IS BETTER 
             THAN ANYTHING ABOUT FISH`, chance: 0.4 },    // 40%
    { text: "MENERBANGKAN MANUSIA PERTAMA KE ATMOSFER", chance: 0.2 },   // 20%
    { text: "NASI PADANG, JOSSS", chance: 0.3 },                          // 30%
    { text: `BOSS GXNG? NO, 
             THIS IS KAISERLICHE`, chance: 0.099999 }     // 9.9%
];

function getWeightedRandomText() {
    const rand = Math.random();
    let cumulative = 0;

    for (const item of texts) {
        cumulative += item.chance;
        if (rand < cumulative) {
            return item.text;
        }
    }

    return texts[texts.length - 1].text;
}

function updateText() {
    const textElement = document.getElementById("randomText");

    textElement.style.opacity = 0;

    setTimeout(() => {
        textElement.textContent = getWeightedRandomText();

        textElement.style.opacity = 1;
    }, 2300); // waktu fade out
}

document.addEventListener("DOMContentLoaded", () => {
    updateText();
    setInterval(updateText, 17000);
});