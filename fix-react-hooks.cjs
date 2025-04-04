const fs = require('fs');
const path = require('path');

// Function to recursively find all .tsx and .ts files
function findTsFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      findTsFiles(filePath, fileList);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Function to fix React hooks in a file
function fixReactHooks(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Check if the file has React.useState or React.useEffect
    if (content.includes('React.useState') || 
        content.includes('React.useEffect') || 
        content.includes('React.useRef') ||
        content.includes('React.forwardRef')) {
      
      // Check if the file already imports useState, useEffect, etc.
      const hasImport = content.match(/import\s+{([^}]*)}\s+from\s+["']react["'];?/);
      
      if (hasImport) {
        // Extract the current imports
        let imports = hasImport[1].split(',').map(i => i.trim());
        
        // Add missing hooks
        if (content.includes('React.useState') && !imports.includes('useState')) {
          imports.push('useState');
          modified = true;
        }
        if (content.includes('React.useEffect') && !imports.includes('useEffect')) {
          imports.push('useEffect');
          modified = true;
        }
        if (content.includes('React.useRef') && !imports.includes('useRef')) {
          imports.push('useRef');
          modified = true;
        }
        if (content.includes('React.forwardRef') && !imports.includes('forwardRef')) {
          imports.push('forwardRef');
          modified = true;
        }
        
        // Replace the import statement
        if (modified) {
          const newImport = `import { ${imports.join(', ')} } from "react";`;
          content = content.replace(/import\s+{([^}]*)}\s+from\s+["']react["'];?/, newImport);
        }
      } else {
        // No existing import, add a new one
        const imports = [];
        if (content.includes('React.useState')) imports.push('useState');
        if (content.includes('React.useEffect')) imports.push('useEffect');
        if (content.includes('React.useRef')) imports.push('useRef');
        if (content.includes('React.forwardRef')) imports.push('forwardRef');
        
        if (imports.length > 0) {
          const newImport = `import { ${imports.join(', ')} } from "react";\n`;
          content = newImport + content;
          modified = true;
        }
      }
      
      // Replace React.useState with useState, etc.
      if (content.includes('React.useState')) {
        content = content.replace(/React\.useState/g, 'useState');
        modified = true;
      }
      if (content.includes('React.useEffect')) {
        content = content.replace(/React\.useEffect/g, 'useEffect');
        modified = true;
      }
      if (content.includes('React.useRef')) {
        content = content.replace(/React\.useRef/g, 'useRef');
        modified = true;
      }
      if (content.includes('React.forwardRef')) {
        content = content.replace(/React\.forwardRef/g, 'forwardRef');
        modified = true;
      }
      
      if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Fixed React hooks in ${filePath}`);
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
    return false;
  }
}

// Main function
function main() {
  const srcDir = path.join(__dirname, 'src');
  const tsFiles = findTsFiles(srcDir);
  
  let fixedCount = 0;
  
  tsFiles.forEach(file => {
    if (fixReactHooks(file)) {
      fixedCount++;
    }
  });
  
  console.log(`\nFixed React hooks in ${fixedCount} files.`);
}

main();
