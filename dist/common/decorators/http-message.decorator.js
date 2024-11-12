"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatusMessage = exports.STATUS_MESSAGE_KEY = void 0;
const common_1 = require("@nestjs/common");
exports.STATUS_MESSAGE_KEY = 'statusMessage';
const StatusMessage = (message) => (0, common_1.SetMetadata)(exports.STATUS_MESSAGE_KEY, message);
exports.StatusMessage = StatusMessage;
//# sourceMappingURL=http-message.decorator.js.map