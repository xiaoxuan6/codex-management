"use strict";

const configGrid = document.getElementById("configGrid");
const loginScreen = document.getElementById("loginScreen");
const appShell = document.getElementById("appShell");
const loginForm = document.getElementById("loginForm");
const loginMessage = document.getElementById("loginMessage");
const logoutBtn = document.getElementById("logoutBtn");
const tabButtons = document.querySelectorAll(".tab-btn");
const TAB_CONFIG = "configPage";
const TAB_SAMPLE = "sampleSection";
const sampleSection = document.getElementById("sampleSection");
const configPage = document.getElementById("configPage");
const LOGIN_KEY = "codex-login-v1";
const TOKEN_KEY = "codex-token";
const HIDDEN_CLASS = "is-hidden";

function normalizeStatus(status) {
    if (typeof status === "boolean") {
        return status;
    }
    if (typeof status === "number") {
        return status === 1;
    }
    if (typeof status === "string") {
        const normalized = status.trim().toLowerCase();
        if (["true", "1", "yes", "y", "active", "enabled", "online", "ok"].includes(normalized)) {
            return true;
        }
        if (["false", "0", "no", "n", "inactive", "disabled", "offline", "error"].includes(normalized)) {
            return false;
        }
    }
    return null;
}

function unlockInterface() {
    loginScreen.classList.add("hidden");
    appShell.hidden = false;
    showConfigPage();
}

function lockInterface() {
    appShell.hidden = true;
    loginScreen.classList.remove("hidden");
    showConfigPage();
    setTimeout(() => {
        loginForm.username.focus();
    }, 120);
}

if (sessionStorage.getItem(LOGIN_KEY) === "true") {
    unlockInterface();
    loadData()
} else {
    lockInterface();
}

function createCard({name, url, baseUrl, token, status}) {
    const card = document.createElement("article");
    card.className = "config-card";
    const inferredStatus = normalizeStatus(status);
    if (inferredStatus !== null) {
        card.dataset.status = String(inferredStatus);
        card.classList.add(inferredStatus ? "config-card--status-true" : "config-card--status-false");
    }
    card.innerHTML = `
        <div class="config-title">
            <h2>
                <a class="config-link" href="${url}" target="_blank" rel="noopener noreferrer">${name}</a>
            </h2>
        </div>
        <div class="field">
            <label>Base URL</label>
            <div class="value">
                <span class="value-text">${baseUrl}</span>
                <button class="copy-btn" data-copy="${baseUrl}" aria-label="复制 URL">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                        <path d="M5 5.5A1.5 1.5 0 0 1 6.5 4h6A1.5 1.5 0 0 1 14 5.5v6A1.5 1.5 0 0 1 12.5 13h-6A1.5 1.5 0 0 1 5 11.5v-6Z" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"></path>
                        <path d="M3.5 11.5A1.5 1.5 0 0 1 2 10V4A1.5 1.5 0 0 1 3.5 2.5h6A1.5 1.5 0 0 1 11 4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"></path>
                    </svg>
                </button>
            </div>
        </div>
        <div class="field">
            <label>API Token</label>
            <div class="value">
                <span class="value-text">${token}</span>
                <button class="copy-btn" data-copy="${token}" aria-label="复制 Token">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                        <path d="M5 5.5A1.5 1.5 0 0 1 6.5 4h6A1.5 1.5 0 0 1 14 5.5v6A1.5 1.5 0 0 1 12.5 13h-6A1.5 1.5 0 0 1 5 11.5v-6Z" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"></path>
                        <path d="M3.5 11.5A1.5 1.5 0 0 1 2 10V4A1.5 1.5 0 0 1 3.5 2.5h6A1.5 1.5 0 0 1 11 4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"></path>
                    </svg>
                </button>
            </div>
        </div>
    `;
    return card;
}

function fallbackCopy(text) {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "absolute";
    textarea.style.left = "-9999px";
    document.body.append(textarea);
    textarea.select();
    document.execCommand("copy");
    textarea.remove();
}

async function copyText(text) {
    if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
    } else {
        fallbackCopy(text);
    }
}

function attachCopyHandlers(root) {
    const buttons = root.querySelectorAll(".copy-btn, .code-copy");
    buttons.forEach((btn) => {
        btn.addEventListener("click", async () => {
            const original = btn.innerHTML;
            try {
                await copyText(btn.dataset.copy);
                btn.innerHTML = `
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                        <path d="M3.5 8.2L6.3 11l6.2-6.2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"></path>
                    </svg>
                `;
            } catch (error) {
                console.error("Copy failed", error);
                btn.innerHTML = `
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                        <path d="M6 6l4 4M10 6l-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
                        <circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.3"></circle>
                    </svg>
                `;
            } finally {
                setTimeout(() => {
                    btn.innerHTML = original;
                }, 1600);
            }
        });
    });
}

loginForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const username = loginForm.username.value.trim();
    const password = loginForm.password.value;

    axios.post('/api/login', {
        username: username, password: password
    })
        .then(function (response) {
            if (response.data.status === 200) {
                loginMessage.textContent = "";
                sessionStorage.setItem(LOGIN_KEY, "true");
                unlockInterface();
                loginForm.reset();
                sessionStorage.setItem(TOKEN_KEY, response.data.data)

                loadData();

            } else {
                loginMessage.textContent = "凭证无效，请重试。";
                loginForm.password.value = "";
                loginForm.password.focus();
            }
        })
        .catch(function (error) {
            console.log(error)
            loginMessage.textContent = "凭证无效，请重试。";
            loginForm.password.value = "";
            loginForm.password.focus();
        });
});

loginForm.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && event.target.tagName === "INPUT") {
        event.preventDefault();
        loginForm.requestSubmit();
    }
});

logoutBtn.addEventListener("click", () => {
    sessionStorage.removeItem(LOGIN_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    loginMessage.textContent = "凭证无效，请重试。";
    lockInterface();
});

function showSamplePage() {
    activateTab(TAB_SAMPLE);
    if (sampleSection) {
        sampleSection.hidden = false;
        sampleSection.removeAttribute("hidden");
        sampleSection.classList.remove(HIDDEN_CLASS);
    }
    if (configPage) {
        configPage.hidden = true;
        configPage.setAttribute("hidden", "");
        configPage.classList.add(HIDDEN_CLASS);
    }
}

function showConfigPage() {
    activateTab(TAB_CONFIG);
    if (sampleSection) {
        sampleSection.hidden = true;
        sampleSection.setAttribute("hidden", "");
        sampleSection.classList.add(HIDDEN_CLASS);
    }
    if (configPage) {
        configPage.hidden = false;
        configPage.removeAttribute("hidden");
        configPage.classList.remove(HIDDEN_CLASS);
    }
}

function activateTab(targetId) {
    tabButtons.forEach((btn) => {
        const isActive = btn.dataset.target === targetId;
        btn.classList.toggle("tab-active", isActive);
        btn.setAttribute("aria-selected", String(isActive));
    });
}

tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
        const targetId = btn.dataset.target;
        if (targetId === TAB_SAMPLE) {
            showSamplePage();
        } else {
            showConfigPage();
        }
    });
});

if (sampleSection) {
    attachCopyHandlers(sampleSection);
}

function loadData() {
    axios.get('/api/codex_configs', {
        headers: {'codex-token': sessionStorage.getItem(TOKEN_KEY)}
    })
        .then(function (response) {
            if (response.data.status === 200) {
                response.data.data.forEach((config) => {
                    const card = createCard(config);
                    configGrid.append(card);
                    attachCopyHandlers(card);
                });
            } else {
                sessionStorage.removeItem(LOGIN_KEY)
                lockInterface()
            }
        })
        .catch(function (error) {
            console.log(error);
            sessionStorage.removeItem(LOGIN_KEY)
            lockInterface()
        });
}






