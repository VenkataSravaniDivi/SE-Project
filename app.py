from flask import Flask, request, jsonify, send_from_directory
import os

app = Flask(__name__)
TEMPLATES_FOLDER = './templates'
os.makedirs(TEMPLATES_FOLDER, exist_ok=True)

# Upload a template
@app.route('/templates', methods=['POST'])
def upload_template():
    if 'file' not in request.files:
        return jsonify({"error": "No file part in the request"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    # Validate file format
    if not file.filename.endswith(('.docx', '.html')):
        return jsonify({"error": "Invalid file format. Only .docx and .html are supported"}), 400

    # Save file
    file.save(os.path.join(TEMPLATES_FOLDER, file.filename))
    return jsonify({"message": "Template uploaded successfully", "filename": file.filename}), 201

# List templates
@app.route('/templates', methods=['GET'])
def list_templates():
    templates = os.listdir(TEMPLATES_FOLDER)
    return jsonify(templates)

# Delete a template
@app.route('/templates/<filename>', methods=['DELETE'])
def delete_template(filename):
    path = os.path.join(TEMPLATES_FOLDER, filename)
    if os.path.exists(path):
        os.remove(path)
        return jsonify({"message": "Template deleted successfully"}), 200
    return jsonify({"error": "File not found"}), 404

# Download a template
@app.route('/templates/<filename>', methods=['GET'])
def download_template(filename):
    return send_from_directory(TEMPLATES_FOLDER, filename)

if __name__ == '__main__':
    app.run(debug=True)
