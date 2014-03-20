$(function () {

    var div = $('.logstashcont').get(0);
    var interval = setInterval(function () {
        var data = {
            "volumes1": [

{  "message": "INFO: Rundeck #1 main build action completed: FAILURE", "@version": "1", "@timestamp": "2014-02-26T12:10:10.296+05:30", "type": "jenkins", "host": "RLD3MONS01", "path": "/devops/apache-tomcat-6.0.35/logs/catalina.out" },
{  "message": "INFO: Rundeck » RunDeck Script Plugin #1 main build action completed: NOT_BUILT", "@version": "1", "@timestamp": "2014-02-26T12:10:10.295+05:30", "type": "jenkins", "host": "RLD3MONS01", "path": "/devops/apache-tomcat-6.0.35/logs/catalina.out" },
{  "message": "INFO: Rundeck » RunDeck Stub Plugin #1 main build action completed: NOT_BUILT", "@version": "1", "@timestamp": "2014-02-26T12:10:10.293+05:30", "type": "jenkins", "host": "RLD3MONS01", "path": "/devops/apache-tomcat-6.0.35/logs/catalina.out" },
{  "message": "INFO: Rundeck » RunDeck App #1 main build action completed: NOT_BUILT", "@version": "1", "@timestamp": "2014-02-26T12:10:10.292+05:30", "type": "jenkins", "host": "RLD3MONS01", "path": "/devops/apache-tomcat-6.0.35/logs/catalina.out" },
{  "message": "INFO: Rundeck » RunDeck Bundled Plugins #1 main build action completed: NOT_BUILT", "@version": "1", "@timestamp": "2014-02-26T12:10:10.290+05:30", "type": "jenkins", "host": "RLD3MONS01", "path": "/devops/apache-tomcat-6.0.35/logs/catalina.out" },
{  "message": "INFO: Rundeck » RunDeck Jetty Server #1 main build action completed: NOT_BUILT", "@version": "1", "@timestamp": "2014-02-26T12:10:10.288+05:30", "type": "jenkins", "host": "RLD3MONS01", "path": "/devops/apache-tomcat-6.0.35/logs/catalina.out" },
{  "message": "INFO: Rundeck » RunDeck LocalExec Node Step Plugin #1 main build action completed: NOT_BUILT", "@version": "1", "@timestamp": "2014-02-26T12:10:10.286+05:30", "type": "jenkins", "host": "RLD3MONS01", "path": "/devops/apache-tomcat-6.0.35/logs/catalina.out" },
{  "message": "INFO: Rundeck » RunDeck parent project #1 main build action completed: NOT_BUILT", "@version": "1", "@timestamp": "2014-02-26T12:10:10.286+05:30", "type": "jenkins", "host": "RLD3MONS01", "path": "/devops/apache-tomcat-6.0.35/logs/catalina.out" },
{  "message": "INFO: Rundeck » Rundeck Launcher #1 main build action completed: NOT_BUILT", "@version": "1", "@timestamp": "2014-02-26T12:10:10.283+05:30", "type": "jenkins", "host": "RLD3MONS01", "path": "/devops/apache-tomcat-6.0.35/logs/catalina.out" },
{  "message": "INFO: Rundeck » RunDeck Launcher Parent #1 main build action completed: NOT_BUILT", "@version": "1", "@timestamp": "2014-02-26T12:10:10.283+05:30", "type": "jenkins", "host": "RLD3MONS01", "path": "/devops/apache-tomcat-6.0.35/logs/catalina.out" },
{  "message": "INFO: Demo #2 main build action completed: SUCCESS", "@version": "1", "@timestamp": "2014-02-26T12:10:09.585+05:30", "type": "jenkins", "host": "RLD3MONS01", "path": "/devops/apache-tomcat-6.0.35/logs/catalina.out" },
{  "message": "INFO: Demo #1 main build action completed: FAILURE", "@version": "1", "@timestamp": "2014-02-26T12:10:09.577+05:30", "type": "jenkins", "host": "RLD3MONS01", "path": "/devops/apache-tomcat-6.0.35/logs/catalina.out" },
{  "message": "INFO: Demo » Scholastic Maven Webapp #1 main build action completed: NOT_BUILT", "@version": "1", "@timestamp": "2014-02-26T12:10:09.575+05:30", "type": "jenkins", "host": "RLD3MONS01", "path": "/devops/apache-tomcat-6.0.35/logs/catalina.out" },
{  "message": "INFO: Test1 #4 main build action completed: FAILURE", "@version": "1", "@timestamp": "2014-02-26T12:10:04.867+05:30", "type": "jenkins", "host": "RLD3MONS01", "path": "/devops/apache-tomcat-6.0.35/logs/catalina.out" },
{  "message": "INFO: Test1 #3 main build action completed: FAILURE", "@version": "1", "@timestamp": "2014-02-26T12:10:04.864+05:30", "type": "jenkins", "host": "RLD3MONS01", "path": "/devops/apache-tomcat-6.0.35/logs/catalina.out" },
{  "message": "INFO: Test2 #7 main build action completed: SUCCESS", "@version": "1", "@timestamp": "2014-02-26T12:10:03.571+05:30", "type": "jenkins", "host": "RLD3MONS01", "path": "/devops/apache-tomcat-6.0.35/logs/catalina.out" },
{  "message": "INFO: Test2 #4 main build action completed: SUCCESS", "@version": "1", "@timestamp": "2014-02-26T12:10:03.396+05:30", "type": "jenkins", "host": "RLD3MONS01", "path": "/devops/apache-tomcat-6.0.35/logs/catalina.out" },
{  "message": "INFO: Test2 #3 main build action completed: SUCCESS", "@version": "1", "@timestamp": "2014-02-26T12:10:03.393+05:30", "type": "jenkins", "host": "RLD3MONS01", "path": "/devops/apache-tomcat-6.0.35/logs/catalina.out" },
{  "message": "INFO: Test1 #1 main build action completed: FAILURE", "@version": "1", "@timestamp": "2014-02-26T12:09:58.909+05:30", "type": "jenkins", "host": "RLD3MONS01", "path": "/devops/apache-tomcat-6.0.35/logs/catalina.out" },
{  "message": "INFO: Rundeck #1 main build action completed: FAILURE", "@version": "1", "@timestamp": "2014-02-25T21:19:09.874+05:30", "type": "jenkins", "host": "RLD3MONS01", "path": "/devops/apache-tomcat-6.0.35/logs/catalina.out" },
{  "message": "INFO: Rundeck » RunDeck Script Plugin #1 main build action completed: NOT_BUILT", "@version": "1", "@timestamp": "2014-02-25T21:19:09.873+05:30", "type": "jenkins", "host": "RLD3MONS01", "path": "/devops/apache-tomcat-6.0.35/logs/catalina.out" },
{  "message": "INFO: Rundeck » RunDeck App #1 main build action completed: NOT_BUILT", "@version": "1", "@timestamp": "2014-02-25T21:19:09.872+05:30", "type": "jenkins", "host": "RLD3MONS01", "path": "/devops/apache-tomcat-6.0.35/logs/catalina.out" },
{  "message": "INFO: Rundeck » RunDeck Stub Plugin #1 main build action completed: NOT_BUILT", "@version": "1", "@timestamp": "2014"
}]
        }
        showData(data["volumes1"]);
    }, 8000);
    function showData(data) {
        // console.log(data);
        data.forEach(function (item) {

            var bgcolor = '#aad4ff'
            //$divContainer = $('<div style="border:1px solid black;width:100%;background-color:'+bgcolor+'"></div>');
            $divlogstashcont = $('<div class="row" style="border-bottom:1px solid white"></div>');

            $(div).append($divlogstashcont);
           /*   $divlogstashcont.append('<div class="col-md-2"> Threshold :- '+item.thresholdName+'</div>'); */
            $l0 = $('<div class="col-md-1"></div>').append("l0");
            /* $divBeginTime =$('<div class="col-md-2"></div>').append(item.networkIp);
            $divEndTime =$('<div class="col-md-2"></div>').append(item.nodeIp); */
            $divlogstashcont.append($l0)/*.append($divBeginTime).append($divEndTime);*/
            $divlogstashcont.append('<div class="col-md-11">' + JSON.stringify(item, null, "\t") + '</div>');

            /*
            for(key in item) {
     
            $divContainer.append("<div>"+key+" :- "+item[key]+"</div>");
     
            }*/
            $(div).append('<br/>');
            //div.innerHTML =div.innerHTML+JSON.stringify(item, null, "\t")+'<br/>';
        });
        $(div).animate({ scrollTop: div.scrollHeight }, 'slow');
    }






});


