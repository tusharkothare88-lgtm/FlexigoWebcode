const fs = require('fs');
const path = require('path');

const dir = 'C:\\Users\\AnkitAhirwar\\OneDrive\\Desktop\\Flexigo\\frontend\\src\\modules\\admin\\pages';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.jsx'));

files.forEach(file => {
    let content = fs.readFileSync(path.join(dir, file), 'utf8');
    let original = content;
    
    content = content.replace(/<tbody[^>]*>([\s\S]*?)<\/tbody>/g, (match, p1) => {
        let newTbodyInner = p1.replace(/\bfont-(medium|semibold|bold|black|extrabold)\b/g, 'font-normal');
        // also clean up any accidental double spaces
        newTbodyInner = newTbodyInner.replace(/className="([^"]*)"/g, (m, c) => `className="${c.replace(/\s+/g, ' ').trim()}"`);
        
        return match.replace(p1, newTbodyInner);
    });
    
    if (original !== content) {
        fs.writeFileSync(path.join(dir, file), content);
        console.log('Updated', file);
    }
});
console.log('Done!');
