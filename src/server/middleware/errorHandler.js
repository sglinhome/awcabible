function errorHandler(err, req, res, next) {
    console.error(err.stack);
    
    // 如果错误有状态码就使用它，否则使用500
    const statusCode = err.statusCode || 500;
    const message = err.message || '服务器内部错误';
    
    res.status(statusCode).json({
        error: message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
}

function notFoundHandler(req, res, next) {
    res.status(404).json({
        error: '未找到请求的资源'
    });
}

module.exports = {
    errorHandler,
    notFoundHandler
};