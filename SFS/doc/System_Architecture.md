# System Architecture – SecureFileStore

## Overview
SecureFileStore is a cloud-based encrypted file storage system that ensures:
- Client-side encryption  
- AES for fast file encryption  
- RSA for secure key management  
- MongoDB for metadata  
- Firebase/AWS for file storage  
- JWT for secure authentication  

## Components
1. **Frontend (React)**  
   Manages UI, login, upload, search, download.

2. **Backend (Flask/Django)**  
   - Handles API requests  
   - Performs encryption/decryption  
   - Connects to MongoDB  
   - Uploads encrypted files to Firebase/AWS  

3. **Cloud Storage**  
   Stores encrypted binary files.

4. **Database (MongoDB)**  
   Stores:
   - File owner  
   - File name  
   - Encrypted AES key  
   - Cloud URL  
   - Timestamps  

## Data Flow
User → Encrypt (AES) → Encrypt AES Key (RSA) → Upload to Cloud → Metadata saved → Download → Decrypt AES Key → Decrypt File
