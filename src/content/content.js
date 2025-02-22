// משתנה גלובלי לשמירת אובייקט זיהוי הדיבור
let recognition = null;
let recordingIndicator = null;

// פונקציה ליצירת אינדיקטור ההקלטה
function createRecordingIndicator() {
    if (!recordingIndicator) {
        recordingIndicator = document.createElement('div');
        recordingIndicator.className = 'voice-input-indicator';
        recordingIndicator.textContent = 'מקליט...';
        document.body.appendChild(recordingIndicator);
    }
}

// פונקציות להצגה והסתרה של האינדיקטור
function showRecordingIndicator() {
    createRecordingIndicator();
    recordingIndicator.style.display = 'block';
}

function hideRecordingIndicator() {
    if (recordingIndicator) {
        recordingIndicator.style.display = 'none';
    }
}

// פונקציה ליצירת אובייקט זיהוי דיבור
function createSpeechRecognition() {
    try {
        if (!('webkitSpeechRecognition' in window)) {
            throw new Error('הדפדפן אינו תומך בזיהוי דיבור');
        }

        recognition = new webkitSpeechRecognition();
        recognition.lang = 'he-IL';
        recognition.interimResults = false;

        // הוספת אירועים להתחלת וסיום הקלטה
        recognition.onstart = () => {
            showRecordingIndicator();
        };

        recognition.onend = () => {
            hideRecordingIndicator();
        };

        recognition.onerror = (event) => {
            hideRecordingIndicator();
            reportError('שגיאה בזיהוי דיבור', event.error);
        };

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

    } catch (error) {
        console.error('שגיאה ביצירת זיהוי דיבור:', error);
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