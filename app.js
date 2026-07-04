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

// Initialize app
document.addEventListener('DOMContentLoaded', async () => {
    await initDB();
    await loadEntries();
    updateTotal();
});
