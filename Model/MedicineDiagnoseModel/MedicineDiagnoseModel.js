const db = require("../../Config/DBConnection")

const createMedicine = async(name) => {
    try {
        const query = "INSERT INTO medicines (medicine_name) VALUES (?)";
        const values = [name];
        const [result] = await db.query(query, values);
        return result;
    } catch (error) {
        throw error;
    }
}

const getMedicine = async() => {
    try {
        const query = "SELECT * FROM medicines";
        const [result] = await db.query(query);
        return result;
    } catch (error) {
        throw error;
    }
}

const getMedicineById = async(id) => {
    try {
        const query = "SELECT * FROM medicines WHERE med_id = ?";
        const values = [id];
        const [result] = await db.query(query, values);
        return result;
    } catch (error) {
        throw error;
    }
}

const updateMedicine = async(id, name) => {
    try {
        const query = "UPDATE medicines SET medicine_name = ? WHERE med_id = ?";
        const values = [name, id];
        const [result] = await db.query(query, values);
        return result;
    } catch (error) {
        throw error;
    }
}

const deleteMedicine = async(id) => {
    try {
        const query = "DELETE FROM medicines WHERE med_id = ?";
        const values = [id];
        const [result] = await db.query(query, values);
        return result;
    } catch (error) {
        throw error;
    }
}


const createDiagnosis = async(name) => {
    try {
        const query = "INSERT INTO diagnosis (diagnose_name) VALUES (?)";
        const values = [name];
        const [result] = await db.query(query, values);
        return result;
    } catch (error) {
        throw error;
    }
}

const getDiagnosis = async() => {
    try {
        const query = "SELECT * FROM diagnosis";
        const [result] = await db.query(query);
        return result;
    } catch (error) {
        throw error;
    }
}

const getDiagnosisById = async(id) => {
    try {
        const query = "SELECT * FROM diagnosis WHERE diagnose_id = ?";
        const values = [id];
        const [result] = await db.query(query, values);
        return result;
    } catch (error) {
        throw error;
    }
}

const updateDiagnosis = async(id, name) => {
    try {
        const query = "UPDATE diagnosis SET diagnose_name = ? WHERE diagnose_id = ?";
        const values = [name, id];
        const [result] = await db.query(query, values);
        return result;
    } catch (error) {
        throw error;
    }
}

const deleteDiagnosis = async(id) => {
    try {
        const query = "DELETE FROM diagnosis WHERE diagnose_id = ?";
        const values = [id];
        const [result] = await db.query(query, values);
        return result;
    } catch (error) {
        throw error;
    }
}

module.exports = {
    createMedicine,
    getMedicine,
    getMedicineById,
    updateMedicine,
    deleteMedicine,
    createDiagnosis,
    getDiagnosis,
    getDiagnosisById,
    updateDiagnosis,
    deleteDiagnosis
}