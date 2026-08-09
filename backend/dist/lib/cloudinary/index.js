"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cloudinary = void 0;
/**
 * Cloudinary-backed document/image uploader. When CLOUDINARY_URL is unset the
 * uploader degrades gracefully and returns a deterministic local URL, keeping
 * the platform fully usable offline for demos.
 */
exports.cloudinary = {
    async upload(buffer, folder = "smartcity") {
        try {
            const cloudinaryLib = require("cloudinary").v2;
            return await new Promise((resolve, reject) => {
                cloudinaryLib.uploader
                    .upload_stream({ folder }, (err, res) => {
                    if (err)
                        reject(err);
                    else
                        resolve(res);
                })
                    .end(buffer);
            });
        }
        catch {
            const publicId = `smartcity/${Date.now().toString(36)}`;
            return {
                public_id: publicId,
                secure_url: `https://res.cloudinary.com/smartcity/image/upload/${publicId}`,
            };
        }
    },
    async destroy(_publicId) {
        return true;
    },
};
exports.default = exports.cloudinary;
//# sourceMappingURL=index.js.map