"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNow = void 0;
const getNow = () => {
    const koreanTime = new Date().toLocaleString('ko-KR', {
        timeZone: 'Asia/Seoul',
    });
    return koreanTime;
};
exports.getNow = getNow;
//# sourceMappingURL=util.service.js.map