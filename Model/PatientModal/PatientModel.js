const db = require("../../Config/DBConnection")


const createPatient = async(patientData, ghlContactId) => {
    try {
        const query = "INSERT INTO patients (ghl_contact_id, study_enrolled_id, patient_lead_source, banned, patient_lead_owner, patient_lead_name, last_name, phone, phone2, email, dob, age, height, weight, habits, medication, diagnosis, surgeries,notes, status, created_by, modified_by, qualified_status, dnq, not_interested_reason) VALUES (?,?,?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        const values = [
            ghlContactId || null,
            patientData.study_enrolled_id || null,
            patientData.patientLeadSource || null,

            patientData.banned || null,
            patientData.patientOwner || null,
            patientData.patientLeadName || null,
            patientData.lastName || null,
            patientData.phone || null,
            patientData.phone2 || null,
            patientData.email || null,
            patientData.dob || null,
            patientData.age || null,
            patientData.height || null,
            patientData.weight || null,
            patientData.habits || null,
            patientData.medications || null,
            patientData.diagnosis || null,
            patientData.surgeries || null,
            patientData.notes || null,
            patientData.status || null,
            patientData.createdBy || null,
            patientData.modifiedBy || null,
            patientData.qualifiedStatus || null,
            patientData.dnq || null,
            patientData.notInterestedReason || null
        ];
        const [result] = await db.query(query, values);
        return result;
    } catch (error) {
        throw error;
    }
}

const getPatient = async() => {
    try {
        const query = "SELECT * FROM patients";
        const [result] = await db.query(query);
        return result;
    } catch (error) {
        throw error;
    }
}

const getPatientById = async(id) => {
    try {
        const query = "SELECT * FROM patients WHERE patient_id = ?";
        const values = [id];
        const [result] = await db.query(query, values);
        return result[0]; // Return single patient object, not array
    } catch (error) {
        throw error;
    }
}

const updatePatient = async(id, patientData) => {
    try {
        const query = "UPDATE patients SET study_enrolled_id = ?, patient_lead_source = ?, banned = ?, patient_lead_owner = ?, patient_lead_name = ?, last_name = ?, phone = ?, phone2 = ?, email = ?, dob = ?, age = ?, height = ?, weight = ?, habits = ?, medication = ?, diagnosis = ?, surgeries = ?, status = ?, modified_by = ?, qualified_status = ?, dnq = ?, not_interested_reason = ? WHERE patient_id = ?";
        const values = [
            patientData.study_enrolled_id || null,
            patientData.patientLeadSource || null,
            patientData.banned || null,
            patientData.patientOwner || null,
            patientData.patientLeadName || null,
            patientData.lastName || null,
            patientData.phone || null,
            patientData.phone2 || null,
            patientData.email || null,
            patientData.dob || null,
            patientData.age || null,
            patientData.height || null,
            patientData.weight || null,
            patientData.habits || null,
            patientData.medications || null,
            patientData.diagnosis || null,
            patientData.surgeries || null,
            patientData.status || null,
            patientData.modifiedBy || null,
            patientData.qualifiedStatus || null,
            patientData.dnq || null,
            patientData.notInterestedReason || null,
            id
        ];
        const [result] = await db.query(query, values);
        return result;
    } catch (error) {
        throw error;
    }
}

const deletePatient = async(id) => {
    try {
        const query = "DELETE FROM patients WHERE patient_id = ?";
        const values = [id];
        const [result] = await db.query(query, values);
        return result;
    } catch (error) {
        throw error;
    }
}




module.exports = {
    createPatient,
    getPatient,
    getPatientById,
    updatePatient,
    deletePatient,
    
}