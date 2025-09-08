// Test script to verify document generation setup
const path = require('path');
const fs = require('fs');

console.log('Testing Document Generation Setup...\n');

// Test 1: Check if PDFKit is installed
try {
  require('pdfkit');
  console.log('✅ PDFKit is installed');
} catch (error) {
  console.log('❌ PDFKit is NOT installed. Run: npm install pdfkit');
  process.exit(1);
}

// Test 2: Check if reports directory exists
const reportsDir = path.join(__dirname, 'reports');
if (fs.existsSync(reportsDir)) {
  console.log('✅ Reports directory exists');
} else {
  console.log('⚠️  Reports directory does not exist. Creating...');
  fs.mkdirSync(reportsDir, { recursive: true });
  console.log('✅ Reports directory created');
}

// Test 3: Check if database exists
const dbPath = path.join(__dirname, 'hu_database.db');
if (fs.existsSync(dbPath)) {
  console.log('✅ Database file exists');
} else {
  console.log('❌ Database file does not exist');
}

// Test 4: Test PDF generation
console.log('\n📄 Testing PDF generation...');
try {
  const PDFDocument = require('pdfkit');
  const doc = new PDFDocument();
  const testFile = path.join(reportsDir, 'test.pdf');
  
  doc.pipe(fs.createWriteStream(testFile));
  doc.fontSize(20)
     .text('Test PDF Generation', 100, 100)
     .text('If you can read this, PDF generation is working!', 100, 150);
  doc.end();
  
  console.log('✅ Test PDF created successfully at:', testFile);
} catch (error) {
  console.log('❌ PDF generation failed:', error.message);
}

// Test 5: Check database content
console.log('\n📊 Checking database content...');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(dbPath);

db.get("SELECT COUNT(*) as count FROM candidates", (err, row) => {
  if (err) {
    console.log('❌ Error reading candidates:', err.message);
  } else {
    console.log(`✅ Found ${row.count} candidates in database`);
  }
});

db.get("SELECT COUNT(*) as count FROM rapporteurs", (err, row) => {
  if (err) {
    console.log('❌ Error reading rapporteurs:', err.message);
  } else {
    console.log(`✅ Found ${row.count} rapporteurs in database`);
  }
});

db.get("SELECT COUNT(*) as count FROM meetings", (err, row) => {
  if (err) {
    console.log('❌ Error reading meetings:', err.message);
  } else {
    console.log(`✅ Found ${row.count} meetings in database`);
  }
  
  db.close();
  
  console.log('\n✨ Setup test complete!');
  console.log('If all checks passed, document generation should work.');
  console.log('If not, please install missing dependencies and restart the server.');
});
