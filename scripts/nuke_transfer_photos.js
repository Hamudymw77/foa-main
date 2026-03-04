const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
    transfersJsonPath: path.join(__dirname, '../app/transfers.json'),
    backupDir: path.join(__dirname, '../backups/transfers_cleanup_' + Date.now()),
    targetImageExtensions: ['.jpg', '.jpeg', '.png', '.webp', '.svg'],
    keywords: ['player', 'hrac', 'p'] // Added 'p' because FPL photos are usually p12345.png
};

// Ensure backup directory exists
if (!fs.existsSync(CONFIG.backupDir)) {
    fs.mkdirSync(CONFIG.backupDir, { recursive: true });
}

// Logging Helper
const report = {
    deletedFiles: [],
    databaseUpdates: 0,
    errors: []
};

function log(message) {
    console.log(`[CLEANUP] ${message}`);
}

// 1. Database Cleanup (transfers.json)
function cleanDatabase() {
    log('Starting database cleanup...');
    try {
        if (fs.existsSync(CONFIG.transfersJsonPath)) {
            // Backup
            const originalData = fs.readFileSync(CONFIG.transfersJsonPath, 'utf8');
            fs.writeFileSync(path.join(CONFIG.backupDir, 'transfers.json.bak'), originalData);
            log(`Database backed up to ${path.join(CONFIG.backupDir, 'transfers.json.bak')}`);

            // Process
            const transfers = JSON.parse(originalData);
            let updateCount = 0;

            const cleanedTransfers = transfers.map(t => {
                if (t.photo) {
                    t.photo = null; // Remove the reference
                    updateCount++;
                }
                return t;
            });

            // Save
            fs.writeFileSync(CONFIG.transfersJsonPath, JSON.stringify(cleanedTransfers, null, 2));
            report.databaseUpdates = updateCount;
            log(`Database updated. Removed photos from ${updateCount} records.`);
        } else {
            log('transfers.json not found, skipping database cleanup.');
        }
    } catch (error) {
        report.errors.push(`Database Error: ${error.message}`);
        log(`Error cleaning database: ${error.message}`);
    }
}

// 2. File System Cleanup
function cleanFileSystem(dir) {
    if (!fs.existsSync(dir)) return;

    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            cleanFileSystem(filePath); // Recursive
        } else {
            const ext = path.extname(file).toLowerCase();
            const lowerName = file.toLowerCase();

            // Check if it's an image AND matches keywords
            if (CONFIG.targetImageExtensions.includes(ext)) {
                const matchesKeyword = CONFIG.keywords.some(k => lowerName.includes(k));
                
                if (matchesKeyword) {
                    try {
                        // Backup file
                        const backupPath = path.join(CONFIG.backupDir, 'files', path.relative(path.join(__dirname, '..'), filePath));
                        const backupFileDir = path.dirname(backupPath);
                        
                        if (!fs.existsSync(backupFileDir)) {
                            fs.mkdirSync(backupFileDir, { recursive: true });
                        }
                        
                        fs.copyFileSync(filePath, backupPath);

                        // Delete file
                        fs.unlinkSync(filePath);
                        report.deletedFiles.push(filePath);
                        log(`Deleted: ${filePath}`);
                    } catch (error) {
                        report.errors.push(`File Error (${filePath}): ${error.message}`);
                    }
                }
            }
        }
    });
}

// Main Execution
function main() {
    console.log('--- STARTING TOTAL PHOTO REMOVAL ---');
    
    // Clean Database
    cleanDatabase();

    // Clean File System (Scanning potential directories)
    // We scan specific directories where images might be stored based on previous context
    const dirsToScan = [
        path.join(__dirname, '../public/transfers'),
        path.join(__dirname, '../transfers'),
        path.join(__dirname, '../app/transfers') // Just in case
    ];

    dirsToScan.forEach(dir => {
        log(`Scanning directory: ${dir}`);
        cleanFileSystem(dir);
    });

    // Generate Final Report
    const reportPath = path.join(CONFIG.backupDir, 'cleanup_report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    console.log('\n--- FINAL REPORT ---');
    console.log(`Database Records Updated: ${report.databaseUpdates}`);
    console.log(`Files Deleted: ${report.deletedFiles.length}`);
    console.log(`Errors: ${report.errors.length}`);
    console.log(`Backup & Report saved in: ${CONFIG.backupDir}`);
    console.log('--------------------');
}

main();
