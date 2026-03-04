const fs = require('fs');
const path = require('path');
const readline = require('readline');

/**
 * Script to securely and efficiently delete image files from a specified directory.
 * 
 * Usage: 
 *   node scripts/clean_transfer_images.js [directory_path] [--dry-run] [--force]
 * 
 * Options:
 *   [directory_path] : Path to the directory to clean (default: 'transfers')
 *   --dry-run        : Simulate deletion without removing files
 *   --force          : Skip confirmation prompt
 */

// Configuration
const DEFAULT_DIR = 'transfers';
const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff', '.webp']);
const LOG_FILE = 'deletion_log.txt';

// Parse Arguments
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const force = args.includes('--force');
let targetDir = args.find(arg => !arg.startsWith('--')) || DEFAULT_DIR;

// Resolve absolute path
targetDir = path.resolve(process.cwd(), targetDir);

// Statistics
const stats = {
    totalFilesFound: 0,
    imagesFound: 0,
    deletedCount: 0,
    spaceFreed: 0, // in bytes
    errors: 0,
    skipped: 0
};

// Logging
const logStream = fs.createWriteStream(LOG_FILE, { flags: 'a' });

function log(message, type = 'INFO') {
    const timestamp = new Date().toISOString();
    const formattedMessage = `[${timestamp}] [${type}] ${message}`;
    console.log(formattedMessage);
    logStream.write(formattedMessage + '\n');
}

function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Recursive file walker
function walkDir(dir, callback) {
    if (!fs.existsSync(dir)) {
        log(`Directory not found: ${dir}`, 'ERROR');
        stats.errors++;
        return;
    }

    try {
        const files = fs.readdirSync(dir);
        for (const file of files) {
            const filePath = path.join(dir, file);
            try {
                const stat = fs.statSync(filePath);
                if (stat.isDirectory()) {
                    walkDir(filePath, callback);
                } else {
                    callback(filePath, stat);
                }
            } catch (err) {
                log(`Error accessing file ${filePath}: ${err.message}`, 'ERROR');
                stats.errors++;
            }
        }
    } catch (err) {
        log(`Error reading directory ${dir}: ${err.message}`, 'ERROR');
        stats.errors++;
    }
}

function processFile(filePath, stat) {
    stats.totalFilesFound++;
    const ext = path.extname(filePath).toLowerCase();
    
    if (IMAGE_EXTENSIONS.has(ext)) {
        stats.imagesFound++;
        
        if (dryRun) {
            log(`[DRY-RUN] Would delete: ${filePath} (${formatBytes(stat.size)})`, 'DRY-RUN');
            stats.spaceFreed += stat.size;
        } else {
            try {
                // Check write permissions (rudimentary check)
                try {
                    fs.accessSync(filePath, fs.constants.W_OK);
                } catch (e) {
                    throw new Error('Permission denied');
                }

                fs.unlinkSync(filePath);
                log(`Deleted: ${filePath} (${formatBytes(stat.size)})`, 'SUCCESS');
                stats.deletedCount++;
                stats.spaceFreed += stat.size;
            } catch (err) {
                log(`Failed to delete ${filePath}: ${err.message}`, 'ERROR');
                stats.errors++;
            }
        }
    } else {
        stats.skipped++;
    }
}

function printSummary() {
    console.log('\n---------------------------------------------------');
    console.log('                 DELETION SUMMARY                  ');
    console.log('---------------------------------------------------');
    console.log(`Target Directory : ${targetDir}`);
    console.log(`Mode             : ${dryRun ? 'DRY-RUN (No changes made)' : 'LIVE EXECUTION'}`);
    console.log(`Total Files Scanned: ${stats.totalFilesFound}`);
    console.log(`Images Found       : ${stats.imagesFound}`);
    console.log(`Images Deleted     : ${stats.deletedCount}`);
    console.log(`Space Freed        : ${formatBytes(stats.spaceFreed)}`);
    console.log(`Errors             : ${stats.errors}`);
    console.log(`Skipped Files      : ${stats.skipped}`);
    console.log('---------------------------------------------------');
    console.log(`Log saved to: ${path.resolve(LOG_FILE)}`);
}

// Main Execution Flow
async function main() {
    console.log(`\nStarting Image Cleanup Tool...`);
    console.log(`Target: ${targetDir}`);
    
    if (!fs.existsSync(targetDir)) {
        console.error(`\nError: Target directory '${targetDir}' does not exist.`);
        process.exit(1);
    }

    if (!dryRun && !force) {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        const answer = await new Promise(resolve => {
            rl.question(`\nWARNING: You are about to PERMANENTLY DELETE image files in:\n${targetDir}\n\nAre you sure you want to continue? (yes/no): `, resolve);
        });
        
        rl.close();

        if (answer.toLowerCase() !== 'yes') {
            console.log('Operation cancelled by user.');
            process.exit(0);
        }
    }

    log(`Operation started. Dry-run: ${dryRun}`);
    
    walkDir(targetDir, processFile);
    
    printSummary();
    logStream.end();
}

main().catch(err => {
    console.error('Fatal Error:', err);
    process.exit(1);
});
