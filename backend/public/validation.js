// Form Validation Utility
const FormValidator = {
    // Validation rules
    rules: {
        name: {
            required: true,
            minLength: 2,
            maxLength: 50,
            pattern: /^[A-Za-z\s]+$/
        },
        id: {
            required: true,
            minLength: 4,
            maxLength: 20,
            pattern: /^[A-Za-z0-9]+$/
        },
        password: {
            required: true,
            minLength: 8,
            maxLength: 30,
            pattern: /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]+$/
        },
        email: {
            required: true,
            pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        },
        age: {
            required: true,
            pattern: /^(1[8-9]|[2-9]\d)$/
        },
        gender: {
            required: true
        },
        address: {
            required: true,
            minLength: 10,
            maxLength: 200
        },
        branch: {
            required: true
        },
        resume: {
            required: false,
            maxSize: 5 * 1024 * 1024, // 5MB
            allowedTypes: ['.pdf', '.doc', '.docx']
        },
        photo: {
            required: false,
            maxSize: 2 * 1024 * 1024, // 2MB
            allowedTypes: ['image/jpeg', 'image/png', 'image/gif']
        }
    },

    // Error messages
    messages: {
        name: {
            required: 'Name is required',
            minLength: 'Name must be at least 2 characters long',
            maxLength: 'Name cannot exceed 50 characters',
            pattern: 'Name can only contain letters and spaces'
        },
        id: {
            required: 'ID is required',
            minLength: 'ID must be at least 4 characters long',
            maxLength: 'ID cannot exceed 20 characters',
            pattern: 'ID can only contain letters and numbers'
        },
        password: {
            required: 'Password is required',
            minLength: 'Password must be at least 8 characters long',
            maxLength: 'Password cannot exceed 30 characters',
            pattern: 'Password must include letters, numbers, and special characters'
        },
        email: {
            required: 'Email is required',
            pattern: 'Please enter a valid email address'
        },
        age: {
            required: 'Age is required',
            pattern: 'You must be between 18 and 99 years old'
        },
        gender: {
            required: 'Please select a gender'
        },
        address: {
            required: 'College address is required',
            minLength: 'Address must be at least 10 characters long',
            maxLength: 'Address cannot exceed 200 characters'
        },
        branch: {
            required: 'Please select a branch'
        },
        resume: {
            maxSize: 'Resume file cannot exceed 5MB',
            allowedTypes: 'Resume must be a PDF or DOC file'
        },
        photo: {
            maxSize: 'Photo file cannot exceed 2MB',
            allowedTypes: 'Photo must be a JPEG, PNG, or GIF'
        }
    },

    // Validate individual field
    validateField(field, value) {
        const rules = this.rules[field];
        const errors = [];

        if (!rules) return errors;

        // Check if required
        if (rules.required && (!value || value.trim() === '')) {
            errors.push(this.messages[field].required);
        }

        // Skip further validation if no value and not required
        if (!value && !rules.required) return errors;

        // Length validation
        if (rules.minLength && value.length < rules.minLength) {
            errors.push(this.messages[field].minLength);
        }
        if (rules.maxLength && value.length > rules.maxLength) {
            errors.push(this.messages[field].maxLength);
        }

        // Pattern validation
        if (rules.pattern && !rules.pattern.test(value)) {
            errors.push(this.messages[field].pattern);
        }

        return errors;
    },

    // Validate file input
    validateFile(field, file) {
        const rules = this.rules[field];
        const errors = [];

        if (!file) {
            return rules.required ? [this.messages[field].required] : errors;
        }

        // Size validation
        if (rules.maxSize && file.size > rules.maxSize) {
            errors.push(this.messages[field].maxSize);
        }

        // Type validation
        if (rules.allowedTypes) {
            const isAllowedType = rules.allowedTypes.some(type => {
                if (type.startsWith('.')) {
                    // For file extensions
                    return file.name.toLowerCase().endsWith(type);
                } else {
                    // For MIME types
                    return file.type === type;
                }
            });

            if (!isAllowedType) {
                errors.push(this.messages[field].allowedTypes);
            }
        }

        return errors;
    },

    // Validate entire form
    validateForm(form) {
        const errors = {};
        
        // Text and select inputs
        form.querySelectorAll('input:not([type="file"]), select, textarea').forEach(input => {
            const fieldErrors = this.validateField(input.name, input.value);
            if (fieldErrors.length) {
                errors[input.name] = fieldErrors;
            }
        });

        // Radio button group validation
        const radioGroups = ['gender'];
        radioGroups.forEach(group => {
            const selectedRadio = form.querySelector(`input[name="${group}"]:checked`);
            if (!selectedRadio) {
                errors[group] = [this.messages[group].required];
            }
        });

        // Checkbox group validation (optional)
        const checkboxGroups = ['skills'];
        checkboxGroups.forEach(group => {
            const checkboxes = form.querySelectorAll(`input[name="${group}"]`);
            const checkedBoxes = form.querySelectorAll(`input[name="${group}"]:checked`);
            // You can add custom validation logic here if needed
        });

        // File inputs
        form.querySelectorAll('input[type="file"]').forEach(input => {
            const file = input.files[0];
            const fieldErrors = this.validateFile(input.name, file);
            if (fieldErrors.length) {
                errors[input.name] = fieldErrors;
            }
        });

        return errors;
    },

    // Display errors
    displayErrors(form, errors) {
        // Clear previous errors
        form.querySelectorAll('.error-message').forEach(el => el.remove());
        form.querySelectorAll('.error-input').forEach(el => el.classList.remove('error-input'));

        // Display new errors
        Object.keys(errors).forEach(field => {
            const input = form.querySelector(`[name="${field}"]`);
            const errorContainer = document.createElement('div');
            errorContainer.className = 'error-message';
            errorContainer.style.color = 'red';
            errorContainer.style.fontSize = '0.85em';
            errorContainer.style.marginTop = '5px';
            
            // For radio and checkbox groups, find the first element
            const container = input.closest('.radio-group, .checkbox-group') || input.parentElement;
            
            errorContainer.textContent = errors[field][0];
            input.classList.add('error-input');
            container.appendChild(errorContainer);
        });
    }
};

// Registration Form Validation
document.addEventListener('DOMContentLoaded', () => {
    const registrationForm = document.querySelector('#RForm');

    if (registrationForm) {
        registrationForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            // Validate form
            const errors = FormValidator.validateForm(this);

            // Check if there are any errors
            if (Object.keys(errors).length > 0) {
                // Display errors
                FormValidator.displayErrors(this, errors);
                return;
            }

            // Collect form data
            const formData = new FormData(this);

            try {
                // Send data to backend
                const response = await fetch('/register', {
                    method: 'POST',
                    body: formData,
                });

                const result = await response.json();

                if (response.ok) {
                    alert('Form submitted successfully!');
                    window.location.href = './index.html';
                } else {
                    // Display server-side errors
                    const serverErrors = result.errors || {};
                    FormValidator.displayErrors(this, serverErrors);
                }
            } catch (error) {
                console.error('Error submitting form:', error);
                alert('An error occurred while submitting the form.');
            }
        });

        registrationForm.querySelectorAll('input, select, textarea').forEach(input => {
            input.addEventListener('blur', function () {
                const errors = FormValidator.validateField(this.name, this.value);
                if (errors.length) {
                    const errorContainer = document.createElement('div');
                    errorContainer.className = 'error-message';
                    errorContainer.style.color = 'red';
                    errorContainer.style.fontSize = '0.85em';
                    errorContainer.style.marginTop = '5px';
                    errorContainer.textContent = errors[0];

                    // Remove any existing error messages
                    this.parentElement.querySelectorAll('.error-message').forEach(el => el.remove());
                    this.classList.add('error-input');
                    this.parentElement.appendChild(errorContainer);
                } else {
                    // Remove error styling
                    this.classList.remove('error-input');
                    this.parentElement.querySelectorAll('.error-message').forEach(el => el.remove());
                }
            });
        });
    }

    // Login Form Validation (Similar approach)
    const loginForm = document.querySelector('#LForm');

if (loginForm) {
    loginForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const emailInput = this.querySelector('#email');
        const passwordInput = this.querySelector('#password');

        // Validate fields (using your FormValidator)
        const emailErrors = FormValidator.validateField('email', emailInput.value);
        const passwordErrors = FormValidator.validateField('password', passwordInput.value);

        const errors = {};
        if (emailErrors.length) errors.email = emailErrors;
        if (passwordErrors.length) errors.password = passwordErrors;

        if (Object.keys(errors).length > 0) {
            FormValidator.displayErrors(this, errors);
            return;
        }

        // Prepare the data to send in JSON format
        const loginData = {
            email: emailInput.value,
            password: passwordInput.value
        };

        try {
            const response = await fetch('http://localhost:8000/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json' // Sending JSON format
                },
                body: JSON.stringify(loginData) // Send data as JSON
            });

            const result = await response.json();

            if (response.ok) {
                alert('Login successful!');
                window.location.href = './index.html'; // Redirect on success
            } else {
                const serverErrors = result.errors || {};
                FormValidator.displayErrors(this, serverErrors);
            }
        } catch (error) {
            console.error('Error logging in:', error);
            alert('An error occurred during login.');
        }
    });
}
});

// Optional: Add custom CSS for error states
const styleElement = document.createElement('style');
styleElement.textContent = `
    .error-input {
        border-color: red !important;
        box-shadow: 0 0 5px rgba(255,0,0,0.5) !important;
    }
    .error-message {
        color: red;
        font-size: 0.85em;
        margin-top: 5px;
    }
`;
document.head.appendChild(styleElement);
