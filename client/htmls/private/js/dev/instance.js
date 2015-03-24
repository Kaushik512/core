 /*
        This is the entry method for initialising the instance in Dev.html.
        */
 function initializeInstance() {
     bindClick_ipaddressImport();
     bindClick_instnaceTab();
     registerModelEventForImportInstance();
     bindChange_importPemFile();
     bindSubmit_AddInstance();
     bindClick_removeInstance();
     initializeSSHModelContainer();
     $(document).off('shown.bs.model').on('shown.bs.modal', function(e) {
         $('[autofocus]', e.target).focus();
     });

     $('#importinstanceOS').select2();
     $('#pemFileDropdown').select2();
 }

 function bindClick_removeInstance() {
     $('#removeInstance').on('click', removeSelectedInstance);
 }
 /*removing selected instance*/
 //function for removing the selected instance
 function removeSelectedInstance() {
     var instanceId = null;
     var blueprintName = null;
     if ($('#divinstancescardview').is(':visible')) {
         var $selectedCard = $('.container.role-Selectedcard').find('.domain-roles-caption');
         instanceId = $selectedCard.attr('data-instanceid');
         blueprintName = $selectedCard.attr('data-blueprintName');
     } else if ($('#divinstancestableview').is(':visible')) {
         var $selectedRow = $('#tableinstanceview').find('tr.rowcustomselected');
         instanceId = $selectedRow.attr('data-instanceId');
         blueprintName = $selectedRow.attr('data-blueprintName');
     } else {
         instanceId = null;
     }
     if (instanceId) {
         //found now delete
         var dialog = bootbox.dialog({
             title: "Remove Instance.",
             message: '<div class="row">  ' +
                 '<div class="col-md-12"> ' +
                 '<div id="deleteInstanceWorkingIndicator" style="display:none"><img class="center-block" style="height:50px;width:50px;margin-top: 10%;margin-bottom: 10%;" src="img/loading.gif" /></div>' +
                 '<form id="deleteInstanceForm" class="form-horizontal"> ' +
                 '<input type="hidden" id="deleteInstanceIdInput" value="' + instanceId + '"/>' +
                 '<div class="form-group"> ' +
                 '<span class="col-md-12" for="name">Are you sure you would like to remove this instance?<br/>Note : This will not terminate the instance from the provider.</span> ' +
                 '</div>' +
                 '<div class="form-group"> ' +
                 '<label class="col-md-4 control-label forBootBox1" for="name">Name : </label> ' +
                 '<span class="col-md-4 forBootBox" for="name">' + blueprintName + '</span> ' +
                 '</div> ' +
                 '<div class="form-group"> ' +
                 '<label class="col-md-3 control-label" for="ckbChefDelete"></label> ' +
                 '<div class="col-md-8"> <div class="checkbox"> <label for="ckbChefDelete-0"> ' +
                 '<input type="checkbox" name="ckbChefDelete" id="ckbChefDelete"> ' +
                 'Delete this node from chef server </label> ' +
                 '</div>' +
                 '</div>' +
                 '</form> </div>  </div>',
             buttons: {
                 success: {
                     label: "Delete",
                     className: "btn-primary",
                     callback: function(evt, arg2) {
                         $('#deleteInstanceForm').hide();
                         $('#deleteInstanceWorkingIndicator').show();
                         $(evt.target).attr('disabled', 'disabled');


                         var url = '/instances/' + instanceId;
                         if ($('#ckbChefDelete').is(':checked')) {
                             url = url + '?chefRemove=true';
                         }

                         $.ajax({
                             url: url,
                             type: 'DELETE',
                             success: function() {
                                 $('#divinstancescardview').find('.domain-roles-caption[data-instanceId=' + instanceId + ']').parents('.domain-role-thumbnail').remove();
                                 // serachBoxInInstance.updateData(undefined,"remove",instanceId);

                                 var table = $('#tableinstanceview').DataTable();
                                 table.row('[data-instanceid=' + instanceId + ']').remove().draw(false);
                                 dialog.modal('hide');
                             }
                         }).fail(function() {
                             $('#deleteInstanceForm').html('Server Behaved Unexpectedly. Unable to delete instance');
                             $('#deleteInstanceWorkingIndicator').hide();
                             $('#deleteInstanceForm').show();
                         });
                         return false;
                     }
                 },
                 cancel: {
                     label: "Close",
                     className: "btn-primary",
                     callback: function() {

                     }
                 }
             }
         });
     } else {
         bootbox.alert('Please select an instance to remove.');
     }
 }

 //Loading the containers table in Docker.
 function loadContainersTable() {
     //alert('called');
     //debugger;
     console.log('called');
     //Shwoing the loader spinner and clearing the rows.
     $('tr[id*="trfordockercontainer_"]').remove();
     //$('.loadingimagefordockertable').removeClass('hidden');
     $dockercontainertable = $('#dockercontainertable tbody');

     $('.container').each(function() {
         var $docker = $(this).find('.dockerenabledinstacne');
         if ($docker.html() != undefined) {
             //Get the instance ID
             //$('li.Containers').removeClass('hidden');
             var instanceid = $(this).find('[data-instanceid]').attr('data-instanceid');
             $.get('/instances/dockercontainerdetails/' + instanceid, function(data) {
                 if (!data) {
                     $('.loadingimagefordockertable').addClass('hidden');
                     return;
                 }
                 if (data) {
                     $('.loadingimagefordockertable').addClass('hidden');
                 }
                 var dockerContainerData = JSON.parse(data);
                 //   alert(JSON.stringify(dockerContainerData));

                 $.each(dockerContainerData, function(i, item) {
                     var $docctr = createdockercontainerrow(item, instanceid);
                     // alert($docctr.html());

                     $dockercontainertable.append($docctr);
                     if (i >= dockerContainerData.length - 1) {
                         // alert('in' + i);
                         $('.dockeractionbutton').unbind("click");
                         $('.cadvisorenablebase').each(function(j, itm) {
                             if ($(this).attr('cadvisorip')) {
                                 var cadip = $(this).attr('cadvisorip');
                                 $('a[cadvisorip="' + cadip + '"]').removeClass('hidden');
                             }

                         });

                         $('.dockeractionbutton').click(function() {
                             // alert('test' + $(this).attr('dockercontaineraction'));
                             //append('<img class="center-block" style="height:50px;width:50px;margin-top: 10%;margin-bottom: 10%;" src="img/loading.gif" />');


                             var action = $(this).attr('dockercontaineraction');
                             var instanceid = $(this).closest('tr').attr('instanceid');
                             var containerid = $(this).closest('tr').attr('containerid');
                             var $contextRow = $(this).closest('tr');
                             var $thistr = $(this);
                             // alert('Url : ' + '/instances/dockercontainerdetails/' + instanceid + '/' + containerid + '/' + action);
                             var performAction = function() {
                                 $thistr.closest('tr').fadeTo('slow', 0.5);
                                 var $progressicon = $thistr.closest('tr').find('.dockercontainerprogress').first();

                                 $progressicon.removeClass('hidden');
                                 if (action == '1' || action == '2' || action == '3' || action == '4' || action == '5' || action == '6') {
                                     $.get('/instances/dockercontainerdetails/' + instanceid + '/' + containerid + '/' + action, function(data) {
                                         // alert(data);
                                         if (data == 'OK') {
                                             //$(this).parents('.flip-toggle').toggleClass('flip1');
                                             //alert('ok');
                                             //  $(this).closest('.container1').first().find('.flipper').toggleClass('hidden');
                                             //alert($thistr.closest('.dockercontainertabletemplatetr').html());
                                             if (action == '6') {
                                                 $contextRow.detach(); //removing the row on terminate.
                                             } else {
                                                 $.get('/instances/dockercontainerdetails/' + instanceid, function(data) {
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
                                                     $.each(dockerContainerData, function(i, item) {
                                                         //alert(item.Id.substring(0,12) + ':' + containerid);
                                                         if (item.Id.substring(0, 12) == containerid) {
                                                             //   alert('found constructing ' + item.toString())
                                                             var $updatedContainerRow = createdockercontainerrow(item, instanceid);
                                                             //Do not bind any action buttons
                                                             $updatedContainerRow.find('td').each(function(i, k) {
                                                                 //alert(i + ':' + k);
                                                                 if (i > 0 && i < 7) {
                                                                     $contextRow.find('td:eq(' + i + ')').html('').append($(k).html());
                                                                 }

                                                             });
                                                             $thistr.closest('.container1').find('.flipper').toggleClass('hidden');
                                                             //Managing the pause and unpause buttons
                                                             if (item.Status.indexOf('Exited') >= 0) {
                                                                 //  alert('in');
                                                                 $thistr.closest('.container1').find('.pause').addClass('hidden');
                                                                 $thistr.closest('.container1').find('.unpause').addClass('hidden');
                                                             }

                                                         }
                                                     });



                                                     $thistr.closest('tr').fadeTo('slow', 1);
                                                     $progressicon.addClass('hidden');
                                                 });
                                             }

                                         } else
                                             $progressicon.addClass('hidden');

                                     });
                                 }
                                 return (false);
                             }



                             if (action == '6') {
                                 bootbox.confirm("Are you sure you would like to terminate container : " + containerid + "?.<br/>This action could have an impact on other containers.", function(result) {
                                     if (!result) {
                                         return;
                                     }
                                     performAction();
                                 });
                             } else if (action == '2') {
                                 bootbox.confirm("Are you sure you would like to stop container : " + containerid + "?.<br/>This action could have an impact on other containers.", function(result) {
                                     if (!result) {
                                         return;
                                     }
                                     performAction();
                                 });
                             } else {
                                 performAction();
                             }


                         });
                         return;
                     }
                 });
             });
         } else { //no docker found
             $('.loadingimagefordockertable').addClass('hidden');
             //$('li.Containers').addClass('hidden');
         }
     });
     //dockercontaineraction
 }


 /*
 Attaching Click Event on IP Address Import, which will reset instance form.
 */
 function bindClick_ipaddressImport() {
     // $('#ipaddressimport').click(function(e) {
     //     var perm = haspermission('instancelaunch','execute');
     //         //alert(perm);
     //       if(!perm)
     //       {
     //         $('#modalContainerimportInstance').modal('hide');
     //         bootbox.alert('Insufficient permission to perform operation.');
     //         return;
     //       }
     //       else{
     //         $('#nodeimportipresultmsg').addClass("hidden");
     //         $('#addInstanceForm').trigger("reset");
     //         $('#pemFileDropdown').change();
     //         $('#importinstanceOS').change();
     //     }
     // });
 }

 /*
        Attaching Click event on instances tab which will set BreadCrumb for Instances
        */
 function bindClick_instnaceTab() {
     $('.Instances').click(function(e) {
         var getbreadcrumbul = $('#ribbon').find('.breadcrumb').find('li:lt(5)');
         var getbreadcrumbullength = getbreadcrumbul.length;
         var DummyBreadCrumb;
         if (getbreadcrumbullength > 0) {
             //alert(getbreadcrumbullength);
             for (var counter = 0; counter < getbreadcrumbullength; counter++) {
                 var getbreadcrumbulname = getbreadcrumbul[counter].innerHTML;
                 //alert(getbreadcrumbulname);
                 if (DummyBreadCrumb != null && DummyBreadCrumb != "" && DummyBreadCrumb != "undefined") {
                     DummyBreadCrumb += '>' + getbreadcrumbulname;
                 } else {
                     DummyBreadCrumb = getbreadcrumbulname;
                 }
             }
             DummyBreadCrumb += '>' + 'Instances';

             if (DummyBreadCrumb != null && DummyBreadCrumb != 'undefined') {
                 localStorage.removeItem("breadcrumb");
                 var splitBread = DummyBreadCrumb.split('>');
                 if (splitBread.length > 0) {
                     $('#ribbon').find('.breadcrumb').find('li').detach();
                     for (var arraycount = 0; arraycount < splitBread.length; arraycount++) {
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


 /*Showing the dialog for import instance by IP when there is no chefServer*/
 function registerModelEventForImportInstance() {
     $('#modalContainerimportInstance').on('show.bs.modal', function(e) {
         $('#addInstanceBtn').removeAttr('disabled');
         //$('#addInstanceForm').get(0).reset();
         var _org = getUrlParameter('org');
         $.get('/d4dMasters/readmasterjsonnew/10', function(data) {
             if (data && JSON.parse(data).length <= 0) {
                 $('#modalContainerimportInstance').modal('hide');
                 alert('A chef server is required to import an instance. Use settings to add a new one.');
                 return false;
             } else {
                 var found = false;
                 JSON.parse(data).forEach(function(k, v) {
                     var kt = Object.keys(k);

                     if (k['orgname_rowid'] == _org) {
                         found = true;
                     }
                 });

                 if (!found) {
                     $('#modalContainerimportInstance').modal('hide');
                     alert('A chef server is required to import an instance. Use settings to add a new one.');
                 }
             }
             importbyipusers();
         });
     });
 }

 //Binding the user selection to pem file for import by IP
 function bindChange_importPemFile() {
     $('#importPemfileInput').change(function() {
         //console.log(this.files);
         $(this).next().val(this.files[0].name);
     });
 }

 //checking the IP address and form validations for Import By IP
 function bindSubmit_AddInstance() {
     /* Add Instance by IP form submission */
     $("#addInstanceForm").submit(function(e) {
         var ipAddresRegExp = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
         var hostname = /^([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])(\.([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]{0,61}[a-zA-Z0-9]))*$/;

         var $spinner = $('#nodeimportipspinner').addClass('hidden');
         var $result = $('#nodeimportipresultmsg').addClass('hidden');
         var reqBody = {};
         var $form = $('#addInstanceForm');
         reqBody.fqdn = $form.find('#instanceFQDN').val().trim();
         reqBody.os = $form.find('#importinstanceOS').val();
         reqBody.users = $('#importbyipuserListSelect').val();
         reqBody.credentials = {
             username: $form.find('#instanceUsername').val()
         };

         if (!reqBody.fqdn) {
             alert('Please enter IP');
             e.preventDefault();
             return false;
         }
         if (!reqBody.fqdn.match(ipAddresRegExp) || !reqBody.fqdn.match(hostname)) {
             alert("Please provide a valid IP Address or Hostname");
             e.preventDefault();
             return false;
         }

         if (!reqBody.users) {
             alert('Please assign atleast one user');
             e.preventDefault();
             return false;
         }
         if (!reqBody.os) {
             alert('Please choose OS');
             e.preventDefault();
             return false;
         }

         //Adding instance by Import By IP.
         function makeRequest() {
             $('#addInstanceBtn').attr('disabled', 'disabled');
             $spinner.removeClass('hidden');
             // $('#addInstanceBtn').attr('disabled','disabled');
             $.post('../organizations/' + urlParams.org + '/businessgroups/' + urlParams['bg'] + '/projects/' + urlParams.projid + '/environments/' + urlParams.envid + '/addInstance', reqBody, function(data) {
                 $('#tabInstanceStatus').hide();
                 addInstanceToDOM(data);
                 //  serachBoxInInstance.updateData(data,"add",undefined);
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
                 //loadTreeFuncNew();
                 console.log('success---3---3');
                 //selectFirstEnv();
                 //selectAnyEnviornment(urlParams.org,urlParams.envid);
                 $('.domain-roles-caption[data-instanceId="' + data._id + '"]').find('.moreInfo').click();
             }).fail(function(jxhr) {
                 $spinner.addClass('hidden');
                 $result.empty();
                 $result.css({
                     color: 'red'
                 });
                 if (jxhr.status === 400) {
                     if (jxhr.responseJSON) {
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
         if ($dropdown.val() === 'pemFile') {

             var pemFileInput = $form.find('#importPemfileInput').get(0);
             if (!reqBody.credentials.username) {
                 alert('Please Enter Username');
                 e.preventDefault();
                 return false;
             }
             if (!pemFileInput.files.length) {
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
             if (!reqBody.credentials.password) {
                 alert("Please enter password");
                 e.preventDefault();
                 return false;
             }
             makeRequest();
         }

         e.preventDefault();
         return false;

     });

 }


 /*Checking for The User Selection for Import By IP*/
 function importbyipusers() {

     var $loadingContainer = $('.userListLoadingContainer').empty().append('<img class="center-block" style="height:50px;width:50px;margin-top: 10%;margin-bottom: 10%;" src="img/loading.gif" />').show();
     $.get('../users', function(userList) {
         userList = JSON.parse(userList);
         var $importbyipuserListSelect = $('#importbyipuserListSelect').empty();
         userList.sort(function(a, b) {
             var keyA = Object.keys(a);
             var keyB = Object.keys(b);

             if (keyA[0] < keyB[0]) return -1;
             if (keyA[0] > keyB[0]) return 1;
             return 0;
         });
         for (var i = 0; i < userList.length; i++) {
             var keys = Object.keys(userList[i]);
             var $option = $('<option></option>').append(keys[0]).val(keys[0]);
             $importbyipuserListSelect.append($option);
         }
         $loadingContainer.hide();
         $importbyipuserListSelect.show();
     }).error(function() {
         $loadingContainer.empty().append('Unable to load users. Please try again later.');
     });
 }

 /*Register events for pem file upload*/
 function registerEventsForPemFile() {
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
 }

 function createInstanceUI(data) {
     //alert('starting');

     if (!$.fn.dataTable.isDataTable('#tableinstanceview')) {
         //alert('loading table');
         var tableinstanceview = $('#tableinstanceview').DataTable({
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
             ],
             "fnRowCallback": function(nRow, aData, iDisplayIndex) {
                 $("td:first", nRow).html(iDisplayIndex + 1);
                 return nRow;
             }

         });
     }


     for (var i = 0; i < data.length; i++) {

         addInstanceToDOM(data[i]);

     }



     $('#tableinstanceview tbody tr').eq(0).addClass("rowcustomselected");

     //Setting the count for the table entry in TableView
     function tableupdownRow(evt) {
         evt = evt || window.event;
         var key = evt.which ? evt.which : evt.keyCode;
         var $selectedRow = $('#tableinstanceview tbody').find(".rowcustomselected");
         switch (key) {
             case 38: // UP arrow
                 var $newSelectedRowPre = $selectedRow.prev();
                 if ($newSelectedRowPre.length == 1) {
                     $newSelectedRowPre.addClass('rowcustomselected');
                     $selectedRow.removeClass('rowcustomselected');
                 }
                 break;
             case 40: // DOWN arrow
                 var $newSelectedRowNext = $selectedRow.next();
                 if ($newSelectedRowNext.length == 1) {
                     $newSelectedRowNext.addClass('rowcustomselected');
                     $selectedRow.removeClass('rowcustomselected');
                 }
                 break;
         }
     }
     document.onkeydown = tableupdownRow;
     $('#tableinstanceview tbody').on('click', 'tr', function() {
         if ($(this).hasClass('rowcustomselected')) {

         } else {
             $('#tableinstanceview tbody').find('.rowcustomselected').removeClass('rowcustomselected');
             $(this).addClass('rowcustomselected');
         }

     });



     var $divinstancescardview = $('#divinstancescardview');
     if ($divinstancescardview.find('li').length > 0) {
         //Arab
         var cardIndexInfo = localStorage.getItem("cardIndex");

         if (cardIndexInfo) {
             var li = $divinstancescardview.find('li').get(cardIndexInfo);
             //console.log('container ==>',li);
             if (li) {
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

 //Showing the Table View for instances and setting the pagination for the table
 function initializeInstanceArea(data) {
     if (data.length) {
         $('#tabInstanceStatus').hide();
     }
     // serachBoxInInstance.initData(data);
     a = createInstanceUI;
     createInstanceUI(data);
 }

 b = initializeInstanceArea;
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


 function pollInstanceState(instanceId, state, delay) {
     var $parent = $('.domain-roles-caption[data-instanceId="' + instanceId + '"]');

     var timeout = setTimeout(function() {
         $.get('../instances/' + instanceId, function(data) {
             if (data) {
                 if (data.instanceState == 'stopped') {
                     enableInstanceActionStopBtn(instanceId);
                 }
                 if (data.instanceState == 'running') {
                     enableInstanceActionStartBtn(instanceId, data.hardware.os);
                 }
                 if (data.instanceState == 'pending' || data.instanceState == 'stopping') {
                     disableInstanceActionBtns(instanceId);
                 }
                 if (data.instanceState == 'unknown') {
                     disableInstanceStartStopActionBtns(data._id, data.hardware.os);
                 }
                 if (data.instanceState === state) {
                     pollInstanceState(instanceId, state, 5000);
                 } else {
                     console.log('polling complete');
                     var cssClassed = getCssClassFromStatus(data.instanceState);
                     $parent.find('.componentlistContainer').removeClass().addClass('componentlistContainer').addClass(cssClassed.ringClass);
                     $parent.find('.instance-state').removeClass().addClass('instance-state').addClass(cssClassed.textClass).html(data.instanceState);
                     $('.instancestatusindicator[data-instanceId="' + instanceId + '"]').removeClass().addClass('instancestatusindicator').addClass(cssClassed.tableViewStatusClass);
                     $parent.find('.instance-details-id strong').html(data.instanceIP).attr('instanceip', data.instanceIP);
                     $('tr[data-instanceId="' + instanceId + '"] td.instanceIPCol').html(data.instanceIP);
                 }
             }
         })
     }, delay);
 }

 //Checking the condition for Start and Stop of Instance.
 var startStopInstanceHandler = function(e) {
     if ($(this).hasClass('isStopedInstance')) {
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



 //Updating the Instance Runlist
 var instanceUpdateRunlistHandler = function(e) {
     if ($(this).hasClass('isStopedInstance')) {
         return false;
     }
     var $this = $(this);
     //alert($this);
     var instanceId = $this.attr('data-instanceId');
     //alert(instanceId);
     var chefServerId = $this.attr('data-chefServerId');
     //alert(chefServerId);
     var runlist = $this.data('runlist');
     console.log("runlist", runlist);
     var $chefRunModalContainer = $('#chefRunModalContainer');

     var $ccrs = $chefCookbookRoleSelector(urlParams.org, function(data) {

     }, runlist);
     $ccrs.find('.deploymentSelectedRunList').attr('data-instanceid', instanceId);



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

     //Showing the log for Instances
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
                 var $table = $('<table></table>');

                 for (var i = 0; i < data.length; i++) {
                     var $rowDiv = $('<tr class="row rowSpacing"></tr>');
                     var timeString = new Date().setTime(data[i].timestamp);
                     var date = new Date(timeString).toLocaleString(); //converts to human readable strings
                     /*$rowDiv.append($('<div class="col-lg-4 col-sm-4"></div>').append('<div>' + date + '</div>'));*/

                     if (data[i].err) {
                         $rowDiv.append($('<td class="col-lg-12 col-sm-12" style="color:red;"></td>').append('<span class="textLogs">' + date + '</span>' + '&nbsp;&nbsp;&nbsp;' + '<span>' + data[i].log + '</span>'));
                     } else {
                         $rowDiv.append($('<td class="col-lg-12 col-sm-12" style="color:DarkBlue;"></td>').append('<span class="textLogs">' + date + '</span>' + '&nbsp;&nbsp;&nbsp;' + '<span>' + data[i].log + '</span>'));
                     }

                     $table.append($rowDiv);
                     //$table.append('<hr/>');

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


 function initializeSSHModelContainer() {
     //emptying ssh container
     $('#modalSSHShellContainer').on('hide.bs.modal', function(e) {
         $('#modalSSHShellContainer').find('#ssh-terminateBtn').click();
         $('#modalSSHShellContainer').find('.modal-body').empty();
     });
 }
 //function for showing the SSH Modal
 function showSSHModal() {
     if ($(this).hasClass('isStopedInstance')) {
         return false;
     }
     var $sshModal = $('#modalSSHShellContainer');
     var instanceId = $(this).attr('data-instanceId');
     $sshModal.find('.modal-body').empty().append('<img class="center-block" style="height:50px;width:50px;margin-top: 10%;margin-bottom: 10%;" src="img/loading.gif" />');
     $sshModal.modal('show');
     $.get('sshShell.html?id=' + instanceId, function(data) {

         $sshModal.find('.modal-body').empty().append(data);
         $sshModal.find('#ssh-instanceId').val(instanceId);
     });
 }

 //adding instance to DOM by Import,Blueprint Launch and Chef-Sync
 function addInstanceToDOM(data) {
     //var dataTable = $('#tableinstanceview').DataTable()
     // TEMP Hack for the multiple cards issue.
     // Import also needs to be fixed as it inserts 2 records in the db..
     var cardTemplate = {
         getItem: function() {
             return '<div class="item"></div>';
         },
         getInstanceList: function() {
             return '<ul class="thumbnails marginleft-40 padding-top-30 list-unstyled instancesList"></ul>';
         },
         getRowContainer: function(data) {
             return '<tr data-instanceId="' + data._id + '" data-blueprintName="' + data.blueprintData.blueprintName + '"></tr>';
         },
         getDomainRoleThumbnail: function() {
             return '<li class="domain-role-thumbnail"></li>';
         },
         getContainer: function() {
             return '<div class="flip-toggle container"></div>';
         },
         getCard: function() {
             return '<div class="card"></div>';
         },
         getFront: function() {
             return '<div class="front"></div>';
         },
         getDomainRoles: function() {
             return '<div class="domain-roles"></div>';
         },
         getDomainRolesCaption: function(conf) {
             return '<div class="domain-roles-caption" data-instanceId="' + conf._id + '"' + 'data-blueprintName="' + conf.blueprintData.blueprintName + '"' + 'data-osType="' + conf.hardware.os + '"></div>';
         },
         getSpanHeadingLeft: function(data) {
             return '<span class="domain-roles-icon" contenteditable="false"><img src="' + data.blueprintData.iconPath + '" style="margin-right:5px;margin-top:-10px;width:27px"/></span>';
         },
         getSpanHeadingMiddle: function(data) {
             return '<span class="cardHeadingTextoverflow" rel="tooltip" data-placement="top" data-original-title="' + data.blueprintData.blueprintName + '">' + data.blueprintData.blueprintName + '</span>';
         },
         getSpanHeadingRight: function(data) {
             return '<span style="float:right"><a rel="tooltip" class="moreInfo" href="javascript:void(0)" data-instanceId="' + data._id + '" data-placement="top" data-original-title="MoreInfo"></a></span>';
         },
         getDomainRolesHeading: function(data) {
             return '<div class="domain-roles-heading">' + this.getSpanHeadingLeft(data) + this.getSpanHeadingMiddle(data) + this.getSpanHeadingRight(data) + '</div>';
         },

         getComponentList: function(data) {
             return '<div class="instance-bootstrap-list"></div>';
         },
         getComponentItem: function(data) {
             return '<span style="overflow:hidden;text-overflow:ellipsis;width:62px;padding-right:0px;" class="instance-details-item">' + '<a class="btn instance-bootstrap-list-faimage" href="javascript:void(0)" rel="tooltip" data-placement="top" data-original-title="ViewAllRunlist">' + '<i class="fa fa-2x fa-exchange txt-color-blue"></i></a></span>';
         },
         getOS: function(data) {
             return '<span class="card_os">' + data.blue + '</span>';
         }

     }



     if (data && data._id) { // instanceId
         var alreadyAddedInCarousel = $(".carousel-inner").find("div[data-instanceid='" + data._id + "']").length;
         if (alreadyAddedInCarousel)
             return;
     }

     var $instanceDataTable = $("#tableinstanceview");
     var $divinstancescardview = $('#divinstancescardview').find('.carousel-inner');
     var $carouselItemContainers = $divinstancescardview.find('.item');
     var $instancesList, $item;


     $item = $(cardTemplate.getItem());
     $instancesList = $(cardTemplate.getInstanceList());

     if (!$carouselItemContainers.length) {
         $item.append($instancesList);
         $divinstancescardview.append($item);
     } else {
         $item = $($carouselItemContainers.get($carouselItemContainers.length - 1));
         $instancesList = $item.find('ul');
         if ($instancesList.children().length === 5) {
             $item = $(cardTemplate.getItem());
             $instancesList = $(cardTemplate.getInstanceList());
             $item.append($instancesList);
             $divinstancescardview.append($item);
         }
     }
     var $rowContainter = $(cardTemplate.getRowContainer(data));
     var $li = $(cardTemplate.getDomainRoleThumbnail(data));
     var $container = $(cardTemplate.getContainer(data));
     var $card = $(cardTemplate.getCard(data));
     var $front = $(cardTemplate.getFront(data));
     var $div = $(cardTemplate.getDomainRoles(data));
     var $divDomainRolesCaption = $(cardTemplate.getDomainRolesCaption(data));
     var $divComponentListContainer, $tdInstanceStatusIndicator, $divComponentListImage, $tableInstanceStatusIndicator;

     $divDomainRolesCaption.append(cardTemplate.getDomainRolesHeading(data) + "<hr>");



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
     var $divComponentList = $(cardTemplate.getComponentList()),
         $divComponentItem = $(cardTemplate.getComponentItem());
     $divComponentItem.click(function(e) {
         var $par = $(this).parents('.flip-toggle');
         $par.find('.tooltip').remove();
         if ($par.length && $par.hasClass('flip')) {
             $par.removeClass('flip');
         } else {
             $par.addClass('flip');
         }
     });


     $divComponentList.append($divComponentItem);
     // $divComponentList.append($('<span class="card_os">'+data.hardware.os+'</span>'));
     $divComponentListContainer.append($divComponentList);
     $divComponentListImage = $('<a class="chefClientRunlistImage actionbuttonChefClientRun"></a>').attr('rel', 'tooltip').attr('data-placement', 'top').attr('data-original-title', 'Chef Client Run').addClass('instance-bootstrap-list-image').attr('data-chefServerId', data.chef.serverId).attr('data-instanceId', data._id);

     //Check if the docker status is succeeded
     if (data.docker != null) {
         var $dockerStatus = $('<img style="width:42px;height:42px;margin-left:32px;" alt="Docker" src="img/galleryIcons/Docker.png">').addClass('dockerenabledinstacne');

         $divComponentListContainer.append($dockerStatus);
     }
     if (data.appUrls && data.appUrls.length) {

         for (var k = 0; k < data.appUrls.length; k++) {
             console.log('adding');
             var $anchor = "<a style='font-size:10px;' class='app.url marginForURL' title='" + data.appUrls[k].name + "' href='" + data.appUrls[k].url + "'' target='_blank' >WSS</a>";
             $divComponentListContainer.append($anchor);
         }
     }


   /*
     if (typeof data.applicationUrl != 'undefined') {
         if (data.applicationUrl != 'http://') {
             var $anchor = "<a style='font-size:10px;' class='app.url marginForURL' title='" + data.applicationUrl + "' href='" + data.applicationUrl + "'' target='_blank' >WSS</a>";
             $divComponentListContainer.append($anchor);
         }
     }
     if (typeof data.applicationUrl1 != 'undefined') {
         if (data.applicationUrl1 != 'http://') {
             var $anchor1 = "<br><a style='margin-left:44px;font-size:10px;margin-top:-10px;' title='" + data.applicationUrl1 + "' class='app.url1 forURL' href='" + data.applicationUrl1 + "'' target='_blank'>AD</a>";
             $divComponentListContainer.append($anchor1);
         }
     }*/

     $rowContainter.append('<td></td>');
     $rowContainter.append('<td><img src="' + data.blueprintData.iconPath + '" style="width:auto;height:30px;" /></td>');


     $rowContainter.append('<td>' + data.blueprintData.blueprintName.toString().substring(0, 15) + '</td>');
     $rowContainter.append('<td class="instanceIPCol">' + data.instanceIP + '</td>');
     var $tableRunlistDiv = $('<div></div>'); /*.append('<span>'+data.runlist.join()+'</span>');*/

     var $viewAllA;
     //alert(data.runlist);
     if (data.runlist.length) {
         $viewAllA = $('<a></a>').attr('href', 'javascript:void(0)').append("View All Runlist");
         $viewAllA.click(function(e) {
             e.preventDefault();
             e.stopPropagation();

             var $modal = $('#modalTableRunlist');
             var $modalBody = $('#modalTableRunlist .modal-body').empty();
             var runlist = $(this).parents('tr').find('.instance-bootstrap-list-image').data('runlist');
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
         $viewAllA = $('<span></span>').append("View All Runlist");
     }
     var $divComponentItem = $('<span title="View all runlist" style="overflow:hidden;text-overflow:ellipsis;width:111px;"></span>').addClass('instance-details-item').append($viewAllA);
     $tableRunlistDiv.append($divComponentItem);
     $rowContainter.append($('<td></td>').append($tableRunlistDiv));
     $rowContainter.append($tableInstanceStatusIndicator);
     var temp = ($anchor ? $anchor : "") + "" + ($anchor1 ? $anchor1 : "");
     $rowContainter.append('<td>' + temp + '</td>');

     $rowContainter.append('<td><a class="tableMoreInfo moreInfo" data-instanceId="' + data._id + '" href="javascript:void(0)" rel="tooltip" data-placement="top" data-original-title="MoreInfo"></a></td>');

     $divDomainRolesCaption.append($divComponentListContainer);
     var $divInstanceDetails = $('<div></div>')
     var $instanceDetailsList = $('<div></div>').addClass('instance-details-list');
     var $instanceDetailItemId = $('<span></span>').addClass('instance-details-id').html('IP : <strong class="instanceip">' + data.instanceIP + '</strong>');
     //Arab

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


     var $divActionBtnContainer = $('<div style="height:30px;width:152px;"></div>').addClass('instanceActionBtnCtr').attr('data-instanceId', data._id);

     var $divActionChefRunContainer = $('<div></div>').addClass('instance-bootstrap-ActionChefRun').append($divComponentListImage);
     $divActionBtnContainer.append($divActionChefRunContainer);

     var $divActionStartContainer = $('<div class="actionbutton"></div>').addClass('instance-bootstrap-ActionStart').append($('<a href="javascript:void(0)"></a>').addClass('actionbuttonStart instanceActionBtn').attr('data-actionType', 'Start').attr('data-placement', 'top').attr('rel', 'tooltip').attr('data-original-title', 'Start'));
     //$divActionBtnContainer.append($divActionStartContainer);
     if (!data.chef) {
         data.chef = {};
     }
     var $divActionShutdownContainer = $('<div class="actionbutton"></div>').addClass('instance-bootstrap-ActionShutdown').append($('<a href="javascript:void(0)"></a>').addClass('actionbuttonShutdown instanceActionBtn').attr('data-actionType', 'Stop').attr('rel', 'tooltip').attr('data-placement', 'top').attr('data-original-title', 'Stop'));
     //    $divActionBtnContainer.append($divActionShutdownContainer);

     var $divActionSSHContainer = $('<div class="sshBtnContainer actionbutton"></div>').addClass('instance-bootstrap-ActionSSH').append($('<a href="javascript:void(0)" class="sshIcon" data-instanceid="' + data._id + '"></a>').addClass('').attr('data-actionType', 'SSH').attr('rel', 'tooltip').attr('data-placement', 'top').attr('data-original-title', 'SSH'));
     $divActionBtnContainer.append($divActionSSHContainer);
     $divActionBtnContainer.append($divActionStartContainer);
     $divActionBtnContainer.append($divActionShutdownContainer);

     var $back = $('<div></div>').addClass('back card-backflip');
     var $backRunlistContainer = $('<div></div>').addClass('cardBackRunlistContaner');

     var $backdiv = $('<span></span>').addClass('card-backflip-margin');
     var $backdiva = $('<a style="color:#333;"></a>');
     var $backdivai = $('<i></i>').addClass('fa fa-lg fa-fw fa-book txt-color-blue');

     var $backdivaspan = $('<span style="font-size:12px;font-family:Open sans;padding-left:5px;color:#333"></span>').addClass('menu-item-parent').html('Runlists');
     var $backhr = $('<hr>');



     $backdiva.append($backdivai);
     $backdiva.append($backdivaspan);
     $backdiv.append($backdiva);

     $back.append($backdiv);

     for (var j = 0; j < data.runlist.length; j++) {
         var $divComponentItem;

         $divComponentItem = $('<span title="' + data.runlist[j] + '" style="margin-top:8px;overflow:hidden;text-overflow:ellipsis;width:130px;color:#3a87ad"></span>').addClass('instance-details-item').append(data.runlist[j]);
         $backRunlistContainer.append($divComponentItem);
     }

     $back.append($backRunlistContainer);
     $backdiv.append($backhr);


     var $flipbackdivaspanhr = $('<hr>');
     $back.append($flipbackdivaspanhr);
     var $flipbackdivaspan = $('<span style="width:160px;text-align:center;display:block;margin-top:8px"></span>').append($('<a style="color:#333"></a>').attr('href', 'javascript:void(0)').append("Go Back"));
     $flipbackdivaspan.click(function(e) {
         $(this).parents('.flip-toggle').toggleClass('flip');
     });
     $back.append($flipbackdivaspan);

     $divDomainRolesCaption.append($divActionBtnContainer);
     $front.append($div);
     $card.append($front);
     $card.append($back);
     $container.append($card);
     $li.append($container);
     $div.append($divDomainRolesCaption);

     $instancesList.append($li);
     $rowContainter.append('<td>' + $('<div></div>').append($divComponentListImage.clone()).html() + '</td>');
     var $tableActionBtnContainer = $divActionBtnContainer.clone();
     $tableActionBtnContainer.find('.instance-bootstrap-ActionChefRun').remove();
     $rowContainter.append('<td>' + $('<div></div>').append($tableActionBtnContainer).html() + '</td>');

     var dataTable = $instanceDataTable.DataTable();
     dataTable.row.add($rowContainter).draw();




     if (data.instanceState === 'pending' || data.instanceState === 'stopping') {
         pollInstanceState(data._id, data.instanceState, 2000);
         // To be removed from comment later - Vinod
     }



     //handling events

     $rowContainter.find('.instanceActionBtn').click(startStopInstanceHandler);
     $li.find('.instanceActionBtn').click(startStopInstanceHandler);


     $rowContainter.find('.instance-bootstrap-list-image').click(instanceUpdateRunlistHandler).data('runlist', data.runlist);
     $li.find('.instance-bootstrap-list-image').click(instanceUpdateRunlistHandler).data('runlist', data.runlist);

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

     if (data.hardware.os !== 'linux') {
         disableSSHBtn(data._id);
     }

     if (data.instanceState == 'stopped') {
         enableInstanceActionStopBtn(data._id);
     }
     if (data.instanceState == 'running') {
         enableInstanceActionStartBtn(data._id, data.hardware.os);
     }
     if (data.instanceState == 'pending' || data.instanceState == 'stopping') {
         disableInstanceActionBtns(data._id);
     }
     if (data.instanceState == 'unknown') {
         disableInstanceStartStopActionBtns(data._id, data.hardware.os);
     }


     setTimeout(function() {
         var $l = $('#divinstancescardview').find('.active');
         if ($l.length > 1) {
             $l.not(':first').removeClass('active');
         }
     }, 3);
     $('#divinstancescardview .carousel-inner .item').eq(0).addClass('active');
 }


 //enaling the start Button and checking the instanceID & OS-Type
 function enableInstanceActionStartBtn(instanceId, osType) {
     var $cardViewInstanceId = $(".domain-roles-caption[data-instanceId='" + instanceId + "']");
     var $tableViewInstanceId = $("tr[data-instanceId='" + instanceId + "']");
     $cardViewInstanceId.find('.chefClientRunlistImage').removeClass('isStopedInstance').removeClass('actionbuttonChefClientRundisable').addClass('actionbuttonChefClientRun');
     $tableViewInstanceId.find('.chefClientRunlistImage').removeClass('isStopedInstance').removeClass('actionbuttonChefClientRundisable').addClass('actionbuttonChefClientRun');

     if (osType === 'linux') {
         $cardViewInstanceId.find('.instance-bootstrap-ActionSSH a').removeClass('isStopedInstance').removeClass('sshIcondisable').addClass('sshIcon');
         $tableViewInstanceId.find('.instance-bootstrap-ActionSSH a').removeClass('isStopedInstance').removeClass('sshIcondisable').addClass('sshIcon');
     }

     $cardViewInstanceId.find('.instance-bootstrap-ActionShutdown a').removeClass('isStopedInstance').removeClass('actionbuttonShutdowndisable').addClass('actionbuttonShutdown');
     $tableViewInstanceId.find('.instance-bootstrap-ActionShutdown a').removeClass('isStopedInstance').removeClass('actionbuttonShutdowndisable').addClass('actionbuttonShutdown');
     $cardViewInstanceId.find('.instance-bootstrap-ActionStart a').addClass('isStopedInstance').removeClass('actionbuttonStart').addClass('actionbuttonStartdisable');
     $tableViewInstanceId.find('.instance-bootstrap-ActionStart a').addClass('isStopedInstance').removeClass('actionbuttonStart').addClass('actionbuttonStartdisable');
 }

 //enabling the instance action stop button
 function enableInstanceActionStopBtn(instanceId) {
     var $cardViewInstanceId = $(".domain-roles-caption[data-instanceId='" + instanceId + "']");
     var $tableViewInstanceId = $("tr[data-instanceId='" + instanceId + "']");
     $cardViewInstanceId.find('.chefClientRunlistImage').addClass('isStopedInstance').removeClass('actionbuttonChefClientRun').addClass('actionbuttonChefClientRundisable');
     $tableViewInstanceId.find('.chefClientRunlistImage').addClass('isStopedInstance').removeClass('actionbuttonChefClientRun').addClass('actionbuttonChefClientRundisable');
     $cardViewInstanceId.find('.instance-bootstrap-ActionSSH a').addClass('isStopedInstance').removeClass('sshIcon').addClass('sshIcondisable');
     $tableViewInstanceId.find('.instance-bootstrap-ActionSSH a').addClass('isStopedInstance').removeClass('sshIcon').addClass('sshIcondisable');
     $cardViewInstanceId.find('.instance-bootstrap-ActionShutdown a').addClass('isStopedInstance').removeClass('actionbuttonShutdown').addClass('actionbuttonShutdowndisable');
     $tableViewInstanceId.find('.instance-bootstrap-ActionShutdown a').addClass('isStopedInstance').removeClass('actionbuttonShutdown').addClass('actionbuttonShutdowndisable');
     $cardViewInstanceId.find('.instance-bootstrap-ActionStart a').removeClass('isStopedInstance').removeClass('actionbuttonStartdisable').addClass('actionbuttonStart');
     $tableViewInstanceId.find('.instance-bootstrap-ActionStart a').removeClass('isStopedInstance').removeClass('actionbuttonStartdisable').addClass('actionbuttonStart');
 }

 //disabling the instance action buttons
 function disableInstanceActionBtns(instanceId) {
     var $cardViewInstanceId = $(".domain-roles-caption[data-instanceId='" + instanceId + "']");
     var $tableViewInstanceId = $("tr[data-instanceId='" + instanceId + "']");
     $cardViewInstanceId.find('.chefClientRunlistImage').addClass('isStopedInstance').removeClass('actionbuttonChefClientRun').addClass('actionbuttonChefClientRundisable');
     $tableViewInstanceId.find('.chefClientRunlistImage').addClass('isStopedInstance').removeClass('actionbuttonChefClientRun').addClass('actionbuttonChefClientRundisable');
     $cardViewInstanceId.find('.instance-bootstrap-ActionSSH a').addClass('isStopedInstance').removeClass('sshIcon').addClass('sshIcondisable');
     $tableViewInstanceId.find('.instance-bootstrap-ActionSSH a').addClass('isStopedInstance').removeClass('sshIcon').addClass('sshIcondisable');
     $cardViewInstanceId.find('.instance-bootstrap-ActionShutdown a').addClass('isStopedInstance').removeClass('actionbuttonShutdown').addClass('actionbuttonShutdowndisable');
     $tableViewInstanceId.find('.instance-bootstrap-ActionShutdown a').addClass('isStopedInstance').removeClass('actionbuttonShutdown').addClass('actionbuttonShutdowndisable');
     $cardViewInstanceId.find('.instance-bootstrap-ActionStart a').addClass('isStopedInstance').removeClass('actionbuttonStart').addClass('actionbuttonStartdisable');
     $tableViewInstanceId.find('.instance-bootstrap-ActionStart a').addClass('isStopedInstance').removeClass('actionbuttonStart').addClass('actionbuttonStartdisable');
 }

 //disabling the start and stop buttons in the card and table view
 function disableInstanceStartStopActionBtns(instanceId, osType) {
     var $cardViewInstanceId = $(".domain-roles-caption[data-instanceId='" + instanceId + "']");
     var $tableViewInstanceId = $("tr[data-instanceId='" + instanceId + "']");
     $cardViewInstanceId.find('.chefClientRunlistImage').removeClass('isStopedInstance').removeClass('actionbuttonChefClientRundisable').addClass('actionbuttonChefClientRun');
     $tableViewInstanceId.find('.chefClientRunlistImage').removeClass('isStopedInstance').removeClass('actionbuttonChefClientRundisable').addClass('actionbuttonChefClientRun');

     if (osType === 'linux') {
         $cardViewInstanceId.find('.instance-bootstrap-ActionSSH a').removeClass('isStopedInstance').removeClass('sshIcondisable').addClass('sshIcon');
         $tableViewInstanceId.find('.instance-bootstrap-ActionSSH a').removeClass('isStopedInstance').removeClass('sshIcondisable').addClass('sshIcon');
     }

     $cardViewInstanceId.find('.instance-bootstrap-ActionShutdown a').addClass('isStopedInstance').removeClass('actionbuttonShutdown').addClass('actionbuttonShutdowndisable');
     $tableViewInstanceId.find('.instance-bootstrap-ActionShutdown a').addClass('isStopedInstance').removeClass('actionbuttonShutdown').addClass('actionbuttonShutdowndisable');
     $cardViewInstanceId.find('.instance-bootstrap-ActionStart a').addClass('isStopedInstance').removeClass('actionbuttonStart').addClass('actionbuttonStartdisable');
     $tableViewInstanceId.find('.instance-bootstrap-ActionStart a').addClass('isStopedInstance').removeClass('actionbuttonStart').addClass('actionbuttonStartdisable');
 }