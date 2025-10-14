/**
 * Enhanced Error Handling System for Social Engineering Awareness Program
 * Provides comprehensive error handling with user-friendly messages
 * Updated: 2025-10-14
 */

class ErrorHandler {
    constructor() {
        this.errorMessages = {
            // Network errors
            'NETWORK_ERROR': 'Unable to connect to the server. Please check your internet connection and try again.',
            'TIMEOUT_ERROR': 'The request timed out. Please try again.',
            'SERVER_ERROR': 'Server is temporarily unavailable. Please try again later.',
            
            // Authentication errors
            'AUTH_REQUIRED': 'Please log in to access this feature.',
            'AUTH_EXPIRED': 'Your session has expired. Please log in again.',
            'AUTH_INVALID': 'Invalid credentials. Please check your username and password.',
            'AUTH_FORBIDDEN': 'You do not have permission to perform this action.',
            
            // Validation errors
            'VALIDATION_ERROR': 'Please check your input and try again.',
            'REQUIRED_FIELD': 'This field is required.',
            'INVALID_EMAIL': 'Please enter a valid email address.',
            'INVALID_PASSWORD': 'Password must be at least 12 characters long.',
            'PASSWORDS_MISMATCH': 'Passwords do not match.',
            
            // Assessment errors
            'ASSESSMENT_NOT_STARTED': 'Please start the assessment first.',
            'ASSESSMENT_TIME_UP': 'Time is up! Your assessment has been submitted automatically.',
            'ASSESSMENT_ALREADY_SUBMITTED': 'This assessment has already been submitted.',
            'ASSESSMENT_INCOMPLETE': 'Please answer all questions before submitting.',
            
            // Module errors
            'MODULE_LOCKED': 'This module is locked. Complete the previous modules first.',
            'MODULE_NOT_FOUND': 'Module not found.',
            'MODULE_ALREADY_COMPLETED': 'This module has already been completed.',
            
            // File upload errors
            'FILE_TOO_LARGE': 'File size exceeds the maximum limit of 16MB.',
            'INVALID_FILE_TYPE': 'Invalid file type. Please upload a valid image file.',
            'UPLOAD_FAILED': 'File upload failed. Please try again.',
            
            // Database errors
            'DATABASE_ERROR': 'Database operation failed. Please try again.',
            'DUPLICATE_ENTRY': 'This information already exists.',
            'RECORD_NOT_FOUND': 'The requested information was not found.',
            
            // General errors
            'UNKNOWN_ERROR': 'An unexpected error occurred. Please try again.',
            'MAINTENANCE_MODE': 'The system is currently under maintenance. Please try again later.'
        };
        
        this.init();
    }

    init() {
        // Global error handler for unhandled errors
        window.addEventListener('error', (event) => {
            this.handleGlobalError(event.error);
        });

        // Global handler for unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            this.handleGlobalError(event.reason);
        });

        // Override console.error to capture errors
        const originalConsoleError = console.error;
        console.error = (...args) => {
            this.logError('Console Error', args.join(' '));
            originalConsoleError.apply(console, args);
        };
    }

    handleGlobalError(error) {
        console.error('Global error caught:', error);
        this.logError('Global Error', error.message || error);
        
        // Show user-friendly error message
        if (window.modalSystem) {
            window.modalSystem.error(
                'Unexpected Error',
                'An unexpected error occurred. Please refresh the page and try again.',
                {
                    onConfirm: () => {
                        // Optionally reload the page
                        if (error.message && error.message.includes('ChunkLoadError')) {
                            window.location.reload();
                        }
                    }
                }
            );
        }
    }

    logError(type, message, details = {}) {
        const errorLog = {
            timestamp: new Date().toISOString(),
            type: type,
            message: message,
            url: window.location.href,
            userAgent: navigator.userAgent,
            details: details
        };

        // Log to console in development
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            console.error('Error Log:', errorLog);
        }

        // Send to server for logging (if endpoint exists)
        this.sendErrorToServer(errorLog);
    }

    async sendErrorToServer(errorLog) {
        try {
            await fetch('/api/log-error', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(errorLog)
            });
        } catch (error) {
            // Silently fail - don't create error loops
            console.warn('Failed to send error log to server:', error);
        }
    }

    // Handle API errors
    handleApiError(response, context = '') {
        const status = response.status;
        let errorKey = 'UNKNOWN_ERROR';
        let userMessage = this.errorMessages[errorKey];

        switch (status) {
            case 400:
                errorKey = 'VALIDATION_ERROR';
                userMessage = this.errorMessages[errorKey];
                break;
            case 401:
                errorKey = 'AUTH_REQUIRED';
                userMessage = this.errorMessages[errorKey];
                break;
            case 403:
                errorKey = 'AUTH_FORBIDDEN';
                userMessage = this.errorMessages[errorKey];
                break;
            case 404:
                errorKey = 'RECORD_NOT_FOUND';
                userMessage = this.errorMessages[errorKey];
                break;
            case 408:
                errorKey = 'TIMEOUT_ERROR';
                userMessage = this.errorMessages[errorKey];
                break;
            case 500:
                errorKey = 'SERVER_ERROR';
                userMessage = this.errorMessages[errorKey];
                break;
            case 503:
                errorKey = 'MAINTENANCE_MODE';
                userMessage = this.errorMessages[errorKey];
                break;
        }

        this.logError('API Error', `${context}: ${status} - ${response.statusText}`, {
            status: status,
            url: response.url,
            context: context
        });

        if (window.modalSystem) {
            window.modalSystem.error('Error', userMessage);
        }

        return userMessage;
    }

    // Handle form validation errors
    handleValidationError(errors, formElement = null) {
        let errorMessage = 'Please correct the following errors:';
        let errorList = [];

        if (typeof errors === 'object') {
            for (const [field, fieldErrors] of Object.entries(errors)) {
                if (Array.isArray(fieldErrors)) {
                    fieldErrors.forEach(error => {
                        errorList.push(`• ${error}`);
                    });
                } else {
                    errorList.push(`• ${fieldErrors}`);
                }
            }
        } else if (typeof errors === 'string') {
            errorList.push(`• ${errors}`);
        }

        if (errorList.length > 0) {
            errorMessage += '\n\n' + errorList.join('\n');
        }

        this.logError('Validation Error', errorMessage, { errors: errors });

        if (window.modalSystem) {
            window.modalSystem.error('Validation Error', errorMessage);
        }

        // Highlight form fields with errors
        if (formElement) {
            this.highlightFormErrors(formElement, errors);
        }

        return errorMessage;
    }

    highlightFormErrors(formElement, errors) {
        // Remove existing error highlights
        formElement.querySelectorAll('.is-invalid').forEach(field => {
            field.classList.remove('is-invalid');
        });

        // Add error highlights to specific fields
        if (typeof errors === 'object') {
            for (const [fieldName, fieldErrors] of Object.entries(errors)) {
                const field = formElement.querySelector(`[name="${fieldName}"]`);
                if (field) {
                    field.classList.add('is-invalid');
                    
                    // Add error message below field
                    let errorDiv = field.parentNode.querySelector('.invalid-feedback');
                    if (!errorDiv) {
                        errorDiv = document.createElement('div');
                        errorDiv.className = 'invalid-feedback';
                        field.parentNode.appendChild(errorDiv);
                    }
                    errorDiv.textContent = Array.isArray(fieldErrors) ? fieldErrors[0] : fieldErrors;
                }
            }
        }
    }

    // Handle network errors
    handleNetworkError(error, context = '') {
        let errorMessage = this.errorMessages['NETWORK_ERROR'];
        
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            errorMessage = this.errorMessages['NETWORK_ERROR'];
        } else if (error.name === 'AbortError') {
            errorMessage = this.errorMessages['TIMEOUT_ERROR'];
        }

        this.logError('Network Error', `${context}: ${error.message}`, {
            error: error.name,
            context: context
        });

        if (window.modalSystem) {
            window.modalSystem.error('Connection Error', errorMessage);
        }

        return errorMessage;
    }

    // Handle assessment-specific errors
    handleAssessmentError(errorType, details = {}) {
        const errorMessage = this.errorMessages[errorType] || this.errorMessages['UNKNOWN_ERROR'];
        
        this.logError('Assessment Error', errorMessage, details);

        if (window.modalSystem) {
            window.modalSystem.error('Assessment Error', errorMessage);
        }

        return errorMessage;
    }

    // Handle module-specific errors
    handleModuleError(errorType, details = {}) {
        const errorMessage = this.errorMessages[errorType] || this.errorMessages['UNKNOWN_ERROR'];
        
        this.logError('Module Error', errorMessage, details);

        if (window.modalSystem) {
            window.modalSystem.error('Module Error', errorMessage);
        }

        return errorMessage;
    }

    // Show success message
    showSuccess(message, title = 'Success') {
        if (window.modalSystem) {
            window.modalSystem.success(title, message);
        }
    }

    // Show info message
    showInfo(message, title = 'Information') {
        if (window.modalSystem) {
            window.modalSystem.info(title, message);
        }
    }

    // Show warning message
    showWarning(message, title = 'Warning') {
        if (window.modalSystem) {
            window.modalSystem.warning(title, message);
        }
    }

    // Show loading state
    showLoading(message = 'Loading...', title = 'Please Wait') {
        if (window.modalSystem) {
            return window.modalSystem.loading(title, message);
        }
    }

    // Hide loading state
    hideLoading() {
        if (window.modalSystem) {
            window.modalSystem.close();
        }
    }
}

// Initialize error handler
window.errorHandler = new ErrorHandler();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ErrorHandler;
}
