document.addEventListener("DOMContentLoaded", () => {
  const templateList = document.getElementById("templateList");
  const mappingContainer = document.getElementById("mappingContainer");
  const alertMessage = document.getElementById("alertMessage");
  let uploadedTemplate = null;
  let uploadedDataFields = [];

  // Utility: Show Alert
  function showAlert(message, type = "info") {
      alertMessage.textContent = message;
      alertMessage.className = `alert alert-${type}`;
      alertMessage.style.display = "block";
      setTimeout(() => (alertMessage.style.display = "none"), 3000);
  }

  // Upload Template
  document.getElementById("uploadTemplateForm").onsubmit = async (e) => {
      e.preventDefault();
      const file = document.getElementById("templateFile").files[0];
      if (!file) {
          showAlert("No template file selected.", "warning");
          return;
      }

      const formData = new FormData();
      formData.append("file", file);

      try {
          const response = await fetch("http://localhost:5000/templates", {
              method: "POST",
              body: formData,
          });
          const result = await response.json();
          if (response.ok) {
              showAlert(result.message, "success");
              loadTemplates();
          } else {
              showAlert(result.error || "Failed to upload template.", "danger");
          }
      } catch (error) {
          console.error("Template Upload Error:", error);
          showAlert("Error uploading template.", "danger");
      }
  };

  // Load Templates
  async function loadTemplates() {
      try {
          const response = await fetch("http://localhost:5000/templates");
          const templates = await response.json();
          templateList.innerHTML = ""; // Clear list
          templates.forEach((template) => {
              const li = document.createElement("li");
              li.textContent = template;
              li.onclick = () => {
                  uploadedTemplate = template;
                  showAlert(`Selected template: ${template}`, "success");
              };
              templateList.appendChild(li);
          });
      } catch (error) {
          console.error("Load Templates Error:", error);
          showAlert("Error loading templates.", "danger");
      }
  }

  // Upload Data
  document.getElementById("uploadDataForm").onsubmit = async (e) => {
      e.preventDefault();
      const file = document.getElementById("dataFile").files[0];
      if (!file) {
          showAlert("No data file selected.", "warning");
          return;
      }

      const formData = new FormData();
      formData.append("file", file);

      try {
          const response = await fetch("http://localhost:5000/upload-data", {
              method: "POST",
              body: formData,
          });
          const result = await response.json();
          if (response.ok) {
              uploadedDataFields = result.columns;
              loadDataFields(result.values); // Pass data values
              showAlert(result.message, "success");
          } else {
              showAlert(result.error || "Failed to upload data.", "danger");
          }
      } catch (error) {
          console.error("Data Upload Error:", error);
          showAlert("Error uploading data.", "danger");
      }
  };

  // Load Data Fields
  function loadDataFields(dataValues = []) {
      mappingContainer.innerHTML = ""; // Clear previous mappings

      uploadedDataFields.forEach((field, index) => {
          const value = dataValues[index] || ""; // Use dataset value if available
          const div = document.createElement("div");
          div.classList.add("field-mapping");
          div.innerHTML = `
              <label>${field}</label>
              <input type="text" id="${field}-input" class="form-control" placeholder="Enter value for ${field}" value="${value}">
          `;
          mappingContainer.appendChild(div);
      });
  }

  // Generate PDFs
  document.getElementById("generatePDFsBtn").onclick = async () => {
      if (!uploadedTemplate) {
          showAlert("Please select a template.", "warning");
          return;
      }

      const mappings = {};
      uploadedDataFields.forEach((field) => {
          const value = document.getElementById(`${field}-input`).value.trim();
          if (value) {
              mappings[field] = value;
          }
      });

      if (Object.keys(mappings).length === 0) {
          showAlert("Please fill in all required fields.", "warning");
          return;
      }

      try {
          const response = await fetch("http://localhost:5000/generate-pdfs", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ template: uploadedTemplate, mappings }),
          });
          const result = await response.json();
          if (response.ok) {
              showAlert(result.message, "success");
              loadGeneratedFiles(result.files);
          } else {
              showAlert(result.error || "Failed to generate PDFs.", "danger");
          }
      } catch (error) {
          console.error("Generate PDFs Error:", error);
          showAlert("Error generating PDFs.", "danger");
      }
  };

  // Load Generated Files
  function loadGeneratedFiles(files) {
      generatedFiles.innerHTML = ""; // Clear list
      files.forEach((file) => {
          const li = document.createElement("li");
          li.textContent = file;
          generatedFiles.appendChild(li);
      });
  }

  // Initial Load
  loadTemplates();
});
