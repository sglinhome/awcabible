document.addEventListener('DOMContentLoaded', async () => {
    try {
        await UI.initialize();

        // 自动刷新（每分钟）
        setInterval(() => {
            UI.refreshUsers();
        }, 60000);

    } catch (error) {
        UI.showError('初始化应用失败: ' + error.message);
    }
});