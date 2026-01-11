# 🏛️ JKM DOCUMENTS TAB - IMPLEMENTATION PLAN

## ✅ CONSTITUTIONAL ACKNOWLEDGMENT LOCKED

**Google Drive = Absolute Source of Truth**
- App is metadata mirror only
- No file storage in app
- Drive-anchor protocol enforced
- Matter-centric organization
- Archive-only (no hard deletes)

---

## 📊 CURRENT STATUS

### ✅ COMPLETED:
1. **Calendar Tab**: Full event CRUD with Google Calendar-style modal
2. **Tasks Tab**: Constitutional execution engine with KPIs
3. **Documents Data**: Enhanced with Drive metadata fields in MOCK_DATA

### ⏳ NEXT: Documents Tab Implementation

---

## 🏗️ DOCUMENTS TAB ARCHITECTURE

### **Three-Pane Layout:**

**PANE A: Navigator (Left - 280px)**
- Firm Drive folder tree
- Matter folders
- Client folders
- Sync health indicator
- Quick filters (Active/Archived)

**PANE B: Registry (Center - Flex)**
- High-density document table
- Columns: Icon | Name | Matter | Modified | Size | Owner | Status
- Sortable headers
- Upload button (Drive upload)
- Search/filter bar

**PANE C: Preview Panel (Right - 500px)**
- Google Drive iframe preview
- Document metadata
- Version history
- Audit log
- Action buttons (Archive/Download)

---

## 📝 IMPLEMENTATION STEPS

### Step 1: Create DocumentsPage Component
```javascript
const DocumentsPage = ({ documents, matters, onDocumentClick }) => {
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [filter, setFilter] = useState('Active');
  
  // Drive sync health monitor
  const getSyncHealth = () => { /* ... */ };
  
  // Document actions
  const handleArchive = (docId) => { /* Archive to Drive Trash */ };
  const handleUpload = () => { /* Trigger Drive upload */ };
  
  return (
    <div className="flex gap-6 h-full">
      {/* Pane A: Navigator */}
      {/* Pane B: Registry */}
      {/* Pane C: Preview */}
    </div>
  );
};
```

### Step 2: Add to Main App Switch
```javascript
case 'documents':
  return <DocumentsPage 
    documents={MOCK_DATA.documents} 
    matters={MOCK_DATA.matters}
    onDocumentClick={handleDocumentClick}
  />;
```

### Step 3: Implement Drive Upload
- Use Google Drive Picker API
- Upload directly to Drive
- Mirror metadata to app state
- Log audit entry

### Step 4: Implement Preview Panel
- Use Drive iframe embed
- Display version history
- Show audit log
- Matter context

---

## 🔒 FORTRESS PROTOCOL COMPLIANCE

✅ **Drive-Anchor**: All files in Google Drive  
✅ **Matter-Bound**: Every doc linked to matter  
✅ **Archive-Only**: No hard deletes  
✅ **Audit-First**: All actions logged  
✅ **Fail-Soft**: Offline mode with cached data  
✅ **Permissions**: Drive permissions respected  

---

## 🚀 READY TO IMPLEMENT

Due to file size constraints, I recommend:

**Option A**: Create separate `DocumentsPage.jsx` component file
**Option B**: Implement in smaller incremental steps
**Option C**: Focus on one pane at a time

**Which approach would you prefer?**
