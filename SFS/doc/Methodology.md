# Methodology – SecureFileStore

## Step 1: User Authentication
- JWT-based login.
- User receives token for session security.

## Step 2: Key Generation
- AES key generated per file.
- RSA public/private key per user.

## Step 3: File Encryption
- File encrypted using AES.
- AES key encrypted using RSA.

## Step 4: Upload Process
- Encrypted file uploaded to cloud.
- Metadata saved to MongoDB.

## Step 5: Download Process
- Fetch AES encrypted key + file.
- User decrypts AES key using private RSA key.
- File decrypted locally.

## Step 6: Search System
- Query MongoDB based on filename or owner.

## Step 7: Testing
- Encryption tests  
- Authentication tests  
- Cloud upload tests
