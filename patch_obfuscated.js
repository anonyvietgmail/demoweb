const fs = require('fs');
const path = 'd:\\Web\\Web check live gmail\\js\\checker.js';

let content = fs.readFileSync(path, 'utf8');

const targetPattern = /function _0x3ab58d\(\)\{const _0x474e1e=_0x22d3b4,_0x31b902=_0x140e98\[_0x474e1e\(0x2a6,'\\x70\\x30\\x72\\x28'\)\]\[_0x474e1e\(0x226,'\\x37\\x49\\x6d\\x23'\)\]\(\);if\(!_0x31b902\)return\[\];return _0x31b902\[_0x474e1e\(0x220,'\\x31\\x49\\x6b\\x43'\)\]\('\\x0a'\)\[_0x474e1e\(0x22d,'\\x21\\x6b\\x25\\x71'\)\]\(_0x6e864e=>_0x6e864e\[_0x474e1e\(0x18b,'\\x68\\x46\\x6a\\x76'\)\]\(\)\)\[_0x474e1e\(0x1f3,'\\x76\\x5b\\x38\\x45'\)\]\(_0x33dac3=>_0x33dac3\[_0x474e1e\(0x1bd,'\\x34\\x23\\x4f\\x26'\)\]>0x0\)\[_0x474e1e\(0x177,'\\x31\\x72\\x23\\x68'\)\]\(_0x3cfb9a=>\{const _0xd21684=_0x474e1e,_0xe41904=_0x3cfb9a\[_0xd21684\(0x1b4,'\\x6f\\x56\\x75\\x4c'\)\]\(_0xd21684\(0x2ac,'\\x5a\\x4f\\x44\\x4e'\)\);if\(_0xe41904!==-0x1\)return _0x3cfb9a\[_0xd21684\(0x1d4,'\\x68\\x29\\x63\\x50'\)\]\(0x0,_0xe41904\+0xa\);return _0x3cfb9a;\}\);\}/;

const replacement = `function _0x3ab58d(){const _0x474e1e=_0x22d3b4,_0x31b902=_0x140e98[_0x474e1e(0x2a6,'\\x70\\x30\\x72\\x28')][_0x474e1e(0x226,'\\x37\\x49\\x6d\\x23')]();if(!_0x31b902)return[];return _0x31b902.split('\\n').map(l=>l.trim()).filter(l=>l.length>0).map(l=>{const pts=l.split(/[|:;\\t\\s]+/);for(let p of pts){if(p.includes('@')){const idx=p.toLowerCase().indexOf('@gmail.com');return idx!==-1?p.substring(0,idx+10):p;}}return pts[0];});}`;

if (targetPattern.test(content)) {
    content = content.replace(targetPattern, replacement);
    fs.writeFileSync(path, content);
    console.log('Successfully updated js/checker.js (obfuscated)');
} else {
    console.log('Could not find target function pattern in js/checker.js');
    // Try a more relaxed search
    if (content.includes('function _0x3ab58d')) {
        console.log('Found function signature but pattern did not match exactly.');
    }
}
