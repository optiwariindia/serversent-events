const eventSource=new EventSource("/event")
eventSource.onmessage=function(event){
    console.log(event);
    const dateElement=document.querySelector(".date");
    dateElement.innerText=event.data;
}
eventSource.onerror=function(error){
    console.log(error)
}