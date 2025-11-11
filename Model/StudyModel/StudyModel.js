const db = require("../../Config/DBConnection")


const createStudy = async(name, owner, status, assigned_recruiter) => {
    try {
      const query = "INSERT INTO studies (study_name, study_owner, study_status, assigned_recruiter) VALUES (?, ?, ?, ?)";
      const values = [name, owner, status, assigned_recruiter];
      const [result] = await db.query(query, values);
      return result;
    } catch (error) {
        throw error;

    }
}

// Create study lead sources
const createStudyLeadSources = async(studyId, leadSources) => {
    try {
        if (!leadSources || leadSources.length === 0) {
            return { affectedRows: 0 };
        }

        const query = "INSERT INTO study_lead_source (study_id, study_lead_source) VALUES ?";
        const values = leadSources.map(source => [studyId, source]);
        const [result] = await db.query(query, [values]);
        return result;
    } catch (error) {
        throw error;
    }
}

// Get study lead sources by study ID
const getStudyLeadSources = async(studyId) => {
    try {
        const query = "SELECT study_lead_source FROM study_lead_source WHERE study_id = ?";
        const values = [studyId];
        const [result] = await db.query(query, values);
        return result.map(row => row.study_lead_source);
    } catch (error) {
        throw error;
    }
}

// Delete study lead sources by study ID
const deleteStudyLeadSources = async(studyId) => {
    try {
        const query = "DELETE FROM study_lead_source WHERE study_id = ?";
        const values = [studyId];
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

        // Fetch lead sources for each study
        for (let study of result) {
            const leadSources = await getStudyLeadSources(study.study_id);
            study.study_lead_sources = leadSources;
        }

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

        // Fetch lead sources for the study
        if (result.length > 0) {
            const leadSources = await getStudyLeadSources(id);
            result[0].study_lead_sources = leadSources;
        }

        return result;
    } catch (error) {
        throw error;
    }
}

const updateStudy = async(id, name, owner, status, assigned_recruiter) => {
    try {
        const query = "UPDATE studies SET study_name = ?, study_owner = ?, study_status = ?, assigned_recruiter = ? WHERE study_id = ?";
        const values = [name, owner, status, assigned_recruiter, id];
        const [result] = await db.query(query, values);
        return result;
    } catch (error) {
        throw error;
    }
}

const deleteStudy = async(id) => {
    try {
        // First delete lead sources
        await deleteStudyLeadSources(id);

        // Then delete the study
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
    countStudies,
    createStudyLeadSources,
    getStudyLeadSources,
    deleteStudyLeadSources
}