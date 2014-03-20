$(function(){

  var div = $('.zabbixcont').get(0);
  var interval = setInterval(function(){
 var data =  {
 "volumes1": [
  {
   "thresholdName": "CPU", 
   "metricTime": "00:00", 
   "metricValue": "75", 
   "networkIp": "255.255.12.1", 
   "nodeIp": "12.0.0.1.1", 
   "gId": "1239"
  }, 
  {
   "thresholdName": "APP", 
   "metricTime": "00", 
   "metricValue": "75", 
   "networkIp": "255.255.12.1", 
   "nodeIp": "12.0.0.1.1", 
   "gId": "1239" 
   
   },    
  {
   "thresholdName": "Memory", 
      "metricTime": "00", 
      "metricValue": "75", 
      "networkIp": "255.255.12.1", 
      "nodeIp": "12.0.0.1.1", 
      "gId": "1239" 

  },
  {
   "thresholdName": "CPU", 
   "metricTime": "00:00", 
   "metricValue": "75", 
   "networkIp": "255.255.12.1", 
   "nodeIp": "12.0.0.1.1", 
   "gId": "1239"
  }, 
  {
   "thresholdName": "APP", 
   "metricTime": "00", 
   "metricValue": "75", 
   "networkIp": "255.255.12.1", 
   "nodeIp": "12.0.0.1.1", 
   "gId": "1239" 
   
   },    
  {
   "thresholdName": "Memory", 
      "metricTime": "00", 
      "metricValue": "75", 
      "networkIp": "255.255.12.1", 
      "nodeIp": "12.0.0.1.1", 
      "gId": "1239" 

  }

 ]
}
showData(data["volumes1"]);
  },3000);
  function showData(data) {
   // console.log(data);
    data.forEach(function(item){
    
    var bgcolor = '#aad4ff'     
    //$divContainer = $('<div style="border:1px solid black;width:100%;background-color:'+bgcolor+'"></div>');
    $divzabbixcont = $('<div class="row" style="border-bottom:1px solid white"></div>');
    
    $(div).append($divzabbixcont);
    $divzabbixcont.append('<div class="col-md-2"> Threshold :- '+item.thresholdName+'</div>');
     $z0 =$('<div class="col-md-1"></div>').append("z0");
 /*   $divBeginTime =$('<div class="col-md-2"></div>').append(item.networkIp);
    $divEndTime =$('<div class="col-md-2"></div>').append(item.nodeIp); */
    $divzabbixcont.append($z0)/*.append($divBeginTime).append($divEndTime); */
    $divzabbixcont.append('<div class="col-md-9">'+JSON.stringify(item, null, "\t")+'</div>');

    /*
    for(key in item) {
     
     $divContainer.append("<div>"+key+" :- "+item[key]+"</div>");
     
    }*/
    $(div).append('<br/>');
    //div.innerHTML =div.innerHTML+JSON.stringify(item, null, "\t")+'<br/>';
    });
    $(div).animate({scrollTop:div.scrollHeight}, 'slow');   
  }






});


