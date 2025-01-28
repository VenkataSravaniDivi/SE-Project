const templateList = document.getElementById("templateList");
const dragArea = document.getElementById("dragArea");
const placeholderInput = document.getElementById("placeholderInput");
const placeholderList = document.getElementById("placeholderList");

// Fetch templates on page load
window.onload = async function () {
  await fetchTemplates();
};

// Fetch templates from the server
async function fetchTemplates() {
  const response = await fetch("http://localhost:5000/templates");
  const templates = await response.json();
  templateList.innerHTML = ""; // Clear the list
  templates.forEach((template) => addTemplateToUI(template));
}

// Add a template to the UI
function addTemplateToUI(templateName) {
  const li = document.createElement("li");
  li.innerHTML = `
    ${templateName}
    <button class="delete" onclick="deleteTemplate('${templateName}')">Delete</button>
  `;
  templateList.appendChild(li);
}

// Upload a template
document.getElementById("uploadTemplateForm").onsubmit = async function (e) {
  e.preventDefault();
  const file = document.getElementById("templateFile").files[0];
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("http://localhost:5000/templates", {
    method: "POST",
    body: formData,
  });

  if (response.ok) {
    const result = await response.json();
    addTemplateToUI(result.filename);
    alert("Template uploaded successfully!");
  } else {
    alert("Error uploading template");
  }
};

// Delete a template
async function deleteTemplate(templateName) {
  const response = await fetch(`http://localhost:5000/templates/${templateName}`, {
    method: "DELETE",
  });

  if (response.ok) {
    alert("Template deleted successfully!");
    await fetchTemplates();
  } else {
    alert("Error deleting template");
  }
}

// Drag-and-drop editor for templates
dragArea.addEventListener("dragover", (e) => {
  e.preventDefault();
  dragArea.classList.add("dragover");
});
dragArea.addEventListener("dragleave", () => {
  dragArea.classList.remove("dragover");
});
dragArea.addEventListener("drop", (e) => {
  e.preventDefault();
  dragArea.classList.remove("dragover");
  alert("Drag-and-drop editor not yet implemented!");
});

// Add placeholders
document.getElementById("addPlaceholderBtn").onclick = function () {
  const placeholder = placeholderInput.value.trim();
  if (placeholder) {
    const li = document.createElement("li");
    li.textContent = placeholder;
    placeholderList.appendChild(li);
    placeholderInput.value = ""; // Clear input
  }
};
