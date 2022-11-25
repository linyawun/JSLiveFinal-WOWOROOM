//utility js
export function toThousands(num){
    let numParts = num.toString().split(".");
    numParts[0] = numParts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return numParts.join(".");
}

export function timeStampToTime(timeStamp){
    const date = new Date(timeStamp*1000);//參數放unix時間戳，單位是毫秒，13碼
    const Y = date.getFullYear();
    const M = date.getMonth < 10? '0'+ (date.getMonth()+1) : date.getMonth()+1
    const D = date.getDate();
    return `${Y}/${M}/${D}`
}

export function toggleLoading(){
  const status = document.querySelector('.status');
  const bg = document.querySelector('.preloader');
  status.classList.toggle("d-block") // 切換class
  bg.classList.toggle("d-block") // 切換class
}

export function sweetAlert(text,icon){
    Swal.fire({
        // title: `加入購物車成功`,
        text: text,
        icon: icon,
        confirmButtonText: 'OK'
    })
}
