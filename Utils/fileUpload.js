const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');


const uploadFileToGHL = async (file, apiKey, contactId) => {
    try {
        console.log('📤 Uploading file to GHL:', file.originalname);
        console.log('📋 Contact ID:', contactId);

        // Get file extension
        const fileExt = path.extname(file.originalname);

        // New filename: contactId + extension
        const ghlFilename = contactId ? `${contactId}${fileExt}` : file.originalname;
        console.log('📝 GHL filename:', ghlFilename);

        const formData = new FormData();
        formData.append('file', fs.createReadStream(file.path), {
            filename: ghlFilename,
            contentType: file.mimetype
        });

        const response = await axios.post(
            'https://services.leadconnectorhq.com/medias/upload-file',
            formData,
            {
                headers: {
                    ...formData.getHeaders(),
                    'Accept': 'application/json',
                    'Version': '2021-07-28',
                    'Authorization': `Bearer ${apiKey}`
                },
                maxBodyLength: Infinity
            }
        );

        console.log('✅ File uploaded to GHL successfully');
        console.log('📄 GHL Response:', JSON.stringify(response.data, null, 2));

        // Return the file URL from GHL response (don't delete file yet - will be moved to public folder)
        return response.data.fileUrl || response.data.url || response.data.uploadedUrl;

    } catch (error) {
        console.error('❌ Error uploading file to GHL:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', JSON.stringify(error.response.data, null, 2));
        }

        // Clean up temporary file on error
        if (file && file.path && fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
        }

        throw new Error(`Failed to upload file to GHL: ${error.message}`);
    }
};

module.exports = {
    uploadFileToGHL
};

