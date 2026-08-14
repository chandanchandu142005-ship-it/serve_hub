/**
 * Strict Email Validator Utility
 * Checks syntax, domain formatting, top-level domain validity, and blocks disposable/fake email domains.
 */

const DISPOSABLE_DOMAINS = new Set([
  'tempmail.com', 'temp-mail.org', 'temp-mail.io', 'tempmailo.com',
  'mailinator.com', 'yopmail.com', '10minutemail.com', 'my10minutemail.com',
  'trashmail.com', 'guerrillamail.com', 'dispostable.com', 'throwawaymail.com',
  'fake.com', 'example.com', 'test.com', 'asdf.com', 'asdf.net',
  'sharklasers.com', 'getnada.com', 'maildrop.cc', 'fakeinbox.com',
  'dropmail.me', 'crazymailing.com', 'disposable.com', 'mailnesia.com',
  'spambox.us', 'bccto.me', 'tmail.ws', 'mohmal.com', 'emailondeck.com',
  'generator.email', 'inboxalias.com', 'tempinbox.com', 'nada.ltd',
]);

const VALID_TLDS = new Set([
  'com', 'in', 'org', 'net', 'edu', 'gov', 'co', 'io', 'dev', 'app',
  'me', 'ai', 'info', 'biz', 'us', 'uk', 'ca', 'au', 'de', 'fr', 'eu',
  'tech', 'online', 'store', 'site', 'global', 'cc', 'tv', 'xyz',
]);

/**
 * Validates an email address.
 * @param {string} email
 * @returns {{ isValid: boolean, error?: string, cleanEmail?: string }}
 */
function validateEmail(email) {
  if (!email || typeof email !== 'string') {
    return { isValid: false, error: 'Email address is required.' };
  }

  const cleanEmail = email.toLowerCase().trim();

  // Basic structural check: single @ symbol, no whitespace
  if (cleanEmail.includes(' ') || (cleanEmail.match(/@/g) || []).length !== 1) {
    return { isValid: false, error: 'Please enter a valid email address.' };
  }

  const [username, domain] = cleanEmail.split('@');

  // Validate username length and character syntax
  if (!username || username.length < 2) {
    return { isValid: false, error: 'Email username is too short.' };
  }

  // Regex check for username portion
  const usernameRegex = /^[a-zA-Z0-9]+([._%+-][a-zA-Z0-9]+)*$/;
  if (!usernameRegex.test(username)) {
    return { isValid: false, error: 'Email username contains invalid characters.' };
  }

  // Validate domain format
  if (!domain || !domain.includes('.')) {
    return { isValid: false, error: 'Email must contain a valid domain (e.g., gmail.com).' };
  }

  const domainParts = domain.split('.');
  const tld = domainParts[domainParts.length - 1];
  const domainName = domainParts.slice(0, domainParts.length - 1).join('.');

  // Prevent single-letter domains like a@b.c
  if (!domainName || domainName.length < 2) {
    return { isValid: false, error: 'Please enter a valid email domain (e.g., gmail.com, yahoo.com).' };
  }

  // Check TLD length and characters
  if (!tld || tld.length < 2 || !/^[a-zA-Z]+$/.test(tld)) {
    return { isValid: false, error: 'Please enter a valid top-level email domain (e.g., .com, .in, .org).' };
  }

  // Reject known disposable & fake domains
  if (DISPOSABLE_DOMAINS.has(domain)) {
    return { isValid: false, error: 'Disposable or temporary email addresses are not allowed. Please use a real email.' };
  }

  return { isValid: true, cleanEmail };
}

module.exports = {
  validateEmail,
  DISPOSABLE_DOMAINS,
};
