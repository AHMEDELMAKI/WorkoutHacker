"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.workoutApiRouter = void 0;
const express_1 = require("express");
const server_1 = require("@react-native-workout-planner/server");
exports.workoutApiRouter = (0, express_1.Router)();
const config = (0, server_1.createServerConfigFromEnv)(process.env);
exports.workoutApiRouter.post('/', (0, server_1.createWorkoutHandler)(config));
//# sourceMappingURL=workoutApi.routes.js.map