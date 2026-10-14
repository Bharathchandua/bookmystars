import fs from 'fs';
import path from 'path';

const searchDir = 'src';
const searchString = 'client-hero.png';

function searchFiles(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            searchFiles(fullPath);
        } else {
            const content = fs.readFileSync(fullPath, 'utf8');
            if (content.includes(searchString) || content.includes('clientHero')) {
                console.log(`Found in: ${fullPath}`);
            }
        }
    }
}

searchFiles(searchDir);
