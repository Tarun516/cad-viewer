import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import * as THREE from 'three';
import { fileURLToPath } from 'url';
import { STLLoader, OBJLoader, OBJExporter, STLExporter } from 'three-stdlib';

const app = express();
const port = process.env.PORT || 3000;

// __dirname replacement in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Enable CORS
app.use(cors());

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Serve uploads folder statically so files are accessible via URL
app.use('/uploads', express.static(uploadDir));

// Configure multer storage and file filtering
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    // Create a unique filename while preserving the extension
    cb(null, file.fieldname + '-' + Date.now() + ext);
  },
});
const fileFilter = (req, file, cb) => {
  const allowedExts = ['.stl', '.obj'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedExts.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Unsupported file format. Only STL and OBJ files are allowed.'), false);
  }
};

const upload = multer({ storage, fileFilter });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Upload endpoint: saves file and returns file information
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded or invalid file type.' });
  }
  res.status(200).json({ message: 'File uploaded successfully!', file: req.file });
});

// Export endpoint: if requested format equals the original format, return file as-is;
// otherwise perform conversion between STL and OBJ.
app.post('/export', async (req, res) => {
  const { format, fileName } = req.body;
  if (!format || !fileName) {
    return res.status(400).json({ error: 'Missing export parameters.' });
  }
  const filePath = path.join(uploadDir, fileName);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found.' });
  }
  
  // Determine the original file extension (without the dot)
  const origExt = path.extname(fileName).toLowerCase().substring(1);
  const requestedFormat = format.toLowerCase();

  // If the requested format is the same, simply send the file for download.
  if (origExt === requestedFormat) {
    return res.download(filePath, fileName);
  }
  
  try {
    // Conversion: STL → OBJ
    if (origExt === 'stl' && requestedFormat === 'obj') {
      const buffer = fs.readFileSync(filePath);
      // Convert Node Buffer to ArrayBuffer
      const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
      const stlLoader = new STLLoader();
      const geometry = stlLoader.parse(arrayBuffer);
      const material = new THREE.MeshStandardMaterial({ color: 0x88ccff });
      const mesh = new THREE.Mesh(geometry, material);
      
      // Center the mesh (optional)
      geometry.computeBoundingBox();
      if (geometry.boundingBox) {
        const center = new THREE.Vector3();
        geometry.boundingBox.getCenter(center);
        geometry.center();
        mesh.position.copy(center);
      }
      
      const objExporter = new OBJExporter();
      const objData = objExporter.parse(mesh);
      
      // Set response headers and send the OBJ data as plain text
      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName.split('.')[0]}.obj"`);
      return res.send(objData);
    }
    // Conversion: OBJ → STL
    else if (origExt === 'obj' && requestedFormat === 'stl') {
      // For OBJ, read as UTF-8 text because it's a text-based format.
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const objLoader = new OBJLoader();
      const object = objLoader.parse(fileContent);
      const stlExporter = new STLExporter();
      const stlData = stlExporter.parse(object);
      
      // Set response headers and send the STL data as plain text (ASCII STL)
      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName.split('.')[0]}.stl"`);
      return res.send(stlData);
    } else {
      return res.status(400).json({ error: 'Unsupported conversion requested.' });
    }
  } catch (error) {
    console.error('Conversion error:', error);
    return res.status(500).json({ error: 'Error during file conversion.' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
