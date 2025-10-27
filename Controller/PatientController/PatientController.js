const patientModel = require("../../Model/PatientModal/PatientModel")
const axios = require('axios');
const { buildCustomFieldsForCreate, buildCustomFieldsForUpdate, fetchCustomFieldMap } = require('../../Config/ghlCustomFields');

// Load environment variables
const GHL_API_KEY = process.env.GHL_API_KEY;
const GHL_LOCATION_ID = process.env.GHL_LOCATION_ID;


const createPatient = async (req, res) => {
    console.log("Creating patient...");
    try {
      const patientData = req.body;

      // Validate required GHL credentials
      if (!GHL_API_KEY) {
        return res.status(500).json({
          error: "GHL API Key is not configured. Please set GHL_API_KEY in environment variables."
        });
      }

      if (!GHL_LOCATION_ID) {
        return res.status(500).json({
          error: "GHL Location ID is not configured. Please set GHL_LOCATION_ID in environment variables."
        });
      }

      // Prepare custom fields using helper function
      const customFields = buildCustomFieldsForCreate(patientData);

      console.log("📋 Patient Data received:", JSON.stringify(patientData, null, 2));
      console.log("📋 Custom Fields built:", JSON.stringify(customFields, null, 2));

      const ghlPayload = {
        firstName: patientData.patientLeadName || "Unknown",
        lastName: patientData.lastName || "",
        email: patientData.email || undefined, // Don't send empty string
        phone: patientData.phone || undefined, // Don't send empty string
        locationId: GHL_LOCATION_ID, // Required field
        source: patientData.patientLeadSource || undefined
      };

      // Add custom fields to payload if any exist
      if (customFields.length > 0) {
        ghlPayload.customFields = customFields;
      }

      Object.keys(ghlPayload).forEach(key => {
        if (ghlPayload[key] === undefined || ghlPayload[key] === "") {
          delete ghlPayload[key];
        }
      });


      const GHL_API_URL = `https://services.leadconnectorhq.com/contacts`;

      console.log("🔄 Sending request to GHL API:", GHL_API_URL);
      console.log("📦 Payload:", JSON.stringify(ghlPayload, null, 2));
      console.log("🔑 Using API Key:", GHL_API_KEY?.substring(0, 20) + "...");

      const ghlResponse = await axios.post(GHL_API_URL, ghlPayload, {
        headers: {
            "Authorization": `Bearer ${GHL_API_KEY}`,
            "Version": "2021-07-28",
            "Content-Type": "application/json"
          }
      });

      console.log("✅ GHL API Response:", ghlResponse.data);
      const ghlContactId = ghlResponse?.data?.contact?.id || ghlResponse?.data?.id || null;

      
      const patient = await patientModel.createPatient(patientData, ghlContactId);

      res.status(200).json({
        message: "Patient created successfully in both GHL and local database",
        localPatient: patient,
        ghlContactId,
        ghlResponse: ghlResponse.data
      });
    } catch (error) {
      console.error("❌ GHL API Error Details:");
      console.error("Status:", error.response?.status);
      console.error("Data:", JSON.stringify(error.response?.data, null, 2));
      console.error("Message:", error.message);

      // Check for specific error types
      if (error.response?.status === 401) {
        return res.status(500).json({
          error: "GHL Authentication Failed",
          message: "Invalid or expired API token. Please generate a new Private Integration token from GHL Settings.",
          details: error.response?.data
        });
      }

      if (error.response?.status === 422) {
        return res.status(400).json({
          error: "Invalid data sent to GHL",
          message: "Please check the data format and required fields.",
          details: error.response?.data
        });
      }

      
      try {
        const patient = await patientModel.createPatient(patientData, null);
        return res.status(207).json({
          warning: "Patient saved locally but failed to sync with GHL",
          localPatient: patient,
          ghlError: error.response?.data || error.message
        });
      } catch (dbError) {
        return res.status(500).json({
          error: "Failed to create patient",
          ghlError: error.response?.data || error.message,
          dbError: dbError.message
        });
      }
    }
  };
  

const getPatient = async(req, res) => {
    console.log("Fetching all contacts from GHL...");
    try {
        // Validate required GHL credentials
        if (!GHL_API_KEY) {
            return res.status(500).json({
                error: "GHL API Key is not configured. Please set GHL_API_KEY in environment variables."
            });
        }

        if (!GHL_LOCATION_ID) {
            return res.status(500).json({
                error: "GHL Location ID is not configured. Please set GHL_LOCATION_ID in environment variables."
            });
        }

        // Fetch contacts from GHL API
        const GHL_API_URL = `https://services.leadconnectorhq.com/contacts/`;

        console.log("🔄 Fetching contacts from GHL API:", GHL_API_URL);
        console.log("🔑 Using Location ID:", GHL_LOCATION_ID);

        const ghlResponse = await axios.get(GHL_API_URL, {
            params: {
                locationId: GHL_LOCATION_ID
            },
            headers: {
                "Authorization": `Bearer ${GHL_API_KEY}`,
                "Version": "2021-07-28",
                "Content-Type": "application/json"
            }
        });

        console.log("✅ GHL API Response received");

        // Fetch custom field definitions to enrich custom fields with names
        console.log("🔄 Fetching custom field definitions to map IDs to names...");
        const customFieldMap = await fetchCustomFieldMap(GHL_LOCATION_ID, GHL_API_KEY);

        // Create reverse map: ID -> name (lowercase)
        // We use lowercase names to match our frontend field names
        const idToNameMap = {};
        Object.keys(customFieldMap).forEach(name => {
            const fieldId = customFieldMap[name];
            // Only store lowercase version to avoid duplicates
            if (name === name.toLowerCase()) {
                idToNameMap[fieldId] = name;
            }
        });
        console.log("✅ Custom field ID to name map created");

        // Fetch local database records to merge custom fields
        const localPatients = await patientModel.getPatient();
        console.log(`📊 Found ${localPatients.length} patients in local database`);

        // Merge GHL contacts with local database data
        const ghlContacts = ghlResponse.data.contacts || ghlResponse.data;
        const mergedContacts = ghlContacts.map(contact => {
            // First, enrich existing GHL custom fields with field names
            if (contact.customFields && Array.isArray(contact.customFields)) {
                contact.customFields = contact.customFields.map(field => ({
                    id: field.id,
                    value: field.value,
                    key: idToNameMap[field.id] || field.id,
                    name: idToNameMap[field.id] || field.id
                }));
            } else {
                contact.customFields = [];
            }
            // Find matching local patient by ghl_contact_id
            const localPatient = localPatients.find(p => p.ghl_contact_id === contact.id);

            if (localPatient) {
                console.log(`🔗 Merging local data for contact ${contact.id}:`, {
                    ghlCustomFields: contact.customFields,
                    localStatus: localPatient.status,
                    localAge: localPatient.age,
                    localStudyEnrolledId: localPatient.study_enrolled_id
                });

                // Merge custom fields from local database into GHL contact
                // Create customFields array if it doesn't exist
                const customFields = contact.customFields || [];

                // Add custom fields from local database (use lowercase field names to match GHL)
                if (localPatient.study_enrolled_id) {
                    console.log(`📚 Adding study field from local DB: ${localPatient.study_enrolled_id}`);
                    customFields.push({ key: 'study', name: 'study', value: String(localPatient.study_enrolled_id) });
                }
                if (localPatient.status) {
                    customFields.push({ key: 'status', name: 'status', value: localPatient.status });
                }
                if (localPatient.age) {
                    customFields.push({ key: 'age', name: 'age', value: localPatient.age });
                }
                if (localPatient.height) {
                    customFields.push({ key: 'height', name: 'height', value: localPatient.height });
                }
                if (localPatient.weight) {
                    customFields.push({ key: 'weight', name: 'weight', value: localPatient.weight });
                }
                if (localPatient.habits) {
                    customFields.push({ key: 'habits', name: 'habits', value: localPatient.habits });
                }
                if (localPatient.medication) {
                    customFields.push({ key: 'medication', name: 'medication', value: localPatient.medication });
                }
                if (localPatient.diagnosis) {
                    customFields.push({ key: 'diagnosis', name: 'diagnosis', value: localPatient.diagnosis });
                }
                if (localPatient.surgeries) {
                    customFields.push({ key: 'surgeries', name: 'surgeries', value: localPatient.surgeries });
                }
                if (localPatient.dob) {
                    customFields.push({ key: 'dob', name: 'dob', value: localPatient.dob });
                }
                if (localPatient.patient_lead_owner) {
                    customFields.push({ key: 'patient_lead_owner', name: 'patient_lead_owner', value: localPatient.patient_lead_owner });
                }

                return {
                    ...contact,
                    customFields: customFields
                };
            }

            return contact;
        });

        console.log(`✅ Merged ${mergedContacts.length} contacts with local database data`);

        // Log a sample contact to verify custom fields are included
        if (mergedContacts.length > 0) {
            const sampleContact = mergedContacts.find(c => c.customFields && c.customFields.length > 0);
            if (sampleContact) {
                console.log('📋 Sample contact with custom fields:', {
                    id: sampleContact.id,
                    firstName: sampleContact.firstName,
                    customFields: sampleContact.customFields
                });
            }
        }

        res.status(200).json({
            message: "Contacts fetched successfully from GHL and merged with local database",
            contacts: mergedContacts,
            total: ghlResponse.data.total || mergedContacts.length
        });

    } catch (error) {
        console.error("❌ GHL API Error Details:");
        console.error("Status:", error.response?.status);
        console.error("Data:", JSON.stringify(error.response?.data, null, 2));
        console.error("Message:", error.message);

        if (error.response?.status === 401) {
            return res.status(500).json({
                error: "GHL Authentication Failed",
                message: "Invalid or expired API token. Please generate a new Private Integration token from GHL Settings.",
                details: error.response?.data
            });
        }

        res.status(500).json({
            error: "Failed to fetch contacts from GHL",
            message: error.response?.data || error.message
        });
    }
}

const getPatientById = async(req, res) => {
    console.log("Fetching contact by ID from GHL...");
    try {
        const { id } = req.params; // This is the GHL contactId

        // Validate required GHL credentials
        if (!GHL_API_KEY) {
            return res.status(500).json({
                error: "GHL API Key is not configured. Please set GHL_API_KEY in environment variables."
            });
        }

        if (!GHL_LOCATION_ID) {
            return res.status(500).json({
                error: "GHL Location ID is not configured. Please set GHL_LOCATION_ID in environment variables."
            });
        }

        // Fetch contact from GHL API by contactId
        const GHL_API_URL = `https://services.leadconnectorhq.com/contacts/${id}`;

        console.log("🔄 Fetching contact from GHL API:", GHL_API_URL);

        const ghlResponse = await axios.get(GHL_API_URL, {
            headers: {
                "Authorization": `Bearer ${GHL_API_KEY}`,
                "Version": "2021-07-28",
                "Content-Type": "application/json"
            }
        });

        console.log("✅ GHL Contact fetched successfully");

        const contact = ghlResponse.data.contact || ghlResponse.data;

        // Fetch custom field definitions to enrich custom fields with names
        console.log("🔄 Fetching custom field definitions to map IDs to names...");
        const customFieldMap = await fetchCustomFieldMap(GHL_LOCATION_ID, GHL_API_KEY);

        // Create reverse map: ID -> name (lowercase)
        // We use lowercase names to match our frontend field names
        const idToNameMap = {};
        Object.keys(customFieldMap).forEach(name => {
            const fieldId = customFieldMap[name];
            // Only store lowercase version to avoid duplicates
            if (name === name.toLowerCase()) {
                idToNameMap[fieldId] = name;
            }
        });

        // Enrich custom fields with field names
        if (contact.customFields && Array.isArray(contact.customFields)) {
            contact.customFields = contact.customFields.map(field => ({
                id: field.id,
                value: field.value,
                key: idToNameMap[field.id] || field.id, // Add 'key' property with field name
                name: idToNameMap[field.id] || field.id  // Add 'name' property with field name
            }));
            console.log("✅ Enriched custom fields:", JSON.stringify(contact.customFields, null, 2));
        } else {
            contact.customFields = [];
        }

        // Fetch local database record to merge study_enrolled_id
        console.log("🔄 Fetching local database record for contact:", id);
        const localPatients = await patientModel.getPatient();
        const localPatient = localPatients.find(p => p.ghl_contact_id === id);

        if (localPatient) {
            console.log("✅ Found local patient record:", {
                patient_id: localPatient.patient_id,
                study_enrolled_id: localPatient.study_enrolled_id
            });

            // Merge study_enrolled_id from local database if it exists
            if (localPatient.study_enrolled_id) {
                console.log(`📚 Adding study field from local DB: ${localPatient.study_enrolled_id}`);
                // Check if study field already exists in GHL custom fields
                const existingStudyField = contact.customFields.find(f => f.key === 'study' || f.name === 'study');
                if (!existingStudyField) {
                    contact.customFields.push({
                        key: 'study',
                        name: 'study',
                        value: String(localPatient.study_enrolled_id)
                    });
                }
            }
        } else {
            console.log("⚠️ No local patient record found for contact:", id);
        }

        res.status(200).json({
            message: "Contact fetched successfully from GHL",
            contact: contact
        });

    } catch (error) {
        console.error("❌ GHL API Error Details:");
        console.error("Status:", error.response?.status);
        console.error("Data:", JSON.stringify(error.response?.data, null, 2));
        console.error("Message:", error.message);

        if (error.response?.status === 401) {
            return res.status(500).json({
                error: "GHL Authentication Failed",
                message: "Invalid or expired API token. Please generate a new Private Integration token from GHL Settings.",
                details: error.response?.data
            });
        }

        if (error.response?.status === 404) {
            return res.status(404).json({
                error: "Contact not found",
                message: `No contact found with ID: ${id}`,
                details: error.response?.data
            });
        }

        res.status(500).json({
            error: "Failed to fetch contact from GHL",
            message: error.response?.data || error.message
        });
    }
}

const updatePatient = async(req, res) => {
    console.log("Updating contact in both GHL and local DB...");
    try {
        const { id } = req.params; // This can be either GHL contactId or local patient_id
        const patientData = req.body;

        console.log("Updating patient with ID:", id);
        console.log("Update data:", JSON.stringify(patientData, null, 2));

        // Validate required GHL credentials
        if (!GHL_API_KEY) {
            return res.status(500).json({
                error: "GHL API Key is not configured. Please set GHL_API_KEY in environment variables."
            });
        }

        if (!GHL_LOCATION_ID) {
            return res.status(500).json({
                error: "GHL Location ID is not configured. Please set GHL_LOCATION_ID in environment variables."
            });
        }

        // Determine if id is GHL contactId or local patient_id
        let ghlContactId = id;
        let localPatientId = null;

        // If id looks like a local DB id (numeric only, no letters), fetch the ghl_contact_id
        if (/^\d+$/.test(id)) {
            console.log("📌 ID appears to be a local DB ID, fetching GHL contact ID...");
            const localPatient = await patientModel.getPatientById(id);
            if (localPatient && localPatient.ghl_contact_id) {
                ghlContactId = localPatient.ghl_contact_id;
                localPatientId = id;
                console.log("✅ Found GHL contact ID:", ghlContactId);
            } else {
                console.log("⚠️ No GHL contact ID found for local patient ID:", id);
            }
        } else {
            console.log("📌 ID appears to be a GHL contact ID");
        }

        // Prepare GHL payload - send all standard fields and custom fields
        const ghlPayload = {};

        // Build payload with only non-empty values
        // firstName (or patientLeadName)
        const firstName = patientData.patientLeadName || patientData.firstName;
        if (firstName && firstName.trim() !== '') {
            ghlPayload.firstName = firstName.trim();
        }

        // lastName - STANDARD GHL FIELD
        if (patientData.lastName && patientData.lastName.trim() !== '') {
            ghlPayload.lastName = patientData.lastName.trim();
        }

        // email - STANDARD GHL FIELD
        if (patientData.email && patientData.email.trim() !== '') {
            ghlPayload.email = patientData.email.trim();
        }

        // phone - STANDARD GHL FIELD
        if (patientData.phone && patientData.phone.trim() !== '') {
            ghlPayload.phone = patientData.phone.trim();
        }

        // source - STANDARD GHL FIELD
        const source = patientData.patientLeadSource || patientData.source;
        if (source && source.trim() !== '') {
            ghlPayload.source = source.trim();
        }

        // Fetch custom field definitions to get field IDs
        console.log("🔄 Fetching custom field definitions from GHL...");
        const customFieldMap = await fetchCustomFieldMap(GHL_LOCATION_ID, GHL_API_KEY);

        // Prepare custom fields for UPDATE using ID-based format
        // UPDATE uses: { id: "field_id", field_value: "value" }
        const customFieldsToUpdate = buildCustomFieldsForUpdate(patientData, customFieldMap);

        // Add custom fields to payload if any exist
        if (customFieldsToUpdate.length > 0) {
            ghlPayload.customFields = customFieldsToUpdate;
            console.log("📝 Custom fields to update:", JSON.stringify(customFieldsToUpdate, null, 2));
        } else {
            console.log("ℹ️ No custom fields to update");
        }

        // Ensure we have at least one field to update
        if (Object.keys(ghlPayload).length === 0) {
            return res.status(400).json({
                error: "No valid fields to update",
                message: "Please provide at least one non-empty field to update"
            });
        }

        // Update in GHL
        const PUT_GHL_API_URL = `https://services.leadconnectorhq.com/contacts/${ghlContactId}`;

        console.log("🔄 Updating contact in GHL API:", PUT_GHL_API_URL);
        console.log("📦 GHL Payload:", JSON.stringify(ghlPayload, null, 2));

        const ghlResponse = await axios.put(PUT_GHL_API_URL, ghlPayload, {
            headers: {
                "Authorization": `Bearer ${GHL_API_KEY}`,
                "Version": "2021-07-28",
                "Content-Type": "application/json"
            }
        });

        console.log("✅ GHL Contact updated successfully");
        console.log("📄 GHL Response:", JSON.stringify(ghlResponse.data, null, 2));

        // Log the custom fields in the response to verify they were saved
        const responseContact = ghlResponse.data.contact || ghlResponse.data;
        if (responseContact.customFields) {
            console.log("📋 Custom Fields in GHL Response:", JSON.stringify(responseContact.customFields, null, 2));
        } else {
            console.log("⚠️ WARNING: No customFields in GHL response!");
        }

        // Update in local database
        let localUpdateResult = null;
        if (localPatientId) {
            localUpdateResult = await patientModel.updatePatient(localPatientId, patientData);
            console.log("✅ Local DB updated successfully");
        } else {
            // Try to find by ghl_contact_id and update
            const patients = await patientModel.getPatient();
            const existingPatient = patients.find(p => p.ghl_contact_id === ghlContactId);
            if (existingPatient) {
                localUpdateResult = await patientModel.updatePatient(existingPatient.patient_id, patientData);
                console.log("✅ Local DB updated successfully");
            } else {
                console.log("⚠️ No local DB record found for GHL contact ID:", ghlContactId);
            }
        }

        // Return the updated contact data for immediate frontend update
        const updatedContact = ghlResponse.data.contact || ghlResponse.data;

        res.status(200).json({
            message: "Contact updated successfully in both GHL and local database",
            contact: updatedContact, // Return the updated contact for immediate display
            ghlResponse: ghlResponse.data,
            localUpdate: localUpdateResult,
            updatedFields: Object.keys(ghlPayload)
        });

    } catch (error) {
        console.error("❌ Update Contact Error:");
        console.error("Status:", error.response?.status);
        console.error("Data:", JSON.stringify(error.response?.data, null, 2));
        console.error("Message:", error.message);
        console.error("Stack:", error.stack);

        if (error.response?.status === 401) {
            return res.status(500).json({
                error: "GHL Authentication Failed",
                message: "Invalid or expired API token. Please generate a new Private Integration token from GHL Settings.",
                details: error.response?.data
            });
        }

        if (error.response?.status === 404) {
            return res.status(404).json({
                error: "Contact not found in GHL",
                message: `No contact found with ID: ${id}`,
                details: error.response?.data
            });
        }

        if (error.response?.status === 422 || error.response?.status === 400) {
            return res.status(400).json({
                error: "Invalid data sent to GHL",
                message: "Please check the data format and required fields.",
                details: error.response?.data
            });
        }

        res.status(500).json({
            error: "Failed to update contact",
            message: error.response?.data?.message || error.message,
            details: error.response?.data
        });
    }
}

const deletePatient = async(req, res) => {
    console.log("Deleting contact from both GHL and local DB...");
    try {
        const { id } = req.params; // This can be either GHL contactId or local patient_id

        console.log("Deleting patient with ID:", id);

        // Validate required GHL credentials
        if (!GHL_API_KEY) {
            return res.status(500).json({
                error: "GHL API Key is not configured. Please set GHL_API_KEY in environment variables."
            });
        }

        // Determine if id is GHL contactId or local patient_id
        let ghlContactId = id;
        let localPatientId = null;

        // If id looks like a local DB id (numeric), fetch the ghl_contact_id
        if (!isNaN(id)) {
            const localPatient = await patientModel.getPatientById(id);
            if (localPatient && localPatient.ghl_contact_id) {
                ghlContactId = localPatient.ghl_contact_id;
                localPatientId = id;
            }
        }

        // Delete from GHL
        const GHL_API_URL = `https://services.leadconnectorhq.com/contacts/${ghlContactId}`;

        console.log("🔄 Deleting contact from GHL API:", GHL_API_URL);

        const ghlResponse = await axios.delete(GHL_API_URL, {
            headers: {
                "Authorization": `Bearer ${GHL_API_KEY}`,
                "Version": "2021-07-28",
                "Content-Type": "application/json"
            }
        });

        console.log("✅ GHL Contact deleted successfully");

        // Delete from local database
        let localDeleteResult = null;
        if (localPatientId) {
            localDeleteResult = await patientModel.deletePatient(localPatientId);
            console.log("✅ Local DB record deleted successfully");
        } else {
            // Try to find by ghl_contact_id and delete
            const patients = await patientModel.getPatient();
            const existingPatient = patients.find(p => p.ghl_contact_id === ghlContactId);
            if (existingPatient) {
                localDeleteResult = await patientModel.deletePatient(existingPatient.patient_id);
                console.log("✅ Local DB record deleted successfully");
            }
        }

        res.status(200).json({
            message: "Contact deleted successfully from both GHL and local database",
            ghlResponse: ghlResponse.data,
            localDelete: localDeleteResult
        });

    } catch (error) {
        console.error("❌ Delete Contact Error:");
        console.error("Status:", error.response?.status);
        console.error("Data:", JSON.stringify(error.response?.data, null, 2));
        console.error("Message:", error.message);

        if (error.response?.status === 401) {
            return res.status(500).json({
                error: "GHL Authentication Failed",
                message: "Invalid or expired API token. Please generate a new Private Integration token from GHL Settings.",
                details: error.response?.data
            });
        }

        if (error.response?.status === 404) {
            return res.status(404).json({
                error: "Contact not found in GHL",
                message: `No contact found with ID: ${id}`,
                details: error.response?.data
            });
        }

        res.status(500).json({
            error: "Failed to delete contact",
            message: error.response?.data || error.message
        });
    }
}


const getPatientCount = async(req, res) => {
    console.log("Counting all contacts from GHL...");
    try {
        // Validate required GHL credentials
        if (!GHL_API_KEY) {
            return res.status(500).json({
                error: "GHL API Key is not configured. Please set GHL_API_KEY in environment variables."
            });
        }

        if (!GHL_LOCATION_ID) {
            return res.status(500).json({
                error: "GHL Location ID is not configured. Please set GHL_LOCATION_ID in environment variables."
            });
        }

        // Fetch contacts from GHL API
        const GHL_API_URL = `https://services.leadconnectorhq.com/contacts/`;

        console.log("🔄 Fetching contacts from GHL API for counting:", GHL_API_URL);
        console.log("🔑 Using Location ID:", GHL_LOCATION_ID);

        const ghlResponse = await axios.get(GHL_API_URL, {
            params: {
                locationId: GHL_LOCATION_ID
            },
            headers: {
                "Authorization": `Bearer ${GHL_API_KEY}`,
                "Version": "2021-07-28",
                "Content-Type": "application/json"
            }
        });

        console.log("✅ GHL API Response received for counting");

        // Get contacts data
        const ghlContacts = ghlResponse.data.contacts || ghlResponse.data;
        
        // Count the patients
        const patientCount = ghlContacts.length;
        
        console.log(`📊 Total patients counted: ${patientCount}`);

        res.status(200).json({
            message: "Patient count fetched successfully from GHL",
            count: patientCount,
            total: ghlResponse.data.total || patientCount
        });

    } catch (error) {
        console.error("❌ GHL API Error Details:");
        console.error("Status:", error.response?.status);
        console.error("Data:", JSON.stringify(error.response?.data, null, 2));
        console.error("Message:", error.message);

        if (error.response?.status === 401) {
            return res.status(500).json({
                error: "GHL Authentication Failed",
                message: "Invalid or expired API token. Please generate a new Private Integration token from GHL Settings.",
                details: error.response?.data
            });
        }

        res.status(500).json({
            error: "Failed to fetch patient count from GHL",
            message: error.response?.data || error.message
        });
    }
}

module.exports = {
    createPatient,
    getPatient,
    getPatientById,
    updatePatient,
    deletePatient,
    getPatientCount
    
}