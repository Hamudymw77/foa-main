const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../app/transfers.json');

try {
    const data = fs.readFileSync(filePath, 'utf8');
    const json = JSON.parse(data);
    
    if (!Array.isArray(json)) {
        console.error("Root is not an array!");
        process.exit(1);
    }
    
    let hasNull = false;
    json.forEach((item, index) => {
        if (!item) {
            console.error(`Item at index ${index} is null/undefined!`);
            hasNull = true;
        } else if (!item.id) {
             console.error(`Item at index ${index} has no ID!`, item);
        }
    });
    
    if (!hasNull) {
        console.log("JSON structure is valid.");
    }
    
} catch (e) {
    console.error("JSON Parse Error:", e);
}