const baseUrl = "https://livejs-api.hexschool.io";
const api_path = "yawun";
const token = "JVs3lWLeHiVssdA9Ode5R4WRlGx1";


//將API分為兩種，需要&不需要token
//使用者用的API
const userRequest = axios.create({
    baseURL: `${baseUrl}/api/livejs/v1/customer/${api_path}/`,
    headers: {
        'Content-Type': 'application/json'
    }
})

//管理者用的API
const adminRequest = axios.create({
    baseURL: `${baseUrl}/api/livejs/v1/admin/${api_path}/`,
    headers: {
        'Content-Type': 'application/json',
        'Authorization': token
    }
})

//產品相關
export const apiGetProduct = () => userRequest.get('/products'); //前面會加上baseURL內容，箭頭函式直接回傳初始化的 axios Promise

//購物車
export const apiGetCart = () => userRequest.get('/carts'); 
export const apiAddCart = data => userRequest.post('/carts',data); 
export const apiUpdateCart = data => userRequest.patch('/carts',data); 
export const apiClearCart = () => userRequest.delete('/carts'); 
export const apiDeleteCart = id => userRequest.delete(`/carts/${id}`); 

//訂單(使用者)
export const apiAddOrder = data => userRequest.post('/orders',data); 

//訂單(管理者)
export const apiGetOrder = () => adminRequest.get('/orders');
export const apiUpdateOrder = data => adminRequest.put('/orders', data);
export const apiClearOrder = () => adminRequest.delete('/orders');
export const apiDeleteOrder = id => adminRequest.delete(`/orders/${id}`);