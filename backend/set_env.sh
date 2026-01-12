#!/bin/bash

# Set environment variables for AIDE backend
# Note: Set these environment variables in your system or use a .env file
# export SENDGRID_API_KEY="your_sendgrid_api_key_here"
# export GEMINI_API_KEY="your_gemini_api_key_here"

# Activate virtual environment and run the app
source venv/bin/activate
python3 app.py
