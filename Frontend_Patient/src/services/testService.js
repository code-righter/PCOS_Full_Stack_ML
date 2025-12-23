import api from './api';

export const testService = {
  // 1. Request a new Security Code
  generateCode: async () => {
    // Endpoint: POST /api/v1/test/generate-code
    const response = await api.get('patient/test/generateCode');
    return response.data; // Expecting: { code: "123456" }
  },

  // 2. Check if hardware has sent data for this code
  checkStatus: async (securityCode) => {
    // Endpoint: GET /api/v1/test/check-status/123456
    const response = await api.get(`patient/test/getLiveSensorData/${securityCode}`);
    return response.data; 
    // Expecting: { status: "pending" } OR { status: "completed", data: { temp: 98, ... } }
  },

  // 3. Final Submission
  submitFullReport: async (payload) => {
    const response = await api.post('patient/test/submit', payload);
    return response.data;
  }
};