from flask import Flask, request, jsonify, Response
import os
import pandas as pd
from io import BytesIO
from zipfile import ZipFile
from flask_mail import Mail, Message
from reportlab.pdfgen import canvas
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Configuration
UPLOAD_FOLDER = './uploads'
TEMPLATE_FOLDER = './templates'
OUTPUT_FOLDER = './outputs'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(TEMPLATE_FOLDER, exist_ok=True)
os.makedirs(OUTPUT_FOLDER, exist_ok=True)

# Email Configuration
app.config.update(
    MAIL_SERVER='smtp.gmail.com',
    MAIL_PORT=587,
    MAIL_USE_TLS=True,
    MAIL_USERNAME=os.getenv('dvsravani09@gmail.com'),
    MAIL_PASSWORD=os.getenv('Sravani@123')
)
mail = Mail(app)

# Template Management
@app.route('/templates', methods=['POST'])
def upload_template():
    if 'file' not in request.files:
        return jsonify({"error": "No file part in the request"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    if not file.filename.endswith(('.docx', '.html')):
        return jsonify({"error": "Invalid file format. Only .docx and .html are supported"}), 400

    file.save(os.path.join(TEMPLATE_FOLDER, file.filename))
    return jsonify({"message": "Template uploaded successfully", "filename": file.filename}), 201

@app.route('/templates', methods=['GET'])
def list_templates():
    templates = os.listdir(TEMPLATE_FOLDER)
    return jsonify(templates)

# Data Upload and Mapping
@app.route('/upload-data', methods=['POST'])
def upload_data():
    if 'file' not in request.files:
        return jsonify({"error": "No file part in the request"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    if not file.filename.endswith(('.csv', '.xlsx')):
        return jsonify({"error": "Invalid file format. Only .csv and .xlsx are supported"}), 400

    save_path = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(save_path)

    try:
        if file.filename.endswith('.csv'):
            data = pd.read_csv(save_path)
        else:
            data = pd.read_excel(save_path)
    except Exception as e:
        return jsonify({"error": f"Error parsing data file: {str(e)}"}), 400

    return jsonify({"message": "Data uploaded successfully", "columns": list(data.columns)}), 200

# PDF Generation
@app.route('/generate-pdfs', methods=['POST'])
def generate_pdfs():
    data = request.json
    template_name = data.get('template')
    mappings = data.get('mappings')
    output_files = []

    if not template_name or not mappings:
        return jsonify({"error": "Missing template or mappings"}), 400

    data_path = os.path.join(UPLOAD_FOLDER, data.get('data_file'))
    if not os.path.exists(data_path):
        return jsonify({"error": "Data file not found"}), 404

    if data_path.endswith('.csv'):
        df = pd.read_csv(data_path)
    else:
        df = pd.read_excel(data_path)

    for idx, row in df.iterrows():
        pdf_path = os.path.join(OUTPUT_FOLDER, f"output_{idx}.pdf")
        output_files.append(pdf_path)

        c = canvas.Canvas(pdf_path)
        for placeholder, column in mappings.items():
            if column not in row:
                return jsonify({"error": f"Column {column} not found in dataset"}), 400
            c.drawString(100, 750 - (20 * list(mappings.keys()).index(placeholder)), f"{placeholder}: {row[column]}")
        c.save()

    return jsonify({"message": "PDFs generated successfully", "files": output_files}), 200

if __name__ == '__main__':
    app.run(debug=True)
