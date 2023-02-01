"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const file_controller_1 = require("./file.controller");
const express_1 = require("express");
const router = (0, express_1.Router)();
router.post('/upload', file_controller_1.fileController.upload);
exports.default = router;
