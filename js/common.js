// Shared functionality for all pages
async function loadSiteSettings() {
    try {
        const res = await fetch('/api/system', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'get_settings' })
        });
        if (res.ok) {
            const settings = await res.json();
            const leftImg = document.querySelector('.ad-left img');
            const leftLink = document.querySelector('.ad-left a');
            const rightImg = document.querySelector('.ad-right img');
            const rightLink = document.querySelector('.ad-right a');

            if (settings.banner_left_img && leftImg) leftImg.src = settings.banner_left_img;
            if (settings.banner_left_link && leftLink) leftLink.href = settings.banner_left_link;
            if (settings.banner_right_img && rightImg) rightImg.src = settings.banner_right_img;
            if (settings.banner_right_link && rightLink) rightLink.href = settings.banner_right_link;
        }
    } catch (e) {
        console.error('Failed to load site settings:', e);
    }
}

// Run on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadSiteSettings);
} else {
    loadSiteSettings();
}
