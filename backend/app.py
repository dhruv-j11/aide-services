from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime, timedelta
import uuid
import os
from dotenv import load_dotenv
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
import google.generativeai as genai

# Load environment variables
load_dotenv()

gemini_api_key = os.environ.get('GEMINI_API_KEY')
if gemini_api_key:
    try:
        genai.configure(api_key=gemini_api_key)
        model = genai.GenerativeModel('gemini-2.5-flash')
    except Exception as e:
        print(f"Error configuring model: {e}")
        model = None
else:
    model = None

app = Flask(__name__)
CORS(app)

# In-memory storage for patients (in production, use database)
patients = []
next_id = 1

def calculate_triage_score_with_ai(symptoms, urgency_level, visit_type, estimated_duration):
    """
    Calculate triage score based on symptoms and patient data
    """
    if not model:
        return calculate_triage_score_fallback(urgency_level, visit_type, estimated_duration)
    
    try:
        prompt = f"""
        As a medical triage assistant, analyze the following patient information and provide a triage score (1-100) and urgency classification.

        Patient Information:
        - Symptoms: {symptoms}
        - Self-reported urgency level: {urgency_level}/10
        - Visit type: {visit_type}
        - Estimated duration: {estimated_duration} minutes

        Please respond in this exact JSON format:
        {{
            "triage_score": <number between 1-100>,
            "urgency_classification": "<advisal|routine|moderate|urgent|critical>",
            "reasoning": "<brief explanation of the triage decision>",
            "priority_factors": ["<factor1>", "<factor2>", "<factor3>"]
        }}

        Guidelines:
        - Higher scores indicate higher priority
        - Consider symptom severity, potential for deterioration, and medical urgency
        - Critical (90-100): Life-threatening, immediate attention needed
        - Urgent (70-89): Serious but not immediately life-threatening
        - Moderate (50-69): Requires attention but can wait
        - Routine (30-49): Standard care, can wait longer
        - Advisal (1-29): Consultation or minor issues
        """
        
        response = model.generate_content(prompt)
        result = response.text.strip()
        
        import json
        try:
            clean_result = result
            if '```json' in result:
                clean_result = result.split('```json')[1].split('```')[0].strip()
            elif '```' in result:
                clean_result = result.split('```')[1].split('```')[0].strip()
            
            analysis_result = json.loads(clean_result)
            return {
                'triage_score': analysis_result.get('triage_score', urgency_level * 10),
                'urgency_classification': analysis_result.get('urgency_classification', 'routine'),
                'reasoning': analysis_result.get('reasoning', 'Analysis completed'),
                'priority_factors': analysis_result.get('priority_factors', [])
            }
        except json.JSONDecodeError as e:
            print(f"Failed to parse response as JSON: {e}")
            return calculate_triage_score_fallback(urgency_level, visit_type, estimated_duration)
            
    except Exception as e:
        print(f"Error in triage calculation: {e}")
        return calculate_triage_score_fallback(urgency_level, visit_type, estimated_duration)

def calculate_triage_score_fallback(urgency_level, visit_type, estimated_duration):
    """
    Fallback triage calculation when model is not available
    """
    base_score = urgency_level * 10
    
    # Adjust based on visit type
    if visit_type.lower() == 'emergency':
        base_score += 50
    elif visit_type.lower() == 'follow-up':
        base_score += 20
    elif visit_type.lower() == 'advisal':
        base_score -= 10
    
    # Duration adjustment (shorter visits get slight priority for efficiency)
    if estimated_duration <= 15:
        base_score += 5
    
    return {
        'triage_score': base_score,
        'urgency_classification': 'routine',
        'reasoning': 'Fallback calculation used',
        'priority_factors': ['self-reported urgency', 'visit type']
    }

def generate_advisal_message_with_ai(symptoms, visit_type, urgency_classification):
    """
    Generate advisal message based on symptoms and visit type
    """
    if not model:
        return generate_advisal_message_fallback(symptoms, visit_type)
    
    try:
        prompt = f"""
        As a medical assistant, provide a helpful advisal message for a patient based on their symptoms and visit information.

        Patient Information:
        - Symptoms: {symptoms}
        - Visit type: {visit_type}
        - Urgency classification: {urgency_classification}

        Please provide a helpful advisal message that:
        1. Acknowledges their symptoms
        2. Provides general self-care recommendations
        3. Indicates when to seek immediate medical attention
        4. Is encouraging and supportive
        5. Clearly states this is not medical advice

        Keep the message concise (2-3 sentences) and professional but warm.
        """
        
        response = model.generate_content(prompt)
        advisal = response.text.strip()
        
        advisal += "\n\n⚠️ This advisal does not constitute medical advice. Please consult with a healthcare professional for proper diagnosis and treatment."
        
        return advisal
        
    except Exception as e:
        print(f"Error generating advisal: {e}")
        return generate_advisal_message_fallback(symptoms, visit_type)

def generate_advisal_message_fallback(symptoms, visit_type):
    """
    Fallback advisal generation when model is not available
    """
    if not symptoms:
        return "Please continue monitoring your condition and follow up with the doctor as scheduled."
    
    lower_symptoms = symptoms.lower()
    
    if 'fever' in lower_symptoms:
        return "For fever, ensure adequate rest and hydration. Monitor temperature regularly and seek immediate care if it exceeds 104°F or persists beyond 3 days."
    elif 'pain' in lower_symptoms:
        return "For pain management, avoid any strenuous activity that may exacerbate symptoms. Apply ice if applicable (15 minutes on, 15 minutes off) and monitor for changes."
    elif 'cough' in lower_symptoms or 'cold' in lower_symptoms:
        return "Rest and hydration are key for respiratory symptoms. Use steam inhalation and monitor for difficulty breathing."
    else:
        return "Please monitor your symptoms carefully and report any significant changes to your healthcare provider."

def send_email_via_sendgrid(to_email, subject, body):
    """Send email using SendGrid"""
    sendgrid_key = os.environ.get('SENDGRID_API_KEY')
    
    if not sendgrid_key:
        print("Warning: SENDGRID_API_KEY not set. Email not sent.")
        return False
    
    try:
        message = Mail(
            from_email='aide.servicesdemo@gmail.com',  # Change this to the email you want to receive emails
            to_emails=to_email,
            subject=subject,
            plain_text_content=body
        )
        sg = SendGridAPIClient(sendgrid_key)
        response = sg.send(message)
        
        if response.status_code == 202:
            print(f"Email sent successfully to {to_email}")
            return True
        else:
            print(f"Failed to send email: Status {response.status_code}")
            print(f"Response body: {response.body}")
            return False
    except Exception as e:
        print(f"Error sending email: {e}")
        print(f"Details: {type(e).__name__}: {str(e)}")
        return False

@app.route('/api/patient/intake', methods=['POST'])
def patient_intake():
    """Handle patient intake and triage"""
    global next_id
    
    try:
        data = request.json
        
        # Validate required fields
        required_fields = ['name', 'email', 'phone', 'symptoms', 'urgencyLevel', 'visitType', 'estimatedDuration']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        analysis = calculate_triage_score_with_ai(
            data.get('symptoms', ''),
            data['urgencyLevel'],
            data['visitType'],
            data['estimatedDuration']
        )
        
        triage_score = analysis['triage_score']
        urgency_classification = analysis['urgency_classification']
        reasoning = analysis['reasoning']
        priority_factors = analysis['priority_factors']
        
        advisal = generate_advisal_message_with_ai(
            data.get('symptoms', ''),
            data['visitType'],
            urgency_classification
        )
        
        # Create patient record
        patient = {
            'id': next_id,
            'name': data['name'],
            'email': data['email'],
            'phone': data['phone'],
            'symptoms': data['symptoms'],
            'urgencyLevel': data['urgencyLevel'],
            'visitType': data['visitType'],
            'estimatedDuration': data['estimatedDuration'],
            'triageScore': triage_score,
            'urgencyClassification': urgency_classification,
            'reasoning': reasoning,
            'priorityFactors': priority_factors,
            'advisal': advisal,
            'timestamp': datetime.now().isoformat(),
            'status': 'waiting',
            'position': 0  # Will be calculated
        }
        
        # Add to queue
        patients.append(patient)
        
        # Sort patients by triage score (highest first)
        patients.sort(key=lambda x: x['triageScore'], reverse=True)
        
        # Update positions
        for i, p in enumerate(patients):
            p['position'] = i + 1
        
        # Find estimated wait time
        estimated_wait = 0
        for i, p in enumerate(patients):
            if p['id'] == patient['id']:
                continue
            if p['triageScore'] > triage_score:
                estimated_wait += p.get('estimatedDuration', 30)
        
        email_subject = 'AIDE - Your Visit Summary'
        email_body = f"""Thank you for using AIDE, {data['name']}!

Visit Summary:
- Purpose: {data['visitType']}
- Urgency Level: {data['urgencyLevel']}/10
- Classification: {urgency_classification.title()}
- Estimated Wait Time: {estimated_wait} minutes
- Your Position in Queue: {patient['position']}

Analysis:
{reasoning}

Priority Factors: {', '.join(priority_factors)}

Advisal:
{advisal}

AIDE Team
"""
        
        email_sent = send_email_via_sendgrid(data['email'], email_subject, email_body)
        
        next_id += 1
        
        return jsonify({
            'success': True,
            'patient': patient,
            'estimatedWait': estimated_wait,
            'emailSent': email_sent,
            'analysis': {
                'urgencyClassification': urgency_classification,
                'reasoning': reasoning,
                'priorityFactors': priority_factors
            }
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/patients', methods=['GET'])
def get_patients():
    """Get all patients in queue"""
    return jsonify({
        'patients': patients,
        'total': len(patients)
    }), 200

@app.route('/api/patients/<int:patient_id>/complete', methods=['PUT'])
def complete_patient(patient_id):
    """Mark a patient as completed and remove from queue"""
    global patients
    
    patient = next((p for p in patients if p['id'] == patient_id), None)
    if not patient:
        return jsonify({'error': 'Patient not found'}), 404
    
    patient['status'] = 'completed'
    patient['completedAt'] = datetime.now().isoformat()
    
    # Remove from active queue
    patients = [p for p in patients if p['status'] != 'completed']
    
    # Recalculate positions
    for i, p in enumerate(patients):
        p['position'] = i + 1
    
    return jsonify({'success': True, 'patient': patient}), 200

@app.route('/api/patients/<int:patient_id>/cancel', methods=['PUT'])
def cancel_patient(patient_id):
    """Cancel a patient from queue"""
    global patients
    
    patient = next((p for p in patients if p['id'] == patient_id), None)
    if not patient:
        return jsonify({'error': 'Patient not found'}), 404
    
    patient['status'] = 'cancelled'
    
    # Remove from active queue
    patients = [p for p in patients if p['status'] not in ['cancelled', 'completed']]
    
    # Recalculate positions
    for i, p in enumerate(patients):
        p['position'] = i + 1
    
    return jsonify({'success': True}), 200

@app.route('/api/stats', methods=['GET'])
def get_stats():
    """Get statistics about the queue"""
    active_patients = [p for p in patients if p['status'] == 'waiting']
    total_wait_time = sum(p.get('estimatedDuration', 30) for p in active_patients)
    
    return jsonify({
        'totalWaiting': len(active_patients),
        'avgWaitTime': total_wait_time / len(active_patients) if active_patients else 0,
        'byUrgency': {
            'low': len([p for p in active_patients if 1 <= p['urgencyLevel'] <= 3]),
            'moderate': len([p for p in active_patients if 4 <= p['urgencyLevel'] <= 7]),
            'high': len([p for p in active_patients if 8 <= p['urgencyLevel'] <= 10])
        }
    }), 200

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'timestamp': datetime.now().isoformat()}), 200

if __name__ == '__main__':
    app.run(debug=True, port=5001, host='0.0.0.0')

