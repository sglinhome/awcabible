const User = require('../models/User');

class UserController {
    async getAllUsers(req, res, next) {
        try {
            const users = await User.findAll();
            res.json(users);
        } catch (error) {
            next(error);
        }
    }

    async getUser(req, res, next) {
        try {
            const user = await User.findById(req.params.id);
            if (!user) {
                return res.status(404).json({ error: '用户不存在' });
            }
            res.json(user);
        } catch (error) {
            next(error);
        }
    }

    async addUsers(req, res, next) {
        try {
            const { names } = req.body;
            const results = [];
            const errors = [];

            for (const name of names) {
                try {
                    const user = new User({ 
                        name, 
                        isRead: false, // 默认未读
                        unreadDays: 1, // 默认一日未读
                        frozen: false 
                    });
                    await user.save();
                    results.push(user);
                } catch (error) {
                    errors.push({ name, error: error.message });
                }
            }

            res.json({ 
                success: true, 
                added: results,
                errors: errors.length > 0 ? errors : undefined
            });
        } catch (error) {
            next(error);
        }
    }

    async updateUser(req, res, next) {
        try {
            const user = await User.findById(req.params.id);
            if (!user) {
                return res.status(404).json({ error: '用户不存在' });
            }

            Object.assign(user, req.body);
            await user.save();
            res.json(user);
        } catch (error) {
            next(error);
        }
    }

    async deleteUser(req, res, next) {
        try {
            const user = await User.findById(req.params.id);
            if (!user) {
                return res.status(404).json({ error: '用户不存在' });
            }

            await user.delete();
            res.sendStatus(204);
        } catch (error) {
            next(error);
        }
    }

    async toggleUserFreeze(req, res, next) {
        try {
            const user = await User.findById(req.params.id);
            if (!user) {
                return res.status(404).json({ error: '用户不存在' });
            }

            user.frozen = !user.frozen;
            if (user.frozen) {
                user.unreadDays = 7;
            }
            await user.save();
            res.json(user);
        } catch (error) {
            next(error);
        }
    }

    async resetAllUsersStatus(req, res, next) {
        try {
            const users = await User.findAll();
            const updates = [];

            for (const user of users) {
                if (!user.frozen) {
                    if (!user.isRead) {
                        // 未读用户的未读天数加1
                        user.unreadDays++;
                        if (user.unreadDays >= 7) {
                            user.frozen = true;
                            user.unreadDays = 7;
                        }
                    } else {
                        // 已读用户重置为一日未读
                        user.isRead = false;  // 这里会在save时自动转换为0
                        user.unreadDays = 1;
                    }
                    await user.save();
                    updates.push({
                        id: user.id,
                        name: user.name,
                        isRead: user.isRead,
                        unreadDays: user.unreadDays,
                        frozen: user.frozen
                    });
                }
            }

            res.json({ success: true, updatedUsers: updates });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new UserController();
