import api from "./api";

export const patientService = {
    // GET Personal Info 
    // loads personal data from backend, passes email & fetches data against it 
    getPersonalInfo : async (userData) =>{
        const response = await api.get('/patient/personalInfo')
        console.log(response.data);
        return response.data;
    },

    // POST Personal Info
    //posts new updated data 
    setPersonalInfo : async(payload) =>{
        console.log(payload)
        const response = await api.post('/patient/personalInfo', payload);
        return response.data;
    } 
}