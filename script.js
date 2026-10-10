
const GOOGLE_SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTxA1Aee4W5FooxDHb2Gvh2TVvQRrBjTkjn3kpNTMoRc52DXdN2ep6307BQQY5-_hHq-tyL7lPRXrtf/pub?output=csv';

// தமிழ் உயிர்மெய் எழுத்துக்களைப் பிரிக்கும் செயல்பாடு
function splitTamilWords(word) {
    if (typeof Intl !== 'undefined' && Intl.Segmenter) {
        const segmenter = new Intl.Segmenter('ta', { granularity: 'grapheme' });
        return Array.from(segmenter.segment(word)).map(s => s.segment);
    }
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

// Google Sheet-இல் இருந்து தரவைப் பெறுதல்
async function fetchWordsFromGoogleSheet() {
    try {
        const response = await fetch(GOOGLE_SHEET_CSV_URL + '&v=' + new Date().getTime());
        const csvText = await response.text();
        
        // CSV-இல் உள்ள வரிகளைப் பிரித்து சொற்களை மட்டும் எடுக்கிறது
        const rows = csvText.split('\n');
        const dictionary = rows.map(row => {
            const columns = row.split(',');
            // 2-வது பத்தியில் (Column B) சொல் இருந்தால் அதை எடுக்கும், இல்லை என்றால் 1-வது பத்தி
            const word = columns[1] ? columns[1] : columns[0];
            return word ? word.replace(/["\r\n]/g, '').trim() : '';
        }).filter(word => word !== '' && word !== 'Timestamp' && word !== 'புதிய தமிழ் சொல்');

        return dictionary;
    } catch (error) {
        console.error("Google Sheet-இல் இருந்து தரவை எடுப்பதில் பிழை:", error);
        return [];
    }
}

// தேடல் செயல்பாடு
async function findRhymes() {
    const inputWord = document.getElementById('wordInput').value.trim();

    if (!inputWord) {
        alert("தயவுசெய்து ஒரு சொல்லை உள்ளிடவும்!");
        return;
    }

    // Google Sheet-இல் இருந்து சொற்களைப் பெறுகிறது
    const dictionary = await fetchWordsFromGoogleSheet();

    const firstChar = getFirstChar(inputWord);
    const secondChar = getSecondChar(inputWord);
    const lastChar = getLastChar(inputWord);

    let edhugaiList = [];
    let monaiList = [];
    let iyaibuList = [];

    dictionary.forEach(word => {
        if (word === inputWord) return;

        const wFirst = getFirstChar(word);
        const wSecond = getSecondChar(word);
        const wLast = getLastChar(word);

        // 1. எதுகை
        if (secondChar && wSecond === secondChar) {
            edhugaiList.push(word);
        }

        // 2. மோனை
        if (firstChar && wFirst === firstChar) {
            monaiList.push(word);
        }

        // 3. இயைபு
        if (lastChar && wLast === lastChar) {
            iyaibuList.push(word);
        }
    });

    renderTags('edhugaiTags', edhugaiList);
    renderTags('monaiTags', monaiList);
    renderTags('iyaibuTags', iyaibuList);
}

function renderTags(elementId, words) {
    const container = document.getElementById(elementId);
    container.innerHTML = '';

    if (words.length === 0) {
        container.innerHTML = '<span class="no-match">பொருந்தும் சொற்கள் கிடைக்கவில்லை.</span>';
        return;
    }

    const uniqueWords = [...new Set(words)];

    uniqueWords.forEach(word => {
        const tag = document.createElement('span');
        tag.className = 'tag';
        tag.textContent = word;
        container.appendChild(tag);
    });
}

document.getElementById('wordInput').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        findRhymes();
    }
});
