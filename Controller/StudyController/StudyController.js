const studyModel = require("../../Model/StudyModel/StudyModel")



const createStudy = async(req, res) => {
    try {
        const { name, leadSource, owner, status } = req.body;

        // Create the study first
        const study = await studyModel.createStudy(name, owner, status);

        // If study was created successfully and leadSource is provided, insert lead sources
        if (study.insertId && leadSource && Array.isArray(leadSource) && leadSource.length > 0) {
            await studyModel.createStudyLeadSources(study.insertId, leadSource);
        }

        res.status(200).json(study);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const getStudy = async(req, res) => {
    try {
        const studies = await studyModel.getStudy();
        res.status(200).json(studies);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const getStudyById = async(req, res) => {
    try {
        const { id } = req.params;
        const study = await studyModel.getStudyById(id);
        res.status(200).json(study);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const updateStudy = async(req, res) => {
    try {
        const { id } = req.params;
        const { name, leadSource, owner, status } = req.body;

        // Update the study
        const study = await studyModel.updateStudy(id, name, owner, status);

        // Delete existing lead sources and insert new ones
        if (leadSource && Array.isArray(leadSource)) {
            await studyModel.deleteStudyLeadSources(id);
            if (leadSource.length > 0) {
                await studyModel.createStudyLeadSources(id, leadSource);
            }
        }

        res.status(200).json(study);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const deleteStudy = async(req, res) => {
    try {
        const { id } = req.params;
        const study = await studyModel.deleteStudy(id);
        res.status(200).json(study);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const countStudies = async(req, res) => {
    try {
        const study = await studyModel.countStudies();
        res.status(200).json(study);
    } catch (error) {
        res.status(500).json({ error: error.message });
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