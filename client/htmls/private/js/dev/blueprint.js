
/**************************************Blueprint.js*************************************/

/*Binding Click events to Blueprints*/

function initializeBluePrints() {
    bindClick_bluePrintTab();
    bindClick_LaunchBtn();
    bindClick_bluePrintUpdate();
    bindClick_updateInstanceRunList();
}
/*Launching parameters are defined*/
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
        console.log(lparam + ' ' + cparams);
        var params = lparam.split(' -');
        for (para in params) {
            var subparam = params[para].split(' ');
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
              var  splitBread = DummyBreadCrumb.split('>');
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
                        tagLabel = '<span>Tags&nbsp;</span>';
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
                    var $li = $('<li></li>').css({
                        "font-size": '10px'
                    }).append(tagLabel, $selectVer, $selectVerEdit);
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
// for removing the selected blueprint in the blueprint tab

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
        for (var i = 0; i < $selectedItems.length; i++) {
            var projectId = $($selectedItems.get(i)).attr('data-projectId');
            var envId = $($selectedItems.get(i)).attr('data-envId');
            var blueprintId = $($selectedItems.get(i)).attr('data-blueprintId');
            var version = $($selectedItems.get(i)).find('.blueprintVersionDropDown').val();
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
                expirationDays: 0
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

            });
        });


    });
}
