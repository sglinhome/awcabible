const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

class WhatsappService {
    static client = null;
    static isInitialized = false;
    static isInitializing = false;
    static groupIds = process.env.WHATSAPP_GROUP_IDS.split(',');

    static getChromeExecutablePath() {
        switch (process.platform) {
            case 'darwin': // macOS
                return process.env.CHROME_PATH_MACOS;
            case 'win32': { // Windows
                // 常见的 Windows Chrome 安装路径
                const possiblePaths = [
                    process.env.CHROME_PATH_WIN_1,
                    process.env.CHROME_PATH_WIN_2,
                    process.env.CHROME_PATH_WIN_3?.replace('%USERNAME%', process.env.USERNAME),
                    process.env.CHROME_PATH_WIN_4?.replace('%USERNAME%', process.env.USERNAME)
                ].filter(Boolean); // 过滤掉未定义的路径
                
                // 返回第一个存在的路径
                for (const path of possiblePaths) {
                    if (fs.existsSync(path)) {
                        return path;
                    }
                }
                return possiblePaths[0]; // 如果都不存在，返回默认路径
            }
            default: // Linux (Debian)
                return process.env.CHROME_PATH_LINUX;
        }
    }

    static async initialize() {
        if (this.isInitialized || this.isInitializing) {
            return;
        }

        this.isInitializing = true;

        try {
            this.client = new Client({
                authStrategy: new LocalAuth({
                    dataPath: path.join(__dirname, '../../', process.env.WHATSAPP_AUTH_DATA_PATH)
                }),
                puppeteer: {
                    executablePath: this.getChromeExecutablePath(),
                    headless: true,
                    args: [
                        '--no-sandbox',
                        '--disable-setuid-sandbox',
                        '--disable-dev-shm-usage',
                        '--disable-accelerated-2d-canvas',
                        '--disable-gpu'
                    ],
                    timeout: 120000,
                    defaultViewport: null,
                }
            });

            this.client.on('qr', (qr) => {
                console.log('请扫描以下二维码以登录WhatsApp：');
                qrcode.generate(qr, { small: true });
            });

            this.client.on('ready', () => {
                console.log('WhatsApp 客户端已就绪');
                this.isInitialized = true;
                this.isInitializing = false;
            });

            this.client.on('auth_failure', (msg) => {
                console.error('WhatsApp 认证失败:', msg);
                this.isInitialized = false;
                this.isInitializing = false;
            });

            this.client.on('disconnected', (reason) => {
                console.log('WhatsApp 客户端已断开连接:', reason);
                this.isInitialized = false;
                this.isInitializing = false;
            });

            await this.client.initialize();
        } catch (error) {
            console.error('WhatsApp 客户端初始化失败:', error);
            this.isInitialized = false;
            this.isInitializing = false;
            throw error;
        }
    }

    static async sendMessage(message) {
        if (!this.isInitialized) {
            throw new Error('WhatsApp 客户端未初始化');
        }

        try {
            for (const groupId of this.groupIds) {
                await this.client.sendMessage(groupId, message);
                console.log(`消息已发送到群组 ${groupId}`);
            }
        } catch (error) {
            console.error('发送WhatsApp消息失败:', error);
            throw error;
        }
    }

    static async getStatus() {
        return {
            isInitialized: this.isInitialized,
            isInitializing: this.isInitializing
        };
    }
}

module.exports = WhatsappService;
