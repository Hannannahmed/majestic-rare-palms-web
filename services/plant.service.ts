import axiosInterceptor from "@/lib/axiosInterceptor"



export const getPlants = async () => {
  const res = await axiosInterceptor.get("/plants")
  return res.data.data.plants
}

/* GET PLANT BY ID */
export const getPlantById = async (id: string) => {
  const res = await axiosInterceptor.get(`/plants/${id}`)
  return res.data.data.plant
}
