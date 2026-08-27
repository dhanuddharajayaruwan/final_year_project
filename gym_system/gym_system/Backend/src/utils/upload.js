import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// ── Resolve __dirname in ESM ───────────────────────────────────────────────────
const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// ── Base uploads directory (Backend/src/uploads/) ─────────────────────────────
const BASE_UPLOAD_DIR = path.join(__dirname, "../uploads");

// ── Allowed MIME types ─────────────────────────────────────────────────────────
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "video/mp4",
  "video/webm",
  "video/ogg",
];

const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".mp4", ".webm", ".ogg"];

// ── Size limits ────────────────────────────────────────────────────────────────
const SIZE_LIMITS = {
  single:   20 * 1024 * 1024,  // 20 MB  per file (increased for video clips)
  multiple: 10 * 1024 * 1024,  // 10 MB  per file
  maxFiles: 10,                  // max # files for multiple upload
};

// ─────────────────────────────────────────────────────────────────────────────
// Helper — ensure upload sub-directory exists
// ─────────────────────────────────────────────────────────────────────────────
const ensureDir = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
  return dirPath;
};

// ─────────────────────────────────────────────────────────────────────────────
// Helper — build a unique filename
//   <timestamp>-<random>.<ext>   e.g.  1709689200000-4f2a.jpg
// ─────────────────────────────────────────────────────────────────────────────
const buildFilename = (originalname) => {
  const ext    = path.extname(originalname).toLowerCase();
  const random = Math.random().toString(16).slice(2, 6);
  return `${Date.now()}-${random}${ext}`;
};

// ─────────────────────────────────────────────────────────────────────────────
// Factory — create a diskStorage engine for a given sub-folder
// ─────────────────────────────────────────────────────────────────────────────
const createStorage = (folder) =>
  multer.diskStorage({
    destination: (_req, _file, cb) => {
      const dest = ensureDir(path.join(BASE_UPLOAD_DIR, folder));
      cb(null, dest);
    },
    filename: (_req, file, cb) => {
      cb(null, buildFilename(file.originalname));
    },
  });

// ─────────────────────────────────────────────────────────────────────────────
// File filter — reject non-image uploads immediately
// ─────────────────────────────────────────────────────────────────────────────
const imageFilter = (_req, file, cb) => {
  const ext  = path.extname(file.originalname).toLowerCase();
  const mime = file.mimetype.toLowerCase();

  if (ALLOWED_MIME_TYPES.includes(mime) && ALLOWED_EXTENSIONS.includes(ext)) {
    cb(null, true);
  } else {
    cb(
      new multer.MulterError(
        "LIMIT_UNEXPECTED_FILE",
        `Only image files are allowed (${ALLOWED_EXTENSIONS.join(", ")}). Received: ${file.originalname}`
      ),
      false
    );
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// uploadSingle(folder, fieldName)
//
// Middleware for uploading ONE image file.
//
// Usage in a route:
//   import { uploadSingle } from "../utils/upload.js";
//
//   router.post(
//     "/profile-picture",
//     protect,
//     uploadSingle("profiles", "avatar"),
//     controller.updateAvatar
//   );
//
// In the controller:
//   const filePath = req.file?.path;         // absolute disk path
//   const webPath  = req.file?.webPath;      // relative URL path  e.g. /uploads/profiles/xyz.jpg
// ─────────────────────────────────────────────────────────────────────────────
export const uploadSingle = (folder = "misc", fieldName = "image") => {
  const upload = multer({
    storage     : createStorage(folder),
    fileFilter  : imageFilter,
    limits      : { fileSize: SIZE_LIMITS.single },
  }).single(fieldName);

  // Wrap in a custom middleware to give friendly error responses
  return (req, res, next) => {
    upload(req, res, (err) => {
      if (err) return handleMulterError(err, res);

      // Attach a convenient web-accessible relative path
      if (req.file) {
        req.file.webPath = `/uploads/${folder}/${req.file.filename}`;
      }

      next();
    });
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// uploadMultiple(folder, fieldName, maxCount)
//
// Middleware for uploading MANY image files (up to maxCount).
//
// Usage in a route:
//   import { uploadMultiple } from "../utils/upload.js";
//
//   router.post(
//     "/products",
//     protect,
//     authorize("admin"),
//     uploadMultiple("products", "images", 5),
//     productController.create
//   );
//
// In the controller:
//   const files    = req.files;                        // array of file objects
//   const webPaths = req.files.map(f => f.webPath);   // array of URL paths
// ─────────────────────────────────────────────────────────────────────────────
export const uploadMultiple = (
  folder    = "misc",
  fieldName = "images",
  maxCount  = SIZE_LIMITS.maxFiles
) => {
  const upload = multer({
    storage   : createStorage(folder),
    fileFilter: imageFilter,
    limits    : {
      fileSize : SIZE_LIMITS.multiple,
      files    : maxCount,
    },
  }).array(fieldName, maxCount);

  return (req, res, next) => {
    upload(req, res, (err) => {
      if (err) return handleMulterError(err, res);

      // Attach web paths to every uploaded file
      if (req.files?.length) {
        req.files = req.files.map((file) => ({
          ...file,
          webPath: `/uploads/${folder}/${file.filename}`,
        }));
      }

      next();
    });
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// uploadFields(folder, fields)
//
// Upload multiple DIFFERENT fields in one request.
//
// Usage:
//   uploadFields("products", [
//     { name: "thumbnail", maxCount: 1 },
//     { name: "gallery",   maxCount: 5 },
//   ])
//
// In the controller:
//   const thumbnail = req.files["thumbnail"]?.[0];
//   const gallery   = req.files["gallery"] ?? [];
// ─────────────────────────────────────────────────────────────────────────────
export const uploadFields = (folder = "misc", fields = []) => {
  const upload = multer({
    storage   : createStorage(folder),
    fileFilter: imageFilter,
    limits    : { fileSize: SIZE_LIMITS.single },
  }).fields(fields);

  return (req, res, next) => {
    upload(req, res, (err) => {
      if (err) return handleMulterError(err, res);

      // Attach web paths to every field's files
      if (req.files) {
        for (const fieldName of Object.keys(req.files)) {
          req.files[fieldName] = req.files[fieldName].map((file) => ({
            ...file,
            webPath: `/uploads/${folder}/${file.filename}`,
          }));
        }
      }

      next();
    });
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// Helper — delete a file from disk (e.g. when replacing an old image)
//
// Usage:
//   import { deleteFile } from "../utils/upload.js";
//   await deleteFile(oldUser.avatarPath);
// ─────────────────────────────────────────────────────────────────────────────
export const deleteFile = (webPath) => {
  return new Promise((resolve) => {
    if (!webPath) return resolve(false);

    // Convert web path  /uploads/profiles/xyz.jpg  →  absolute disk path
    const absolutePath = path.join(
      BASE_UPLOAD_DIR,
      webPath.replace(/^\/uploads\//, "")
    );

    fs.unlink(absolutePath, (err) => {
      if (err) {
        console.warn(`deleteFile: could not remove ${absolutePath} — ${err.message}`);
        return resolve(false);
      }
      resolve(true);
    });
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// Internal — translate Multer errors into clean JSON responses
// ─────────────────────────────────────────────────────────────────────────────
const handleMulterError = (err, res) => {
  if (err instanceof multer.MulterError) {
    const messages = {
      LIMIT_FILE_SIZE       : `File too large. Maximum size is ${SIZE_LIMITS.single / (1024 * 1024)} MB.`,
      LIMIT_FILE_COUNT      : `Too many files. Maximum allowed is ${SIZE_LIMITS.maxFiles}.`,
      LIMIT_UNEXPECTED_FILE : err.message || "Unexpected file field.",
      LIMIT_FIELD_KEY       : "Field name too long.",
      LIMIT_FIELD_VALUE     : "Field value too long.",
      LIMIT_FIELD_COUNT     : "Too many fields.",
      LIMIT_PART_COUNT      : "Too many parts in the form.",
    };

    return res.status(400).json({
      status : "error",
      message: messages[err.code] ?? `Upload error: ${err.message}`,
      code   : err.code,
    });
  }

  // Unknown / non-Multer error
  return res.status(500).json({
    status : "error",
    message: err.message || "An unexpected upload error occurred.",
  });
};
