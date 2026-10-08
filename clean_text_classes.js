const fs = require('fs');
const path = require('path');

const dir = 'C:\\Users\\AnkitAhirwar\\OneDrive\\Desktop\\Flexigo\\frontend\\src\\modules\\admin\\pages';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.jsx'));

files.forEach(file => {
    if (file === 'RiderBehaviourPage.jsx') return;

    let content = fs.readFileSync(path.join(dir, file), 'utf8');
    let original = content;
    
    // We only want to process inside <tbody>
    content = content.replace(/<tbody[^>]*>([\s\S]*?)<\/tbody>/g, (match, p1) => {
        let inner = p1;
        
        // Remove text-[...px] anywhere inside tbody
        inner = inner.replace(/\btext-\[\d+(\.\d+)?px\]\b/g, '');
        
        // Remove uppercase, tracking-*, italic, leading-none
        inner = inner.replace(/\buppercase\b/g, '');
        inner = inner.replace(/\btracking-(widest|tight|wide|wider)\b/g, '');
        inner = inner.replace(/\bitalic\b/g, '');
        inner = inner.replace(/\bleading-none\b/g, '');
        
        // Remove font-normal, font-black
        inner = inner.replace(/\bfont-normal\b/g, '');
        inner = inner.replace(/\bfont-black\b/g, '');
        
        // Badges use py-2 px-4 because of my previous script replacing py-X with py-2. Let's fix badge padding inside td
        // Actually, let's just make sure badges have standard padding: py-1 px-2.5 rounded-md text-xs font-medium border
        // A badge is usually an inline-flex div with a border. Let's find them:
        inner = inner.replace(/className="([^"]*inline-flex[^"]*border[^"]*)"/g, (matchClass, cls) => {
            let newCls = cls.replace(/\bpx-\d+(\.\d+)?\b/g, 'px-2.5')
                            .replace(/\bpy-\d+(\.\d+)?\b/g, 'py-1')
                            .replace(/\brounded\b/g, 'rounded-md')
                            .replace(/\btext-xs\b/g, '') // strip if exists
                            .replace(/\bfont-medium\b/g, '') // strip if exists
                            + ' text-xs font-medium';
            // clean up double spaces
            newCls = newCls.replace(/\s+/g, ' ').trim();
            return `className="${newCls}"`;
        });
        
        // clean up multiple spaces left by replacing classes with empty string
        inner = inner.replace(/ className="\s+/g, ' className="');
        inner = inner.replace(/\s+"/g, '"');
        inner = inner.replace(/ className=""/g, '');
        
        return `<tbody className="divide-y divide-[var(--border-subtle)]">${inner}</tbody>`;
    });
    
    if (original !== content) {
        fs.writeFileSync(path.join(dir, file), content);
        console.log('Cleaned text classes in', file);
    }
});
console.log('Done cleaning!');
