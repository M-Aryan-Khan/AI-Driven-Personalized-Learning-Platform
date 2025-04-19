import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv
from jinja2 import Environment, FileSystemLoader
import logging
from datetime import datetime

# Load environment variables
load_dotenv()

# Email configuration
SMTP_SERVER = os.getenv("SMTP_SERVER")
SMTP_PORT = int(os.getenv("SMTP_PORT", 587))
SMTP_USERNAME = os.getenv("SMTP_USERNAME")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")
EMAIL_FROM = os.getenv("EMAIL_FROM")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

# Set up Jinja2 environment for email templates
template_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "templates")
env = Environment(loader=FileSystemLoader(template_dir))

logger = logging.getLogger(__name__)

def send_email(to_email, subject, template_name, context):
    """
    Send an email using a template
    
    Args:
        to_email (str): Recipient email address
        subject (str): Email subject
        template_name (str): Name of the template file (without extension)
        context (dict): Context variables for the template
    
    Returns:
        bool: True if email was sent successfully, False otherwise
    """
    try:
        # Add current year to context for copyright notices
        context["current_year"] = datetime.now().year
        
        # If in development mode without SMTP credentials, just log the email
        if not all([SMTP_SERVER, SMTP_USERNAME, SMTP_PASSWORD]):
            logger.info(f"[DEV MODE] Would send email to {to_email}")
            logger.info(f"Subject: {subject}")
            logger.info(f"Template: {template_name}")
            logger.info(f"Context: {context}")
            return True
            
        # Create message
        message = MIMEMultipart()
        message["From"] = EMAIL_FROM
        message["To"] = to_email
        message["Subject"] = subject
        
        # Render template
        template = env.get_template(f"{template_name}.html")
        html_content = template.render(**context)
        
        # Attach HTML content
        message.attach(MIMEText(html_content, "html"))
        
        # Connect to SMTP server and send email
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USERNAME, SMTP_PASSWORD)
            server.send_message(message)
        
        logger.info(f"Email sent to {to_email}")
        return True
    
    except Exception as e:
        logger.error(f"Failed to send email to {to_email}: {str(e)}")
        return False

def send_verification_code_email(user_email, first_name, verification_code):
    """Send email with verification code"""
    context = {
        "first_name": first_name,
        "verification_code": verification_code,
        "frontend_url": FRONTEND_URL
    }
    return send_email(
        user_email,
        "Verify your Synapse account",
        "verification_code_email",
        context
    )

def send_password_reset_code_email(user_email, first_name, reset_code):
    """Send password reset code email"""
    context = {
        "first_name": first_name,
        "reset_code": reset_code,
        "frontend_url": FRONTEND_URL
    }
    return send_email(
        user_email,
        "Reset your Synapse password",
        "password_reset_code",
        context
    )

def send_welcome_email(user_email, user_name, role):
    """Send welcome email after account verification"""
    context = {
        "name": user_name,
        "role": role,
        "frontend_url": FRONTEND_URL
    }
    return send_email(
        user_email,
        "Welcome to Synapse!",
        "welcome_email",
        context
    )

def send_session_confirmation_email(user_email, user_name, session_details):
    """Send session confirmation email"""
    context = {
        "name": user_name,
        "session": session_details,
        "frontend_url": FRONTEND_URL
    }
    return send_email(
        user_email,
        "Your Synapse session is confirmed",
        "session_confirmation",
        context
    )
