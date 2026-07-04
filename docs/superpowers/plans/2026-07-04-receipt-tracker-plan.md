# Receipt Expense Tracker Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a single-file web app for tracking expenses with optional photo receipts, running entirely in the browser with no server.

**Architecture:** Single HTML file with inline CSS and JavaScript. Uses IndexedDB for persistent storage and jsPDF (CDN) for PDF export. Mobile-first design optimized for Android Chrome.

**Tech Stack:** Vanilla JavaScript (ES6+), IndexedDB API, jsPDF (CDN), inline CSS

---

### Task 1: Create Project Structure

**Files:**
- Create: `index.html`
- Create: `styles.css`
- Create: `app.js`

- [ ] **Step 1: Create index.html with basic structure**

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Receipt Tracker</title>
    <link rel="stylesheet" href="styles.css">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
</head>
<body>
    <div class="container">
        <header>
            <h1>Receipt Tracker</h1>
            <div class="total">Total: <span id="total-amount">0.00</span></div>
        </header>
        
        <main>
            <section id="add-entry" class="form-section">
                <h2>Add Entry</h2>
                <form id="expense-form">
                    <div class="form-group">
                        <label for="amount">Amount</label>
                        <input type="number" id="amount" step="0.01" placeholder="0.00" required>
                    </div>
                    <div class="form-group">
                        <label for="description">Description</label>
                        <input type="text" id="description" placeholder="What was this for?" required>
                    </div>
                    <div class="form-group">
                        <label for="image-input">Receipt Image (optional)</label>
                        <input type="file" id="image-input" accept="image/*" capture="environment">
                    </div>
                    <div id="image-preview" class="image-preview" hidden>
                        <img id="preview-img" src="" alt="Preview">
                        <button type="button" id="remove-image" class="btn-small">Remove</button>
                    </div>
                    <button type="submit" class="btn-primary">Save Entry</button>
                </form>
            </section>
            
            <section id="entries" class="entries-section">
                <div class="section-header">
                    <h2>Entries</h2>
                    <button id="export-pdf" class="btn-secondary">Export PDF</button>
                </div>
                <div id="entries-list" class="entries-list">
                    <p class="empty-state">No entries yet. Add your first expense above.</p>
                </div>
            </section>
        </main>
    </div>
    
    <script src="app.js"></script>
</body>
</html>
```

- [ ] **Step 2: Create styles.css with mobile-first design**

```css
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background-color: #f5f5f5;
    color: #333;
    line-height: 1.5;
}

.container {
    max-width: 600px;
    margin: 0 auto;
    padding: 16px;
}

header {
    background-color: #2c3e50;
    color: white;
    padding: 16px;
    border-radius: 8px;
    margin-bottom: 16px;
}

header h1 {
    font-size: 1.5rem;
    margin-bottom: 4px;
}

.total {
    font-size: 1.25rem;
    font-weight: bold;
}

.form-section {
    background: white;
    padding: 16px;
    border-radius: 8px;
    margin-bottom: 16px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.form-section h2 {
    margin-bottom: 12px;
    font-size: 1.25rem;
}

.form-group {
    margin-bottom: 12px;
}

.form-group label {
    display: block;
    margin-bottom: 4px;
    font-weight: 500;
    font-size: 0.9rem;
}

.form-group input {
    width: 100%;
    padding: 12px;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 1rem;
}

.image-preview {
    margin: 12px 0;
    position: relative;
    border-radius: 6px;
    overflow: hidden;
}

.image-preview img {
    width: 100%;
    max-height: 200px;
    object-fit: cover;
}

.btn-small {
    position: absolute;
    top: 8px;
    right: 8px;
    padding: 4px 8px;
    background: rgba(0,0,0,0.6);
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

.btn-primary {
    width: 100%;
    padding: 12px;
    background-color: #3498db;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
}

.btn-primary:hover {
    background-color: #2980b9;
}

.entries-section {
    background: white;
    padding: 16px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
}

.section-header h2 {
    font-size: 1.25rem;
}

.btn-secondary {
    padding: 8px 16px;
    background-color: #27ae60;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.9rem;
}

.btn-secondary:hover {
    background-color: #219a52;
}

.entries-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.entry-card {
    padding: 12px;
    border: 1px solid #eee;
    border-radius: 6px;
    cursor: pointer;
    transition: background-color 0.2s;
}

.entry-card:hover {
    background-color: #f9f9f9;
}

.entry-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.entry-amount {
    font-weight: bold;
    font-size: 1.1rem;
    color: #e74c3c;
}

.entry-date {
    font-size: 0.8rem;
    color: #777;
}

.entry-description {
    margin-top: 4px;
    color: #555;
}

.entry-image {
    margin-top: 8px;
    max-width: 100%;
    border-radius: 4px;
}

.entry-actions {
    display: flex;
    gap: 8px;
    margin-top: 8px;
}

.btn-delete {
    padding: 4px 8px;
    background-color: #e74c3c;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.8rem;
}

.empty-state {
    text-align: center;
    color: #999;
    padding: 32px;
}

/* Modal for viewing entry details */
.modal {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0,0,0,0.7);
    z-index: 1000;
    padding: 16px;
    overflow-y: auto;
}

.modal.active {
    display: flex;
    align-items: center;
    justify-content: center;
}

.modal-content {
    background: white;
    border-radius: 8px;
    max-width: 500px;
    width: 100%;
    padding: 16px;
    position: relative;
}

.modal-close {
    position: absolute;
    top: 8px;
    right: 8px;
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
}

.modal-image {
    width: 100%;
    border-radius: 4px;
    margin-top: 12px;
}
```

- [ ] **Step 3: Create app.js with IndexedDB setup**

```javascript
// IndexedDB setup
const DB_NAME = 'ReceiptTrackerDB';
const DB_VERSION = 1;
const STORE_NAME = 'expenses';

let db = null;
let selectedImage = null;

// Initialize database
function initDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        
        request.onupgradeneeded = (event) => {
            const database = event.target.result;
            if (!database.objectStoreNames.contains(STORE_NAME)) {
                database.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
            }
        };
        
        request.onsuccess = (event) => {
            db = event.target.result;
            resolve(db);
        };
        
        request.onerror = (event) => {
            reject(event.target.error);
        };
    });
}

// Add entry to database
function addEntry(entry) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.add(entry);
        
        request.onsuccess = () => {
            resolve(request.result);
        };
        
        request.onerror = (event) => {
            reject(event.target.error);
        };
    });
}

// Get all entries
function getAllEntries() {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAll();
        
        request.onsuccess = () => {
            resolve(request.result);
        };
        
        request.onerror = (event) => {
            reject(event.target.error);
        };
    });
}

// Delete entry
function deleteEntry(id) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.delete(id);
        
        request.onsuccess = () => {
            resolve();
        };
        
        request.onerror = (event) => {
            reject(event.target.error);
        };
    });
}

// Convert file to Base64
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = (event) => reject(event.target.error);
        reader.readAsDataURL(file);
    });
}
```

- [ ] **Step 4: Commit initial structure**

```bash
git add index.html styles.css app.js docs/
git commit -m "feat: create project structure with HTML, CSS, and IndexedDB setup"
```

---

### Task 2: Implement Form and Image Handling

**Files:**
- Modify: `app.js` — add form handling logic

- [ ] **Step 1: Add form submission handler**

```javascript
// Form handling
const form = document.getElementById('expense-form');
const amountInput = document.getElementById('amount');
const descriptionInput = document.getElementById('description');
const imageInput = document.getElementById('image-input');
const imagePreview = document.getElementById('image-preview');
const previewImg = document.getElementById('preview-img');
const removeImageButton = document.getElementById('remove-image');

// Handle image selection
imageInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (file) {
        selectedImage = await fileToBase64(file);
        previewImg.src = selectedImage;
        imagePreview.hidden = false;
    }
});

// Remove selected image
removeImageButton.addEventListener('click', () => {
    selectedImage = null;
    imageInput.value = '';
    imagePreview.hidden = true;
});

// Handle form submission
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const entry = {
        amount: parseFloat(amountInput.value),
        description: descriptionInput.value,
        image: selectedImage || null,
        timestamp: new Date().toISOString()
    };
    
    await addEntry(entry);
    
    // Reset form
    form.reset();
    selectedImage = null;
    imagePreview.hidden = true;
    
    // Refresh entries list
    await loadEntries();
    updateTotal();
});
```

- [ ] **Step 2: Add entry rendering function**

```javascript
// Render entries to the list
function renderEntries(entries) {
    const entriesList = document.getElementById('entries-list');
    
    if (entries.length === 0) {
        entriesList.innerHTML = '<p class="empty-state">No entries yet. Add your first expense above.</p>';
        return;
    }
    
    entriesList.innerHTML = entries.map(entry => `
        <div class="entry-card" data-id="${entry.id}">
            <div class="entry-header">
                <span class="entry-amount">${entry.amount.toFixed(2)}</span>
                <span class="entry-date">${new Date(entry.timestamp).toLocaleDateString()}</span>
            </div>
            <div class="entry-description">${entry.description}</div>
            ${entry.image ? `<img src="${entry.image}" class="entry-image" alt="Receipt">` : ''}
            <div class="entry-actions">
                <button class="btn-delete" data-id="${entry.id}">Delete</button>
            </div>
        </div>
    `).join('');
}
```

- [ ] **Step 3: Add delete entry handler**

```javascript
// Handle delete button clicks
document.addEventListener('click', async (e) => {
    if (e.target.classList.contains('btn-delete')) {
        const id = parseInt(e.target.dataset.id);
        if (confirm('Delete this entry?')) {
            await deleteEntry(id);
            await loadEntries();
            updateTotal();
        }
    }
});
```

- [ ] **Step 4: Add loading and total calculation**

```javascript
// Load all entries
async function loadEntries() {
    const entries = await getAllEntries();
    renderEntries(entries);
}

// Calculate and display total
function updateTotal() {
    getAllEntries().then(entries => {
        const total = entries.reduce((sum, entry) => sum + entry.amount, 0);
        document.getElementById('total-amount').textContent = total.toFixed(2);
    });
}
```

- [ ] **Step 5: Add initialization and event listeners**

```javascript
// Initialize app
document.addEventListener('DOMContentLoaded', async () => {
    await initDB();
    await loadEntries();
    updateTotal();
});
```

- [ ] **Step 6: Test and commit**

Test: Open `index.html` in Chrome, add an entry with and without an image, verify it appears in the list, delete an entry, verify total updates.

```bash
git add app.js
git commit -m "feat: implement form submission, image handling, and entry management"
```

---

### Task 3: Implement Entry Detail View and PDF Export

**Files:**
- Modify: `app.js` — add modal and PDF export

- [ ] **Step 1: Add modal HTML to index.html**

Add this before the closing `</body>` tag:

```html
<div id="entry-modal" class="modal">
    <div class="modal-content">
        <button class="modal-close">&times;</button>
        <h2 id="modal-amount"></h2>
        <p id="modal-description"></p>
        <p id="modal-date"></p>
        <img id="modal-image" class="modal-image" hidden>
    </div>
</div>
```

- [ ] **Step 2: Add modal functionality to app.js**

```javascript
// Modal handling
const modal = document.getElementById('entry-modal');
const modalClose = modal.querySelector('.modal-close');

// Show entry details on card click
document.addEventListener('click', async (e) => {
    if (e.target.classList.contains('entry-card')) {
        const id = parseInt(e.target.dataset.id);
        const entries = await getAllEntries();
        const entry = entries.find(e => e.id === id);
        
        if (entry) {
            document.getElementById('modal-amount').textContent = `Amount: ${entry.amount.toFixed(2)}`;
            document.getElementById('modal-description').textContent = entry.description;
            document.getElementById('modal-date').textContent = new Date(entry.timestamp).toLocaleString();
            
            const modalImage = document.getElementById('modal-image');
            if (entry.image) {
                modalImage.src = entry.image;
                modalImage.hidden = false;
            } else {
                modalImage.hidden = true;
            }
            
            modal.classList.add('active');
        }
    }
});

// Close modal
modalClose.addEventListener('click', () => {
    modal.classList.remove('active');
});

modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.classList.remove('active');
    }
});
```

- [ ] **Step 3: Add PDF export functionality**

```javascript
// Export all entries as PDF
document.getElementById('export-pdf').addEventListener('click', async () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const entries = await getAllEntries();
    
    let y = 20;
    
    entries.forEach((entry, index) => {
        if (index > 0) {
            doc.addPage();
            y = 20;
        }
        
        // Header
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('Receipt Expense Tracker', 105, y, { align: 'center' });
        y += 10;
        
        // Entry details
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text(`Date: ${new Date(entry.timestamp).toLocaleDateString()}`, 20, y);
        y += 6;
        doc.text(`Description: ${entry.description}`, 20, y);
        y += 6;
        doc.setFont('helvetica', 'bold');
        doc.text(`Amount: ${entry.amount.toFixed(2)}`, 20, y);
        y += 10;
        
        // Add image if exists
        if (entry.image) {
            const imgWidth = 90;
            const imgHeight = 60;
            const x = (210 - imgWidth) / 2;
            doc.addImage(entry.image, 'JPEG', x, y, imgWidth, imgHeight);
            y += imgHeight + 10;
        }
    });
    
    // Add total on last page
    const total = entries.reduce((sum, entry) => sum + entry.amount, 0);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`Total: ${total.toFixed(2)}`, 105, y + 10, { align: 'center' });
    
    doc.save('receipts.pdf');
});
```

- [ ] **Step 4: Test and commit**

Test: Add multiple entries with images, click each entry to verify modal shows details correctly, click "Export PDF" and verify the PDF contains all entries with images.

```bash
git add index.html app.js
git commit -m "feat: add entry detail modal and PDF export functionality"
```

---

## Implementation Order

1. **Task 1** → Project structure (HTML, CSS, IndexedDB setup)
2. **Task 2** → Form handling, image selection, entry CRUD operations
3. **Task 3** → Detail modal, PDF export, polish

## Testing Checklist

- [ ] Open `index.html` in Chrome on Android (or desktop with mobile emulation)
- [ ] Add entry without image → appears in list
- [ ] Add entry with image → image shows in list and modal
- [ ] Tap entry card → modal opens with full details
- [ ] Delete entry → removed from list, total updates
- [ ] Total updates correctly when adding/deleting entries
- [ ] Export PDF → downloads file with all entries
- [ ] Close browser → reopen → data persists
- [ ] Camera/gallery works on Android
- [ ] Works offline (no internet after initial load)
