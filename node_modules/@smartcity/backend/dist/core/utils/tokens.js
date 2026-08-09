"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ttlSeconds = ttlSeconds;
function ttlSeconds(ttl) {
    const m = /^(\d+)(m|h|d|s)$/.exec(ttl);
    if (!m)
        return 900;
    const n = Number(m[1]);
    switch (m[2]) {
        case "s":
            return n;
        case "m":
            return n * 60;
        case "h":
            return n * 3600;
        case "d":
            return n * 86_400;
        default:
            return 900;
    }
}
//# sourceMappingURL=tokens.js.map