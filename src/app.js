const express = require('express');
const path = require('path');
const cors = require('cors');
const cron = require('node-cron');
const DatabaseService = require('./server/services/dbService');
const WhatsappService = require('./server/services/whatsappService');
const UserController = require('./server/controllers/userController');
const userRoutes = require('./server/routes/userRoutes');
const whatsappRoutes = require('./server/routes/whatsappRoutes');
const { errorHandler, notFoundHandler } = require('./server/middleware/errorHandler');

class App {
    constructor() {
        this.app = express();
        this.port = process.env.PORT || 3000;
        this.setupMiddleware();
        this.setupRoutes();
        this.setupErrorHandling();
        this.setupCronJobs();
    }

    setupMiddleware() {
        this.app.use(cors());
        this.app.use(express.json());
        this.app.use(express.static(path.join(__dirname, 'public')));
    }

    setupRoutes() {
        // API 路由
        this.app.use('/api/users', userRoutes);
        this.app.use('/api/whatsapp', whatsappRoutes);

        // 主页路由
        this.app.get('/', (req, res) => {
            res.sendFile(path.join(__dirname, 'public', 'index.html'));
        });
    }

    setupErrorHandling() {
        this.app.use(notFoundHandler);
        this.app.use(errorHandler);

        // 未捕获的异常处理
        process.on('uncaughtException', (error) => {
            console.error('未捕获的异常:', error);
        });

        process.on('unhandledRejection', (reason, promise) => {
            console.error('未处理的Promise拒绝:', reason);
        });
    }

    setupCronJobs() {
        // 每天凌晨4点重置用户状态
        cron.schedule('0 4 * * *', async () => {
            try {
                await UserController.resetAllUsersStatus({}, { json: () => {} }, (err) => {
                    if (err) console.error('重置用户状态失败:', err);
                });
                console.log('用户状态已重置 -', new Date().toLocaleString());
            } catch (error) {
                console.error('执行定时任务失败:', error);
            }
        });
    }

    async initialize() {
        try {
            // 初始化数据库
            await DatabaseService.initialize();
            console.log('数据库初始化成功');

            // 初始化WhatsApp
            await WhatsappService.initialize();
            console.log('WhatsApp服务初始化成功');

            // 启动服务器
            this.app.listen(this.port, () => {
                console.log(`服务器运行在 http://localhost:${this.port}`);
            });

            // 优雅关闭处理
            this.setupGracefulShutdown();
        } catch (error) {
            console.error('服务器启动失败:', error);
            process.exit(1);
        }
    }

    setupGracefulShutdown() {
        const shutdown = async () => {
            console.log('正在关闭服务器...');
            try {
                if (DatabaseService.db) {
                    await DatabaseService.close();
                    console.log('数据库连接已关闭');
                }
                process.exit(0);
            } catch (error) {
                console.error('关闭服务器时发生错误:', error);
                process.exit(1);
            }
        };

        // 监听终止信号
        process.on('SIGTERM', shutdown);
        process.on('SIGINT', shutdown);
    }
}

// 创建并启动应用
const app = new App();
app.initialize();
