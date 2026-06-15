const multer = require("multer");
const Faculty = require("../models/Faculty");
const bcrypt = require("bcryptjs");
const XLSX = require("xlsx");

// Configure multer for file upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept Excel and CSV files
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'text/csv', // .csv
      'application/csv'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only Excel (.xlsx, .xls) and CSV files are allowed.'), false);
    }
  }
});

// Upload faculty from Excel
exports.uploadFacultyFromExcel = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON
    const data = XLSX.utils.sheet_to_json(worksheet);
    
    if (data.length === 0) {
      return res.status(400).json({ message: "Excel file is empty" });
    }

    console.log("Excel data parsed:", data);

    // Validate required columns
    const requiredColumns = ['facultyName', 'facultyId', 'password', 'department'];
    const firstRow = data[0];
    const missingColumns = requiredColumns.filter(col => !(col in firstRow));
    
    if (missingColumns.length > 0) {
      return res.status(400).json({ 
        message: `Missing required columns: ${missingColumns.join(', ')}`,
        requiredColumns
      });
    }

    let uploadedCount = 0;
    let skippedCount = 0;
    const errors = [];

    // Process each row
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      
      try {
        // Validate required fields
        if (!row.facultyName || !row.facultyId || !row.password || !row.department) {
          errors.push(`Row ${i + 2}: Missing required fields`);
          skippedCount++;
          continue;
        }

        // Convert to strings and trim
        const facultyName = String(row.facultyName || '').trim();
        const facultyId = String(row.facultyId || '').trim();
        const password = String(row.password || '').trim();
        const department = String(row.department || '').trim();

        // Check if fields are empty after trimming
        if (!facultyName || !facultyId || !password || !department) {
          errors.push(`Row ${i + 2}: Required fields cannot be empty`);
          skippedCount++;
          continue;
        }

        // Check if faculty ID already exists
        const existingFaculty = await Faculty.findOne({ facultyId });
        if (existingFaculty) {
          errors.push(`Row ${i + 2}: Faculty ID "${facultyId}" already exists`);
          skippedCount++;
          continue;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create faculty
        const faculty = new Faculty({
          name: facultyName,
          facultyId: facultyId,
          password: hashedPassword,
          department: department,
          isApproved: true // Auto-approve since no approval system
        });

        await faculty.save();
        uploadedCount++;

        console.log(`Faculty created: ${facultyId}`);
        
      } catch (error) {
        console.error(`Error processing row ${i + 2}:`, error);
        errors.push(`Row ${i + 2}: ${error.message}`);
        skippedCount++;
      }
    }

    res.status(200).json({
      message: "Excel upload processed successfully",
      uploadedCount,
      skippedCount,
      totalRows: data.length,
      errors: errors.slice(0, 10), // Limit errors to first 10
      hasMoreErrors: errors.length > 10
    });

  } catch (error) {
    console.error("Excel upload error:", error);
    res.status(500).json({ 
      message: "Failed to process Excel file",
      error: error.message 
    });
  }
};

// Export the upload middleware
exports.upload = upload.single('excelFile');
