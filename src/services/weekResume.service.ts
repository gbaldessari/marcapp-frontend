import axios from 'axios';

export type WeekResumeServiceResponseT = {
  success: boolean;
  data?: any;
  error?: string;
};

const weekResumeService = async (payload: { token: string; startDate: string; endDate: string }): Promise<WeekResumeServiceResponseT> => {
  try {
    const endpoint = `${process.env.EXPO_PUBLIC_MS_REGISTER_URL}/registers/get-registers-by-rangeData`;
    const response = await axios.post(endpoint, payload);
    return {
      success: true,
      data: response.data,
    };
  } catch (e) {
    console.error(e);
    return { success: false, error: 'Ha ocurrido un error' };
  }
};

export default weekResumeService;
