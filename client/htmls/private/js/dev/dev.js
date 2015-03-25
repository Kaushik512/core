           //function for showing the tableview and the cardview

          function showHideControl(objID) {
              if (objID) {
                  if (objID == "divinstancescardview" || objID == "defaultViewButton") {
                      $("#divinstancestableview").removeClass("visibleClass").hide();
                      $("#divinstancescardview").addClass("visibleClass").show();
                      $('#defaultViewButton').find('i').removeClass('txt-color-deactive').addClass('txt-color-active');
                      $('#instanceview').find('i').removeClass('txt-color-active').addClass('txt-color-deactive');
                  } else {
                      // $('#tableinstanceview_filter').css('display','none');
                      $("#divinstancestableview").addClass("visibleClass").show();
                      $("#divinstancescardview").removeClass("visibleClass").hide();
                      $('#instanceview').find('i').removeClass('txt-color-deactive').addClass('txt-color-active');
                      $('#defaultViewButton').find('i').removeClass('txt-color-active').addClass('txt-color-deactive');
                  }
              }
          }

           //for disabling the ssh button
          function disableSSHBtn(instanceId) {

              var $cardViewInstanceId = $(".domain-roles-caption[data-instanceId='" + instanceId + "']");
              var $tableViewInstanceId = $("tr[data-instanceId='" + instanceId + "']");
              $cardViewInstanceId.find('.instance-bootstrap-ActionSSH a').addClass('isStopedInstance').removeClass('sshIcon').addClass('sshIcondisable');
              $tableViewInstanceId.find('.instance-bootstrap-ActionSSH a').addClass('isStopedInstance').removeClass('sshIcon').addClass('sshIcondisable');

          }

           //for removing the selected blueprint in the blueprint tab
          function removeSelectedBlueprint() {
              var blueprintId = $('.productdiv1.role-Selected1').attr('data-blueprintid');
              if (blueprintId) {
                  //found now delete
                  bootbox.confirm("Are you sure you would like to remove this blueprint?", function(result) {
                      if (!result) {
                          return;
                      }
                      $.get('/blueprints/delete/' + blueprintId, function(data) {
                          //  alert(data);
                          if (data == 'OK') {
                              var $bcc = $('.productdiv1.role-Selected1').closest('.blueprintContainer');
                              $('.productdiv1.role-Selected1').parent().detach();
                              //Check if the closest bluprintcontainer is empty, if empty then hide it.
                              // alert($bcc.find('.panel-body').children().length);
                              if ($bcc.find('.panel-body').children().length <= 0) {
                                  $bcc.addClass('hidden');
                              }
                          } else
                              alert(data);
                      });
                  });
              } else {
                  alert('Please select a blueprint to remove.');
              }
          }


          $(document).ready(function() {
              /*********************************Instance.js********************/
              /*
            This is the entry method for initialising the instance in Dev.html.
            */

              $('.addNewApp1').click(function() {
              $('#appSeries12').clone().find("input").val("").end().appendTo('.applicationURLContainer:last');
  
              var countApp =$('.applicationURLContainer').length;
                    
              if(countApp===2){
                 $(this).addClass('hidden');
                 return; 
              }

              });


              

              function disableImportLaunch() {
                  var hasIPPermission = false;
                  if (haspermission("instancelaunch", "execute")) {
                      hasIPPermission = true;
                  }
                  if (!hasIPPermission) {
                      $('#ipaddressimport').addClass('hidden');
                      $('.launchBtn').addClass('hidden');
                  }
              }

              function initializeInstance() {
                  bindClick_ipaddressImport();
                  bindClick_instnaceTab();
                  registerModelEventForImportInstance();
                  bindChange_importPemFile();
                  bindSubmit_AddInstance();
                  bindClick_removeInstance();
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
                          title: "Remove Instance",
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
              /*
            Attaching Click Event on IP Address Import, which will reset instance form.
            */
              function bindClick_ipaddressImport() {

                  $('#ipaddressimport').click(function(e) {
                      var hasChefServerPermission = false;
                      if (haspermission("chefserver", "read")) {
                          hasChefServerPermission = true;
                      }
                      if (!hasChefServerPermission) {
                          bootbox.alert('Please add a Chef Server');
                          return false;
                      }
                      var appURLContainer =$('.applicationURLContainer').length;
                      if(appURLContainer >1){
                        $('.applicationURLContainer:last').remove();
                        $('.addNewApp1').removeClass('hidden');
                      }
                      $('#nodeimportipresultmsg').addClass("hidden");
                      $('#addInstanceForm').trigger("reset");
                      $('#pemFileDropdown').change();
                      $('#importinstanceOS').change();

                  });
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
                              splitBread = DummyBreadCrumb.split('>');
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
                      var appUrls = [];
                      var $appURLContainers = $('.applicationURLContainer');
                      $appURLContainers.each(function() {
                          $this = $(this);
                          var appName = $this.find('.appName').val();
                          var appURL = $this.find('.appURL').val();
                          if (appName && appURL) {
                              appUrls.push({
                                  name: appName,
                                  url: appURL
                              });
                          }

                      });
                      reqBody.appUrls = appUrls;


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
                                  if (jxhr.status === 401)
                                      $result.html("Inssuficient permission to perform operation.");
                                  else
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
                      var perm = haspermission('instancelaunch', 'execute');
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
                          if (sessionUser.cn) {
                              if (keys[0] == sessionUser.cn)
                                  $option.attr('selected', 'selected');
                          }
                          $importbyipuserListSelect.append($option);
                      }
                      $loadingContainer.hide();
                      $importbyipuserListSelect.show();
                  }).error(function() {
                      $loadingContainer.empty().append('Unable to load users. Please try again later.');
                  });
              }

              function createInstanceUI(data) {
                  //alert('starting');

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
                              if ($newSelectedRowPre && $newSelectedRowPre.length == 1) {
                                  $newSelectedRowPre.addClass('rowcustomselected');
                                  $selectedRow.removeClass('rowcustomselected');
                              }
                              break;
                          case 40: // DOWN arrow
                              var $newSelectedRowNext = $selectedRow.next();
                              if ($newSelectedRowNext && $newSelectedRowNext.length == 1) {
                                  $newSelectedRowNext.addClass('rowcustomselected');
                                  $selectedRow.removeClass('rowcustomselected');
                              }
                              break;
                      }
                  }
                  document.onkeydown = tableupdownRow;
                  $('#tableinstanceview tbody').on('click', 'tr', function() {
                      if ($(this).hasClass('rowcustomselected')) {} else {
                          tableinstanceview.$('tr').removeClass('rowcustomselected');
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

                  var timeout = setTimeout(function() {
                      $.get('../instances/' + instanceId, function(data) {
                          var title = '';
                          if (data) {
                              title = data.instanceState == "running" ? "Stop" : data.instanceState == "stopped" ? "Start" : "";
                              $('[instanceID="' + data._id + '"]').removeClass('stopped running pending stopping unknown').addClass(data.instanceState).attr('data-original-title', title);
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
                                  var $parent = $('.domain-roles-caption[data-instanceId="' + instanceId + '"]');
                                  $parent.find('[instanceID="' + data._id + '"]').removeClass('stopped running pending stopping unknown').addClass(data.instanceState);
                                  var cssClassed = getCssClassFromStatus(data.instanceState);
                                  $parent.find('.componentlistContainer').removeClass().addClass('componentlistContainer').addClass(cssClassed.ringClass);
                                  $parent.find('.instance-state').removeClass().addClass('instance-state').addClass(cssClassed.textClass).html(data.instanceState);
                                  $('.instancestatusindicator[data-instanceId="' + instanceId + '"]').removeClass().addClass('instancestatusindicator').addClass(cssClassed.tableViewStatusClass);
                                  $parent.find('.instance-details-id strong').html(data.instanceIP).attr('instanceip', data.instanceIP);
                                  $('tr[data-instanceId="' + instanceId + '"] td.instanceIPCol').html(data.instanceIP);

                              }
                          }
                      });
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
                      var hasStopPermission = false;
                      if (haspermission("instancestop", "execute")) {
                          hasStopPermission = true;
                      }
                      if (!hasStopPermission) {
                          bootbox.alert('User has No Permission to Stop');
                          return;
                      }
                      bootbox.confirm(type + " instance?", function(result) {
                          if (!result) {
                              return;
                          }
                          makeRequest(url);
                      });
                  } else {
                      makeRequest(url);
                  }
              };



              //Updating the Instance Runlist
              var instanceUpdateRunlistHandler = function(e) {
                  if ($(this).hasClass('isStopedInstance')) {
                      return false;
                  }
                  var hasChefRunPermission = false;
                  if (haspermission("instancechefclientrun", "execute")) {
                      hasChefRunPermission = true;
                  }
                  if (!hasChefRunPermission) {
                      $('.btnUpdateInstanceRunlist').addClass('disabled');
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
                  var readMode = false;
                  if (localStorage.getItem('userRole') === '[Consumer]') {
                      readMode = true;
                  }
                  var $ccrs = $chefCookbookRoleSelector(urlParams.org, function(data) {

                  }, runlist, readMode);
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


              //emptying ssh container
              $('#modalSSHShellContainer').on('hide.bs.modal', function(e) {
                  $('#modalSSHShellContainer').find('#ssh-terminateBtn').click();
                  $('#modalSSHShellContainer').find('.modal-body').empty();
              });

              //function for showing the SSH Modal
              function showSSHModal() {
                  if ($(this).hasClass('isStopedInstance')) {
                      return false;
                  }
                  var hasConnectPermission = false;
                  if (haspermission("instanceconnect", "execute")) {
                      hasConnectPermission = true;
                  }
                  if (!hasConnectPermission) {
                      bootbox.alert('User has no permission to do SSH');
                      return;
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
                  console.log(data);
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
                          return '<span style="float:left;margin-top:4px;margin-left:8px;"><a rel="tooltip" class="moreInfo" href="javascript:void(0)" data-instanceId="' + data._id + '" data-placement="top" data-original-title="MoreInfo"></a></span>';
                      },
                      getDomainRolesHeading: function(data) {
                          return '<div class="domain-roles-heading">' + this.getSpanHeadingLeft(data) + this.getSpanHeadingMiddle(data) + this.getOS(data) + '</div>';
                      },

                      getComponentList: function(data) {
                          return '<div class="instance-bootstrap-list"></div>';
                      },
                      getComponentItem: function(data) {
                          return '<span style="overflow:hidden;text-overflow:ellipsis;width:62px;padding-right:0px;" class="instance-details-item">' + '<a class="btn instance-bootstrap-list-faimage" href="javascript:void(0)" rel="tooltip" data-placement="top" data-original-title="ViewAllRunlist">' + '<i class="fa fa-2x fa-exchange txt-color-blue"></i></a></span>';
                      },
                      getOS: function(data) {
                          var basePath = 'img/osIcons/',
                              imgPath, title = '';
                          console.log(data.hardware.os + ' :: OS ::' + data.hardware.platform.toLowerCase())
                          switch (data.hardware.platform.toLowerCase()) {
                              case "window 2008":
                                  imgPath = 'windows.png';
                                  break;
                              case "centos":
                                  imgPath = 'centos.png';
                                  break;
                              case "ubuntu":
                                  imgPath = 'ubuntu.png';
                                  break;
                              default:
                                  imgPath = 'unknown.png';
                          }
                          title = data.hardware.platform;
                          if (imgPath === "unknown.png") {
                              if (data.hardware.os.toLowerCase() === "linux") {
                                  imgPath = "linux.png";
                                  title = data.hardware.os;

                              } else if (data.hardware.os.toLowerCase().indexOf('window') > -1) {
                                  imgPath = "windows.png";
                                  title = data.hardware.os;

                              }

                          }
                          return '<span class="card_os" style="float:right;"><img src="' + basePath + imgPath + '" height="25" width="25" data-placement="top" data-original-title="' + title.capitalizeFirstLetter() + '" rel="tooltip"/></span>'
                      },
                      getStart: function(data) {
                          return '<div class="actionbutton instance-bootstrap-ActionStart" style="display:none !important;" ><a href="javascript:void(0)" class="actionbuttonStart instanceActionBtn" data-actionType="Start" data-placement="top" rel="tooltip" data-original-title="Start"></a></div>';

                      },
                      getStop: function(data) {
                          $('<div class="actionbutton" style="display:none !important;"></div>').addClass('instance-bootstrap-ActionShutdown').append($('<a href="javascript:void(0)"></a>').addClass('actionbuttonShutdown instanceActionBtn').attr('data-actionType', 'Stop').attr('rel', 'tooltip').attr('data-placement', 'top').attr('data-original-title', 'Stop'));

                      },
                      getStartStopToggler: function(data) {
                          var title = data.instanceState == "running" ? "Stop" : data.instanceState == "stopped" ? "Start" : "";
                          return '<div class="startstoptoggler ' + data.instanceState + '" instanceID="' + data._id + '" style="float:left;margin-left:14px;margin-top:4px;" data-placement="top" data-original-title="' + title + '" rel="tooltip"></div>'
                      },
                      getContainerForActionButtons: function(data) {
                          return '<div style="height:30px;width:152px;" class="instanceActionBtnCtr" data-instanceId="' + data._id + '"></div>';
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
                  //$divComponentList.append($(cardTemplate.getOS()));
                  $divComponentListContainer.append($divComponentList);
                  $divComponentListImage = $('<a class="chefClientRunlistImage actionbuttonChefClientRun"></a>').attr('rel', 'tooltip').attr('data-placement', 'top').attr('data-original-title', 'Chef Client Run').addClass('instance-bootstrap-list-image').attr('data-chefServerId', data.chef.serverId).attr('data-instanceId', data._id);

                  //Check if the docker status is succeeded
                  if (data.docker != null) {
                      var $dockerStatus = $('<img style="width:42px;height:42px;margin-left:32px;" alt="Docker" src="img/galleryIcons/Docker.png">').addClass('dockerenabledinstacne');

                      $divComponentListContainer.append($dockerStatus);
                  }






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

                  var temp = '';
                  if (data.appUrls && data.appUrls.length) {
                      for (var k = 0; k < data.appUrls.length; k++) {
                          var url = data.appUrls[k].url;
                          url = url.replace('$host', data.instanceIP);
                          var $anchor = "<a style='font-size:10px;' class='app.url marginForURL' title='" + data.appUrls[k].name + "' href='" + url + "'' target='_blank' >" + data.appUrls[k].name + "</a>";
                          $divComponentListContainer.append($anchor);
                          temp = temp + ' ' + $anchor;
                      }
                  }

                  $rowContainter.append('<td>' + temp + '</td>');

                  $rowContainter.append('<td><a class="tableMoreInfo moreInfo" data-instanceId="' + data._id + '" href="javascript:void(0)" rel="tooltip" data-placement="top" data-original-title="MoreInfo"></a></td>');

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

                      var timeout = setTimeout(function() {
                          $.get('../instances/' + instanceId, function(data) {
                              var title = '';
                              if (data) {
                                  title = data.instanceState == "running" ? "Stop" : data.instanceState == "stopped" ? "Start" : "";
                                  $('[instanceID="' + data._id + '"]').removeClass('stopped running pending stopping unknown').addClass(data.instanceState).attr('data-original-title', title);
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
                                      var $parent = $('.domain-roles-caption[data-instanceId="' + instanceId + '"]');
                                      $parent.find('[instanceID="' + data._id + '"]').removeClass('stopped running pending stopping unknown').addClass(data.instanceState);
                                      var cssClassed = getCssClassFromStatus(data.instanceState);
                                      $parent.find('.componentlistContainer').removeClass().addClass('componentlistContainer').addClass(cssClassed.ringClass);
                                      $parent.find('.instance-state').removeClass().addClass('instance-state').addClass(cssClassed.textClass).html(data.instanceState);
                                      $('.instancestatusindicator[data-instanceId="' + instanceId + '"]').removeClass().addClass('instancestatusindicator').addClass(cssClassed.tableViewStatusClass);
                                      $parent.find('.instance-details-id strong').html(data.instanceIP).attr('instanceip', data.instanceIP);
                                      $('tr[data-instanceId="' + instanceId + '"] td.instanceIPCol').html(data.instanceIP);

                                  }
                              }
                          });
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
                      if (type === 'Start') {
                          var hasStartPermission = false;
                          if (haspermission("instancestart", "execute")) {
                              hasStartPermission = true;
                          }
                          if (!hasStartPermission) {
                              bootbox.alert('User Has No Permission to Start an Instance').find('.bootbox-body').addClass('bootboxMODAL');
                              return;
                          }
                      }
                      if (type === 'Stop') {
                          var hasStopPermission = false;
                          if (haspermission("instancestop", "execute")) {
                              hasStopPermission = true;
                          }
                          if (!hasStopPermission) {
                              bootbox.alert('User has No Permission to Stop an Instance').find('.bootbox-body').addClass('bootboxMODAL');
                              return;
                          }
                          bootbox.confirm(type + " instance?", function(result) {
                              if (!result) {
                                  return;
                              }
                              makeRequest(url);
                          });
                      } else {
                          makeRequest(url);
                      }
                  };


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

                  $divDomainRolesCaption.append([$divInstanceDetails, $('<hr>')]);

                  //   $divDomainRolesCaption.append($('<hr>'));


                  var $divActionBtnContainer = $(cardTemplate.getContainerForActionButtons(data));

                  var $divActionChefRunContainer = $('<div></div>').addClass('instance-bootstrap-ActionChefRun devTOP').append($divComponentListImage);
                  $divActionBtnContainer.append($divActionChefRunContainer);

                  var $divActionStartContainer = $('<div class="actionbutton" style="display:none !important;"></div>').addClass('instance-bootstrap-ActionStart').append($('<a href="javascript:void(0)"></a>').addClass('actionbuttonStart instanceActionBtn').attr('data-actionType', 'Start').attr('data-placement', 'top').attr('rel', 'tooltip').attr('data-original-title', 'Start'));

                  if (!data.chef) {
                      data.chef = {};
                  }
                  var $divActionShutdownContainer = $('<div class="actionbutton" style="display:none !important;"></div>').addClass('instance-bootstrap-ActionShutdown').append($('<a href="javascript:void(0)"></a>').addClass('actionbuttonShutdown instanceActionBtn').attr('data-actionType', 'Stop').attr('rel', 'tooltip').attr('data-placement', 'top').attr('data-original-title', 'Stop'));




                  var $divActionSSHContainer = $('<div class="sshBtnContainer actionbutton"></div>').addClass('instance-bootstrap-ActionSSH').append($('<a href="javascript:void(0)" class="sshIcon devTOP" data-instanceid="' + data._id + '"></a>').attr('data-actionType', 'SSH').attr('rel', 'tooltip').attr('data-placement', 'top').attr('data-original-title', 'SSH'));
                  var $startStopToggler = $(cardTemplate.getStartStopToggler(data));

                  $divActionBtnContainer.append([$divActionSSHContainer, $divActionStartContainer, $divActionShutdownContainer, $startStopToggler, cardTemplate.getSpanHeadingRight(data)]);
                  //  $divActionBtnContainer.append($divActionSSHContainer);
                  //  $divActionBtnContainer.append($divActionStartContainer);

                  // $divActionBtnContainer.append($startStopToggler);

                  //  $divActionBtnContainer.append(cardTemplate.getSpanHeadingRight(data));
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
                  var $tableActionBtnContainer = $divActionBtnContainer.clone();

                  $divDomainRolesCaption.append($divActionBtnContainer);
                  $front.append($div);
                  $card.append([$front, $back]);
                  // $card.append($front);
                  //$card.append($back);
                  $container.append($card);
                  $li.append($container);
                  $div.append($divDomainRolesCaption);

                  $instancesList.append($li);
                  $rowContainter.append('<td>' + $('<div></div>').append($divComponentListImage.clone()).html() + '</td>'); //appending chef client feature

                  $tableActionBtnContainer.find('.moreInfo').remove();
                  $tableActionBtnContainer.find('.instance-bootstrap-ActionChefRun').remove();
                  //$tableActionBtnContainer.append()
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
                  // alert($tableActionBtnContainer.find('.startstoptoggler').length);
                  //var allClass='stopped running pending unknown', addClass='';
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
                  $startStopToggler.click(startAndStopToggler);
                  $rowContainter.find('.startstoptoggler').off('click').on('click', startAndStopToggler);

                  setTimeout(function() {
                      var $l = $('#divinstancescardview').find('.active');
                      if ($l.length > 1) {
                          $l.not(':first').removeClass('active');
                      }
                  }, 3);
                  $('#divinstancescardview .carousel-inner .item').eq(0).addClass('active');
              }

              function startAndStopToggler(e) {

                  if ($(this).hasClass('unknown') || $(this).hasClass('pending') || $(this).hasClass('stopping')) {
                      console.log('pending or Unknow State');
                      return false;
                  } else if ($(this).hasClass('running')) {
                      console.log('running State');
                      $(this).parent().find('[data-actionType="Stop"]').trigger('click');

                  } else if ($(this).hasClass('stopped')) {
                      console.log('Stopped State');
                      $(this).parent().find('[data-actionType="Start"]').trigger('click');
                  }
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


              /**************************************Blueprint.js*************************************/

              /*Binding Click events to Blueprints*/

              function initializeBluePrints() {
                  bindClick_bluePrintTab();
                  bindClick_LaunchBtn();
                  bindClick_bluePrintUpdate();
                  bindClick_updateInstanceRunList();
              }

              //setting the breadcrumb when the user clicks on the blueprint tab
              function bindClick_bluePrintTab() {

                  $('.Blueprints').click(function(e) {
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
                          DummyBreadCrumb += '>' + 'Blueprints';

                          if (DummyBreadCrumb != null && DummyBreadCrumb != 'undefined') {
                              localStorage.removeItem("breadcrumb");
                              splitBread = DummyBreadCrumb.split('>');
                              if (splitBread.length > 0) {
                                  $('#ribbon').find('.breadcrumb').find('li').detach();
                                  for (var arraycount = 0; arraycount < splitBread.length; arraycount++) {
                                      var liNew = document.createElement('li');
                                      liNew.innerHTML = splitBread[arraycount];
                                      $('#ribbon').find('.breadcrumb').append(liNew);
                                  }
                              }
                          }
                          //$('#ribbon').find('.breadcrumb').append('<li>"'+ DummyBreadCrumb'"</li>');
                          //alert(DummyBreadCrumb);
                      }

                  });


              }

              //Initializing the blueprint area according to the Template-Type and showing
              //the differnt template types whenever a blueprint is added
              function initializeBlueprintArea(data) {

                  var $AppFactpanelBody = $('.appFactoryPanel').find('.panel-body');
                  $AppFactpanelBody.empty();

                  var $devopsRolepanelBody = $('.devopsRolePanel').find('.panel-body');
                  $devopsRolepanelBody.empty();

                  var $desktopProvisioningPanelBody = $('.desktopProvisioningPanel').find('.panel-body');
                  $devopsRolepanelBody.empty();

                  //alert(orgId + "/" + projectId + "/" + envId + data.length);

                  //Displaying the Template Types.
                  $.get("/d4dMasters/readmasterjsonnew/16", function(tdata) {
                      tdata = JSON.parse(tdata);
                      var rowLength = tdata.length;
                      //alert(rowLength);
                      var $containerTemp = "";
                      var selectedrow = false;
                      var getDesignTypeImg;
                      var getDesignTypeRowID;
                      var getDesignTypeName;
                      $('#accordion-2').empty();
                      console.log(tdata);
                      for (var i = 0; i < rowLength; i += 1) {
                          getDesignTypeImg = tdata[i]['designtemplateicon_filename'];
                          getDesignTypeRowID = tdata[i]['rowid'];
                          getDesignTypeName = tdata[i]['templatetypename'];
                          // for (var x = 0; x < tdata.masterjson.rows.row[i].field.length; x++) {
                          //     if (tdata.masterjson.rows.row[i].field[x].name == "rowid") {
                          //         getDesignTypeRowID = tdata.masterjson.rows.row[i].field[x].values.value;
                          //     }
                          //     if (tdata.masterjson.rows.row[i].field[x].name == "designtemplateicon_filename") {
                          //         getDesignTypeImg = tdata.masterjson.rows.row[i].field[x].values.value;

                          //     }
                          //     if (tdata.masterjson.rows.row[i].field[x].name == "templatetypename") {
                          //         getDesignTypeName = tdata.masterjson.rows.row[i].field[x].values.value;

                          //     }
                          // }
                          //Extracting the TT definitions. Add New Template types
                          var $currRolePanel = null;
                          //alert(getDesignTypeName);
                          switch (getDesignTypeName) {
                              case "AppFactory":
                                  $AppFactpanelBody = $('<div class="panel-body AppFactory"></div>');
                                  $currRolePanel = $AppFactpanelBody;
                                  break;
                              case "DevopsRoles":
                                  $DevopsRolespanelBody = $('<div class="panel-body DevopsRoles"></div>');
                                  $currRolePanel = $DevopsRolespanelBody;
                                  break;
                              case "CloudFormation":
                                  $CloudFormationBody = $('<div class="panel-body CloudFormation"></div>');
                                  $currRolePanel = $CloudFormationBody;
                                  break;
                              case "Docker":
                                  $DockerpanelBody = $('<div class="panel-body Docker"></div>');
                                  $currRolePanel = $DockerpanelBody;
                                  break;
                              case "Desktop":
                                  $DesktopProvisioningPanelBody = $('<div class="panel-body Desktop"></div>');
                                  $currRolePanel = $DesktopProvisioningPanelBody;
                                  break;
                              case "Environment":
                                  $EnvironmentpanelBody = $('<div class="panel-body Environment"></div>');
                                  $currRolePanel = $EnvironmentpanelBody;
                                  break;

                          }


                          $containerTemp = '<div class="panel panel-default blueprintContainer hidden">' +
                              '<div class="panel-heading">' +

                          '<h4 class="panel-title">' +
                              '<a href="#collapse' + i + '" data-parent="#accordion-2" data-toggle="collapse" class="collapsed"> ' +
                              '<i class="fa fa-fw fa-plus-circle txt-color-blue"></i> ' +
                              '<i class="fa fa-fw fa-minus-circle txt-color-red"></i>' + getDesignTypeName + '</a>' +
                              '</h4></div><div class="panel-collapse collapse" id="collapse' + i + '">' +
                              '<div class="panel-body ' + getDesignTypeName + '"></div>' +
                              '</div>';
                          // $($containerTemp).find('#collapse' + i).append($currRolePanel);
                          /*if($('#accordion-2').find('#collapse' + i).length > 0){
                     alert('in');
                     $('#accordion-2').find('#collapse' + i).first().append($containerTemp);
                 }*/
                          $('#accordion-2').append($containerTemp);

                      }
                      //To fix template id and template type
                      // alert('in' + data.length);
                      for (var i = 0; i < data.length; i++) {
                          //alert(JSON.stringify(data[i]));
                          //Find a panel-body with the template type class
                          var $currRolePanel = $('#accordion-2').find('.' + data[i].templateType);
                          //   alert($currRolePanel.length);
                          if ($currRolePanel.length > 0) {
                              var $itemContainer = $('<div></div>').addClass("productdiv4");

                              var $itemBody = $('<div></div>').addClass('productdiv1 cardimage').attr('data-blueprintId', data[i]._id).attr('data-projectId', data[i].projectId).attr('data-envId', data[i].envId).attr('data-chefServerId', data[i].chefServerId).attr('data-templateType', data[i].templateType);
                              var $ul = $('<ul></ul>').addClass('list-unstyled system-prop').css({
                                  'text-align': 'center'
                              });
                              var $img
                              if (data[i].iconpath)
                                  $img = $('<img />').attr('src', data[i].iconpath).attr('alt', data[i].name).addClass('cardLogo');
                              else
                                  $img = $('<img />').attr('src', '').attr('alt', data[i].name).addClass('cardLogo');
                              var $liImage = $('<li></li>').append($img);
                              $ul.append($liImage);

                              var $liCardName = $('<li title="' + data[i].name + '"></li>').addClass('Cardtextoverflow').html('<u><b>' + data[i].name + '</b></u>');

                              $ul.append($liCardName);
                              var $selecteditBtnContainer = $('<div style="position:absolute;padding-left:27px;bottom:11px;"></div>');
                              if (data[i].versionsList) {

                                  var $selectVerEdit = $('<a style="padding:0px 4px;margin-left:3px;border-radius:5px;" class="bpEditBtn"><i class="ace-icon fa fa-pencil"></i></a>').addClass('btn btn-primary').attr('rel', 'tooltip').attr('data-placement', 'top').attr('data-original-title', 'Edit');
                                  var $selectVer = null;
                                  var tagLabel = '';
                                  //Docker Check
                                  if (data[i].templateType == "Docker") {
                                      console.log("data[i}" + JSON.stringify(data[i]));
                                      //$selectVer = $('<select style="padding:1px;"></select>').addClass('blueprintVersionDropDown').attr('data-blueprintId', data[i]._id);
                                      $selectVer = $('<select style="padding:1px;margin-right:5px;"></select>').addClass('dockerrepotagselect').attr('data-blueprintId', data[i]._id);
                                      $itemBody.attr('dockerreponame', data[i].dockerreponame);
                                      $itemBody.attr('dockerrepotags', data[i].dockerrepotags);
                                      $itemBody.attr('dockercontainerpaths', data[i].dockercontainerpaths);

                                      if (data[i].dockerlaunchparameters)
                                          $itemBody.attr('dockerlaunchparameters', 't ' + data[i].dockerlaunchparameters);
                                      var $liDockerRepoName = $('<li title="Docker Repo Name" ><i class="fa fa-check-square" style="padding-right:5px"/>' + data[i].dockerreponame + '</li>');
                                      $ul.append($liDockerRepoName);
                                      if (data[i].dockerrepotags && data[i].dockerrepotags != '') {
                                          $selectVer.empty();
                                          var dockerrepostags = data[i].dockerrepotags.split(',');
                                          $.each(dockerrepostags, function(k) {
                                              $selectVer.append('<option value="' + dockerrepostags[k] + '">' + dockerrepostags[k] + '</option>');
                                          });
                                      }

                                      $selectVerEdit.hide();
                                      tagLabel = '<span>Tags&nbsp;</span';
                                      //alert(JSON.stringify(data[i]));
                                  } else {
                                      $selectVer = $('<select style="padding:1px;padding-left:5px;"></select>').addClass('blueprintVersionDropDown').attr('data-blueprintId', data[i]._id);
                                      $selectVerEdit.click(function(e) {

                                          var $parent = $(this).parents('.cardimage');
                                          var $blueprintEditResultContainer = $('#blueprintEditResultContainer');


                                          $blueprintEditResultContainer.modal('show');

                                          var projectId = $parent.attr('data-projectId');
                                          var envId = $parent.attr('data-envId');
                                          var blueprintId = $parent.attr('data-blueprintId');
                                          var chefServerId = $parent.attr('data-chefServerId');
                                          var version = $parent.find('.blueprintVersionDropDown').val();
                                          $.get('../blueprints/' + blueprintId + '/versions/' + version, function(versionData) {
                                              console.log('blueprint data', versionData);
                                              var $ccrs = $chefCookbookRoleSelector(urlParams.org, function(data) {

                                              }, versionData.runlist);
                                              $ccrs.find('.deploymentSelectedRunList').attr('data-blueprintId', blueprintId);
                                              $blueprintEditResultContainer.find('.modal-body').empty().append($ccrs);


                                          }).error(function() {
                                              $blueprintEditResultContainer.find('.modal-body').empty();
                                              $blueprintEditResultContainer.find('.modal-body').append('<span>Oops! Something went wrong. Please try again later</span>');
                                          });

                                      });
                                  }
                                  if (localStorage.getItem('userRole') !== '[Consumer]') {
                                      var $li = $('<li></li>').css({
                                          "font-size": '10px'
                                      }).append(tagLabel, $selectVer, $selectVerEdit);

                                  } else {
                                      var $li = $('<li></li>').css({
                                          "font-size": '10px'
                                      }).append(tagLabel, $selectVer);

                                  }
                                  if ($selectVer.attr('class').indexOf('dockerrepotagselect') < 0) {
                                      for (var j = 0; j < data[i].versionsList.length; j++) {
                                          var $options = $('<option></option>').append(data[i].versionsList[j].ver).val(data[i].versionsList[j].ver);
                                          $selectVer.append($options);
                                      }
                                  }
                                  $selecteditBtnContainer.append($li);

                              }
                              $itemBody.append($ul);
                              $itemBody.append($selecteditBtnContainer);
                              $itemContainer.append($itemBody);

                              //Find the template type container and add to it.
                              //var $currpanel = $('#accordion-2').find('div[".' +  data[i].templateType + '"]').first();
                              //alert($currpanel.length);
                              $currRolePanel.append($itemContainer);
                              //enabling the bluepintContiner div when item added.
                              $currRolePanel.closest('.blueprintContainer').removeClass('hidden');
                              // alert($currRolePanel.html());
                              $currRolePanel.parent().parent().show();
                              //Attaching the selection event.
                              if (i == (data.length - 1)) {
                                  var $productdiv1 = $('.productdiv1');

                                  $productdiv1.click(function(e) {

                                      $productdiv1.removeClass('role-Selected1');
                                      $(this).addClass('role-Selected1');
                                  });
                              }

                          }
                      }

                      // $("#myTabContent3").append(containerTemp);
                      // $("#templateContent #grid0").addClass("role-Selected");
                      if ($('#accordion-2').length > 0) {
                          console.log('object ==>', $('#accordion-2').find('.blueprintContainer:not(.hidden)').first().find('.panel-heading a'));
                          $('#accordion-2').find('.blueprintContainer:not(.hidden)').first().find('.panel-heading a').click();
                      }
                      pageSetUp();
                  }); //end of readmasterjson to be pushed to the end of the function.

                  $('#accordion-2').on('show.bs.collapse', function(e) {
                      console.log(e.target);
                      $(e.target).find('.productdiv1').first().click();
                  });
                  //Expanding the fist Accordion.
              };

              //removig blueprints from blueprints tab
              /*
            function removeSelectedBlueprint() {
                var blueprintId = $('.productdiv1.role-Selected1').attr('data-blueprintid');
                if (blueprintId) {
                    //found now delete
                    bootbox.confirm("Are you sure you would like to remove this blueprint?", function(result) {
                        if (!result) {
                            return;
                        }
                        $.get('/blueprints/delete/' + blueprintId, function(data) {
                            //  alert(data);
                            if (data == 'OK') {
                                var $bcc = $('.productdiv1.role-Selected1').closest('.blueprintContainer');
                                $('.productdiv1.role-Selected1').parent().detach();
                                //Check if the closest bluprintcontainer is empty, if empty then hide it.
                                // alert($bcc.find('.panel-body').children().length);
                                if ($bcc.find('.panel-body').children().length <= 0) {
                                    $bcc.addClass('hidden');
                                }
                            } else
                                alert(data);
                        });
                    });
                } else {
                    alert('Please select a blueprint to remove.');
                }
            }*/

              //Launching Blueprints when the user clicks on the launch button in blueprints tab
              function bindClick_LaunchBtn() {

                  $('.launchBtn').click(function(e) {
                      $('#commentForm')[0].reset();
                      $('#Removeonexitfield').change();
                      var $selectedItems = $('.role-Selected1');
                      if (!$selectedItems.length) {
                          return;
                      }
                      if ($selectedItems.attr('data-templateType') === 'desktopProvisioning') {
                          var $modalDesktopProvisioning = $('#modalDesktopProvisioningLaunch');
                          var blueprintId = $selectedItems.attr('data-blueprintId');
                          var version = $selectedItems.find('.blueprintVersionDropDown').val();
                          $modalDesktopProvisioning.data('blueprintId', blueprintId);
                          $modalDesktopProvisioning.data('blueprintVersion', version);
                          $modalDesktopProvisioning.modal('show');
                          return;
                      }
                      if ($selectedItems.attr('data-templateType') === 'Docker') {
                          var cardCount = $('.instancesList').find('.componentlistContainer:not(.stopped)').length;

                          if (cardCount === 0) {
                              bootbox.alert('No instances available.Kindly Launch one instance');
                              return;
                          }
                          loadLaunchParams();
                          var $launchDockerInstanceSelector = $('#launchDockerInstanceSelector');
                          var blueprintId = $selectedItems.attr('data-blueprintId');
                          var dockerreponame = $selectedItems.attr('dockerreponame');
                          $launchDockerInstanceSelector.data('blueprintId', blueprintId);
                          //  $launchDockerInstanceSelector.data('blueprintId',blueprintId);



                          $('#dockerinstancesselctorview').empty().append('<span><div class=\"modal-body\"><div><div class=\"row\"><div style=\"color:;\" class=\"col-lg-12 col-sm-12\ dockerinstances"></div></div></div></div></div></span>');
                          var $newinstancetable = $("<table></table>").append("<thead><tr><td>Instance Name</td><td>IP Address</td><td>Log Info</td><td class='hidden'>Add Docker Engine</td></tr></thead>");
                          var $newinstancetbody = $('<tbody></tbody>');
                          $newinstancetable.append($newinstancetbody);
                          var $instancetable = $('#tableinstanceview').clone();
                          $instancetable.find('tbody tr').each(function() {
                              var $newinstancetr = $("<tr><tr>");
                              $(this).find('td').each(function(k, v) {
                                  $newinstancetr.append('<td>' + v + $(this).html() + '</td>');
                              });
                              $newinstancetbody.append($newinstancetr);
                          });

                          $instancetable.attr('id', 'dockerintsancestab');
                          $('.dockerinstances').first().append($instancetable);

                          $('#dockerintsancestab thead td').each(function(k, v) {
                              if (k > 3)
                                  $(this).detach();
                          });
                          $('#dockerintsancestab thead').append('<td>Log Info</td>');
                          $('#dockerintsancestab thead tr').append('<td class="hidden" title="Select to add a docker engine">Add Engine</td>');
                          $('#dockerintsancestab tbody tr').each(function(k, v) {

                              $(this).removeClass('rowcustomselected');
                              $(this).click(function() {
                                  $('#dockerintsancestab tbody tr').removeClass('rowcustomselected');
                                  $(this).addClass('rowcustomselected');
                              });
                              $(this).find('td').each(function(k1, v1) {
                                  if (k1 > 3)
                                      $(this).detach();
                                  //inserting a checkbox to select instance
                                  if (k1 == 0) {
                                      $(this).prepend('<input type="checkbox" class="instanceselectedfordocker">&nbsp;');
                                  }
                              });
                              $(this).append('<td  class=""><a data-original-title="MoreInfo" data-placement="top" rel="tooltip" href="javascript:void(0)" data-instanceid="' + $(this).attr('data-instanceid') + '" class="tableMoreInfo moreInfo dockerLeft" stlye=></a></td>');
                              $(this).append('<td  class="hidden"><input type="checkbox"></td>');
                              $(this).find('.moreInfo').click(instanceLogsHandler);
                          });
                          $('.launchdockerinstance').click(function() {
                              $launchResultContainer.find('.modal-body').empty().append('<span><div class=\"modal-body\"><div><h3 class=\"alert alert-success\"><b>Congratulations!</b> Blueprint Launched Successfully !!!</h3>Instance Id : 5460690c6e5c99913e37d0e4<br>Instance Logs :- </div><div class=\"logsAreaBootstrap\"><div><div class=\"row\"><div style=\"color:white;\" class=\"col-lg-12 col-sm-12\"><span>Starting instance</span></div></div></div></div></div></span>');
                              $('#myModalLabel').first().html('Launching Blueprint');

                          });
                          $('#dockerInstanceSelectionTitle').empty().append('Select Instances to pull  "' + dockerreponame + '" into');
                          $launchDockerInstanceSelector.modal('show');
                          $('#rootwizard').find("a[href*='tab1']").trigger('click'); //showing first tab.
                          $('#dockerintsancestab thead').empty().append('<tr><td>Select Instance</td><td>Logo</td><td>Instance Name</td><td>IP Address</td><td>Log</td><td  class="hidden">Add Docker Engine</td></tr>');
                          $('#dockerintsancestab').dataTable({
                              "bPaginate": false
                          });
                          return;
                      }


                      var $launchResultContainer = $('#launchResultContainer');
                      $launchResultContainer.find('.modal-body').empty().append('<img class="center-block" style="height:50px;width:50px;margin-top: 10%;margin-bottom: 10%;" src="img/loading.gif" />');
                      $launchResultContainer.find('.modal-title').html('Launching Blueprint');
                      $launchResultContainer.modal('show');
                      if($selectedItems.length) {
                          var projectId = $($selectedItems.get(0)).attr('data-projectId');
                          var envId = $($selectedItems.get(0)).attr('data-envId');
                          var blueprintId = $($selectedItems.get(0)).attr('data-blueprintId');
                          var version = $($selectedItems.get(0)).find('.blueprintVersionDropDown').val();
                          // alert('launching -> ' +'../blueprints/' + blueprintId + '/launch?version=' + version);
                          $.get('/blueprints/' + blueprintId + '/launch?version=' + version, function(data) {

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
                                  var url = '../instances/' + instanceId + '/logs';
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

                              $.get('../instances/' + data.id, function(data) {
                                  $('#tabInstanceStatus').hide();
                                  addInstanceToDOM(data);
                                  // serachBoxInInstance.updateData(data,"add",undefined);

                              });


                          }).error(function() {
                              $launchResultContainer.find('.modal-body').empty().append('<span>Oops!!! Something went wrong. Please try again later</span>');
                          });
                      }
                  });

              }

              //Updating blueprints
              function bindClick_bluePrintUpdate() {
                  $('.blueprintUpdateBtn').click(function(e) {

                      var $blueprintEditResultContainer = $('#blueprintEditResultContainer');
                      var $selectedRunlist = $blueprintEditResultContainer.find('.deploymentSelectedRunList');
                      var blueprintId = $selectedRunlist.attr('data-blueprintId');
                      if (blueprintId) {
                          var runlist = [];
                          var $inputs = $selectedRunlist.find('input');
                          $inputs.each(function() {
                              runlist.push($(this).val());
                          });

                          var blueprintData = {
                              runlist: runlist,
                              expirationDays: 0,
                          };

                          $.post('../blueprints/' + blueprintId + '/update', {
                              blueprintUpdateData: blueprintData
                          }, function(data) {
                              $('.blueprintVersionDropDown[data-blueprintId="' + blueprintId + '"]').append($('<option value="' + data.version + '">' + data.version + '</option>').attr('selected', true));
                              console.log(data);
                              $blueprintEditResultContainer.modal('hide');
                          });

                      }
                  });
              }

              //Updating the blueprint Runlist
              function bindClick_updateInstanceRunList() {
                  // Blueprint runtlist updation
                  $('.btnUpdateInstanceRunlist').click(function(e) {
                      bootbox.confirm("Update runlist?", function(result) {
                          if (!result) {
                              return;
                          }
                          $chefRunModalContainer = $('#chefRunModalContainer');
                          var $selectedRunlist = $chefRunModalContainer.find('.deploymentSelectedRunList');
                          var instanceId = $selectedRunlist.attr('data-instanceId');

                          var runlist = [];
                          var $inputs = $selectedRunlist.find('input');
                          $inputs.each(function() {
                              runlist.push($(this).val());
                          });
                          if (!runlist.length) {
                              bootbox.alert('Runlist is empty');
                              return;
                          }


                          console.log(runlist);
                          $.post('../instances/' + instanceId + '/updateRunlist', {
                              runlist: runlist
                          }, function(data) {
                              $chefRunModalContainer.modal('hide');
                              var $parent = $('.domain-roles-caption[data-instanceId="' + instanceId + '"]');
                              var $parentTr = $('#tableinstanceview tr[data-instanceId="' + instanceId + '"]');
                              //console.log($('.domain-roles-caption[data-instanceId="' + instanceId + '"]'), $parent.find('.instance-bootstrap-list-image'));
                              $parent.find('.instance-bootstrap-list-image').data('runlist', runlist);
                              var $backRunlistContainer = $parent.parents('.card').find('.cardBackRunlistContaner').empty();
                              for (var j = 0; j < runlist.length; j++) {
                                  var $divComponentItem;

                                  $divComponentItem = $('<span title="' + runlist[j] + '" style="margin-top:8px;overflow:hidden;text-overflow:ellipsis;width:130px;color:#3a87ad"></span>').addClass('instance-details-item').append(runlist[j]);
                                  $backRunlistContainer.append($divComponentItem);
                              }

                              $parentTr.find('.instance-bootstrap-list-image').data('runlist', runlist);
                              $parent.find('.moreInfo').trigger('click');
                              console.log(data);
                          }).fail(function(jxObj) {
                              if (jxObj.status == '401')
                                  bootbox.alert('Inssuficient permission to perform operation.');
                          });
                      });


                  });
              }

              /*********************************************Orchestration.js*************************************/
              /*Binding Click events to Orchestration and showing the breadcrumb*/
              function initializingOrchestration() {

                  $('.Orchestration').click(function(e) {
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
                          DummyBreadCrumb += '>' + 'Orchestration';

                          if (DummyBreadCrumb != null && DummyBreadCrumb != 'undefined') {
                              localStorage.removeItem("breadcrumb");
                              splitBread = DummyBreadCrumb.split('>');
                              if (splitBread.length > 0) {
                                  $('#ribbon').find('.breadcrumb').find('li').detach();
                                  for (var arraycount = 0; arraycount < splitBread.length; arraycount++) {
                                      var liNew = document.createElement('li');
                                      liNew.innerHTML = splitBread[arraycount];
                                      $('#ribbon').find('.breadcrumb').append(liNew);
                                  }
                              }
                          }
                          //$('#ribbon').find('.breadcrumb').append('<li>"'+ DummyBreadCrumb'"</li>');
                          //alert(DummyBreadCrumb);
                      }

                  });
              }

              /*Initialising the data table in orchestration*/
              function initializeTaskArea(data) {
                  if (!$.fn.dataTable.isDataTable('#tableOrchestration')) {
                      //var $taskListArea = $('.taskListArea').empty();
                      $taskDatatable = $('#tableOrchestration').DataTable({
                          "pagingType": "full_numbers",
                          "aoColumns": [
                              null, {
                                  "bSortable": false
                              }, {
                                  "bSortable": false
                              }, {
                                  "bSortable": false
                              },
                              null, {
                                  "bSortable": false
                              }
                          ]

                      });
                  }


                  for (var i = 0; i < data.length; i++) {
                      var $tr = $('<tr></tr>').attr('data-taskId', data[i]._id);
                      var $tdName = $('<td></td>').append(data[i].name);
                      $tr.append($tdName);

                      if (data[i].taskType === 'chef') {
                          var $tdNodeList = $('<td></td>').append('<a rel="tooltip" data-placement="top" data-original-title="Assigned Nodes" data-toggle="modal" class="btn btn-primary btn-sg tableactionbutton"><i class="ace-icon fa fa-sitemap fa-14x"></i></a>');
                          $tdNodeList.find('a').data('nodeList', data[i].taskConfig.nodeIds).click(function(e) {
                              $.post('../instances/', {
                                  instanceIds: $(this).data('nodeList')
                              }, function(instances) {
                                  var $taskNodeListContainer = $('.taskNodeListContainer').empty();
                                  for (var i = 0; i < instances.length; i++) {
                                      var $tr = $('<tr></tr>').css({
                                          'line-height': '2.1'
                                      });
                                      var $tdInstanceName = $('<td></td>').append(instances[i].chef.chefNodeName).css({
                                          'font-size': '12px'
                                      });
                                      var $tdInstanceIp = $('<td></td>').append(instances[i].instanceIP).css({
                                          'font-size': '12px'
                                      });
                                      var $tdInstanceStatus = $('<td></td>').append(instances[i].instanceState).css({
                                          'font-size': '12px'
                                      });
                                      $tr.append($tdInstanceName).append($tdInstanceIp).append($tdInstanceStatus);
                                      $taskNodeListContainer.append($tr);
                                  }
                                  $('#assignedNode').modal('show');
                              });
                          });
                      } else {
                          var $tdNodeList = $('<td> - </td>')
                      }
                      $tr.append($tdNodeList);
                      if (data[i].taskType === 'chef') {
                          var $tdRunlist = $('<td></td>').append('<a rel="tooltip" data-placement="top" data-original-title="Assigned Runlists" data-toggle="modal" href="#assignedRunlist" class="btn btn-primary btn-sg tableactionbutton"><i class="ace-icon fa fa-list-ul bigger-120"></i></a>');
                          $tdRunlist.find('a').data('taskRunlist', data[i].taskConfig.runlist).click(function(e) {
                              var $taskRunListContainer = $('.taskRunListContainer').empty();
                              var runlist = $(this).data('taskRunlist');
                              if (runlist && runlist.length) {
                                  for (var i = 0; i < runlist.length; i++) {
                                      $li = $('<li></li>').append(runlist[i]).css({
                                          "font-size": "12px"
                                      });
                                      $taskRunListContainer.append($li);
                                  }
                              }
                              $('#assignedRunlist').modal('show');
                          });
                      } else {
                          var $tdRunlist = $('<td> - </td>');
                      }
                      $tr.append($tdRunlist);

                      var $tdExecute = $('<td></td>').append('<a rel="tooltip" data-placement="top" data-original-title="Execute" data-toggle="modal" href="javascript:void(0)" class="btn btn-primary btn-sg tableactionbutton"><i class="ace-icon fa fa-play bigger-120"></i></a>');
                      $tdExecute.find('a').data('taskId', data[i]._id).click(function(e) {
                          var taskId = $(this).data('taskId');
                          var $taskExecuteTabsHeaderContainer = $('#taskExecuteTabsHeader').empty();
                          var $taskExecuteTabsContent = $('#taskExecuteTabsContent').empty();
                          var $modal = $('#assignedExecute');
                          $modal.find('.loadingContainer').show();
                          $modal.find('.errorMsgContainer').hide();
                          $modal.find('.outputArea').hide();
                          $modal.modal('show');
                          $.get('../tasks/' + taskId + '/run', function(data) {
                              var date = new Date().setTime(data.timestamp);
                              var taskTimestamp = new Date(date).toLocaleString(); //converts to human readable strings
                              $('tr[data-taskId="' + taskId + '"] .taskrunTimestamp').html(taskTimestamp);
                              if (data.taskType === 'chef') {
                                  $modal.find('.loadingContainer').hide();
                                  $modal.find('.errorMsgContainer').hide();
                                  $modal.find('.outputArea').show();

                                  var instances = data.instances;
                                  for (var i = 0; i < instances.length; i++) {
                                      var $liHeader = $('<li><a href="#tab_' + instances[i]._id + '" data-toggle="tab" data-taskInstanceId="' + instances[i]._id + '">' + instances[i].chef.chefNodeName + '</a></li>');
                                      if (i === 4) {
                                          var $liMoreHeader = $('<li class="dropdown dropdownlog"><a href="javascript:void(0);" class="dropdown-toggle" data-toggle="dropdown">More... <b class="caret"></b></a><ul class="dropdown-menu"></ul></li>');

                                          $taskExecuteTabsHeaderContainer.append($liMoreHeader);

                                          $taskExecuteTabsHeaderContainer = $liMoreHeader.find('ul');

                                      }

                                      $taskExecuteTabsHeaderContainer.append($liHeader);

                                      var $tabContent = $('<div class="tab-pane fade" id="tab_' + instances[i]._id + '"><div class="taskLogArea" style="height:400px !important;overflow: scroll;padding-left: 20px;"></div></div>');

                                      $taskExecuteTabsContent.append($tabContent);


                                  }
                                  //shown event



                                  $('#taskExecuteTabsHeader').find('a[data-toggle="tab"]').each(function(e) {
                                      $(this).attr('data-taskPolling', 'true');
                                      $(this).attr('data-taskPollLastTimestamp', new Date().getTime());
                                      var tabId = $(this).attr('href')
                                      pollTaskLogs($(this), $(tabId), null, 0, false);
                                      //e.relatedTarget // previous active tab
                                  });

                                  $('#taskExecuteTabsHeader').find('a[data-toggle="tab"]').on('hidden.bs.tab', function(e) {
                                      $(e.target).attr('data-taskPolling', 'true');
                                      //e.relatedTarget // previous active tab
                                  }).first().click();

                                  $('#assignedExecute').modal('show');
                              } else {
                                  var $liHeader = $('<li><a href="#tab_jenkinsTask" data-toggle="tab">Jenkins Job</a></li>');
                                  $taskExecuteTabsHeaderContainer.append($liHeader);
                                  var $tabContent = $('<div class="tab-pane fade" id="tab_jenkinsTask"><div class="taskLogArea" style="height:400px !important;overflow: scroll;padding-left: 20px;"></div></div>');
                                  $taskExecuteTabsContent.append($tabContent);

                                  function pollJob() {
                                      $.get('../jenkins/' + data.jenkinsServerId + '/jobs/' + data.jobName, function(job) {
                                          console.log(job.lastBuild.number);
                                          console.log(data.lastBuildNumber);
                                          if (job.lastBuild.number > data.lastBuildNumber) {
                                              $modal.find('.loadingContainer').hide();
                                              $modal.find('.errorMsgContainer').hide();
                                              $modal.find('.outputArea').show();
                                              $liHeader.find('a').click();

                                              function pollJobOutput() {
                                                  $.get('../jenkins/' + data.jenkinsServerId + '/jobs/' + data.jobName + '/builds/' + job.lastBuild.number + '/output', function(jobOutput) {
                                                      $tabContent.find('.taskLogArea').html(jobOutput.output);
                                                      console.log(jobOutput);
                                                      setTimeout(function() {
                                                          if ($('#assignedExecute').data()['bs.modal'].isShown) {
                                                              pollJobOutput();
                                                          }
                                                      }, 3000);
                                                  });
                                              }
                                              pollJobOutput();
                                          } else {
                                              pollJob();
                                          }
                                          console.log(job);
                                      });
                                  }
                                  pollJob();

                                  console.log(data);
                              }

                          }).fail(function(jxhr) {
                              $modal.find('.loadingContainer').hide();
                              $modal.find('.outputArea').hide();
                              var $errorContainer = $modal.find('.errorMsgContainer').show();
                              if (jxhr.responseJSON && jxhr.responseJSON.message) {
                                  $errorContainer.html(jxhr.responseJSON.message);
                              } else {
                                  $errorContainer.html("Server Behaved Unexpectedly");
                              }
                          });
                      });
                      $tr.append($tdExecute);
                      var timestamp = "-";
                      if (data[i].lastRunTimestamp) {
                          var date = new Date().setTime(data[i].lastRunTimestamp);
                          timestamp = new Date(date).toLocaleString(); //converts to human readable strings
                      }


                      var $tdTime = $('<td></td>').append(timestamp).addClass('taskrunTimestamp');
                      $tr.append($tdTime);

                      var $tdOptions = $('<td></td>').append('<div class="btn-group tableactionWidth"><a rel="tooltip" data-placement="top" data-original-title="Remove" class="btn btn-danger pull-left btn-sg tableactionbutton btnDeleteTask"><i class="ace-icon fa fa-trash-o bigger-120"></i></a><a class="btn btn-info pull-left tableactionbutton btnEditTask tableactionbuttonpadding btn-sg" data-original-title="Edit" data-placement="top" rel="tooltip"><i class="ace-icon fa fa-pencil bigger-120"></i></a></div>').attr('data-taskId', data[i]._id);
                      $tdOptions.find('.btnDeleteTask').click(function(e) {
                          var taskId = $(this).parents('td').attr('data-taskId');
                          var that = this;
                          $.ajax({
                              url: '../tasks/' + taskId,
                              method: 'DELETE',
                              success: function(data) {
                                  //$(that).parents('tr').remove();
                                  //var totalTask = $taskListArea.children('tr').length;
                                  //$('.taskListFooter').text('Showing ' + totalTask + ' of ' + totalTask + ' entries');
                                  $taskDatatable.row($(that).parents('tr')).remove().draw(false);
                              }
                          })
                      });
                      $tdOptions.find('.btnEditTask').click(function(e) {
                          setBreadCrumbAndViewOrchestration();

                          var taskId = $(this).parents('td').attr('data-taskId');

                          window.location.href = 'index.html#ajax/assignTask.html?org=' + urlParams.org + '&bg=' + urlParams['bg'] + '&projid=' + urlParams['projid'] + '&envid=' + urlParams['envid'] + '&taskId=' + taskId;

                      });
                      $tr.append($tdOptions);

                      $taskDatatable.row.add($tr).draw();
                      //$taskListArea.append($tr);

                      //aaaa
                      if ($("#sorttableheader").length) {
                          //alert(1);
                          $("#sorttableheader").tablesorter();
                      }
                      //     $("#sorttableheader").tablesorter();
                      pageSetUp();

                  }

                  function pollTaskLogs($tabLink, $tab, timestamp, delay, clearData) {
                      var instanceId = $tabLink.attr('data-taskInstanceId');
                      var timestamp = $tabLink.attr('data-taskPollLastTimestamp');
                      var poll = $tabLink.attr('data-taskPolling');

                      if (poll !== 'true') {
                          console.log('not polling');
                          return;
                      }


                      var url = '../instances/' + instanceId + '/logs';
                      if (timestamp) {
                          url = url + '?timestamp=' + timestamp;
                      }

                      timeout = setTimeout(function() {
                          $.get(url, function(data) {
                              var $modalBody = $tab.find('.taskLogArea')
                              if (clearData) {
                                  $modalBody.empty();
                              }
                              var $table = $('<table></table>');

                              for (var i = 0; i < data.length; i++) {
                                  var $rowDiv = $('<tr class="row"></tr>');
                                  var timeString = new Date().setTime(data[i].timestamp);
                                  var date = new Date(timeString).toLocaleString(); //converts to human readable strings

                                  /*$rowDiv.append($('<div class="col-lg-4 col-sm-4"></div>').append('<div>' + date + '</div>'));*/

                                  if (data[i].err) {
                                      $rowDiv.append($('<td class="col-lg-12 col-sm-12" style="color:red;"></td>').append('<span class="textLogs">' + date + '</span>' + '&nbsp;&nbsp;&nbsp;' + '<span>' + data[i].log + '</span>'));
                                  } else {
                                      $rowDiv.append($('<td class="col-lg-12 col-sm-12" style="color:DarkBlue;"></td>').append('<span class="textLogs">' + date + '</span>' + '&nbsp;&nbsp;&nbsp;' + '<span>' + data[i].log + '</span>'));
                                  }

                                  $table.append($rowDiv);
                                  $table.append('<hr/>');

                              }


                              if (data.length) {
                                  lastTimestamp = data[data.length - 1].timestamp;
                                  console.log(lastTimestamp);
                                  $modalBody.append($table);
                                  $modalBody.scrollTop($modalBody[0].scrollHeight + 100);
                                  $tabLink.attr('data-taskPollLastTimestamp', data[data.length - 1].timestamp);

                              }


                              console.log('polling again');
                              if ($tabLink.attr('data-taskPolling') === 'true' && $('#assignedExecute').data()['bs.modal'].isShown) {

                                  pollTaskLogs($tabLink, $tab, $tabLink.attr('data-taskPollLastTimestamp'), 1000, false);

                              } else {
                                  console.log('not polling again');
                              }
                          });
                      }, delay);
                  }

                  //updating footer
                  $('.taskListFooter').text('Showing ' + data.length + ' of ' + data.length + ' entries');
                  pageSetUp();
              };


              /************************************************Container.js************************************************/

              /*Binding Click events to Containers and showing the breadcrumb*/

              function initializeContainer() {
                  $('.Containers').click(function(e) {
                      //debugger;
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
                          DummyBreadCrumb += '>' + 'Containers';

                          if (DummyBreadCrumb != null && DummyBreadCrumb != 'undefined') {
                              localStorage.removeItem("breadcrumb");
                              splitBread = DummyBreadCrumb.split('>');
                              if (splitBread.length > 0) {
                                  $('#ribbon').find('.breadcrumb').find('li').detach();
                                  for (var arraycount = 0; arraycount < splitBread.length; arraycount++) {
                                      var liNew = document.createElement('li');
                                      liNew.innerHTML = splitBread[arraycount];
                                      $('#ribbon').find('.breadcrumb').append(liNew);
                                  }
                              }
                          }
                          //$('#ribbon').find('.breadcrumb').append('<li>"'+ DummyBreadCrumb'"</li>');
                          //alert(DummyBreadCrumb);
                      }

                  });
              }
              /************************************ControlPanel.js*****************************************************/
              //drawing the breadcrumb when user clicks on control-panel
              function initializeControlPanel() {
                  $('.actionControlPanel').click(function(e) {
                      //var getbreadcrumbul = $('#ribbon').find('.breadcrumb').find('li').length;
                      var getbreadcrumbul = $('#ribbon').find('.breadcrumb').find('li');
                      var getbreadcrumbullength = getbreadcrumbul.length;
                      var DummyBreadCrumb;
                      if (getbreadcrumbullength > 0) {
                          //alert(getbreadcrumbullength);
                          for (var counter = 0; counter < getbreadcrumbullength; counter++) {
                              //alert('hi');
                              var getbreadcrumbulname = getbreadcrumbul[counter].innerHTML;
                              if (DummyBreadCrumb != null && DummyBreadCrumb != "" && DummyBreadCrumb != "undefined") {
                                  DummyBreadCrumb += '>' + getbreadcrumbulname;
                              } else {
                                  DummyBreadCrumb = getbreadcrumbulname;
                              }
                          }
                          localStorage.setItem("breadcrumb", DummyBreadCrumb);
                      }

                      var controlId = $(".visibleClass").attr("id");
                      //alert(controlId);
                      var urlText;
                      localStorage.setItem("dataEx", location.href);


                      if ($('#divinstancescardview').is(':visible')) {

                          var $selectedCard = $('.role-Selectedcard');
                          //console.log($selectedCard.length);
                          if ($selectedCard.length) {
                              var instanceId = $selectedCard.find('.domain-roles-caption').attr('data-instanceId');
                              if (instanceId) {
                                  urlText = 'index.html#ajax/Controlpanel.html?org=' + urlParams.org + '&id=' + instanceId + '&visibleControlid=' + controlId;
                                  window.location.href = urlText;
                                  // window.location.href = 'index.html#ajax/Controlpanel.html?org='+urlParams.org+'&id=' + instanceId;
                              }
                          }
                      } else {
                          var $selectedCard = $('.rowcustomselected');
                          if ($selectedCard.length) {
                              var instanceId = $selectedCard.attr('data-instanceId');
                              if (instanceId) {
                                  urlText = 'index.html#ajax/Controlpanel.html?org=' + urlParams.org + '&id=' + instanceId + '&visibleControlid=' + controlId;
                                  //localStorage.setItem("dataEx", urlText);
                                  window.location.href = urlText;
                                  // window.location.href = 'index.html#ajax/Controlpanel.html?org='+urlParams.org+'&id=' + instanceId;
                              }
                          }
                      }
                  });
              }



              /***************************************Dev.js***************************************/
              //Registring events for pemFile selection
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

              //If instances are present user will be able to add new Nodes in orchestration
              /* function registerEventsForSearchInstances() {
              $('.searchInstances').keyup(function(e) {
             //   alert(1);
                var searchText = $(this).val();
                    //alert(searchText);
                    $allListElements = $('#divinstancescardview ul li .domain-roles-heading .cardHeadingTextoverflow');
                    //alert($allListElements.length);
                    $matchingListElements = $allListElements.filter(function(i, el) {
                        //alert(el);
                        return $(el).text().indexOf(searchText) !== -1;
                      });
                    // $allListElements.parents().eq(6).hide();
                    // $matchingListElements.parents().eq(6).show();
                    $allListElements.parents(".domain-role-thumbnail").hide();
                    $matchingListElements.parents(".domain-role-thumbnail").show();
                    // $allListElements.parent().parent().parent().parent().parent().parent().parent().hide();
                    // $matchingListElements.parent().parent().parent().parent().parent().parent().parent().show();
                  });
            }
            */


              var wzlink = window.location.href.split('#')[1];
              //alert(wzlink);
              $('li[navigation*="Workspace"]').find('a').attr('href', '#' + wzlink);
              //Set localstorage to hold the last wz href
              //update lastworkzone only when you have ? in url
              if (window.location.href.indexOf('?') > 0)
                  localStorage.setItem("lastworkzoneurl", window.location.href);

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

              // $(document).ready(function() {
              //$('.modal').modalCollapse();
              $(document).on('shown.bs.modal', function(e) {
                  $('[autofocus]', e.target).focus();
              });

              $('#importinstanceOS').select2();
              $('#pemFileDropdown').select2();


              if (localStorage.getItem("SelectedClass") == "Orchestration") {
                  localStorage.removeItem("SelectedClass");
                  $('#myTab3').find('.Instances').removeClass('active');
                  $('#myTab3').find('.Orchestration').addClass('active');
                  $('#myTabContent3').find('#l1').removeClass('active');
                  $('#myTabContent3').find('#l3').addClass('active');
                  $('#myTab3').click();
              }
              $('#Removelinkedcontainersonexitfield').select2();
              $('#Removeonexitfield').select2();
              $('#cAdvisorPageFrame').on('load', function() {
                  $('#cadvisorloadingicon').hide();
              });
              //});

              //setting the breadcrumb for Orchestration
              function setBreadCrumbAndViewOrchestration() {
                  localStorage.setItem("SelectedClass", "Orchestration");

                  //var getbreadcrumbul = $('#ribbon').find('.breadcrumb').find('li').length;
                  var getbreadcrumbul = $('#ribbon').find('.breadcrumb').find('li');
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
                      localStorage.setItem("breadcrumb", DummyBreadCrumb);
                  }

                  var getmyTab3selectedli = $('#myTab3').find('.pull-left.active');
                  var getmyTab3selectedlilength = getmyTab3selectedli.length;
                  //alert(getmyTab3selectedlilength);
                  if (getmyTab3selectedlilength > 0) {
                      var myTabContent3 = $('#myTabContent3').find('tab-pane.active').innerHTML;
                      //alert(myTabContent3);
                  }
              }

              //event for orchatration tab show
              //   $(function() {


              // });


              $('.createTaskLink').click(function(e) {
                  var hasTasksPermission = false;
                  if (haspermission("instancetasks", "execute")) {
                      hasTasksPermission = true;
                  }
                  if (!hasTasksPermission) {
                      bootbox.alert('User has no permission to Add Tasks');
                      return false;
                  }
                  setBreadCrumbAndViewOrchestration();


                  window.location.href = 'index.html#ajax/assignTask.html?org=' + urlParams.org + '&bg=' + urlParams['bg'] + '&projid=' + urlParams['projid'] + '&envid=' + urlParams['envid'];
              });

              //for Table view





              $('.dockerinstancestart').click(function(e) {
                  $('.instanceselectedfordocker').each(function() {
                      if ($(this).is(':checked')) {

                          var instid = $(this).closest('tr').attr('data-instanceid');
                          var instbpname = $(this).closest('tr').attr('data-blueprintname');
                          if (instid)
                              var $that = $(this);
                          var $td = $that.closest('td');
                          var tdtext = $td.text();
                          $td.find('.dockerspinner').detach();
                          $td.find('.dockermessage').detach();
                          $td.append('<img class="dockerspinner" style="margin-left:5px" src="img/select2-spinner.gif"></img>');
                          $td.attr('title', 'Pulling in Images');
                          var imagename = $('.productdiv1.role-Selected1').first().attr('dockercontainerpaths');
                          var repotag = $('.productdiv1.role-Selected1').find('.dockerrepotagselect').first().val();

                          var repopath = $('.productdiv1.role-Selected1').first().attr('dockerreponame');

                          // var dockerlaunchparameters = $('.productdiv1.role-Selected1').first().attr('dockerlaunchparameters');
                          var dockerlaunchparameters = generateDockerLaunchParams();
                          if (!dockerlaunchparameters)
                              dockerlaunchparameters = 'null';
                          var lp = 'null'; //launch parameter
                          var sp = 'null'; //start parameter
                          var ep = 'null';
                          if (dockerlaunchparameters) {
                              if (dockerlaunchparameters[0])
                                  lp = dockerlaunchparameters[0];
                              if (dockerlaunchparameters[1])
                                  sp = dockerlaunchparameters[1];
                              if (dockerlaunchparameters[2])
                                  ep = dockerlaunchparameters[2];
                          }
                          // alert(lp + ' ' + sp);
                          // alert('../instances/dockerimagepull/' + instid + '/' + repopath + '/' + encodeURIComponent(imagename) + '/' + repotag + '/' + encodeURIComponent(lp) + '/' + encodeURIComponent(sp));
                          $.get('../instances/dockerimagepull/' + instid + '/' + repopath + '/' + encodeURIComponent(imagename) + '/' + repotag + '/' + encodeURIComponent(lp) + '/' + encodeURIComponent(sp), function(data) {
                            //alert(JSON.stringify(data));
                            if (data == "OK") {
                                var $statmessage = $td.find('.dockerspinner').parent();


                                if (ep == 'null') {
                                    $td.find('.dockerspinner').detach();
                                    $statmessage.append('<span style="margin-left:5px;text-decoration:none" class="dockermessage">Pull done </span>');
                                } else {
                                    if ($('#Containernamefield').val() != '') {
                                        $.get('../instances/dockerexecute/' + instid + '/' + $('#Containernamefield').val() + '/' + ep, function(data) {
                                            if (data == "OK") {
                                                $td.find('.dockerspinner').detach();
                                                $td.find('.dockermessage').detach();
                                                $statmessage.append('<span style="margin-left:5px;text-decoration:none" class="dockermessage">Pull done </span>');

                                            } else {
                                                $('.dockerspinner').detach();
                                                $td.find('.dockermessage').detach();
                                                $statmessage.append('<span style="margin-left:5px;color:red" title="' + data + '"  class="dockermessage"><i class="fa  fa-exclamation"></i></span>');
                                            }
                                        }); ///instances/dockerexecute/:instanceid/:containerid/:action
                                    } else {
                                        $('.dockerspinner').detach();
                                        $td.find('.dockermessage').detach();
                                        $statmessage.append('<span style="margin-left:5px;color:red" title="' + data + '"  class="dockermessage"><i class="fa  fa-exclamation"></i></span>');
                                        alert('Cannot execute parameters when no container name is provided.\nProvide a name and try again.');
                                    }

                                }
                                //Updating instance card to show the docker icon.
                                $dockericon = $('<img src="img/galleryIcons/Docker.png" alt="Docker" style="width:42px;height:42px;margin-left:32px;" class="dockerenabledinstacne"/>');
                                //find the instance card - to do instance table view update
                                var $instancecard = $('div[data-instanceid="' + instid + '"]');
                                if ($instancecard.find('.dockerenabledinstacne').length <= 0) {
                                    $instancecard.find('.componentlistContainer').first().append($dockericon);
                                }
                                //debugger;
                                loadContainersTable(); //Clearing and loading the containers again.
                            } else {
                              //alert(data);
                                if(data.indexOf('No Docker Found') >= 0){
                                    var $statmessage = $('.dockerspinner').parent();
                                    $('.dockerspinner').detach();
                                    $td.find('.dockermessage').detach();
                                    $statmessage.append('<span style="margin-left:5px;color:red" title="Docker not found"  class="dockermessage"><i class="fa  fa-exclamation"></i></span>');
                                    //Prompt user to execute the docker cookbook.
                                    if(confirm('Docker was not found on the node : "' + instbpname + '". \nDo you wish to install it?')){
                                        //Docker launcer popup had to be hidden due to overlap issue.
                                        $('#launchDockerInstanceSelector').modal('hide');
                                        $('a.actionbuttonChefClientRun[data-instanceid="' + instid + '"]').first().trigger('click');
                                    }
                                }
                                else{
                                var $statmessage = $('.dockerspinner').parent();
                                $('.dockerspinner').detach();
                                $td.find('.dockermessage').detach();
                                $statmessage.append('<span style="margin-left:5px;color:red" title="' + data + '"  class="dockermessage"><i class="fa  fa-exclamation"></i></span>');
                                }
                            }
                        });
                      }
                  });
              });




              $.get('../organizations/' + orgId + '/businessgroups/' + urlParams['bg'] + '/projects/' + projectId + '/environments/' + envId + '/', function(data) {
                  console.log('success---3---4');

                  //Syncing up the tree view based on url
                  initializeBlueprintArea(data.blueprints);
                  initializeTaskArea(data.tasks);
                  x = data.instances;
                  initializeInstanceArea(data.instances);

              });


              //Generating the docker launch parameters
              function generateDockerLaunchParams() {
                  if ($('#Containernamefield').val() == '') {
                      $('.dockerparamrequired').removeClass('hidden');
                      return ('');
                  }

                  var launchparams = [];
                  var preparams = '';
                  var startparams = '';
                  var execparam = '';
                  $('[dockerparamkey]').each(function() {
                      if ($(this).val() != '') {
                          var itms = $(this).val().split(',');
                          for (itm in itms) {
                              if ($(this).attr('dockerparamkey') != '-c' && $(this).attr('dockerparamkey') != '-exec') //checking for start parameter
                                  preparams += ' ' + $(this).attr('dockerparamkey') + ' ' + itms[itm];
                              else {
                                  if ($(this).attr('dockerparamkey') == '-c')
                                      startparams += ' ' + itms[itm];
                                  if ($(this).attr('dockerparamkey') == '-exec')
                                      execparam += ' ' + itms[itm];


                              }
                          }
                          launchparams[0] = preparams;
                          launchparams[1] = startparams;
                          // alert(execparam);
                          launchparams[2] = execparam;
                      }
                  });
                  return (launchparams);
              }

              function loadLaunchParams() {
                  var lparam = $('.productdiv1.role-Selected1').first().attr('dockerlaunchparameters');
                  if (lparam && lparam != '') {
                      $('[dockerparamkey]').val(''); //clearing the popup input boxes
                      //split by -c to get startup and other parameters
                      var preparams = lparam.split('-c');
                      var cparams = ''; //this is the startup parameters
                      if (preparams.length > 1) {
                          lparam = preparams[0];
                          cparams = preparams[1];
                      }
                      lparam = lparam.replace(/  /g, " ");
                      console.log(lparam + ' ' + cparams);
                      var params = lparam.split(' -');
                      for (para in params) {

                          var subparam = params[para].split(' ');
                          // alert(subparam.join());
                          if (subparam.length > 0) {
                              $inp = $('[dockerparamkey="-' + subparam[0] + '"]').first();

                              if ($inp.val() != '')
                                  $inp.val($inp.val() + ',' + subparam[1]);
                              else
                                  $inp.val(subparam[1]);
                          }
                          //alert(params[para]);
                      }
                      //Updating the startup parameter
                      $('[dockerparamkey="-c"]').first().val(cparams);
                  } else
                      $('[dockerparamkey]').val('');
                  $('#myModalLabelDockerContainer').modal('show');
              }


              //   $(document).ready(function(){
              //Expanding the first accordion

              //alert($('#accordion-2').find('a').first().html());
              $('.dockerrepotagselect').parent().prepend('Tags&nbsp;');

              $('#rootwizard').bootstrapWizard({
                  'tabClass': 'nav nav-pills',
                  'onNext': function(tab, navigation, index) {

                      $('.dockerinstancestart').first().removeClass('hidden');
                      var $valid = $("#commentForm").valid();
                      if (!$valid) {
                          $validator.focusInvalid();
                          return false;
                      }
                  },
                  'onPrevious': function(tab, navigation, index) {
                      $('.dockerinstancestart').first().addClass('hidden');
                  }

              });

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



              function createdockercontainerrow(dockerContainerItem, instanceid) {
                  // <td class="dockercontainerstatus"></td>
                  // <td  class="dockercontainerstartedon"></td>
                  // <td  class="dockercontainername"></td>
                  // <td  class="dockercontainerhostip"></td>
                  // <td  class="dockercontainerid"></td>
                  // <td  class="dockercontainerimagename"></td>
                  //alert(instanceid); $modalDesktopProvisioning.modal('show');
                  var $cadvisor = $('<a class="linkcadvisor hidden pull-right" target="_blank" title="Open cAdvisor"></a>');


                  var $docctr = $('#dockercontainertabletemplatetr').clone().removeClass('hidden');
                  $docctr.attr('id', 'trfordockercontainer_' + dockerContainerItem.Id);
                  $docctr.find('.dockercontainerstatus').html(dockerContainerItem.Status).parent().append($cadvisor);
                  var docdate = new Date(1000 * dockerContainerItem.Created);
                  $docctr.find('.dockercontainerstartedon').html(docdate.toLocaleString());
                  $docctr.find('.dockercontainername').html(dockerContainerItem.Names[0]);
                  //Get the host IP from the card

                  var instanceip = $('.domain-roles-caption[data-instanceid="' + instanceid + '"]').first().find('.instanceip').text();

                  //Building the cadvisor href
                  $cadvisor.append('<i class="fa fa-line-chart fa-lg " style="margin-top:9px"></i>').attr('href', 'http://' + instanceip + ':8080/docker/' + dockerContainerItem.Id);
                  $cadvisor.attr('cadvisorip', instanceip); //
                  $cadvisor.attr('dockercontainerid', dockerContainerItem.Id);

                  //Once CORS is enabled in cAdvisor uncomment below function to load in a frame
                  $cadvisor.click(function(e) {
                      $('#cadvisorpopup').modal('show');

                      if (typeof $('#cAdvisorPageFrame').attr('src') != 'undefined') {
                          $('#cadvisorloadingicon').hide();
                      } else {
                          $('#cadvisorloadingicon').show();
                      }
                      $('#cAdvisorPageFrame').attr('src', "");
                      $('#cAdvisorPageFrame').attr('src', 'http://' + instanceip + ':8080');
                      //$('#cAdvisorPageFrame').load('http://' + instanceip + ':8080/docker/');
                      e.preventDefault();
                      return (false);
                  });


                  $docctr.attr('instanceid', instanceid);
                  $docctr.attr('containerid', dockerContainerItem.Id.substring(0, 12));
                  $docctr.find('.dockercontainerhostip').html(instanceip);
                  $docctr.find('.dockercontainerid').attr('containerid', dockerContainerItem.Id).html(dockerContainerItem.Id.substring(0, 12));
                  $docctr.find('.dockercontainerimagename').html(dockerContainerItem.Image);
                  //Updating the more info popup event
                  $docctr.find('.modelcontainermoreinfo').click(function() {
                      $.get('/instances/dockercontainerdetails/' + instanceid + '/' + dockerContainerItem.Id, function(data) {
                          var dockerContainerData = JSON.parse(data);
                          //alert(JSON.stringify(dockerContainerData));
                          $('#modalContainermoreInfo').find('td[containerdata]').each(function() {
                              console.log("dockerContainerData." + $(this).attr('containerdata'));
                              if ($(this).attr('containerdata') != '')
                                  $(this).html(eval("dockerContainerData." + $(this).attr('containerdata')));
                          });

                      });
                  });
                  //Analysing the status cell
                  if (dockerContainerItem.Status.indexOf('Up') >= 0) {
                      //Show Stop
                      //If the container is of type cadvisor show the link
                      if (dockerContainerItem.Image.indexOf('cadvisor') >= 0) {
                          $cadvisor.removeClass('hidden');
                          $cadvisor.addClass('cadvisorenablebase');
                      }

                      $docctr.find('.stop').removeClass('hidden');
                      $docctr.find('.start').addClass('hidden');


                      if (dockerContainerItem.Status.indexOf('Paused') >= 0) {
                          $docctr.find('.pause').addClass('hidden');
                          $docctr.find('.unpause').removeClass('hidden');
                      } else {
                          $docctr.find('.unpause').addClass('hidden');
                          $docctr.find('.pause').removeClass('hidden');
                      }

                  } else if (dockerContainerItem.Status.indexOf('Exited') >= 0) {
                      $docctr.find('.stop').addClass('hidden');
                      $docctr.find('.start').removeClass('hidden');
                      $docctr.find('.pause').addClass('hidden');
                      $docctr.find('.unpause').addClass('hidden');
                  } else if (dockerContainerItem.Status.indexOf('Paused') >= 0) {
                      $docctr.find('.pause').addClass('hidden');
                      $docctr.find('.unpause').removeClass('hidden');
                  } else {
                      $docctr.find('.stop').addClass('hidden');
                      $docctr.find('.start').removeClass('hidden');
                  }

                  return ($docctr);

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
                          // serachBoxInInstance.updateData(data,"add",undefined);
                      });

                  }).error(function() {
                      $launchResultContainer.find('.modal-body').empty().append('<span>Oops! Something went wrong. Please try again later</span>');
                  });;



              });



              function getViewTile() {
                  var locationData = localStorage.getItem("ControlID");
                  if (locationData) {
                      showHideControl(locationData);
                      //alert("clearing");
                      //localStorage.clear();
                  }
              }

              function loadcarousel() {
                  $('.carousel.slide').carousel({
                      interval: false,
                      cycle: false
                  });
              }

              var serachBoxInInstance = {
                  instanceData: null,
                  isActive: false,
                  init: function() {
                      this.updateUI = this.updateUI.bind(this);

                      $('#search').on('click', this.updateUI);
                      $('.custom-left').click(function() { //previous list
                          var originalList = $('#divinstancescardview').find('.carousel-inner');
                          var activeList = originalList.find('.active'),
                              prevList = activeList.prev();
                          if (prevList.length == 1) {
                              activeList.removeClass('active');
                              prevList.addClass('active');
                          } else {
                              activeList.removeClass('active');
                              originalList.find('.item:last').addClass('active');
                          }
                      });

                      $('.custom-right').click(function() {
                          var originalList = $('#divinstancescardview').find('.carousel-inner');
                          var activeList = originalList.find('.active'),
                              nextList = activeList.next();
                          if (nextList.length == 1) {
                              nextList.addClass('active');
                              activeList.removeClass('active');
                          } else {
                              activeList.removeClass('active');
                              originalList.find('.item:first').addClass('active');
                          }

                      });

                  },
                  initData: function(data) {
                      x = data;
                      this.instanceData = data;
                      console.log(this.instanceData);
                  },
                  emptyInstanceCarosuelAndDataTable: function() {
                      var table = $('#tableinstanceview').DataTable();
                      var el = $('#divinstancescardview').find('.carousel-inner');
                      table.clear().draw(false);
                      el.find('.item').addClass('active').remove();
                      // el.find('.domain-role-thumbnail').remove();
                      // dialog.modal('hide');
                  },
                  updateUI: function() {
                      //   var keycode= e.which? e.which : e.keyCode;
                      //  if(keycode!==13){
                      //       return;
                      //   }
                      if (this.isActive) {
                          return false;
                      }
                      this.isActive = true;
                      var txt = $('#instanceSearch').val().trim(),
                          resultJSON = txt ? this.bringSearchResult(txt, this.instanceData) : this.instanceData;
                      console.log('search Result:: ' + resultJSON);
                      this.emptyInstanceCarosuelAndDataTable();
                      createInstanceUI(resultJSON);
                      this.isActive = false;
                      loadcarousel();
                  },
                  updateData: function(object, operationType, instanceId) {
                      var temp, data = this.instanceData,
                          len = this.instanceData.length;
                      console.log("operation Type:::" + operationType);
                      switch (operationType) {
                          case "add":
                              if (object) {
                                  this.instanceData.push(data);
                              }
                              break;
                          case "remove":
                              for (var i = 0; i < len; i++) {
                                  if (data[i]._id === instanceId) {
                                      temp = i;
                                      break;
                                  }
                              }
                              if (typeof temp !== "undefined") {
                                  this.instanceData = this.instanceData.splice(temp, 1);
                              }
                              break;
                      }
                      this.updateUI();
                  },
                  isTextAvailable: function(searchTxt, mainText) {
                      return !!(mainText && searchTxt && (mainText.toLowerCase().indexOf(searchTxt.toLowerCase()) > -1));
                  },
                  bringSearchResult: function(txt, data) {
                      var searchResult = [],
                          o = this;
                      if (data && data.length > 0) {
                          for (var i = 0; i < data.length; i++) {
                              if (o.isTextAvailable(txt, data[i].instanceIP) ||
                                  o.isTextAvailable(txt, data[i].blueprintData.blueprintName) ||
                                  o.isTextAvailable(txt, data[i].bootStrapStatus) ||
                                  o.isTextAvailable(txt, data[i].hardware.os)
                              ) {
                                  searchResult.push(data[i]);
                              }
                          }
                      }
                      return searchResult;
                  }
              };

              disableImportLaunch();
              initializeInstance();
              initializeBluePrints();
              initializeContainer();
              registerEventsForPemFile();
              //   registerEventsForSearchInstances();
              initializeControlPanel();
              initializingOrchestration();
              loadcarousel();
              getViewTile();
              $('#defaultViewButton').click(); //setting the detault view
              // serachBoxInInstance.init();

          });