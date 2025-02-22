// טעינת לוג השגיאות בעת פתיחת החלון הקופץ
document.addEventListener('DOMContentLoaded', () => {
    const errorLogElement = document.getElementById('errorLog');

    // בקשת לוג השגיאות מ-background script
    chrome.runtime.sendMessage({ type: "getErrorLogs" }, (response) => {
        if (response && response.errorLogs) {
            if (response.errorLogs.length === 0) {
                errorLogElement.innerHTML = '<div>אין שגיאות לתצוגה</div>';
                return;
            }

            // הצגת השגיאות בסדר כרונולוגי הפוך
            errorLogElement.innerHTML = response.errorLogs.reverse()
                .map(error => `
                    <div class="error-entry">
                        <div class="timestamp">${error.timestamp}</div>
                        <div class="error-context">${error.context || ''}</div>
                        <div class="error-message">${error.message}</div>
                        ${error.url ? `<div class="error-url">URL: ${error.url}</div>` : ''}
                    </div>
                `).join('');
        } else {
            errorLogElement.innerHTML = '<div>שגיאה בטעינת הלוג</div>';
        }
    });
}); 