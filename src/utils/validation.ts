// Email validation
export const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
};

// Password validation — at least 8 chars, one uppercase, one digit
export const isValidPassword = (password: string): boolean => {
    return password.length >= 8;
};

export const getPasswordError = (password: string): string | null => {
    if (!password) return 'Password is required';
    if (password.length < 8) return 'Password must be at least 8 characters';
    return null;
};

export const getEmailError = (email: string): string | null => {
    if (!email) return 'Email is required';
    if (!isValidEmail(email)) return 'Please enter a valid email address';
    return null;
};

// Name validation
export const isValidName = (name: string): boolean => {
    return name.trim().length >= 2;
};

export const getNameError = (name: string): string | null => {
    if (!name) return 'Name is required';
    if (!isValidName(name)) return 'Name must be at least 2 characters';
    return null;
};

// New exports for parity with existing code
export const validateLogin = (email: string, password: string) => {
    const eErr = getEmailError(email);
    const pErr = getPasswordError(password);
    return { email: eErr, password: pErr, isValid: !eErr && !pErr };
};

export const validateRegister = (name: string, email: string, password: string, confirmPassword?: string) => {
    const nErr = getNameError(name);
    const eErr = getEmailError(email);
    const pErr = getPasswordError(password);
    let cpErr = null;
    if (confirmPassword !== undefined && password !== confirmPassword) {
        cpErr = 'Passwords do not match';
    }
    return {
        name: nErr,
        email: eErr,
        password: pErr,
        confirmPassword: cpErr,
        isValid: !nErr && !eErr && !pErr && !cpErr
    };
};

export const isStrongPassword = (password: string): boolean => {
    return password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password);
};
