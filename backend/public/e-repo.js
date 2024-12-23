// File handling functionality
document.addEventListener('DOMContentLoaded', function() {
    const fileUpload = document.getElementById('file-upload');
    const fileTypeFilter = document.getElementById('file-type');
    const searchInput = document.querySelector('#search-bar input');
    const searchButton = document.querySelector('#search-bar button');
    const fileList = document.querySelector('.file-list tbody');

    // Sample data structure for files with added content/blob data
    let files = [
        {
            name: 'Course_Material_Week1.pdf',
            type: 'document',
            size: '2.5 MB',
            date: '2024-02-20',
            contentType: 'application/pdf',
            content: null // In real implementation, this would store the file data
        },
        {
            name: 'Lecture_Recording_01.mp4',
            type: 'media',
            date: '2024-02-19',
            size: '150 MB',
            contentType: 'video/mp4',
            content: null
        },
        {
            name: 'Study_Notes.docx',
            type: 'document',
            size: '1.2 MB',
            date: '2024-02-18',
            contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            content: null
        }
    ];

    // File upload handling with content storage
    fileUpload.addEventListener('change', function(e) {
        const uploadedFiles = Array.from(e.target.files);
        
        uploadedFiles.forEach(file => {
            const reader = new FileReader();
            reader.onload = function(event) {
                const size = (file.size / (1024 * 1024)).toFixed(2) + ' MB';
                const date = new Date().toISOString().split('T')[0];
                
                let type = 'document';
                if(file.type.startsWith('video/') || file.type.startsWith('audio/')) {
                    type = 'media';
                } else if(file.name.endsWith('.zip') || file.name.endsWith('.rar')) {
                    type = 'archive';
                }

                files.unshift({
                    name: file.name,
                    type: type,
                    size: size,
                    date: date,
                    contentType: file.type,
                    content: event.target.result
                });

                updateFileList(files);
            };
            reader.readAsArrayBuffer(file);
        });
        showNotification('Files uploaded successfully!');
    });

    // File type filtering
    fileTypeFilter.addEventListener('change', function() {
        const selectedType = this.value;
        const filteredFiles = selectedType === 'all' 
            ? files 
            : files.filter(file => file.type === selectedType);
        updateFileList(filteredFiles);
    });

    // Search functionality
    searchButton.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });

    function performSearch() {
        const searchTerm = searchInput.value.toLowerCase();
        const searchResults = files.filter(file => 
            file.name.toLowerCase().includes(searchTerm)
        );
        updateFileList(searchResults);
    }

    // Update file list display
    function updateFileList(filesToShow) {
        fileList.innerHTML = '';
        filesToShow.forEach(file => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${file.name}</td>
                <td>${file.type}</td>
                <td>${file.size}</td>
                <td>${file.date}</td>
                <td class="action-buttons">
                    <button class="view-button" onclick="viewFile('${file.name}')">View</button>
                    <button class="download-button" onclick="downloadFile('${file.name}')">Download</button>
                </td>
            `;
            fileList.appendChild(row);
        });
    }

    // Enhanced download functionality
    window.downloadFile = function(fileName) {
        const file = files.find(f => f.name === fileName);
        
        if (!file) {
            showNotification('File not found!', 'error');
            return;
        }

        if (!file.content && !file.url) {
            // For demo files without content, create sample content
            const demoContent = `This is a sample content for ${fileName}`;
            const blob = new Blob([demoContent], { type: file.contentType });
            downloadBlob(blob, fileName);
        } else if (file.content) {
            // For real uploaded files
            const blob = new Blob([file.content], { type: file.contentType });
            downloadBlob(blob, fileName);
        } else if (file.url) {
            // For files with direct URLs
            fetch(file.url)
                .then(response => response.blob())
                .then(blob => downloadBlob(blob, fileName))
                .catch(error => {
                    console.error('Download failed:', error);
                    showNotification('Download failed!', 'error');
                });
        }
    };

    function downloadBlob(blob, fileName) {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        showNotification(`Downloading ${fileName}`);
    }

    // Enhanced notification system with types
    function showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        const backgroundColor = type === 'error' ? '#dc3545' : '#28a745';
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background-color: ${backgroundColor};
            color: white;
            padding: 15px 25px;
            border-radius: 5px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
            z-index: 1000;
            animation: slideIn 0.5s ease-out;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.5s ease-in';
            setTimeout(() => notification.remove(), 500);
        }, 3000);
    }

    // Add CSS animations for notifications
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);

    // File viewing functionality
    window.viewFile = function(fileName) {
        const file = files.find(f => f.name === fileName);
        if (!file) {
            showNotification('File not found!', 'error');
            return;
        }

        if (file.content) {
            const blob = new Blob([file.content], { type: file.contentType });
            const url = URL.createObjectURL(blob);
            window.open(url, '_blank');
            URL.revokeObjectURL(url);
        } else {
            showNotification(`Viewing ${fileName} (demo mode)`);
        }
    };
});

// Login/Register button handlers
document.querySelectorAll('#login-dashboard button').forEach(button => {
    button.addEventListener('click', function() {
        const action = this.textContent.toLowerCase();
        window.location.href = `./${action}.html`;
    });
});