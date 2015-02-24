/*First part of script*/

$(".authPassword").show();
$(".authPemFile").hide();
$('.authenticationType').change(function(e) {
    if (this.value == "password") {
        $(".authPassword").show();
        $(".authPemFile").hide();
    } else {
        $(".authPassword").hide();
        $(".authPemFile").show();
    }
});

var wzlink = window.location.href.split('#')[1];
//alert(wzlink);
$('li[navigation*="Workspace"]').find('a').attr('href','#' + wzlink);

var urlParams = {};
(window.onpopstate = function() {
    var url = window.location.href;
    var indexOfQues = url.lastIndexOf("?");
    if (indexOfQues != -1) {
        var sub = url.substring(indexOfQues + 1);
        console.log(sub);
        var params = sub.split('&')
        for (var i = 0; i < params.length; i++) {
            var paramParts = params[i].split('=');
            urlParams[paramParts[0]] = paramParts[1];
        }
    }

})();
console.log(urlParams);
var projectId = urlParams['projid'];
var envId = urlParams['envid'];
var orgId = urlParams['org'];
var bgId = urlParams['bg'];

$(document).ready(function() {
  //$('.modal').modalCollapse();
  $(document).on('shown.bs.modal', function(e) {
    $('[autofocus]', e.target).focus();
  });

   $('#importinstanceOS').select2();
   $('#pemFileDropdown').select2();


  if(localStorage.getItem("SelectedClass") == "Orchestration")
  {
      localStorage.removeItem("SelectedClass");
      $('#myTab3').find('.Instances').removeClass('active');
      $('#myTab3').find('.Orchestration').addClass('active');
      $('#myTabContent3').find('#l1').removeClass('active');
      $('#myTabContent3').find('#l3').addClass('active'); 
      $('#myTab3').click();
  }
  $('#Removelinkedcontainersonexitfield').select2();
});

function setBreadCrumbAndViewOrchestration() {
    localStorage.setItem("SelectedClass","Orchestration");

  //var getbreadcrumbul = $('#ribbon').find('.breadcrumb').find('li').length;
    var getbreadcrumbul = $('#ribbon').find('.breadcrumb').find('li');
    var getbreadcrumbullength = getbreadcrumbul.length;
    var DummyBreadCrumb;
    if(getbreadcrumbullength > 0)
    {
    //alert(getbreadcrumbullength);
    for(var counter=0;counter<getbreadcrumbullength;counter++){
        var getbreadcrumbulname = getbreadcrumbul[counter].innerHTML;
        //alert(getbreadcrumbulname);
        if(DummyBreadCrumb != null && DummyBreadCrumb != "" && DummyBreadCrumb !="undefined")
        {
            DummyBreadCrumb += '>' + getbreadcrumbulname;
        }
        else
        {
            DummyBreadCrumb = getbreadcrumbulname;
        }
    }
    localStorage.setItem("breadcrumb", DummyBreadCrumb);
  }

  var getmyTab3selectedli = $('#myTab3').find('.pull-left.active');
  var getmyTab3selectedlilength = getmyTab3selectedli.length;
  //alert(getmyTab3selectedlilength);
  if(getmyTab3selectedlilength > 0){
    var myTabContent3 = $('#myTabContent3').find('tab-pane.active').innerHTML;
    //alert(myTabContent3);
  }
}

//event for orchatration tab show 
$(function() {
     var $createTaskBtn = $('.createTaskLink');
    // var $instanceList = $('.instancesList');
    $('a[data-toggle="tab"][href="#l3"]').on('show.bs.tab', function() {
        var cardCount = $('.instancesList').find('.componentlistContainer:not(.stopped)').length;
       
        if (cardCount === 0) {
            $createTaskBtn[0].disabled = true;
        } else {
            $createTaskBtn[0].disabled = false;
        }
    });

});

$('.createTaskLink').click(function(e){
    setBreadCrumbAndViewOrchestration();
  
    window.location.href = 'index.html#ajax/assignTask.html?org='+urlParams.org+'&bg='+urlParams['bg']+'&projid='+urlParams['projid']+'&envid='+urlParams['envid'];
});

//This will enable table view by default.


$('#defaultViewButton').click(); //setting the detault view





$('.dockerinstancestart').click(function(e){
    $('.instanceselectedfordocker').each(function(){
      if($(this).is(':checked')){
        
        var instid = $(this).closest('tr').attr('data-instanceid');
        if(instid)
          var $that = $(this);
            var $td =$that.closest('td');
            var tdtext = $td.text();
            $td.find('.dockerspinner').detach();
            $td.find('.dockermessage').detach();
            $td.append('<img class="dockerspinner" style="margin-left:5px" src="img/select2-spinner.gif"></img>');
            $td.attr('title','Pulling in Images');
            var imagename = $('.productdiv1.role-Selected1').first().attr('dockercontainerpaths');
            var repotag = $('.productdiv1.role-Selected1').find('.dockerrepotagselect').first().val();

            var repopath = $('.productdiv1.role-Selected1').first().attr('dockerreponame');

           // var dockerlaunchparameters = $('.productdiv1.role-Selected1').first().attr('dockerlaunchparameters');
           var dockerlaunchparameters = generateDockerLaunchParams();
            if(!dockerlaunchparameters)
                dockerlaunchparameters = 'null';
           var lp = 'null'; //launch parameter
           var sp = 'null'; //start parameter
            if(dockerlaunchparameters)
            {
               if(dockerlaunchparameters[0])
                lp = dockerlaunchparameters[0];
               if(dockerlaunchparameters[1])
                sp = dockerlaunchparameters[1];
            }
           // alert(lp + ' ' + sp);
       // alert('../instances/dockerimagepull/' + instid + '/' + repopath + '/' + encodeURIComponent(imagename) + '/' + repotag + '/' + encodeURIComponent(lp) + '/' + encodeURIComponent(sp));
          $.get('../instances/dockerimagepull/' + instid + '/' + repopath + '/' + encodeURIComponent(imagename) + '/' + repotag + '/' + encodeURIComponent(lp) + '/' + encodeURIComponent(sp),function(data){
            if(data == "OK"){
                var $statmessage = $td.find('.dockerspinner').parent();
                $td.find('.dockerspinner').detach();
                $td.find('.dockermessage').detach();
                $statmessage.append('<span style="margin-left:5px;text-decoration:none" class="dockermessage">Pull done</span>');
                //Updating instance card to show the docker icon.
                $dockericon = $('<img src="img/galleryIcons/Docker.png" alt="Docker" style="width:42px;height:42px;margin-left:32px;" class="dockerenabledinstacne"/>');
                //find the instance card - to do instance table view update
                var $instancecard = $('div[data-instanceid="' + instid + '"]');
                    if($instancecard.find('.dockerenabledinstacne').length <= 0){
                        $instancecard.find('.componentlistContainer').first().append($dockericon);
                    }
                    //debugger;
                    loadContainersTable(); //Clearing and loading the containers again.                
                }
                else
                {
                    var $statmessage = $('.dockerspinner').parent();
                    $('.dockerspinner').detach();
                    $td.find('.dockermessage').detach();
                    $statmessage.append('<span style="margin-left:5px;color:red" title="' + data + '"  class="dockermessage"><i class="fa  fa-exclamation"></i></span>');
                }
          });
      }
    });
});

$(function() {

function enableTree(){
     selectFirstEnv();
            if ($('#tree').find('a[itemtype="env"]').length <= 0) {
                $('#content').addClass('hidden');
                $('#noenvwarning').removeClass('hidden');
                $('ol.breadcrumb').addClass('hidden');
            } else {
                $('#content').removeClass('hidden');
                $('#noenvwarning').addClass('hidden');
                $('ol.breadcrumb').removeClass('hidden');
            } 
}
    if (orgId && urlParams['bg'] && projectId && envId) {

        $.get('../organizations/' + orgId + '/businessgroups/' + urlParams['bg'] + '/projects/' + projectId + '/environments/' + envId + '/', function(data) {

console.log('success---3---4');
         
enableTree();
            //Syncing up the tree view based on url
            initializeBlueprintArea(data.blueprints);
            initializeTaskArea(data.tasks);
            initializeInstanceArea(data.instances);

        });
    } else {
    
        enableTree();
    }

});
function generateDockerLaunchParams(){
  if($('#Containernamefield').val() == ''){
    $('.dockerparamrequired').removeClass('hidden');
    return('');
  }

    var launchparams = [];
    var preparams = '';
    var startparams = '';
    $('[dockerparamkey]').each(function(){
      if($(this).val() != ''){
        var itms = $(this).val().split(',');
        for(itm in itms)
          {
            if($(this).attr('dockerparamkey') != '-c') //checking for start parameter
                preparams += ' ' + $(this).attr('dockerparamkey') + ' ' + itms[itm];
            else
                startparams += ' ' + itms[itm];
          }
          launchparams[0] = preparams;
          launchparams[1] = startparams;
      }
    });
    return(launchparams);
}

function loadLaunchParams(){
  var lparam =  $('.productdiv1.role-Selected1').first().attr('dockerlaunchparameters');
  if(lparam != ''){
      $('[dockerparamkey]').val(''); //clearing the popup input boxes
      //split by -c to get startup and other parameters
      var preparams = lparam.split('-c');
      var cparams = ''; //this is the startup parameters
      if(preparams.length > 1){
        lparam = preparams[0];
        cparams = preparams[1];
      }
      console.log(lparam + ' ' + cparams);
      var params = lparam.split(' -');
      for(para in params){
        var subparam = params[para].split(' ');
        if(subparam.length > 0){
          $inp = $('[dockerparamkey="-' + subparam[0] + '"]').first();
          if($inp.val() != '')
            $inp.val($inp.val() + ',' + subparam[1]);
          else
            $inp.val(subparam[1]);
        }
        //alert(params[para]);
      }
      //Updating the startup parameter
      $('[dockerparamkey="-c"]').first().val(cparams);
    }
    else
       $('[dockerparamkey]').val(''); 
    $('#myModalLabelDockerContainer').modal('show');
}


$(document).ready(function(){
    //Expanding the first accordion
    
   //alert($('#accordion-2').find('a').first().html());
   $('.dockerrepotagselect').parent().prepend('Tags&nbsp;');
   
   $('#rootwizard').bootstrapWizard({
        'tabClass': 'nav nav-pills',
        'onNext': function(tab, navigation, index) {
            
            $('.dockerinstancestart').first().removeClass('hidden');
          var $valid = $("#commentForm").valid();
          if(!$valid) {
            $validator.focusInvalid();
            return false;
          }
        },
        'onPrevious' : function(tab,navigation,index){
            $('.dockerinstancestart').first().addClass('hidden');
        }

      }); 
});


//Containers table build for Docker
function loadContainersTable(){
  
    console.log('called');
    //Shwoing the loader spinner and clearing the rows.
    $('tr[id*="trfordockercontainer_"]').remove();
    $('.loadingimagefordockertable').removeClass('hidden');
    $dockercontainertable = $('#dockercontainertable tbody');

    $('.container').each(function(){
      var $docker = $(this).find('.dockerenabledinstacne');
      if($docker.html() != undefined){
        //Get the instance ID
        $('li.Containers').removeClass('hidden');
        var instanceid = $(this).find('[data-instanceid]').attr('data-instanceid');
            $.get('/instances/dockercontainerdetails/' + instanceid,function(data){
                if(!data){
                    $('.loadingimagefordockertable').addClass('hidden');
                    return;
                }
                if(data){
                    $('.loadingimagefordockertable').addClass('hidden');
                }
                var dockerContainerData = JSON.parse(data);
             //   alert(JSON.stringify(dockerContainerData));

                $.each(dockerContainerData,function(i,item){
                    var $docctr = createdockercontainerrow(item,instanceid);
                   // alert($docctr.html());

                   $dockercontainertable.append($docctr);
                   if(i >= dockerContainerData.length - 1)
                   {
                   // alert('in' + i);
                    $('.dockeractionbutton').unbind("click");
                    $('.cadvisorenablebase').each(function(j,itm){
                        if($(this).attr('cadvisorip')){
                            var cadip = $(this).attr('cadvisorip');
                             $('a[cadvisorip="' + cadip +'"]').removeClass('hidden');
                        }
                            
                     });

                    $('.dockeractionbutton').click(function(){
                       // alert('test' + $(this).attr('dockercontaineraction'));
                       //append('<img class="center-block" style="height:50px;width:50px;margin-top: 10%;margin-bottom: 10%;" src="img/loading.gif" />');
                       
                      
                        var action =  $(this).attr('dockercontaineraction');
                        var instanceid =  $(this).closest('tr').attr('instanceid');
                        var containerid =  $(this).closest('tr').attr('containerid');
                        var $contextRow = $(this).closest('tr');
                        var $thistr = $(this);
                        // alert('Url : ' + '/instances/dockercontainerdetails/' + instanceid + '/' + containerid + '/' + action);
                        var performAction = function(){
                        $thistr.closest('tr').fadeTo('slow',0.5);
                        var $progressicon = $thistr.closest('tr').find('.dockercontainerprogress').first();
                        
                        $progressicon.removeClass('hidden');
                            if(action == '1' || action == '2' || action == '3' || action == '4' || action == '5' || action == '6'){
                                    $.get('/instances/dockercontainerdetails/' + instanceid + '/' + containerid + '/' + action,function(data){
                                     // alert(data);
                                      if(data == 'OK'){
                                        //$(this).parents('.flip-toggle').toggleClass('flip1');
                                       //alert('ok');
                                      //  $(this).closest('.container1').first().find('.flipper').toggleClass('hidden');
                                       //alert($thistr.closest('.dockercontainertabletemplatetr').html());
                                       if(action == '6'){
                                            $contextRow.detach(); //removing the row on terminate.
                                       }
                                       else{
                                                    $.get('/instances/dockercontainerdetails/' + instanceid,function(data){
                                                        var dockerContainerData = JSON.parse(data);
                                                        //alert(JSON.stringify(dockerContainerData));
                                                        //Updating More Info dialog
                                                        // $('#modalContainermoreInfo').find('td[containerdata]').each(function(){
                                                        //     console.log("dockerContainerData." +  $(this).attr('containerdata'));
                                                        //      if($(this).attr('containerdata') != '')
                                                        //         $(this).html(eval("dockerContainerData." +  $(this).attr('containerdata')));
                                                        // });
                                                        // // updating row.
                                                        // $contextRow.find('dockercontainerstatus').html(dockerContainerData);
                                                        $.each(dockerContainerData,function(i,item){
                                                            //alert(item.Id.substring(0,12) + ':' + containerid);
                                                            if(item.Id.substring(0,12) == containerid){
                                                             //   alert('found constructing ' + item.toString())
                                                                var $updatedContainerRow = createdockercontainerrow(item,instanceid);
                                                                //Do not bind any action buttons
                                                                $updatedContainerRow.find('td').each(function(i,k){
                                                                    //alert(i + ':' + k);
                                                                    if(i > 0 && i < 7){
                                                                        $contextRow.find('td:eq(' + i + ')').html('').append($(k).html());
                                                                    }

                                                                });
                                                                $thistr.closest('.container1').find('.flipper').toggleClass('hidden');
                                                                //Managing the pause and unpause buttons
                                                                if(item.Status.indexOf('Exited') >= 0){
                                                                  //  alert('in');
                                                                    $thistr.closest('.container1').find('.pause').addClass('hidden');
                                                                    $thistr.closest('.container1').find('.unpause').addClass('hidden');
                                                                }
                                                                
                                                           }
                                                        });
                                                        
                                                        

                                                        $thistr.closest('tr').fadeTo('slow',1);
                                                        $progressicon.addClass('hidden');
                                                   });
                                        }

                                      }
                                      else
                                        $progressicon.addClass('hidden');
                                            
                                    });
                            }
                            return(false);
                        }



                        if(action == '6'){
                            bootbox.confirm("Are you sure you would like to terminate container : " + containerid + "?.<br/>This action could have an impact on other containers.", function(result) {
                                if (!result) {
                                    return;
                                }
                                performAction();
                            });
                        }
                        else if(action == '2'){
                            bootbox.confirm("Are you sure you would like to stop container : " + containerid + "?.<br/>This action could have an impact on other containers.", function(result) {
                                if (!result) {
                                    return;
                                }
                                performAction();
                            });
                        }
                        else{
                            performAction();
                        }
                        
                       
                    });
                    return;
                   }
                });
            });
        }
      else{ //no docker found
        $('.loadingimagefordockertable').addClass('hidden');
        $('li.Containers').addClass('hidden');
      }
    });
    //dockercontaineraction
   
    
}

//creating docker containers

function createdockercontainerrow(dockerContainerItem, instanceid){
   
    var $cadvisor = $('<a class="linkcadvisor hidden pull-right" target="_blank" title="Open cAdvisor"></a>');


    var $docctr = $('#dockercontainertabletemplatetr').clone().removeClass('hidden');
    $docctr.attr('id','trfordockercontainer_' + dockerContainerItem.Id);
    $docctr.find('.dockercontainerstatus').html(dockerContainerItem.Status).parent().append($cadvisor);
    var docdate = new Date(1000*dockerContainerItem.Created);
    $docctr.find('.dockercontainerstartedon').html(docdate.toLocaleString());
    $docctr.find('.dockercontainername').html(dockerContainerItem.Names[0]);
    //Get the host IP from the card

    var instanceip = $('.domain-roles-caption[data-instanceid="' + instanceid + '"]').first().find('.instanceip').text();

    //Building the cadvisor href
    $cadvisor.append('<i class="fa fa-line-chart fa-lg " style="margin-top:9px"></i>').attr('href','http://' + instanceip + ':8080/docker/' + dockerContainerItem.Id);
    $cadvisor.attr('cadvisorip',instanceip); //
    $cadvisor.attr('dockercontainerid',dockerContainerItem.Id );

    //Once CORS is enabled in cAdvisor uncomment below function to load in a frame
    $cadvisor.click(function(e){
        $('#cadvisorpopup').modal('show');
        $('#cAdvisorPageFrame').attr('src','http://' + instanceip + ':8080');
        //$('#cAdvisorPageFrame').load('http://' + instanceip + ':8080/docker/');
        e.preventDefault();
        return(false);
    });

    $docctr.attr('instanceid',instanceid);
    $docctr.attr('containerid',dockerContainerItem.Id.substring(0,12));
    $docctr.find('.dockercontainerhostip').html(instanceip);
    $docctr.find('.dockercontainerid').attr('containerid',dockerContainerItem.Id).html(dockerContainerItem.Id.substring(0,12));
    $docctr.find('.dockercontainerimagename').html(dockerContainerItem.Image);
    //Updating the more info popup event
    $docctr.find('.modelcontainermoreinfo').click(function(){
        $.get('/instances/dockercontainerdetails/' + instanceid + '/' + dockerContainerItem.Id,function(data){
            var dockerContainerData = JSON.parse(data);
            //alert(JSON.stringify(dockerContainerData));
            $('#modalContainermoreInfo').find('td[containerdata]').each(function(){
                console.log("dockerContainerData." +  $(this).attr('containerdata'));
                 if($(this).attr('containerdata') != '')
                    $(this).html(eval("dockerContainerData." +  $(this).attr('containerdata')));
            });

        });
    });
    //Analysing the status cell 
    if(dockerContainerItem.Status.indexOf('Up') >= 0)
    {
        //Show Stop
        //If the container is of type cadvisor show the link
        if(dockerContainerItem.Image.indexOf('cadvisor') >= 0){
            $cadvisor.removeClass('hidden');
            $cadvisor.addClass('cadvisorenablebase');
        }

        $docctr.find('.stop').removeClass('hidden');
        $docctr.find('.start').addClass('hidden');

        
        if(dockerContainerItem.Status.indexOf('Paused') >= 0){
            $docctr.find('.pause').addClass('hidden');
            $docctr.find('.unpause').removeClass('hidden');
        }else
        {
            $docctr.find('.unpause').addClass('hidden');
            $docctr.find('.pause').removeClass('hidden');
        }

    }
    else if(dockerContainerItem.Status.indexOf('Exited') >= 0){
        $docctr.find('.stop').addClass('hidden');
        $docctr.find('.start').removeClass('hidden');
        $docctr.find('.pause').addClass('hidden');
        $docctr.find('.unpause').addClass('hidden');
    }
    else if(dockerContainerItem.Status.indexOf('Paused') >= 0){
        $docctr.find('.pause').addClass('hidden');
        $docctr.find('.unpause').removeClass('hidden');
    }
    else
    {
        $docctr.find('.stop').addClass('hidden');
        $docctr.find('.start').removeClass('hidden');
    }

    return($docctr);

}

//End Containers table build
var tableinstanceview = null;


$('.desktopProvisioningLaunchBtn').click(function(e) {
    var $modalDesktopProvisioning = $('#modalDesktopProvisioningLaunch');
    var blueprintId = $modalDesktopProvisioning.data('blueprintId');
    var version = $modalDesktopProvisioning.data('blueprintVersion');;
    var reqBody = {};
    reqBody.version = version;
    reqBody.username = $('#instanceUsernameInput').val();
    reqBody.password = $('#instancePasswordInput').val();
    reqBody.instanceIP = $('#instanceIPInput').val();

    $modalDesktopProvisioning.modal('hide');
    var $launchResultContainer = $('#launchResultContainer');
    $launchResultContainer.find('.modal-body').empty().append('<img class="center-block" style="height:50px;width:50px;margin-top: 10%;margin-bottom: 10%;" src="img/loading.gif" />');
    $launchResultContainer.find('.modal-title').html('Provisioning Instance');
    $launchResultContainer.modal('show');


    $.post('/blueprints/' + blueprintId + '/provision', reqBody, function(data) {
        var $msg = $('<div></div>').append('<h3 class=\"alert alert-success\"><b>Congratulations!</b> Blueprint Launched Successfully</h3>').append('Instance Id : ' + data.id).append('<br/>Instance Logs :- ');

        $launchResultContainer.find('.modal-body').empty();
        $launchResultContainer.find('.modal-body').append($msg);

        var instanceId = data.id;
        var timeout;

        $launchResultContainer.on('hidden.bs.modal', function(e) {
            $launchResultContainer.off('hidden.bs.modal');
            if (timeout) {
                clearTimeout(timeout);
            }
        });
        $divBootstrapLogArea = $('<div></div>').addClass('logsAreaBootstrap');

        $launchResultContainer.find('.modal-body').append($divBootstrapLogArea);

        var lastTimestamp;

        function pollLogs(timestamp, delay, clearData) {
            var url = '/instances/' + instanceId + '/logs';
            if (timestamp) {
                url = url + '?timestamp=' + timestamp;
            }

            timeout = setTimeout(function() {
                $.get(url, function(data) {
                    var $modalBody = $divBootstrapLogArea;
                    if (clearData) {
                        $modalBody.empty();
                    }
                    var $table = $('<div></div>');

                    for (var i = 0; i < data.length; i++) {
                        var $rowDiv = $('<div class="row"></div>');
                        var timeString = new Date().setTime(data[i].timestamp);
                        var date = new Date(timeString).toLocaleString(); //converts to human readable strings
                        //$rowDiv.append($('<div class="col-lg-4 col-sm-4"></div>').append('<div>' + date + '</div>'));

                        if (data[i].err) {
                            $rowDiv.append($('<div class="col-lg-12 col-sm-12" style="color:red;"></div>').append('<span>' + data[i].log + '</span>'));
                        } else {
                            $rowDiv.append($('<div class="col-lg-12 col-sm-12 " style="color:white;"></div>').append('<span>' + data[i].log + '</span>'));
                        }

                        $table.append($rowDiv);
                    }


                    if (data.length) {
                        lastTimestamp = data[data.length - 1].timestamp;
                        console.log(lastTimestamp);
                        $modalBody.append($table);
                        $modalBody.scrollTop($modalBody[0].scrollHeight + 100);
                    }


                    console.log('polling again');
                    if ($launchResultContainer.data()['bs.modal'].isShown) {
                        pollLogs(lastTimestamp, 1000, false);
                    } else {
                        console.log('not polling again');
                    }
                });
            }, delay);
        }
        pollLogs(lastTimestamp, 0, true);
        $.get('/instances/' + data.id, function(data) {
            addInstanceToDOM(data);
        });

    }).error(function() {
        $launchResultContainer.find('.modal-body').empty().append('<span>Oops! Something went wrong. Please try again later</span>');
    });;



});


function showHideControl(objID)
{
    if(objID)
    {
        if(objID == "divinstancescardview" || objID == "defaultViewButton")
        {
            $("#divinstancestableview").removeClass("visibleClass");
            $("#divinstancescardview").addClass("visibleClass");
            $("#divinstancestableview").hide();
            $("#divinstancescardview").show();
        }
        else
        {   

            $("#divinstancestableview").addClass("visibleClass");
            $("#divinstancescardview").removeClass("visibleClass");
            $("#divinstancestableview").show();
            $("#divinstancescardview").hide();
        }
        //localStorage.clear();
    }
}
window.onload= getViewTile();

function getViewTile(){
    var locationData = localStorage.getItem("ControlID");
    if(locationData)
    {
        showHideControl(locationData);
   }
}

function loadcarousel() {
  $('.carousel.slide').carousel({
    interval : false,
    cycle : false
  });

}
loadcarousel();
