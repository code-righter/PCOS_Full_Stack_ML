import api from './api'

export const doctorService = {
    getDocDashboardMetric : async () =>{
        const response = await api.get('doctor/dashboardMetrics')
        console.log(response.data);
        return response.data;
    },

    getPendingPatientsData : async () =>{
        const respone = await api.get('doctor/pendingPatients')
        console.log(respone.data)
        return respone.data
    },

    getAllPatients : async(page, limit)=>{
        const start = page || 1;
        const end = limit || 10;
        const response = api.get(`/api/doctor/patients?page=${start}&limit=${end}`)
        console.log(response.data)
        return response.data;
    },

    getPatientInfoByEmail: async (email) =>{
        const response = api.get(`/doctor/patientInfo/${email}`);
        console.log(response);
        return response;
    } ,

    updatePatientReport : async(email)=>{
        const response = api.post(`/doctor/updatePatientReport/${email}`);
        console.log(response);
        return response;
    }
}
