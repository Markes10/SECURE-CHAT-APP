const crypto = require('crypto');
const fs = require('fs');

// 🔐 Load RSA keys
const publicKey = fs.readFileSync('./keys/public.pem', 'utf8');
const privateKey = fs.readFileSync('./keys/private.pem', 'utf8');

// 🧠 Encrypt message using AES + RSA
function encryptMessage(message) {
  // Generate AES key and IV
  const aesKey = crypto.randomBytes(32); // 256-bit
  const iv = crypto.randomBytes(16);     // 128-bit

  // Encrypt message with AES
  const cipher = crypto.createCipheriv('aes-256-cbc', aesKey, iv);
  let encrypted = cipher.update(message, 'utf8', 'base64');
  encrypted += cipher.final('base64');

  // Encrypt AES key with RSA
  const encryptedKey = crypto.publicEncrypt(publicKey, aesKey).toString('base64');
  const encryptedIV = crypto.publicEncrypt(publicKey, iv).toString('base64');

  // Sign the original message
  const signer = crypto.createSign('RSA-SHA256');
  signer.update(message);
  const signature = signer.sign(privateKey, 'base64');

  return {
    encryptedMessage: encrypted,
    encryptedKey,
    encryptedIV,
    signature
  };
}

// 🔍 Decrypt and verify message
function decryptMessage({ encryptedMessage, encryptedKey, encryptedIV, signature }) {
  try {
    // Decrypt AES key and IV with RSA
    const aesKey = crypto.privateDecrypt(privateKey, Buffer.from(encryptedKey, 'base64'));
    const iv = crypto.privateDecrypt(privateKey, Buffer.from(encryptedIV, 'base64'));

    // Decrypt message with AES
    const decipher = crypto.createDecipheriv('aes-256-cbc', aesKey, iv);
    let decrypted = decipher.update(encryptedMessage, 'base64', 'utf8');
    decrypted += decipher.final('utf8');

    // Verify signature
    const verifier = crypto.createVerify('RSA-SHA256');
    verifier.update(decrypted);
    const isValid = verifier.verify(publicKey, signature, 'base64');

    return {
      message: decrypted,
      signatureValid: isValid
    };
  } catch (err) {
    return {
      message: '[Decryption failed]',
      signatureValid: false
    };
  }
}

module.exports = { encryptMessage, decryptMessage };