import fs from 'fs';
import path from 'path';

/**
 * Saves a base64 image or returns the path for a multer file.
 * @param {Object} req Express request object (to construct host URLs)
 * @param {string|Object} fileData Base64 string, URL, or Multer File object
 * @param {string} prefix File prefix (e.g., 'selfie', 'vehicle')
 * @param {string} id Unique identifier for unique filename (e.g., riderId, vehicleId)
 * @returns {string|null} The absolute URL of the uploaded image
 */
export const saveImageLocal = (req, fileData, prefix = 'doc', id = 'gen') => {
  if (!fileData) return null;

  // 1. If it's a Multer File object
  if (typeof fileData === 'object' && fileData.filename) {
    return `${req.protocol}://${req.get('host')}/images/${fileData.filename}`;
  }

  // 2. If it's a base64 string
  if (typeof fileData === 'string' && fileData.startsWith('data:image/')) {
    try {
      const matches = fileData.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        // Handle slashes in extension like svg+xml -> xml
        let ext = matches[1].split('/')[1] || 'jpg';
        if (ext.includes('+')) {
          ext = ext.split('+')[0];
        }
        const buffer = Buffer.from(matches[2], 'base64');
        const filename = `${prefix}-${id}-${Date.now()}.${ext}`;
        
        const uploadDir = 'images';
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }

        const filePath = path.join(uploadDir, filename);
        fs.writeFileSync(filePath, buffer);
        return `${req.protocol}://${req.get('host')}/images/${filename}`;
      }
    } catch (err) {
      console.error(`[localUpload] Failed to save base64 for ${prefix}:`, err);
      throw new Error(`Failed to save base64 image: ${err.message}`);
    }
  }

  // 3. If it's already an absolute or relative URL
  if (typeof fileData === 'string' && (fileData.startsWith('http') || fileData.startsWith('/images/'))) {
    return fileData;
  }

  return null;
};
