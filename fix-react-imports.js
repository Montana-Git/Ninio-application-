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

// Function to fix React imports in a file
function fixReactImports(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace "import React, { ... } from 'react'" with "import { ... } from 'react'"
    const newContent = content.replace(/import React,\s*{([^}]*)}\s*from\s*["']react["'];?/g, 'import {$1} from "react";');
    
    // Replace "import React from 'react'" with nothing if it's the only import
    const finalContent = newContent.replace(/import React from ["']react["'];?/g, '');
    
    if (content !== finalContent) {
      fs.writeFileSync(filePath, finalContent, 'utf8');
      console.log(`Fixed React imports in ${filePath}`);
      return true;
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
    if (fixReactImports(file)) {
      fixedCount++;
    }
  });
  
  console.log(`\nFixed React imports in ${fixedCount} files.`);
}

main();
