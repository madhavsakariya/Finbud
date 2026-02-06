"""
Flask Authentication API with Password Reset
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
import datetime
from functools import wraps
import os
from email_service import generate_otp, send_otp_email, send_password_reset_confirmation

app = Flask(__name__)
CORS(app)

# Configuration
app.config['SECRET_KEY'] = 'your-secret-key-change-this-in-production'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///finbud_users.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# User Model
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    
    def __repr__(self):
        return f'<User {self.email}>'

# OTP Model for password reset
class PasswordResetOTP(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), nullable=False)
    otp = db.Column(db.String(6), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    expires_at = db.Column(db.DateTime, nullable=False)
    used = db.Column(db.Boolean, default=False)
    
    def is_valid(self):
        """Check if OTP is still valid"""
        return not self.used and datetime.datetime.utcnow() < self.expires_at

# Create database tables
with app.app_context():
    db.create_all()
    print("✅ Database tables created!")

# Token required decorator
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        
        if not token:
            return jsonify({'error': 'Token is missing'}), 401
        
        try:
            if token.startswith('Bearer '):
                token = token[7:]
            
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
            current_user = User.query.get(data['user_id'])
            
            if not current_user:
                return jsonify({'error': 'Invalid token'}), 401
                
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token has expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Invalid token'}), 401
        
        return f(current_user, *args, **kwargs)
    
    return decorated

# ==================== AUTHENTICATION ROUTES ====================

@app.route('/api/signup', methods=['POST'])
def signup():
    """Register a new user"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        name = data.get('name', '').strip()
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        
        if not name:
            return jsonify({'error': 'Name is required'}), 400
        
        if not email:
            return jsonify({'error': 'Email is required'}), 400
        
        if not password:
            return jsonify({'error': 'Password is required'}), 400
        
        if len(password) < 8:
            return jsonify({'error': 'Password must be at least 8 characters'}), 400
        
        existing_user = User.query.filter_by(email=email).first()
        if existing_user:
            return jsonify({'error': 'Email already registered'}), 409
        
        hashed_password = generate_password_hash(password, method='pbkdf2:sha256')
        
        new_user = User(
            name=name,
            email=email,
            password=hashed_password
        )
        
        db.session.add(new_user)
        db.session.commit()
        
        token = jwt.encode({
            'user_id': new_user.id,
            'exp': datetime.datetime.utcnow() + datetime.timedelta(days=7)
        }, app.config['SECRET_KEY'], algorithm='HS256')
        
        return jsonify({
            'message': 'User created successfully',
            'token': token,
            'user': {
                'id': new_user.id,
                'name': new_user.name,
                'email': new_user.email
            }
        }), 201
        
    except Exception as e:
        db.session.rollback()
        print(f"Signup error: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/login', methods=['POST'])
def login():
    """Authenticate user and return token"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        
        if not email or not password:
            return jsonify({'error': 'Email and password are required'}), 400
        
        user = User.query.filter_by(email=email).first()
        
        if not user:
            return jsonify({'error': 'Invalid email or password'}), 401
        
        if not check_password_hash(user.password, password):
            return jsonify({'error': 'Invalid email or password'}), 401
        
        token = jwt.encode({
            'user_id': user.id,
            'exp': datetime.datetime.utcnow() + datetime.timedelta(days=7)
        }, app.config['SECRET_KEY'], algorithm='HS256')
        
        return jsonify({
            'message': 'Login successful',
            'token': token,
            'user': {
                'id': user.id,
                'name': user.name,
                'email': user.email
            }
        }), 200
        
    except Exception as e:
        print(f"Login error: {e}")
        return jsonify({'error': 'Internal server error'}), 500

# ==================== PASSWORD RESET ROUTES ====================

@app.route('/api/forgot-password', methods=['POST'])
def forgot_password():
    """Send OTP to user's email"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        email = data.get('email', '').strip().lower()
        
        if not email:
            return jsonify({'error': 'Email is required'}), 400
        
        # Check if user exists
        user = User.query.filter_by(email=email).first()
        
        if not user:
            # User not found - tell them to sign up
            return jsonify({
                'error': 'User not found. Please sign up first.'
            }), 404
        
        # Generate OTP
        otp = generate_otp()
        
        # Delete old OTPs for this email
        PasswordResetOTP.query.filter_by(email=email).delete()
        
        # Create new OTP record
        expires_at = datetime.datetime.utcnow() + datetime.timedelta(minutes=10)
        new_otp = PasswordResetOTP(
            email=email,
            otp=otp,
            expires_at=expires_at
        )
        
        db.session.add(new_otp)
        db.session.commit()
        
        # Send email
        email_sent = send_otp_email(email, otp, user.name)
        
        if email_sent:
            return jsonify({
                'message': 'OTP sent to your email',
                'otp': otp  # REMOVE THIS IN PRODUCTION - only for testing
            }), 200
        else:
            return jsonify({'error': 'Failed to send email. Please try again.'}), 500
        
    except Exception as e:
        db.session.rollback()
        print(f"Forgot password error: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/verify-otp', methods=['POST'])
def verify_otp():
    """Verify OTP"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        email = data.get('email', '').strip().lower()
        otp = data.get('otp', '').strip()
        
        if not email or not otp:
            return jsonify({'error': 'Email and OTP are required'}), 400
        
        # Find OTP record
        otp_record = PasswordResetOTP.query.filter_by(
            email=email,
            otp=otp
        ).order_by(PasswordResetOTP.created_at.desc()).first()
        
        if not otp_record:
            return jsonify({'error': 'Invalid OTP'}), 401
        
        if not otp_record.is_valid():
            return jsonify({'error': 'OTP has expired or already been used'}), 401
        
        # OTP is valid
        return jsonify({
            'message': 'OTP verified successfully',
            'reset_token': otp  # Use OTP as temporary reset token
        }), 200
        
    except Exception as e:
        print(f"Verify OTP error: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/reset-password', methods=['POST'])
def reset_password():
    """Reset password with verified OTP"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        email = data.get('email', '').strip().lower()
        otp = data.get('otp', '').strip()
        new_password = data.get('new_password', '')
        
        if not email or not otp or not new_password:
            return jsonify({'error': 'Email, OTP, and new password are required'}), 400
        
        if len(new_password) < 8:
            return jsonify({'error': 'Password must be at least 8 characters'}), 400
        
        # Verify OTP again
        otp_record = PasswordResetOTP.query.filter_by(
            email=email,
            otp=otp
        ).order_by(PasswordResetOTP.created_at.desc()).first()
        
        if not otp_record or not otp_record.is_valid():
            return jsonify({'error': 'Invalid or expired OTP'}), 401
        
        # Get user
        user = User.query.filter_by(email=email).first()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Update password
        user.password = generate_password_hash(new_password, method='pbkdf2:sha256')
        
        # Mark OTP as used
        otp_record.used = True
        
        db.session.commit()
        
        # Send confirmation email
        send_password_reset_confirmation(email, user.name)
        
        return jsonify({
            'message': 'Password reset successfully'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        print(f"Reset password error: {e}")
        return jsonify({'error': 'Internal server error'}), 500

# ==================== OTHER ROUTES ====================

@app.route('/api/me', methods=['GET'])
@token_required
def get_current_user(current_user):
    """Get current user information"""
    return jsonify({
        'user': {
            'id': current_user.id,
            'name': current_user.name,
            'email': current_user.email,
            'created_at': current_user.created_at.isoformat()
        }
    }), 200

@app.route('/api/users', methods=['GET'])
def get_all_users():
    """Get all users (for debugging)"""
    users = User.query.all()
    return jsonify({
        'users': [{
            'id': user.id,
            'name': user.name,
            'email': user.email,
            'created_at': user.created_at.isoformat()
        } for user in users]
    }), 200

@app.route('/api/health', methods=['GET'])
def health():
    """Health check"""
    user_count = User.query.count()
    return jsonify({
        'status': 'healthy',
        'database': 'connected',
        'users_count': user_count
    }), 200

if __name__ == '__main__':
    print("\n" + "="*70)
    print("🔐 FINBUD AUTHENTICATION API WITH PASSWORD RESET")
    print("="*70)
    print("📡 Server: http://localhost:5001")
    print("🗄️  Database: SQLite (finbud_users.db)")
    print("="*70)
    print("\n📋 Available Endpoints:")
    print("   POST   /api/signup              - Register new user")
    print("   POST   /api/login               - Login user")
    print("   POST   /api/forgot-password     - Request password reset OTP")
    print("   POST   /api/verify-otp          - Verify OTP")
    print("   POST   /api/reset-password      - Reset password with OTP")
    print("   GET    /api/me                  - Get current user")
    print("   GET    /api/users               - List all users")
    print("   GET    /api/health              - Health check")
    print("="*70 + "\n")
    
    app.run(host='0.0.0.0', port=5001, debug=True)