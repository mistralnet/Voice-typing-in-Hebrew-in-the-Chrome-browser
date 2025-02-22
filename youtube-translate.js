/**
 * תוסף תרגום אוטומטי לסרטוני יוטיוב - גרסה 3.2
 * מטרת התוסף: הוספת כפתור תרגום אוטומטי לעברית בממשק יוטיוב
 * 
 * עדכונים בגרסה 3.2:
 * - הוספת כפתור מנעול לשליטה על הזזת הכפתור
 * - שיפור מערכת הגרירה עם הגבלות לגבולות הנגן
 * - שינוי צבעים: ירוק למצב כבוי, כחול למצב פעיל
 * - הוספת אנימציות ואפקטים חלקים
 * - שיפור המשוב הויזואלי למשתמש
 */

/**
 * מאזין לטעינת דף חדש ביוטיוב
 * מופעל בכל מעבר דף או טעינת סרטון חדש
 */
document.addEventListener('yt-navigate-finish', () => {
    if (window.location.pathname.includes('/watch')) {
        setTimeout(createTranslateButton, 1000);
    }
});

function createTranslateButton() {
    if (document.querySelector('.translate-container')) return;

    const container = document.createElement('div');
    container.className = 'translate-container';
    container.style.cssText = `
        position: absolute;
        bottom: 70px;
        left: 50%;
        transform: translateX(-50%);
        display: flex;
        gap: 10px;
        z-index: 9999;
        padding: 5px;
        background: rgba(0, 0, 0, 0.1);
        border-radius: 6px;
        align-items: center;
    `;

    // כפתור המנעול
    const lockButton = document.createElement('button');
    lockButton.innerHTML = '🔒'; // מנעול נעול כברירת מחדל
    lockButton.style.cssText = `
        padding: 4px;
        background: none;
        border: none;
        cursor: pointer;
        font-size: 16px;
        opacity: 0.7;
        transition: all 0.3s;
        margin-right: 5px;
    `;
    lockButton.title = 'לחץ כדי לאפשר/למנוע הזזה';

    const translateButton = document.createElement('button');
    translateButton.innerHTML = '🌐 תרגום אוטומטי';
    translateButton.style.cssText = `
        padding: 8px 16px;
        background: #4CAF50;  // ירוק כשלא פעיל
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        transition: all 0.3s;
        display: flex;
        align-items: center;
        gap: 5px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    `;

    let isActive = false;

    translateButton.addEventListener('click', (e) => {
        e.stopPropagation();
        isActive = !isActive;
        if (isActive) {
            translateButton.style.background = '#2196F3';  // כחול כשפעיל
            translateButton.style.boxShadow = '0 2px 8px rgba(33,150,243,0.5)';  // צל כחול
            translateButton.innerHTML = '✓ תרגום פעיל';
            translateButton.style.transform = 'scale(1.05)';
            activateTranslation();
        } else {
            translateButton.style.background = '#4CAF50';  // חזרה לירוק
            translateButton.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
            translateButton.innerHTML = '🌐 תרגום אוטומטי';
            translateButton.style.transform = 'scale(1)';
            deactivateTranslation();
        }
    });

    // אפקטי hover
    translateButton.addEventListener('mouseover', () => {
        translateButton.style.transform = isActive ? 'scale(1.05)' : 'scale(1.02)';
        translateButton.style.opacity = '0.9';
    });
    translateButton.addEventListener('mouseout', () => {
        translateButton.style.transform = isActive ? 'scale(1.05)' : 'scale(1)';
        translateButton.style.opacity = '1';
    });

    // מצב הנעילה
    let isDraggable = false;
    let isDragging = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;

    // טוגל מצב נעילה
    lockButton.addEventListener('click', (e) => {
        e.stopPropagation();
        isDraggable = !isDraggable;
        lockButton.innerHTML = isDraggable ? '🔓' : '🔒';
        container.style.cursor = isDraggable ? 'move' : 'default';
        container.style.background = isDraggable ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.1)';
        lockButton.title = isDraggable ? 'לחץ לנעילת המיקום' : 'לחץ לאפשר הזזה';
        lockButton.style.opacity = isDraggable ? 1 : 0.7;
    });

    // אפקט hover למנעול
    lockButton.addEventListener('mouseover', () => {
        lockButton.style.transform = 'scale(1.1)';
        lockButton.style.opacity = 1;
    });
    lockButton.addEventListener('mouseout', () => {
        lockButton.style.transform = 'scale(1)';
        lockButton.style.opacity = isDraggable ? 1 : 0.7;
    });

    container.addEventListener('mousedown', (e) => {
        if (!isDraggable) return; // בודק אם הגרירה מותרת
        isDragging = true;
        container.style.transition = 'none';
        
        const rect = container.getBoundingClientRect();
        initialX = e.clientX - rect.left;
        initialY = e.clientY - rect.top;
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging || !isDraggable) return;
        e.preventDefault();
        
        const videoPlayer = document.querySelector('.html5-video-player');
        if (!videoPlayer) return;
        
        const playerRect = videoPlayer.getBoundingClientRect();
        
        currentX = e.clientX - initialX - playerRect.left;
        currentY = e.clientY - initialY - playerRect.top;

        currentX = Math.max(10, Math.min(currentX, playerRect.width - container.offsetWidth - 10));
        currentY = Math.max(10, Math.min(currentY, playerRect.height - container.offsetHeight - 10));

        container.style.left = `${currentX}px`;
        container.style.top = `${currentY}px`;
        container.style.transform = 'none';
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
        container.style.transition = 'all 0.3s';
    });

    // הוספת הכפתורים למיכל
    container.appendChild(lockButton);
    container.appendChild(translateButton);

    const videoPlayer = document.querySelector('.html5-video-player');
    if (videoPlayer) {
        videoPlayer.appendChild(container);
    }
}

function activateTranslation() {
    try {
        const subtitlesBtn = document.querySelector('.ytp-subtitles-button');
        const settingsBtn = document.querySelector('.ytp-settings-button');
        
        if (!subtitlesBtn || !settingsBtn) return;

        subtitlesBtn.click();
        setTimeout(() => {
            settingsBtn.click();
            setTimeout(() => {
                const menuItems = document.querySelectorAll('.ytp-menuitem');
                const hebrewOption = Array.from(menuItems)
                    .find(item => item.textContent.includes('עברית'));
                hebrewOption?.click();
            }, 200);
        }, 200);
    } catch (error) {
        console.error('שגיאה בהפעלת התרגום:', error);
    }
}

function deactivateTranslation() {
    try {
        const subtitlesBtn = document.querySelector('.ytp-subtitles-button');
        if (subtitlesBtn) {
            subtitlesBtn.click();
        }
    } catch (error) {
        console.error('שגיאה בכיבוי התרגום:', error);
    }
}

// מאזין לטעינת דף חדש
document.addEventListener('yt-navigate-finish', () => {
    if (window.location.pathname.includes('/watch')) {
        setTimeout(createTranslateButton, 1000);
    }
});