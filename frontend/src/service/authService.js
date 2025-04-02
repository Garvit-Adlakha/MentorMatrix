import axiosInstance from "../axios/axiosInstance";

export const login = async (email, password) => {
  try {
    const response = await axiosInstance.post('/user/signin', {
      email,
      password
    });
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

export const currentUser = async () => {
  try {
    const response = await axiosInstance.get('/user/profile');
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
}