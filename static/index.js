"use strict";

const configGrid = document.getElementById("configGrid");
const loginScreen = document.getElementById("loginScreen");
const appShell = document.getElementById("appShell");
const loginForm = document.getElementById("loginForm");
const loginMessage = document.getElementById("loginMessage");
const logoutBtn = document.getElementById("logoutBtn");
const tabButtons = document.querySelectorAll(".tab-btn");
const addConfigBtn = document.getElementById("addConfigBtn");
const addConfigModal = document.getElementById("addConfigModal");
const addConfigForm = document.getElementById("addConfigForm");
const configHintCopyBtn = document.querySelector(".config-hint__copy-btn");
const configHintCode = document.querySelector(".config-hint__code");
const CONFIG_HINT_COPY_DEFAULT_ICON = configHintCopyBtn?.innerHTML ?? "";
const CONFIG_HINT_COPY_DEFAULT_LABEL = configHintCopyBtn?.getAttribute("aria-label") ?? "复制命令";
const CONFIG_HINT_COPY_SUCCESS_ICON = `
    <svg class="config-hint__copy-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M3.5 8.2L6.3 11l6.2-6.2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"></path>
    </svg>
`;
const CONFIG_HINT_COPY_ERROR_ICON = `
    <svg class="config-hint__copy-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.3"></circle>
        <path d="M6 6l4 4M10 6l-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
    </svg>
`;
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

function createCard({id, name, url, baseUrl, token, status}) {
    const card = document.createElement("article");
    card.className = "config-card";
    if (id !== undefined && id !== null) {
        card.dataset.configId = String(id);
    }
    const inferredStatus = normalizeStatus(status);
    if (inferredStatus !== null) {
        card.dataset.status = String(inferredStatus);
        card.classList.add(inferredStatus ? "config-card--status-true" : "config-card--status-false");
    }
    card.innerHTML = `
        <button class="status-toggle-btn" type="button" aria-label="修改状态">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                <path d="M9 16c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7Z" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M9 5v4l2.5 2.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        </button>
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
    if (id !== undefined && id !== null) {
        const hiddenId = document.createElement("span");
        hiddenId.className = "config-id";
        hiddenId.textContent = String(id);
        hiddenId.hidden = true;
        card.append(hiddenId);
    }
    const statusButton = card.querySelector(".status-toggle-btn");
    if (statusButton) {
        statusButton.addEventListener("click", () => {
            const configId = card.dataset.configId ?? card.querySelector(".config-id")?.textContent ?? "";
            if (!configId) {
                console.warn("未找到对应的配置 ID", {name, url});
                return;
            }
            axios.post('/api/config/update', {
                id: configId
            }, {
                headers: {
                    'codex-token': sessionStorage.getItem(TOKEN_KEY)
                }
            })
                .then(function (response) {
                    if (response.data.status === 200) {
                        Notiflix.Notify.success('更新成功');
                        setTimeout(function () {
                            loadData()
                        }, 1000)
                    } else {
                        Notiflix.Notify.failure('更新失败');
                    }
                })
                .catch(function (error) {
                    Notiflix.Notify.failure('更新失败：' + error);
                });
        });
    }
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

configHintCopyBtn?.addEventListener("click", async () => {
    if (!configHintCode) {
        return;
    }
    const command = configHintCode.textContent.trim();
    configHintCopyBtn.disabled = true;
    try {
        await copyText(command);
        configHintCopyBtn.innerHTML = CONFIG_HINT_COPY_SUCCESS_ICON;
        configHintCopyBtn.setAttribute("aria-label", "复制成功");
        configHintCopyBtn.classList.add("config-hint__copy-btn--copied");
    } catch (error) {
        console.error("Copy command failed", error);
        configHintCopyBtn.innerHTML = CONFIG_HINT_COPY_ERROR_ICON;
        configHintCopyBtn.setAttribute("aria-label", "复制失败");
        configHintCopyBtn.classList.remove("config-hint__copy-btn--copied");
    } finally {
        setTimeout(() => {
            configHintCopyBtn.innerHTML = CONFIG_HINT_COPY_DEFAULT_ICON;
            configHintCopyBtn.setAttribute("aria-label", CONFIG_HINT_COPY_DEFAULT_LABEL);
            configHintCopyBtn.classList.remove("config-hint__copy-btn--copied");
            configHintCopyBtn.disabled = false;
        }, 1600);
    }
});

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
    NProgress.start();
    axios.get('/api/codex_configs', {
        headers: {'codex-token': sessionStorage.getItem(TOKEN_KEY)}
    })
        .then(function (response) {
            if (response.data.status === 200) {
                if (configGrid) {
                    configGrid.innerHTML = "";
                }
                response.data.data.forEach((config) => {
                    const card = createCard(config);
                    configGrid.append(card);
                    attachCopyHandlers(card);
                });
                NProgress.done();
            } else {
                NProgress.done();
                sessionStorage.removeItem(LOGIN_KEY)
                lockInterface()
            }
        })
        .catch(function (error) {
            NProgress.done();
            console.log(error);
            sessionStorage.removeItem(LOGIN_KEY)
            lockInterface()
        });
}

function openAddConfigModal() {
    if (!addConfigModal) {
        return;
    }
    addConfigModal.hidden = false;
    addConfigModal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    const firstField = addConfigModal.querySelector("input, select, textarea");
    firstField?.focus();
}

function closeAddConfigModal() {
    if (!addConfigModal) {
        return;
    }
    addConfigModal.hidden = true;
    addConfigModal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
}

addConfigBtn?.addEventListener("click", () => {
    openAddConfigModal();
});

addConfigForm?.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(addConfigForm);
    const payload = {
        name: (formData.get("name") ?? "").trim(),
        url: (formData.get("url") ?? "").trim(),
        baseUrl: (formData.get("baseurl") ?? "").trim(),
        token: (formData.get("apitoken") ?? "").trim(),
        source: (formData.get("source") ?? "").trim(),
    };
    axios.post('/api/add/config', payload, {
        headers: {
            'codex-token': sessionStorage.getItem(TOKEN_KEY)
        }
    })
        .then(function (resp) {
            if (resp.data.status === 200) {
                Notiflix.Notify.success('添加成功');
                closeAddConfigModal();
                addConfigForm.reset();
                setTimeout(function () {
                    loadData()
                }, 1000)
            } else {
                Notiflix.Notify.failure('添加失败');
            }
        }).catch(function (error) {
        Notiflix.Notify.failure('添加失败: ' + error);
    });
});

(addConfigModal?.querySelectorAll("[data-modal-close]") ?? []).forEach((btn) => {
    btn.addEventListener("click", () => {
        closeAddConfigModal();
    });
});

addConfigModal?.addEventListener("click", (event) => {
    if (event.target === addConfigModal) {
        closeAddConfigModal();
    }
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && addConfigModal && !addConfigModal.hidden) {
        closeAddConfigModal();
    }
});
