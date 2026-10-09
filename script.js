// தமிழ் எழுத்துக்களைப் பிரித்தெடுக்கும் உதவிகள்
function getFirstChar(word) {
    return Array.from(word)[0] || "";
}

function getSecondChar(word) {
    const chars = Array.from(word);
    return chars.length > 1 ? chars[1] : "";
}

function getLastChar(word) {
    const chars = Array.from(word);
    return chars.length > 0 ? chars[chars.length - 1] : "";
}

// தேடல் செயல்பாடு
async function findRhymes() {
    const inputWord = document.getElementById('wordInput').value.trim();

    if (!inputWord) {
        alert("தயவுசெய்து ஒரு சொல்லை உள்ளிடவும்!");
        return;
    }

    try {
        // JSON கோப்பில் இருந்து சொற்களைப் பெறுதல்
        const response = await fetch('words.json');
        const dictionary = await response.json();

        const firstChar = getFirstChar(inputWord);
        const secondChar = getSecondChar(inputWord);
        const lastChar = getLastChar(inputWord);

        let edhugaiList = [];
        let monaiList = [];
        let iyaibuList = [];

        dictionary.forEach(word => {
            if (word === inputWord) return; // அதே சொல்லைத் தவிர்க்க

            // 1. எதுகை (இரண்டாம் எழுத்து match)
            if (secondChar && getSecondChar(word) === secondChar) {
                edhugaiList.push(word);
            }

            // 2. மோனை (முதல் எழுத்து match)
            if (firstChar && getFirstChar(word) === firstChar) {
                monaiList.push(word);
            }

            // 3. இயைபு (கடைசி எழுத்து match)
            if (lastChar && getLastChar(word) === lastChar) {
                iyaibuList.push(word);
            }
        });

        // பட்டைகளாக (Tags) திரையில் காட்டுதல்
        renderTags('edhugaiTags', edhugaiList);
        renderTags('monaiTags', monaiList);
        renderTags('iyaibuTags', iyaibuList);

    } catch (error) {
        console.error("words.json கோப்பை வாசிப்பதில் பிழை:", error);
    }
}

function renderTags(elementId, words) {
    const container = document.getElementById(elementId);
    container.innerHTML = '';

    if (words.length === 0) {
        container.innerHTML = '<span class="no-match">பொருந்தும் சொற்கள் கிடைக்கவில்லை.</span>';
        return;
    }

    words.forEach(word => {
        const tag = document.createElement('span');
        tag.className = 'tag';
        tag.textContent = word;
        container.appendChild(tag);
    });
}

// Enter Key அழுத்தினால் தேடும் வசதி
document.getElementById('wordInput').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        findRhymes();
    }
});