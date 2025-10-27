
const GHL_CUSTOM_FIELD_IDS = {

    status: process.env.GHL_CUSTOM_FIELD_STATUS || null,
    age: process.env.GHL_CUSTOM_FIELD_AGE || null,
    height: process.env.GHL_CUSTOM_FIELD_HEIGHT || null,
    weight: process.env.GHL_CUSTOM_FIELD_WEIGHT || null,
    habits: process.env.GHL_CUSTOM_FIELD_HABITS || null,
    medications: process.env.GHL_CUSTOM_FIELD_MEDICATIONS || null,
    diagnosis: process.env.GHL_CUSTOM_FIELD_DIAGNOSIS || null,
    surgeries: process.env.GHL_CUSTOM_FIELD_SURGERIES || null,
    dob: process.env.GHL_CUSTOM_FIELD_DOB || null,
    patientOwner: process.env.GHL_CUSTOM_FIELD_PATIENT_OWNER || null,
};


const buildCustomFieldsForCreate = (patientData) => {
    const customFields = [];

    if (patientData.study_enrolled_id) {
        customFields.push({ key: "study", field_value: String(patientData.study_enrolled_id) });
    }
    if (patientData.patientLeadSource) {
        customFields.push({ key: "patient_lead_source", field_value: patientData.patientLeadSource });
    }
    if (patientData.status) {
        customFields.push({ key: "status", field_value: patientData.status });
    }
    if (patientData.banned) {
        customFields.push({ key: "banned", field_value: patientData.banned });
    }
    if (patientData.qualifiedStatus) {
        customFields.push({ key: "qualified_status", field_value: patientData.qualifiedStatus });
    }
    if (patientData.patientOwner) {
        customFields.push({ key: "patient_lead_owner", field_value: patientData.patientOwner });
    }
    if (patientData.dnq) {
        customFields.push({ key: "dnq", field_value: patientData.dnq });
    }
    if (patientData.patientLeadName) {
        customFields.push({ key: "patient_lead_name", field_value: patientData.patientLeadName });
    }
    if (patientData.notInterestedReasons) {
        customFields.push({ key: "not_interested_reason", field_value: patientData.notInterestedReasons });
    }
    if (patientData.phone2) {
        customFields.push({ key: "phone2", field_value: patientData.phone2 });
    }
    if (patientData.height) {
        customFields.push({ key: "height", field_value: patientData.height });
    }
    if (patientData.weight) {
        customFields.push({ key: "weight", field_value: patientData.weight });
    }
    if (patientData.habits) {
        customFields.push({ key: "habits", field_value: patientData.habits });
    }
    if (patientData.dob) {
        customFields.push({ key: "dob", field_value: patientData.dob });
    }
    if (patientData.age) {
        customFields.push({ key: "age", field_value: String(patientData.age) });
    }
    if (patientData.medications) {
        customFields.push({ key: "medication", field_value: patientData.medications });
    }
    if (patientData.diagnosis) {
        customFields.push({ key: "diagnosis", field_value: patientData.diagnosis });
    }
    if (patientData.surgeries) {
        customFields.push({ key: "surgeries", field_value: patientData.surgeries });
    }

    return customFields;
};


const buildCustomFieldsForUpdate = (patientData, customFieldMap = {}) => {
    const customFields = [];


    if (patientData.study_enrolled_id && customFieldMap['study']) {
        customFields.push({ id: customFieldMap['study'], field_value: String(patientData.study_enrolled_id) });
    }
    if (patientData.patientLeadSource && customFieldMap['patient_lead_source']) {
        customFields.push({ id: customFieldMap['patient_lead_source'], field_value: patientData.patientLeadSource });
    }
    if (patientData.status && customFieldMap['status']) {
        customFields.push({ id: customFieldMap['status'], field_value: patientData.status });
    }
    if (patientData.banned && customFieldMap['banned']) {
        customFields.push({ id: customFieldMap['banned'], field_value: patientData.banned });
    }
    if (patientData.qualifiedStatus && customFieldMap['qualified_status']) {
        customFields.push({ id: customFieldMap['qualified_status'], field_value: patientData.qualifiedStatus });
    }
    if (patientData.patientOwner && customFieldMap['patient_lead_owner']) {
        customFields.push({ id: customFieldMap['patient_lead_owner'], field_value: patientData.patientOwner });
    }
    if (patientData.dnq && customFieldMap['dnq']) {
        customFields.push({ id: customFieldMap['dnq'], field_value: patientData.dnq });
    }
    if (patientData.patientLeadName && customFieldMap['patient_lead_name']) {
        customFields.push({ id: customFieldMap['patient_lead_name'], field_value: patientData.patientLeadName });
    }
    if (patientData.notInterestedReasons && customFieldMap['not_interested_reason']) {
        customFields.push({ id: customFieldMap['not_interested_reason'], field_value: patientData.notInterestedReasons });
    }
    if (patientData.phone2 && customFieldMap['phone2']) {
        customFields.push({ id: customFieldMap['phone2'], field_value: patientData.phone2 });
    }
    if (patientData.height && customFieldMap['height']) {
        customFields.push({ id: customFieldMap['height'], field_value: patientData.height });
    }
    if (patientData.weight && customFieldMap['weight']) {
        customFields.push({ id: customFieldMap['weight'], field_value: patientData.weight });
    }
    if (patientData.habits && customFieldMap['habits']) {
        customFields.push({ id: customFieldMap['habits'], field_value: patientData.habits });
    }
    if (patientData.dob && customFieldMap['dob']) {
        customFields.push({ id: customFieldMap['dob'], field_value: patientData.dob });
    }
    if (patientData.age && customFieldMap['age']) {
        customFields.push({ id: customFieldMap['age'], field_value: String(patientData.age) });
    }
    if (patientData.medications && customFieldMap['medication']) {
        customFields.push({ id: customFieldMap['medication'], field_value: patientData.medications });
    }
    if (patientData.diagnosis && customFieldMap['diagnosis']) {
        customFields.push({ id: customFieldMap['diagnosis'], field_value: patientData.diagnosis });
    }
    if (patientData.surgeries && customFieldMap['surgeries']) {
        customFields.push({ id: customFieldMap['surgeries'], field_value: patientData.surgeries });
    }

    return customFields;
};


const fetchCustomFieldMap = async (locationId, apiKey) => {
    const axios = require('axios');

    try {
       
        const url = `https://services.leadconnectorhq.com/locations/${locationId}/customFields`;

        console.log('🔄 Fetching custom fields from GHL API...');

        const response = await axios.get(url, {
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Version": "2021-07-28",
                "Content-Type": "application/json"
            },
            params: {
                model: 'contact'
            }
        });

        console.log('✅ Custom Fields API Response received');

       
        const customFields = response.data.customFields || response.data.fields || response.data || [];
        const fieldMap = {};

        
        if (Array.isArray(customFields)) {
            customFields.forEach(field => {
                if (field.name) {
                    
                    fieldMap[field.name] = field.id;
           
                    fieldMap[field.name.toLowerCase()] = field.id;
                }
            });
        }

        console.log('📋 Custom Field Map:', fieldMap);
        return fieldMap;

    } catch (error) {
        console.error('❌ Error fetching custom fields:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', JSON.stringify(error.response.data, null, 2));
        }
        return {};
    }
};


const getCustomFieldValue = (contact, fieldName) => {
    if (!contact || !contact.customFields) return null;

    
    const fieldId = GHL_CUSTOM_FIELD_IDS[fieldName];
    if (fieldId) {
        const field = contact.customFields.find(f => f.id === fieldId);
        if (field) return field.value;
    }

    
    const keyMap = {
        status: 'Status',
        age: 'Age',
        height: 'Height',
        weight: 'Weight',
        habits: 'Habits',
        medications: 'Medications',
        diagnosis: 'Diagnosis',
        surgeries: 'Surgeries',
        dob: 'DOB',
        patientOwner: 'Patient Lead Owner'
    };

    const key = keyMap[fieldName];
    if (key) {
        const field = contact.customFields.find(f => f.key === key);
        if (field) return field.value || field.field_value;
    }

    return null;
};

module.exports = {
    GHL_CUSTOM_FIELD_IDS,
    buildCustomFieldsForCreate,
    buildCustomFieldsForUpdate,
    getCustomFieldValue,
    fetchCustomFieldMap
};

