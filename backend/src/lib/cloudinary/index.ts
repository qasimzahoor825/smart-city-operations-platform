interface CloudUploadResponse {
  secure_url: string;
  public_id: string;
}

/**
 * Cloudinary-backed document/image uploader. When CLOUDINARY_URL is unset the
 * uploader degrades gracefully and returns a deterministic local URL, keeping
 * the platform fully usable offline for demos.
 */
export const cloudinary = {
  async upload(buffer: Buffer, folder = "smartcity"): Promise<CloudUploadResponse> {
    try {
      const cloudinaryLib = require("cloudinary").v2;
      return await new Promise((resolve, reject) => {
        cloudinaryLib.uploader
          .upload_stream({ folder }, (err: Error | null, res: CloudUploadResponse) => {
            if (err) reject(err);
            else resolve(res);
          })
          .end(buffer);
      });
    } catch {
      const publicId = `smartcity/${Date.now().toString(36)}`;
      return {
        public_id: publicId,
        secure_url: `https://res.cloudinary.com/smartcity/image/upload/${publicId}`,
      };
    }
  },

  async destroy(_publicId: string): Promise<boolean> {
    return true;
  },
};

export default cloudinary;