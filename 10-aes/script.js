
const encryptButton = document.getElementById('encrypt-button');
const decryptButton = document.getElementById('decrypt-button');

encryptButton.addEventListener('click', () => {
  const inputText = document.getElementById('input-text').value;
  const password = document.getElementById('password').value;
  const outputText = document.getElementById('output-text');
  
  if (password.length < 8 || password.length > 32) {
    alert("Password must be between 8 and 32 characters long.");
    return;
  }
  
  try {
    const salt = CryptoJS.lib.WordArray.random(16);
    const iv = CryptoJS.lib.WordArray.random(16);
    const key = CryptoJS.PBKDF2(password, salt, {
      keySize: 256 / 32,
      iterations: 1000
    });
    const encrypted = CryptoJS.AES.encrypt(inputText, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });
    const hmac = CryptoJS.HmacSHA256(encrypted.toString(), key);
    const ciphertext = salt.toString() + iv.toString() + hmac.toString() + encrypted.toString();
    outputText.value = ciphertext;
  } catch (e) {
    alert("Encryption failed. Please check your input and try again.");
    console.error(e);
  }
});

decryptButton.addEventListener('click', () => {
  const ciphertext = document.getElementById('output-text').value;
  const password = document.getElementById('password').value;
  const inputText = document.getElementById('input-text');
  
  if (password.length < 8 || password.length > 32) {
    alert("Password must be between 8 and 32 characters long.");
    return;
  }
  
  try {
    const salt = CryptoJS.enc.Hex.parse(ciphertext.substr(0, 32));
    const iv = CryptoJS.enc.Hex.parse(ciphertext.substr(32, 32));
    const hmac = ciphertext.substr(64, 64);
    const encrypted = ciphertext.substr(128);
    const key = CryptoJS.PBKDF2(password, salt, {
      keySize: 256 / 32,
      iterations: 1000
    });
    const hmacVerify = CryptoJS.HmacSHA256(encrypted, key);
    if (hmac !== hmacVerify.toString()) {
      alert("Message authentication code verification failed. The ciphertext may have been tampered with.");
      return;
    }
    const decrypted = CryptoJS.AES.decrypt(encrypted, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });
    inputText.value = decrypted.toString(CryptoJS.enc.Utf8);
  } catch (e) {
    alert("Decryption failed. Please check your input and try again.");
    console.error(e);
  }
});
