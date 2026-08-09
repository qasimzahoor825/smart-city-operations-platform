"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roleService = void 0;
const common_1 = require("@smartcity/common");
const repository_1 = require("../repository");
exports.roleService = {
    list() {
        return repository_1.roleRepository.roles.all();
    },
    get(role) {
        const info = repository_1.roleRepository.findByRole(role);
        if (!info)
            throw new common_1.NotFoundError(`Role ${role} not found`);
        return info;
    },
};
exports.default = exports.roleService;
//# sourceMappingURL=index.js.map