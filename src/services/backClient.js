import backApiClient from '../plugins/axiosback'

export async function backgetData(url){
    try {
        const response = await backApiClient.get(url);
        return response.data;
    } catch (error) {
        console.log('Error en la petición GET:', error.response ? error.response.data : error.message);
        throw error;
    }
}

export async function backpostData(url, data){
    try {
        console.log("datos al backend" ,data)
        const response = await backApiClient.post(url, data);
        return response.data;
    } catch (error) {
        console.log('Error en la petición POST:', error.response ? error.response.data : error.message);
        throw error;
    }
}

export async function backputData(url, data){
    try {
        const response = await backApiClient.put(url, data);
        return response.data;
    } catch (error) {
        console.log('Error en la petición PUT:', error.response ? error.response.data : error.message);
        throw error;
    }
}