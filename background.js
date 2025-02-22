// ניהול לוג שגיאות
const MAX_LOGS = 100;
let errorLogs = [];

const addErrorLog = error => {
    errorLogs.unshift({
        timestamp: new Date().toLocaleString('he-IL'),
        message: error.message || error,
        stack: error.stack || ''
    });
    
    errorLogs = errorLogs.slice(0, MAX_LOGS);
    chrome.storage.local.set({ errorLogs });
};

// הגדרת תפריט הקליק הימני
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