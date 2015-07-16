                                                   //function for showing the tableview and the cardview
                                                  function devCall() {
                                                      window.showHideControl = function(objID) {
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
                                                          $cardViewInstanceId.find('.instance-bootstrap-ActionSSH a').addClass('isStopedInstance').removeClass('sshIcon').addClass('hidden');
                                                          $tableViewInstanceId.find('.instance-bootstrap-ActionSSH a').addClass('isStopedInstance').removeClass('sshIcon').addClass('hidden');

                                                      }

                                                      //for removing the selected blueprint in the blueprint tab
                                                      window.removeSelectedBlueprint = function() {
                                                          var blueprintId = $('.productdiv1.role-Selected1').attr('data-blueprintid');
                                                          if (blueprintId) {
                                                              //found now delete
                                                              bootbox.confirm("Are you sure you would like to remove this blueprint?", function(result) {
                                                                  if (!result) {
                                                                      return;
                                                                  }
                                                                  $.ajax({
                                                                      url: '/blueprints/' + blueprintId,
                                                                      method: 'DELETE',
                                                                      success: function() {
                                                                          var $bcc = $('.productdiv1.role-Selected1').closest('.blueprintContainer');
                                                                          $('.productdiv1.role-Selected1').parent().detach();
                                                                          //Check if the closest bluprintcontainer is empty, if empty then hide it.
                                                                          // alert($bcc.find('.panel-body').children().length);
                                                                          if ($bcc.find('.panel-body').children().length <= 0) {
                                                                              $bcc.addClass('hidden');
                                                                          }
                                                                      },
                                                                      error: function() {

                                                                      }
                                                                  })
                                                                  // $.get('/blueprints/delete/' + blueprintId, function(data) {
                                                                  //     //  alert(data);
                                                                  //     if (data == 'OK') {
                                                                  //         var $bcc = $('.productdiv1.role-Selected1').closest('.blueprintContainer');
                                                                  //         $('.productdiv1.role-Selected1').parent().detach();
                                                                  //         //Check if the closest bluprintcontainer is empty, if empty then hide it.
                                                                  //         // alert($bcc.find('.panel-body').children().length);
                                                                  //         if ($bcc.find('.panel-body').children().length <= 0) {
                                                                  //             $bcc.addClass('hidden');
                                                                  //         }
                                                                  //     } else
                                                                  //         alert(data);
                                                                  // });
                                                              });
                                                          } else {
                                                              alert('Please select a blueprint to remove.');
                                                          }
                                                      }


                                                      $(document).ready(function() {
                                                          /*********************************Instance.js********************/
                                                          /*This is the entry method for initialising the instance in Dev.html.*/

                                                          function populateOSList() {
                                                              $.ajax({
                                                                  type: "GET",
                                                                  url: "/vmimages/os/type/all/list",
                                                                  success: function(data) {
                                                                      data = typeof data == "string" ? JSON.parse(data) : data;
                                                                      console.log(data);


                                                                      var str = ' <option value="">Select OS</option>',
                                                                          len = data.length;


                                                                      for (var i = 0; i < len; i++) {
                                                                          str = str + '<option value="' + data[i]["osType"] + '" ostype="' + data[i]["os_name"] + '">' + data[i]["os_name"] + '</option>';
                                                                      }
                                                                      $('#importinstanceOS').html(str).select2();
                                                                  },
                                                                  failure: function(data) {
                                                                      alert(data.toString());
                                                                  }
                                                              });
                                                          }


                                                          $('.addNewApp1').click(function() {
                                                              $('#appSeries12').clone().find("input").val("").end().appendTo('.applicationURLContainer:last');

                                                              var countApp = $('.applicationURLContainer').length;

                                                              if (countApp === 2) {
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

                                                          function disableTaskLink() {
                                                              //permission set for chefTask,custom,jenkins
                                                              var hasChefCreateTaskPermission = false;
                                                              if (haspermission('chef_task', 'create')) {
                                                                  hasChefCreateTaskPermission = true;
                                                              }
                                                              if (!hasChefCreateTaskPermission) {
                                                                  $('.createTaskLink').addClass('hidden');
                                                              }
                                                              //custom
                                                              var hasCustomCreateTaskPermission = false;
                                                              if (haspermission('custom_task', 'create')) {
                                                                  hasCustomCreateTaskPermission = true;
                                                              }
                                                              if (!hasCustomCreateTaskPermission) {
                                                                  $('.createTaskLink').addClass('hidden');
                                                              }
                                                              //jenkins
                                                              var hasJenkinsCreateTaskPermission = false;
                                                              if (haspermission('jenkins_task', 'create')) {
                                                                  hasJenkinsCreateTaskPermission = true;
                                                              }
                                                              if (!hasJenkinsCreateTaskPermission) {
                                                                  $('.createTaskLink').addClass('hidden');
                                                              }
                                                          }

                                                          function initializeInstance() {
                                                              bindClick_ipaddressImport();
                                                              bindClick_instnaceTab();
                                                              registerModelEventForImportInstance();
                                                              bindChange_importPemFile();
                                                              bindSubmit_AddInstance();
                                                              bindClick_removeInstance();
                                                              populateOSList();

                                                              var validator = $('#instanceEditNew').validate({
                                                                  errorPlacement: function(error, element) {
                                                                      // Append error within linked label
                                                                      $(element).closest("form").find("label[for='" + element.attr("id") + "']").append(error);

                                                                  },
                                                                  rules: {
                                                                      instanceEditName: {
                                                                          required: true
                                                                      }
                                                                  },
                                                                  messages: {
                                                                      instanceEditName: {
                                                                          required: "Required"
                                                                      }
                                                                  },
                                                                  onkeyup: false,
                                                                  errorClass: "error",
                                                              });




                                                              $('#instanceEditNew').submit(function(e) {
                                                                  var isValidate = $("#instanceEditNew").valid();
                                                                  //alert(isValidate);
                                                                  var reqBodyEdit = {};
                                                                  if (!isValidate) {
                                                                      e.preventDefault();
                                                                  } else {
                                                                      e.preventDefault();


                                                                      var $form = $('#instanceEditNew');
                                                                      reqBodyEdit.name = $form.find('#instanceEditName').val();
                                                                      var instanceId = $form.find('#instanceIDHiddenInput').val();
                                                                      var $selectedRow = $('#tableinstanceview').find('tr.rowcustomselected');

                                                                      blueprintName = $selectedRow.attr('data-blueprintName');
                                                                      $.post('../instances/' + instanceId + '/updateName', reqBodyEdit, function(data) {

                                                                          $('.domain-roles-caption[data-instanceId="' + instanceId + '"]').find('.cardHeadingTextoverflow').html(reqBodyEdit.name);
                                                                          $('.domain-roles-caption[data-instanceId="' + instanceId + '"]').find('.cardHeadingTextoverflow').attr('rel', 'tooltip').attr('data-original-title', reqBodyEdit.name);
                                                                          $('tr[data-instanceId="' + instanceId + '"] td.instanceBlueprintName span').html(reqBodyEdit.name);
                                                                          $('#modalforInstanceEdit').modal('hide');
                                                                      });

                                                                      return false;
                                                                  }
                                                                  $('a.editInstanceNameBtn[type="reset"]').on('click', function() {
                                                                      validator.resetForm();
                                                                  });
                                                              });


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
                                                                  $.get('../instances/' + instanceId, function(data) {
                                                                      console.log(data);
                                                                      //found now delete
                                                                      var dialog = bootbox.dialog({
                                                                          title: "Remove Instance",
                                                                          message: '<div class="row">  ' +
                                                                              '<div class="col-md-12"> ' +
                                                                              '<div id="deleteInstanceWorkingIndicator" style="display:none"><img class="center-block" style="height:50px;width:50px;margin-top: 10%;margin-bottom: 10%;" src="img/loading.gif" /></div>' +
                                                                              '<form id="deleteInstanceForm" class="form-horizontal"> ' +
                                                                              '<input type="hidden" id="deleteInstanceIdInput" value="' + instanceId + '"/>' +
                                                                              '<div class="form-group"> ' +
                                                                              '<span class="col-md-12" for="name">You are about to remove this instance, do you want to proceed?</span> ' +
                                                                              '</div>' +
                                                                              '<div class="form-group"> ' +
                                                                              '<label style="color:#333;" class="col-md-3 forBootBox1" for="name">Instance Name:</label> ' +
                                                                              '<strong><span class="col-md-4 forBootBox" for="name">' + data.name + '</span></strong>' +
                                                                              '</div> ' +
                                                                              '<div class="form-group" style="margin-top:-10px"> ' +
                                                                              '<label for="ckbChefDelete"></label> ' +
                                                                              '<div class="col-md-8"> <div class="checkbox"> <label style="color:#333;" for="ckbChefDelete-0"> ' +
                                                                              '<input type="checkbox" name="ckbChefDelete" id="ckbChefDelete"> ' +
                                                                              'Delete this node from chef server </label> ' +
                                                                              '</div>' +
                                                                              '</div>' +
                                                                              '<div style="margin-top:20px;" class="col-lg-12">Note : This will not terminate the instance from the provider.</div>' +
                                                                              '</form> </div>  </div>',
                                                                          buttons: {
                                                                              cancel: {
                                                                                  label: "Cancel",
                                                                                  className: "btn btn-default",
                                                                                  callback: function() {

                                                                                  }
                                                                              },
                                                                              success: {
                                                                                  label: "Delete",
                                                                                  className: "btn btn-danger",
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
                                                                                              $('#divinstancescardview').find('.domain-roles-caption[data-instanceId=' + instanceId + ']').parents('.domain-role-thumbnailDev').remove();
                                                                                              // serachBoxInInstance.updateData(undefined,"remove",instanceId);

                                                                                              var table = $('#tableinstanceview').DataTable();
                                                                                              table.row('[data-instanceid=' + instanceId + ']').remove().draw(false);
                                                                                              dialog.modal('hide');
                                                                                          }
                                                                                      }).fail(function(jxhr) {
                                                                                          if (jxhr.responseJSON && jxhr.responseJSON.message) {
                                                                                              $('#deleteInstanceForm').html(jxhr.responseJSON.message);
                                                                                          } else {
                                                                                              $('#deleteInstanceForm').html('Server Behaved Unexpectedly. Unable to delete instance');
                                                                                          }
                                                                                          $('#deleteInstanceWorkingIndicator').hide();
                                                                                          $('#deleteInstanceForm').show();
                                                                                      });
                                                                                      return false;
                                                                                  }
                                                                              }

                                                                          }
                                                                      });
                                                                  });
                                                              } else {
                                                                  bootbox.alert('Please select an instance to remove.');
                                                              }
                                                          }

                                                          /*Attaching Click Event on IP Address Import, which will reset instance form.*/
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
                                                                  var appURLContainer = $('.applicationURLContainer').length;
                                                                  if (appURLContainer > 1) {
                                                                      $('.applicationURLContainer:last').remove();
                                                                      $('.addNewApp1').removeClass('hidden');
                                                                  }
                                                                  $('#nodeimportipresultmsg').addClass("hidden");
                                                                  $('#addInstanceForm').trigger("reset");
                                                                  $('#pemFileDropdown').change();
                                                                  $('#importinstanceOS').change();

                                                              });
                                                          }

                                                          /*Attaching Click event on instances tab which will set BreadCrumb for Instances*/
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
                                                                      if (data && data.length <= 0) {
                                                                          $('#modalContainerimportInstance').modal('hide');
                                                                          alert('A chef server is required to import an instance. Use settings to add a new one.');
                                                                          return false;
                                                                      } else {
                                                                          var found = false;
                                                                          JSON.parse(JSON.stringify(data)).forEach(function(k, v) {
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
                                                                      //importbyipusers();
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
                                                              $(function() {
                                                                  $.validator.addMethod('IP4Checker', function(value) {
                                                                      var ip = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
                                                                      return value.match(ip);
                                                                  }, 'Invalid IP address');

                                                                  var validator = $('#addInstanceForm').validate({
                                                                      /*errorPlacement: function(error, element){
                                                            // Append error within linked label
                                                            $(element).closest("form").find("label[for='" + element.attr("id") + "']").append(error);

                                                        },*/
                                                                      rules: {
                                                                          instanceUsername: {
                                                                              required: true
                                                                          },
                                                                          instancePassword: {
                                                                              required: true
                                                                          },
                                                                          instanceFQDN: {
                                                                              required: true,
                                                                              IP4Checker: true
                                                                          },
                                                                          importPemfileInput: {
                                                                              extension: "pem"
                                                                          },
                                                                          appNameURL: {
                                                                              url: true
                                                                          },
                                                                          importinstanceOS: {
                                                                              required: true
                                                                          }
                                                                      },
                                                                      messages: {
                                                                          instanceUsername: {
                                                                              required: "Required"
                                                                          },
                                                                          instancePassword: {
                                                                              required: "Required"
                                                                          },
                                                                          importPemfileInput: {
                                                                              extension: "Only .pem files can be uploaded"
                                                                          },
                                                                          importinstanceOS: {
                                                                              required: "Required"
                                                                          }
                                                                      },
                                                                      onkeyup: false,
                                                                      errorClass: "error",

                                                                      //put error message behind each form element
                                                                      errorPlacement: function(error, element) {
                                                                          var elem = $(element);
                                                                          if (element.parent('.input-groups').length) {
                                                                              error.insertBefore(element.parent());
                                                                          } else {
                                                                              error.insertBefore(element);
                                                                          }
                                                                      },

                                                                      //When there is an error normally you just add the class to the element.
                                                                      // But in the case of select2s you must add it to a UL to make it visible.
                                                                      // The select element, which would otherwise get the class, is hidden from
                                                                      // view.
                                                                      highlight: function(element, errorClass, validClass) {
                                                                          var elem = $(element);
                                                                          if (elem.hasClass("select2-offscreen")) {
                                                                              $("#s2id_" + elem.attr("id") + " ul").addClass(errorClass);
                                                                          } else {
                                                                              elem.addClass(errorClass);
                                                                          }
                                                                      },

                                                                      //When removing make the same adjustments as when adding
                                                                      unhighlight: function(element, errorClass, validClass) {
                                                                          var elem = $(element);
                                                                          if (elem.hasClass("select2-offscreen")) {
                                                                              $("#s2id_" + elem.attr("id") + " ul").removeClass(errorClass);
                                                                          } else {
                                                                              elem.removeClass(errorClass);
                                                                          }
                                                                      }
                                                                  });
                                                                  $(document).on('change', '.select2-offscreen', function() {
                                                                      if (!$.isEmptyObject(validator.submitted)) {
                                                                          validator.form();
                                                                      }
                                                                  });

                                                                  $('a#ipaddressimport[type="reset"]').on('click', function() {
                                                                      validator.resetForm();
                                                                  });

                                                              });
                                                              //If the change event fires we want to see if the form validates.
                                                              //But we don't want to check before the form has been submitted by the user
                                                              //initially.


                                                              $(document).on("select2-opening", function(arg) {
                                                                  var elem = $(arg.target);
                                                                  if ($("#s2id_" + elem.attr("id") + " ul").hasClass("myErrorClass")) {
                                                                      //jquery checks if the class exists before adding.
                                                                      $(".select2-drop ul").addClass("myErrorClass");
                                                                  } else {
                                                                      $(".select2-drop ul").removeClass("myErrorClass");
                                                                  }
                                                              });

                                                              $("#addInstanceForm").submit(function(e) {
                                                                  var isValidate = $("#addInstanceForm").valid();
                                                                  if (!isValidate) {
                                                                      e.preventDefault();
                                                                      return false;
                                                                  } else {
                                                                      e.preventDefault();

                                                                      var hostname = /^([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])(\.([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]{0,61}[a-zA-Z0-9]))*$/;
                                                                      //var regexpURL = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
                                                                      var $spinner = $('#nodeimportipspinner').addClass('hidden');
                                                                      var $result = $('#nodeimportipresultmsg').addClass('hidden');
                                                                      var reqBody = {};
                                                                      var $form = $('#addInstanceForm');
                                                                      reqBody.fqdn = $form.find('#instanceFQDN').val().trim();
                                                                      reqBody.os = $form.find('#importinstanceOS').val();
                                                                      //reqBody.users = $('#importbyipuserListSelect').val();
                                                                      reqBody.credentials = {
                                                                          username: $form.find('#instanceUsername').val()
                                                                      };
                                                                      var appUrls = [];
                                                                      var $appURLContainers = $('.applicationURLContainer');
                                                                      var isAppUrlValid = true;
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
                                                                      var $dropdown = $('#pemFileDropdown');
                                                                      if ($dropdown.val() === 'pemFile') {

                                                                          var pemFileInput = $form.find('#importPemfileInput').get(0);


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

                                                                          makeRequest();
                                                                      }
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
                                                                          console.log('success---3---3');
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
                                                                  e.preventDefault();
                                                                  return false;
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
                                                              localStorage.setItem("instanceData", JSON.stringify(data));
                                                              var pageset = 15;
                                                              data = data.splice(0, 15);
                                                              localStorage.lastinstanceshown = pageset;
                                                              createInstanceUI(data);
                                                              $('#accordion-1').scrollTop(0);
                                                              $('#accordion-1').bind('scroll', function() {
                                                                  if ($(this).scrollTop() + $(this).innerHeight() >= this.scrollHeight) {
                                                                      $('#instanceSpinner').removeClass('hidden');
                                                                      //alert('end reached ' + localStorage.lastinstanceshown + ' ' + pageset + ' ' + localStorage.instanceData.length);
                                                                      //loading next 15 if available
                                                                      data = JSON.parse(localStorage.instanceData).splice(parseInt(localStorage.lastinstanceshown), pageset);
                                                                      localStorage.lastinstanceshown = parseInt(localStorage.lastinstanceshown) + pageset;
                                                                      //alert(JSON.stringify(data));
                                                                      createInstanceUI(data);
                                                                      $('#instanceSpinner').addClass('hidden');
                                                                  }
                                                              });
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
                                                                              $parent.find('.instance-bootstrap-ActionRDP a').addClass('rdpIcon').attr('href', '/instances/rdp/' + data.instanceIP + '/3389');
                                                                              $('tr[data-instanceId="' + instanceId + '"] td.instanceIPCol').html(data.instanceIP);
                                                                              if (data.appUrls && data.appUrls.length) {
                                                                                  for (var k = 0; k < data.appUrls.length; k++) {
                                                                                      var url = data.appUrls[k].url;
                                                                                      url = url.replace('$host', data.instanceIP);
                                                                                      $('.app-url[data-appUrlId="' + data.appUrls[k]._id + '"]').attr('href', url);
                                                                                  }
                                                                              }

                                                                          }

                                                                      }
                                                                  });
                                                              }, delay);
                                                          }

                                                          function pollInstanceBootstrapState(instanceId, delay) {

                                                              var timeout = setTimeout(function() {
                                                                  $.get('../instances/' + instanceId, function(data) {
                                                                      var title = '';
                                                                      if (data) {
                                                                          if (data.bootStrapStatus == 'waiting') {
                                                                              console.log('polling again bootStrapStatus');
                                                                              pollInstanceBootstrapState(instanceId, 5000);
                                                                          } else {
                                                                              if (data.bootStrapStatus == 'success') {
                                                                                  if (data.hardware.platform === 'unknown') {
                                                                                      console.log('polling again bootStrapStatus unknown');
                                                                                      pollInstanceBootstrapState(instanceId, 5000);
                                                                                      return;
                                                                                  }
                                                                                  var $parent = $('.domain-roles-caption[data-instanceId="' + instanceId + '"]');
                                                                                  var basePath = 'img/osIcons/',
                                                                                      imgPath, title = '';
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
                                                                                  $parent.find('.card_os').empty().append('<img src="' + basePath + imgPath + '" height="25" width="25" data-placement="top" data-original-title="' + title.capitalizeFirstLetter() + '" rel="tooltip"/>');


                                                                              }

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
                                                              if (haspermission("instancechefclientrun", "modify")) {
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
                                                              $ccrs.find('#cookbooksrecipesselectedList').attr('data-instanceid', instanceId);

                                                              $chefRunModalContainer.find('.chefRunlistContainer').empty().append($ccrs).data('$ccrs', $ccrs);
                                                              $chefRunModalContainer.find('.attributesViewTableBody').empty();

                                                              var attributes = $this.data('jsonAttributes');

                                                              function createAttribTableRowFromJson(attributes) {
                                                                  var $chefRunModalContainer = $('#chefRunModalContainer')
                                                                  var $tbody = $chefRunModalContainer.find('.attributesViewTableBody').empty();
                                                                  for (var j = 0; j < attributes.length; j++) {
                                                                      var attributeObj = attributes[j].jsonObj;

                                                                      function getVal(obj, currentKey) {
                                                                          var keys = Object.keys(obj);
                                                                          for (var i = 0; i < keys.length; i++) {
                                                                              if (typeof obj[keys[i]] === 'object') {
                                                                                  getVal(obj[keys[i]], currentKey + '/' + keys[i]);
                                                                              } else {
                                                                                  var keyString = currentKey + '/' + keys[i];
                                                                                  keyString = keyString.substring(1);

                                                                                  var $tr = $('<tr/>').attr({
                                                                                      'data-attributeKey': keyString,
                                                                                      'data-attributeValue': obj[keys[i]],
                                                                                      'data-attributeName': attributes[j].name
                                                                                  }).data('jsonObj', attributes[j].jsonObj);;

                                                                                  var passwordField = false;
                                                                                  var passwordField = false;
                                                                                  var keyParts = keyString.split('/');
                                                                                  if (keyParts.length) {
                                                                                      var indexOfPassword = keyParts[keyParts.length - 1].indexOf('password_');
                                                                                      if (indexOfPassword !== -1) {
                                                                                          passwordField = true;
                                                                                      }
                                                                                  }

                                                                                  var $tdAttributeKey = $('<td/>').html(attributes[j].name);
                                                                                  if (passwordField) {
                                                                                      var $tdAttributeVal = $('<td/>').html("*****");
                                                                                  } else {
                                                                                      var $tdAttributeVal = $('<td/>').html(obj[keys[i]]);
                                                                                  }
                                                                                  $tr.append($tdAttributeKey).append($tdAttributeVal);
                                                                                  $tbody.append($tr);
                                                                              }
                                                                          }
                                                                      }
                                                                      getVal(attributeObj, '');
                                                                  }
                                                              }
                                                              if (attributes) {
                                                                  createAttribTableRowFromJson(attributes);
                                                              }

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

                                                          function showRDP() {
                                                              if ($(this).hasClass('isStopedInstance')) {
                                                                  return false;
                                                              }
                                                          }
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
                                                              $.ajax({

                                                                  type: "GET",
                                                                  url: "/d4dMasters/getuser",
                                                                  success: function(usrdata) {

                                                                      // alert(JSON.stringify(data));
                                                                      //$("#liuserinfo").html("<i class=\"fa fa-user\"></i>&nbsp;<b>" + usrdata[0]['loginname'] + "</b>&nbsp;[" + usrdata[0]['userrolename'] + "]");
                                                                      var username = '';
                                                                      if (usrdata.user && usrdata.user.length) {
                                                                          if (usrdata.user[0].username) {
                                                                              username = usrdata.user[0].username.cn;
                                                                          }
                                                                      }
                                                                      console.log(username);
                                                                      $.get('sshShell.html?id=' + instanceId, function(data) {

                                                                          $sshModal.find('.modal-body').empty().append(data);
                                                                          $sshModal.find('#ssh-instanceId').val(instanceId);
                                                                          $sshModal.find('#ssh-sessionUser').val(username);
                                                                      });
                                                                  }
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
                                                                      var name = data.name;
                                                                      if (!name) {
                                                                          name = data.blueprintData.blueprintName;
                                                                      }
                                                                      return '<tr data-instanceId="' + data._id + '" data-blueprintName="' + name + '"></tr>';
                                                                  },
                                                                  getDomainRoleThumbnail: function() {
                                                                      return '<li class="domain-role-thumbnailDev"></li>';
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
                                                                      var imgPath;
                                                                      if (data.blueprintData.iconPath == undefined) {
                                                                          data.blueprintData.iconPath = 'img/logo.png';

                                                                      }
                                                                      return '<span class="domain-roles-icon" contenteditable="false"><img src="' + data.blueprintData.iconPath + '" style="margin-right:5px;margin-top:-10px;width:27px"/></span>';
                                                                  },
                                                                  getSpanHeadingMiddle: function(data) {
                                                                      var name = data.name;
                                                                      if (!name) {
                                                                          name = data.blueprintData.blueprintName;
                                                                      }
                                                                      return '<span class="cardHeadingTextoverflow" rel="tooltip" data-placement="top" data-original-title="' + name + '">' + name + '</span>' + '<a type="reset" href="#modalforInstanceEdit" data-backdrop="false" data-toggle="modal" class="glyphicon glyphicon-pencil editInstanceNameBtn" style="cursor:pointer;"></a></span>';
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
                                                                      if (data.bootStrapStatus === 'waiting') {
                                                                          console.log('polling bootStrapStatus');
                                                                          pollInstanceBootstrapState(data._id, 5000);
                                                                      }
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
                                                                  /*if ($instancesList.children().length === 5) {

                                          $item = $(cardTemplate.getItem());
                                          $instancesList = $(cardTemplate.getInstanceList());
                                          $item.append($instancesList);
                                          $divinstancescardview.append($item);
                                      }*/
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

                                                                  //var $dockerStatus = $('<img style="width:42px;height:42px;margin-left:32px;" alt="Docker" src="img/galleryIcons/Docker.png">').addClass('dockerenabledinstacne');
                                                                  //Updated from above to move docker image out of circle.
                                                                  if (data.docker.dockerEngineStatus != '' && data.docker.dockerEngineStatus != null) {
                                                                      var $dockerStatus = $('<img class="dockerIMG" whatever="2" alt="Docker" src="img/galleryIcons/Docker.png">').addClass('dockerenabledinstacne');
                                                                      $divComponentListContainer.append($dockerStatus);
                                                                  }
                                                              }

                                                              $rowContainter.append('<td></td>');
                                                              $rowContainter.append('<td><img src="' + data.blueprintData.iconPath + '" style="width:auto;height:30px;" /></td>');

                                                              var name = data.name;
                                                              if (!name) {
                                                                  name = data.blueprintData.blueprintName;
                                                              }
                                                              $rowContainter.append('<td class="instanceBlueprintName">' + '<span>' + name.toString().substring(0, 25) + '</span>' + '<a href="#modalforInstanceEdit" data-backdrop="false" data-toggle="modal" style="margin-left:10px" class="glyphicon glyphicon-pencil editInstanceNameBtn" style="cursor:pointer;"></a></td>');

                                                              function editInstanceNameHandler(e) {
                                                                  $('#instanceEditNew').trigger("reset");
                                                                  $('#instanceIDHiddenInput').val(data._id);
                                                                  var prevName = $divDomainRolesCaption.find('.cardHeadingTextoverflow').text();
                                                                  $('#instanceEditName').val(prevName);
                                                              }
                                                              $divDomainRolesCaption.find('.editInstanceNameBtn').click(editInstanceNameHandler);
                                                              $rowContainter.find('.editInstanceNameBtn').click(editInstanceNameHandler);
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
                                                                      if (k == 2) {
                                                                          break;
                                                                      }
                                                                      var url = data.appUrls[k].url;
                                                                      if (data.appUrls[k].url)
                                                                          url = url.replace('$host', data.instanceIP);
                                                                      var $anchor = "<span class='marginForURL'><a style='font-size:10px;' data-appUrlId='" + data.appUrls[k]._id + "' class='app-url' title='" + url + "' href='" + url + "'' target='_blank' >" + data.appUrls[k].name + "</a></span>";
                                                                      $divComponentListContainer.append($anchor);
                                                                      temp = temp + ' ' + $anchor;
                                                                  }
                                                              }

                                                              if (data.taskIds && data.taskIds.length) {
                                                                  $.post('../tasks', {
                                                                      taskIds: data.taskIds
                                                                  }, function(tasks) {
                                                                      var str = '';
                                                                      for (var ll = 0; ll < tasks.length; ll++) {
                                                                          if (ll == 2) {
                                                                              break;
                                                                          }
                                                                          var $taskIcon = $("<div class='tasksBlock'><img rel='tooltip' data-taskid='" + tasks[ll]._id + "' class='taskCardIMG' data-original-title='" + tasks[ll].name + "'  alt='task' style='cursor:pointer' src='img/tasks.png'/><div class='tasksLinks hidden'><a rel='tooltip' data-placement='top' data-original-title='Execute' data-toggle='modal' href='javascript:void(0)'' class='tableactionbutton taskLinkExecute'><img style='width:22px;' src='img/Execute.png' alt='execute'/></a><a style='margin-left:3px;' rel='tooltip' data-placement='top' data-original-title='History' data-toggle='modal' href='javascript:void(0)' class='tableactionbutton taskLinkHistory'><img style='width:22px' src='img/History.png' alt='History'/></a></div></div>");
                                                                          //for showing the hover

                                                                          if (ll == 1) {
                                                                              $taskIcon.find('img').attr('data-placement', 'bottom');
                                                                          }

                                                                          //click for tasks
                                                                          (function(taskId) {
                                                                              $taskIcon.attr('data-taskCardIconId', taskId).hover(function(e) {
                                                                                  $(this).find('.tasksLinks').removeClass('hidden');
                                                                                  //$('a[data-taskId="' + taskId + '"]').click();

                                                                              }, function() {
                                                                                  $(this).find('.tasksLinks').addClass('hidden');

                                                                              });
                                                                              $taskIcon.find('.taskLinkExecute').click(function(e) {
                                                                                  $('a[data-executeTaskId="' + taskId + '"]').click();
                                                                              });
                                                                              $taskIcon.find('.taskLinkHistory').click(function(e) {
                                                                                  $('a[data-historyTaskId="' + taskId + '"]').click();
                                                                              });
                                                                          })(tasks[ll]._id);
                                                                          $taskIcon.find('img').tooltip();
                                                                          $taskIcon.find('a').tooltip();
                                                                          $divComponentListContainer.append($taskIcon, '<br/><br/>');
                                                                      }
                                                                  });
                                                              }

                                                              //for task icon on card
                                                              if (data.taskIds && data.taskIds.length) {
                                                                  for (var ll = 0; ll < data.taskIds.length; ll++) {

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
                                                                                  $parent.find('.instance-bootstrap-ActionRDP a').attr('href', '/instances/rdp/' + data.instanceIP + '/3389');
                                                                                  $('tr[data-instanceId="' + instanceId + '"] td.instanceIPCol').html(data.instanceIP);
                                                                                  if (data.appUrls && data.appUrls.length) {
                                                                                      for (var k = 0; k < data.appUrls.length; k++) {
                                                                                          var url = data.appUrls[k].url;
                                                                                          url = url.replace('$host', data.instanceIP);
                                                                                          $('.app-url[data-appUrlId="' + data.appUrls[k]._id + '"]').attr('href', url);
                                                                                      }
                                                                                  }

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
                                                                  $.get('../instances/' + instanceId, function(data) {
                                                                      console.log(data);
                                                                      if (type === 'Stop') {
                                                                          var hasStopPermission = false;
                                                                          if (haspermission("instancestop", "execute")) {
                                                                              hasStopPermission = true;
                                                                          }
                                                                          if (!hasStopPermission) {
                                                                              bootbox.alert('User has No Permission to Stop an Instance').find('.bootbox-body').addClass('bootboxMODAL');
                                                                              return;
                                                                          }
                                                                          bootbox.confirm("Are you sure you want to&nbsp;" + type + "&nbsp;the instance&nbsp;-&nbsp;&quot;&nbsp;<b>" + data.name + "</b>&nbsp;&quot;", function(result) {
                                                                              if (!result) {
                                                                                  return;
                                                                              }
                                                                              makeRequest(url);
                                                                          });
                                                                      } else {
                                                                          makeRequest(url);
                                                                      }
                                                                  });
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

                                                              if (data.hardware.os == 'windows') {
                                                                  var $divActionRDPContainer = $('<div class="rdpContainer actionbutton"></div>').addClass('instance-bootstrap-ActionRDP').append($('<a class="rdpIcon"></a>').attr('href', '/instances/rdp/' + data.instanceIP + '/3389').attr('data-actionType', 'RDP').attr('rel', 'tooltip').attr('data-placement', 'top').attr('data-original-title', 'RDP'));
                                                                  $divActionBtnContainer.append($divActionRDPContainer);
                                                              }

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


                                                              $rowContainter.find('.instance-bootstrap-list-image').click(instanceUpdateRunlistHandler).data('runlist', data.runlist).data('jsonAttributes', data.attributes);
                                                              $li.find('.instance-bootstrap-list-image').click(instanceUpdateRunlistHandler).data('runlist', data.runlist).data('jsonAttributes', data.attributes);;

                                                              $rowContainter.find('.sshBtnContainer a').click(showSSHModal);
                                                              $li.find('.sshBtnContainer a').click(showSSHModal);

                                                              $rowContainter.find('.rdpContainer a').click(showRDP);
                                                              $li.find('.rdpContainer a').click(showRDP);


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
                                                              if (!data.providerId) {

                                                                  var $parentTrNew = $('#tableinstanceview tr[data-instanceId="' + data._id + '"] td div.startstoptoggler');
                                                                  disableInstanceStartStopActionBtns(data._id, data.hardware.os);
                                                                  $('.domain-roles').find('[data-instanceid="' + data._id + '"]').find('.startstoptoggler').removeClass('running').addClass('shutdown');
                                                                  $parentTrNew.removeClass('running').addClass('shutdown');
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
                                                              } else {
                                                                  $cardViewInstanceId.find('.instance-bootstrap-ActionRDP a').removeClass('isStopedInstance').removeClass('rdpIcondisable').addClass('rdpIcon');
                                                                  $tableViewInstanceId.find('.instance-bootstrap-ActionRDP a').removeClass('isStopedInstance').removeClass('rdpIcondisable').addClass('rdpIcon');
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
                                                              $cardViewInstanceId.find('.instance-bootstrap-ActionRDP a').addClass('isStopedInstance').removeClass('rdpIcon').addClass('rdpIcondisable');
                                                              $tableViewInstanceId.find('.instance-bootstrap-ActionRDP a').addClass('isStopedInstance').removeClass('rdpIcon').addClass('rdpIcondisable');
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
                                                              $cardViewInstanceId.find('.instance-bootstrap-ActionRDP a').addClass('isStopedInstance').removeClass('rdpIcon').addClass('rdpIcondisable');
                                                              $tableViewInstanceId.find('.instance-bootstrap-ActionRDP a').addClass('isStopedInstance').removeClass('rdpIcon').addClass('rdpIcondisable');
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
                                                              } else {
                                                                  $cardViewInstanceId.find('.instance-bootstrap-ActionRDP a').removeClass('isStopedInstance').removeClass('rdpIcondisable').addClass('rdpIcon');
                                                                  $tableViewInstanceId.find('.instance-bootstrap-ActionRDP a').removeClass('isStopedInstance').removeClass('rdpIcondisable').addClass('rdpIcon');
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
                                                              bindClick_dockercontainertablerefreshbutton();
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

                                                                          var $itemBody = $('<div></div>').addClass('productdiv1 cardimage').attr('data-blueprintId', data[i]._id).attr('data-blueprintType', data[i].blueprintType).attr('data-projectId', data[i].projectId).attr('data-envId', data[i].envId).attr('data-chefServerId', data[i].chefServerId).attr('data-templateType', data[i].templateType);
                                                                          var $ul = $('<ul></ul>').addClass('list-unstyled system-prop').css({
                                                                              'text-align': 'center'
                                                                          });
                                                                          var $img
                                                                          if (data[i].iconpath)
                                                                              $img = $('<img />').attr('src', data[i].iconpath).attr('alt', data[i].name).addClass('cardLogo');
                                                                          else
                                                                              $img = $('<img />').attr('src', 'img/logo.png').attr('alt', data[i].name).addClass('cardLogo');
                                                                          var $liImage = $('<li></li>').append($img);
                                                                          $ul.append($liImage);

                                                                          var $liCardName = $('<li title="' + data[i].name + '"></li>').addClass('Cardtextoverflow').html('<u><b>' + data[i].name + '</b></u>');

                                                                          $ul.append($liCardName);
                                                                          var $selecteditBtnContainer = $('<div style="position:absolute;padding-left:27px;bottom:11px;"></div>');
                                                                          // if (data[i].blueprintConfig.infraManagerData && data[i].blueprintConfig.infraManagerData.versionsList) {

                                                                          var $selectVerEdit = $('<a style="padding:0px 4px;margin-left:3px;border-radius:5px;" class="bpEditBtn"><i class="ace-icon fa fa-pencil"></i></a>').addClass('btn btn-primary').attr('rel', 'tooltip').attr('data-placement', 'top').attr('data-original-title', 'Edit');
                                                                          var $selectVer = null;
                                                                          var tagLabel = '';
                                                                          //Docker Check

                                                                          if (data[i].templateType == "Docker") {

                                                                              console.log("docker", data[i].blueprintConfig);
                                                                              //$selectVer = $('<select style="padding:1px;"></select>').addClass('blueprintVersionDropDown').attr('data-blueprintId', data[i]._id);
                                                                              $img.attr('src', 'img/galleryIcons/Docker.png');
                                                                              $selectVer = $('<select style="padding:1px;margin-right:5px;"></select>').addClass('dockerrepotagselect').attr('data-blueprintId', data[i]._id);
                                                                              $itemBody.attr('dockerreponame', data[i].blueprintConfig.dockerRepoName);
                                                                              $itemBody.attr('dockerrepotags', data[i].blueprintConfig.dockerRepoTags);
                                                                              $itemBody.attr('dockercontainerpaths', data[i].blueprintConfig.dockerContainerPaths);
                                                                              $itemBody.attr('dockercompose', JSON.stringify(data[i].blueprintConfig.dockerCompose));

                                                                              if (data[i].dockerlaunchparameters)
                                                                                  $itemBody.attr('dockerlaunchparameters', 't ' + data[i].blueprintConfig.dockerLaunchParameters);

                                                                              if (typeof data[i].blueprintConfig.dockerCompose != 'undefined') {
                                                                                  data[i].blueprintConfig.dockerCompose.forEach(function(k, v) {
                                                                                      var $liDockerRepoName = $('<li title="Docker Repo Name" class="dockerimagetext" style="text-align:left;margin-left:15px" ><i class="fa fa-check-square" style="padding-right:5px"/>' + data[i].blueprintConfig.dockerCompose[v]["dockercontainerpathstitle"] + '</li>');
                                                                                      $ul.append($liDockerRepoName);
                                                                                  });
                                                                              }
                                                                              //Commented below to accomodate docker compose
                                                                              // var $liDockerRepoName = $('<li title="Docker Repo Name" ><i class="fa fa-check-square" style="padding-right:5px"/>' + data[i].dockerreponame + '</li>');
                                                                              //$ul.append($liDockerRepoName);
                                                                              //commented to handle compose.
                                                                              // if (data[i].dockerrepotags && data[i].dockerrepotags != '') {
                                                                              //     $selectVer.empty();
                                                                              //     var dockerrepostags = data[i].dockerrepotags.split(',');
                                                                              //     $.each(dockerrepostags, function(k) {
                                                                              //         $selectVer.append('<option value="' + dockerrepostags[k] + '">' + dockerrepostags[k] + '</option>');
                                                                              //     });
                                                                              // }
                                                                              $selectVer.hide();

                                                                              $selectVerEdit.hide();
                                                                              //Commented below to accomodate docker compose
                                                                              // tagLabel = '<span>Tags&nbsp;</span';
                                                                              tagLabel = '';
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
                                                                                      $ccrs.find('#cookbooksrecipesselectedList').attr('data-blueprintId', blueprintId);
                                                                                      $blueprintEditResultContainer.find('.modal-body').empty().append($ccrs).data('$ccrs', $ccrs);



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
                                                                              for (var j = 0; j < data[i].blueprintConfig.infraManagerData.versionsList.length; j++) {
                                                                                  var $options = $('<option></option>').append(data[i].blueprintConfig.infraManagerData.versionsList[j].ver).val(data[i].blueprintConfig.infraManagerData.versionsList[j].ver);
                                                                                  $selectVer.append($options);
                                                                              }
                                                                          }
                                                                          $selecteditBtnContainer.append($li);

                                                                          //}
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

                                                          function addDockerTemplateToTable(title, repopath, tagname, reponame, launchparam) {
                                                              var $cdt = $('#compositedockertable');
                                                              var uniqueid = (Math.floor(Math.random() * 9000) + 1000) + '-' + (Math.floor(Math.random() * 9000) + 1000); //$.now();
                                                              var $dockertemplaterow = '<tr class="dockerimagesrow"><td >' + $cdt.find('tr').length + '</td><td paramtype="dockercontainerpathstitle">' + title + '</td><td  paramtype="dockercontainerpaths">' + repopath + '</td><td paramtype="dockerrepotags">' + tagname + '</td><td><input type="text" paramtype="dockerlaunchparameters" id="launchparam' + uniqueid + '" class="" value="' + launchparam + '"><a uniqueid="' + uniqueid + '"  class="lnktolaunchparam" href="javascript:void(0);"><i class="icon-append fa fa-list-alt fa-lg" title="Launch Parameters"></i></a><input type="hidden" paramtype="dockerreponame" id="dockerreponame' + uniqueid + '" class="" value="' + reponame + '"></td><td ><a class="dockerimageselectorup" id="dockerimageselectorup' + uniqueid + '" uniqueid="' + uniqueid + '"  href="javascript:void(0);"><i class="fa fa-chevron-circle-up fa-lg"></i></a><a class="dockerimageselectordown" id="dockerimageselectordown' + uniqueid + '" uniqueid="' + uniqueid + '" href="javascript:void(0);" style="padding-left:5px;"><i class="fa fa-chevron-circle-down fa-lg"></i></a><button class="btn btn-xs btn-danger pull-right hidden" value="Remove" title="Remove" id="dockerimageremove' + uniqueid + '" onClick="javascript:removeimage(\'dockerimageremove\',' + uniqueid + ');"><i class="ace-icon fa fa-trash-o fa-lg"></i></button></td></tr>';
                                                              // var $dockertemplaterow = '<tr class="dockerimagesrow"><td  paramtype="order">' + $cdt.find('tr').length + '</td><td paramtype="repotitle">' + title + '</td><td  paramtype="repopath">' + repopath + '</td><td paramtype="repotag">' + tagname + '</td><td  paramtype="launchparams"><a onclick="loadLaunchParams(\'launchparamlink' + $cdt.find('tr').length  + '\');" href="javascript:void(0);"><input type="text" id="launchparam' +  + '" class="hidden"><i class="icon-append fa fa-list-alt fa-lg" title="Launch Parameters"></i></a></td><td  paramtype="move"><a class="dockerimageselectorup" id="dockerimageselectorup' + $cdt.find('tr').length + '"  href="javascript:movetablerow(\'dockerimageselectorup\',' + $cdt.find('tr').length + ');"><i class="fa fa-chevron-circle-up fa-lg"></i></a><a class="dockerimageselectordown" id="dockerimageselectordown' + $cdt.find('tr').length + '" href="javascript:movetablerow(\'dockerimageselectordown\',' + $cdt.find('tr').length + ');" style="padding-left:5px;"><i class="fa fa-chevron-circle-down fa-lg"></i></a><button class="btn btn-xs btn-danger pull-right" value="Remove" title="Remove" id="dockerimageremove' + $cdt.find('tr').length  + '" onClick="javascript:removeimage(\'dockerimageremove\',' + $cdt.find('tr').length + ');"><i class="ace-icon fa fa-trash-o fa-lg"></i></button></td></tr>';
                                                              $cdt.append($dockertemplaterow);
                                                          }

                                                          function bindClick_dockercontainertablerefreshbutton() {
                                                              $('#dockercontainertablerefreshbutton').click(function() {
                                                                  $('#dockercontainertablerefreshspinner').addClass('fa-spin');
                                                                  loadContainersTable();

                                                              });
                                                          }
                                                          //Launching Blueprints when the user clicks on the launch button in blueprints tab
                                                          function bindClick_LaunchBtn() {
                                                              //Docker compose handling
                                                              function generateDockerLaunchParams() {
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
                                                                  //alert('generateDockerLaunchParams : ' + launchparams.join(' '));
                                                                  return (launchparams);
                                                              }

                                                              function renumberDockerImageTable() {
                                                                  var $cdt = $('#compositedockertable').find('tr').each(function(i) {
                                                                      $(this).find('td').first().html(i);
                                                                  });

                                                              }

                                                              function movetablerow(what, index) {
                                                                  //alert('hit');
                                                                  var $lnk = $('#' + what + index);
                                                                  // var $row = $lnk.parent().parent().parent(); //current row
                                                                  // if (what === "dockerimageselectorup") {
                                                                  //     $row.insertBefore($row.prev());
                                                                  // } else if (what === "dockerimageselectordown") {
                                                                  //     $row.insertAfter($row.next());
                                                                  // } 
                                                                  var row = $lnk.closest('.dockerimagesrow');
                                                                  if (what === "dockerimageselectorup") {
                                                                      var prev = row.prev();
                                                                      if (prev.is('tr.dockerimagesrow')) {
                                                                          row.detach();
                                                                          prev.before(row);
                                                                          row.fadeOut();
                                                                          row.fadeIn();
                                                                      }
                                                                  } else {
                                                                      var next = row.next();
                                                                      if (next.is('tr.dockerimagesrow')) {
                                                                          row.detach();
                                                                          next.after(row);
                                                                          row.fadeOut();
                                                                          row.fadeIn();
                                                                      }
                                                                  }
                                                                  renumberDockerImageTable();
                                                              }

                                                              function loadLaunchParams(lpinput) {
                                                                  // var lparam = $('.productdiv1.role-Selected1').first().attr('dockerlaunchparameters');
                                                                  var lparam = $('#' + lpinput).val();
                                                                  //alert(lpinput);
                                                                  if (lparam && lparam != '') {
                                                                      $('[dockerparamkey]').val(''); //clearing the popup input boxes
                                                                      //split by -c to get startup and other parameters
                                                                      var fullparams = $('#' + lpinput).val();
                                                                      var execparam = fullparams.split(' -exec');
                                                                      var startupparam;
                                                                      if (execparam.length > 0 && typeof execparam[1] != "undefined") {
                                                                          // alert(execparam[1]);
                                                                          $('#additionalStartupcommandfield').val(execparam[1].trim());
                                                                          if (execparam[0].indexOf('-c') > 0) //found a startup command
                                                                          {
                                                                              startupparam = execparam[0].split(' -c');
                                                                              if (startupparam.length > 0) {
                                                                                  $('#Startupcommandfield').val(startupparam[1].trim());
                                                                                  fullparams = startupparam[0];
                                                                              } else {
                                                                                  fullparams = startupparam[0];
                                                                              }
                                                                          } else
                                                                              fullparams = execparam[0];
                                                                      } else {
                                                                          startupparam = fullparams.split(' -c');
                                                                          if (startupparam.length > 0) {
                                                                              $('#Startupcommandfield').val(startupparam[1].trim());
                                                                              fullparams = startupparam[0];
                                                                          }
                                                                      }


                                                                      var params = fullparams.split(' -');
                                                                      for (para in params) {
                                                                          var subparam = params[para].split(' ');
                                                                          if (subparam.length > 0) {
                                                                              $inp = $('[dockerparamkey="-' + subparam[0] + '"]').first();
                                                                              if ($inp.val() != '')
                                                                                  $inp.val($inp.val() + ',' + subparam[1]);
                                                                              else
                                                                                  $inp.val(subparam[1]);
                                                                          }
                                                                      }
                                                                      //Updating the startup parameter
                                                                      // $('[dockerparamkey="-c"]').first().val(cparams);
                                                                  } else
                                                                      $('[dockerparamkey]').val('');
                                                                  $('#myModalLabelDockerContainer').attr('saveto', lpinput).css('z-index', '9999').modal('show');
                                                              };
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

                                                                      $('.oldlaunchparams').empty(); //clearing the old div for composite blue print.
                                                                      // alert('in test');
                                                                      //Force hiding the start button
                                                                      $('.dockerinstancestart').first().addClass('hidden');

                                                                      var cardCount = $('.instancesList').find('.componentlistContainer:not(.stopped)').length;

                                                                      if (cardCount === 0) {
                                                                          bootbox.alert('No instances available.Kindly Launch one instance');
                                                                          return;
                                                                      }
                                                                      //commented below to have a composite bp for docker
                                                                      // loadLaunchParams();
                                                                      //Loading table for all docker images for compose

                                                                      var dockercompose = JSON.parse($selectedItems.attr('dockercompose'));
                                                                      //alert('hit');
                                                                      $('#compositedockertable tr.dockerimagesrow').detach(); //clearing previously loaded table.
                                                                      dockercompose.forEach(function(k, v) {
                                                                          // alert(dockercompose[v]["dockercontainerpaths"]);
                                                                          addDockerTemplateToTable(dockercompose[v]["dockercontainerpathstitle"], dockercompose[v]["dockercontainerpaths"], dockercompose[v]["dockerrepotags"], dockercompose[v]["dockerreponame"], dockercompose[v]["dockerlaunchparameters"]);
                                                                      });
                                                                      //onclick="loadLaunchParams(\'launchparam' + uniqueid + '\');
                                                                      $('.lnktolaunchparam').click(function() { //binding clicks for launch params
                                                                          loadLaunchParams('launchparam' + $(this).attr('uniqueid'));
                                                                      });

                                                                      $('.dockerimageselectordown').click(function() {
                                                                          movetablerow('dockerimageselectordown', $(this).attr('uniqueid'));
                                                                      });

                                                                      $('.dockerimageselectorup').click(function() {
                                                                          movetablerow('dockerimageselectorup', $(this).attr('uniqueid'));
                                                                      });

                                                                      $('.btnaddDockerLaunchParams').click(function() {
                                                                          var lp = generateDockerLaunchParams();
                                                                          if (lp != '') {
                                                                              //        launchparams[0] = preparams;
                                                                              // launchparams[1] = startparams;
                                                                              // // alert(execparam);
                                                                              // launchparams[2] = execparam;
                                                                              $('#' + $('#myModalLabelDockerContainer').attr('saveto')).val(lp[0] + ' -c ' + lp[1] + ' -exec ' + lp[2]);
                                                                              $('#myModalLabelDockerContainer').removeAttr('saveto').modal('hide');
                                                                          }
                                                                      });

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
                                                                  if ($selectedItems.length) {
                                                                      var projectId = $($selectedItems.get(0)).attr('data-projectId');
                                                                      var envId = $($selectedItems.get(0)).attr('data-envId');
                                                                      var blueprintId = $($selectedItems.get(0)).attr('data-blueprintId');
                                                                      var version = $($selectedItems.get(0)).find('.blueprintVersionDropDown').val();
                                                                      var blueprintType = $($selectedItems.get(0)).attr('data-blueprintType');
                                                                      // alert('launching -> ' +'../blueprints/' + blueprintId + '/launch?version=' + version);
                                                                      $.get('/blueprints/' + blueprintId + '/launch?version=' + version + '&envId=' + urlParams['envid'], function(data) {

                                                                          var $msg = $('<div></div>').append('<h3 class=\"alert alert-success\"><b>Congratulations!</b> Blueprint Launched Successfully</h3>').append('Instance Id : ' + data.id).append('<br/>Instance Logs :- ');

                                                                          $launchResultContainer.find('.modal-body').empty();
                                                                          $launchResultContainer.find('.modal-body').append($msg);
                                                                          if (blueprintType === 'aws_cf') {
                                                                              return;
                                                                          }

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
                                                                  var $ccrs = $blueprintEditResultContainer.find('.modal-body').data('$ccrs');

                                                                  var $selectedRunlist = $ccrs.find('#cookbooksrecipesselectedList');
                                                                  var blueprintId = $ccrs.find('#cookbooksrecipesselectedList').attr('data-blueprintId');
                                                                  if (blueprintId) {
                                                                      var runlist = $ccrs.getSelectedRunlist();


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
                                                                      var $ccrs = $chefRunModalContainer.find('.chefRunlistContainer').data('$ccrs');


                                                                      var instanceId = $ccrs.find('#cookbooksrecipesselectedList').attr('data-instanceId');

                                                                      var runlist = $ccrs.getSelectedRunlist();

                                                                      if (!runlist.length) {
                                                                          bootbox.alert('Runlist is empty');
                                                                          return;
                                                                      }

                                                                      console.log(runlist);

                                                                      $trAttribute = $chefRunModalContainer.find('.attributesViewTableBody tr');
                                                                      var attributes = [];
                                                                      $trAttribute.each(function() {
                                                                          var $tr = $(this);
                                                                          attributes.push({
                                                                              name: $tr.attr('data-attributeName'),
                                                                              jsonObj: $tr.data('jsonObj')
                                                                          });
                                                                      });

                                                                      $.post('../instances/' + instanceId + '/updateRunlist', {
                                                                          runlist: runlist,
                                                                          jsonAttributes: attributes
                                                                      }, function(data) {
                                                                          $chefRunModalContainer.modal('hide');
                                                                          var $parent = $('.domain-roles-caption[data-instanceId="' + instanceId + '"]');
                                                                          var $parentTr = $('#tableinstanceview tr[data-instanceId="' + instanceId + '"]');
                                                                          //console.log($('.domain-roles-caption[data-instanceId="' + instanceId + '"]'), $parent.find('.instance-bootstrap-list-image'));
                                                                          $parent.find('.instance-bootstrap-list-image').data('runlist', runlist).data('jsonAttributes', attributes);

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

                                                              $('.editChefClientRunAttribBtn').click(function(e) {
                                                                  var $chefRunModalContainer = $('#chefRunModalContainer');
                                                                  var $ccrs = $chefRunModalContainer.find('.chefRunlistContainer').data('$ccrs');


                                                                  var instanceId = $ccrs.find('#cookbooksrecipesselectedList').attr('data-instanceId');

                                                                  var runlist = $ccrs.getSelectedRunlist();

                                                                  if (!runlist.length) {
                                                                      bootbox.alert('Runlist is empty');
                                                                      return;
                                                                  }
                                                                  //$chefRunModalContainer.modal('hide');
                                                                  var $modal = $('#chefClientRunAttributesModal');
                                                                  $modal.find('.attributesEditFormArea').hide();
                                                                  $modal.find('.errorMsgContainer').hide();
                                                                  $modal.find('.loadingContainer').show();
                                                                  $modal.modal('show');

                                                                  var reqBody = {
                                                                      cookbooks: [],
                                                                      roles: []
                                                                  }
                                                                  for (var i = 0; i < runlist.length; i++) {

                                                                      if (runlist[i].indexOf('recipe') === 0) {
                                                                          className = 'cookbook';
                                                                      } else {
                                                                          className = 'roles';
                                                                      }
                                                                      var name = '';
                                                                      var item = runlist[i];
                                                                      var indexOfBracketOpen = item.indexOf('[');
                                                                      if (indexOfBracketOpen != -1) {
                                                                          var indexOfBracketClose = item.indexOf(']');
                                                                          if (indexOfBracketClose != -1) {
                                                                              name = item.substring(indexOfBracketOpen + 1, indexOfBracketClose);
                                                                          }
                                                                      }
                                                                      if (runlist[i].indexOf('recipe') === 0) {
                                                                          reqBody.cookbooks.push(name);
                                                                      } else {
                                                                          reqBody.roles.push(name);
                                                                      }

                                                                  }
                                                                  var $tbody = $modal.find('.attributesEditTableBody');
                                                                  $tbody.empty();
                                                                  var chefServerId = $ccrs.getChefServerId();
                                                                  $.post('../chef/servers/' + chefServerId + '/attributes', reqBody, function(attributesList) {
                                                                      //var dataTable = $('#attributesEditListArea').DataTable();
                                                                      //dataTable.clear();
                                                                      var $chefRunModalContainer = $('#chefRunModalContainer');
                                                                      var $tbodyViewAttributes = $chefRunModalContainer.find('.attributesViewTableBody');

                                                                      for (var i = 0; i < attributesList.length; i++) {
                                                                          var attributesNamesList = Object.keys(attributesList[i].attributes);
                                                                          for (var j = 0; j < attributesNamesList.length; j++) {
                                                                              var $tr = $('<tr/>');
                                                                              var displayName = attributesNamesList[j];
                                                                              if (attributesList[i].attributes[attributesNamesList[j]].display_name) {
                                                                                  displayName = attributesList[i].attributes[attributesNamesList[j]].display_name;
                                                                              }
                                                                              var $tdAttribName = $('<td/>').html(displayName);
                                                                              var required = false;
                                                                              if (attributesList[i].attributes[attributesNamesList[j]]['required'] === 'required') {
                                                                                  $tdAttribName.append('<span class="control-label" style="color:Red;">&nbsp;*</span>');
                                                                                  required = true;
                                                                              }
                                                                              var value = '';
                                                                              if (attributesList[i].attributes[attributesNamesList[j]]['default']) {
                                                                                  value = attributesList[i].attributes[attributesNamesList[j]]['default'];
                                                                              }
                                                                              var $trView = $tbodyViewAttributes.find('tr[data-attributeKey="' + attributesNamesList[j] + '"]');
                                                                              if ($trView.length) {
                                                                                  value = $trView.attr('data-attributeValue');
                                                                              }

                                                                              var $attributeInput;
                                                                              var choices = attributesList[i].attributes[attributesNamesList[j]].choice;
                                                                              if (choices && choices.length) {
                                                                                  $attributeInput = $('<select class="attribValueInput" data-attribKey="' + attributesNamesList[j] + '" data-attribName="' + displayName + '" data-attributeRequired="' + required + '"></select>');
                                                                                  for (var k = 0; k < choices.length; k++) {
                                                                                      var $option = $('<option></option>').val(choices[k]).html(choices[k]);
                                                                                      $attributeInput.append($option);
                                                                                  }
                                                                                  $attributeInput.val(value);
                                                                              } else {
                                                                                  var passwordField = false;
                                                                                  var keyParts = attributesNamesList[j].split('/');
                                                                                  if (keyParts.length) {
                                                                                      var indexOfPassword = keyParts[keyParts.length - 1].indexOf('password_');
                                                                                      if (indexOfPassword !== -1) {
                                                                                          passwordField = true;
                                                                                      }
                                                                                  }
                                                                                  if (passwordField) {
                                                                                      $attributeInput = $('<input type="password" class="attribValueInput" data-attribKey="' + attributesNamesList[j] + '" value="' + value + '" data-attribName="' + displayName + '" data-attributeRequired="' + required + '"/>');
                                                                                  } else {
                                                                                      $attributeInput = $('<input type="text" class="attribValueInput" data-attribKey="' + attributesNamesList[j] + '" value="' + value + '" data-attribName="' + displayName + '" data-attributeRequired="' + required + '"/>');
                                                                                  }

                                                                              }

                                                                              var $tdAttribEditor = $('<td/>').append($attributeInput);
                                                                              var desc = attributesList[i].attributes[attributesNamesList[j]]['description'];
                                                                              if (desc) {
                                                                                  var $tooltipAnchor = $('<a href="#" data-toggle="tooltip" title="' + desc + '!" style="margin-left:15px"><i class="fa fa-info"></i></a>');
                                                                                  $tooltipAnchor.tooltip();
                                                                                  $tdAttribEditor.append($tooltipAnchor);
                                                                              }
                                                                              $tr.append($tdAttribName).append($tdAttribEditor);
                                                                              //dataTable.row.add($tr).draw();
                                                                              $tbody.append($tr)
                                                                          }
                                                                      }
                                                                      $modal.find('.errorMsgContainer').hide();
                                                                      $modal.find('.loadingContainer').hide();
                                                                      $modal.find('.attributesEditFormArea').show();

                                                                  }).fail(function(e) {
                                                                      $modal.find('.errorMsgContainer').html('Unable to fetch attributes. Please try again later').show();
                                                                      $modal.find('.loadingContainer').hide();
                                                                      $modal.find('.attributesEditFormArea').hide();
                                                                  });

                                                              });

                                                              $('.btnSaveInstanceRunlistAttributes').click(function(e) {
                                                                  var $modal = $('#chefClientRunAttributesModal');
                                                                  var $input = $modal.find('.attribValueInput');
                                                                  var attributes = [];
                                                                  for (var j = 0; j < $input.length; j++) {
                                                                      var $this = $($input[j]);
                                                                      var attributeKey = $this.attr('data-attribKey');
                                                                      console.log(attributeKey);
                                                                      var attribValue = $this.val();
                                                                      if (attribValue) {
                                                                          var attribPathParts = attributeKey.split('/');
                                                                          var attributeObj = {};
                                                                          var currentObj = attributeObj;
                                                                          for (var i = 0; i < attribPathParts.length; i++) {
                                                                              if (!currentObj[attribPathParts[i]]) {
                                                                                  if (i === attribPathParts.length - 1) {
                                                                                      currentObj[attribPathParts[i]] = attribValue;
                                                                                      continue;
                                                                                  } else {
                                                                                      currentObj[attribPathParts[i]] = {};
                                                                                  }
                                                                              }
                                                                              currentObj = currentObj[attribPathParts[i]];
                                                                          }
                                                                          attributes.push({
                                                                              name: $this.attr('data-attribName'),
                                                                              jsonObj: attributeObj
                                                                          });
                                                                      } else {
                                                                          if ($this.attr('data-attributeRequired') === 'true') {
                                                                              alert("Please fill in the required attributes");
                                                                              return false;
                                                                          }
                                                                      }
                                                                  }

                                                                  //$('#attrtextarea').text(JSON.stringify(attributeObj));

                                                                  function createAttribTableRowFromJson(attributes) {
                                                                      var $chefRunModalContainer = $('#chefRunModalContainer')
                                                                      var $tbody = $chefRunModalContainer.find('.attributesViewTableBody').empty();
                                                                      for (var j = 0; j < attributes.length; j++) {
                                                                          var attributeObj = attributes[j].jsonObj;

                                                                          function getVal(obj, currentKey) {
                                                                              var keys = Object.keys(obj);
                                                                              for (var i = 0; i < keys.length; i++) {
                                                                                  if (typeof obj[keys[i]] === 'object') {
                                                                                      getVal(obj[keys[i]], currentKey + '/' + keys[i]);
                                                                                  } else {
                                                                                      var keyString = currentKey + '/' + keys[i];
                                                                                      keyString = keyString.substring(1);

                                                                                      var $tr = $('<tr/>').attr({
                                                                                          'data-attributeKey': keyString,
                                                                                          'data-attributeValue': obj[keys[i]],
                                                                                          'data-attributeName': attributes[j].name
                                                                                      }).data('jsonObj', attributes[j].jsonObj);;

                                                                                      var passwordField = false;
                                                                                      var passwordField = false;
                                                                                      var keyParts = keyString.split('/');
                                                                                      if (keyParts.length) {
                                                                                          var indexOfPassword = keyParts[keyParts.length - 1].indexOf('password_');
                                                                                          if (indexOfPassword !== -1) {
                                                                                              passwordField = true;
                                                                                          }
                                                                                      }

                                                                                      var $tdAttributeKey = $('<td/>').html(attributes[j].name);
                                                                                      if (passwordField) {
                                                                                          var $tdAttributeVal = $('<td/>').html("*****");
                                                                                      } else {
                                                                                          var $tdAttributeVal = $('<td/>').html(obj[keys[i]]);
                                                                                      }
                                                                                      $tr.append($tdAttributeKey).append($tdAttributeVal);
                                                                                      $tbody.append($tr);
                                                                                  }
                                                                              }
                                                                          }
                                                                          getVal(attributeObj, '');
                                                                      }
                                                                  }
                                                                  createAttribTableRowFromJson(attributes);
                                                                  $modal.modal('hide');
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

                                                              $('#assignedExecute').on('show.bs.modal', function() {
                                                                  $('#assignedTaskHistory').css('z-index', 1030);
                                                              });

                                                              $('#assignedExecute').on('hidden.bs.modal', function() {
                                                                  $('#assignedTaskHistory').css('z-index', 1040);
                                                              });

                                                              function getUpdatedData(dat) {
                                                                  var obj;
                                                                  var list = $('#tableOrchestration').find('tr[data-taskid]'),
                                                                      available = [],
                                                                      key = [],
                                                                      index;
                                                                  if (list.length) {
                                                                      for (var i = 0; i < dat.length; i++) {
                                                                          key.push(data[i]._id);
                                                                          if ($('#tableOrchestration').find('tr[data-taskid="' + dat[i]._id + '"]').length) {
                                                                              available.push(data[i]._id);
                                                                          }
                                                                      }
                                                                      if (available.length) {
                                                                          for (var x = 0; x < available.length; x++) {
                                                                              index = $.inArray(available[x], key);
                                                                              key.splice(index, 1);
                                                                              dat.splice(index, 1);
                                                                          }
                                                                      }
                                                                      obj = dat;
                                                                  } else {
                                                                      obj = dat;
                                                                  }
                                                                  return obj;
                                                              }
                                                              data = getUpdatedData(data);
                                                              if (!$.fn.dataTable.isDataTable('#tableOrchestration')) {
                                                                  //var $taskListArea = $('.taskListArea').empty();
                                                                  var $taskDatatable = $('#tableOrchestration').DataTable({
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
                                                                          }, {
                                                                              "bSortable": false
                                                                          }
                                                                      ]

                                                                  });
                                                              }
                                                              if (!$.fn.dataTable.isDataTable('#tablehistoryTask')) {
                                                                  //var $taskListArea = $('.taskListArea').empty();
                                                                  var $taskHistoryDatatable = $('#tablehistoryTask').DataTable({
                                                                      "pagingType": "full_numbers",
                                                                      "aoColumns": [
                                                                          null, {
                                                                              "bSortable": true
                                                                          }, {
                                                                              "bSortable": true
                                                                          }, {
                                                                              "bSortable": true
                                                                          }, {
                                                                              "bSortable": true
                                                                          }, {
                                                                              "bSortable": false
                                                                          }
                                                                      ]

                                                                  });
                                                              }

                                                              $('#tablehistoryTask_length').hide();
                                                              $('#tablehistoryTask_filter').hide();

                                                              function showTaskLogs() {
                                                                  var $taskExecuteTabsHeaderContainer = $('#taskExecuteTabsHeader').empty();
                                                                  var $taskExecuteTabsContent = $('#taskExecuteTabsContent').empty();
                                                                  var $modal = $('#assignedExecute');
                                                                  $modal.find('.loadingContainer').hide();
                                                                  $modal.find('.errorMsgContainer').hide();
                                                                  var $outputArea = $modal.find('.outputArea').show();
                                                                  var taskType = $outputArea.data('taskType');
                                                                  if (taskType === 'chef') {


                                                                      var instances = $outputArea.data('instances');
                                                                      for (var i = 0; i < instances.length; i++) {
                                                                          var nodeName = instances[i].chef.chefNodeName;
                                                                          if (instances[i].instanceIP) {
                                                                              var nodeName = instances[i].instanceIP;
                                                                          }
                                                                          if (instances[i].name) {
                                                                              nodeName = instances[i].name;
                                                                          }
                                                                          var $liHeader = $('<li><a href="#tab_' + instances[i]._id + '" data-toggle="tab" data-taskInstanceId="' + instances[i]._id + '" data-taskActionLogId="' + instances[i].tempActionLogId + '">' + nodeName + '</a></li>');
                                                                          if (i === 4) {
                                                                              var $liMoreHeader = $('<li class="dropdown dropdownlog"><a href="javascript:void(0);" class="dropdown-toggle" data-toggle="dropdown">More... <b class="caret"></b></a><ul class="dropdown-menu"></ul></li>');

                                                                              $taskExecuteTabsHeaderContainer.append($liMoreHeader);

                                                                              $taskExecuteTabsHeaderContainer = $liMoreHeader.find('ul');

                                                                          }
                                                                          $taskExecuteTabsHeaderContainer.append($liHeader);
                                                                          var $tabContent = $('<div class="tab-pane fade" id="tab_' + instances[i]._id + '"><div class="taskLogArea chefLOGS"></div></div>');
                                                                          $taskExecuteTabsContent.append($tabContent);
                                                                      }
                                                                      //shown event



                                                                      $('#taskExecuteTabsHeader').find('a[data-toggle="tab"]').each(function(e) {
                                                                          $(this).attr('data-taskPolling', 'true');
                                                                          var timestamp = $outputArea.data('timestampStarted');
                                                                          if (!timestamp) {
                                                                              timestamp = new Date().getTime();
                                                                          }
                                                                          $(this).attr('data-taskPollLastTimestamp', timestamp);


                                                                          var timestampEnded = $outputArea.data('timestampEnded');
                                                                          if (timestampEnded) {
                                                                              $(this).attr('data-taskPollTimestampEnded', timestampEnded);
                                                                          }
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
                                                                      var $tabContent = $('<div class="tab-pane fade" id="tab_jenkinsTask"><div class="taskLogArea taskLOGS"></div></div>');
                                                                      $taskExecuteTabsContent.append($tabContent);
                                                                      $liHeader.find('a').click();
                                                                      var jenkinsServerId = $outputArea.data('jenkinsServerId');
                                                                      var jobName = $outputArea.data('jobName');
                                                                      var lastBuildNumber = $outputArea.data('lastBuildNumber');
                                                                      var buildNumber = $outputArea.data('currentBuildNumber');

                                                                      function pollJobOutput() {
                                                                          $.get('../jenkins/' + jenkinsServerId + '/jobs/' + jobName + '/builds/' + buildNumber + '/output', function(jobOutput) {
                                                                              var output = jobOutput.output.replace(/\r?\n/g, "<br />");

                                                                              $tabContent.find('.taskLogArea').html(output);
                                                                              console.log(jobOutput);
                                                                              setTimeout(function() {
                                                                                  if ($('#assignedExecute').data()['bs.modal'].isShown) {
                                                                                      pollJobOutput();
                                                                                  }
                                                                              }, 3000);
                                                                          });
                                                                      }

                                                                      function pollJob() {

                                                                          $.get('../jenkins/' + jenkinsServerId + '/jobs/' + jobName, function(job) {

                                                                              if (job.lastBuild.number > lastBuildNumber) {
                                                                                  $modal.find('.loadingContainer').hide();
                                                                                  $modal.find('.errorMsgContainer').hide();
                                                                                  $modal.find('.outputArea').show();

                                                                                  buildNumber = job.lastBuild.number;

                                                                                  pollJobOutput();
                                                                              } else {
                                                                                  pollJob();
                                                                              }
                                                                              console.log(job);
                                                                          });
                                                                      }


                                                                      if (buildNumber) {
                                                                          pollJobOutput();
                                                                      } else {
                                                                          pollJob();
                                                                      }
                                                                      console.log(data);
                                                                  }

                                                              }


                                                              for (var i = 0; i < data.length; i++) {
                                                                  (function(i) {
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
                                                                                      var nodeName = instances[i].chef.chefNodeName;
                                                                                      if (instances[i].instanceIP) {
                                                                                          var nodeName = instances[i].instanceIP;
                                                                                      }
                                                                                      if (instances[i].name) {
                                                                                          nodeName = instances[i].name;
                                                                                      }
                                                                                      var $tdInstanceName = $('<td></td>').append(nodeName).css({
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
                                                                      $tdExecute.find('a').data('taskId', data[i]._id).attr('data-executeTaskId', data[i]._id).click(function(e) {
                                                                          var taskId = $(this).data('taskId');
                                                                          var $taskExecuteTabsHeaderContainer = $('#taskExecuteTabsHeader').empty();
                                                                          var $taskExecuteTabsContent = $('#taskExecuteTabsContent').empty();
                                                                          var $modal = $('#assignedExecute');
                                                                          $modal.find('.loadingContainer').show();
                                                                          $modal.find('.errorMsgContainer').hide();
                                                                          $modal.find('.outputArea').hide();
                                                                          $modal.modal('show');
                                                                          var timestampToPoll = new Date().getTime();
                                                                          $.get('../tasks/' + taskId + '/run', function(data) {
                                                                              var date = new Date().setTime(data.timestamp);
                                                                              var taskTimestamp = new Date(date).toLocaleString(); //converts to human readable strings
                                                                              $('tr[data-taskId="' + taskId + '"] .taskrunTimestamp').html(taskTimestamp);

                                                                              var $outputArea = $modal.find('.outputArea');

                                                                              $outputArea.data('taskType', data.taskType);
                                                                              $outputArea.data('instances', data.instances);
                                                                              $outputArea.data('jenkinsServerId', data.jenkinsServerId);
                                                                              $outputArea.data('jobName', data.jobName);
                                                                              $outputArea.data('lastBuildNumber', data.lastBuildNumber);
                                                                              $outputArea.data('currentBuildNumber', data.currentBuildNumber);
                                                                              $outputArea.data('timestampStarted', data.timestamp);
                                                                              showTaskLogs();

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

                                                                      //History starts here
                                                                      var $tdHistory = $('<td></td>').append('<a rel="tooltip" data-placement="top" data-original-title="History" data-toggle="modal" href="javascript:void(0)" class="btn btn-primary btn-sg tableactionbutton"><i class="ace-icon fa fa-header bigger-120"></i></a>');
                                                                      $tdHistory.find('a').data('taskId', data[i]._id).attr('data-historyTaskId', data[i]._id).click(function(e) {
                                                                          //var $taskHistoryContent = $('#taskHistoryContent').show();
                                                                          var taskId = $(this).data('taskId');
                                                                          var $modal = $('#assignedTaskHistory');
                                                                          $modal.find('.loadingContainer').show();
                                                                          $modal.find('.outputArea').hide();
                                                                          $modal.find('.errorMsgContainer').hide();
                                                                          $modal.modal('show');
                                                                          $taskHistoryDatatable.clear().draw();
                                                                          $.get('../tasks/' + taskId + '/history', function(taskHistories) {
                                                                              for (var i = 0; i < taskHistories.length; i++) {
                                                                                  var $trHistoryRow = $('<tr/>');

                                                                                  var dateStarted = new Date().setTime(taskHistories[i].timestampStarted);
                                                                                  dateStarted = new Date(dateStarted).toLocaleString(); //converts to human readable strings
                                                                                  var $tdTimeStarted = $('<td></td>').append(dateStarted);
                                                                                  $trHistoryRow.append($tdTimeStarted);

                                                                                  var dateEnded = ' - '
                                                                                  if (taskHistories[i].timestampEnded) {
                                                                                      var dateEnded = new Date().setTime(taskHistories[i].timestampEnded);
                                                                                      dateEnded = new Date(dateEnded).toLocaleString(); //converts to human readable strings
                                                                                  }
                                                                                  var $tdTimeEnded = $('<td></td>').append(dateEnded);
                                                                                  $trHistoryRow.append($tdTimeEnded);

                                                                                  if (taskHistories[i].status === "success") {
                                                                                      var $tdBuildStatus = $('<td></td>').append('<img rel="tooltip" data-placement="top" title="Success" src="img/indicator_started.png"/>');
                                                                                      $trHistoryRow.append($tdBuildStatus);
                                                                                  } else if (taskHistories[i].status === "failed") {
                                                                                      var $tdBuildStatusFailure = $('<td></td>').append('<img rel="tooltip" data-placement="top" title="Failed" src="img/indicator_stopped.png"/>');
                                                                                      $trHistoryRow.append($tdBuildStatusFailure);
                                                                                  } else {
                                                                                      var $tdBuildStatusRunning = $('<td></td>').append('<img rel="tooltip" data-placement="top" title="Running" src="img/indicator_unknown.png"/>');
                                                                                      $trHistoryRow.append($tdBuildStatusRunning);
                                                                                  }


                                                                                  var $tdMessage = $('<td style="width:42%"></td>');
                                                                                  $trHistoryRow.append($tdMessage);
                                                                                  (function($td) {
                                                                                      var message = ' - ';
                                                                                      if (taskHistories[i].nodeIds && taskHistories[i].nodeIds.length == 1) {
                                                                                          if (taskHistories[i].executionResults && taskHistories[i].executionResults.length == 1) {
                                                                                              $.get('../chefClientExecution/' + taskHistories[i].executionResults[0].executionId, function(execData) {
                                                                                                  if (execData && execData.message) {
                                                                                                      $td.append(execData.message);
                                                                                                  } else {
                                                                                                      $td.append(message);
                                                                                                  }

                                                                                              }).fail(function() {
                                                                                                  $td.append(message);
                                                                                              });
                                                                                          } else {
                                                                                              $td.append(message);
                                                                                          }
                                                                                      } else {
                                                                                          $td.append(message);
                                                                                      }
                                                                                  })($tdMessage)


                                                                                  var $tdUser = $('<td></td>').append(taskHistories[i].user);
                                                                                  $trHistoryRow.append($tdUser);

                                                                                  var $tdLogs = $('<td></td>').append('<a data-original-title="MoreInfo" data-placement="top" rel="tooltip" class="moreinfoBuild margin-left40per" href="javascript:void(0)" data-toggle="modal"></a>');
                                                                                  $tdLogs.find('a').data('history', taskHistories[i]).data('taskId', taskId).click(function() {
                                                                                      //$('#assignedTaskHistory').modal('hide');
                                                                                      var taskId = $(this).data('taskId');
                                                                                      var $taskExecuteTabsHeaderContainer = $('#taskExecuteTabsHeader').empty();
                                                                                      var $taskExecuteTabsContent = $('#taskExecuteTabsContent').empty();
                                                                                      var $modal = $('#assignedExecute');
                                                                                      $modal.find('.loadingContainer').show();
                                                                                      $modal.find('.errorMsgContainer').hide();
                                                                                      $modal.find('.outputArea').hide();
                                                                                      $modal.modal('show');
                                                                                      var $outputArea = $modal.find('.outputArea');
                                                                                      var history = $(this).data('history');

                                                                                      $outputArea.data('taskType', history.taskType);
                                                                                      $outputArea.data('jenkinsServerId', history.jenkinsServerId);
                                                                                      $outputArea.data('jobName', history.jobName);
                                                                                      $outputArea.data('lastBuildNumber', history.lastBuildNumber);
                                                                                      $outputArea.data('currentBuildNumber', history.buildNumber);
                                                                                      $outputArea.data('timestampStarted', history.timestampStarted);
                                                                                      $outputArea.data('timestampEnded', history.timestampEnded);

                                                                                      if (history.nodeIdsWithActionLog && history.nodeIdsWithActionLog.length) {
                                                                                          var ids = [];
                                                                                          for (var kk = 0; kk < history.nodeIdsWithActionLog.length; kk++) {
                                                                                              ids.push(history.nodeIdsWithActionLog[kk].nodeId)
                                                                                          }
                                                                                          $.post('../instances', {
                                                                                              instanceIds: ids
                                                                                          }, function(instances) {
                                                                                              for (var kk = 0; kk < instances.length; kk++) {
                                                                                                  for (var jj = 0; jj < history.nodeIdsWithActionLog.length; jj++) {
                                                                                                      if (instances[kk]._id === history.nodeIdsWithActionLog[jj].nodeId) {
                                                                                                          instances[kk].tempActionLogId = history.nodeIdsWithActionLog[jj].actionLogId;
                                                                                                      }
                                                                                                  }
                                                                                              }
                                                                                              $outputArea.data('instances', instances);
                                                                                              showTaskLogs();
                                                                                          });

                                                                                      } else {
                                                                                          if (history.nodeIds && history.nodeIds.length) {
                                                                                              $.post('../instances', {
                                                                                                  instanceIds: history.nodeIds
                                                                                              }, function(instances) {
                                                                                                  $outputArea.data('instances', instances);
                                                                                                  showTaskLogs();
                                                                                              });
                                                                                          } else {
                                                                                              showTaskLogs();
                                                                                          }
                                                                                      }


                                                                                  });
                                                                                  $trHistoryRow.append($tdLogs);

                                                                                  $taskHistoryDatatable.row.add($trHistoryRow).draw();
                                                                              }
                                                                              $modal.find('.loadingContainer').hide();
                                                                              $modal.find('.outputArea').show();
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

                                                                          //$modal.find('.outputArea').hide();

                                                                      });
                                                                      $tr.append($tdHistory);

                                                                      var timestamp = "-";
                                                                      if (data[i].lastRunTimestamp) {
                                                                          var date = new Date().setTime(data[i].lastRunTimestamp);
                                                                          timestamp = new Date(date).toLocaleString(); //converts to human readable strings
                                                                      }


                                                                      var $tdTime = $('<td></td>').append(timestamp).addClass('taskrunTimestamp');
                                                                      $tr.append($tdTime);

                                                                      var $tdOptions = $('<td></td>').append('<div class="btn-group tableactionWidth"><a rel="tooltip" data-placement="top" data-original-title="Remove" class="btn btn-danger pull-left btn-sg tableactionbutton btnDeleteTask"><i class="ace-icon fa fa-trash-o bigger-120"></i></a><a class="btn btn-info pull-left tableactionbutton btnEditTask tableactionbuttonpadding btn-sg" data-original-title="Edit" data-placement="top" rel="tooltip"><i class="ace-icon fa fa-pencil bigger-120"></i></a></div>').attr('data-taskId', data[i]._id);
                                                                      //permission set for editing and deleting for ChefTask

                                                                      var hasEditChefTaskPermission = false;
                                                                      if (haspermission('chef_task', 'modify')) {
                                                                          hasEditChefTaskPermission = true;
                                                                      }
                                                                      if (!hasEditChefTaskPermission) {
                                                                          $tdOptions.find('.btnEditTask').addClass('hidden');
                                                                      }

                                                                      var hasDeleteChefTaskPermission = false;
                                                                      if (haspermission('chef_task', 'delete')) {
                                                                          hasDeleteChefTaskPermission = true;
                                                                      }
                                                                      if (!hasDeleteChefTaskPermission) {
                                                                          $tdOptions.find('.btnDeleteTask').addClass('hidden');
                                                                      }
                                                                      //custom
                                                                      var hasEditCustomTaskPermission = false;
                                                                      if (haspermission('custom_task', 'modify')) {
                                                                          hasEditCustomTaskPermission = true;
                                                                      }
                                                                      if (!hasEditCustomTaskPermission) {
                                                                          $tdOptions.find('.btnEditTask').addClass('hidden');
                                                                      }

                                                                      var hasDeleteCustomTaskPermission = false;
                                                                      if (haspermission('custom_task', 'delete')) {
                                                                          hasDeleteCustomTaskPermission = true;
                                                                      }
                                                                      if (!hasDeleteCustomTaskPermission) {
                                                                          $tdOptions.find('.btnDeleteTask').addClass('hidden');
                                                                      }
                                                                      //jenkins
                                                                      var hasEditJenkinsTaskPermission = false;
                                                                      if (haspermission('jenkins_task', 'modify')) {
                                                                          hasEditJenkinsTaskPermission = true;
                                                                      }
                                                                      if (!hasEditJenkinsTaskPermission) {
                                                                          $tdOptions.find('.btnEditTask').addClass('hidden');
                                                                      }

                                                                      var hasDeleteJenkinsTaskPermission = false;
                                                                      if (haspermission('jenkins_task', 'delete')) {
                                                                          hasDeleteJenkinsTaskPermission = true;
                                                                      }
                                                                      if (!hasDeleteJenkinsTaskPermission) {
                                                                          $tdOptions.find('.btnDeleteTask').addClass('hidden');
                                                                      }

                                                                      $tdOptions.find('.btnDeleteTask').click(function(e) {
                                                                          var taskId = $(this).parents('td').attr('data-taskId');
                                                                          var that = this;

                                                                          bootbox.confirm('Are you sure you want to delete the Task -&nbsp;<b>' + data[i].name + '</b>', function(result) {
                                                                              if (result) {
                                                                                  $.ajax({
                                                                                      url: '../tasks/' + taskId,
                                                                                      method: 'DELETE',
                                                                                      success: function(data) {
                                                                                          //$(that).parents('tr').remove();
                                                                                          //var totalTask = $taskListArea.children('tr').length;
                                                                                          //$('.taskListFooter').text('Showing ' + totalTask + ' of ' + totalTask + ' entries');
                                                                                          $taskDatatable.row($(that).parents('tr')).remove().draw(false);

                                                                                          $('div[data-taskCardIconId="' + taskId + '"]').remove();

                                                                                      },
                                                                                      fail: function(msg) {
                                                                                          console.log("fail ==>", msg);
                                                                                      }
                                                                                  })
                                                                              }
                                                                          });
                                                                          return false;
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
                                                                  })(i);

                                                              }

                                                              function pollTaskLogs($tabLink, $tab, timestamp, delay, clearData) {
                                                                  var instanceId = $tabLink.attr('data-taskInstanceId');
                                                                  var actionLogId = $tabLink.attr('data-taskActionLogId');
                                                                  var timestamp = $tabLink.attr('data-taskPollLastTimestamp');
                                                                  var timestampEnded = $tabLink.attr('data-taskPollTimestampEnded');
                                                                  var poll = $tabLink.attr('data-taskPolling');

                                                                  if (poll !== 'true') {
                                                                      console.log('not polling');
                                                                      return;
                                                                  }
                                                                  if (actionLogId) {
                                                                      var url = '../instances/' + instanceId + '/actionLogs/' + actionLogId + '/logs';
                                                                  } else {
                                                                      var url = '../instances/' + instanceId + '/logs';
                                                                  }


                                                                  if (timestamp) {
                                                                      url = url + '?timestamp=' + timestamp;
                                                                      if (timestampEnded) {
                                                                          url = url + '&timestampEnded=' + timestampEnded;
                                                                      }
                                                                  }

                                                                  timeout = setTimeout(function() {
                                                                      $.get(url, function(data) {
                                                                          var $modalBody = $tab.find('.taskLogArea')
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
                                                                              // $table.append('<hr/>');

                                                                          }


                                                                          if (data.length) {
                                                                              lastTimestamp = data[data.length - 1].timestamp;
                                                                              console.log(lastTimestamp);
                                                                              $modalBody.append($table);
                                                                              $modalBody.scrollTop($modalBody[0].scrollHeight + 100);
                                                                              $tabLink.attr('data-taskPollLastTimestamp', data[data.length - 1].timestamp);

                                                                          }


                                                                          console.log('polling again');
                                                                          if ($tabLink.attr('data-taskPolling') === 'true' && $('#assignedExecute').data()['bs.modal'].isShown && !timestampEnded) {

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
                                                              function generateCompositeJsonfromtable() {
                                                                  var dockercompose = [];
                                                                  var dockerimages = {};
                                                                  console.log($('#compositedockertable').find('.dockerimagesrow').length);
                                                                  $('.dockerimagesrow').each(function() {
                                                                      dockerimages = {};

                                                                      $(this).find('[paramtype]').each(function() {
                                                                          console.log($(this).text() + $(this).val());
                                                                          dockerimages[$(this).attr('paramtype')] = $(this).text() + $(this).val();
                                                                      });
                                                                      // alert(JSON.stringify(dockerimages));
                                                                      dockercompose.push(dockerimages);
                                                                  });
                                                                  return (dockercompose);
                                                              }
                                                              var compositedockerimage = generateCompositeJsonfromtable();
                                                              //alert(JSON.stringify(compositedockerimage));
                                                              compositedockerimage = JSON.stringify(compositedockerimage);
                                                              // alert(JSON.stringify(compositedockerimage));
                                                              //return;
                                                              $('.instanceselectedfordocker').each(function() {
                                                                  if ($(this).is(':checked')) {

                                                                      var instid = $(this).closest('tr').attr('data-instanceid');
                                                                      var instbpname = $(this).closest('tr').attr('data-blueprintname');
                                                                      var amoreinfo = $(this).closest('tr').find('.moreInfo');
                                                                      if (instid)
                                                                          var $that = $(this);
                                                                      var $td = $that.closest('td');
                                                                      var tdtext = $td.text();
                                                                      $td.find('.dockerspinner').detach();
                                                                      $td.find('.dockermessage').detach();
                                                                      $td.append('<img class="dockerspinner" style="margin-left:5px" src="img/select2-spinner.gif"></img>');
                                                                      $td.attr('title', 'Pulling in Images');
                                                                      // var imagename = $('.productdiv1.role-Selected1').first().attr('dockercontainerpaths');
                                                                      // var repotag = $('.productdiv1.role-Selected1').find('.dockerrepotagselect').first().val();

                                                                      var repopath = $('.productdiv1.role-Selected1').first().attr('dockerreponame');
                                                                      if (amoreinfo)
                                                                          amoreinfo.trigger('click');

                                                                      $.get('../instances/dockercompositeimagepull/' + instid + '/' + repopath + '/' + encodeURIComponent(compositedockerimage), function(data) {
                                                                          //alert(JSON.stringify(data));
                                                                          if (data == "OK") {
                                                                              var $statmessage = $td.find('.dockerspinner').parent();
                                                                              $td.find('.moreInfo').first().click(); //showing the log window.


                                                                              $td.find('.dockerspinner').detach();
                                                                              $statmessage.append('<span style="margin-left:5px;text-decoration:none" class="dockermessage"></span>');

                                                                              //Updating instance card to show the docker icon.
                                                                              //$dockericon = $('<img src="img/galleryIcons/Docker.png" alt="Docker" style="width:42px;height:42px;margin-left:32px;" class="dockerenabledinstacne"/>');
                                                                              //Updated from above to move docker image out of circle.
                                                                              $dockericon = $('<img src="img/galleryIcons/Docker.png" alt="Docker" style="width:auto;height:27px;margin-left:96px;margin-top:-105px" class="dockerenabledinstacne"/>');
                                                                              //find the instance card - to do instance table view update
                                                                              var $instancecard = $('div[data-instanceid="' + instid + '"]');
                                                                              if ($instancecard.find('.dockerenabledinstacne').length <= 0) {
                                                                                  $instancecard.find('.componentlistContainer').first().append($dockericon);
                                                                              }
                                                                              //debugger;
                                                                              loadContainersTable(); //Clearing and loading the containers again.
                                                                          } else {
                                                                              //alert(data);
                                                                              if (data.indexOf('No Docker Found') >= 0) {
                                                                                  var $statmessage = $('.dockerspinner').parent();
                                                                                  $('.dockerspinner').detach();
                                                                                  $td.find('.dockermessage').detach();
                                                                                  $statmessage.append('<span style="margin-left:5px;color:red" title="Docker not found"  class="dockermessage"><i class="fa  fa-exclamation"></i></span>');
                                                                                  //Prompt user to execute the docker cookbook.
                                                                                  if (confirm('Docker was not found on the node : "' + instbpname + '". \nDo you wish to install it?')) {
                                                                                      //Docker launcer popup had to be hidden due to overlap issue.
                                                                                      $('#launchDockerInstanceSelector').modal('hide');
                                                                                      $('a.actionbuttonChefClientRun[data-instanceid="' + instid + '"]').first().trigger('click');
                                                                                  }
                                                                              } else {
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



                                                          if (orgId && urlParams['bg'] && projectId && envId) {


                                                              $.get('../organizations/' + orgId + '/businessgroups/' + urlParams['bg'] + '/projects/' + projectId + '/environments/' + envId + '/', function(data) {
                                                                  console.log('success---3---4');

                                                                  //Syncing up the tree view based on url

                                                                  initializeTaskArea(data.tasks);
                                                                  initializeBlueprintArea(data.blueprints);
                                                                  x = data.instances;
                                                                  initializeInstanceArea(data.instances);

                                                              });

                                                          } else {
                                                              var $workzoneTab = $('#workZoneNew');
                                                              if ($workzoneTab.length) {
                                                                  $workzoneTab.click();
                                                              }
                                                          }

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
                                                              $('#dockercontainertablerefreshspinner').addClass('fa-spin');
                                                              $dockercontainertable = $('#dockercontainertable tbody');

                                                              $('.docctrempty').detach();
                                                              var $docctrempty = $('#dockercontainertabletemplatetr').clone().empty().append('<td colspan="8" style="text-align:center"><img style="margin-right:30px" src="img/select2-spinner.gif"></img>Loading containers..</td>').removeClass('hidden');
                                                              $docctrempty.addClass('docctrempty');
                                                              $dockercontainertable.append($docctrempty);

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
                                                                              $('#dockercontainertablerefreshspinner').removeClass('fa-spin');
                                                                              return;
                                                                          }
                                                                          if (data) {
                                                                              $('.docctrempty').detach();
                                                                              $('.loadingimagefordockertable').addClass('hidden');
                                                                              $('#dockercontainertablerefreshspinner').removeClass('fa-spin');
                                                                          }
                                                                          var dockerContainerData = JSON.parse(data);
                                                                          //   alert(JSON.stringify(dockerContainerData));
                                                                          //Setting empty message
                                                                          if (dockerContainerData.length <= 0) {
                                                                              $('.docctrempty').detach();
                                                                              var $docctrempty = $('#dockercontainertabletemplatetr').clone().empty().append('<td colspan="8" style="text-align:center">No Containers Found</td>').removeClass('hidden');
                                                                              $docctrempty.addClass('docctrempty');
                                                                              $dockercontainertable.append($docctrempty);
                                                                          }
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
                                                              // $('.carousel.slide').carousel({
                                                              //     interval: false,
                                                              //     cycle: false
                                                              // });
                                                          }


                                                          var serachBoxInInstance = {
                                                              instanceData: null,
                                                              isActive: false,
                                                              init: function() {
                                                                  this.updateUI = this.updateUI.bind(this);

                                                                  $('#search').on('click', this.updateUI);
                                                                  /*  $('.custom-left').click(function() { //previous list
                                          var originalList = $('#divinstancescardview');
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
                                          var originalList = $('#divinstancescardview');
                                          var activeList = originalList.find('.active'),
                                              nextList = activeList.next();
                                          if (nextList.length == 1) {
                                              nextList.addClass('active');
                                              activeList.removeClass('active');
                                          } else {
                                              activeList.removeClass('active');
                                              originalList.find('.item:first').addClass('active');
                                          }

                                      });*/

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
                                                          disableTaskLink();
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

                                                      });


                                                  }