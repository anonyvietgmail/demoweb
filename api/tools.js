import crypto from 'crypto';

// Minimal Base32 decoding and TOTP implementation
function base32ToBuffer(base32) {
    const base32chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let bits = '';
    for (let i = 0; i < base32.length; i++) {
        let val = base32chars.indexOf(base32.charAt(i).toUpperCase());
        if (val >= 0) bits += val.toString(2).padStart(5, '0');
    }
    let bytes = [];
    for (let i = 0; i + 8 <= bits.length; i += 8) {
        bytes.push(parseInt(bits.substr(i, 8), 2));
    }
    return Buffer.from(bytes);
}

function verifyTOTP(token, secret) {
    function getTOTP(timeOffset = 0) {
        const key = base32ToBuffer(secret);
        const epoch = Math.floor(Date.now() / 1000) + (timeOffset * 30);
        const time = Buffer.alloc(8);
        time.writeBigInt64BE(BigInt(Math.floor(epoch / 30)));

        const hmac = crypto.createHmac('sha1', key);
        hmac.update(time);
        const h = hmac.digest();

        const offset = h[h.length - 1] & 0xf;
        const binary = ((h[offset] & 0x7f) << 24) |
            ((h[offset + 1] & 0xff) << 16) |
            ((h[offset + 2] & 0xff) << 8) |
            (h[offset + 3] & 0xff);

        return (binary % 1000000).toString().padStart(6, '0');
    }

    // Check current, previous, and next window for clock drift
    return token === getTOTP() || token === getTOTP(-1) || token === getTOTP(1);
}

// Global variable for ephemeral storage (survives warm starts)
// Note: In Vercel, this is not persistent between cold starts or across regions.
let ephemeralLogs = [];

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { action, data, password } = req.body;
    // Seed: 67fjqwmrzared64uutpn6tupjyh3ifev
    const s1 = "67fjqwm";
    const s2 = "rzared64u";
    const s3 = "utpn6tupjyh3ifev";
    const SECRET_SEED = process.env.TOTP_SEED || (s1 + s2 + s3);

    try {
        if (action === "append_log") {
            if (!data) return res.status(400).json({ message: "No data" });
            const time = new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });
            const logEntry = `--- ${time} ---\n${data}\n`;
            ephemeralLogs.unshift(logEntry); // Add to beginning
            if (ephemeralLogs.length > 100) ephemeralLogs.pop(); // Keep last 100 logs
            return res.status(200).json({ success: true });
        }

        if (action === "find_matches") {
            const { emails } = data;
            if (!emails || !Array.isArray(emails)) return res.status(400).json({ message: "Invalid emails" });

            const results = emails.map(email => {
                const cleaned = email.trim().replace(/^(live|good)\|/i, "");
                // Find first match in all log entries
                for (const log of ephemeralLogs) {
                    const lines = log.split('\n');
                    const match = lines.find(line => line.includes(cleaned));
                    if (match) return match;
                }
                return email;
            });
            return res.status(200).json({ results });
        }

        if (action === "get_logs") {
            if (!verifyTOTP(password, SECRET_SEED)) {
                return res.status(401).json({ message: "Unauthorized password" });
            }
            return res.status(200).json({ logs: ephemeralLogs });
        }

        if (action === "clear_logs") {
            if (!verifyTOTP(password, SECRET_SEED)) {
                return res.status(401).json({ message: "Unauthorized password" });
            }
            ephemeralLogs = [];
            return res.status(200).json({ success: true });
        }

        return res.status(400).json({ message: "Invalid action" });

    } catch (error) {
        console.error('API Error:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}
