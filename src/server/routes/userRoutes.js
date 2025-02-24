const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');

// 获取所有用户
router.get('/', (req, res, next) => {
    UserController.getAllUsers(req, res, next);
});

// 获取单个用户
router.get('/:id', (req, res, next) => {
    UserController.getUser(req, res, next);
});

// 批量添加用户
router.post('/batch', (req, res, next) => {
    UserController.addUsers(req, res, next);
});

// 更新用户
router.put('/:id', (req, res, next) => {
    UserController.updateUser(req, res, next);
});

// 删除用户
router.delete('/:id', (req, res, next) => {
    UserController.deleteUser(req, res, next);
});

// 冻结/解冻用户
router.put('/:id/freeze', (req, res, next) => {
    UserController.toggleUserFreeze(req, res, next);
});

// 重置所有用户状态
router.post('/reset-status', (req, res, next) => {
    UserController.resetAllUsersStatus(req, res, next);
});

module.exports = router;
