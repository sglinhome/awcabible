const DatabaseService = require('../services/dbService');

class User {
    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.isRead = data.isRead === 1;
        this.unreadDays = data.unreadDays || 0;
        this.frozen = data.frozen === 1;
    }

    static async findAll() {
        try {
            const rows = await DatabaseService.all(
                'SELECT * FROM users ORDER BY frozen ASC, unreadDays DESC, name ASC'
            );
            return rows.map(row => new User(row));
        } catch (error) {
            throw new Error('获取用户列表失败: ' + error.message);
        }
    }

    static async findById(id) {
        try {
            const row = await DatabaseService.get('SELECT * FROM users WHERE id = ?', [id]);
            return row ? new User(row) : null;
        } catch (error) {
            throw new Error('获取用户失败: ' + error.message);
        }
    }

    async save() {
        try {
            if (this.id) {
                // 更新现有用户
                await DatabaseService.run(
                    `UPDATE users SET 
                    name = ?, 
                    isRead = ?, 
                    unreadDays = ?,
                    frozen = ?
                    WHERE id = ?`,
                    [
                        this.name,
                        this.isRead ? 1 : 0,
                        this.unreadDays,
                        this.frozen ? 1 : 0,
                        this.id
                    ]
                );
            } else {
                // 创建新用户
                const result = await DatabaseService.run(
                    `INSERT INTO users (name, isRead, unreadDays, frozen)
                    VALUES (?, ?, ?, ?)`,
                    [
                        this.name,
                        this.isRead ? 1 : 0,
                        this.unreadDays,
                        this.frozen ? 1 : 0
                    ]
                );
                this.id = result.lastID;
            }
            return this;
        } catch (error) {
            throw new Error('保存用户失败: ' + error.message);
        }
    }

    async delete() {
        try {
            await DatabaseService.run('DELETE FROM users WHERE id = ?', [this.id]);
            return true;
        } catch (error) {
            throw new Error('删除用户失败: ' + error.message);
        }
    }
}

module.exports = User;