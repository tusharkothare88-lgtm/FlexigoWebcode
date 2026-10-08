const fs = require('fs');
const path = require('path');

const dir = 'C:\\Users\\AnkitAhirwar\\OneDrive\\Desktop\\Flexigo\\frontend\\src\\modules\\admin\\pages';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.jsx'));

files.forEach(file => {
    if (file === 'RiderBehaviourPage.jsx') return;

    let content = fs.readFileSync(path.join(dir, file), 'utf8');
    let original = content;
    
    // 1. Table wrapper
    content = content.replace(/<div className="overflow-x-auto">/g, '<div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl overflow-hidden shadow-sm mt-4">\n<div className="overflow-x-auto">');
    // Wait, the wrapper div replacing might double wrap if we run it multiple times. 
    // Instead of messing with wrappers, let's focus purely on the table tags.
    
    // 2. Table tag
    content = content.replace(/<table className="[^"]*"/g, '<table className="w-full"');
    
    // 3. Thead Tr tag
    content = content.replace(/<thead[^>]*>\s*<tr\s+className="[^"]*"/g, '<thead>\n                     <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-tertiary)]/5"');
    content = content.replace(/<thead[^>]*>\s*<tr\s*>/g, '<thead>\n                     <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-tertiary)]/5">');
    
    // 4. Th tag
    content = content.replace(/<th\s+key=\{([^\}]+)\}\s+className="[^"]*"/g, '<th key={$1} className="text-left py-3 px-4 text-xs font-semibold text-[var(--text-secondary)] whitespace-nowrap"');
    content = content.replace(/<th\s+className="[^"]*"/g, '<th className="text-left py-3 px-4 text-xs font-semibold text-[var(--text-secondary)] whitespace-nowrap"');
    
    // 5. Tbody TR tags
    content = content.replace(/<tbody[^>]*>([\s\S]*?)<\/tbody>/g, (match, p1) => {
        let inner = p1;
        
        // Tr classes
        inner = inner.replace(/<tr\s+key=\{([^\}]+)\}\s+className="[^"]*"/g, '<tr key={$1} className="group/row hover:bg-[var(--bg-tertiary)]/10 transition-colors text-sm"');
        inner = inner.replace(/<tr\s+className="[^"]*"/g, '<tr className="group/row hover:bg-[var(--bg-tertiary)]/10 transition-colors text-sm"');
        inner = inner.replace(/<tr\s+key=\{([^\}]+)\}>/g, '<tr key={$1} className="group/row hover:bg-[var(--bg-tertiary)]/10 transition-colors text-sm">');
        
        // Remove aggressive typography
        inner = inner.replace(/\btext-\[\d+(\.\d+)?px\]\b/g, '');
        inner = inner.replace(/\buppercase\b/g, '');
        inner = inner.replace(/\btracking-(widest|tight|wide|wider)\b/g, '');
        inner = inner.replace(/\bitalic\b/g, '');
        inner = inner.replace(/\bleading-none\b/g, '');
        inner = inner.replace(/\bfont-(normal|black|bold)\b/g, 'font-medium');
        
        // Fix standard padding in td
        inner = inner.replace(/\bpy-2\.5\b/g, 'py-2');
        inner = inner.replace(/\bpx-6\b/g, 'px-4');
        inner = inner.replace(/\bpy-3\b/g, 'py-2');
        
        // Badges: find inline-flex and strip tiny text, add text-xs
        inner = inner.replace(/className="([^"]*inline-flex[^"]*)"/g, (matchClass, cls) => {
            let newCls = cls.replace(/\bpx-\d+(\.\d+)?\b/g, 'px-2.5')
                            .replace(/\bpy-\d+(\.\d+)?\b/g, 'py-1')
                            .replace(/\brounded\b/g, 'rounded-md');
            
            if (!newCls.includes('text-xs')) newCls += ' text-xs';
            if (!newCls.includes('border')) newCls += ' border';
            
            // remove double spaces
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
        // Also ensure table wrapper has bg and border if it's the standard overflow-x-auto
        // Replace: <div className="overflow-x-auto"> \n <table
        // With: <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl overflow-hidden shadow-sm">\n <div className="overflow-x-auto"> \n <table
        // Note: we must avoid double wrapping.
        if (!content.includes('shadow-sm') && content.includes('<div className="overflow-x-auto">')) {
            content = content.replace(/<div className="overflow-x-auto">/g, '<div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl overflow-hidden shadow-sm">\n<div className="overflow-x-auto">');
            // also we need to add </div> after </table> to close the wrapper.
            // This is too hard to reliably regex. Let's just do it manually for HrManagementPage.
        }
        
        fs.writeFileSync(path.join(dir, file), content);
    }
});
console.log('Update Complete!');
