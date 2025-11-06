const studyModel = require("../../Model/StudyModel/StudyModel")
const axios = require('axios');

// Load environment variables
const GHL_API_KEY ='pit-b13f7c85-ddb7-4fd2-9170-f9c95918615f';
const GHL_LOCATION_ID = process.env.GHL_LOCATION_ID;



const createStudy = async(req, res) => {
    try {
        const { name, leadSource, owner, status, assigned_recruiter } = req.body;

        // Create the study first
        const study = await studyModel.createStudy(name, owner, status, assigned_recruiter);

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
        const { name, leadSource, owner, status, assigned_recruiter } = req.body;

        // Update the study
        const study = await studyModel.updateStudy(id, name, owner, status, assigned_recruiter);

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


const getGHLUsers = async(req, res) => {
    console.log("Fetching users from GHL...");
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

        // Fetch users from GHL API
        const GHL_API_URL = `https://services.leadconnectorhq.com/users/`;

        console.log("🔄 Fetching users from GHL API:", GHL_API_URL);
        console.log("🔑 Using Location ID:", GHL_LOCATION_ID);

        const ghlResponse = await axios.get(GHL_API_URL, {
            params: {
                locationId: GHL_LOCATION_ID
            },
            headers: {
                "Authorization": `Bearer ${GHL_API_KEY}`,
                "Version": "2021-07-28",
                "Accept": "application/json"
            }
        });

        console.log("✅ Users fetched successfully from GHL");
        console.log("📊 Total users:", ghlResponse.data?.users?.length || 0);

        res.status(200).json({
            message: "Users fetched successfully from GHL",
            users: ghlResponse.data.users || ghlResponse.data,
            count: ghlResponse.data?.users?.length || 0
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
                error: "Users not found",
                message: "No users found for the specified location",
                details: error.response?.data
            });
        }

        res.status(500).json({
            error: error.message,
            details: error.response?.data || "Failed to fetch users from GHL"
        });
    }
}


module.exports = {
    createStudy,
    getStudy,
    getStudyById,
    updateStudy,
    deleteStudy,
    countStudies,
    getGHLUsers
}