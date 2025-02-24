const WhatsappService = require('../services/whatsappService');

class WhatsappController {
    async sendStatistics(req, res, next) {
        try {
            const { message } = req.body;
            
            if (!message) {
                return res.status(400).json({ error: '消息内容不能为空' });
            }

            await WhatsappService.sendMessage(message);
            res.json({ success: true });
        } catch (error) {
            next(error);
        }
    }

    async getStatus(req, res, next) {
        try {
            const status = await WhatsappService.getStatus();
            res.json(status);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new WhatsappController();