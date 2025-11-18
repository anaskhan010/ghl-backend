const fs = require('fs');
const path = require('path');

/**
 * Move uploaded file to public/{contactId}/ folder
 * @param {Object} file - Multer file object
 * @param {String} contactId - GHL contact ID
 * @returns {String} - Local file URL path
 */
const moveFileToPublicFolder = (file, contactId) => {
    try {
        // Create public/{contactId} directory if it doesn't exist
        const contactDir = path.join(__dirname, '../public', contactId);
        if (!fs.existsSync(contactDir)) {
            fs.mkdirSync(contactDir, { recursive: true });
        }

        // Get file extension
        const fileExt = path.extname(file.originalname);
        
        // New filename: contactId + extension
        const newFilename = `${contactId}${fileExt}`;
        const newFilePath = path.join(contactDir, newFilename);

        // Move file from uploads to public/{contactId}/
        fs.renameSync(file.path, newFilePath);

        // Return the URL path (relative to public folder)
        const fileUrl = `/public/${contactId}/${newFilename}`;
        
        console.log(`✅ File moved to: ${newFilePath}`);
        console.log(`📎 File URL: ${fileUrl}`);
        
        return fileUrl;
    } catch (error) {
        console.error('❌ Error moving file to public folder:', error);
        throw error;
    }
};

/**
 * Delete file from public/{contactId}/ folder
 * @param {String} fileUrl - File URL path (e.g., /public/{contactId}/filename.pdf)
 */
const deleteFileFromPublicFolder = (fileUrl) => {
    try {
        if (!fileUrl) return;
        
        // Convert URL to file path
        const filePath = path.join(__dirname, '..', fileUrl);
        
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log(`🗑️ File deleted: ${filePath}`);
        }
    } catch (error) {
        console.error('❌ Error deleting file:', error);
    }
};

module.exports = {
    moveFileToPublicFolder,
    deleteFileFromPublicFolder
};

