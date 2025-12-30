import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Client using environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

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
    if (!token || !secret) return false;
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
    return token === getTOTP() || token === getTOTP(-1) || token === getTOTP(1);
}

export default async function handler(req, res) {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    const today = new Date().toISOString().split('T')[0];

    if (req.method === 'POST') {
        const { action, source, data, password, emails } = req.body;
        const SECRET_SEED = process.env.TOTP_SEED || "67fjqwmrzared64uutpn6tupjyh3ifev";

        if (!supabase) {
            return res.status(500).json({ message: "Supabase not configured. Please add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to Vercel environment variables." });
        }

        try {
            // Public Log Action
            if (action === "log") {
                if (!data) return res.status(400).json({ message: "No data" });

                // Track visits in Supabase
                await supabase.from('visitor_stats').upsert({ date: today, ip_address: ip }, { onConflict: 'date, ip_address' });

                const time = new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });
                const { error } = await supabase.from('system_logs').insert({
                    time_vn: time,
                    ip_address: ip,
                    source: source || "unknown",
                    content: data.substring(0, 50000) // Support larger data for Supabase
                });

                if (error) throw error;
                return res.status(200).json({ success: true });
            }

            // Public Find Matches (for Fill Missing)
            if (action === "find_matches") {
                const targetEmails = emails || data?.emails;
                if (!targetEmails || !Array.isArray(targetEmails)) return res.status(400).json({ message: "Invalid emails" });

                // Fetch recent logs to search (last 100 entries)
                const { data: recentLogs, error } = await supabase
                    .from('system_logs')
                    .select('content')
                    .order('created_at', { ascending: false })
                    .limit(100);

                if (error) throw error;

                const results = targetEmails.map(email => {
                    const cleaned = email.trim().replace(/^(live|good)\|/i, "");
                    for (const log of recentLogs) {
                        const lines = log.content.split('\n');
                        const match = lines.find(line => line.includes(cleaned));
                        if (match) return match;
                    }
                    return email;
                });
                return res.status(200).json({ results });
            }

            // Admin Actions (2FA Protected)
            if (action === "admin_get_logs") {
                if (!verifyTOTP(password, SECRET_SEED)) {
                    return res.status(401).json({ message: "Unauthorized 2FA" });
                }

                // Get logs
                const { data: logs, error: logError } = await supabase
                    .from('system_logs')
                    .select('*')
                    .order('created_at', { ascending: false })
                    .limit(500);

                if (logError) throw logError;

                // Get visitor count for today
                const { count, error: countError } = await supabase
                    .from('visitor_stats')
                    .select('*', { count: 'exact', head: true })
                    .eq('date', today);

                if (countError) throw countError;

                // Format logs for frontend
                const formattedLogs = logs.map(l => ({
                    time: l.time_vn,
                    ip: l.ip_address,
                    source: l.source,
                    data: l.content
                }));

                return res.status(200).json({ logs: formattedLogs, visitorCount: count });
            }

            if (action === "admin_clear_logs") {
                if (!verifyTOTP(password, SECRET_SEED)) {
                    return res.status(401).json({ message: "Unauthorized 2FA" });
                }

                // Delete everything
                await supabase.from('system_logs').delete().neq('id', 0); // Hack to delete all
                await supabase.from('visitor_stats').delete().neq('date', '1970-01-01');

                return res.status(200).json({ success: true });
            }

            return res.status(400).json({ message: "Invalid action" });

        } catch (error) {
            console.error('API Error:', error);
            return res.status(500).json({ message: error.message || 'Internal Server Error' });
        }
    }

    return res.status(405).json({ message: 'Method Not Allowed' });
}
