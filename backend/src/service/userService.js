import axiosInstance from "../../../frontend/src/axios/axiosInstance";

const userService={
    login:async({email,password})=>{
        try {
            const response=await axiosInstance.post('/api/user/signin',{
                email,
                password
            })
            return response.data
        } catch (error) {
            console.log(error)
        }
    }
}

export default userService