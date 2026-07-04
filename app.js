let selectedImage = null;

// Convert file to Base64
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = (event) => reject(event.target.error);
        reader.readAsDataURL(file);
    });
}

// Generate filename from entry data
function generateFilename(entry) {
    const date = new Date(entry.timestamp);
    const dateStr = date.toISOString().split('T')[0].replace(/-/g, '_');
    const desc = (entry.description || 'item').replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30);
    const amount = entry.amount.toFixed(2).replace('.', '_');
    return `${dateStr}_${desc}_${amount}.jpg`;
}

// Save photo to device using File System Access API or fallback download
async function savePhotoToDevice(entry) {
    const filename = generateFilename(entry);
    
    // Convert base64 to blob
    const byteString = atob(entry.image.split(',')[1]);
    const mimeString = entry.image.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([ab], { type: mimeString });
    
    // Try File System Access API first (best for mobile)
    if ('showSaveFilePicker' in window) {
        try {
            const handle = await window.showSaveFilePicker({
                suggestedName: filename,
                types: [{
                    description: 'Image',
                    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] }
                }]
            });
            const writable = await handle.createWritable();
            await writable.write(blob);
            await writable.close();
            return true;
        } catch (err) {
            if (err.name !== 'AbortError') {
                console.warn('File System Access failed, falling back to download:', err);
            } else {
                return false; // User cancelled
            }
        }
    }
    
    // Fallback: standard download
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return true;
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
    
    // Save photo to device if image was captured
    if (selectedImage) {
        try {
            await savePhotoToDevice(entry);
        } catch (err) {
            console.warn('Photo save cancelled or failed:', err);
        }
    }
    
    // Reset form
    form.reset();
    selectedImage = null;
    imagePreview.hidden = true;
});