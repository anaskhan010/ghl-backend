const MedicineDiagnoseModel = require("../../Model/MedicineDiagnoseModel/MedicineDiagnoseModel")

const createMedicine = async(req, res) => {
    try {
        const { name } = req.body;
        const medicine = await MedicineDiagnoseModel.createMedicine(name);
        res.status(200).json(medicine);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const getMedicine = async(req, res) => {
    try {
        const medicine = await MedicineDiagnoseModel.getMedicine();
        res.status(200).json(medicine);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const getMedicineById = async(req, res) => {
    try {
        const { id } = req.params;
        const medicine = await MedicineDiagnoseModel.getMedicineById(id);
        res.status(200).json(medicine);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const updateMedicine = async(req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        const medicine = await MedicineDiagnoseModel.updateMedicine(id, name);
        res.status(200).json(medicine);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const deleteMedicine = async(req, res) => {
    try {
        const { id } = req.params;
        const medicine = await MedicineDiagnoseModel.deleteMedicine(id);
        res.status(200).json(medicine);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const createDiagnosis = async(req, res) => {
    try {
        const { name } = req.body;
        const diagnosis = await MedicineDiagnoseModel.createDiagnosis(name);
        res.status(200).json(diagnosis);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const getDiagnosis = async(req, res) => {
    try {
        const diagnosis = await MedicineDiagnoseModel.getDiagnosis();
        res.status(200).json(diagnosis);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const getDiagnosisById = async(req, res) => {
    try {
        const { id } = req.params;
        const diagnosis = await MedicineDiagnoseModel.getDiagnosisById(id);
        res.status(200).json(diagnosis);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const updateDiagnosis = async(req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        const diagnosis = await MedicineDiagnoseModel.updateDiagnosis(id, name);
        res.status(200).json(diagnosis);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const deleteDiagnosis = async(req, res) => {
    try {
        const { id } = req.params;
        const diagnosis = await MedicineDiagnoseModel.deleteDiagnosis(id);
        res.status(200).json(diagnosis);
    } catch (error) {
        res.status(500).json({ error: error.message });
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