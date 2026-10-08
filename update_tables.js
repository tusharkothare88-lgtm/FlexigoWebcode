const fs = require('fs');
const path = require('path');

const dir = 'C:\\Users\\AnkitAhirwar\\OneDrive\\Desktop\\Flexigo\\frontend\\src\\modules\\admin\\pages';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.jsx'));

files.forEach(file => {
    if (file === 'RiderBehaviourPage.jsx') return; // skip the one we already perfected

    let content = fs.readFileSync(path.join(dir, file), 'utf8');
    let original = content;
    
    // 1. Table tag
    content = content.replace(/<table\s+className="[^"]*"/g, '<table className="w-full"');
    
    // 2. Thead tr tag
    content = content.replace(/<thead[^>]*>\s*<tr\s+className="[^"]*"/g, '<thead>\n                     <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-tertiary)]/10"');
    content = content.replace(/<thead[^>]*>\s*<tr\s*>/g, '<thead>\n                     <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-tertiary)]/10">');
    
    // 3. Th tag
    content = content.replace(/<th\s+key=\{([^\}]+)\}\s+className="[^"]*"/g, '<th key={$1} className="text-left py-3 px-4 text-xs font-semibold text-[var(--text-secondary)] whitespace-nowrap"');
    content = content.replace(/<th\s+className="[^"]*"/g, '<th className="text-left py-3 px-4 text-xs font-semibold text-[var(--text-secondary)] whitespace-nowrap"');
    
    // 4. Tbody
    content = content.replace(/<tbody[^>]*>([\s\S]*?)<\/tbody>/g, (match, p1) => {
        let newTbodyInner = p1.replace(/<tr\s+key=\{([^\}]+)\}\s+className="[^"]*"/g, '<tr key={$1} className="group/row hover:bg-[var(--bg-tertiary)]/10 transition-colors text-sm"');
        
        newTbodyInner = newTbodyInner.replace(/<tr\s+className="[^"]*"/g, '<tr className="group/row hover:bg-[var(--bg-tertiary)]/10 transition-colors text-sm"');
        newTbodyInner = newTbodyInner.replace(/<tr\s+key=\{([^\}]+)\}>/g, '<tr key={$1} className="group/row hover:bg-[var(--bg-tertiary)]/10 transition-colors text-sm">');
        
        newTbodyInner = newTbodyInner.replace(/py-\d+(\.\d+)?/g, 'py-2');
        newTbodyInner = newTbodyInner.replace(/px-\d+(\.\d+)?/g, 'px-4');
        
        newTbodyInner = newTbodyInner.replace(/text-\[8px\]/g, 'text-xs');
        newTbodyInner = newTbodyInner.replace(/text-\[10px\]/g, 'text-xs');
        newTbodyInner = newTbodyInner.replace(/text-\[11px\]/g, 'text-sm');
        
        return `<tbody className="divide-y divide-[var(--border-subtle)]">${newTbodyInner}</tbody>`;
    });
    
    // Check if the file had a wrapper around the table that needs to match RiderBehaviourPage
    // RiderBehaviourPage has:
    // <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl overflow-hidden shadow-sm">
    // ...
    // <div className="overflow-x-auto">
    // <table...
    
    // We'll replace the immediate wrapper of the table to at least have overflow-x-auto if it doesn't already, but we won't mess with their overall structure too much to avoid breaking complex UI.
    
    if (original !== content) {
        fs.writeFileSync(path.join(dir, file), content);
        console.log('Updated', file);
    }
});
console.log('Done!');
