const fs = require('fs');
const lucide = require('lucide-react');

const usedIcons = ['ArrowLeft', 'Camera', 'Upload', 'FileText', 'CheckCircle', 'Bot', 'X', 'RotateCcw', 'Copy', 'Check', 'Settings', 'AlertCircle', 'Store', 'Hash', 'Calendar', 'CreditCard', 'ScanLine'];

const missing = usedIcons.filter(icon => !lucide[icon]);

fs.writeFileSync('missing_icons.txt', missing.join(', '));
console.log('Missing icons:', missing);
