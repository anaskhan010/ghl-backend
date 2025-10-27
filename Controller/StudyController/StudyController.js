const studyModel = require("../../Model/StudyModel/StudyModel")



const createStudy = async(req, res) => {
    try {
        const { name, leadSource, owner, status } = req.body;
        const study = await studyModel.createStudy(name, leadSource, owner, status);
        res.status(200).json(study);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const getStudy = async(req, res) => {
    try {
        const study = await studyModel.getStudy();
        res.status(200).json(study);
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
        const study = await studyModel.updateStudy(id, name, leadSource, owner, status);
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