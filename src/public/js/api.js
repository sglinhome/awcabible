class API {
    static async getUsers() {
        const response = await fetch('/api/users');
        if (!response.ok) {
            throw new Error('获取用户列表失败');
        }
        return await response.json();
    }

    static async addUsers(names) {
        const response = await fetch('/api/users/batch', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ names })
        });
        if (!response.ok) {
            throw new Error('添加用户失败');
        }
        return await response.json();
    }

    static async updateUser(id, data) {
        const response = await fetch(`/api/users/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            throw new Error('更新用户失败');
        }
        return await response.json();
    }

    static async deleteUser(id) {
        const response = await fetch(`/api/users/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) {
            throw new Error('删除用户失败');
        }
    }

    static async sendStatistics(message) {
        const response = await fetch('/api/whatsapp/send-statistics', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message })
        });
        if (!response.ok) {
            throw new Error('发送统计信息失败');
        }
    }
}