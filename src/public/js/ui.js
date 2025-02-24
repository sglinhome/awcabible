class UI {
    static isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    static async initialize() {
        this.initializeEventListeners();
        await this.refreshUsers();
        await this.updateReadingPlan();
    }

    static initializeEventListeners() {
        // 添加用户按钮
        document.getElementById('addUserBtn').addEventListener('click', () => {
            document.getElementById('addUserModal').style.display = 'block';
            document.getElementById('userNames').focus();
        });

        // 添加用户表单
        document.getElementById('addUserForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const namesText = document.getElementById('userNames').value;
            const names = namesText.split(/[,\n]/).map(name => name.trim()).filter(Boolean);

            if (names.length === 0) {
                this.showError('请输入用户名');
                return;
            }

            try {
                await API.addUsers(names);
                document.getElementById('addUserModal').style.display = 'none';
                document.getElementById('userNames').value = '';
                await this.refreshUsers();
            } catch (error) {
                this.showError(error.message);
            }
        });

        // 取消添加用户
        document.getElementById('cancelAdd').addEventListener('click', () => {
            document.getElementById('addUserModal').style.display = 'none';
            document.getElementById('userNames').value = '';
        });

        // 发送统计
        document.getElementById('sendStatsBtn').addEventListener('click', async () => {
            try {
                const stats = document.getElementById('liveStatistics').textContent;
                if (!stats.trim()) {
                    this.showError('没有需要发送的统计信息');
                    return;
                }
                
                // 根据平台使用不同的复制方法
                if (this.isMobile) {
                    const textArea = document.createElement('textarea');
                    textArea.value = stats;
                    textArea.style.position = 'fixed';
                    textArea.style.opacity = '0';
                    document.body.appendChild(textArea);
                    textArea.focus();
                    textArea.select();
                    try {
                        document.execCommand('copy');
                        this.showError('统计信息已复制到剪贴板');
                    } catch (err) {
                        this.showError('复制失败，请手动复制');
                    }
                    document.body.removeChild(textArea);
                } else {
                    await navigator.clipboard.writeText(stats);
                }
                
                // 尝试发送到 WhatsApp
                await API.sendStatistics(stats);
                this.showError('统计信息已发送', 'green');
            } catch (error) {
                this.showError(error.message);
            }
        });

        // 点击空白处关闭模态框
        window.addEventListener('click', (e) => {
            const addModal = document.getElementById('addUserModal');
            const unreadModal = document.getElementById('unreadDaysModal');
            if (e.target === addModal) {
                addModal.style.display = 'none';
                document.getElementById('userNames').value = '';
            } else if (e.target === unreadModal) {
                unreadModal.style.display = 'none';
            }
        });
    }
    static createUserCard(user) {
        const card = document.createElement('div');
        card.className = `user-card ${user.frozen ? 'frozen' : (user.isRead ? 'read' : 'unread')}`;
        card.dataset.id = user.id;
        
        // 禁用文字选择
        card.style.cssText = `
            -webkit-touch-callout: none;
            -webkit-user-select: none;
            -khtml-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
            user-select: none;
            touch-action: manipulation;
        `;

        // 移动端处理
        if (this.isMobile) {
            let lastTap = 0;
            let touchStartTime = 0;
            let longPressTimer;
            let preventClick = false;
            let touchStartY = 0;
            let hasMoved = false;

            const handleDoubleTap = (e) => {
                e.preventDefault();  // 阻止默认行为
                e.stopPropagation(); // 阻止事件冒泡
                
                const now = Date.now();
                const DOUBLE_TAP_DELAY = 300;
                
                if (lastTap && (now - lastTap) < DOUBLE_TAP_DELAY) {
                    // 是双击
                    if (user.frozen) {
                        this.toggleUserFrozen(user);
                    } else {
                        this.handleUserStateChange(user);
                    }
                    lastTap = 0;
                } else {
                    lastTap = now;
                }
            };

            card.addEventListener('touchstart', (e) => {
                e.stopPropagation(); // 阻止事件冒泡
                touchStartTime = Date.now();
                touchStartY = e.touches[0].clientY;
                hasMoved = false;
                
                longPressTimer = setTimeout(() => {
                    if (!hasMoved) {
                        preventClick = true;
                        lastTap = 0; // 清除双击状态
                        // 创建自定义对话框
                        const dialogContainer = document.createElement('div');
                        dialogContainer.style.cssText = `
                            position: fixed;
                            top: 0;
                            left: 0;
                            right: 0;
                            bottom: 0;
                            background: rgba(0,0,0,0.5);
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            z-index: 1000;
                            -webkit-touch-callout: none;
                            -webkit-user-select: none;
                            user-select: none;
                            touch-action: none;
                        `;

                        const dialog = document.createElement('div');
                        dialog.style.cssText = `
                            background: white;
                            border-radius: 12px;
                            width: 80%;
                            max-width: 300px;
                            padding: 20px;
                            display: flex;
                            gap: 10px;
                            -webkit-touch-callout: none;
                            -webkit-user-select: none;
                            user-select: none;
                            touch-action: none;
                        `;

                        const deleteBtn = document.createElement('button');
                        deleteBtn.textContent = '删除用户';
                        deleteBtn.style.cssText = `
                            flex: 1;
                            padding: 10px;
                            border: none;
                            border-radius: 6px;
                            background: #f44336;
                            color: white;
                            font-size: 16px;
                            -webkit-touch-callout: none;
                            -webkit-user-select: none;
                            user-select: none;
                        `;

                        const freezeBtn = document.createElement('button');
                        freezeBtn.textContent = user.frozen ? '解冻用户' : '冻结用户';
                        freezeBtn.style.cssText = `
                            flex: 1;
                            padding: 10px;
                            border: none;
                            border-radius: 6px;
                            background: #2196F3;
                            color: white;
                            font-size: 16px;
                            -webkit-touch-callout: none;
                            -webkit-user-select: none;
                            user-select: none;
                        `;

                        deleteBtn.onclick = async () => {
                            dialogContainer.remove();
                            if (confirm(`确定要删除用户 "${user.name}" 吗？`)) {
                                await this.deleteUser(user.id);
                            }
                        };

                        freezeBtn.onclick = async () => {
                            dialogContainer.remove();
                            await this.toggleUserFrozen(user);
                        };

                        dialog.appendChild(deleteBtn);
                        dialog.appendChild(freezeBtn);
                        dialogContainer.appendChild(dialog);
                        document.body.appendChild(dialogContainer);

                        dialogContainer.addEventListener('touchstart', (e) => {
                            if (e.target === dialogContainer) {
                                e.preventDefault();
                                dialogContainer.remove();
                            }
                        });
                    }
                }, 500);
            });

            card.addEventListener('touchmove', (e) => {
                e.stopPropagation(); // 阻止事件冒泡
                const touchY = e.touches[0].clientY;
                const deltaY = Math.abs(touchY - touchStartY);
                
                if (deltaY > 10) {
                    hasMoved = true;
                    clearTimeout(longPressTimer);
                    lastTap = 0; // 清除双击状态
                }
            });

            card.addEventListener('touchend', (e) => {
                e.stopPropagation(); // 阻止事件冒泡
                clearTimeout(longPressTimer);
                
                const touchEndTime = Date.now();
                const touchDuration = touchEndTime - touchStartTime;

                if (!hasMoved && touchDuration < 500 && !preventClick) {
                    handleDoubleTap(e);
                }
                
                preventClick = false;
            });

            card.addEventListener('touchcancel', () => {
                clearTimeout(longPressTimer);
                preventClick = false;
                hasMoved = false;
                lastTap = 0; // 清除双击状态
            });

        } else {
            // PC端保持不变
            card.addEventListener('click', () => this.handleUserStateChange(user));
            card.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                this.showContextMenu(e, user);
            });
        }

        const name = document.createElement('span');
        name.textContent = user.name;
        name.style.cssText = `
            -webkit-touch-callout: none;
            -webkit-user-select: none;
            user-select: none;
        `;
        card.appendChild(name);

        if (!user.isRead && !user.frozen && user.unreadDays > 0) {
            const badge = document.createElement('div');
            badge.className = 'unread-badge';
            badge.textContent = user.unreadDays;
            card.appendChild(badge);
        }

        return card;
    }

    static async handleUserStateChange(user) {
        try {
            if (user.frozen) {
                return;
            } else if (user.isRead) {
                const days = await this.promptUnreadDays();
                if (days !== null) {
                    await API.updateUser(user.id, {
                        isRead: false,
                        unreadDays: days
                    });
                }
            } else {
                await API.updateUser(user.id, {
                    isRead: true,
                    unreadDays: 0
                });
            }
            await this.refreshUsers();
        } catch (error) {
            this.showError(error.message);
        }
    }

    static promptUnreadDays() {
        return new Promise((resolve) => {
            const modal = document.getElementById('unreadDaysModal');
            const input = document.getElementById('unreadDays');
            const confirmBtn = document.getElementById('confirmUnread');
            const cancelBtn = document.getElementById('cancelUnread');

            input.value = '1';
            modal.style.display = 'block';
            input.focus();
            input.select(); // 自动选中输入框中的文字

            // 每次点击输入框时也自动选中
            input.addEventListener('click', () => {
                input.select();
            });

            const handleConfirm = () => {
                const days = parseInt(input.value);
                if (days >= 1 && days <= 7) {
                    cleanup();
                    resolve(days);
                } else {
                    this.showError('请输入1-7之间的天数');
                }
            };

            const handleCancel = () => {
                cleanup();
                resolve(null);
            };

            const cleanup = () => {
                modal.style.display = 'none';
                confirmBtn.removeEventListener('click', handleConfirm);
                cancelBtn.removeEventListener('click', handleCancel);
                input.removeEventListener('click', handleClick);
                input.removeEventListener('keyup', handleKeyup);
            };

            // 处理输入框的回车键
            const handleKeyup = (e) => {
                if (e.key === 'Enter') {
                    handleConfirm();
                }
            };

            const handleClick = () => {
                input.select();
            };

            input.addEventListener('click', handleClick);
            input.addEventListener('keyup', handleKeyup);
            confirmBtn.addEventListener('click', handleConfirm);
            cancelBtn.addEventListener('click', handleCancel);
        });
    }

    static showContextMenu(e, user) {
        // 先移除可能存在的其他菜单
        const existingMenus = document.querySelectorAll('.context-menu');
        existingMenus.forEach(menu => menu.remove());

        // 移除可能存在的旧样式
        const existingStyles = document.querySelectorAll('style[data-context-menu]');
        existingStyles.forEach(style => style.remove());

        const menu = document.createElement('div');
        menu.className = 'context-menu';

        // 添加菜单样式
        const style = document.createElement('style');
        style.setAttribute('data-context-menu', '');
        style.textContent = `
            .context-menu {
                position: fixed;
                background: white;
                border: 1px solid #ccc;
                border-radius: 4px;
                box-shadow: 0 2px 5px rgba(0,0,0,0.2);
                padding: 5px 0;
                z-index: 1000;
            }
            .context-menu button {
                display: block;
                width: 100%;
                padding: 8px 15px;
                border: none;
                background: none;
                text-align: left;
                cursor: pointer;
                font-size: 14px;
                color: #333;
            }
            .context-menu button:hover {
                background-color: #f5f5f5;
            }
        `;
        document.head.appendChild(style);

        // 设置菜单位置
        menu.style.left = `${e.pageX}px`;
        menu.style.top = `${e.pageY}px`;

        // 创建菜单项
        const actions = [
            {
                text: user.frozen ? '解冻用户' : '冻结用户',
                action: async () => {
                    try {
                        await this.toggleUserFrozen(user);
                        menu.remove();
                    } catch (error) {
                        this.showError(error.message);
                    }
                }
            },
            {
                text: '删除用户',
                action: async () => {
                    if (confirm(`确定要删除用户 "${user.name}" 吗？`)) {
                        try {
                            await this.deleteUser(user.id);
                            menu.remove();
                        } catch (error) {
                            this.showError(error.message);
                        }
                    }
                }
            }
        ];

        // 添加菜单项
        actions.forEach(({text, action}) => {
            const button = document.createElement('button');
            button.textContent = text;
            button.onclick = action;
            menu.appendChild(button);
        });

        // 添加到文档
        document.body.appendChild(menu);

        // 调整菜单位置，确保不超出窗口
        const menuRect = menu.getBoundingClientRect();
        if (menuRect.right > window.innerWidth) {
            menu.style.left = `${window.innerWidth - menuRect.width - 5}px`;
        }
        if (menuRect.bottom > window.innerHeight) {
            menu.style.top = `${window.innerHeight - menuRect.height - 5}px`;
        }

        // 点击其他地方关闭菜单
        const closeMenu = (e) => {
            if (!menu.contains(e.target)) {
                menu.remove();
                style.remove();
                document.removeEventListener('click', closeMenu);
            }
        };

        // 使用 requestAnimationFrame 确保在下一帧添加事件监听器
        requestAnimationFrame(() => {
            document.addEventListener('click', closeMenu);
        });
    }

    static async toggleUserFrozen(user) {
        try {
            await API.updateUser(user.id, {
                frozen: !user.frozen,
                isRead: true,  // 解冻时设置为已读状态
                unreadDays: 0
            });
            await this.refreshUsers();
        } catch (error) {
            this.showError(error.message);
        }
    }

    static async deleteUser(userId) {
        try {
            await API.deleteUser(userId);
            await this.refreshUsers();
        } catch (error) {
            this.showError(error.message);
        }
    }

    static async refreshUsers() {
        try {
            const users = await API.getUsers();
            const sortedUsers = users.sort((a, b) => {
                if (a.frozen !== b.frozen) return a.frozen ? 1 : -1;
                if (!a.isRead && !b.isRead) return a.unreadDays - b.unreadDays;
                if (a.isRead !== b.isRead) return a.isRead ? 1 : -1;
                return a.name.localeCompare(b.name);
            });

            const container = document.getElementById('userCards');
            container.innerHTML = '';
            sortedUsers.forEach(user => {
                container.appendChild(this.createUserCard(user));
            });

            this.updateStatistics(sortedUsers);
        } catch (error) {
            this.showError(error.message);
        }
    }

    static async updateReadingPlan() {
        try {
            const response = await fetch('https://gist.githubusercontent.com/linbmv/8adb195011a6422d4ee40f773f32a8fa/raw/bible_reading_plan.txt');
            let text = await response.text();
            text = text.replace(/[\r\n]+/g, ' ').trim();
            document.getElementById('readingPlan').textContent = text;
        } catch (error) {
            console.error('获取读经计划失败:', error);
            document.getElementById('readingPlan').textContent = '获取读经计划失败';
        }
    }

    static updateStatistics(users) {
        let stats = '';
        
        // 今日未读
        const todayUnread = users.filter(u => !u.isRead && !u.frozen && u.unreadDays === 1)
            .map(u => `@${u.name}`).join(' ');
        if (todayUnread) stats += `${todayUnread}\n今日未读\n\n`;

        // 多日未读
        for (let days = 2; days <= 7; days++) {
            const daysUnread = users.filter(u => !u.isRead && !u.frozen && u.unreadDays === days)
                .map(u => `@${u.name}`).join(' ');
            if (daysUnread) stats += `${daysUnread}\n${days}日未读\n\n`;
        }

        document.getElementById('liveStatistics').textContent = stats;
    }

    static showError(message, color = 'white') {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        errorDiv.style.color = color;
        document.body.appendChild(errorDiv);
        
        setTimeout(() => {
            errorDiv.remove();
        }, 3000);
    }

    static showSuccess(message) {
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.textContent = message;
        successDiv.style.color = 'white';
        successDiv.style.backgroundColor = '#4CAF50';  // 绿色背景
        document.body.appendChild(successDiv);
        
        setTimeout(() => {
            successDiv.remove();
        }, 3000);
    }
}