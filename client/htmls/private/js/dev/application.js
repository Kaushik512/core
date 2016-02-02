/*
Copyright [2016] [Revin Jacob]

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

$(function() {
getAllPipelineViewData();

function getAllPipelineViewData() {
    var urlParams = {};
    (window.onpopstate = function() {
        var url = window.location.href;
        var indexOfQues = url.lastIndexOf("?");
        if (indexOfQues != -1) {
            var sub = url.substring(indexOfQues + 1);
            var params = sub.split('&')
            for (var i = 0; i < params.length; i++) {
                var paramParts = params[i].split('=');
                urlParams[paramParts[0]] = paramParts[1];
            }
        }
    })();

    var projectId = urlParams.projid;

    $.get('/app/deploy/pipeline/project/' + projectId, function(dataPipeline) {
        if (dataPipeline[0].envId.length > 0) {
            var arrEnv = [];
            var arrSequence = [];
            arrEnv.push({
                "title": ''
            });
            arrSequence.push('');
            for (var i = 0; i < dataPipeline[0].envId.length; i++) {
                var envUniqueText = dataPipeline[0].envId[i];
                var obj = {
                    "title": envUniqueText
                };
                arrEnv.push(obj);
            }
            for (var j = 0; j < dataPipeline[0].envSequence.length; j++) {
                var envUniqueText = dataPipeline[0].envSequence[j];
                arrSequence.push(envUniqueText);
            }
            if(arrSequence[dataPipeline[0].envSequence.length] && arrEnv[dataPipeline[0].envId.length]){
                creationPipelineTableView(projectId,arrEnv,arrSequence);
            }
            
        } else {
            $.get('/d4dMasters/project/' + projectId, function(dataforenvName) {
                var individualenvName = dataforenvName[0].environmentname;
                individualenvName = individualenvName.split(",");
                var arrEnv = [];
                var arrSequence = [];
                arrEnv.push({
                    "title": ''
                });
                arrSequence.push('');

                for (var i = 0; i < individualenvName.length; i++) {
                    var envUniqueText = individualenvName[i];

                    var obj = {
                        "title": envUniqueText
                    };
                    arrEnv.push(obj);
                    arrSequence.push(envUniqueText);
                }

                console.log('array sequence');
                console.log(arrSequence);
                if(arrSequence[individualenvName.length]){
                    creationPipelineTableView(projectId,arrEnv,arrSequence);
                }

            }).fail(function() {});
        }
    }).fail(function() {});
}
function creationPipelineTableView(projectId,arrEnv,arrSequence){
    var $tableClone = $('.tableClone').clone();
    $tableClone.removeClass('tableClone');
    $('#tableContainer').empty().append($tableClone);
    
    $tableClone.DataTable({
        columns: arrEnv,
        "bSort": false,
        "bAutoWidth": false,
        "bProcessing": true,
        "bDeferRender": true,
        "bFilter": false,
        "bLengthChange": false
    });
    $tableClone.find('thead th').addClass('padding-left5per');
    var $tableapplicationTest = $tableClone;
    var $tableapplicationTbody = $tableClone.find('tbody');
    $.get('/app/deploy/project/' + projectId + '/list', function(deployData) {
        deployData.forEach(function(appDeployDataObj) {
            function createMainCard(applicationName,versionNumber){
                var tempStr = '';
                       
                var $mainCardTemplate = $('.mainCardTemplate');

                var $mainCard = $mainCardTemplate.clone(true);
                $mainCard.css({
                    display: 'inline-flex'
                });
                
                $mainCard.find('.applicationMainIP').html(applicationName);
                $mainCard.find('.versionMain').html(versionNumber);

                if(applicationName === "catalyst"){
                    $mainCard.find('.mainImageHeight').attr("src","img/rsz_logo.png");    
                }else{
                    $mainCard.find('.mainImageHeight').attr("src","img/petclinic.png");
                }
                
                var $mainCardtemplateStr = $mainCard.prop('outerHTML');
                tempStr = tempStr + $mainCardtemplateStr;
                return tempStr;
            }

            function createStatusPresentCard(appDeployDataObj,applicationName,callback){
                var tempStr = '';
                       
                var $childCardTemplate = $('.childCardTemplate');
                var $childPresentCard = $childCardTemplate.clone(true);
                $childPresentCard.css({
                    display: 'inline-flex'
                });
                var count =0;
                for(var i=0;i<appDeployDataObj.envId.length;i++){
                    
                    (function(i){
                        count++;
                        $childPresentCard.find('.applicationChildIP').html(appDeployDataObj.applicationNodeIP[i]);
                        $childPresentCard.find('.lastapplicationDeploy').html(appDeployDataObj.applicationLastDeploy[i]);

                        if(appDeployDataObj.applicationStatus[i] === "Successful"){
                            $childPresentCard.find('.imgHeight').attr("src","img/aws_logo_started.png");
                            $childPresentCard.find('.applicationChildDetails').removeClass('btn-primary').addClass('btn-success');

                        }else{
                            $childPresentCard.find('.imgHeight').attr("src","img/aws_logo_stopped.png");
                            $childPresentCard.find('.applicationChildDetails').removeClass('btn-primary').addClass('btn-danger');
                        }
                        
                        $childPresentCard.find('.applicationNamePipelineView').html(applicationName);
                        $childPresentCard.find('.applicationInstanceNamePipelineView').html(appDeployDataObj.applicationInstanceName[i]);
                        $childPresentCard.find('.hostNamePipelineView').html(appDeployDataObj.hostName[i]);
                        $childPresentCard.find('.applicationNodeIPPipelineView').html(appDeployDataObj.applicationNodeIP[i]);
                        $childPresentCard.find('.containerIdPipelineView').html(appDeployDataObj.containerId[i]);
                        $childPresentCard.find('.applicationStatusPipelineView').html(appDeployDataObj.applicationStatus[i]);
                        if(count === appDeployDataObj.envId.length){
                            var $childCardtemplateStr = $childPresentCard.prop('outerHTML');
                            tempStr = tempStr + $childCardtemplateStr;
                            callback(null,tempStr);
                        }
                    })(i);
                }
            };

            var countColumn = 0;
            var dummyArray = [];
            var finalArray = [];
            var applicationName = appDeployDataObj.applicationName;
            var versionNumber = appDeployDataObj.applicationVersion;
            var applicationEnvList=appDeployDataObj.envId;
               for (var j = 0; j < arrSequence.length; j++) {
                countColumn++;
                //application main card
                if(j==0 && arrSequence[j]===""){
                    var obj = createMainCard(applicationName,versionNumber);
                    finalArray.push(createMainCard(applicationName,versionNumber));
                }
                else if($.inArray(arrSequence[j],applicationEnvList)!==-1){
                    //application status present card
                    //alert($(arrSequence).get(-1));
                    if($(arrSequence).get(-1) == arrSequence[j]){
                        //alert("Matched");
                        createStatusPresentCard(appDeployDataObj,applicationName,function(err,data){
                            alert(data);
                            finalArray.push(data);
                        });
                    }
                    else{
                        createStatusPresentCard(appDeployDataObj,applicationName,function(err,data){
                            finalArray.push(data);
                        });
                    }
                }else{
                    //application status absent card
                    var tempStr = '';
                    var $childCardTemplate = $('.childCardTemplate');
                    var $childPresentCard = $childCardTemplate.clone(true);
                    $childPresentCard.css({
                        display: 'inline-flex'
                    });
                    $childPresentCard.find('.applicationChildIP').html('');
                    $childPresentCard.find('.lastDeploySpan').html('');
                    $childPresentCard.find('.imgHeight').attr("src","img/rsz_inactive.png");
                    $childPresentCard.find('.applicationChildDetails').removeClass('btn-primary').addClass('btn-grey');
                    $childPresentCard.find('.lastapplicationDeploy').html('');
                    //$childPresentCard.find('.footer-innerdiv').html('');
                        $childPresentCard.children().css({
                            'opacity': '0.5',
                            'pointer-events': 'none'
                        });
                    //$childPresentCard.find('.applicationChildDetails').attr('disabled');
                    //$childPresentCard.find('.applicationChildmoreInfo').attr('disabled');
                    
                    var $childCardtemplateStr = $childPresentCard.prop('outerHTML');
                    tempStr = tempStr + $childCardtemplateStr;
                    finalArray.push(tempStr);
                } 
            }
            $tableapplicationTest.dataTable().fnAddData(finalArray);
            //alert($('#tableContainer table tbody td').outerWidth()); 
        });        
    });
    
    $tableapplicationTbody.on('click','.applicationChildDetails',moreinfoDetailsPipelineViewClickHandler);
}

function moreinfoDetailsPipelineViewClickHandler(e) {
    var $modal = $('#modalDetailsAppDeploy');
    var applicationNamePipelineText = $(this).parents().eq(5).find('.applicationNamePipelineView').html();
    $modal.find('.appNameModal').html(applicationNamePipelineText);

    var appInstanceNameCardSpanText = $(this).parents().eq(5).find('.applicationInstanceNamePipelineView').html();
    $modal.find('.appInstanceNameModal').html(appInstanceNameCardSpanText);

    var hostNamePipelineText = $(this).parents().eq(5).find('.hostNamePipelineView').html();
    $modal.find('.hostNameModal').html(hostNamePipelineText);

    var applicationNodeIPPipelineText = $(this).parents().eq(5).find('.applicationNodeIPPipelineView').html();
    $modal.find('.nodeIpModal').html(applicationNodeIPPipelineText);

    var containerIdPipelineText = $(this).parents().eq(5).find('.containerIdPipelineView').html();
    $modal.find('.containerIdModal').html(containerIdPipelineText);

    var applicationStatusPipelineText = $(this).parents().eq(5).find('.applicationStatusPipelineView').html();
    $modal.find('.statusModal').html(applicationStatusPipelineText);

    $modal.modal('show');
}
$('.appdeployConfigureSaveBtn').click(function() {
    var $tableconfigureapplication = $('#tableconfigureapplication');
    var projectId = urlParams.projid;
    var configureEnvArray = [];
    var configureEnvArraySequence = [];
    var arrEnv = [];
    var arrSequence = [];
    arrEnv.push({
        "title": ''
    });
    arrSequence.push('');
    $tableconfigureapplication.find('tbody tr').each(function() {
        $tr = $(this);
        var envUniqueTextAllEnv = $tr.find('.configAppDeployUniqueName').text();
        configureEnvArraySequence.push(envUniqueTextAllEnv);
        arrSequence.push(envUniqueTextAllEnv);
    });
    $tableconfigureapplication.find('tbody tr').filter(':has(:checkbox:checked)').each(function() {
        var $tr = $(this);
        var envUniqueText = $tr.find('.configAppDeployUniqueName').text();
        var obj = {
            "title": envUniqueText
        };
        arrEnv.push(obj);
        configureEnvArray.push(envUniqueText);
    });
    
   creationPipelineTableView(projectId,arrEnv,arrSequence);
   
    /*getenvName(function(envName) {
        envNameSelected = envName;
        if (configureEnvArray.length > 0) {
            configureEnvArray.forEach(function(envUniqueText) {
                createPipelineArea(envUniqueText, envNameSelected, projectId);
            });
        } else {
            configureEnvArraySequence.forEach(function(envUniqueText) {
                createPipelineArea(envUniqueText, envNameSelected, projectId);
            });
        }
    });*/
    var dataDeployPipeline = {
        "appDeployPipelineData": {
            "loggedInUser": "",
        }
    };
    var projectId = urlParams.projid;
    dataDeployPipeline.appDeployPipelineData.projectId = projectId;
    dataDeployPipeline.appDeployPipelineData.envId = configureEnvArray;
    dataDeployPipeline.appDeployPipelineData.envSequence = configureEnvArraySequence;
    $.ajax({
        url: '/app/deploy/data/pipeline/configure',
        data: JSON.stringify(dataDeployPipeline),
        type: 'POST',
        contentType: "application/json",
        success: function(data) {
            $('#modalappcardConfigure').modal('hide');
        },
        error: function(jqxhr) {
            $('#modalappcardConfigure').modal('hide');
        }
    });
   
});

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
$('.createAppConfigure').click(function() {
    var selectedEnvironments = [];
    var allEnvironments = [];
    var $tableconfigureapplication = $('#tableconfigureapplication');
    var $tbody = $tableconfigureapplication.find('tbody').empty();
    var projectId = urlParams.projid;
    $.ajax({
        url: '/app/deploy/pipeline/project/' + projectId,
        type: "GET",
        async: true,
        success: function(dataPipeline) {
            if (dataPipeline.length) {
                for (var i = 0; i < dataPipeline[0].envId.length; i++) {
                    selectedEnvironments.push(dataPipeline[0].envId[i]);
                }
                for (var i = 0; i < dataPipeline[0].envSequence.length; i++) {
                    allEnvironments.push(dataPipeline[0].envSequence[i]);
                }
                if (selectedEnvironments.length == 0) {
                    $.get('/d4dMasters/project/' + projectId, function(dataforenvName) {
                        var individualenvName = dataforenvName[0].environmentname;
                        individualenvName = individualenvName.split(",");
                        for (var i = 0; i < individualenvName.length; i++) {
                            var checked = "";
                            if ($.inArray(individualenvName[i], individualenvName) > -1) {
                                checked = "checked";
                            }
                            var $tr = $('<tr/>').attr({
                                'data-configureApplication': individualenvName[i]
                            });
                            var $tdenvName = $('<td class="configAppDeployUniqueName"/>').html(individualenvName[i]);
                            var $tdActive = $('<td/>').html("<div class='iphone-toggle-buttons'><ul style='padding: 0px; margin: 0px;list-style-type: none;'><li><label for='checkbox-" + i + "'><input type='checkbox' class='appDeployCheckboxOrder' name='checkbox-" + i + "' id='checkbox-" + i + "' " + checked + " /><span></span></label></li></ul></div>");
                            var $tdupdown = $('<td/>').html("<a class='btn btn-default btn-primary up' style='border-radius:50%;height:27px;width:27px;padding-top:0px' type='button'><i style='font-size:12px;margin-left:-5px;margin-top:5px;' class='fa  fa-chevron-up'></i></a><a class='btn btn-default btn-primary down' style='border-radius:50%;height:27px;width:27px;padding-top:0px;margin-left:10px' type='button'><i style='font-size:12px;margin-left:-5px;margin-top:5px;' class='fa  fa-chevron-down'></i></a>");
                            $tr.append($tdenvName).append($tdActive).append($tdupdown);
                            $tbody.append($tr);
                        }
                        $tableconfigureapplication.append($tbody);
                        $tableconfigureapplication.find(".up,.down").click(function() {
                            var row = $(this).parents("tr:first");
                            if ($(this).is(".up")) {
                                row.insertBefore(row.prev());
                            } else {
                                row.insertAfter(row.next());
                            }
                        });
                    });
                } else {
                    for (var i = 0; i < allEnvironments.length; i++) {
                        var checked = "";
                        if ($.inArray(allEnvironments[i], selectedEnvironments) > -1) {
                            checked = "checked";
                        }
                        var $tr = $('<tr/>').attr({
                            'data-configureApplication': allEnvironments[i]
                        });
                        var $tdenvName = $('<td class="configAppDeployUniqueName"/>').html(allEnvironments[i]);
                        var $tdActive = $('<td/>').html("<div class='iphone-toggle-buttons'><ul style='padding: 0px; margin: 0px;list-style-type: none;'><li><label for='checkbox-" + i + "'><input type='checkbox' class='appDeployCheckboxOrder' name='checkbox-" + i + "' id='checkbox-" + i + "' " + checked + " /><span></span></label></li></ul></div>");
                        var $tdupdown = $('<td/>').html("<a class='btn btn-default btn-primary up' style='border-radius:50%;height:27px;width:27px;padding-top:0px' type='button'><i style='font-size:12px;margin-left:-5px;margin-top:5px;' class='fa  fa-chevron-up'></i></a><a class='btn btn-default btn-primary down' style='border-radius:50%;height:27px;width:27px;padding-top:0px;margin-left:10px' type='button'><i style='font-size:12px;margin-left:-5px;margin-top:5px;' class='fa  fa-chevron-down'></i></a>");
                        $tr.append($tdenvName).append($tdActive).append($tdupdown);
                        $tbody.append($tr);
                    }
                    $tableconfigureapplication.append($tbody);
                    $tableconfigureapplication.find(".up,.down").click(function() {
                        var row = $(this).parents("tr:first");
                        if ($(this).is(".up")) {
                            row.insertBefore(row.prev());
                        } else {
                            row.insertAfter(row.next());
                        }
                    });
                }
            }else{
                $.get('/d4dMasters/project/' + projectId, function(dataforenvName) {
                    var individualenvName = dataforenvName[0].environmentname;
                    individualenvName = individualenvName.split(",");
                    for (var i = 0; i < individualenvName.length; i++) {
                        selectedEnvironments.push(individualenvName[i]);
                        allEnvironments.push(individualenvName[i]);
                    }
                    if(selectedEnvironments[individualenvName.length] == allEnvironments[individualenvName.length]){
                        $.get('/d4dMasters/project/' + projectId, function(dataforenvName) {
                            var individualenvName = dataforenvName[0].environmentname;
                            individualenvName = individualenvName.split(",");
                            for (var i = 0; i < individualenvName.length; i++) {
                                var checked = "";
                                if ($.inArray(individualenvName[i], individualenvName) > -1) {
                                    checked = "checked";
                                }
                                var $tr = $('<tr/>').attr({
                                    'data-configureApplication': individualenvName[i]
                                });
                                var $tdenvName = $('<td class="configAppDeployUniqueName"/>').html(individualenvName[i]);
                                var $tdActive = $('<td/>').html("<div class='iphone-toggle-buttons'><ul style='padding: 0px; margin: 0px;list-style-type: none;'><li><label for='checkbox-" + i + "'><input type='checkbox' class='appDeployCheckboxOrder' name='checkbox-" + i + "' id='checkbox-" + i + "' " + checked + " /><span></span></label></li></ul></div>");
                                var $tdupdown = $('<td/>').html("<a class='btn btn-default btn-primary up' style='border-radius:50%;height:27px;width:27px;padding-top:0px' type='button'><i style='font-size:12px;margin-left:-5px;margin-top:5px;' class='fa  fa-chevron-up'></i></a><a class='btn btn-default btn-primary down' style='border-radius:50%;height:27px;width:27px;padding-top:0px;margin-left:10px' type='button'><i style='font-size:12px;margin-left:-5px;margin-top:5px;' class='fa  fa-chevron-down'></i></a>");
                                $tr.append($tdenvName).append($tdActive).append($tdupdown);
                                $tbody.append($tr);
                            }
                            $tableconfigureapplication.append($tbody);
                            $tableconfigureapplication.find(".up,.down").click(function() {
                                var row = $(this).parents("tr:first");
                                if ($(this).is(".up")) {
                                    row.insertBefore(row.prev());
                                } else {
                                    row.insertAfter(row.next());
                                }
                            });
                        });
                    }
                });

            }
        },
        error: function() {}
    });
});

function ConvertTimeformat(format, str, formatStr) {
    var time = str;
    var hours = Number(time.match(/^(\d+)/)[1]);
    var minutes = Number(time.match(/:(\d+)/)[1]);
    var seconds = time.split(' ')[0].split(':')[2];
    var AMPM = formatStr;
    if (AMPM == "PM" && hours < 12) hours = hours + 12;
    if (AMPM == "AM" && hours == 12) hours = hours - 12;
    var sHours = hours.toString();
    var sMinutes = minutes.toString();
    var sSeconds = seconds.toString();
    if (hours < 10) sHours = "0" + sHours;
    if (minutes < 10) sMinutes = "0" + sMinutes;
    if (seconds < 10) sSeconds = "0" + sSeconds;
    return (sHours + ":" + sMinutes + ":" + sSeconds);
}

function convertToDateObj(strInputDate) {
    var timeStr = strInputDate.split(' ')[1];
    var formatStr = strInputDate.split(' ')[2];
    var str = ConvertTimeformat("24", timeStr, formatStr);
    var year = strInputDate.substring(0, 2);
    var month = strInputDate.substring(3, 5);
    month = parseInt(month);
    var day = strInputDate.substring(6, 8);
    var hour = str.substring(0, 2);
    var minute = str.substring(3, 5);
    var second = str.substring(6, 8);
    var dateConverted = new Date(year, month - 1, day, hour, minute, second);
    return dateConverted;
}

$('#instanceviewAppCard').click(function() {
    getenvName(function(envName) {
        var dataenvAccordianName = "Application Deployment for : " + envName;
        $('.envAppDeployName').html(dataenvAccordianName);
    });
});
$('#defaultViewButtonAppCard').click(function() {
    getprojectName(function(projectNameUrlParams) {
        var dataprojectAccordianData = "Application Deployment for : " + projectNameUrlParams;
        $('.envAppDeployName').html(dataprojectAccordianData);
    });
});

function getEnvNameforConfigure() {
    var projectId = urlParams.projid;
    $.get('/d4dMasters/project/' + projectId, function(dataforenvName) {
        var individualenvName = dataforenvName[0].environmentname;
        individualenvName = individualenvName.split(",");
        alert(individualenvName.length);
        for (var i = 0; i < individualenvName.length; i++) {
            alert(individualenvName[i]);
        }
    });
}

function resetAllFields() {
    var $chooseRepository = $('#chooseRepository');
    $chooseRepository.empty();
    $('#chooseRepository').append('<option value="">Choose Repositories</option>');
    var $chooseArtifacts = $('#chooseArtifacts');
    $chooseArtifacts.empty();
    $('#chooseArtifacts').append('<option value="">Choose Artifacts</option>');
    var $chooseVersions = $('#chooseVersions');
    $chooseVersions.empty();
    $('#chooseVersions').append('<option value="">Choose Versions</option>');
    var $repositoryUrl = $('#repositoryUrl');
    $repositoryUrl.val("");
    var $containerId = $('#containerIdDiv');
    $containerId.val("");
    var $containerPort = $('#containerPort');
    $containerPort.val("");
}

function resetSpinners() {
    $('.reposerverspinner').css('display', 'none');
    $('.repospinner').css('display', 'none');
    $('.repourlspinner').css('display', 'none');
    $('.artifactsspinner').css('display', 'none');
    $('.versionspinner').css('display', 'none');
    $('.jobdetailsspinner').css('display', 'none');
}

function getNexusServer() {
    resetAllFields();
    var $nexusServer = $('#chooseNexusServer');
    $nexusServer.empty();
    $('#chooseNexusServer').append('<option value="">Choose Server</option>');
    var $chooseJobType = $('#chooseJobType');
    $chooseJobType.empty();
    $('#chooseJobType').append('<option value="">Choose Job</option>');
    $('.reposerverspinner').css('display', 'inline-block');
    $.get('/d4dMasters/readmasterjsonnew/26', function(nexus) {
        $('.reposerverspinner').css('display', 'none');
        if (nexus.length) {
            for (var i = 0; i < nexus.length; i++) {
                $('#chooseNexusServer').append('<option data-nexusUrl = "' + nexus[i].hostname + '" value=' + nexus[i].rowid + ' data-serverType = "' + nexus[i].configType + '">' + nexus[i].nexusservername + '</option>');
            }
        }
    });
}

function getDockerServer() {
    $.get('/d4dMasters/readmasterjsonnew/18', function(dockerData) {
        if (dockerData.length) {
            for (var i = 0; i < dockerData.length; i++) {
                $('#chooseNexusServer').append('<option value=' + dockerData[i].rowid + ' data-serverType = "' + dockerData[i].configType + '">' + dockerData[i].dockerreponame + '</option>');
            }
        }
    });
}

var $nexusServer = $('#chooseNexusServer');
$nexusServer.change(function(e) {
    var nexusServerType = $('#chooseNexusServer :selected').attr('data-serverType');
    if ($('#chooseNexusServer :selected').text() == 'Choose Server') {
        $('.containerIdClass').hide();
        $('.containerPortClass').hide();
        $('.repoUrlClass').hide();
        $('.artifactClass').hide();
        $('.versionClass').hide();
        $('.createTaskLinkUpgrade').attr('disabled', 'disabled');

        // Reset all values
        resetAllFields();

    } else if (nexusServerType == 'nexus') {
        $('.containerUpgradeDeploy').hide();
        $('.createTaskLinkUpgrade').removeAttr('disabled');
        $('.repoUrlClass').show();
        $('.artifactClass').show();
        $('.versionClass').show();
        $('.containerIdClass').hide();
        $('.containerPortClass').hide();
        resetAllFields();
        getNexusServerRepo($(this).val());
        getTasks();
    } else { // It's Docker
        resetAllFields();
        $('.containerUpgradeDeploy').show();
        $('.createTaskLinkUpgrade').removeAttr('disabled');

        $('.repoUrlClass').hide();
        $('.artifactClass').hide();
        $('.versionClass').hide();
        $('.containerIdClass').show();
        $('.containerPortClass').show();
        var containerId = $('#containerIdInput').val();
        var upgrade = $('#upgradeValue').val();
        if (containerId != "NA" && upgrade == "true") {
            $('#containerIdDiv').val(containerId);
            $('#containerIdDiv').attr('disabled', 'disabled');
        }
        getDockerRepoes();
        getTasks();
    }

});

function getDockerRepoes() {
    $('.repospinner').css('display', 'inline-block');
    var $chooseRepository = $('#chooseRepository');
    var projectId = urlParams.projid;
    if (projectId) {
        $.get('/d4dMasters/project/' + projectId, function(anProject) {
            $('.repospinner').css('display', 'none');
            if (anProject.length) {
                anProject = anProject[0];
                if (anProject.repositories) {
                    var repositories = anProject.repositories.docker;
                    if (repositories.length) {
                        for (var x = 0; x < repositories.length; x++) {
                            $('#chooseRepository').append('<option value="' + repositories[x] + '">' + repositories[x] + '</option>');
                        }
                    }
                }
            }
        });
    } else {
        $('.repospinner').css('display', 'none');
    }
}

function getNexusServerRepo(nexusId) {
    $('.repospinner').css('display', 'inline-block');
    var $chooseRepository = $('#chooseRepository');
    var projectId = urlParams.projid;
    if (nexusId) {
        $.get('/nexus/' + nexusId + '/repositories', function(nexusRepos) {
            $('.repospinner').css('display', 'none');
            if (nexusRepos.length) {

                $.get('/d4dMasters/project/' + projectId, function(anProject) {
                    if (anProject.length) {
                        project = anProject[0];
                        if (project.repositories) {
                            var repositories = project.repositories.nexus;
                            if (repositories.length) {
                                for (var x = 0; x < repositories.length; x++) {
                                    (function(x) {
                                        for (var i = 0; i < nexusRepos.length; i++) {
                                            if (repositories[x] === nexusRepos[i].name) {
                                                $('#chooseRepository').append('<option data-repoName="' + nexusRepos[i].name + '" data-repoUrl="' + nexusRepos[i].resourceURI + '" value="' + nexusRepos[i].id + '">' + nexusRepos[i].name + '</option>');
                                            }
                                        }
                                    })(x);
                                }
                            }
                        }
                    }
                });
            }
        });
    } else {
        $('.repospinner').css('display', 'none');
    }
}

var $chooseRepository = $('#chooseRepository');
$chooseRepository.change(function(e) {
    var nexusServerType = $('#chooseNexusServer :selected').attr('data-serverType');
    if (nexusServerType === 'nexus') {
        $('.containerIdClass').hide();
        $('.containerPortClass').hide();
        $('.repoUrlClass').show();
        $('.artifactClass').show();
        $('.versionClass').show();

        var $repositoryUrl = $('#repositoryUrl');
        $repositoryUrl.val("");
        var $chooseArtifacts = $('#chooseArtifacts');
        $chooseArtifacts.empty();
        $('#chooseArtifacts').append('<option value="">Choose Artifacts</option>');
        var $chooseVersions = $('#chooseVersions');
        $chooseVersions.empty();
        $('#chooseVersions').append('<option value="">Choose Versions</option>');
        $('#repositoryUrl').val($(this).find('option:selected').attr('data-repoUrl'));

        var repoName = $(this).find('option:selected').attr('data-repoName');
        var nexusId = $('#chooseNexusServer').val();
        getNexusServerRepoArtifact(nexusId, repoName);
    } else {
        $('.containerIdClass').show();
        $('.containerPortClass').show();
        $('.repoUrlClass').hide();
        $('.artifactClass').hide();
        $('.versionClass').hide();
    }

});

function getNexusServerRepoArtifact(nexusId, repoName) {
    $('.artifactsspinner').css('display', 'inline-block');
    var $chooseArtifacts = $('#chooseArtifacts');
    $chooseArtifacts.empty();
    $('#chooseArtifacts').append('<option value="">Choose Artifacts</option>');
    if (nexusId && repoName) {
        $.get('/nexus/' + nexusId + '/repositories/' + repoName + '/artifact', function(artifacts) {
            $('.artifactsspinner').css('display', 'none');
            if (artifacts.length) {
                var uniqueArtifacts = [];
                var checker;
                for (var i = 0; i < artifacts.length; i++) {
                    if (!checker || comparer(checker, artifacts[i]) != 0) {
                        checker = artifacts[i];
                        uniqueArtifacts.push(checker);
                    }
                }
                for (var j = 0; j < uniqueArtifacts.length; j++) {
                    $('#chooseArtifacts').append('<option data-groupId="' + uniqueArtifacts[j].groupId + '" value=' + uniqueArtifacts[j].artifactId + '>' + uniqueArtifacts[j].artifactId + '</option>');
                }
            }
        });
    } else {
        $('.artifactsspinner').css('display', 'none');
    }
}
var $chooseArtifacts = $('#chooseArtifacts');
$chooseArtifacts.change(function(e) {
    var $chooseVersions = $('#chooseVersions');
    $chooseVersions.empty();
    $('#chooseVersions').append('<option value="">Choose Versions</option>');
    var repoName = $('#chooseRepository').find('option:selected').attr('data-repoName');
    var nexusId = $('#chooseNexusServer').val();
    var groupId = $(this).find('option:selected').attr('data-groupId');
    var reqBody = {
        "groupId": groupId,
        "artifactId": $(this).val()
    };
    getNexusServerRepoArtifactVersions(nexusId, repoName, reqBody);
});

var comparer = function compareObject(a, b) {
    if (a.artifactId === b.artifactId) {
        return 0;
    } else {
        return 1;
    }
}

function getNexusServerRepoArtifactVersions(nexusId, repoName, reqBody) {
    $('.versionspinner').css('display', 'inline-block');
    var $chooseVersions = $('#chooseVersions');
    $chooseVersions.empty();
    $('#chooseVersions').append('<option value="">Choose Versions</option>');
    if (nexusId && repoName && reqBody.groupId && reqBody.artifactId) {
        $.ajax({
            url: '/nexus/' + nexusId + '/repositories/' + repoName + '/artifact/versions',
            data: JSON.stringify(reqBody),
            type: 'POST',
            contentType: "application/json",
            success: function(data) {
                $('.versionspinner').css('display', 'none');
                if (data) {
                    var versions = data.metadata.versioning[0].versions[0].version;
                    for (var i = 0; i < versions.length; i++) {
                        $('#chooseVersions').append('<option value=' + versions[i] + '>' + versions[i] + '</option>');
                    }
                }
            },
            error: function(jqxhr) {
                $('.versionspinner').css('display', 'none');
                alert(jqxhr.responseText);
            }
        });
    } else {
        $('.versionspinner').css('display', 'none');
    }
}

function getTasks() {
    var orgId = urlParams.org;
    var bgId = urlParams.bg;
    var projectId = urlParams.projid;
    var envId = urlParams.envid;
    var $chooseJobType = $('#chooseJobType');
    $chooseJobType.empty();
    $('#chooseJobType').append('<option value="">Choose Job</option>');

    $.get('/organizations/' + orgId + '/businessgroups/' + bgId + '/projects/' + projectId + '/environments/' + envId + '/tasks', function(tasks) {
        if (tasks.length) {
            for (var i = 0; i < tasks.length; i++) {
                $('#chooseJobType').append('<option value=' + tasks[i]._id + '>' + tasks[i].name + '</option>');
            }
        }
    });
}


// on click of Upgrade button
$('.saveUpgradeAppDeploy').on('click', function() {
    var nexusServerType = $('#chooseNexusServer :selected').attr('data-serverType');
    if (nexusServerType === 'nexus') {
        upgradeOrDeploy();
    } else {
        deployNewForDocker();
    }
});

$('.saveNewAppDeploy').on('click', function() {
    var nexusServerType = $('#chooseNexusServer :selected').attr('data-serverType');
    if (nexusServerType === 'nexus') {
        upgradeOrDeploy();
    } else {
        $('#containerIdInput').val($('#containerIdDiv').val());
        deployNewForDocker();
    }
});

// Deploy New App for Docker Container
function deployNewForDocker() {
    var nexusId = $('#chooseNexusServer').find('option:selected').val();
    if (!nexusId) {
        alert("Please select repository server.");
        return false;
    }
    var repoId = $('#chooseRepository').find('option:selected').val();
    if (!repoId) {
        alert("Please select repository.");
        return false;
    }
    var containerId = $('#containerIdInput').val();
    var containerPort = $('#containerPort').val();

    if (!containerPort) {
        alert("Please specify port.");
        return false;
    }
    var taskId = $('#chooseJobType').find('option:selected').val();
    if (!taskId) {
        alert("Please select job.");
        return false;
    }
    var orgId = urlParams.org;
    var bgId = urlParams.bg;
    var projectId = urlParams.projid;
    var envId = urlParams.envid;
    var appName = repoId.split("/")[1];
    var upgrade = $('#upgradeValue').val();
    var nexusData = {
        "nexusData": {
            "nexusUrl": "",
            "version": "",
            "containerId": containerId,
            "containerPort": containerPort,
            "dockerRepo": repoId,
            "upgrade": upgrade,
            "projectId": projectId
        }
    };

    $.get('/d4dMasters/project/' + projectId, function(projData) {
        if (projData.length) {
            var reqBody = {
                "appName": appName,
                "description": appName + " deployed."
            };
            $.ajax({
                url: '/d4dMasters/project/' + projectId + '/appdeploy/appName/update',
                data: JSON.stringify(reqBody),
                type: 'POST',
                contentType: "application/json",
                success: function(data) {},
                error: function(jqxhr) {
                    //alert("Failed to update update appName in Project.")
                }
            });
        }
    });
    $('a[data-executetaskid=' + taskId + ']').trigger('click', nexusData);
    $('#modalUpgradeAppDeploy').modal('hide');
    var $containerIdName = $('#containerIdInput').val('');
}

function upgradeOrDeploy() {
    var nexusId = $('#chooseNexusServer').find('option:selected').val();
    if (!nexusId) {
        alert("Please select repository server.");
        return false;
    }
    var repoId = $('#chooseRepository').find('option:selected').val();
    if (!repoId) {
        alert("Please select repository.");
        return false;
    }
    var artifactId = $('#chooseArtifacts').find('option:selected').val();
    if (!artifactId) {
        alert("Please select artifact.");
        return false;
    }
    var versionId = $('#chooseVersions').find('option:selected').val();
    if (!versionId) {
        alert("Please select version.");
        return false;
    }
    var taskId = $('#chooseJobType').find('option:selected').val();
    if (!taskId) {
        alert("Please select job.");
        return false;
    }
    var orgId = urlParams.org;
    var bgId = urlParams.bg;
    var projectId = urlParams.projid;
    var envId = urlParams.envid;
    var groupId = $('#chooseArtifacts').find('option:selected').attr('data-groupId').replace(/\./g, '/');
    var nexusUrl = $('#chooseNexusServer').find('option:selected').attr('data-nexusUrl');
    var nexusRepoUrl = "";
    if (repoId === "petclinic") {
        nexusRepoUrl = nexusUrl + "/service/local/repositories/" + repoId + "/content/" + groupId + "/" + artifactId + "/" + versionId + "/" + artifactId + "-" + versionId + ".war";
    } else {
        nexusRepoUrl = nexusUrl + "/service/local/repositories/" + repoId + "/content/" + groupId + "/" + artifactId + "/" + versionId + "/" + artifactId + "-" + versionId + ".zip";
    }

    var upgrade = $('#upgradeValue').val();
    var nexusData = {
        "nexusData": {
            "nexusUrl": nexusRepoUrl,
            "version": versionId,
            "containerId": "",
            "containerPort": "",
            "dockerRepo": "",
            "upgrade": upgrade,
            "projectId": projectId
        }
    };

    $.get('/d4dMasters/project/' + projectId, function(projData) {
        if (projData.length) {
            var reqBody = {
                "appName": repoId,
                "description": repoId + " deployed."
            };
            $.ajax({
                url: '/d4dMasters/project/' + projectId + '/appdeploy/appName/update',
                data: JSON.stringify(reqBody),
                type: 'POST',
                contentType: "application/json",
                success: function(data) {

                },
                error: function(jqxhr) {
                    //alert("Failed to update update appName in Project.")
                }
            });
        }
    });
    $('a[data-executetaskid=' + taskId + ']').trigger('click', nexusData);
    $('#modalUpgradeAppDeploy').modal('hide');
    var $containerIdName = $('#containerIdInput').val('');
}

function saveRecord() {
    var dataDeploy = {
        "appDeployData": {
            "applicationName": "",
            "description": "",
            "projectId": ""
        }
    };
    var applicationName = $('#appNameInput').val();
    var applicationDescription = $('#applicationDescriptionInput').val();
    var projectId = urlParams.projid;
    if (!applicationName) {
        $('#errorParam').empty();
        $('#errorParam').append('Application name should not be empty');
        return;
    } else {
        dataDeploy.appDeployData.description = applicationDescription;
        dataDeploy.appDeployData.projectId = projectId;
        dataDeploy.appDeployData.applicationName = applicationName;
        $.ajax({
            url: '/app/deploy/data/create',
            data: JSON.stringify(dataDeploy),
            type: 'POST',
            contentType: "application/json",
            success: function(data) {
                $('#modalAppCardDetails').modal("hide");
                getDropdownList();
            },
            error: function(jqxhr) {
                $("#errorParam").empty();
                $("#errorParam").append("    " + jqxhr.responseText);
            }
        });
    }
}

function getDropdownList() {
    var projectId = urlParams.projid;
    $.get('/d4dMasters/project/' + projectId, function(dataTotalList) {
        var $chooseApplication = $('#chooseApplication');
        $chooseApplication.empty();
        $chooseApplication.append('<option value="All Application">All Application</option>');
        $('#chooseApplication').select2();
        var applicationNameArr = [];
        var applicationDescArr = {};
        $.each(dataTotalList[0].appdeploy, function(key, val) {
            $option = $('<option value="' + val.applicationname + '">' + val.applicationname + '</option>');
            $chooseApplication.append($option);
        });

        $chooseApplication.change();
    }).fail(function() {
        alert("getDropdownList Error");
    });
}

function constructDataListTable() {
    var $taskenvArrayTable = $('#tableappParamDeploy').DataTable();
    $taskenvArrayTable.clear().draw(false);
    $.get('/d4dMasters/readmasterjsonnew/4', function(dataTotalList) {
        $.each(dataTotalList, function(key, val) {
            var $taskenvArrayTable = $('#tableappParamDeploy');
            var rowindex1 = $taskenvArrayTable.dataTable().fnGetData().length;
            $taskenvArrayTable.dataTable().fnAddData([
                rowindex1 + 1,
                val.applicationname,
                val.description
            ]);
        });
    }).fail(function() {});
}

function getenvName(callback) {
    var envId = urlParams.envid;
    $.ajax({
        url: '/d4dMasters/env/' + envId,
        type: 'GET',
        async: true,
        contentType: "application/json",
        success: function(dataenvName) {
            callback(dataenvName);
        },
        error: function(jqxhr) {

        },
        failure: function(data1) {

        }
    });
}

function getprojectName(callback) {
    var projectId = urlParams.projid;
    $.ajax({
        url: '/d4dMasters/projectname/' + projectId,
        type: 'GET',
        async: true,
        contentType: "application/json",
        success: function(datarojectName) {
            callback(datarojectName);
        },
        error: function(jqxhr) {

        },
        failure: function(data1) {

        }
    });
}

function getAllApplicationData() {
    var projectId = urlParams.projid;
    getenvName(function(envName) {
        $.get('/app/deploy/env/' + envName + '/project/' + projectId + '/list', function(data) {
            constructUI(data);
        }).fail(function() {});
    });
};

function constructUI(data) {
    $('.loadingAppDeploySpinner').hide();
    $("#accordion-AppDeploy").empty();
    if (data.length) {
        var $chooseApplication = $('#chooseApplication');
        var selectedAppName = $chooseApplication.val();
        if (typeof selectedAppName != 'undefined') {
            $('#appDeployName').append().text("  for '" + selectedAppName + "'");
            /*$("#widgetAppDeploy").css({
                "border-left": "1px solid rgb(221, 221, 221)",
                "border-right": "1px solid rgb(221, 221, 221)",
                "border-bottom": "1px solid rgb(221, 221, 221)"
            });*/
            $('#widgetAppDeploy').show();
        } else {
            $('#appDeployName').append().text("");
            $('#widgetAppDeploy').hide();
        }
        $("#nodataAppDeploy").css({
            "text-align": "center",
            "margin-top": "0px",
            "padding-top": "20px",
            "display": "none"
        });

        var $accordianTemplate = $('.accordianTemplateContainer').find('.accordianTemplate');
        var dataenvAccordianName;

        function moreInfoAppDeployClickHandler(e) {
            var $modal = $('#modalAppCardLogDetails');
            var $logContainer = $modal.find('.logsForAppDeploy').show();
            $logContainer.empty().append('<img class="center-block" style="height:50px;width:50px;margin-top: 10%;margin-bottom: 10%;" src="img/loading.gif" />');
            $.ajax({
                url: '/app/deploy/' + this.id + '/logs',
                type: 'GET',
                contentType: "application/json",
                success: function(data) {
                    var datahttp = data.indexOf("http://");
                    if (datahttp == 0) {
                        $logContainer.empty();
                        window.open(data, "_blank");
                    } else {
                        $logContainer.empty();
                        $modal.modal('show');
                        data = data.replace(/,/g, "<br />");
                        $logContainer.append(data);
                    }
                },
                error: function(jqxhr) {
                    $logContainer.empty();
                    $modal.modal('show');
                    $logContainer.append('No Logs Available');
                },
                failure: function(data) {

                }
            });
        }

        function moreInfoUpgradeAppDeployClickHandler(e) {
            $('.repoUrlClass').hide();
            $('.artifactClass').hide();
            $('.versionClass').hide();
            $('#upgradeValue').val("true");
            $('#formUpgradeAppDeploy')[0].reset();
            $('.containerClass').hide();
            resetSpinners();
            $('.modaltitleforNewDeploy').hide();
            $('.modaltitleforupgradeDeploy').show();
            $('.saveNewAppDeploy').hide();
            $('.saveUpgradeAppDeploy').show();
            if ($('#chooseNexusServer :selected').text() == 'Choose Server') {
                $('.createTaskLinkUpgrade').attr('disabled', 'disabled');
            } else {
                $('.createTaskLinkUpgrade').removeAttr('disabled');
            }
            var tabletrIndex = $(".moreinfoUpgradeAppDeploy").index($(this));

            var upgradeAppNameText = $('#tableappDeploydetails tbody tr:eq(' + tabletrIndex + ') td:first').html();
            var upgradeNodeIpText = $('#tableappDeploydetails tbody tr:eq(' + tabletrIndex + ') td:nth-child(5)').html();
            var containerId = $('#tableappDeploydetails tbody tr:eq(' + tabletrIndex + ') td:nth-child(7)').html();
            containerId = containerId.split("</div>")[0].split(">")[1];
            if (!containerId) {
                containerId = "NA";
            }
            $("#upgradeAppName").html(upgradeAppNameText);
            $("#upgradeNodeIp").html(upgradeNodeIpText);
            getNexusServer();
            getDockerServer();
            var $modal = $('#modalUpgradeAppDeploy');
            $('#containerIdInput').val(containerId);
            $modal.modal('show');
        }

        $('#tableappDeploydetails').on('click', '.moreinfoAppDeploy', moreInfoAppDeployClickHandler);
        $('#tableappDeploydetails').on('click', '.moreinfoUpgradeAppDeploy', moreInfoUpgradeAppDeployClickHandler);
        if (data && data.length) {
            var $clone = $accordianTemplate.clone(true);
            for (var i = 0; i < data.length; i++) {
                if (data[i].projectId) {
                    if ($('#' + data[i].projectId + data[i].applicationName + data[i].envId + '_parentAccordian').length == 0) {
                        if (typeof data[i].projectId + data[i].applicationName + data[i].envId == 'undefined') {
                            dataenvAccordianName = '';
                            $clone.find('.envAppDeployName').html(dataenvAccordianName);
                        } else {
                            getprojectName(function(projectNameUrlParams) {
                                var dataenvAccordianName = "Application Deployment for : " + projectNameUrlParams;
                                $clone.find('.envAppDeployName').html(dataenvAccordianName);
                            });
                        }
                        $clone.find('.panel-title').css({
                            "padding": "10px"
                        });
                        $('#accordion-AppDeploy').append($clone);
                        if (!$.fn.dataTable.isDataTable('#tableappDeploydetails')) {
                            $('#tableappDeploydetails').DataTable({
                                "pagingType": "full_numbers",
                                "iDisplayLength": 5,
                                "aLengthMenu": [
                                    [5, 40, 100, -1],
                                    [5, 40, 100, "All"]
                                ],
                                "aaSorting": [
                                    [5, 'desc']
                                ],
                                "aoColumns": [{
                                    "bSortable": true
                                }, {
                                    "bSortable": true
                                }, {
                                    "bSortable": true
                                }, {
                                    "bSortable": true
                                }, {
                                    "bSortable": true
                                }, {
                                    "bSortable": true
                                }, {
                                    "bSortable": true
                                }, {
                                    "bSortable": true
                                }, {
                                    "bSortable": true
                                }, {
                                    "bSortable": false
                                }, {
                                    "bSortable": false
                                }]
                            });
                        }
                    }
                    var $taskenvArray = $('#tableappDeploydetails');
                    var upgradeAppDeploy;
                    if (!data[i]._id) {
                        upgradeAppDeploy = "NA";
                    } else {
                        upgradeAppDeploy = '<a class="btn btn-primary btn-sg tableactionbutton moreinfoUpgradeAppDeploy" style="box-shadow: none ! important; height: 25px; width: 25px; padding: 2px; font-size: 12px;"><i class="ace-icon fa fa-upload bigger-120"></i></a>';
                    }



                    var logsAppDeploy;
                    if (!data[i]._id) {
                        logsAppDeploy = "NA";
                    } else {
                        logsAppDeploy = '<a class="moreinfoAppDeploy" id=' + data[i]._id + ' title="Logs Info" style="margin-left:27%"></a>';
                    }
                    if (!data[i].applicationName) {
                        data[i].applicationName = "NA";
                    }
                    if (!data[i].applicationInstanceName) {
                        if (data[i].hostName) {
                            data[i].applicationInstanceName = data[i].hostName;
                        } else {
                            data[i].applicationInstanceName = "NA";
                        }
                    }
                    if (!data[i].applicationVersion) {
                        data[i].applicationVersion = "NA";
                    }
                    if (!data[i].applicationType) {
                        data[i].applicationType = "NA";
                    }
                    if (!data[i].containerId) {
                        data[i].containerId = "NA";
                    } else {
                        data[i].containerId = '<div class="spanTextApplication" title="' + data[i].containerId + '">' + data[i].containerId + '</div>'
                    }
                    if (!data[i].hostName) {
                        data[i].hostName = "NA";
                    }
                    if (!data[i].applicationNodeIP) {
                        data[i].applicationNodeIP = "NA";
                    }
                    if (!data[i].applicationLastDeploy) {
                        data[i].applicationLastDeploy = "NA";
                    }
                    if (!data[i].applicationStatus) {
                        data[i].applicationStatus = "NA";
                    }
                    var applicationLastDeployTime = data[i].applicationLastDeploy;

                    if ((applicationLastDeployTime.toLowerCase().indexOf("am") > -1) || (applicationLastDeployTime.toLowerCase().indexOf("pm") > -1)) {
                        applicationLastDeployTime = applicationLastDeployTime;
                    } else {
                        applicationLastDeployTime = getLocaleTime(applicationLastDeployTime);
                    }

                    $taskenvArray.dataTable().fnAddData([
                        //rowindex + 1,
                        data[i].applicationName,
                        data[i].applicationInstanceName,
                        data[i].applicationVersion,
                        data[i].hostName,
                        data[i].applicationNodeIP,
                        applicationLastDeployTime,
                        data[i].containerId,
                        data[i].applicationType,
                        data[i].applicationStatus,
                        logsAppDeploy,
                        upgradeAppDeploy
                    ]);
                }
                if (typeof data[i].envId == 'undefined') {
                    $('#' + data[i].projectId + data[i].applicationName + data[i].envId + '_parentAccordian').hide();
                }
            }
        }
    } else {
        $("#nodataAppDeploy").empty();
        $('.fornNoDataDiv').show();
        if (!$.fn.dataTable.isDataTable('#tableappDeploydetailsforNoData')) {
            $('#tableappDeploydetailsforNoData').DataTable({
                "pagingType": "full_numbers",
                "iDisplayLength": 5,
                "aLengthMenu": [
                    [5, 40, 100, -1],
                    [5, 40, 100, "All"]
                ],
                "aaSorting": [
                    [5, 'desc']
                ],
                "aoColumns": [{
                    "bSortable": true
                }, {
                    "bSortable": true
                }, {
                    "bSortable": true
                }, {
                    "bSortable": true
                }, {
                    "bSortable": true
                }, {
                    "bSortable": true
                }, {
                    "bSortable": true
                }, {
                    "bSortable": true
                }, {
                    "bSortable": true
                }, {
                    "bSortable": false
                }, {
                    "bSortable": false
                }]
            });
        }
        var $accordianTemplatenoData = $('.accordianTemplateContainer').find('.accordianTemplate');
        $accordianTemplatenoData.css({
            "border-color": "#fff",
            "margin-bottom": "0px"
        });
        $accordianTemplatenoData.find('.panel-title').css({
            "padding": "0px"
        });
        $accordianTemplatenoData.find('.margintop2right8').css({
            "margin-top": "-6px"
        });
        var $clonenoData = $accordianTemplatenoData.clone(true);
        $clonenoData.find('#tableappDeploydetails').parent().hide();
        getprojectName(function(projectNameUrlParams) {
            var dataprojectAccordianNameforNoData = "Application Deployment for : " + projectNameUrlParams;
            $clonenoData.find('.envAppDeployName').html(dataprojectAccordianNameforNoData);
        });
        $("#nodataAppDeploy").css({
            "display": "block"
        }).append($clonenoData);
    }
}
$('#parameterAppDeploySaveBtn').on("click", function() {});

$('.envAppDeployModal').click(function(e) {
    $('#formAppDeploy').trigger("reset");
    $("#errorParam").empty();
});
$('.envAppDeployList').click(function(e) {
    constructDataListTable();
});
if (!$.fn.dataTable.isDataTable('#tableappParamDeploy')) {
    $('#tableappParamDeploy').DataTable({
        "pagingType": "full_numbers",
        "iDisplayLength": 5,
        "aLengthMenu": [
            [5, 40, 100, -1],
            [5, 40, 100, "All"]
        ],
        "aoColumns": [{
            "bSortable": true
        }, {
            "bSortable": true
        }, {
            "bSortable": true
        }]
    });
}
$("#tableappParamDeploy_length").hide();
$("#tableappParamDeploy_filter").hide();
var urlParams = {};
(window.onpopstate = function() {
    var url = window.location.href;
    alert(typeof url);
    var indexOfQues = url.lastIndexOf("?");
    if (indexOfQues != -1) {
        var sub = url.substring(indexOfQues + 1);
        var params = sub.split('&')
        for (var i = 0; i < params.length; i++) {
            var paramParts = params[i].split('=');
            urlParams[paramParts[0]] = paramParts[1];
        }
    }
})();

function getLocaleTime(str) {
    var findTimeStamp = function(x) {
        x = x.replace(' +0000', '');
        var temp = str.split(' ');
        var date = temp[0].split('-');
        var time = temp[1].split(":");
        var ddate = new Date(Date.UTC(parseInt(date[0]), parseInt(date[1]) - 1, parseInt(date[2]), parseInt(time[0]), parseInt(time[1]), parseInt(time[2])));
        return ddate.getTime();
    }
    var t = findTimeStamp(str);
    if (t != undefined || t != null) {
        try {
            return new Date(findTimeStamp(str)).toLocaleString();
        } catch (err) {
            return applicationLastDeployTime.slice(0, -6);
        }
    } else {
        return applicationLastDeployTime.slice(0, -6);
    }
}
$('.createTaskLinkUpgrade').click(function(e) {
    $('#modalassignTaskUpgrade').modal("show");
    $("#modalassignTaskUpgrade .modal-body").empty();
    $("#modalassignTaskUpgrade .modal-body").load("ajax/assignTaskUpgradeApp.html");
});