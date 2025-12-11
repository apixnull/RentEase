// file: routes/uploadRoutes.js
// ------------------------------
// File Upload Routes
// ------------------------------

import { Router } from "express";
import multer from "multer";
import { randomUUID } from "crypto";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import fs from "fs";
import { requireAuthentication } from "../middlewares/requireAuthentication.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = Router();

// Ensure upload directories exist
const propertyImagesPath = path.join(__dirname, "../../public/uploads/property_main_images");
const unitImagesPath = path.join(__dirname, "../../public/uploads/unit_images");
const avatarsPath = path.join(__dirname, "../../public/uploads/avatars");
const leaseDocumentsPath = path.join(__dirname, "../../public/uploads/lease_documents");
const maintenanceRequestPath = path.join(__dirname, "../../public/uploads/maintenance_request");
const fraudReportsPath = path.join(__dirname, "../../public/uploads/fraud_reports");
if (!fs.existsSync(propertyImagesPath)) {
  fs.mkdirSync(propertyImagesPath, { recursive: true });
}
if (!fs.existsSync(unitImagesPath)) {
  fs.mkdirSync(unitImagesPath, { recursive: true });
}
if (!fs.existsSync(avatarsPath)) {
  fs.mkdirSync(avatarsPath, { recursive: true });
}
if (!fs.existsSync(leaseDocumentsPath)) {
  fs.mkdirSync(leaseDocumentsPath, { recursive: true });
}
if (!fs.existsSync(maintenanceRequestPath)) {
  fs.mkdirSync(maintenanceRequestPath, { recursive: true });
}
if (!fs.existsSync(fraudReportsPath)) {
  fs.mkdirSync(fraudReportsPath, { recursive: true });
}

// Configure multer storage for property images
const propertyImageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../../public/uploads/property_main_images");
    // Ensure directory exists before saving (create if it doesn't exist)
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
      console.log("📁 Created property_main_images directory:", uploadPath);
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${randomUUID()}${ext}`;
    cb(null, uniqueName);
  },
});

// Configure multer storage for avatars
const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../../public/uploads/avatars");
    // Ensure directory exists before saving (create if it doesn't exist)
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
      console.log("📁 Created avatars directory:", uploadPath);
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${randomUUID()}${ext}`;
    cb(null, uniqueName);
  },
});

// File filter - only allow images
const fileFilter = (req, file, cb) => {
  const allowedExtensions = /jpeg|jpg|jfif|png|gif|webp/;
  const allowedMimeTypes = /image\/(jpeg|jpg|png|gif|webp)/;
  
  const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
  const extname = allowedExtensions.test(ext);
  const mimetype = allowedMimeTypes.test(file.mimetype) || 
                   (ext === 'jfif' && file.mimetype === 'image/jpeg'); // JFIF uses image/jpeg mimetype

  if ((mimetype || extname) && extname) {
    return cb(null, true);
  } else {
    cb(new Error("Only image files are allowed (jpeg, jpg, jfif, png, gif, webp)"));
  }
};

// Configure multer for property images
const uploadPropertyImage = multer({
  storage: propertyImageStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: fileFilter,
});

// Configure multer storage for unit images
const unitImageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../../public/uploads/unit_images");
    // Ensure directory exists before saving (create if it doesn't exist)
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
      console.log("📁 Created unit_images directory:", uploadPath);
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${randomUUID()}${ext}`;
    cb(null, uniqueName);
  },
});

// Configure multer for unit images
const uploadUnitImage = multer({
  storage: unitImageStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: fileFilter,
});

// Configure multer for avatars
const uploadAvatar = multer({
  storage: avatarStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: fileFilter,
});

// Configure multer storage for lease documents
const leaseDocumentStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../../public/uploads/lease_documents");
    // Ensure directory exists before saving (create if it doesn't exist)
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
      console.log("📁 Created lease_documents directory:", uploadPath);
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${randomUUID()}${ext}`;
    cb(null, uniqueName);
  },
});

// File filter for documents (PDF, DOC, DOCX)
const documentFileFilter = (req, file, cb) => {
  const allowedExtensions = /pdf|doc|docx/;
  const allowedMimeTypes = /application\/(pdf|msword|vnd\.openxmlformats-officedocument\.wordprocessingml\.document)/;
  
  const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
  const extname = allowedExtensions.test(ext);
  const mimetype = allowedMimeTypes.test(file.mimetype);

  if (mimetype || extname) {
    return cb(null, true);
  } else {
    cb(new Error("Only document files are allowed (PDF, DOC, DOCX)"));
  }
};

// Configure multer for lease documents
const uploadLeaseDocument = multer({
  storage: leaseDocumentStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit for documents
  },
  fileFilter: documentFileFilter,
});

// Configure multer storage for maintenance request images
const maintenanceRequestStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../../public/uploads/maintenance_request");
    // Ensure directory exists before saving (create if it doesn't exist)
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
      console.log("📁 Created maintenance_request directory:", uploadPath);
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${randomUUID()}${ext}`;
    cb(null, uniqueName);
  },
});

// Configure multer for maintenance request images
const uploadMaintenanceRequestImage = multer({
  storage: maintenanceRequestStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: fileFilter,
});

// Configure multer storage for fraud report images
const fraudReportStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../../public/uploads/fraud_reports");
    // Ensure directory exists before saving (create if it doesn't exist)
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
      console.log("📁 Created fraud_reports directory:", uploadPath);
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${randomUUID()}${ext}`;
    cb(null, uniqueName);
  },
});

// Configure multer for fraud report images
const uploadFraudReportImage = multer({
  storage: fraudReportStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: fileFilter,
});

// ------------------------------
// Routes
// ------------------------------

/**
 * @desc Upload property main image
 * @route POST /api/upload/image
 * @access Private (LANDLORD)
 */
router.post(
  "/image",
  requireAuthentication(["LANDLORD"]),
  uploadPropertyImage.single("image"),
  (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No image file provided" });
      }

      // Return mock URL path
      const mockUrl = `/local-images/property_main_images/${req.file.filename}`;

      return res.status(200).json({
        url: mockUrl,
        message: "Image uploaded successfully",
      });
    } catch (error) {
      console.error("❌ Error uploading image:", error);
      return res.status(500).json({
        error: "Failed to upload image",
        details: error.message,
      });
    }
  }
);

/**
 * @desc Upload unit image
 * @route POST /api/upload/unit-image
 * @access Private (LANDLORD)
 */
router.post(
  "/unit-image",
  requireAuthentication(["LANDLORD"]),
  uploadUnitImage.single("image"),
  (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No image file provided" });
      }

      // Return mock URL path
      const mockUrl = `/local-images/unit_images/${req.file.filename}`;

      return res.status(200).json({
        url: mockUrl,
        message: "Unit image uploaded successfully",
      });
    } catch (error) {
      console.error("❌ Error uploading unit image:", error);
      return res.status(500).json({
        error: "Failed to upload unit image",
        details: error.message,
      });
    }
  }
);

/**
 * @desc Upload avatar image
 * @route POST /api/upload/avatar
 * @access Private (All authenticated users)
 */
router.post(
  "/avatar",
  requireAuthentication(["LANDLORD", "TENANT", "ADMIN"]),
  uploadAvatar.single("image"),
  (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No image file provided" });
      }

      // Return mock URL path
      const mockUrl = `/local-images/avatars/${req.file.filename}`;

      return res.status(200).json({
        url: mockUrl,
        message: "Avatar uploaded successfully",
      });
    } catch (error) {
      console.error("❌ Error uploading avatar:", error);
      return res.status(500).json({
        error: "Failed to upload avatar",
        details: error.message,
      });
    }
  }
);

/**
 * @desc Upload lease document
 * @route POST /api/upload/document
 * @access Private (LANDLORD)
 */
router.post(
  "/document",
  requireAuthentication(["LANDLORD"]),
  uploadLeaseDocument.single("document"),
  (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No document file provided" });
      }

      // Return mock URL path
      const mockUrl = `/local-images/lease_documents/${req.file.filename}`;

      return res.status(200).json({
        url: mockUrl,
        message: "Document uploaded successfully",
      });
    } catch (error) {
      console.error("❌ Error uploading document:", error);
      return res.status(500).json({
        error: "Failed to upload document",
        details: error.message,
      });
    }
  }
);

/**
 * @desc Upload maintenance request image
 * @route POST /api/upload/maintenance-image
 * @access Private (TENANT)
 */
router.post(
  "/maintenance-image",
  requireAuthentication(["TENANT"]),
  uploadMaintenanceRequestImage.single("image"),
  (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No image file provided" });
      }

      // Return mock URL path
      const mockUrl = `/local-images/maintenance_request/${req.file.filename}`;

      return res.status(200).json({
        url: mockUrl,
        message: "Maintenance request image uploaded successfully",
      });
    } catch (error) {
      console.error("❌ Error uploading maintenance request image:", error);
      return res.status(500).json({
        error: "Failed to upload maintenance request image",
        details: error.message,
      });
    }
  }
);

/**
 * @desc Upload fraud report image
 * @route POST /api/upload/fraud-report-image
 * @access Private (TENANT)
 */
router.post(
  "/fraud-report-image",
  requireAuthentication(["TENANT"]),
  uploadFraudReportImage.single("image"),
  (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No image file provided" });
      }

      // Return mock URL path
      const mockUrl = `/local-images/fraud_reports/${req.file.filename}`;

      return res.status(200).json({
        url: mockUrl,
        message: "Fraud report image uploaded successfully",
      });
    } catch (error) {
      console.error("❌ Error uploading fraud report image:", error);
      return res.status(500).json({
        error: "Failed to upload fraud report image",
        details: error.message,
      });
    }
  }
);

export default router;

