import * as api from '../helpers/api.js'; //載入api
import { sweetAlert, toggleLoading, timeStampToTime} from '../helpers/util.js'; //載入通用js

const orderList = document.querySelector('.js-orderList');
const discardAllOrder = document.querySelector('.discardAllBtn');
let orderData = [];

function init(){
    getOrderList();
}

function getOrderList(){//取得訂單列表
    toggleLoading();
    api.apiGetOrder().then((response)=>{
        orderData = response.data.orders;
        renderOrderList();
        renderChart();
    })
    .catch((error)=>{
        console.log(error);
        sweetAlert('好像哪裡出錯了QQ','error')
    })
    .finally(()=>{
        toggleLoading();
    })
}

function renderOrderList(){//渲染訂單
    if(orderData.length==0){
        orderList.innerHTML = '<tr><td colspan="8"><h3  class="text-center">目前沒有訂單( ´•̥̥̥ω•̥̥̥` )</h3></td></tr>';  
        discardAllOrder.style.display = 'none'; //隱藏刪除全部按鈕
        return
    }
    let str = '';
    orderData.forEach((item)=>{
        const{id,createdAt,user,products,paid} = item;
        const{name,tel,email,address}=user;
        let productStr = '';
        // 組產品名稱字串
        products.forEach((productItem)=>{
            productStr+=`<p>${productItem.title}*${productItem.quantity}</p>`
        })
        //判斷付款狀態
        const paidState = paid==false?'未處理':'已處理';
        //取得時間格式
        const orderDate = timeStampToTime(createdAt);

        str+=`<tr>
        <td>${id}</td>
        <td>
          <p>${name}</p>
          <p>${tel}</p>
        </td>
        <td>${address}</td>
        <td>${email}</td>
        <td>
          ${productStr}
        </td>
        <td>${orderDate}</td>
        <td class="orderStatus">
          <a href="#" data-state="${paid}" data-id="${id}">${paidState}</a>
        </td>
        <td>
          <input type="button" class="delSingleOrder-Btn" data-id="${id}" value="刪除">
        </td>
        </tr>`
    })
    orderList.innerHTML = str;
    discardAllOrder.style.display = 'inline-block';//顯示刪除全部
}

function renderChart(){//渲染圖表
    if(orderData.length==0){
        document.querySelector('#chart').innerHTML = `<h3 class='text-center'>目前沒有訂單，無法產生圖表</h3>`;
        return
    }
    
    //撈出產品作為新陣列
    const productList = orderData.map((item)=>item.products).flat()//flat()陣列扁平化
    
    //統整訂單資訊，產品名:數量*金額
    let productTotal = productList.reduce((obj,current)=>{
        const {title,quantity,price} = current;
        if(obj[title] == undefined){
            obj[title] = quantity*price
        }else{
            obj[title] += quantity*price;
        }
        return obj
    },{});
    
    //Object.entries回傳屬性,值的陣列，然後再sort排序陣列
    let productAry = Object.entries(productTotal).sort((a,b)=>b[1]-a[1]).reduce((arr,current,index)=>{
        if(index<3){
            arr.push(current)
        }else if(index === 3){
            //第四個，產生'其他'的陣列
            arr.push(['其他',current[1]]);
        }else{
            //第四個之後都放入其他，arr[3]是'其他'的陣列
            arr[3][1] += current[1]
        }
        return arr
    },[])

    // let productAry = [];
    // Object.keys(productTotal).forEach((key)=>{
    //     productAry.push([key,productTotal[key]])
    // })

    // //大到小排序
    // productAry.sort(function(a,b){
    //     return b[1]-a[1];
    // })
    // //如果訂單有4筆以上，就統整其他類資料
    // if(productAry.length>3){
    //     let otherTotal = 0;
    //     productAry.forEach((item,index)=>{
    //         if(index>2){//第四名以後才開始統計
    //             otherTotal+=item[1]
    //         }
    //     })
    //     productAry.splice(3)//從索引3開始刪除後面所有元素
    //     productAry.push(['其他',otherTotal])  
    // }
    
    // C3.js
    c3.generate({
        bindto: '#chart', // HTML 元素綁定
        data: {
            type: "pie",
            columns: productAry,
        },
        color:{
            pattern: ['#301E5F', '#5434A7', '#9D7FEA', '#DACBFF']
        }
    });
}

function deleteOrderItem(orderId){//刪除單一訂單
    toggleLoading();
    api.apiDeleteOrder(orderId)
    .then((response)=>{
        sweetAlert('刪除單筆訂單成功','success');
        init();
    })
    .catch((error)=>{
        console.log(error.response.data);
    }) 
    .finally(()=>{
        toggleLoading();
    })
}

function changeOrderState(orderState,orderId){//更改訂單狀態
    toggleLoading();
    api.apiUpdateOrder({
        "data": {
            "id": orderId,
            "paid": orderState=="false"?true:false
        }
    })
    .then((response)=>{
        sweetAlert('修改訂單成功','success');
        init();
    })
    .catch((error)=>{
        console.log(error);
    }) 
    .finally(()=>{
        toggleLoading();
    })
}

function deleteAllOrder(){//刪除全部訂單
    toggleLoading();
    api.apiClearOrder()
    .then((response)=>{
        // console.log(response.data);
        sweetAlert('刪除全部訂單成功','success');
        init();
    })
    .catch((error)=>{
        sweetAlert('訂單已清空，請勿重複點擊','warning');
        console.log(error.response.data);
    })  
    .finally(()=>{
        toggleLoading();
    })
}

init();

orderList.addEventListener('click',function(e){//訂單列表監聽
    e.preventDefault();
   if(e.target.hasAttribute('data-id')==false&&e.target.hasAttribute('data-state')==false){
    return;
   }

   if(e.target.getAttribute('class')=='delSingleOrder-Btn'){//刪除單筆order
    const orderId = e.target.getAttribute('data-id');
    deleteOrderItem(orderId);
    return;
   }

   if(e.target.hasAttribute('data-state')){//更改訂單狀態
    const orderId = e.target.getAttribute('data-id');
    const orderState = e.target.getAttribute('data-state');
    changeOrderState(orderState,orderId);
   }
})

discardAllOrder.addEventListener('click',function(e){//刪除全部訂單監聽
    e.preventDefault();
    deleteAllOrder();
})



