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

// Initialize app
document.addEventListener('DOMContentLoaded', async () => {
    await initDB();
    await loadEntries();
    updateTotal();
});
