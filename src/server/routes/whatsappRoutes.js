const express = require('express');
const router = express.Router();
const WhatsappController = require('../controllers/whatsappController');

// 发送统计信息
router.post('/send-statistics', (req, res, next) => {
    WhatsappController.sendStatistics(req, res, next);
});

// 获取WhatsApp状态
router.get('/status', (req, res, next) => {
    WhatsappController.getStatus(req, res, next);
});

module.exports = router;