import * as api from '../helpers/api.js'; //載入api
import {sweetAlert, toggleLoading, toThousands} from'../helpers/util.js'; //載入通用js

const productList = document.querySelector('.productWrap');//產品列表
const productSelect = document.querySelector('.productSelect');//產品列表篩選
const cartList = document.querySelector('.shoppingCart-tableList');//購物車列表
const discardAllCart = document.querySelector('.discardAllBtn');//刪除全部購物車
const orderInfoForm = document.querySelector('.orderInfo-form');//整個表單
const orderInfoBtn = document.querySelector('.orderInfo-btn');//表單按鈕
const formConstraints = {
  姓名:{
    presence: {
      message:"是必填欄位"
    }
  },
  電話:{
    presence:{
      message:"是必填欄位"
    },
    format: {
      pattern: /^[09]{2}\d{8}$/,
      message: "需以 09 開頭，共 10 碼"
   }
  },
  Email:{
    presence:{
      message:"是必填欄位"
    },
    format: {
      pattern: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      message: "格式錯誤，需有@與.等符號"
   }
  },
  寄送地址:{
     presence:{
      message:"是必填欄位"
    }
  },
  交易方式:{
    presence:{
      message:"是必填欄位"
    }
  }
};
let productData = [];//產品列表
let cartData = [];//購物車清單

function init(){
    getProductList(); 
    getCartList();
}

//取得產品列表
function getProductList(){
  toggleLoading();
  api.apiGetProduct().then((response)=>{
    // console.log(response.data);
    productData = response.data.products;
    renderProductList(productData);
  }).catch((error)=>{
    console.log(error.response.data);
  })  
  .finally(()=>{
    toggleLoading();
  })
}

//渲染產品列表
function renderProductList(data){
    let str = '';
    data.forEach((item)=>{
        const {id,title,images,price,origin_price} = item;
        str += `<li class="productCard">
        <h4 class="productType">新品</h4>
        <img src=${images} alt="">
        <a href="#" class="addCardBtn" data-id="${id}">加入購物車</a>
        <h3>${title}</h3>
        <del class="originPrice">NT$${toThousands(origin_price)}</del>
        <p class="nowPrice">NT$${toThousands(price)}</p>
    </li>`
    })
    productList.innerHTML = str;
}

//取得購物車清單
function getCartList(){
  toggleLoading();
  api.apiGetCart().then(function (response) {
      cartData = response.data.carts;//取出購物車資料
      const{finalTotal} = response.data;//取出購物車總額
      renderCartList(cartData,finalTotal);//將上述兩個資料放入渲染函式
  }).catch((error)=>{
      sweetAlert(`${error.response.data.message}`,'error');
      console.log(error.response.data);
    })  
  .finally(()=>{
    toggleLoading();
  })
}

//渲染購物車清單
function renderCartList(cartData,finalTotal){
    const cartTotal = document.querySelector('[data-cart-total]');//總額的DOM
    cartTotal.textContent = toThousands(finalTotal);//渲染總額
    if(cartData.length==0){
      cartList.innerHTML = '<tr><td colspan="6" class="text-center"><h3>購物車內沒有商品( ´•̥̥̥ω•̥̥̥` )</h3></td></tr>';
      discardAllCart.style.display = 'none'; //隱藏刪除全部按鈕
      return
    }
    let str = '';
    cartData.forEach((item)=>{
        const {id:cartId,quantity} = item; //購物車id重新命名
        const {title,price,images} = item.product;
        str+=`<tr>
        <td>
            <div class="cardItem-title">
                <img src="${images}" alt="">
                <p>${title}</p>
            </div>
        </td>
        <td>NT$${toThousands(price)}</td>
        <td>
            <input type="number" value="${quantity}" min="1" class="cartNumText" data-cart-id="${cartId}">
        </td>
        <td>NT$${toThousands(price*quantity)}</td>
        <td class="discardBtn">
            <a href="#" class="material-icons" data-discard data-cart-id="${cartId}">
                clear
            </a>
        </td>
        </tr>`
    })
    cartList.innerHTML = str;
    discardAllCart.style.display = 'inline-block'; //顯示刪除全部的按鈕

    //確定渲染後，再綁定修改購物車數量事件
    const cartNumText = document.querySelectorAll('.cartNumText');
    cartNumText.forEach((item)=>{
      item.addEventListener('change',function(e){
          const cartId = e.target.getAttribute('data-cart-id');
          const cartVal = parseInt(e.target.value);
          EditCartNum(cartId,cartVal);
      })
    })
}



function listenOrderInput(){//監聽input輸入是否符合規定
  const inputs = document.querySelector(".orderInfo").querySelectorAll("input[name],select");
  inputs.forEach((item)=>{
    item.addEventListener('change',function(e){
      item.nextElementSibling.textContent = '';//先將錯誤訊息清空
      const errors = validate(orderInfoForm, formConstraints) || '';
      console.log(errors);
      if(errors){//如果error有值，將error訊息印出
        renderFormError(errors);
      }
    })
  })
}

function renderFormError(errors){//印出錯誤訊息
  Object.keys(errors).forEach((key)=>{
    document.querySelector(`[data-message=${key}]`).textContent = errors[key];
  })
}

function addCart(productId,numCheck){ //加入購物車
  toggleLoading();//新增購物車loading
  api.apiAddCart({
    data: {
      "productId": productId,
      "quantity": numCheck
    }
    })
    .then(function (response) {
      getCartList();
      sweetAlert('加入購物車成功','success');
    })
    .catch((error)=>{
      sweetAlert('好像哪裡出錯了QQ','error');
      console.log(error.response.data);
    })  
    .finally(()=>{
      toggleLoading();
    })
}

//刪除單筆購物車
function deleteCartItem(cartId){
  toggleLoading();
  api.apiDeleteCart(cartId)
  .then(function (response) {
      sweetAlert('刪除單筆購物車成功','success')  
      getCartList();  
  })
  .catch((error)=>{
      console.log(error.response.data);
  })
  .finally(()=>{
    toggleLoading();
  })
}

function deleteAllCart(){//刪除全部購物車
  toggleLoading();
  api.apiClearCart()
  .then(function (response) {
        getCartList();
        sweetAlert('刪除全部購物車成功','success');
      })
  .catch((error)=>{
      sweetAlert('購物車已清空，請勿重複點擊','warning');
      console.log(error.response.data);
  })
  .finally(()=>{
    toggleLoading();
  })
}


//修改購物車數量
function EditCartNum(cartId,cartVal){
  toggleLoading();
  api.apiUpdateCart( {
    "data": {
        "id": cartId,
        "quantity": cartVal
    }
  })
  .then((response)=>{
      getCartList();
      sweetAlert('修改單筆購物車成功','success');
    })
    .catch((error)=>{
      console.log(error.response.data);
    })
  .finally(()=>{
    toggleLoading();
  })
}


//送出訂單資訊
function sendOrderForm(orderData){
  toggleLoading();
  api.apiAddOrder(orderData)
  .then((response)=> {
      sweetAlert('訂單建立成功','success');
      getCartList();
      orderInfoForm.reset();
  })
  .catch((error)=>{    
      sweetAlert(`${error.response.data.message}`,'error');
      // console.log(error.response.data);
  })
  .finally(()=>{
    toggleLoading();
  })
}

init();

//篩選類別事件
productSelect.addEventListener('change',function(e){
    const category = e.target.value;
    if(category=='全部'){
        renderProductList(productData);
    }else{
        let tempData = productData.filter(item=>item.category==category);
        renderProductList(tempData);
    }
})


//加入購物車事件
productList.addEventListener('click',function(e){
    e.preventDefault();
    if(e.target.hasAttribute('data-id')==false){
        return;
    }
   
    const productId = e.target.getAttribute('data-id');
    // console.log(productId);
    let numCheck = 1;
    cartData.forEach((item)=>{
        if(item.product.id==productId){
            numCheck = item.quantity += 1;
        }
    })
    addCart(productId,numCheck);
})


//刪除單筆購物車事件
cartList.addEventListener('click',function(e){
    e.preventDefault();
    if(e.target.hasAttribute('data-cart-id')==false){
        return
    }
    const cartId = e.target.getAttribute('data-cart-id');
    if(e.target.hasAttribute('data-discard')){
      deleteCartItem(cartId);
      return
    }

})

//刪除全部購物車事件
discardAllCart.addEventListener('click',function(e){
    e.preventDefault();
    deleteAllCart(); 
})


//表單送出事件
orderInfoBtn.addEventListener('click',function(e){
   e.preventDefault(); 
    if(cartData.length==0){
      sweetAlert('購物車內沒有商品，請去選購','warning');
      return;
    }
    const customerName = document.querySelector('#customerName').value;
    const customerPhone = document.querySelector('#customerPhone').value;
    const customerEmail = document.querySelector('#customerEmail').value;
    const customerAddress = document.querySelector('#customerAddress').value;
    const customerTradeWay = document.querySelector('#tradeWay').value;

    listenOrderInput();//點擊送出後才綁定input change監聽事件，顯示錯誤訊息

    //送出前確認是否符合驗證
    const errors = validate(orderInfoForm, formConstraints)||'';
    renderFormError(errors);
    if(errors){
      sweetAlert('表單欄位請填寫完整','warning')  
      return
    }

    //確認送出訂單
    const orderData = {
      "data": {
          "user": {
            "name": customerName,
            "tel": customerPhone,
            "email": customerEmail,
            "address": customerAddress,
            "payment": customerTradeWay
          }
        }
    };
    sendOrderForm(orderData);
})





