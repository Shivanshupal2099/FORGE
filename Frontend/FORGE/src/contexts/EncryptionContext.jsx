import { createContext, useContext, useState, useCallback } from 'react';
import {
  generateKeyPair,
  exportPublicKey,
  importPublicKey,
  deriveSharedKey,
  encryptMessage,
  decryptMessage,
  importKey,
  exportKey
} from '../utils/encryption';

const EncryptionContext = createContext(null);

export const EncryptionProvider = ({ children }) => {
  const [sharedKeys, setSharedKeys] = useState({}); // Map of user ID to shared key

  // Store or retrieve a key pair for a user
  const getKeyPair = useCallback((userId) => {
    try {
      const stored = localStorage.getItem(`encryption_key_${userId}`);
      if (stored) {
        return JSON.parse(stored);
      }
      return null;
    } catch (error) {
      console.error('Error retrieving key pair:', error);
      return null;
    }
  }, []);

  // Derive shared key for a connection using ECDH
  const deriveConnectionKey = useCallback(async (userId, partnerPublicKey) => {
    try {
      const keyPairData = getKeyPair(userId);
      if (!keyPairData) {
        console.error('No key pair found for user:', userId);
        return null;
      }

      // Import the private key
      const privateKey = await window.crypto.subtle.importKey(
        'jwk',
        keyPairData.privateKey,
        { name: 'ECDH', namedCurve: 'P-256' },
        true,
        ['deriveKey', 'deriveBits']
      );

      // Import the partner's public key
      const publicKey = await importPublicKey(partnerPublicKey);

      // Derive shared key
      const sharedKey = await deriveSharedKey(privateKey, publicKey);

      // Cache the shared key
      setSharedKeys(prev => ({
        ...prev,
        [userId]: sharedKey
      }));

      return sharedKey;
    } catch (error) {
      console.error('Error deriving shared key:', error);
      return null;
    }
  }, [getKeyPair]);

  // Encrypt a message for a specific user
  const encryptForUser = useCallback(async (userId, message) => {
    try {
      const sharedKey = sharedKeys[userId];

      if (!sharedKey) {
        throw new Error('No shared key available for this user. Please initialize the connection first.');
      }

      return await encryptMessage(message, sharedKey);
    } catch (error) {
      console.error('Error encrypting message:', error);
      throw error;
    }
  }, [sharedKeys]);

  // Decrypt a message from a specific user
  const decryptFromUser = useCallback(async (userId, encryptedMessage) => {
    try {
      const sharedKey = sharedKeys[userId];

      if (!sharedKey) {
        throw new Error('No shared key available for this user. Please initialize the connection first.');
      }

      return await decryptMessage(encryptedMessage, sharedKey);
    } catch (error) {
      console.error('Error decrypting message:', error);
      throw error;
    }
  }, [sharedKeys]);

  // Initialize shared key for a connection
  const initializeConnectionEncryption = useCallback(async (userId, partnerPublicKey) => {
    const sharedKey = await deriveConnectionKey(userId, partnerPublicKey);
    return sharedKey;
  }, [deriveConnectionKey]);

  const value = {
    deriveConnectionKey,
    encryptForUser,
    decryptFromUser,
    initializeConnectionEncryption,
    getKeyPair
  };

  return (
    <EncryptionContext.Provider value={value}>
      {children}
    </EncryptionContext.Provider>
  );
};

export const useEncryption = () => {
  const context = useContext(EncryptionContext);
  if (!context) {
    throw new Error('useEncryption must be used within an EncryptionProvider');
  }
  return context;
};
