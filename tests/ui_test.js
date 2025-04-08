const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Test UI components
const testUIComponents = () => {
    console.log('🔍 Testing UI Components...\n');
    
    // Get all screen components
    const screensDir = path.join(__dirname, '..', 'screens');
    const screenFiles = fs.readdirSync(screensDir).filter(file => file.endsWith('.js'));
    
    console.log(`Found ${screenFiles.length} screen components to test\n`);
    
    // Test each screen component
    screenFiles.forEach((file, index) => {
        const componentName = file.replace('.js', '');
        console.log(`Test ${index + 1}: ${componentName}`);
        
        try {
            // Check if file exists and is readable
            const filePath = path.join(screensDir, file);
            const stats = fs.statSync(filePath);
            
            if (stats.isFile()) {
                // Check for basic React component structure
                const content = fs.readFileSync(filePath, 'utf8');
                
                if (content.includes('export default') && 
                    (content.includes('function') || content.includes('class')) && 
                    content.includes('return') && 
                    content.includes('StyleSheet.create')) {
                    
                    console.log(`✅ Component structure is valid`);
                    
                    // Check for potential issues
                    const issues = [];
                    
                    if (!content.includes('import React')) {
                        issues.push('Missing React import');
                    }
                    
                    if (content.includes('console.log') && !content.includes('process.env.NODE_ENV !== "production"')) {
                        issues.push('Contains console.log statements without production check');
                    }
                    
                    if (content.includes('useState') && !content.includes('import { useState }') && !content.includes('import React, { useState }')) {
                        issues.push('Using useState without importing it');
                    }
                    
                    if (issues.length > 0) {
                        console.log(`⚠️ Potential issues found:`);
                        issues.forEach(issue => console.log(`   - ${issue}`));
                    } else {
                        console.log(`   No issues found`);
                    }
                } else {
                    console.log(`❌ Invalid component structure`);
                }
            } else {
                console.log(`❌ Not a valid file`);
            }
        } catch (error) {
            console.log(`❌ Error: ${error.message}`);
        }
        
        console.log();
    });
    
    console.log('🔍 UI Component Tests completed!');
};

// Run the tests
testUIComponents();
