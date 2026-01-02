const fs = require('fs');
const path = 'd:\\Web\\Web check live gmail\\_source_code\\js\\checker.js';

let content = fs.readFileSync(path, 'utf8');

const oldFunc = `function getAccountList() {
        const text = accountList.value.trim();
        if (!text) return [];
        return text.split('\\n')
            .map(line => line.trim())
            .filter(line => line.length > 0)
            .map(email => {
                const atIndex = email.indexOf('@gmail.com');
                if (atIndex !== -1) {
                    return email.substring(0, atIndex + 10);
                }
                return email;
            });
    }`;

const newFunc = `function getAccountList() {
        const text = accountList.value.trim();
        if (!text) return [];
        return text.split('\\n')
            .map(line => line.trim())
            .filter(line => line.length > 0)
            .map(line => {
                // Tách theo các ký tự phân cách phổ biến: |, :, ;, tab, khoảng trắng
                const parts = line.split(/[|:;\\t\\s]+/);
                for (let part of parts) {
                    const p = part.trim();
                    // Ưu tiên phần có chứa ký tự @ (có vẻ là email)
                    if (p.includes('@')) {
                        // Loại bỏ các thành phần dư thừa sau @gmail.com nếu có
                        const atIndex = p.toLowerCase().indexOf('@gmail.com');
                        if (atIndex !== -1) {
                            return p.substring(0, atIndex + 10);
                        }
                        return p;
                    }
                }
                // Nếu không thấy phần nào có @, lấy phần đầu tiên
                return parts[0];
            });
    }`;

// Since indentation might vary, I'll use a more flexible replacement if needed
// but let's try direct first.
if (content.includes('function getAccountList()')) {
    const start = content.indexOf('function getAccountList()');
    const end = content.indexOf('}', start + 25) + 1; // Basic end find

    // Better: find matching brace
    let braceCount = 0;
    let foundStart = false;
    let actualEnd = -1;
    for (let i = start; i < content.length; i++) {
        if (content[i] === '{') {
            braceCount++;
            foundStart = true;
        } else if (content[i] === '}') {
            braceCount--;
        }
        if (foundStart && braceCount === 0) {
            actualEnd = i + 1;
            break;
        }
    }

    if (actualEnd !== -1) {
        content = content.substring(0, start) + newFunc + content.substring(actualEnd);
        fs.writeFileSync(path, content);
        console.log('Successfully updated _source_code/js/checker.js');
    } else {
        console.log('Could not find end of function');
    }
} else {
    console.log('Could not find function getAccountList');
}
