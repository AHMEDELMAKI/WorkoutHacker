"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendSuccess = sendSuccess;
exports.sendCreated = sendCreated;
exports.sendError = sendError;
function sendSuccess(res, data, message = 'OK', statusCode = 200) {
    return res.status(statusCode).json({
        success: true,
        message,
        data,
        error: null,
    });
}
function sendCreated(res, data, message = 'Created') {
    return sendSuccess(res, data, message, 201);
}
function sendError(res, error, statusCode = 500, errors) {
    return res.status(statusCode).json({
        success: false,
        message: error,
        data: null,
        error,
        ...(errors ? { errors } : {}),
    });
}
//# sourceMappingURL=response.js.map