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
        inner = inner.replace(/text-\[\d+(\.\d+)?px\]/g, '');
        
        // Ensure badges have the exact same size as the rider table badges
        // Rider table badge: px-2.5 py-1 rounded-md text-xs font-medium border
        inner = inner.replace(/className="([^"]*inline-flex[^"]*)"/g, (matchClass, cls) => {
            let newCls = cls.replace(/px-\d+(\.\d+)?/g, 'px-2.5')
                            .replace(/py-\d+(\.\d+)?/g, 'py-1')
                            .replace(/\brounded\b/g, 'rounded-md');
            
            if (!newCls.includes('text-xs')) newCls += ' text-xs';
            if (!newCls.includes('border')) newCls += ' border';
            
            newCls = newCls.replace(/\s+/g, ' ').trim();
            return `className="${newCls}"`;
        });
        
        // Clean up empty classes or spaces
        inner = inner.replace(/ className="\s+/g, ' className="');
        inner = inner.replace(/\s+"/g, '"');
        inner = inner.replace(/ className=""/g, '');
        
        return `<tbody className="divide-y divide-[var(--border-subtle)]">${inner}</tbody>`;
    });
    
    if (original !== content) {
        fs.writeFileSync(path.join(dir, file), content);
    }
});
console.log('Update Complete!');
