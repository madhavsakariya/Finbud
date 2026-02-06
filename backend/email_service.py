"""
Email Service for OTP and Password Reset
Uses Gmail SMTP to send emails
"""

import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import random
import string

# Email Configuration
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587
SENDER_EMAIL = "madhavvsakariya@gmail.com"  # Change this
SENDER_PASSWORD = "xyuzqqdutmewmlbu"  # Gmail App Password (not regular password)

def generate_otp(length=6):
    """Generate a random OTP"""
    return ''.join(random.choices(string.digits, k=length))

def send_otp_email(recipient_email, otp, name="User"):
    """Send OTP email to user"""
    try:
        # Create message
        message = MIMEMultipart("alternative")
        message["Subject"] = "🔐 FinBud AI - Password Reset OTP"
        message["From"] = f"FinBud AI <{SENDER_EMAIL}>"
        message["To"] = recipient_email

        # HTML email template
        html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                }}
                .container {{
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    border-radius: 10px;
                    padding: 30px;
                    text-align: center;
                }}
                .logo {{
                    font-size: 48px;
                    margin-bottom: 20px;
                }}
                h1 {{
                    color: white;
                    margin: 0 0 10px 0;
                }}
                .subtitle {{
                    color: rgba(255, 255, 255, 0.9);
                    margin-bottom: 30px;
                }}
                .otp-box {{
                    background: white;
                    border-radius: 10px;
                    padding: 30px;
                    margin: 20px 0;
                }}
                .otp-code {{
                    font-size: 42px;
                    font-weight: bold;
                    letter-spacing: 10px;
                    color: #667eea;
                    margin: 20px 0;
                    font-family: monospace;
                }}
                .info {{
                    color: #666;
                    font-size: 14px;
                    margin-top: 20px;
                }}
                .warning {{
                    background: #fff3cd;
                    border-left: 4px solid #ffc107;
                    padding: 15px;
                    margin-top: 20px;
                    text-align: left;
                    border-radius: 5px;
                }}
                .footer {{
                    color: rgba(255, 255, 255, 0.8);
                    font-size: 12px;
                    margin-top: 30px;
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="logo">💰</div>
                <h1>Password Reset Request</h1>
                <p class="subtitle">Hi {name},</p>
                
                <div class="otp-box">
                    <p>Your One-Time Password (OTP) is:</p>
                    <div class="otp-code">{otp}</div>
                    <p class="info">
                        ⏱️ This OTP will expire in <strong>10 minutes</strong><br>
                        🔒 Do not share this code with anyone
                    </p>
                </div>
                
                <div class="warning">
                    <strong>⚠️ Security Notice</strong><br>
                    If you didn't request this password reset, please ignore this email.
                    Your account is still secure.
                </div>
                
                <div class="footer">
                    <p>This is an automated email from FinBud AI</p>
                    <p>© 2024 FinBud AI. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        """

        # Attach HTML content
        part = MIMEText(html, "html")
        message.attach(part)

        # Send email
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(SENDER_EMAIL, SENDER_PASSWORD)
            server.send_message(message)
        
        print(f"✅ OTP email sent to {recipient_email}")
        return True
        
    except Exception as e:
        print(f"❌ Email sending failed: {e}")
        return False

def send_password_reset_confirmation(recipient_email, name="User"):
    """Send confirmation email after password reset"""
    try:
        message = MIMEMultipart("alternative")
        message["Subject"] = "✅ FinBud AI - Password Successfully Reset"
        message["From"] = f"FinBud AI <{SENDER_EMAIL}>"
        message["To"] = recipient_email

        html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                }}
                .container {{
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    border-radius: 10px;
                    padding: 30px;
                    text-align: center;
                }}
                .success-icon {{
                    font-size: 64px;
                    margin-bottom: 20px;
                }}
                h1 {{
                    color: white;
                    margin: 0 0 20px 0;
                }}
                .content {{
                    background: white;
                    border-radius: 10px;
                    padding: 30px;
                    margin: 20px 0;
                    text-align: left;
                }}
                .footer {{
                    color: rgba(255, 255, 255, 0.8);
                    font-size: 12px;
                    margin-top: 20px;
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="success-icon">✅</div>
                <h1>Password Successfully Reset</h1>
                
                <div class="content">
                    <p>Hi {name},</p>
                    <p>Your password has been successfully reset. You can now login with your new password.</p>
                    <p><strong>If you didn't make this change:</strong></p>
                    <ul>
                        <li>Contact our support team immediately</li>
                        <li>Change your password again</li>
                        <li>Review your account activity</li>
                    </ul>
                </div>
                
                <div class="footer">
                    <p>© 2024 FinBud AI. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        """

        part = MIMEText(html, "html")
        message.attach(part)

        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(SENDER_EMAIL, SENDER_PASSWORD)
            server.send_message(message)
        
        print(f"✅ Confirmation email sent to {recipient_email}")
        return True
        
    except Exception as e:
        print(f"❌ Email sending failed: {e}")
        return False

# Test function
if __name__ == "__main__":
    print("Testing email service...")
    test_otp = generate_otp()
    print(f"Generated OTP: {test_otp}")
    
    # Test with your email
    test_email = "test@example.com"  # Change this to your email
    if send_otp_email(test_email, test_otp, "Test User"):
        print("✅ Email test successful!")
    else:
        print("❌ Email test failed!")