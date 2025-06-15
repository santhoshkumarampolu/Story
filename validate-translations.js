// Translation validation script
const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, 'public', 'locales');
const languages = ['en', 'te', 'hi'];
const namespaces = ['common', 'projects', 'editor', 'dashboard'];

console.log('🔍 Validating Translation Files...\n');

let validationResults = {
  passed: 0,
  failed: 0,
  issues: []
};

languages.forEach(lang => {
  console.log(`📁 Checking ${lang.toUpperCase()} translations:`);
  
  namespaces.forEach(ns => {
    const filePath = path.join(localesDir, lang, `${ns}.json`);
    
    try {
      if (!fs.existsSync(filePath)) {
        console.log(`  ❌ ${ns}.json - File missing`);
        validationResults.failed++;
        validationResults.issues.push(`${lang}/${ns}.json - File missing`);
        return;
      }
      
      const content = fs.readFileSync(filePath, 'utf8').trim();
      
      if (content === '') {
        console.log(`  ⚠️  ${ns}.json - File empty`);
        validationResults.issues.push(`${lang}/${ns}.json - File empty`);
        return;
      }
      
      const translations = JSON.parse(content);
      const keyCount = countKeys(translations);
      
      if (keyCount > 0) {
        console.log(`  ✅ ${ns}.json - ${keyCount} keys`);
        validationResults.passed++;
      } else {
        console.log(`  ⚠️  ${ns}.json - No translation keys found`);
        validationResults.issues.push(`${lang}/${ns}.json - No translation keys`);
      }
      
    } catch (error) {
      console.log(`  ❌ ${ns}.json - Invalid JSON: ${error.message}`);
      validationResults.failed++;
      validationResults.issues.push(`${lang}/${ns}.json - Invalid JSON: ${error.message}`);
    }
  });
  
  console.log('');
});

function countKeys(obj, prefix = '') {
  let count = 0;
  for (const key in obj) {
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      count += countKeys(obj[key], prefix + key + '.');
    } else {
      count++;
    }
  }
  return count;
}

console.log('📊 Validation Summary:');
console.log(`✅ Passed: ${validationResults.passed}`);
console.log(`❌ Failed: ${validationResults.failed}`);

if (validationResults.issues.length > 0) {
  console.log('\n🚨 Issues found:');
  validationResults.issues.forEach(issue => {
    console.log(`  • ${issue}`);
  });
} else {
  console.log('\n🎉 All translation files are valid!');
}

console.log('\n📝 Translation System Status: READY FOR TESTING');
console.log('🌐 Test URL: http://localhost:3001/test-translation');
console.log('📱 Projects URL: http://localhost:3001/dashboard/projects');
console.log('➕ New Project URL: http://localhost:3001/dashboard/projects/new');
