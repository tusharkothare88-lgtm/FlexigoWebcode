const fs = require('fs');
const path = require('path');

const dir = 'C:\\Users\\AnkitAhirwar\\OneDrive\\Desktop\\Flexigo\\frontend\\src\\modules\\admin\\pages';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.jsx'));

files.forEach(file => {
    if (file === 'RiderBehaviourPage.jsx') return;

    let content = fs.readFileSync(path.join(dir, file), 'utf8');
    let original = content;
    
    content = content.replace(/<tbody[^>]*>([\s\S]*?)<\/tbody>/g, (match, p1) => {
        let inner = p1;
        
        // Remove text-[...px] anywhere inside tbody
        inner = inner.replace(/text-\[\d+(\.\d+)?px\]/g, '');
        
        // Let's also fix badge styling directly
        // Usually: className={`inline-flex px-4 py-2 rounded ...`}
        inner = inner.replace(/inline-flex[^`"']*/g, (badgeCls) => {
            let newCls = badgeCls.replace(/px-\d+(\.\d+)?/g, 'px-2.5')
                            .replace(/py-\d+(\.\d+)?/g, 'py-1')
                            .replace(/\brounded\b/g, 'rounded-md');
            // ensure it has text-xs font-medium border
            if (!newCls.includes('text-xs')) newCls += ' text-xs';
            if (!newCls.includes('font-medium')) newCls += ' font-medium';
            if (!newCls.includes('border')) newCls += ' border';
            return newCls;
        });
        
        // Clean up spaces
        inner = inner.replace(/\s{2,}/g, ' ');
        
        return `<tbody className="divide-y divide-[var(--border-subtle)]">${inner}</tbody>`;
    });
    
    if (original !== content) {
        fs.writeFileSync(path.join(dir, file), content);
        console.log('Fixed text classes in', file);
    }
});
console.log('Done cleaning!');
