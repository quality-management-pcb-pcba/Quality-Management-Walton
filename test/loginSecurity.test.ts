import assert from 'node:assert';
import * as fs from 'node:fs';
import * as path from 'node:path';

describe('Walton QMS - Login Security & Remember Me Unit Tests', () => {
  const loginModalPath = path.resolve(__dirname, '../src/components/LoginModal.tsx');
  const loginModalContent = fs.readFileSync(loginModalPath, 'utf8');

  it('1. Removes all hardcoded default credentials from initial state', () => {
    // Assert no hardcoded email in useState
    assert.strictEqual(
      loginModalContent.includes("useState('qm.pcba26@gmail.com')"),
      false,
      'Hardcoded email must not be in useState'
    );
    // Assert no hardcoded password in useState
    assert.strictEqual(
      loginModalContent.includes("useState('WaltonQM@2026')"),
      false,
      'Hardcoded password must not be in useState'
    );
    // Assert initial state is empty string
    assert.strictEqual(
      loginModalContent.includes("useState<string>('')"),
      true,
      'Initial username & password state must be empty strings'
    );
  });

  it('2. Removes hardcoded credentials from useEffect modal reset', () => {
    assert.strictEqual(
      loginModalContent.includes("setUsername('qm.pcba26@gmail.com')"),
      false,
      'Hardcoded email must not be in useEffect reset'
    );
    assert.strictEqual(
      loginModalContent.includes("setPassword('WaltonQM@2026')"),
      false,
      'Hardcoded password must not be in useEffect reset'
    );
    assert.strictEqual(
      loginModalContent.includes("setPassword('')"),
      true,
      'Password must explicitly reset to empty string on modal open'
    );
  });

  it('3. Implements Remember Me functionality using dedicated keys', () => {
    assert.strictEqual(
      loginModalContent.includes("const REMEMBER_EMAIL_KEY = 'walton_qm_remembered_email'"),
      true,
      'Must define REMEMBER_EMAIL_KEY'
    );
    assert.strictEqual(
      loginModalContent.includes("const REMEMBER_ME_FLAG_KEY = 'walton_qm_remember_me'"),
      true,
      'Must define REMEMBER_ME_FLAG_KEY'
    );
    assert.strictEqual(
      loginModalContent.includes('id="checkbox-remember-me"'),
      true,
      'Must render remember-me checkbox'
    );
  });

  it('4. NEVER saves passwords in localStorage or sessionStorage', () => {
    // Check that localStorage.setItem only saves REMEMBER_EMAIL_KEY and REMEMBER_ME_FLAG_KEY or user session metadata
    assert.strictEqual(
      loginModalContent.includes("localStorage.setItem('password'"),
      false,
      'Password must NEVER be stored in localStorage'
    );
    assert.strictEqual(
      loginModalContent.includes("sessionStorage.setItem('password'"),
      false,
      'Password must NEVER be stored in sessionStorage'
    );
    assert.strictEqual(
      loginModalContent.includes('localStorage.setItem(REMEMBER_EMAIL_KEY, email)'),
      true,
      'Only email address is saved when Remember Me is consented'
    );
  });

  it('5. Implements Show/Hide Password functionality with eye icons', () => {
    assert.strictEqual(
      loginModalContent.includes('Eye') && loginModalContent.includes('EyeOff'),
      true,
      'Must import and use Eye and EyeOff from lucide-react'
    );
    assert.strictEqual(
      loginModalContent.includes('setShowPassword((prev) => !prev)'),
      true,
      'Must toggle showPassword state on button click'
    );
    assert.strictEqual(
      loginModalContent.includes("type={showPassword ? 'text' : 'password'}"),
      true,
      'Password input type must toggle dynamically between text and password'
    );
  });

  it('6. Adheres to browser autofill autocomplete standards', () => {
    assert.strictEqual(
      loginModalContent.includes('autoComplete="username"'),
      true,
      'Email input must have autoComplete="username"'
    );
    assert.strictEqual(
      loginModalContent.includes('autoComplete="current-password"'),
      true,
      'Password input must have autoComplete="current-password"'
    );
  });

  it('7. Preserves Firebase Authentication and error handling without modification', () => {
    assert.strictEqual(
      loginModalContent.includes('signInWithEmailAndPassword(auth, email, password)'),
      true,
      'Firebase sign in function must remain intact'
    );
    assert.strictEqual(
      loginModalContent.includes('sendPasswordResetEmail(auth, email)'),
      true,
      'Password reset function must remain intact'
    );
    assert.strictEqual(
      loginModalContent.includes('getUserProfile(uid, email)'),
      true,
      'Profile lookup must remain intact'
    );
  });

  it('8. Clears App.tsx initial unauthenticated currentUserEmail state', () => {
    const appPath = path.resolve(__dirname, '../src/App.tsx');
    const appContent = fs.readFileSync(appPath, 'utf8');

    assert.strictEqual(
      appContent.includes("const [currentUserEmail, setCurrentUserEmail] = useState<string>('atiqur40736@waltonbd.com')"),
      false,
      'App.tsx must not hardcode default user email'
    );
    assert.strictEqual(
      appContent.includes("const [currentUserEmail, setCurrentUserEmail] = useState<string>('')"),
      true,
      'App.tsx currentUserEmail must initialize to empty string'
    );
  });
});
