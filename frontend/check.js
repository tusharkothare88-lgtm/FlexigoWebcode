const { execSync } = require('child_process');
const fs = require('fs');

try {
  const result = execSync('npm run build', { encoding: 'utf-8' });
  fs.writeFileSync('errors.txt', 'BUILD SUCCESS:\\n' + result);
} catch (error) {
  fs.writeFileSync('errors.txt', 'BUILD ERROR:\\nSTDOUT:\\n' + error.stdout + '\\nSTDERR:\\n' + error.stderr);
}

try {
  const lintResult = execSync('npm run lint', { encoding: 'utf-8' });
  fs.appendFileSync('errors.txt', '\\n\\nLINT SUCCESS:\\n' + lintResult);
} catch (error) {
  fs.appendFileSync('errors.txt', '\\n\\nLINT ERROR:\\nSTDOUT:\\n' + error.stdout + '\\nSTDERR:\\n' + error.stderr);
}
