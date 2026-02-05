const languages = [
  { code: "id", name: "Indonesia", flag: "" },
  { code: "en", name: "English", flag: "" },
  { code: "de", name: "Deutsch", flag: "" },
  { code: "jw", name: "Jawa", flag: "" },
];

const API_ENDPOINT = "https://api.siputzx.my.id/api/tools/translate";

let currentSourceLang = "id";
let currentTargetLang = "en";
let lastTranslation = "";

const sourceDropdown = document.getElementById("sourceDropdown");
const targetDropdown = document.getElementById("targetDropdown");
const sourceSelected = document.getElementById("sourceSelected");
const targetSelected = document.getElementById("targetSelected");
const sourceList = document.getElementById("sourceList");
const targetList = document.getElementById("targetList");
const sourceText = document.getElementById("sourceText");
const targetText = document.getElementById("targetText");
const sourceCharCount = document.getElementById("sourceCharCount");
const targetCharCount = document.getElementById("targetCharCount");
const translateBtn = document.getElementById("translateBtn");
const clearBtn = document.getElementById("clearBtn");
const loadingIndicator = document.getElementById("loadingIndicator");
const resultContainer = document.getElementById("resultContainer");
const translationResult = document.getElementById("translationResult");
const copyBtn = document.getElementById("copyBtn");
const notification = document.getElementById("notification");
const apiStatus = document.getElementById("apiStatus");
const statusIndicator = document.getElementById("statusIndicator");
const statusText = document.getElementById("statusText");
const swapBtn = document.getElementById("swapBtn");

function initializeLanguages() {
  sourceList.innerHTML = "";
  targetList.innerHTML = "";

  languages.forEach((lang) => {
    const sourceOption = document.createElement("div");
    sourceOption.className = "language-option";
    sourceOption.dataset.code = lang.code;
    sourceOption.innerHTML = `<span>${lang.flag} ${lang.name}</span>`;
    sourceOption.addEventListener("click", () =>
      selectLanguage("source", lang.code, lang.name, lang.flag),
    );
    sourceList.appendChild(sourceOption);

    const targetOption = document.createElement("div");
    targetOption.className = "language-option";
    targetOption.dataset.code = lang.code;
    targetOption.innerHTML = `<span>${lang.flag} ${lang.name}</span>`;
    targetOption.addEventListener("click", () =>
      selectLanguage("target", lang.code, lang.name, lang.flag),
    );
    targetList.appendChild(targetOption);
  });

  selectLanguage("source", "id", "Indonesia", "🇮🇩");
  selectLanguage("target", "en", "English", "🇺🇸");
}

function selectLanguage(type, code, name, flag) {
  if (type === "source") {
    currentSourceLang = code;
    sourceSelected.innerHTML = `<span>${flag} ${name}</span><i class="fas fa-chevron-down"></i>`;
    sourceList.classList.remove("active");
  } else {
    currentTargetLang = code;
    targetSelected.innerHTML = `<span>${flag} ${name}</span><i class="fas fa-chevron-down"></i>`;
    targetList.classList.remove("active");
  }

  translateBtn.disabled = sourceText.value.trim().length === 0;
  copyBtn.disabled = true;
}

function updateCharCount() {
  const sourceLength = sourceText.value.length;
  const targetLength = targetText.value.length;
  sourceCharCount.textContent = `${sourceLength}/5000`;
  targetCharCount.textContent = `${targetLength}/5000`;

  if (sourceLength > 4500) {
    sourceCharCount.style.color = "var(--error-color)";
  } else {
    sourceCharCount.style.color = "var(--gray-color)";
  }

  translateBtn.disabled = sourceLength === 0;
}

function showNotification(message, type = "success") {
  notification.textContent = message;
  notification.className = `notification ${type}`;
  notification.classList.add("show");

  setTimeout(() => {
    notification.classList.remove("show");
  }, 3000);
}

async function translateWithAPI(text, source, target) {
  try {
    const response = await fetch(API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        text: text,
        source: source,
        target: target,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error);
    }

    if (data.translatedText) return data.translatedText;
    if (data.translated_text) return data.translated_text;
    if (data.translation) return data.translation;
    if (data.result) return data.result;
    if (data.text) return data.text;
    if (data.data && data.data.translatedText) return data.data.translatedText;
    if (data.data && data.data.translation) return data.data.translation;
    if (data.data && data.data.text) return data.data.text;

    if (typeof data === "string") {
      try {
        const parsedData = JSON.parse(data);
        if (parsedData.translatedText) return parsedData.translatedText;
        if (parsedText.translated_text) return parsedData.translated_text;
        if (parsedData.translation) return parsedData.translation;
        if (parsedData.result) return parsedData.result;
        if (parsedData.text) return parsedData.text;
      } catch (e) {
        return data;
      }
    }

    const responseText = await response.text();
    console.log("Raw response:", responseText);

    try {
      const jsonData = JSON.parse(responseText);
      if (jsonData.translatedText) return jsonData.translatedText;
      if (jsonData.translated_text) return jsonData.translated_text;
      if (jsonData.translation) return jsonData.translation;
      if (jsonData.result) return jsonData.result;
      if (jsonData.text) return jsonData.text;
    } catch (e) {
      return responseText;
    }

    return JSON.stringify(data);
  } catch (error) {
    console.error("API Error Details:", error);
    console.log("Request data:", { text, source, target });
    throw error;
  }
}

async function translateText() {
  const text = sourceText.value.trim();

  if (!text) {
    showNotification("Masukkan teks untuk diterjemahkan", "error");
    return;
  }

  if (text.length > 5000) {
    showNotification("Teks terlalu panjang. Maksimal 5000 karakter.", "error");
    return;
  }

  loadingIndicator.classList.add("active");
  translateBtn.disabled = true;
  copyBtn.disabled = true;

  try {
    const translated = await translateWithAPI(
      text,
      currentSourceLang,
      currentTargetLang,
    );

    lastTranslation = translated;
    targetText.value = translated;

    translationResult.innerHTML = `<p>${translated}</p>`;
    resultContainer.classList.add("active");
    updateCharCount();

    copyBtn.disabled = false;
    statusIndicator.className = "status-indicator status-online";
    statusText.textContent = "Terjemahan berhasil";
    showNotification("Teks berhasil diterjemahkan!");
  } catch (error) {
    console.error("Translation failed:", error);

    translationResult.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-exclamation-triangle"></i>
                        <p>Terjemahan gagal: ${error.message}</p>
                        <p style="font-size: 0.9rem; margin-top: 0.5rem;">Silakan coba lagi dalam beberapa saat</p>
                    </div>
                `;
    resultContainer.classList.add("active");
    targetText.value = "";

    statusIndicator.className = "status-indicator status-offline";
    statusText.textContent = "Terjemahan gagal";
    showNotification("Gagal menerjemahkan teks", "error");
  } finally {
    loadingIndicator.classList.remove("active");
    translateBtn.disabled = sourceText.value.trim().length === 0;
  }
}

function copyTranslation() {
  if (!lastTranslation) {
    showNotification("Tidak ada teks untuk disalin", "error");
    return;
  }

  navigator.clipboard
    .writeText(lastTranslation)
    .then(() => showNotification("Teks berhasil disalin!"))
    .catch(() => showNotification("Gagal menyalin teks", "error"));
}

function clearAll() {
  sourceText.value = "";
  targetText.value = "";
  lastTranslation = "";

  translationResult.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-language"></i>
                    <p>Hasil terjemahan akan muncul di sini setelah Anda menerjemahkan teks</p>
                </div>
            `;

  resultContainer.classList.remove("active");
  updateCharCount();
  copyBtn.disabled = true;
  translateBtn.disabled = true;

  showNotification("Semua teks telah dihapus");
}

sourceSelected.addEventListener("click", (e) => {
  e.stopPropagation();
  sourceList.classList.toggle("active");
  targetList.classList.remove("active");
});

targetSelected.addEventListener("click", (e) => {
  e.stopPropagation();
  targetList.classList.toggle("active");
  sourceList.classList.remove("active");
});

document.addEventListener("click", (e) => {
  if (!sourceDropdown.contains(e.target)) sourceList.classList.remove("active");
  if (!targetDropdown.contains(e.target)) targetList.classList.remove("active");
});

swapBtn.addEventListener("click", () => {
  const tempLang = currentSourceLang;
  currentSourceLang = currentTargetLang;
  currentTargetLang = tempLang;

  const sourceLang = languages.find((lang) => lang.code === currentSourceLang);
  const targetLang = languages.find((lang) => lang.code === currentTargetLang);

  if (sourceLang && targetLang) {
    selectLanguage("source", sourceLang.code, sourceLang.name, sourceLang.flag);
    selectLanguage("target", targetLang.code, targetLang.name, targetLang.flag);
  }

  if (lastTranslation) {
    const tempText = sourceText.value;
    sourceText.value = targetText.value;
    targetText.value = tempText;
    lastTranslation = tempText;
    translationResult.innerHTML = `<p>${tempText}</p>`;
    copyBtn.disabled = false;
  } else {
    targetText.value = "";
    translationResult.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-language"></i>
                        <p>Hasil terjemahan akan muncul di sini setelah Anda menerjemahkan teks</p>
                    </div>
                `;
    copyBtn.disabled = true;
  }

  updateCharCount();
  showNotification("Bahasa telah ditukar");
});

translateBtn.addEventListener("click", translateText);

clearBtn.addEventListener("click", clearAll);

copyBtn.addEventListener("click", copyTranslation);

sourceText.addEventListener("input", updateCharCount);

sourceText.addEventListener("keydown", (e) => {
  if (e.ctrlKey && e.key === "Enter") {
    translateText();
  }
});

document.addEventListener("DOMContentLoaded", () => {
  initializeLanguages();
  updateCharCount();

  translateBtn.disabled = true;
  copyBtn.disabled = true;

  statusIndicator.className = "status-indicator status-online";
  statusText.textContent = "Sistem siap digunakan";
});
