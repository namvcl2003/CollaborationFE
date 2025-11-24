#!/bin/bash

echo "🔍 Checking required files..."

files=(
  "src/api/axios.js"
  "src/api/auth.js"
  "src/api/documents.js"
  "src/api/users.js"
  "src/api/workflow.js"
  "src/api/notifications.js"
  "src/components/common/Button.jsx"
  "src/components/common/Modal.jsx"
  "src/components/common/Loading.jsx"
  "src/components/common/StatusBadge.jsx"
  "src/components/auth/LoginForm.jsx"
  "src/components/auth/ProtectedRoute.jsx"
  "src/components/layout/Layout.jsx"
  "src/components/layout/Navbar.jsx"
  "src/components/layout/Sidebar.jsx"
  "src/components/documents/DocumentCard.jsx"
  "src/components/documents/DocumentList.jsx"
  "src/components/documents/DocumentForm.jsx"
  "src/components/documents/DocumentDetail.jsx"
  "src/components/documents/DocumentVersions.jsx"
  "src/components/documents/CollaboraEditor.jsx"
  "src/components/workflow/WorkflowActions.jsx"
  "src/components/workflow/WorkflowHistory.jsx"
  "src/components/workflow/SubmitModal.jsx"
  "src/pages/Login.jsx"
  "src/pages/Dashboard.jsx"
  "src/pages/Documents.jsx"
  "src/pages/CreateDocument.jsx"
  "src/pages/DocumentDetails.jsx"
  "src/pages/MyAssignments.jsx"
  "src/pages/Notifications.jsx"
  "src/store/authStore.js"
  "src/utils/constants.js"
  "src/utils/helpers.js"
  "src/App.jsx"
  "src/main.jsx"
  "src/index.css"
)

missing=0
for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "✅ $file"
  else
    echo "❌ MISSING: $file"
    missing=$((missing + 1))
  fi
done

echo ""
if [ $missing -eq 0 ]; then
  echo "✨ All files present!"
else
  echo "⚠️  Missing $missing file(s)"
fi