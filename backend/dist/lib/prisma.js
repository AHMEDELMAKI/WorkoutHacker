"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const client_1 = require("@prisma/client");
const logger_1 = require("../utils/logger");
const globalForPrisma = globalThis;
exports.prisma = globalForPrisma.prisma ||
    new client_1.PrismaClient({
        log: [
            { level: 'query', emit: 'event' },
            { level: 'warn', emit: 'stdout' },
            { level: 'error', emit: 'stdout' },
        ],
    });
if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = exports.prisma;
}
exports.prisma.$on('query', (e) => {
    if (process.env.NODE_ENV === 'development') {
        logger_1.logger.debug(`Query: ${e.query} | Duration: ${e.duration}ms`);
    }
});
//# sourceMappingURL=prisma.js.map