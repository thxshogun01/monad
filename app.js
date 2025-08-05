// Application state - will be replaced with Supabase data
let appState = {
  feedback: [],
  contributors: []
};

// Utility functions
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function formatRelativeTime(timestamp) {
  const now = new Date();
  const past = new Date(timestamp);
  const diffInSeconds = Math.floor((now - past) / 1000);
  
  if (diffInSeconds < 60) {
    return diffInSeconds === 1 ? '1 second ago' : `${diffInSeconds} seconds ago`;
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return diffInMinutes === 1 ? '1 minute ago' : `${diffInMinutes} minutes ago`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return diffInHours === 1 ? '1 hour ago' : `${diffInHours} hours ago`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return diffInDays === 1 ? '1 day ago' : `${diffInDays} days ago`;
  }
  
  const diffInMonths = Math.floor(diffInDays / 30);
  return diffInMonths === 1 ? '1 month ago' : `${diffInMonths} months ago`;
}

function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

function sanitizeXHandle(handle) {
  return handle.replace(/^@+/, '').trim();
}

// DOM manipulation functions
function showLoading() {
  document.getElementById('loading-overlay').classList.remove('hidden');
}

function hideLoading() {
  document.getElementById('loading-overlay').classList.add('hidden');
}

function showSuccessModal(title, message) {
  const modal = document.getElementById('success-modal');
  const titleEl = document.getElementById('success-title');
  const messageEl = document.getElementById('success-message');
  
  titleEl.textContent = title;
  messageEl.textContent = message;
  modal.classList.remove('hidden');
}

function hideSuccessModal() {
  document.getElementById('success-modal').classList.add('hidden');
}

function showError(inputEl, message) {
  inputEl.classList.add('error');
  
  // Remove existing error message
  const existingError = inputEl.parentNode.querySelector('.error-message');
  if (existingError) {
    existingError.remove();
  }
  
  // Add new error message
  const errorEl = document.createElement('div');
  errorEl.className = 'error-message';
  errorEl.textContent = message;
  inputEl.parentNode.appendChild(errorEl);
}

function clearError(inputEl) {
  inputEl.classList.remove('error');
  const errorEl = inputEl.parentNode.querySelector('.error-message');
  if (errorEl) {
    errorEl.remove();
  }
}

function clearAllErrors(form) {
  const errorInputs = form.querySelectorAll('.error');
  errorInputs.forEach(input => clearError(input));
}

// Tab navigation
function switchTab(tabName) {
  // Update tab buttons
  document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.classList.remove('active');
  });
  document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
  
  // Update sections
  document.querySelectorAll('.section').forEach(section => {
    section.classList.remove('active');
  });
  document.getElementById(`${tabName}-section`).classList.add('active');
}

// Data loading functions
async function loadFeedback() {
  try {
    const { data, error } = await supabase
      .from('feedback')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    appState.feedback = data || [];
    renderFeedback();
  } catch (error) {
    console.error('Error loading feedback:', error);
    appState.feedback = [];
    renderFeedback();
  }
}

async function loadContributors() {
  try {
    const { data, error } = await supabase
      .from('contributors')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    appState.contributors = data || [];
    renderShowcase();
  } catch (error) {
    console.error('Error loading contributors:', error);
    appState.contributors = [];
    renderShowcase();
  }
}

// Render functions
function renderFeedback() {
  const feedbackList = document.getElementById('feedback-list');
  
  if (appState.feedback.length === 0) {
    feedbackList.innerHTML = `
      <div class="empty-state">
        <p>Be the first to share your voice with the Monad community</p>
      </div>
    `;
    return;
  }
  
  const feedbackHtml = appState.feedback
    .map(item => {
      const tagClass = item.tag.toLowerCase().replace(/\s+/g, '-');
      return `
        <div class="feedback-item">
          <div class="feedback-header">
            <span class="feedback-tag ${tagClass}">${item.tag}</span>
            <span class="timestamp">${formatRelativeTime(item.created_at)}</span>
          </div>
          <div class="feedback-message">${item.message}</div>
        </div>
      `;
    })
    .join('');
  
  feedbackList.innerHTML = feedbackHtml;
}

function renderShowcase() {
  const showcaseList = document.getElementById('showcase-list');
  
  if (appState.contributors.length === 0) {
    showcaseList.innerHTML = `
      <div class="empty-state">
        <p>Be the first to showcase your contribution to Monad AI</p>
      </div>
    `;
    return;
  }
  
  const showcaseHtml = appState.contributors
    .map(item => {
      const handleUrl = `https://twitter.com/${item.x_handle}`;
      const projectLinkHtml = item.project_link 
        ? `<a href="${item.project_link}" target="_blank" rel="noopener noreferrer" class="project-link">View Project</a>`
        : '';
      
      return `
        <div class="showcase-item">
          <div class="showcase-header">
            <div>
              <a href="${handleUrl}" target="_blank" rel="noopener noreferrer" class="showcase-handle">@${item.x_handle}</a>
            </div>
            <span class="timestamp">${formatRelativeTime(item.created_at)}</span>
          </div>
          <div class="contribution-text">${item.contribution}</div>
          ${projectLinkHtml}
        </div>
      `;
    })
    .join('');
  
  showcaseList.innerHTML = showcaseHtml;
}

// Form handlers
async function handleFeedbackSubmit(e) {
  e.preventDefault();
  
  const form = e.target;
  const formData = new FormData(form);
  
  const message = document.getElementById('feedback-message').value.trim();
  const tag = document.getElementById('feedback-tag').value;
  
  // Clear previous errors
  clearAllErrors(form);
  
  // Validation
  let hasErrors = false;
  
  if (!message) {
    showError(document.getElementById('feedback-message'), 'Please share your thoughts');
    hasErrors = true;
  } else if (message.length > 500) {
    showError(document.getElementById('feedback-message'), 'Message must be 500 characters or less');
    hasErrors = true;
  }
  
  if (!tag) {
    showError(document.getElementById('feedback-tag'), 'Please select a tag');
    hasErrors = true;
  }
  
  if (hasErrors) return;
  
  showLoading();
  
  try {
    // Insert feedback into Supabase
    const { data, error } = await supabase
      .from('feedback')
      .insert([
        {
          message: message,
          tag: tag,
          created_at: new Date().toISOString()
        }
      ])
      .select();
    
    if (error) throw error;
    
    // Refresh feedback list
    await loadFeedback();
    
    hideLoading();
    
    // Reset form
    form.reset();
    updateCharacterCount('feedback-message', 'feedback-char-count');
    
    // Show success message
    showSuccessModal('Success!', 'Your voice has been heard!');
    
  } catch (error) {
    hideLoading();
    console.error('Error submitting feedback:', error);
    showSuccessModal('Error', 'Failed to submit feedback. Please try again.');
  }
}

async function handleShowcaseSubmit(e) {
  e.preventDefault();
  
  const form = e.target;
  
  const xHandle = sanitizeXHandle(document.getElementById('x-handle').value.trim());
  const contribution = document.getElementById('contribution').value.trim();
  const projectLink = document.getElementById('project-link').value.trim();
  
  // Clear previous errors
  clearAllErrors(form);
  
  // Validation
  let hasErrors = false;
  
  if (!xHandle) {
    showError(document.getElementById('x-handle'), 'Please enter your Twitter/X handle');
    hasErrors = true;
  } else if (xHandle.length > 50) {
    showError(document.getElementById('x-handle'), 'Handle must be 50 characters or less');
    hasErrors = true;
  }
  
  if (!contribution) {
    showError(document.getElementById('contribution'), 'Please describe your contribution');
    hasErrors = true;
  } else if (contribution.length > 500) {
    showError(document.getElementById('contribution'), 'Contribution must be 500 characters or less');
    hasErrors = true;
  }
  
  if (projectLink && !isValidUrl(projectLink)) {
    showError(document.getElementById('project-link'), 'Please enter a valid URL');
    hasErrors = true;
  }
  
  if (hasErrors) return;
  
  showLoading();
  
  try {
    // Insert contributor into Supabase
    const { data, error } = await supabase
      .from('contributors')
      .insert([
        {
          x_handle: xHandle,
          contribution: contribution,
          project_link: projectLink || null,
          created_at: new Date().toISOString()
        }
      ])
      .select();
    
    if (error) throw error;
    
    // Refresh contributors list
    await loadContributors();
    
    hideLoading();
    
    // Reset form
    form.reset();
    updateCharacterCount('contribution', 'contribution-char-count');
    
    // Show success message
    showSuccessModal('Welcome!', 'Welcome to the community!');
    
  } catch (error) {
    hideLoading();
    console.error('Error submitting contribution:', error);
    showSuccessModal('Error', 'Failed to submit contribution. Please try again.');
  }
}

// Character counting
function updateCharacterCount(textareaId, counterId) {
  const textarea = document.getElementById(textareaId);
  const counter = document.getElementById(counterId);
  const count = textarea.value.length;
  const maxLength = textarea.getAttribute('maxlength');
  
  counter.textContent = count;
  
  if (count > maxLength * 0.9) {
    counter.style.color = 'var(--color-warning)';
  } else {
    counter.style.color = 'var(--color-text-secondary)';
  }
}

// Initialize application
async function initApp() {
  // Tab navigation
  document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.addEventListener('click', (e) => {
      const tabName = e.target.getAttribute('data-tab');
      switchTab(tabName);
    });
  });
  
  // Form submissions
  document.getElementById('feedback-form').addEventListener('submit', handleFeedbackSubmit);
  document.getElementById('showcase-form').addEventListener('submit', handleShowcaseSubmit);
  
  // Success modal close
  document.getElementById('success-close').addEventListener('click', hideSuccessModal);
  document.querySelector('.modal-overlay').addEventListener('click', hideSuccessModal);
  
  // Character counting
  document.getElementById('feedback-message').addEventListener('input', () => {
    updateCharacterCount('feedback-message', 'feedback-char-count');
  });
  
  document.getElementById('contribution').addEventListener('input', () => {
    updateCharacterCount('contribution', 'contribution-char-count');
  });
  
  // Clear errors on input
  document.querySelectorAll('.form-control').forEach(input => {
    input.addEventListener('input', () => {
      if (input.classList.contains('error')) {
        clearError(input);
      }
    });
  });
  
  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      hideSuccessModal();
    }
  });
  
  // Load data from Supabase
  await loadFeedback();
  await loadContributors();
  
  // Set default tab
  switchTab('feedback');
}

// Start the application when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}