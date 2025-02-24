const utils = {
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    formatDate(date) {
        const d = new Date(date);
        return d.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    },

    calculateStatistics(users) {
        const totalUsers = users.length;
        const readUsers = users.filter(u => u.isRead).length;
        const unreadUsers = totalUsers - readUsers;
        const percentage = ((readUsers / totalUsers) * 100).toFixed(1);

        return {
            totalUsers,
            readUsers,
            unreadUsers,
            percentage
        };
    },

    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (error) {
            console.error('复制到剪贴板失败:', error);
            return false;
        }
    },

    validateUserName(name) {
        return name && name.trim().length >= 2 && name.trim().length <= 20;
    }
};
