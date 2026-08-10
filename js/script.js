const body = document.body;
const themeToggle = document.querySelector('.theme-toggle');
const menuToggle = document.querySelector('.menu-toggle');
const siteNav = document.querySelector('.site-nav');
const header = document.querySelector('.site-header');

// Theme preference with a system fallback.
const savedTheme = localStorage.getItem('theme');
const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
if (savedTheme === 'light' || (!savedTheme && prefersLight)) body.classList.add('light-mode');

function updateThemeButton() {
    const isLight = body.classList.contains('light-mode');
    themeToggle?.setAttribute('aria-pressed', String(isLight));
    themeToggle?.setAttribute('aria-label', isLight ? 'Switch to dark mode' : 'Switch to light mode');
}

themeToggle?.addEventListener('click', () => {
    body.classList.toggle('light-mode');
    localStorage.setItem('theme', body.classList.contains('light-mode') ? 'light' : 'dark');
    updateThemeButton();
});
updateThemeButton();

function closeMenu() {
    siteNav?.classList.remove('is-open');
    menuToggle?.classList.remove('is-open');
    menuToggle?.setAttribute('aria-expanded', 'false');
    menuToggle?.setAttribute('aria-label', 'Open menu');
}

menuToggle?.addEventListener('click', () => {
    const isOpen = siteNav.classList.toggle('is-open');
    menuToggle.classList.toggle('is-open', isOpen);
    menuToggle.setAttribute('aria-expanded', String(isOpen));
    menuToggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
});

siteNav?.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));

// Lightweight image preview for the strongest project visuals.
const imageModal = document.querySelector('.image-modal');
const modalImage = imageModal?.querySelector('img');
const modalCaption = imageModal?.querySelector('p');
const modalClose = imageModal?.querySelector('.modal-close');
const imageButtons = document.querySelectorAll('.image-expand');
let lastModalTrigger = null;

function closeImageModal() {
    if (!imageModal) return;
    const shouldRestoreFocus = !imageModal.hidden;
    imageModal.hidden = true;
    modalImage?.removeAttribute('src');
    body.classList.remove('modal-open');
    if (shouldRestoreFocus && lastModalTrigger) lastModalTrigger.focus();
}

imageButtons.forEach((button) => button.addEventListener('click', () => {
    if (!imageModal || !modalImage) return;
    lastModalTrigger = button;
    modalImage.src = button.dataset.image;
    modalImage.alt = button.dataset.title || 'Project image preview';
    if (modalCaption) modalCaption.textContent = button.dataset.title || '';
    imageModal.hidden = false;
    body.classList.add('modal-open');
    modalClose?.focus();
}));
modalClose?.addEventListener('click', closeImageModal);
imageModal?.addEventListener('click', (event) => {
    if (event.target === imageModal) closeImageModal();
});
document.addEventListener('keydown', (event) => {
    if (event.key === 'Tab' && imageModal && !imageModal.hidden) {
        const focusableElements = imageModal.querySelectorAll('button, [href], [tabindex]:not([tabindex="-1"])');
        const firstFocusable = focusableElements[0];
        const lastFocusable = focusableElements[focusableElements.length - 1];

        if (firstFocusable && lastFocusable) {
            if (event.shiftKey && document.activeElement === firstFocusable) {
                event.preventDefault();
                lastFocusable.focus();
            } else if (!event.shiftKey && document.activeElement === lastFocusable) {
                event.preventDefault();
                firstFocusable.focus();
            }
        }
    }

    if (event.key === 'Escape') {
        closeImageModal();
        closeMenu();
    }
});

// Reveal content progressively, while keeping it visible if observers are unsupported.
const animatedElements = document.querySelectorAll('.animate-on-scroll');
if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, currentObserver) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('show');
                currentObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12 });
    animatedElements.forEach((element) => observer.observe(element));
} else {
    animatedElements.forEach((element) => element.classList.add('show'));
}

// Close the mobile menu when the viewport becomes desktop-sized.
const desktopMediaQuery = window.matchMedia('(min-width: 721px)');
if (desktopMediaQuery.addEventListener) {
    desktopMediaQuery.addEventListener('change', closeMenu);
} else if (desktopMediaQuery.addListener) {
    desktopMediaQuery.addListener(closeMenu);
}

// Add a subtle separation once the page starts moving.
let ticking = false;
function updateHeader() {
    const currentScrollY = window.scrollY;
    header?.classList.toggle('scrolled', currentScrollY > 12);
    ticking = false;
}
window.addEventListener('scroll', () => {
    if (!ticking) {
        window.requestAnimationFrame(updateHeader);
        ticking = true;
    }
}, { passive: true });
