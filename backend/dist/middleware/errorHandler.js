"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
exports.createError = createError;
const logger_1 = require("../utils/logger");
const errorHandler = (err, _req, res, _next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal server error';
    logger_1.logger.error(`[${statusCode}] ${message}`, { stack: err.stack });
    res.status(statusCode).json({
        error: message,
        ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {}),
    });
};
exports.errorHandler = errorHandler;
function createError(message, statusCode) {
    const err = new Error(message);
    err.statusCode = statusCode;
    return err;
}
//# sourceMappingURL=errorHandler.js.map