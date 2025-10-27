const db = require("../../Config/DBConnection")


const createStudy = async(name, leadSource, owner, status) => {
    try {
      const query = "INSERT INTO studies (study_name, study_lead_source, study_owner, study_status) VALUES (?, ?, ?, ?)";
      const values = [name, leadSource, owner, status];
      const [result] = await db.query(query, values);
      return result;  
    } catch (error) {
        throw error;
        
    }
}


const getStudy = async() => {
    try {
        const query = "SELECT * FROM studies";
        const [result] = await db.query(query);
        return result;
    } catch (error) {
        throw error;
    }
}

const getStudyById = async(id) => {
    try {
        const query = "SELECT * FROM studies WHERE study_id = ?";
        const values = [id];
        const [result] = await db.query(query, values);
        return result;
    } catch (error) {
        throw error;
    }
}

const updateStudy = async(id, name, leadSource, owner, status) => {
    try {
        const query = "UPDATE studies SET study_name = ?, study_lead_source = ?, study_owner = ?, study_status = ? WHERE study_id = ?";
        const values = [name, leadSource, owner, status, id];
        const [result] = await db.query(query, values);
        return result;
    } catch (error) {
        throw error;
    }
}

const deleteStudy = async(id) => {
    try {
        const query = "DELETE FROM studies WHERE study_id = ?";
        const values = [id];
        const [result] = await db.query(query, values);
        return result;
    } catch (error) {
        throw error;
    }
}

const countStudies = async() => {
    try {
        const query = "SELECT COUNT(*) as count FROM studies";
        const [result] = await db.query(query);
        return result;
    } catch (error) {
        throw error;
    }
}


module.exports = {
    createStudy,
    getStudy,
    getStudyById,
    updateStudy,
    deleteStudy,
    countStudies
}