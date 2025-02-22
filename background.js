// מערך לשמירת לוג השגיאות
let errorLogs = [];

// פונקציה להוספת שגיאה ללוג
function addErrorLog(error) {
    const errorLog = {
        timestamp: new Date().toLocaleString('he-IL'),
        message: error.message || error,
        stack: error.stack || ''
    };
    errorLogs.push(errorLog);
    // שמור מקסימום 100 שגיאות אחרונות
    if (errorLogs.length > 100) {
        errorLogs.shift();
    }
    // שמור את הלוג ב-storage
    chrome.storage.local.set({ errorLogs: errorLogs });
}

// יצירת תפריט הקליק הימני
chrome.runtime.onInstalled.addListener(() => {
    try {
        chrome.contextMenus.create({
            id: "voiceInput",
            title: "הקלדה קולית",
            contexts: ["editable"]
        });
    } catch (error) {
        addErrorLog(error);
    }
});

// טיפול בלחיצה על תפריט ההקלדה הקולית
chrome.contextMenus.onClicked.addListener((info, tab) => {
    try {
        if (info.menuItemId === "voiceInput") {
            // בדיקה שהטאב קיים ופעיל
            if (tab && tab.id) {
                chrome.tabs.sendMessage(tab.id, { action: "startVoiceInput" })
                .catch(error => {
                    // אם התוסף לא נטען עדיין, נטען אותו מחדש
                    chrome.tabs.reload(tab.id);
                });
            }
        }
    } catch (error) {
        addErrorLog(error);
    }
});

// האזנה להודעות שגיאה מ-content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "error") {
        addErrorLog(message.error);
    }
    if (message.type === "getErrorLogs") {
        sendResponse({ errorLogs: errorLogs });
    }
    return true;
}); 