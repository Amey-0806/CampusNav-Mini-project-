document.fonts.ready.then(function () {
    runAnimation();
});

// Fallback: also run on DOMContentLoaded in case fonts.ready never resolves
document.addEventListener('DOMContentLoaded', function () {
    runAnimation();
});

function runAnimation() {
    var title = document.querySelector('.article-title');
    if (!title || title.dataset.animated) return;
    title.dataset.animated = 'true';

    var text = title.textContent;
    title.textContent = '';
    title.setAttribute('aria-label', text);

    // Wrap each character in a span
    var frag = document.createDocumentFragment();
    for (var i = 0; i < text.length; i++) {
        var span = document.createElement('span');
        span.className = 'char';
        span.textContent = text[i];
        span.style.animationDelay = (i * 0.05) + 's';
        frag.appendChild(span);
    }
    title.appendChild(frag);

    // Trigger split animation
    requestAnimationFrame(function () {
        title.classList.add('animate');
    });

    // After title animation completes, fade in other elements
    var totalDelay = text.length * 0.05 * 1000 + 750;
    var logoImg = document.querySelector('.logo-box img');
    var subtitle = document.querySelector('.article-subtitle');
    var byline = document.querySelector('.article-byline');
    var divider1 = document.querySelector('.article-divider');
    var sections = document.querySelectorAll('.article-section');
    var footer = document.querySelector('.article-footer');

    setTimeout(function () {
        if (logoImg) logoImg.classList.add('visible');
    }, totalDelay);

    setTimeout(function () {
        if (subtitle) subtitle.classList.add('visible');
    }, totalDelay + 100);

    setTimeout(function () {
        if (byline) byline.classList.add('visible');
    }, totalDelay + 200);

    setTimeout(function () {
        if (divider1) divider1.classList.add('visible');
    }, totalDelay + 300);

    setTimeout(function () {
        sections.forEach(function (sec, idx) {
            setTimeout(function () {
                sec.classList.add('visible');
            }, idx * 150);
        });
    }, totalDelay + 400);

    setTimeout(function () {
        if (footer) footer.classList.add('visible');
    }, totalDelay + 400 + sections.length * 150 + 200);
}
