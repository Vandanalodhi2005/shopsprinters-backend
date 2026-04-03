const nodemailer = require('nodemailer');

// Create test account with Ethereal Email
let testAccount = null;
let transporter = null;

const createTestAccount = async () => {
    try {

        testAccount = await nodemailer.createTestAccount();



        // Create transporter with test account
        transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass
            }
        });

        return testAccount;
    } catch (error) {
        console.error('❌ Failed to create Ethereal test account:', error);
        throw error;
    }
};

// Initialize transporter
const initializeTransporter = async () => {
    // Ensure environment variables are loaded FIRST
    require('dotenv').config();

    // Log the current configuration (sanitized) to debug on Render
    console.log('📧 INITIALIZING EMAIL SERVICE');
    console.log(`• Service Var: ${process.env.EMAIL_SERVICE}`);
    console.log(`• Host Var: ${process.env.EMAIL_HOST}`);
    console.log(`• Port Var: ${process.env.EMAIL_PORT}`);
    console.log(`• User Var: ${process.env.EMAIL_USER ? '(Set)' : '(Not Set)'}`);

    if (process.env.EMAIL_SERVICE === 'ethereal') {
        // Use Ethereal for testing
        if (!testAccount) {
            testAccount = await createTestAccount();
        }
    } else if (process.env.EMAIL_SERVICE === 'brevo' || (process.env.EMAIL_HOST && process.env.EMAIL_HOST.includes('brevo'))) {
        // High-performance configuration for Brevo (Sendinblue)
        console.log('🔧 Configured for Brevo SMTP');
        console.log(`🔌 Connecting to: ${process.env.EMAIL_HOST || 'smtp-relay.brevo.com'}:${process.env.EMAIL_PORT || 587}`);

        // Check for common API Key vs SMTP Key mistake
        if (process.env.EMAIL_PASS && (process.env.EMAIL_PASS.startsWith('xkeysib-') || process.env.EMAIL_PASS.includes('xkeysib-'))) {
            console.warn('⚠️ CRITICAL WARNING: It looks like you are using a Brevo API Key as your EMAIL_PASS.');
        }

        const pass = (process.env.EMAIL_PASS || '').replace(/^"(.*)"$/, '$1');

        transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST || 'smtp-relay.brevo.com',
            port: parseInt(process.env.EMAIL_PORT) || 587,
            secure: parseInt(process.env.EMAIL_PORT) === 465, 
            auth: {
                user: process.env.EMAIL_USER,
                pass: pass
            },
            tls: {
                rejectUnauthorized: false
            }
        });
    } else {
        // Use custom SMTP configuration with connection pooling
        console.log('🔧 Configured for Custom SMTP:', process.env.EMAIL_HOST);
        transporter = nodemailer.createTransport({
            pool: true, // Use connection pooling
            maxConnections: 1, // Limit to 1 connection to respecting server limits
            maxMessages: 5, // Recycle connection after 5 messages
            rateDelta: 2000, // Show down rate limit to be safer
            rateLimit: 1,
            // Force IPv4
            family: 4,
            connectionTimeout: 10000, // 10 seconds timeout for connection
            greetingTimeout: 10000, // 10 seconds timeout for greeting
            socketTimeout: 20000, // 20 seconds timeout for socket
            host: process.env.EMAIL_HOST,
            port: parseInt(process.env.EMAIL_PORT) || 587,
            secure: process.env.EMAIL_SECURE === 'true',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            },
            tls: {
                rejectUnauthorized: false
            }
        });
    }
};

// REMOVED: initializeTransporter(); // Removed top-level call to avoid 'undefined' vars in some environments

// Generic Send Email Function (Reuses the working transporter)
const sendEmail = async ({ to, subject, html, text, from, replyTo }) => {
    try {
        if (!transporter) {
            await initializeTransporter();
        }

        const mailOptions = {
            from: from || `"${process.env.COMPANY_NAME || 'Prints Matrix'}" <${process.env.EMAIL_FROM}>`,
            sender: process.env.EMAIL_FROM,
            to: to,
            subject: subject,
            html: html,
            text: text,
            replyTo: replyTo || process.env.CONTACT_RECEIVER_EMAIL || process.env.EMAIL_FROM
        };

        console.log('📤 Sending generic email to:', to);
        const result = await transporter.sendMail(mailOptions);
        console.log('✅ Generic email sent successfully! Message ID:', result.messageId);
        return result;

    } catch (error) {
        console.error('❌ Generic email sending failed:', error.message);
        console.error('🔧 SMTP Config:', {
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            user: process.env.EMAIL_USER
        });
        throw error;
    }
};

// Generate 6-digit OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP email
const sendOTPEmail = async (email, otp, type = 'registration') => {
    try {
        const subject = type === 'registration' ? 'Verify Your Account - Prints Matrix' : 'Reset Your Password - Prints Matrix';
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #1e40af 0%, #0d9488 100%); padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0;">
                    <h1 style="color: white; margin: 0; font-size: 28px;">Prints Matrix</h1>
                    <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">${type === 'registration' ? 'Account Verification' : 'Password Reset'}</p>
                </div>
                <div style="background: white; padding: 40px 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                    <h2 style="color: #333; margin-top: 0;">${type === 'registration' ? 'Verify Your Account' : 'Reset Your Password'}</h2>
                    <p style="color: #666; font-size: 16px; line-height: 1.6;">Hello!</p>
                    <p style="color: #666; font-size: 16px; line-height: 1.6;">
                        ${type === 'registration' ? 'Thank you for registering with Prints Matrix. Your OTP code is:' : 'We received a request to reset your password. Your OTP code is:'}
                    </p>
                    <div style="background-color: #f8f9fa; border: 2px dashed #1e40af; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
                        <span style="font-size: 32px; font-weight: bold; color: #1e40af; letter-spacing: 8px; font-family: 'Courier New', monospace;">${otp}</span>
                    </div>
                    <p style="color: #666; font-size: 14px; margin-bottom: 30px;">
                        This code will expire in <strong>10 minutes</strong>. Please use it to ${type === 'registration' ? 'verify your account' : 'reset your password'}.
                    </p>
                    <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin-top: 20px;">
                        <p style="color: #856404; margin: 0; font-size: 14px;">
                            <strong>Security Notice:</strong> If you didn't request this, please ignore this email. Your account remains secure.
                        </p>
                    </div>
                    <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                        <p style="color: #999; font-size: 12px; margin: 0;">
                            This is an automated message from Prints Matrix. Please do not reply to this email.
                        </p>
                    </div>
                </div>
            </div>
        `;

        // Use the reused function
        return await sendEmail({ to: email, subject, html });

    } catch (error) {
        console.error('❌ Email sending failed:', error.message);
        console.error('🔧 Full error details:', error);

        // For development, also log the OTP so we can test
        console.log('🔧 DEV MODE: OTP is:', otp, '- You can use this for testing if email fails');

        // Allow flow to continue even if email fails (CRITICAL for Render deployment with bad creds)
        console.log('⚠️ Email failed but continuing flow. Please fix SMTP credentials.');
        return { messageId: 'error-fallback', originalError: error };
    }
};;

module.exports = {
    generateOTP,
    sendOTPEmail,
    sendEmail
};