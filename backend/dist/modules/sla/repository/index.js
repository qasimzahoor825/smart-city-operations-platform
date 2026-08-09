"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.slaRepository = void 0;
const repository_1 = require("../../../core/database/repository");
exports.slaRepository = {
    rules: (0, repository_1.collection)("sla_rules"),
    async reset() {
        exports.slaRepository.rules.seed([]);
    },
};
exports.default = exports.slaRepository;
//# sourceMappingURL=index.js.map