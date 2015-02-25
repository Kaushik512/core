   function initializeInstance(){
bindClick_ipaddressImport();
bindClick_instnaceTab();
registerModelEventForImportInstance();
bindChange_importPemFile();
bindSubmit_AddInstance();

}

function bindClick_ipaddressImport(){
  $('#ipaddressimport').click(function(e){
  $('#nodeimportipresultmsg').addClass("hidden");
  $('#addInstanceForm').trigger("reset");
  $('#pemFileDropdown').change();
  $('#importinstanceOS').change();
});
}

function bindClick_instnaceTab(){
	  $('.Instances').click(function(e){
    var getbreadcrumbul = $('#ribbon').find('.breadcrumb').find('li:lt(5)');
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
    DummyBreadCrumb += '>' + 'Instances';

    if(DummyBreadCrumb != null && DummyBreadCrumb != 'undefined'
        )
    {
        localStorage.removeItem("breadcrumb");
        splitBread = DummyBreadCrumb.split('>');
        if(splitBread.length > 0)
        {
            $('#ribbon').find('.breadcrumb').find('li').detach();
            for(var arraycount=0;arraycount< splitBread.length;arraycount++){
              var liNew = document.createElement('li');
              liNew.innerHTML = splitBread[arraycount];
              $('#ribbon').find('.breadcrumb').append(liNew);
            }
        }
    }
  }

});

}
/*Binding Click events to Instance*/
  

/*Showing the dialog for import instance by IP*/
function registerModelEventForImportInstance(){
	$('#modalContainerimportInstance').on('show.bs.modal',function(e){
   $('#addInstanceBtn').removeAttr('disabled');
   //$('#addInstanceForm').get(0).reset();
  var _org = getUrlParameter('org');
  $.get('/d4dMasters/readmasterjsonnew/10',function(data){
    if(data && JSON.parse(data).length <= 0){
      $('#modalContainerimportInstance').modal('hide');
      alert('A chef server is required to import an instance. Use settings to add a new one.');
      return false;
    }
    else
    {
      var found = false;
      JSON.parse(data).forEach(function(k,v){
        var kt = Object.keys(k);
       
        if(k['orgname'] == _org){
          found = true;
        }
      });
      
        if(!found){
          $('#modalContainerimportInstance').modal('hide');
          alert('A chef server is required to import an instance. Use settings to add a new one.');
        }
    }
    importbyipusers();
  });
});
}

function bindChange_importPemFile(){
$('#importPemfileInput').change(function(){
    //console.log(this.files);
    $(this).next().val(this.files[0].name);
});
}

function bindSubmit_AddInstance(){
	/* Add Instance by IP form submission */
  $("#addInstanceForm").submit( function(e) {
    var ipAddresRegExp=/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/; var hostname=/^([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])(\.([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]{0,61}[a-zA-Z0-9]))*$/;

    var $spinner = $('#nodeimportipspinner').addClass('hidden');
    var $result = $('#nodeimportipresultmsg').addClass('hidden');
    var reqBody = {};
    var $form = $('#addInstanceForm');
    reqBody.fqdn = $form.find('#instanceFQDN').val();
    reqBody.os = $form.find('#importinstanceOS').val();
    reqBody.users = $('#importbyipuserListSelect').val();
    reqBody.credentials = {
        username: $form.find('#instanceUsername').val()
    };

    if(!reqBody.fqdn) {
       alert('Please enter IP');
        e.preventDefault();
       return false;
    }
    if(!reqBody.fqdn.match(ipAddresRegExp) || !reqBody.fqdn.match(hostname)){
      alert("Please provide a valid IP Address or Hostname");
      e.preventDefault();
      return false;
    }

    if(!reqBody.users) {
       alert('Please assign atleast one user');
        e.preventDefault();
       return false;
    }
    if(!reqBody.os) {
       alert('Please choose OS');
        e.preventDefault();
       return false;
    }

    function makeRequest() {
     $('#addInstanceBtn').attr('disabled','disabled');
     $spinner.removeClass('hidden');
     // $('#addInstanceBtn').attr('disabled','disabled');
      $.post('../organizations/'+urlParams.org+'/businessgroups/'+urlParams['bg']+'/projects/'+urlParams.projid+'/environments/'+urlParams.envid+'/addInstance',reqBody,function(data){
          $('#tabInstanceStatus').hide();
          addInstanceToDOM(data);
          
          $spinner.addClass('hidden');
          $result.addClass('hidden');
          $('#addInstanceBtn').removeAttr('disabled');
          $('#addInstanceForm').get(0).reset();
          $('#importinstanceOS').change();
          $('#pemFileDropdown').change();
          var $divinstancescardview = $('#divinstancescardview');
          if ($divinstancescardview.find('li').length > 0) {
            $divinstancescardview.find('li').first().find('.flip-toggle').trigger('click');
          }
          $divinstancescardview.find('.item').first().addClass('active');
          $('#modalContainerimportInstance').modal('hide');
          //Updating the tree
          loadTreeFuncNew();
          console.log('success---3---3');
          selectFirstEnv();
          $('.domain-roles-caption[data-instanceId="' + data._id + '"]').find('.moreInfo').click();
      }).fail(function(jxhr){
         $spinner.addClass('hidden');
         $result.empty();
         $result.css({color:'red'});
         if(jxhr.status === 400) {
           if(jxhr.responseJSON) {
            $result.html(jxhr.responseJSON.message);
           } else {
            $result.html("Invalid request");
           }
         } else {
            $result.html("Server Behaved Unexpectedly");
         }
         $result.removeClass('hidden');
         $('#addInstanceBtn').removeAttr('disabled');
          
      });

    }

    var $dropdown = $('#pemFileDropdown');
    if ($dropdown.val()==='pemFile') {
        
       var pemFileInput = $form.find('#importPemfileInput').get(0);
       if(!reqBody.credentials.username){
          alert('Please Enter Username');
           e.preventDefault();
          return false;
       }
       if(!pemFileInput.files.length) {
         alert('Please Choose a Pem file');
          e.preventDefault();
         return false;
       }
       var reader = new FileReader();
       // Closure to capture the file information.
       reader.onload = function(e) {
           // Render thumbnail.
            reqBody.credentials.pemFileData = e.target.result;
           
            makeRequest();
           
       };
       // Read in the image file as a data URL.
       
       reader.readAsText(pemFileInput.files[0]);
    } else {
        reqBody.credentials.password = $form.find('#instancePassword').val();
        if(!reqBody.credentials.password) {
           alert("Please enter password");
            e.preventDefault();
           return false;
        }
        makeRequest();
    }

    e.preventDefault();
    return false;

});// end form.submit

}


/*import instance by ip we are checking for the user*/
function importbyipusers(){
var $loadingContainer = $('.userListLoadingContainer').empty().append('<img class="center-block" style="height:50px;width:50px;margin-top: 10%;margin-bottom: 10%;" src="img/loading.gif" />').show();    
    $.get('../users',function(userList){
      userList = JSON.parse(userList);
      var $importbyipuserListSelect = $('#importbyipuserListSelect').empty(); 
      userList.sort(function(a, b){
        var keyA =Object.keys(a);
        var keyB =Object.keys(b);
        
        if(keyA[0] < keyB[0]) return -1;
        if(keyA[0] > keyB[0]) return 1;
        return 0;
      }); 
      for(var i=0;i<userList.length;i++) {
        var keys = Object.keys(userList[i]);
        var $option = $('<option></option>').append(keys[0]).val(keys[0]);
        $importbyipuserListSelect.append($option);
      }
      $loadingContainer.hide();
      $importbyipuserListSelect.show();
    }).error(function(){
        $loadingContainer.empty().append('Unable to load users. Please try again later.');
    });
}

//table view instances
function initializeInstanceArea(data) {
        //alert('starting');
        if(data.length) {
            $('#tabInstanceStatus').hide();
        }

        //var $instancesList = $('.instancesList').empty();
        if (!$.fn.dataTable.isDataTable('#tableinstanceview')) {
            //alert('loading table');
            tableinstanceview = $('#tableinstanceview').DataTable({
                "pagingType": "full_numbers",
                "aoColumns": [
                    null, {
                        "bSortable": false
                    },
                    null,
                    null, {
                        "bSortable": false
                    }, {
                        "bSortable": false
                    }, {
                        "bSortable": false
                    }, {
                        "bSortable": false
                    }, {
                        "bSortable": false
                    }, {
                        "bSortable": false,
                        "sWidth": "20%"
                    }
                ]

            });
        }
        

        for (var i = 0; i < data.length; i++) {

            addInstanceToDOM(data[i]);

        }
        

        
        $('#tableinstanceview tbody tr').eq(0).addClass("rowcustomselected");

        function tableupdownRow(evt) {
            evt = evt || window.event;
            var key = evt.keyCode;
            switch (key) {
                case 38: // UP arrow
                    var $selectedRowPre = $('#tableinstanceview tbody').find(".rowcustomselected");
                    if ($('#tableinstanceview tbody').find(".rowcustomselected").prev().length == 1) {
                        var $newSelectedRowPre = $('#tableinstanceview tbody').find(".rowcustomselected").prev();
                        $newSelectedRowPre.addClass('rowcustomselected');
                        $selectedRowPre.removeClass('rowcustomselected');
                        break;
                    }
                    break;
                case 40: // DOWN arrow
                    var $selectedRow = $('#tableinstanceview tbody').find(".rowcustomselected");
                    if ($('#tableinstanceview tbody').find(".rowcustomselected").next().length == 1) {
                        var $newSelectedRow = $('#tableinstanceview tbody').find(".rowcustomselected").next();
                        $newSelectedRow.addClass('rowcustomselected');
                        $selectedRow.removeClass('rowcustomselected');
                        break;
                    }
                    break;
            }
        }
        document.onkeydown = tableupdownRow;
        $('#tableinstanceview tbody').on('click', 'tr', function() {
            if ($(this).hasClass('rowcustomselected')) {
                $(this).removeClass('rowcustomselected');
            } else {
                tableinstanceview.$('tr').removeClass('rowcustomselected');
                $(this).addClass('rowcustomselected');
            }

        });

        

        var $divinstancescardview = $('#divinstancescardview');
        if ($divinstancescardview.find('li').length > 0) {
          //Arab
          var cardIndexInfo = localStorage.getItem("cardIndex");
          
          if(cardIndexInfo) {
            var li = $divinstancescardview.find('li').get(cardIndexInfo);
             //console.log('container ==>',li);
            if(li) {
              $(li).find('.flip-toggle').trigger('click');
            } else {
              $divinstancescardview.find('li').first().find('.flip-toggle').trigger('click');
            }       
            
          } else {
             $divinstancescardview.find('li').first().find('.flip-toggle').trigger('click');
          }
        }
        $divinstancescardview.find('.item').first().addClass('active');

        loadContainersTable();

        $(".appFactoryPanel").find(".productdiv1").first().trigger('click');

    }


//stages of instances(start,stop,terminated etc.)
    function getCssClassFromStatus(status) {
    var cssClasses = {

    };
    switch (status) {

        case 'running':
            cssClasses.ringClass = 'started';
            cssClasses.textClass = 'instance-state-text-started';
            cssClasses.tableViewStatusClass = "started";
            break;

        case 'stopped':
            cssClasses.ringClass = 'stopped';
            cssClasses.textClass = 'instance-state-text-stopped';
            cssClasses.tableViewStatusClass = "stopped";
            break;

        case 'terminated':
            cssClasses.ringClass = 'stopped';
            cssClasses.textClass = 'instance-state-text-stopped';
            cssClasses.tableViewStatusClass = "stopped";
            break;

        default:
            cssClasses.ringClass = 'pending';
            cssClasses.textClass = 'instance-state-text-pending';
            cssClasses.tableViewStatusClass = "pending";

    }

    return cssClasses;
}

//removing instances from instances tab(both from grid view and table)

function removeSelectedInstance(){
    var instanceid = $('.container.role-Selectedcard').find('[data-instanceid]').attr('data-instanceid');
    if(instanceid){
        //found now delete
         bootbox.confirm("Are you sure you would like to remove this instance?<br/>Note:<br/>This will not terminate the instance from the provider.", function(result) {
            if (!result) {
                return;
            }
            $.get('/instances/delete/' + instanceid,function(data){
            //  alert(data);
              if(data == 'OK'){
                $('.container.role-Selectedcard').parents('.domain-role-thumbnail').detach();
                var table = $('#tableinstanceview').DataTable();
                console.log();
                table.row('[data-instanceid='+instanceid+']').remove().draw( false );

               
              }
              else
                alert(data);
            });
        });
    }
    else
    {
        alert('Please select an instance to remove.');
    }
}

//checking for the instance ID and enabling the buttons when instance is running and disabling
function pollInstanceState(instanceId, state, delay) {
    var $parent = $('.domain-roles-caption[data-instanceId="' + instanceId + '"]');
    var timeout = setTimeout(function() {
        $.get('../instances/' + instanceId, function(data) {
            if (data) {
                if (data.instanceState === state) {
                    pollInstanceState(instanceId, state, 5000);
                } else {
                    console.log('polling complete');
                    var cssClassed = getCssClassFromStatus(data.instanceState);
                    $parent.find('.componentlistContainer').removeClass().addClass('componentlistContainer').addClass(cssClassed.ringClass);
                    $parent.find('.instance-state').removeClass().addClass('instance-state').addClass(cssClassed.textClass).html(data.instanceState);
                    $('.instancestatusindicator[data-instanceId="' + instanceId + '"]').removeClass().addClass('instancestatusindicator').addClass(cssClassed.tableViewStatusClass);
                    $parent.find('.instance-details-id strong').html(data.instanceIP).attr('instanceip',data.instanceIP);
                    $('tr[data-instanceId="' + instanceId + '"] td.instanceIPCol').html(data.instanceIP);
                    if (data.instanceState == 'stopped'){
                    // // $('.componentlistContainer.stopped').parent().find('.chefClientRunlistImage').hide();
                    // // $('.instancestatusindicator.stopped').parent().find('.chefClientRunlistImage').hide();
                    $('.componentlistContainer.stopped').parent().find('.chefClientRunlistImage').addClass('isStopedInstance');
                    $('.instancestatusindicator.stopped').parent().find('.chefClientRunlistImage').addClass('isStopedInstance');
                    $('.componentlistContainer.stopped').parent().find('.sshIcon').addClass('isStopedInstance');
                    $('.instancestatusindicator.stopped').parent().find('.sshIcon').addClass('isStopedInstance');
                    $('.componentlistContainer.stopped').parent().find('.actionbuttonShutdown').addClass('isStopedInstance');
                    $('.instancestatusindicator.stopped').parent().find('.actionbuttonShutdown').addClass('isStopedInstance');
                    $('.componentlistContainer.stopped').parent().find('.actionbuttonStart').removeClass('isStopedInstance');
                    $('.instancestatusindicator.stopped').parent().find('.actionbuttonStart').removeClass('isStopedInstance');
                    //Opacity Settings
                    $('.componentlistContainer.stopped').parent().find('.chefClientRunlistImage').css('opacity','0.5');
                    $('.instancestatusindicator.stopped').parent().find('.chefClientRunlistImage').css('opacity','0.5');
                    $('.componentlistContainer.stopped').parent().find('.sshIcon').css({'opacity':'0.5'});
                    $('.instancestatusindicator.stopped').parent().find('.sshIcon').css({'opacity':'0.5'});
                    $('.componentlistContainer.stopped').parent().find('.actionbuttonShutdown').css({'opacity':'0.5'});
                    $('.instancestatusindicator.stopped').parent().find('.actionbuttonShutdown').css({'opacity':'0.5'});
                    $('.componentlistContainer.stopped').parent().find('.actionbuttonStart').css({'opacity':'1.0'});
                    $('.instancestatusindicator.stopped').parent().find('.actionbuttonStart').css({'opacity':'1.0'});
                    }
                    if (data.instanceState == 'running'){
                      // // $('.componentlistContainer.started').parent().find('.chefClientRunlistImage').show();
                      // // $('.instancestatusindicator.started').parent().find('.chefClientRunlistImage').show();
                      $('.componentlistContainer.started').parent().find('.chefClientRunlistImage').removeClass('isStopedInstance');
                      $('.instancestatusindicator.started').parent().find('.chefClientRunlistImage').removeClass('isStopedInstance');
                      $('.componentlistContainer.started').parent().find('.sshIcon').removeClass('isStopedInstance');
                      $('.instancestatusindicator.started').parent().find('.sshIcon').removeClass('isStopedInstance');
                      $('.componentlistContainer.started').parent().find('.actionbuttonShutdown').removeClass('isStopedInstance');
                      $('.instancestatusindicator.started').parent().find('.actionbuttonShutdown').removeClass('isStopedInstance');
                      $('.componentlistContainer.started').parent().find('.actionbuttonStart').addClass('isStopedInstance');
                      $('.instancestatusindicator.started').parent().find('.actionbuttonStart').addClass('isStopedInstance');
                      //Opacity Settings
                      $('.componentlistContainer.started').parent().find('.chefClientRunlistImage').css('opacity','1.0');
                      $('.instancestatusindicator.started').parent().find('.chefClientRunlistImage').css('opacity','1.0');
                      $('.componentlistContainer.started').parent().find('.sshIcon').css({'opacity':'1.0'});
                      $('.instancestatusindicator.started').parent().find('.sshIcon').css({'opacity':'1.0'});
                      $('.componentlistContainer.started').parent().find('.actionbuttonShutdown').css({'opacity':'1.0'});
                      $('.instancestatusindicator.started').parent().find('.actionbuttonShutdown').css({'opacity':'1.0'});
                      $('.componentlistContainer.started').parent().find('.actionbuttonStart').css({'opacity':'0.5'});
                      $('.instancestatusindicator.started').parent().find('.actionbuttonStart').css({'opacity':'0.5'});
                    }
                }
            }
        })
    }, delay);
}

var startStopInstanceHandler = function(e) {
  if($(this).hasClass('isStopedInstance')){
    return false;
  }
    var $this = $(this);
    var instanceId = $this.parents('.instanceActionBtnCtr').attr('data-instanceId');;
    var type = $this.attr('data-actionType');

    function makeRequest(url) {
        var $parent = $('.domain-roles-caption[data-instanceId="' + instanceId + '"]');
        $parent.find('.moreInfo').trigger('click');
        $.get(url, function(data) {

            console.log($parent.length, $parent);
            var cssClassed = getCssClassFromStatus(data.instanceCurrentState);

            var oldState = data.instanceCurrentState;


            $parent.find('.componentlistContainer').removeClass().addClass('componentlistContainer').addClass(cssClassed.ringClass);

            $parent.find('.instance-state').removeClass().addClass('instance-state').addClass(cssClassed.textClass).html(data.instanceCurrentState);

            $('.instancestatusindicator[data-instanceId="' + instanceId + '"]').removeClass().addClass('instancestatusindicator').addClass(cssClassed.tableViewStatusClass);

            pollInstanceState(instanceId, oldState, 2000);
        });

    }
    var url = '../instances/' + instanceId + '/startInstance';
    if (type === 'Stop') {
        url = '../instances/' + instanceId + '/stopInstance'
    }
    if (type === 'Stop') {
        bootbox.confirm(type + " instance?", function(result) {
            if (!result) {
                return;
            }
            makeRequest(url);
        });
    } else {
         makeRequest(url);
    }
}



var instanceUpdateRunlistHandler = function(e) {
  if($(this).hasClass('isStopedInstance')){
    return false;
  }
    var $this = $(this);
    //alert($this);
    var instanceId = $this.attr('data-instanceId');
    //alert(instanceId);
    var chefServerId = $this.attr('data-chefServerId');
    //alert(chefServerId);
    var runlist = $this.data('runlist');
    console.log("runlist",runlist);
    var  $chefRunModalContainer = $('#chefRunModalContainer');

    var $ccrs = $chefCookbookRoleSelector(urlParams.org, function(data) {
     
    },runlist);
    $ccrs.find('.deploymentSelectedRunList').attr('data-instanceid',instanceId);
    

 
    $chefRunModalContainer.find('.chefRunlistContainer').empty().append($ccrs);
    $chefRunModalContainer.modal('show');
 
};

var instanceLogsHandler = function(e) {
    var instanceId = $(this).attr('data-instanceId');
    var timeout;
    var $instanceLogModalContainer = $('#instanceLogModalContainer');
    $instanceLogModalContainer.on('hidden.bs.modal', function(e) {
        $instanceLogModalContainer.off('hidden.bs.modal');
        if (timeout) {
            clearTimeout(timeout);
        }
    });
    $instanceLogModalContainer.find('.logsArea').empty().append('<img class="center-block" style="height:50px;width:50px;margin-top: 10%;margin-bottom: 10%;" src="img/loading.gif" />');
    $instanceLogModalContainer.modal('show');
    var lastTimestamp;

    function pollLogs(timestamp, delay, clearData) {
        var url = '../instances/' + instanceId + '/logs';
        if (timestamp) {
            url = url + '?timestamp=' + timestamp;
        }

        timeout = setTimeout(function() {
            $.get(url, function(data) {
                var $modalBody = $instanceLogModalContainer.find('.logsArea')
                if (clearData) {
                    $modalBody.empty();
                }
                var $table = $('<div></div>');

                for (var i = 0; i < data.length; i++) {
                    var $rowDiv = $('<div class="row"></div>');
                    var timeString = new Date().setTime(data[i].timestamp);
                    var date = new Date(timeString).toLocaleString(); //converts to human readable strings
                    $rowDiv.append($('<div class="col-lg-4 col-sm-4"></div>').append('<div>' + date + '</div>'));

                    if (data[i].err) {
                        $rowDiv.append($('<div class="col-lg-8 col-sm-8" style="color:red;"></div>').append('<span>' + data[i].log + '</span>'));
                    } else {
                        $rowDiv.append($('<div class="col-lg-8 col-sm-8 " style="color:DarkBlue;"></div>').append('<span>' + data[i].log + '</span>'));
                    }

                    $table.append($rowDiv);
                    $table.append('<hr/>');

                }


                if (data.length) {
                    lastTimestamp = data[data.length - 1].timestamp;
                    console.log(lastTimestamp);
                    $modalBody.append($table);
                    $modalBody.scrollTop($modalBody[0].scrollHeight + 100);
                }


                console.log('polling again');
                if ($instanceLogModalContainer.data()['bs.modal'].isShown) {
                    pollLogs(lastTimestamp, 1000, false);
                } else {
                    console.log('not polling again');
                }
            });
        }, delay);
    }
    pollLogs(lastTimestamp, 0, true);
};
$('#modalSSHShellContainer').on('hide.bs.modal',function(e){
    $('#modalSSHShellContainer').find('#ssh-terminateBtn').click(); 
    $('#modalSSHShellContainer').find('.modal-body').empty();
});
function showSSHModal() {
  if($(this).hasClass('isStopedInstance')){
    return false;
  }
    var $sshModal = $('#modalSSHShellContainer');
    var instanceId = $(this).attr('data-instanceId');
    $sshModal.find('.modal-body').empty().append('<img class="center-block" style="height:50px;width:50px;margin-top: 10%;margin-bottom: 10%;" src="img/loading.gif" />');
    $sshModal.modal('show');
    $.get('sshShell.html?id=' + instanceId,function(data){

      $sshModal.find('.modal-body').empty().append(data);
       $sshModal.find('#ssh-instanceId').val(instanceId);
    });
}

function addInstanceToDOM(data) {
     //var dataTable = $('#tableinstanceview').DataTable()
     // TEMP Hack for the multiple cards issue. 
    // Import also needs to be fixed as it inserts 2 records in the db..
    if(data._id){// instanceId    
      var alreadyAdded = $("#content").find("div[data-instanceid='"+data._id+"']").length;  
      //alert(">>>>>" data._id  " >>>>>> " alreadyAdded);  
      if(alreadyAdded) return;
    }

    var $instanceDataTable = $("#tableinstanceview");
    var $divinstancescardview = $('#divinstancescardview .carousel-inner');
    var $carouselItemContainers = $divinstancescardview.find('.item');
    // var $instancesList = null;
    // var $item = null;
    var $instancesList,$item;
    //alert($carouselItemContainers.length);
    if(!$carouselItemContainers.length) {
        //creating Item tag
        $item = $('<div></div>').addClass('item');
        $instancesList = $('<ul></ul>').addClass("thumbnails marginleft-40 padding-top-30 list-unstyled instancesList");
        $item.append($instancesList);
        $divinstancescardview.append($item);
    } else {
        var $item = $($carouselItemContainers.get($carouselItemContainers.length -1));
        var $instancesList = $item.find('ul');
        if($instancesList.children().length === 5) {

            $item = $('<div></div>').addClass('item');
            $instancesList = $('<ul></ul>').addClass("thumbnails marginleft-40 padding-top-30 list-unstyled instancesList");
            $item.append($instancesList);
            $divinstancescardview.append($item);
        }
    }
  
    var $rowContainter = $('<tr data-instanceId="' + data._id + '"></tr>');
    


    var $li = $('<li></li>').addClass('domain-role-thumbnail');
    var $container = $('<div class="flip-toggle"></div>').addClass('container'); //<div class="container" id="flip-toggle">
    var $card = $('<div></div>').addClass('card'); //<div class="card">
    var $front = $('<div></div>').addClass('front'); //<div class="front">
    var $div = $('<div></div>').addClass('domain-roles ');
    var $divDomainRolesCaption = $('<div></div>').addClass('domain-roles-caption').attr('data-instanceId', data._id);
    var $divHeading = $('<div></div>').addClass('domain-roles-heading');


    var $spanheadingLeft = $('<span></span>').addClass('domain-roles-icon').html('<img src="'+data.blueprintData.iconPath+'" style="margin-right:5px;margin-top:-10px;width:27px"/>').attr('contenteditable', 'false');

    var $spanheadingMiddle = $('<span>' + data.blueprintData.blueprintName + '</span>').addClass('cardHeadingTextoverflow').attr('rel', 'tooltip').attr('data-placement', 'top').attr('data-original-title', ''+ data.blueprintData.blueprintName +'');
    var $spanheadingRight = $('<span></span>').css({
        'float': 'right'
    }).append($('<a href="javascript:void(0)" data-instanceId="' + data._id + '"></a>').addClass('moreInfo').attr('rel', 'tooltip').attr('data-placement', 'top').attr('data-original-title', 'MoreInfo'));

    $divHeading.append($spanheadingLeft);
    $divHeading.append($spanheadingMiddle);
    $divHeading.append($spanheadingRight);
    $divDomainRolesCaption.append($divHeading);
    $divDomainRolesCaption.append($('<hr>'));
    var $divComponentListContainer;
    var $tdInstanceStatusIndicator;

    if (data.instanceState == 'running') {
        $divComponentListContainer = $('<div></div>').addClass('componentlistContainer started');
        $tableInstanceStatusIndicator = $('<td></td>').addClass('instancestatusindicator started');
    } else if (data.instanceState == 'terminated') {
        $divComponentListContainer = $('<div></div>').addClass('componentlistContainer stopped');
        $tableInstanceStatusIndicator = $('<td></td>').addClass('instancestatusindicator stopped');
    } else if (data.instanceState == 'stopped') {
        $divComponentListContainer = $('<div></div>').addClass('componentlistContainer stopped');
        $tableInstanceStatusIndicator = $('<td></td>').addClass('instancestatusindicator stopped');
    } else {
        $divComponentListContainer = $('<div></div>').addClass('componentlistContainer pending');
        $tableInstanceStatusIndicator = $('<td></td>').addClass('instancestatusindicator pending');
    }
    $tableInstanceStatusIndicator.attr('data-instanceId', data._id);


    $divComponentList = $('<div></div>').addClass('instance-bootstrap-list');

    $divComponentItem = $('<span style="overflow:hidden;text-overflow:ellipsis;width:62px;padding-right:0px;"></span>').addClass('instance-details-item')
    .append($('<a class="btn"><i class="fa fa-2x fa-exchange txt-color-blue"></i></a>')
    .attr({
        'href': 'javascript:void(0)',
        'rel': 'tooltip',
        'data-placement': 'top',
        'data-original-title':'ViewAllRunlist'
      }).addClass('instance-bootstrap-list-faimage'));

    $divComponentItem.click(function(e) {
        $(this).parents('.flip-toggle').toggleClass('flip');
    });


    $divComponentList.append($divComponentItem);


    $divComponentListContainer.append($divComponentList);



    $divComponentListImage = $('<a class="chefClientRunlistImage actionbuttonChefClientRun"></a>').attr('rel', 'tooltip').attr('data-placement', 'top').attr('data-original-title', 'Chef Client Run').addClass('instance-bootstrap-list-image').attr('data-chefServerId', data.chef.serverId).attr('data-instanceId',data._id);

    //Check if the docker status is succeeded
    if(data.docker != null){
        var $dockerStatus = $('<img style="width:42px;height:42px;margin-left:32px;" alt="Docker" src="img/galleryIcons/Docker.png">').addClass('dockerenabledinstacne');
      
         $divComponentListContainer.append($dockerStatus);
    }
    if(typeof data.applicationUrl != 'undefined')
    {
      if(data.applicationUrl != 'http://'){
         var $anchor = "<a style='font-size:10px;' class='app.url marginForURL' title='"+data.applicationUrl+"' href='"+data.applicationUrl+"'' target='_blank' >WSS</a>";
         $divComponentListContainer.append($anchor);
      }
    }
    if(typeof data.applicationUrl1 != 'undefined'){
      if(data.applicationUrl1 != 'http://'){
         var $anchor1 = "<br><a style='margin-left:44px;font-size:10px;margin-top:-10px;' title='"+data.applicationUrl1+"' class='app.url1 forURL' href='"+data.applicationUrl1+"'' target='_blank'>AD</a>";
         $divComponentListContainer.append($anchor1);
      }
    }

    /*else{
     $divComponentListContainer.detach($anchor1); 
    }*/


   

    //For Table View
     var dataTableCount = $instanceDataTable.dataTable();
    var numberOfRows = dataTableCount.fnGetData().length;
    console.log('rows ==>',dataTableCount.fnGetData().length);

    $rowContainter.append('<td>' + (numberOfRows + 1) + '</td>');
    $rowContainter.append('<td><img src="'+data.blueprintData.iconPath+'" style="width:auto;height:30px;" /></td>');


    $rowContainter.append('<td>' + data.blueprintData.blueprintName.toString().substring(0,15) + '</td>');
    //$rowContainter.append('<td>' +$divComponentList.text()+ '</td>');
    $rowContainter.append('<td class="instanceIPCol">' + data.instanceIP + '</td>');
    var $tableRunlistDiv = $('<div></div>'); /*.append('<span>'+data.runlist.join()+'</span>');*/
   
    var $viewAllA;
    //alert(data.runlist);
    if (data.runlist.length) {
        $viewAllA  = $('<a></a>').attr('href', 'javascript:void(0)').append("View All Runlist");
        $viewAllA.click(function(e) {
            e.preventDefault();
            e.stopPropagation();

            var $modal = $('#modalTableRunlist');
            var $modalBody = $('#modalTableRunlist .modal-body').empty();
            var runlist =  $(this).parents('tr').find('.instance-bootstrap-list-image').data('runlist');
            for (var j = 0; j < runlist.length; j++) {
                var $divComponentItem;
                if (j == 0) {

                    $divComponentItem = $('<span title="' + runlist[j] + '" style="margin-top:8px;overflow:hidden;text-overflow:ellipsis;width:300px;"></span>').addClass('instance-details-item').append(runlist[j]);

                } else {
                    $divComponentItem = $('<span title="' + runlist[j] + '" style="overflow:hidden;text-overflow:ellipsis;width:300px;"></span>').addClass('instance-details-item').append(runlist[j]);
                }

                $modalBody.append($divComponentItem);
            }
            $modal.modal('show');
            return false;
        });
    } else {
       $viewAllA  = $('<span></span>').append("View All Runlist");
    }
    var $divComponentItem = $('<span title="View all runlist" style="overflow:hidden;text-overflow:ellipsis;width:111px;"></span>').addClass('instance-details-item').append($viewAllA);
    $tableRunlistDiv.append($divComponentItem);


    $rowContainter.append($('<td></td>').append($tableRunlistDiv));
    //$rowContainter.append('<td><img class="center-block" style="height:50px;width:50px;margin-top: 10%;margin-bottom: 10%;" src="img/aws_logo.png" /></td>');
    $rowContainter.append($tableInstanceStatusIndicator);
    var temp=($anchor ? $anchor: "")+""+($anchor1 ? $anchor1 :"");
    $rowContainter.append('<td>'+temp+'</td>');
    
    $rowContainter.append('<td><a class="tableMoreInfo moreInfo" data-instanceId="' + data._id + '" href="javascript:void(0)" rel="tooltip" data-placement="top" data-original-title="MoreInfo"></a></td>');

    $divDomainRolesCaption.append($divComponentListContainer);
    var $divInstanceDetails = $('<div></div>')
    var $instanceDetailsList = $('<div></div>').addClass('instance-details-list');
    var $instanceDetailItemId = $('<span></span>').addClass('instance-details-id').html('IP : <strong class="instanceip">' + data.instanceIP + '</strong>');
    //Arab
    // var $instanceDetailItemIdTest = $('<span style="float:right"><a data-content="TestPopover" data-original-title="CardInformation" data-placement="right" rel="popover" class="btn btn-primary moreinfoactionHistory" href="javascript:void(0);"></a></span>');
    
    // $instanceDetailsList.append($instanceDetailItemIdTest);


    $instanceDetailsList.append($instanceDetailItemId);
    var $instanceDetailItemStatus;
    if (data.instanceState == 'running') {
        $instanceDetailItemStatus = $('<span></span>').addClass('instance-details-id').html('status : <span class="instance-state instance-state-text-started">' + data.instanceState + '</strong>');
    } else if (data.instanceState == 'terminated') {
        $instanceDetailItemStatus = $('<span></span>').addClass('instance-details-id').html('status : <span class="instance-state instance-state-text-stopped">' + data.instanceState + '</strong>');
    } else if (data.instanceState == 'stopped') {
        $instanceDetailItemStatus = $('<span></span>').addClass('instance-details-id').html('status : <span class="instance-state instance-state-text-stopped">' + data.instanceState + '</strong>');
    } else {
        $instanceDetailItemStatus = $('<span></span>').addClass('instance-details-id').html('status : <span class="instance-state instance-state-text-pending">' + data.instanceState + '</strong>');
    }

    $instanceDetailsList.append($instanceDetailItemStatus);

    

    $divInstanceDetails.append($instanceDetailsList);

    $divDomainRolesCaption.append($divInstanceDetails);

    $divDomainRolesCaption.append($('<hr>'));


    //data-placement="top" rel="tooltip" width:140px;margin-left:6px;
    var $divActionBtnContainer = $('<div style="height:30px;width:152px;"></div>').addClass('instanceActionBtnCtr').attr('data-instanceId', data._id);
    //alert($divComponentListImage.html());

    
    var $divActionChefRunContainer = $('<div></div>').addClass('instance-bootstrap-ActionChefRun').append($divComponentListImage);
    $divActionBtnContainer.append($divActionChefRunContainer);

    var $divActionStartContainer = $('<div class="actionbutton"></div>').addClass('instance-bootstrap-ActionStart').append($('<a href="javascript:void(0)"></a>').addClass('actionbuttonStart instanceActionBtn').attr('data-actionType', 'Start').attr('data-placement', 'top').attr('rel', 'tooltip').attr('data-original-title', 'Start'));
    $divActionBtnContainer.append($divActionStartContainer);
    if (!data.chef) {
        data.chef = {};
    }
    // var $divActionReStartContainer = $('<div class="actionbutton"></div>').addClass('instance-bootstrap-ActionRestart').append($('<a href="javascript:void(0)"></a>').addClass('actionbuttonRestart instanceActionBtnUpdateRunlist').attr('data-chefServerId', data.chef.serverId).attr('rel', 'tooltip').attr('data-placement', 'top').attr('data-original-title', 'Restart'));
    // $divActionBtnContainer.append($divActionReStartContainer);
    var $divActionShutdownContainer = $('<div class="actionbutton"></div>').addClass('instance-bootstrap-ActionShutdown').append($('<a href="javascript:void(0)"></a>').addClass('actionbuttonShutdown instanceActionBtn').attr('data-actionType', 'Stop').attr('rel', 'tooltip').attr('data-placement', 'top').attr('data-original-title', 'Stop'));
    $divActionBtnContainer.append($divActionShutdownContainer); 
     
    // <img src="img/galleryIcons/sshIcon.png"/ height="27px" width="27px" >
     var $divActionSSHContainer = $('<div class="sshBtnContainer actionbutton"></div>').addClass('instance-bootstrap-ActionSSH').append($('<a href="javascript:void(0)" class="sshIcon" data-instanceid="'+data._id+'"></a>').addClass('').attr('data-actionType', 'SSH').attr('rel', 'tooltip').attr('data-placement', 'top').attr('data-original-title', 'SSH'));
    $divActionBtnContainer.append($divActionSSHContainer); 
   
    var $back = $('<div></div>').addClass('back card-backflip');
    var $backRunlistContainer = $('<div></div>').addClass('cardBackRunlistContaner');

    var $backdiv = $('<span></span>').addClass('card-backflip-margin');
    var $backdiva = $('<a style="color:#333;"></a>');
    var $backdivai = $('<i></i>').addClass('fa fa-lg fa-fw fa-book txt-color-blue'); 

    var $backdivaspan = $('<span style="font-size:12px;font-family:Open sans;padding-left:5px;color:#333"></span>').addClass('menu-item-parent').html('Runlists');
    var $backhr = $('<hr>');


    
    $backdiva.append($backdivai);
    $backdiva.append($backdivaspan);
    //$backdiva.append($backhr);
    $backdiv.append($backdiva);

    $back.append($backdiv);
    //rrr alert(data.runlist);
  
    for (var j = 0; j < data.runlist.length; j++) {
        var $divComponentItem;
      
            $divComponentItem = $('<span title="' + data.runlist[j] + '" style="margin-top:8px;overflow:hidden;text-overflow:ellipsis;width:130px;color:#3a87ad"></span>').addClass('instance-details-item').append(data.runlist[j]);
        $backRunlistContainer.append($divComponentItem);
    }
   
    //console.log($backRunlistContainer);
    $back.append($backRunlistContainer);
    $backdiv.append($backhr);

    
    var $flipbackdivaspanhr = $('<hr>');
    $back.append($flipbackdivaspanhr);
    var $flipbackdivaspan = $('<span style="width:160px;text-align:center;display:block;margin-top:8px"></span>').append($('<a style="color:#333"></a>').attr('href', 'javascript:void(0)').append("Go Back"));
    $flipbackdivaspan.click(function(e) {
        $(this).parents('.flip-toggle').toggleClass('flip');
    });
    $back.append($flipbackdivaspan);

    //Testing
    //$divActionBtnContainer.empty().append("<div style="float:left">One</div>").append("<div style="float:left">Two</div>").append("<div style="float:left">Three</div>");



    $divDomainRolesCaption.append($divActionBtnContainer);
    $front.append($div);
    $card.append($front);
    $card.append($back);
    $container.append($card);
    $li.append($container);
    //$li.append($div);
    $div.append($divDomainRolesCaption);

    $instancesList.append($li);
    //alert($instancesList.length);
    // alert($("#divinstancescardview li").length);
    // if($("#divinstancescardview li").length > 10){
    //     $('#myCarousel-2 .item active').append($instancesList);
    // }
    //For Table View
    //$divComponentListImage
    $rowContainter.append('<td>' + $('<div></div>').append($divComponentListImage.clone()).html() + '</td>');
    var $tableActionBtnContainer = $divActionBtnContainer.clone();
    $tableActionBtnContainer.find('.instance-bootstrap-ActionChefRun').remove();
    $rowContainter.append('<td>' + $('<div></div>').append($tableActionBtnContainer).html() + '</td>');

    //alert($rowContainter.html());
    //$("#tableinstanceview").find('tbody').append($rowContainter);
    var dataTable = $instanceDataTable.DataTable();
    dataTable.row.add($rowContainter).draw();




    if (data.instanceState === 'pending' || data.instanceState === 'stopping') {
        pollInstanceState(data._id, data.instanceState, 2000);
      // To be removed from comment later - Vinod
    }



    //handling events

    $rowContainter.find('.instanceActionBtn').click(startStopInstanceHandler);
    $li.find('.instanceActionBtn').click(startStopInstanceHandler);


    $rowContainter.find('.instance-bootstrap-list-image').click(instanceUpdateRunlistHandler).data('runlist',data.runlist);
    $li.find('.instance-bootstrap-list-image').click(instanceUpdateRunlistHandler).data('runlist',data.runlist);

    $rowContainter.find('.sshBtnContainer a').click(showSSHModal);
    $li.find('.sshBtnContainer a').click(showSSHModal);


    $rowContainter.find('.tableMoreInfo').click(instanceLogsHandler);
    $li.find('.moreInfo').click(instanceLogsHandler);

    var $cardContainer = $li.find('.container').click(function(e) {
        $('.container').removeClass('role-Selectedcard');
        $(this).addClass('role-Selectedcard');
        //Arab 
        localStorage.setItem("cardIndex", $(".container").index($(this)));
        console.log($(".container").index($(this)));
    });
    pageSetUp();
    // if (data.instanceState == 'stopped'){
    //   $('.componentlistContainer.stopped').parent().find('.chefClientRunlistImage').hide();
    //   $('.instancestatusindicator.stopped').parent().find('.chefClientRunlistImage').hide();
    // }
    if (data.instanceState == 'stopped'){
      $('.componentlistContainer.stopped').parent().find('.chefClientRunlistImage').addClass('isStopedInstance');
      $('.instancestatusindicator.stopped').parent().find('.chefClientRunlistImage').addClass('isStopedInstance');
      $('.componentlistContainer.stopped').parent().find('.sshIcon').addClass('isStopedInstance');
      $('.instancestatusindicator.stopped').parent().find('.sshIcon').addClass('isStopedInstance');
      $('.componentlistContainer.stopped').parent().find('.actionbuttonShutdown').addClass('isStopedInstance');
      $('.instancestatusindicator.stopped').parent().find('.actionbuttonShutdown').addClass('isStopedInstance');
      $('.componentlistContainer.stopped').parent().find('.actionbuttonStart').removeClass('isStopedInstance');
      $('.instancestatusindicator.stopped').parent().find('.actionbuttonStart').removeClass('isStopedInstance');


      $('.componentlistContainer.stopped').parent().find('.chefClientRunlistImage').css('opacity','0.5');
      $('.instancestatusindicator.stopped').parent().find('.chefClientRunlistImage').css('opacity','0.5');
      $('.componentlistContainer.stopped').parent().find('.sshIcon').css({'opacity':'0.5'});
      $('.instancestatusindicator.stopped').parent().find('.sshIcon').css({'opacity':'0.5'});
      $('.componentlistContainer.stopped').parent().find('.actionbuttonShutdown').css({'opacity':'0.5'});
      $('.instancestatusindicator.stopped').parent().find('.actionbuttonShutdown').css({'opacity':'0.5'});
      $('.componentlistContainer.stopped').parent().find('.actionbuttonStart').css({'opacity':'1.0'});
      $('.instancestatusindicator.stopped').parent().find('.actionbuttonStart').css({'opacity':'1.0'});
    }
    if (data.instanceState == 'running'){
      $('.componentlistContainer.started').parent().find('.chefClientRunlistImage').removeClass('isStopedInstance');
      $('.instancestatusindicator.started').parent().find('.chefClientRunlistImage').removeClass('isStopedInstance');
      $('.componentlistContainer.started').parent().find('.sshIcon').removeClass('isStopedInstance');
      $('.instancestatusindicator.started').parent().find('.sshIcon').removeClass('isStopedInstance');
      $('.componentlistContainer.started').parent().find('.actionbuttonShutdown').removeClass('isStopedInstance');
      $('.instancestatusindicator.started').parent().find('.actionbuttonShutdown').removeClass('isStopedInstance');
      $('.componentlistContainer.started').parent().find('.actionbuttonStart').addClass('isStopedInstance');
      $('.instancestatusindicator.started').parent().find('.actionbuttonStart').addClass('isStopedInstance');

      $('.componentlistContainer.started').parent().find('.chefClientRunlistImage').css('opacity','1.0');
      $('.instancestatusindicator.started').parent().find('.chefClientRunlistImage').css('opacity','1.0');
      $('.componentlistContainer.started').parent().find('.sshIcon').css({'opacity':'1.0'});
      $('.instancestatusindicator.started').parent().find('.sshIcon').css({'opacity':'1.0'});
      $('.componentlistContainer.started').parent().find('.actionbuttonShutdown').css({'opacity':'1.0'});
      $('.instancestatusindicator.started').parent().find('.actionbuttonShutdown').css({'opacity':'1.0'});
      $('.componentlistContainer.started').parent().find('.actionbuttonStart').css({'opacity':'0.5'});
      $('.instancestatusindicator.started').parent().find('.actionbuttonStart').css({'opacity':'0.5'});
    }
    

    setTimeout(function(){
      var $l=$('#divinstancescardview').find('.active');
    if($l.length>1){
          $l.not(':first').removeClass('active');
        }
    },3);
    $('#divinstancescardview .carousel-inner .item').addClass('active');
  }

