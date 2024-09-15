const dhikrCards = document.getElementById('dhikrCards');
const addDhikrBtn = document.getElementById('addDhikrBtn');
const modal = document.getElementById('modal');
const closeModal = document.getElementById('closeModal');
const dhikrForm = document.getElementById('dhikrForm');
const predefinedDhikr = document.getElementById('predefinedDhikr');
const sharePredefinedLink = document.getElementById('sharePredefinedLink');
const exportBtn = document.getElementById('exportBtn');
const importBtn = document.getElementById('importBtn');
const importFile = document.getElementById('importFile');
const resetAllBtn = document.getElementById('resetAllBtn');
const themeToggle = document.getElementById('themeToggle');

const dhikrInfo = {
    "الصلاة على النبي": {
        count: 10,
        link: "https://read-quran.github.io/azkar/pages/1"
    },
    "سبحان الله وبحمده": {
        count: 100,
        link: "https://read-quran.github.io/azkar/pages/2"
    }
};

let dhikrs = JSON.parse(localStorage.getItem('dhikrs')) || [];

function saveDhikrs() {
    localStorage.setItem('dhikrs', JSON.stringify(dhikrs));
}

function renderDhikrCards() {
    dhikrCards.innerHTML = '';
    dhikrs.forEach((dhikr, index) => {
        const card = document.createElement('div');
        card.className = 'dhikr-card';
        card.innerHTML = `
            <div class="dhikr-text">${dhikr.text}</div>
            <div class="dhikr-count">${dhikr.currentCount} / ${dhikr.targetCount}</div>
            <button class="increment-btn" onclick="incrementCount(${index})">+</button>
            <div class="card-buttons">
                <button class="btn card-btn secondary-btn" onclick="editDhikr(${index})">تعديل</button>
                <button class="btn card-btn warning-btn" onclick="resetDhikr(${index})">إعادة تعيين</button>
                <button class="btn card-btn danger-btn" onclick="deleteDhikr(${index})">حذف</button>
                <button class="btn card-btn primary-btn" onclick="exportSingleDhikr(${index})">تصدير</button>
                <button class="btn card-btn secondary-btn" onclick="shareDhikr(${index})">مشاركة</button>
            </div>
        `;
        dhikrCards.appendChild(card);
    });
}

function showModal(title, dhikr = null) {
    document.getElementById('modalTitle').textContent = title;
    if (dhikr) {
        document.getElementById('dhikrText').value = dhikr.text;
        document.getElementById('dhikrCount').value = dhikr.targetCount;
        document.getElementById('dhikrHadith').value = dhikr.hadith || '';
        document.getElementById('dhikrVirtues').value = dhikr.virtues || '';
        document.getElementById('dhikrLink').value = dhikr.link || '';
    } else {
        dhikrForm.reset();
    }
    modal.style.display = 'block';
}

function hideModal() {
    modal.style.display = 'none';
}

function addDhikr(dhikr) {
    dhikrs.push(dhikr);
    saveDhikrs();
    renderDhikrCards();
}

function updateDhikr(index, updatedDhikr) {
    dhikrs[index] = { ...dhikrs[index], ...updatedDhikr };
    saveDhikrs();
    renderDhikrCards();
}

function incrementCount(index) {
    if (dhikrs[index].currentCount < dhikrs[index].targetCount) {
        dhikrs[index].currentCount++;
        saveDhikrs();
        renderDhikrCards();
        const countElement = dhikrCards.children[index].querySelector('.dhikr-count');
        countElement.classList.add('animate-count');
        setTimeout(() => countElement.classList.remove('animate-count'), 300);
    }
    if (dhikrs[index].currentCount === dhikrs[index].targetCount) {
        showCompletion(index);
    }
}

function editDhikr(index) {
    showModal('تعديل الذكر', dhikrs[index]);
    dhikrForm.onsubmit = (e) => {
        e.preventDefault();
        const updatedDhikr = {
            text: document.getElementById('dhikrText').value,
            targetCount: parseInt(document.getElementById('dhikrCount').value),
            hadith: document.getElementById('dhikrHadith').value,
            virtues: document.getElementById('dhikrVirtues').value,
            link: document.getElementById('dhikrLink').value
        };
        updateDhikr(index, updatedDhikr);
        hideModal();
    };
}

function resetDhikr(index) {
    if (confirm('هل أنت متأكد من إعادة تعيين هذا الذكر؟')) {
        dhikrs[index].currentCount = 0;
        saveDhikrs();
        renderDhikrCards();
    }
}

function deleteDhikr(index) {
    if (confirm('هل أنت متأكد من حذف هذا الذكر؟')) {
        dhikrs.splice(index, 1);
        saveDhikrs();
        renderDhikrCards();
    }
}

function shareDhikr(index) {
    const dhikr = dhikrs[index];
    let shareText = `الذكر: ${dhikr.text}\n`;
    shareText += `عدد مرات التكرار: ${dhikr.targetCount}\n`;
    if (dhikr.hadith) shareText += `الحديث: ${dhikr.hadith}\n`;
    if (dhikr.virtues) shareText += `الفضائل: ${dhikr.virtues}\n`;
    if (dhikr.link) shareText += `الرابط: ${dhikr.link}\n`;
    
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.open(whatsappUrl, '_blank');
}

function exportSingleDhikr(index) {
    const dhikr = dhikrs[index];
    const exportContent = generateExportContent([dhikr]);
    downloadFile(`${dhikr.text.replace(/\s+/g, '_')}_dhikr.html`, exportContent);
}

function exportAllDhikrs() {
    const exportContent = generateExportContent(dhikrs);
    downloadFile('exported_dhikrs.html', exportContent);
}

function generateExportContent(dhikrsToExport) {
    let dhikrsHtml = dhikrsToExport.map((dhikr, index) => `
        <div class="dhikr-item">
            <h2>${dhikr.text}</h2>
            <div class="counter" id="counter-${index}">0 / ${dhikr.targetCount}</div>
            <button class="count-btn" onclick="incrementCounter(${index})">انقر للعد</button>
            <div class="hadith" style="display: none;">${dhikr.hadith || ''}</div>
            <div class="virtues" style="display: none;">${dhikr.virtues || ''}</div>
        </div>
    `).join('');

    return `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>عداد الأذكار</title>
    <style>
        :root {
            --primary-color: #4a90e2;
            --secondary-color: #f39c12;
            --background-light: #f0f0f0;
            --background-dark: #333;
            --text-light: #333;
            --text-dark: #f0f0f0;
            --container-bg-light: #ffffff;
            --container-bg-dark: #444;
        }
        body {
            font-family: 'Arial', sans-serif;
            text-align: center;
            background-color: var(--background-light);
            color: var(--text-light);
            transition: background-color 0.3s, color 0.3s;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            padding: 1rem;
        }
        body.dark-mode {
            background-color: var(--background-dark);
            color: var(--text-dark);
        }
        .container {
            background-color: var(--container-bg-light);
            border-radius: 10px;
            padding: 2rem;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            max-width: 400px;
            width: 100%;
        }
        body.dark-mode .container {
            background-color: var(--container-bg-dark);
        }
        h1, h2 { 
            color: var(--primary-color);
            margin-bottom: 1rem;
        }
        .dhikr-item {
            margin-bottom: 2rem;
            padding: 1rem;
            background-color: rgba(74, 144, 226, 0.1);
            border-radius: 5px;
        }
        .counter { 
            font-size: 2rem;
            color: var(--secondary-color);
            margin: 1rem 0;
        }
        .count-btn {
            font-size: 1.2rem;
            padding: 0.5rem 1rem;
            background-color: var(--secondary-color);
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            transition: background-color 0.3s;
        }
        .count-btn:hover {
            background-color: #e67e22;
        }
        .hadith, .virtues {
            margin-top: 1rem;
            font-style: italic;
        }
        .button {
            font-size: 1rem;
            padding: 0.5rem 1rem;
            margin: 0.5rem;
            background-color: var(--primary-color);
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
        }
        .theme-toggle {
            position: absolute;
            top: 1rem;
            right: 1rem;
            background: none;
            border: none;
            font-size: 1.5rem;
            cursor: pointer;
        }
    </style>
</head>
<body>
    <button class="theme-toggle" onclick="toggleTheme()">🌓</button>
    <div class="container">
        <h1>عداد الأذكار</h1>
        <div id="dhikrContainer">
            ${dhikrsHtml}
        </div>
        <button id="shareButton" class="button" onclick="shareDhikr()" style="display: none;">مشاركة عبر واتساب</button>
        <button id="resetButton" class="button" onclick="resetCounter()" style="display: none;">إعادة</button>
    </div>
    <script>
        const dhikrs = ${JSON.stringify(dhikrsToExport)};
        let currentCounts = dhikrs.map(() => 0);

        function incrementCounter(index) {
            if (currentCounts[index] < dhikrs[index].targetCount) {
                currentCounts[index]++;
                document.getElementById(\`counter-\${index}\`).textContent = \`\${currentCounts[index]} / \${dhikrs[index].targetCount}\`;
                if (currentCounts[index] === dhikrs[index].targetCount) {
                    document.querySelector(\`#counter-\${index} + .count-btn\`).style.display = 'none';
                    document.querySelector(\`#counter-\${index} ~ .hadith\`).style.display = 'block';
                    document.querySelector(\`#counter-\${index} ~ .virtues\`).style.display = 'block';
                }
                if (currentCounts.every((count, i) => count === dhikrs[i].targetCount)) {
                    document.getElementById('shareButton').style.display = 'inline-block';
                    document.getElementById('resetButton').style.display = 'inline-block';
                }
            }
        }

        function resetCounter() {
            currentCounts = dhikrs.map(() => 0);
            dhikrs.forEach((dhikr, index) => {
                document.getElementById(\`counter-\${index}\`).textContent = \`0 / \${dhikr.targetCount}\`;
                document.querySelector(\`#counter-\${index} + .count-btn\`).style.display = 'inline-block';
                document.querySelector(\`#counter-\${index} ~ .hadith\`).style.display = 'none';
                document.querySelector(\`#counter-\${index} ~ .virtues\`).style.display = 'none';
            });
            document.getElementById('shareButton').style.display = 'none';
            document.getElementById('resetButton').style.display = 'none';
        }

        function shareDhikr() {
            let shareText = 'الأذكار اليومية:\\n\\n';
            dhikrs.forEach((dhikr, index) => {
                shareText += \`\${dhikr.text}\\n\`;
                shareText += \`عدد مرات التكرار: \${dhikr.targetCount}\\n\`;
                if (dhikr.hadith) shareText += \`الحديث: \${dhikr.hadith}\\n\`;
                if (dhikr.virtues) shareText += \`الفضائل: \${dhikr.virtues}\\n\`;
                if (dhikr.link) shareText += \`الرابط: \${dhikr.link}\\n\`;
                shareText += '\\n';
            });
            
            const whatsappUrl = \`https://wa.me/?text=\${encodeURIComponent(shareText)}\`;
            window.open(whatsappUrl, '_blank');
        }

        function toggleTheme() {
            document.body.classList.toggle('dark-mode');
        }
    </script>
</body>
</html>
    `;
}

function downloadFile(filename, content) {
    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function importDhikrs(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const importedDhikrs = JSON.parse(e.target.result);
                dhikrs = importedDhikrs;
                saveDhikrs();
                renderDhikrCards();
                alert('تم استيراد الأذكار بنجاح');
            } catch (error) {
                alert('حدث خطأ أثناء استيراد الملف. تأكد من أن الملف بالتنسيق الصحيح.');
            }
        };
        reader.readAsText(file);
    }
}

function resetAllDhikrs() {
    if (confirm('هل أنت متأكد من إعادة تعيين جميع الأذكار؟')) {
        dhikrs.forEach(dhikr => dhikr.currentCount = 0);
        saveDhikrs();
        renderDhikrCards();
    }
}

function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
}

function showCompletion(index) {
    const dhikr = dhikrs[index];
    alert(`تهانينا! لقد أكملت الذكر: ${dhikr.text}`);
    if (dhikr.hadith) {
        alert(`الحديث: ${dhikr.hadith}`);
    }
    if (dhikr.virtues) {
        alert(`الفضائل: ${dhikr.virtues}`);
    }
}

// Event Listeners (تكملة)
addDhikrBtn.addEventListener('click', () => {
    showModal('إضافة ذكر جديد');
    dhikrForm.onsubmit = (e) => {
        e.preventDefault();
        const newDhikr = {
            text: document.getElementById('dhikrText').value,
            targetCount: parseInt(document.getElementById('dhikrCount').value),
            currentCount: 0,
            hadith: document.getElementById('dhikrHadith').value,
            virtues: document.getElementById('dhikrVirtues').value,
            link: document.getElementById('dhikrLink').value
        };
        addDhikr(newDhikr);
        hideModal();
    };
});

closeModal.addEventListener('click', hideModal);

predefinedDhikr.addEventListener('change', function() {
    const selectedDhikr = this.value;
    if (selectedDhikr && dhikrInfo[selectedDhikr]) {
        document.getElementById('dhikrText').value = selectedDhikr;
        document.getElementById('dhikrCount').value = dhikrInfo[selectedDhikr].count;
        document.getElementById('dhikrLink').value = dhikrInfo[selectedDhikr].link;
    }
});

sharePredefinedLink.addEventListener('click', () => {
    const selectedDhikr = predefinedDhikr.value;
    if (selectedDhikr && dhikrInfo[selectedDhikr]) {
        const { count, link } = dhikrInfo[selectedDhikr];
        const shareText = `الذكر: ${selectedDhikr}\nعدد مرات التكرار: ${count}\n\n${link}`;
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
        window.open(whatsappUrl, '_blank');
    } else {
        alert('الرجاء اختيار ذكر من القائمة');
    }
});

exportBtn.addEventListener('click', exportAllDhikrs);

importBtn.addEventListener('click', () => importFile.click());

importFile.addEventListener('change', importDhikrs);

resetAllBtn.addEventListener('click', resetAllDhikrs);

themeToggle.addEventListener('click', toggleTheme);

// Initialize
function init() {
    renderDhikrCards();
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-mode');
    }

    // إضافة دعم PWA
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', function() {
            navigator.serviceWorker.register('/service-worker.js').then(function(registration) {
                console.log('ServiceWorker registration successful with scope: ', registration.scope);
            }, function(err) {
                console.log('ServiceWorker registration failed: ', err);
            });
        });
    }

    let deferredPrompt;
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        showInstallPromotion();
    });

    function showInstallPromotion() {
        const installBtn = document.createElement('button');
        installBtn.textContent = 'تثبيت التطبيق';
        installBtn.classList.add('btn', 'primary-btn');
        installBtn.style.position = 'fixed';
        installBtn.style.bottom = '20px';
        installBtn.style.left = '20px';
        installBtn.addEventListener('click', () => {
            deferredPrompt.prompt();
            deferredPrompt.userChoice.then((choiceResult) => {
                if (choiceResult.outcome === 'accepted') {
                    console.log('User accepted the install prompt');
                }
                deferredPrompt = null;
            });
            document.body.removeChild(installBtn);
        });
        document.body.appendChild(installBtn);
    }
}

init();