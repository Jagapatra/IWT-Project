// State management for posts and users
const state = {
    currentUser: null,
    posts: [],
    loggedIn: false
};

// Post class to manage post creation and interactions
class Post {
    constructor(author, content, image = null, attachments = []) {
        this.id = Date.now();
        this.author = author;
        this.content = content;
        this.image = image;
        this.attachments = attachments;
        this.reactions = {
            like: 0,
            helpful: 0,
            insightful: 0
        };
        this.comments = [];
        this.timestamp = new Date();
    }

    addComment(user, content) {
        this.comments.push({
            id: Date.now(),
            user,
            content,
            timestamp: new Date(),
            replies: []
        });
    }

    addReply(commentId, user, content) {
        const comment = this.comments.find(c => c.id === commentId);
        if (comment) {
            comment.replies.push({
                id: Date.now(),
                user,
                content,
                timestamp: new Date()
            });
        }
    }

    addReaction(type) {
        if (this.reactions.hasOwnProperty(type)) {
            this.reactions[type]++;
        }
    }
}

// DOM Elements
const createPostForm = {
    textarea: document.querySelector('.create-post textarea'),
    imageBtn: document.querySelector('.post-actions button:nth-child(1)'),
    attachBtn: document.querySelector('.post-actions button:nth-child(2)'),
    postBtn: document.querySelector('.post-actions button:nth-child(3)')
};

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    checkAuthStatus();
    initializeEventListeners();
    loadExistingPosts();
});

function checkAuthStatus() {
    fetch('http://localhost:8000/auth/status', {
        credentials: 'include'
    })
    .then(response => response.json())
    .then(data => {
        const loginDashboard = document.getElementById('login-dashboard');
        const userDashboard = document.getElementById('user-dashboard');
        const createPostSection = document.querySelector('.create-post');
        
        if (data.isAuthenticated) {
            state.loggedIn = true;
            state.currentUser = data.user;
            loginDashboard.style.display = 'none';
            userDashboard.style.display = 'flex';
            createPostSection.style.display = 'block';
            document.getElementById('user-name').textContent = data.user.name;
        } else {
            state.loggedIn = false;
            loginDashboard.style.display = 'flex';
            userDashboard.style.display = 'none';
            createPostSection.style.display = 'none';
        }
    })
    .catch(error => {
        console.error('Error checking auth status:', error);
    });
}

function initializeEventListeners() {
    // Create post
    createPostForm.postBtn?.addEventListener('click', handleCreatePost);
    createPostForm.imageBtn?.addEventListener('click', handleImageUpload);
    createPostForm.attachBtn?.addEventListener('click', handleFileAttachment);

    // Handle reactions
    document.addEventListener('click', (e) => {
        if (e.target.closest('.reaction-btn')) {
            handleReaction(e);
        }
    });

    // Handle comments
    document.addEventListener('keypress', (e) => {
        if (e.target.matches('.comment-input input') && e.key === 'Enter') {
            handleComment(e);
        }
    });

    // Search functionality
    const searchInput = document.querySelector('#search-bar input');
    searchInput?.addEventListener('input', handleSearch);

    // Logout handler
    document.getElementById('logout-button')?.addEventListener('click', handleLogout);
}

function handleLogout() {
    fetch('http://localhost:8000/logout', {
        method: 'POST',
        credentials: 'include'
    })
    .then(response => response.json())
    .then(data => {
        if (data.message === "Logged out successfully") {
            window.location.reload();
        }
    })
    .catch(error => {
        console.error('Error logging out:', error);
    });
}

function handleCreatePost() {
    if (!state.loggedIn) {
        alert('Please log in to create a post');
        return;
    }

    const content = createPostForm.textarea.value.trim();
    if (!content) {
        alert('Please enter some content for your post');
        return;
    }

    const newPost = new Post(state.currentUser, content);
    state.posts.unshift(newPost);
    renderPost(newPost);
    createPostForm.textarea.value = '';
}

function handleImageUpload() {
    if (!state.loggedIn) {
        alert('Please log in to upload images');
        return;
    }

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const preview = document.createElement('img');
                preview.src = e.target.result;
                preview.classList.add('post-image');
                document.querySelector('.create-post').appendChild(preview);
            };
            reader.readAsDataURL(file);
        }
    };
    input.click();
}

function handleFileAttachment() {
    if (!state.loggedIn) {
        alert('Please log in to attach files');
        return;
    }

    const input = document.createElement('input');
    input.type = 'file';
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const attachment = document.createElement('div');
            attachment.classList.add('post-attachments');
            attachment.innerHTML = `<span>📄 ${file.name}</span>`;
            document.querySelector('.create-post').appendChild(attachment);
        }
    };
    input.click();
}

function handleReaction(e) {
    if (!state.loggedIn) {
        alert('Please log in to react to posts');
        return;
    }

    const button = e.target.closest('.reaction-btn');
    const reactionType = button.textContent.split(' ')[1].toLowerCase();
    const postElement = button.closest('.forum-post');
    const postId = postElement.dataset.postId;
    const post = state.posts.find(p => p.id === parseInt(postId));

    if (post) {
        post.addReaction(reactionType);
        updateReactionCount(button, post.reactions[reactionType]);
    }
}

function handleComment(e) {
    if (!state.loggedIn) {
        alert('Please log in to comment');
        return;
    }

    const content = e.target.value.trim();
    if (!content) return;

    const postElement = e.target.closest('.forum-post');
    const postId = postElement.dataset.postId;
    const post = state.posts.find(p => p.id === parseInt(postId));

    if (post) {
        post.addComment(state.currentUser, content);
        renderComment(post.comments[post.comments.length - 1], postElement);
        e.target.value = '';
    }
}

function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    document.querySelectorAll('.forum-post').forEach(postElement => {
        const content = postElement.querySelector('.post-content p').textContent.toLowerCase();
        const author = postElement.querySelector('.user-info h4').textContent.toLowerCase();
        const visible = content.includes(searchTerm) || author.includes(searchTerm);
        postElement.style.display = visible ? 'block' : 'none';
    });
}

function renderPost(post) {
    const postHTML = `
        <div class="forum-post" data-post-id="${post.id}">
            <div class="post-header">
                <img src="/api/placeholder/40/40" alt="User Avatar" class="user-avatar">
                <div class="user-info">
                    <h4>${post.author.name}</h4>
                    <p>${post.author.title || ''}</p>
                </div>
            </div>
            <div class="post-content">
                <p>${post.content}</p>
                ${post.image ? `<img src="${post.image}" alt="Post Image" class="post-image">` : ''}
                ${renderAttachments(post.attachments)}
            </div>
            <div class="reactions">
                <button class="reaction-btn">👍 Like (${post.reactions.like})</button>
                <button class="reaction-btn">🎯 Helpful (${post.reactions.helpful})</button>
                <button class="reaction-btn">💡 Insightful (${post.reactions.insightful})</button>
            </div>
            <div class="comments-section">
                ${renderComments(post.comments)}
                <div class="comment-input">
                    <img src="/api/placeholder/40/40" alt="User Avatar" class="user-avatar">
                    <input type="text" placeholder="Write a comment...">
                </div>
            </div>
        </div>
    `;

    const container = document.querySelector('.container');
    container.insertBefore(
        createElementFromHTML(postHTML),
        container.firstChild.nextSibling
    );
}

function updateReactionCount(button, count) {
    const [emoji, type] = button.textContent.split(' ');
    button.textContent = `${emoji} ${type} (${count})`;
}

function renderAttachments(attachments) {
    if (!attachments.length) return '';
    return `
        <div class="post-attachments">
            ${attachments.map(att => `<span>📄 ${att.name}</span>`).join('')}
        </div>
    `;
}

function renderComments(comments) {
    return comments.map(comment => `
        <div class="comment" data-comment-id="${comment.id}">
            <img src="/api/placeholder/40/40" alt="User Avatar" class="user-avatar">
            <div class="comment-content">
                <h4>${comment.user.name}</h4>
                <p>${comment.content}</p>
            </div>
        </div>
        ${renderReplies(comment.replies)}
    `).join('');
}

function renderReplies(replies) {
    return replies.map(reply => `
        <div class="comment reply" data-reply-id="${reply.id}">
            <img src="/api/placeholder/40/40" alt="User Avatar" class="user-avatar">
            <div class="comment-content">
                <h4>${reply.user.name}</h4>
                <p>${reply.content}</p>
            </div>
        </div>
    `).join('');
}

function createElementFromHTML(html) {
    const div = document.createElement('div');
    div.innerHTML = html.trim();
    return div.firstChild;
}

// Initialize mock data for testing
function loadExistingPosts() {
    const mockUser = {
        name: 'Sarah Chen',
        title: 'Full Stack Developer | Building scalable web applications',
        avatar: '/api/placeholder/40/40'
    };
    
    // Only set mock user if not already logged in
    if (!state.currentUser) {
        state.currentUser = mockUser;
    }

    // Add initial posts if none exist
    if (state.posts.length === 0) {
        const initialPost = new Post(
            mockUser,
            "Just completed a deep dive into React's new Server Components. Here's what I learned about improving initial page load performance..."
        );
        state.posts.push(initialPost);
    }
}
// Update the handleComment function to properly handle new comments
function handleComment(e) {
    if (!state.loggedIn) {
        alert('Please log in to comment');
        return;
    }

    const content = e.target.value.trim();
    if (!content) return;

    const postElement = e.target.closest('.forum-post');
    if (!postElement) return;

    const commentHTML = `
        <div class="comment">
            <img src="/api/placeholder/40/40" alt="User Avatar" class="user-avatar">
            <div class="comment-content">
                <h4>${state.currentUser.name}</h4>
                <p>${content}</p>
            </div>
        </div>
    `;

    // Find the comments section and insert the new comment before the comment input
    const commentsSection = postElement.querySelector('.comments-section');
    const commentInput = commentsSection.querySelector('.comment-input');
    
    // Insert the new comment before the comment input
    commentInput.insertAdjacentHTML('beforebegin', commentHTML);

    // Clear the input field
    e.target.value = '';
}

// Update the event listeners initialization to properly handle comment submissions
function initializeEventListeners() {
    // ... (keep existing event listeners)

    // Update comment handler to use event delegation
    document.addEventListener('keypress', (e) => {
        if (e.target.matches('.comment-input input') && e.key === 'Enter') {
            handleComment(e);
        }
    });
}