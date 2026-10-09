// தமிழ் உயிர்மெய் எழுத்துக்களைச் சரியாகப் பிரித்தெடுக்கும் செயல்பாடு
function splitTamilWords(word) {
    // Intl.Segmenter தமிழ் போன்ற காம்ப்ளக்ஸ் எழுத்துக்களைச் சரியாகப் பிரிக்கும்
    if (typeof Intl !== 'undefined' && Intl.Segmenter) {
        const segmenter = new Intl.Segmenter('ta', { granularity: 'grapheme' });
        return Array.from(segmenter.segment(word)).map(s => s.segment);
    }
    // பழைய பிரவுசர்களுக்கான மாற்று வழி
    return Array.from(word);
}

function getFirstChar(word) {
    const chars = splitTamilWords(word);
    return chars.length > 0 ? chars[0] : "";
}

function getSecondChar(word) {
    const chars = splitTamilWords(word);
    return chars.length > 1 ? chars[1] : "";
}

function getLastChar(word) {
    const chars = splitTamilWords(word);
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
        // words.json கோப்பில் இருந்து தரவை எடுத்தல் (Cache தவிர்ப்பதற்காக ?v= விதியை இணைத்துள்ளோம்)
        const response = await fetch('words.json?v=' + new Date().getTime());
        const dictionary = await response.json();

        const firstChar = getFirstChar(inputWord);
        const secondChar = getSecondChar(inputWord);
        const lastChar = getLastChar(inputWord);

        let edhugaiList = [];
        let monaiList = [];
        let iyaibuList = [];

        dictionary.forEach(word => {
            // அதே சொல்லைத் தவிர்க்க
            if (word.trim() === inputWord) return;

            const wFirst = getFirstChar(word);
            const wSecond = getSecondChar(word);
            const wLast = getLastChar(word);

            // 1. எதுகை (இரண்டாம் எழுத்து பொருந்துவது)
            if (secondChar && wSecond === secondChar) {
                edhugaiList.push(word);
            }

            // 2. மோனை (முதல் எழுத்து பொருந்துவது)
            if (firstChar && wFirst === firstChar) {
                monaiList.push(word);
            }

            // 3. இயைபு (கடைசி எழுத்து பொருந்துவது)
            if (lastChar && wLast === lastChar) {
                iyaibuList.push(word);
            }
        });

        // முடிவுகளைத் திரையில் காட்டுதல்
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

    // ஒரே சொல் மீண்டும் வராமல் இருக்க (Unique words only)
    const uniqueWords = [...new Set(words)];

    uniqueWords.forEach(word => {
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
