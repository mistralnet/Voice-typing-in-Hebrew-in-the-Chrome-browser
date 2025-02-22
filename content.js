// משתנה גלובלי לשמירת אובייקט זיהוי הדיבור
let recognition = null;

// פונקציה ליצירת אובייקט זיהוי דיבור
function createSpeechRecognition() {
    try {
        if (!('webkitSpeechRecognition' in window)) {
            throw new Error('הדפדפן אינו תומך בזיהוי דיבור');
        }

        recognition = new webkitSpeechRecognition();
        recognition.lang = 'he-IL';
        recognition.interimResults = false;

        // טיפול בתוצאות זיהוי הדיבור
        recognition.onresult = (event) => {
            try {
                const transcript = event.results[0][0].transcript;
                if (activeElement && activeElement.isContentEditable) {
                    activeElement.textContent += transcript;
                } else if (activeElement instanceof HTMLInputElement || 
                          activeElement instanceof HTMLTextAreaElement) {
                    activeElement.value += transcript;
                }
            } catch (error) {
                reportError('שגיאה בעת עיבוד תוצאות הדיבור', error);
            }
        };

        // טיפול בשגיאות זיהוי דיבור
        recognition.onerror = (event) => {
            reportError('שגיאה בזיהוי דיבור', event.error);
        };

    } catch (error) {
        reportError('שגיאה ביצירת מזהה הדיבור', error);
    }
}

// שמירת האלמנט הפעיל הנוכחי
let activeElement = null;

// האזנה לאירועי focus כדי לעקוב אחרי האלמנט הפעיל
document.addEventListener('focus', (event) => {
    try {
        if (event.target.isContentEditable || 
            event.target instanceof HTMLInputElement || 
            event.target instanceof HTMLTextAreaElement) {
            activeElement = event.target;
        }
    } catch (error) {
        reportError('שגיאה בטיפול באירוע focus', error);
    }
}, true);

// פונקציה לדיווח על שגיאות ל-background script
function reportError(context, error) {
    const errorDetails = {
        context: context,
        message: error.message || error,
        timestamp: new Date().toISOString(),
        url: window.location.href
    };
    
    chrome.runtime.sendMessage({
        type: "error",
        error: errorDetails
    });
}

// הודעה לbackground script שה-content script נטען
chrome.runtime.sendMessage({ type: "contentScriptLoaded" });

// האזנה להודעות מ-background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    try {
        if (message.action === "startVoiceInput") {
            if (!recognition) {
                createSpeechRecognition();
            }
            recognition.start();
        }
    } catch (error) {
        reportError('שגיאה בטיפול בהודעה מ-background script', error);
    }
}); 