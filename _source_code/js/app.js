const translations = {
    "en": {
        "checker": "Checker",
        "split_gmail": "Split Gmail",
        "2fa_tool": "2FA Tool",
        "notepad": "Notepad+",
        "subtitle": "Check your Google accounts for abnormalities without passwords. Safe, fast, and convenient.",
        "account_list": "Account List",
        "helper_text_1": "One account per line, ",
        "helper_text_2": "NO PASSWORD REQUIRED",
        "helper_text_3": ". For convenience, characters after @gmail.com in each line will be ignored automatically.",
        "split_tool_msg": "Can't separate Gmails and Password?",
        "split_tool_link": "Use our Split Email Tool",
        "upload_text": "Click or Drop TXT File",
        "supports_large": "Supports larger lists",
        "checking_speed": "CHECKING SPEED",
        "slow_mode": "Slow (Realtime)",
        "fast_mode": "Fast (Turbo)",
        "check_btn": "Check Accounts",
        "results": "Results",
        "detailed_log": "Detailed Log",
        "good": "Good / Live",
        "verified": "Verified",
        "disabled": "Disabled",
        "not_exist": "Not Exist",
        "unknown": "Unknown",
        "total": "Total",
        "checked": "Checked",
        "remaining": "Remaining",
        "how_to_use": "How to use",
        "support": "Support",
        "email_col": "Email",
        "status_col": "Status",
        "toast_upload_ok": "File uploaded successfully",
        "toast_upload_err": "Please upload a valid .txt file",
        "toast_no_accts": "Please enter at least one email address",
        "toast_check_ok": "Checked accounts successfully",
        "toast_copy": "Copied to clipboard",
        "toast_no_data": "No accounts found"
    },
    "zh": {
        "checker": "检查器",
        "split_gmail": "分割 Gmail",
        "2fa_tool": "2FA 工具",
        "notepad": "记事本+",
        "subtitle": "检查您的 Google 帐户是否有异常，无需密码。安全，快速，方便。",
        "account_list": "帐户列表",
        "helper_text_1": "每行一个帐户，",
        "helper_text_2": "无需密码",
        "helper_text_3": "。为了方便起见，每行 @gmail.com 之后的字符将被自动忽略。",
        "split_tool_msg": "无法分离 Gmail 和密码？",
        "split_tool_link": "使用我们的邮件分割工具",
        "upload_text": "点击或拖存 TXT 文件",
        "supports_large": "支持大列表",
        "checking_speed": "检查速度",
        "slow_mode": "慢速 (实时)",
        "fast_mode": "快速 (极速)",
        "check_btn": "开始检查",
        "results": "结果",
        "detailed_log": "详细日志",
        "good": "正常 / 存活",
        "verified": "验证中",
        "disabled": "已禁用",
        "not_exist": "不存在",
        "unknown": "未知",
        "total": "总计",
        "checked": "已检查",
        "remaining": "剩余",
        "how_to_use": "如何使用",
        "support": "支持",
        "email_col": "邮箱",
        "status_col": "状态",
        "toast_upload_ok": "文件上传成功",
        "toast_upload_err": "请上传有效的 .txt 文件",
        "toast_no_accts": "请输入至少一个电子邮件地址",
        "toast_check_ok": "帐户检查成功",
        "toast_copy": "已复制到剪贴板",
        "toast_no_data": "未找到帐户"
    },
    "ru": {
        "checker": "Чекер",
        "split_gmail": "Разделить Gmail",
        "2fa_tool": "2FA Инструмент",
        "notepad": "Блокнот+",
        "subtitle": "Проверьте свои аккаунты Google на наличие аномалий без пароля. Безопасно, быстро и удобно.",
        "account_list": "Список аккаунтов",
        "helper_text_1": "Один аккаунт на строку, ",
        "helper_text_2": "ПАРОЛЬ НЕ ТРЕБУЕТСЯ",
        "helper_text_3": ". Для удобства символы после @gmail.com в каждой строке будут игнорироваться автоматически.",
        "split_tool_msg": "Не удается разделить Gmail и пароль?",
        "split_tool_link": "Используйте наш инструмент разделения",
        "upload_text": "Загрузить TXT файл",
        "supports_large": "Поддержка больших списков",
        "checking_speed": "СКОРОСТЬ ПРОВЕРКИ",
        "slow_mode": "Медленно (В реальном времени)",
        "fast_mode": "Быстро (Турбо)",
        "check_btn": "Проверить аккаунты",
        "results": "Результаты",
        "detailed_log": "Подробный журнал",
        "good": "Хороший / Живой",
        "verified": "Подтвержден",
        "disabled": "Отключен",
        "not_exist": "Не существует",
        "unknown": "Неизвестный",
        "total": "Всего",
        "checked": "Проверено",
        "remaining": "Осталось",
        "how_to_use": "Как использовать",
        "support": "Поддержка",
        "email_col": "Email",
        "status_col": "Статус",
        "toast_upload_ok": "Файл успешно загружен",
        "toast_upload_err": "Пожалуйста, загрузите действительный .txt файл",
        "toast_no_accts": "Пожалуйста, введите хотя бы один адрес электронной почты",
        "toast_check_ok": "Аккаунты успешно проверены",
        "toast_copy": "Скопировано в буфер обмена",
        "toast_no_data": "Аккаунты не найдены"
    }
};

document.addEventListener('DOMContentLoaded', () => {
    // 1. Theme Logic
    const themeBtn = document.getElementById('themeBtn');
    const storedTheme = localStorage.getItem('theme') || 'light';

    // Apply initial theme
    document.body.setAttribute('data-theme', storedTheme);
    updateThemeIcon(storedTheme);

    themeBtn?.addEventListener('click', () => {
        const current = document.body.getAttribute('data-theme');
        const next = current === 'light' ? 'dark' : 'light';
        document.body.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);
        updateThemeIcon(next);
    });

    function updateThemeIcon(mode) {
        if (!themeBtn) return;
        themeBtn.innerHTML = mode === 'light'
            ? '<i class="fas fa-moon"></i>'
            : '<i class="fas fa-sun"></i>';
    }

    // 2. Language Logic
    const langSelect = document.getElementById('langSelect');
    const storedLang = localStorage.getItem('lang') || 'en';

    if (langSelect) {
        langSelect.value = storedLang;
        applyLanguage(storedLang);

        langSelect.addEventListener('change', (e) => {
            const lang = e.target.value;
            localStorage.setItem('lang', lang);
            applyLanguage(lang);
        });
    }

    // 3. active Link
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-link').forEach(link => {
        if (link.getAttribute('href') === currentPath) {
            link.classList.add('active');
        }
    });
});

function applyLanguage(lang) {
    const dict = translations[lang] || translations['en'];
    // Update simple data-i18n attributes
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (dict[key]) {
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                el.placeholder = dict[key];
            } else {
                el.textContent = dict[key];
            }
        }
    });

    // Special fix for helper text which contains HTML/Spans
    // We handle complex structures manually if needed, or structured differently
    // For now simple text replacement works for most.
}

window.getMsg = function (key) {
    const lang = localStorage.getItem('lang') || 'en';
    return (translations[lang] && translations[lang][key]) || translations['en'][key];
};

window.showToast = function (messageKey, type = 'success') {
    // Attempt to translate messageKey, if not found use it as is
    const msg = window.getMsg(messageKey) || messageKey;

    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.style.cssText = `
            position: fixed;
            top: 80px;
            right: 24px;
            z-index: 3000;
            display: flex;
            flex-direction: column;
            gap: 10px;
        `;
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    const colors = {
        success: '#34C759',
        error: '#FF3B30',
        info: '#007AFF',
        warning: '#FF9500'
    };

    toast.style.cssText = `
        background: ${colors[type] || colors.info};
        color: white;
        padding: 12px 24px;
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        font-weight: 500;
        min-width: 250px;
        animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        display: flex;
        align-items: center;
        gap: 8px;
    `;

    const icon = type === 'success' ? 'check-circle' : (type === 'error' ? 'exclamation-circle' : 'info-circle');
    toast.innerHTML = `<i class="fas fa-${icon}"></i> ${msg}`;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'fadeOut 0.3s forwards';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
};

// Keyframes
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
    @keyframes fadeOut { to { opacity: 0; transform: translateY(-10px); } }
`;
document.head.appendChild(style);
