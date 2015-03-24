$(function() {

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

    // var htmlTemplate = '<div style="max-width: 262px !important;" class="col-sm-4 col-md-4 col-lg-3 col-xs-12 appcard-role-outer"> <div style="border-radius: 12px;border-color: #dddddd;" class="panel panel-primary appcard-role-inner"> <div style="height:40px;text-align:center;background:#40baf1 !important;border-radius: 10px 10px 0 0;border-color: #40baf1 !important;" class="panel-heading"> <span contenteditable="false" style="float:left;" class="domain-roles-icon"> <img src="img/liferay.jpg" style="height:24px"> </span> <span style="text-align:center;width:30px;font-weight: bold;"> <a class="applicationName" style="color:white" href="javascript:void(0)">Life Ray</a> </span> <span class="pull-right"> <a data-toggle="modal" href="#modalAppCardSettings" style="padding-right:5px;cursor:pointer;color:white;font-size:20px;" class="fa fa-cog"> </a> </span> <br></div><div data-deploy-runlist="recipe[liferay]" data-instance-ip="52.11.46.8" data-jenkin-job-name="LR-Spring" class="appCardBody"> <div style="min-height: 115px;" class="appCardLoadingContainer"> <img src="img/loading.gif" style="height:50px;width:50px;margin-top: 10%;margin-bottom: 10%;" class="center-block"> </div><div style="padding: 7px;" class="panel-body panel-primary appCardInfo"> <div class="minheight120"> <div style="height:20px;" class="col-lg-12 col-sm-12 col-xs-12"> <label style="margin-left: 90px;" class="custom-select"> <select style="font-size: 11px;"> <option>AWS_SCLT</option> <option>AWS_CHINA</option> <option>AWS_INDIA</option> </select> </label> </div><div class="col-lg-12 col-sm-12 col-xs-12 paddingtopbottom10"> <img style="height: 24px;margin-left: -5px;" src="img/projectdemo/app-performanceblack.png"> <div style=" margin-left: 30px;margin-top: -22px;"> <a style="color: #777;font-size: 13px;" href="newrelic.html" target="_blank">App Performance</a> </div></div><div class="col-lg-12 col-sm-12 col-xs-12 paddingtopbottom10"> <img style="height: 27px;margin-left: -5px;" src="img/projectdemo/logsblack.png"> <div style=" margin-left: 30px;margin-top: -22px;"> <a style="color: #777;font-size: 13px;" href="kibana.html" target="_blank">App Logs</a> </div></div><div class="col-lg-12 col-sm-12 col-xs-12 paddingtopbottom10"> <img style="height: 27px;margin-left: -5px;" src="img/projectdemo/code_healthblack.png"> <div style=" margin-left: 30px;margin-top: -22px;"> <a class="codeHealthUrl" style="color: #777;font-size: 13px;" href="sonar.html" target="_blank">Code Health</a> </div></div><div class="col-lg-12 col-sm-12 col-xs-12 paddingtopbottom10"> <img style="height: 27px;margin-left: -5px;" src="img/projectdemo/UI_performanceblack.png"> <div style=" margin-left: 30px;margin-top: -22px;"> <a class="uiHealthUrl" style="color: #777;font-size: 13px;" href="yslow.html" target="_blank">UI Performance</a> </div></div></div></div><div style="padding:3px;border-radius:0 0 12px 12px;background:white!important;" class="panel-footer clearfix"> <div style="padding-left:4px;padding-right:4px;" class="col-lg-12 col-sm-12 col-xs-12"> <div style="padding-left:0px;" class="col-lg-4 col-sm-4 col-xs-4"> <a style="margin-bottom:2px;font-size:12px;color:#666" data-original-title="3/3/2015 11:08:28am" data-placement="top" rel="tooltip" class="btn btn-white btn-sm btnBuild width100" data-toggle="modal" href="javascript:void(0)">Last Build </a> </div><div style="padding-left:0px;padding-right:0px;" class="col-lg-4 col-sm-4 col-xs-4"> <a style="margin-bottom:2px;font-size:12px;color:#666" data-original-title="3/3/2015 17:08:52pm" data-placement="top" rel="tooltip" class="btn btn-white btn-sm btnDeploy width100" data-toggle="modal" href="javascript:void(0)">Last Deploy </a> </div><div style="padding-right:0px;" class="col-lg-4 col-sm-4 col-xs-4"> <a style="margin-bottom:2px;font-size:12px;color:#666" data-original-title="2/3/2015 09:23:25am" data-placement="top" rel="tooltip" class="btn btn-white btn-sm btnTest width100" data-toggle="modal" href="javascript:void(0)">Last Test </a> </div></div><div style="padding-left:4px;padding-right:4px;margin-top:-8px" class="col-lg-12 col-sm-12 col-xs-12"> <div style="padding-left:0px;" class="col-lg-4 col-sm-4 col-xs-4"> <a style="background: none repeat scroll 0 0 #01df3a;margin-bottom:2px; height: 4px;" class="btn btn-white btn-sm btnBuild" data-toggle="modal" href="javascript:void(0)"> </a> </div><div style="padding-left:0px;padding-right:0px;" class="col-lg-4 col-sm-4 col-xs-4"> <a style="background: none repeat scroll 0 0 red;margin-bottom:2px; height: 4px;" class="btn btn-white btn-sm btnBuild" data-toggle="modal" href="javascript:void(0)"> </a> </div><div style="padding-right:0px;" class="col-lg-4 col-sm-4 col-xs-4"> <a style="background: none repeat scroll 0 0 #01df3a;margin-bottom:2px; height: 4px;" class="btn btn-white btn-sm btnBuild" data-toggle="modal" href="javascript:void(0)"> </a> </div></div><div style="padding-left:4px;padding-right:4px;" class="col-lg-12 col-sm-12 col-xs-12"> <div style="padding-left:0px;" class="col-lg-4 col-sm-4 col-xs-4"> <a class="btn btn-primary btn-sm width50borderradius50 appCardBuildBtn" data-toggle="modal" href="javascript:void(0)"> <i style="font-size: 14px;" class="fa fa-inbox"> </i> </a> <span style="font-size: 10px;">Build</span> </div><div style="padding-left:0px;padding-right:0px;" class="col-lg-4 col-sm-4 col-xs-4"> <a class="btn btn-primary btn-sm width40borderradius50Deploy" data-toggle="modal" href="#modalappCardDeploy"> <i style="font-size: 14px;" class="fa fa-bullseye"> </i> </a> <span style="font-size: 10px;">Deploy</span> </div><div style="padding-right:0px;" class="col-lg-4 col-sm-4 col-xs-4"> <a style="padding-left:10px;" class="btn btn-primary btn-sm width50borderradius50" data-toggle="modal" href="#modalappCardTest"> <i style="font-size: 14px;" class="fa fa-location-arrow"> </i> </a> <span style="font-size: 10px;">Test</span> </div></div></div></div></div></div>'
    var htmlTemplate = '<div style="max-width: 262px !important;" class="col-sm-4 col-md-4 col-lg-3 col-xs-12 appcard-role-outer"> <div style="border-radius: 12px;border-color: #dddddd;" class="panel panel-primary appcard-role-inner"> <div style="height:40px;text-align:center;background:#40baf1 !important;border-radius: 10px 10px 0 0;border-color: #40baf1 !important;" class="panel-heading"> <span contenteditable="false" style="float:left;" class="domain-roles-icon"> <img src="img/liferay.jpg" style="height:24px"> </span> <span style="text-align:center;width:30px;font-weight: bold;"> <a class="applicationName" style="color:white" href="javascript:void(0)">Life Ray</a> </span> <br></div><div data-deploy-runlist="recipe[liferay]" data-instance-ip="52.11.46.8" data-jenkin-job-name="LR-Spring" class="appCardBody"> <div style="min-height: 115px;" class="appCardLoadingContainer"> <img src="img/loading.gif" style="height:50px;width:50px;margin-top: 10%;margin-bottom: 10%;" class="center-block"> </div><div style="padding: 7px;" class="panel-body panel-primary appCardInfo"> <div class="minheight120"> <div style="height:20px;" class="col-lg-12 col-sm-12 col-xs-12"> <label style="margin-left: 90px;" class="custom-select"> <select style="font-size: 11px;"> <option>AWS_SCLT</option> <option>AWS_CHINA</option> <option>AWS_INDIA</option> </select> </label> </div><div class="col-lg-12 col-sm-12 col-xs-12 paddingtopbottom10"> <img style="height: 24px;margin-left: -5px;" src="img/projectdemo/app-performanceblack.png"> <div style=" margin-left: 30px;margin-top: -22px;"> <a style="color: #777;font-size: 13px;" href="newrelic.html" target="_blank">App Performance</a> </div></div><div class="col-lg-12 col-sm-12 col-xs-12 paddingtopbottom10"> <img style="height: 27px;margin-left: -5px;" src="img/projectdemo/logsblack.png"> <div style=" margin-left: 30px;margin-top: -22px;"> <a style="color: #777;font-size: 13px;" href="kibana.html" target="_blank">App Logs</a> </div></div><div class="col-lg-12 col-sm-12 col-xs-12 paddingtopbottom10"> <img style="height: 27px;margin-left: -5px;" src="img/projectdemo/code_healthblack.png"> <div style=" margin-left: 30px;margin-top: -22px;"> <a class="codeHealthUrl" style="color: #777;font-size: 13px;" href="sonar.html" target="_blank">Code Health</a> </div></div><div class="col-lg-12 col-sm-12 col-xs-12 paddingtopbottom10"> <img style="height: 27px;margin-left: -5px;" src="img/projectdemo/UI_performanceblack.png"> <div style=" margin-left: 30px;margin-top: -22px;"> <a class="uiHealthUrl" style="color: #777;font-size: 13px;" href="yslow.html" target="_blank">UI Performance</a> </div></div></div></div><div style="padding:3px;border-radius:0 0 12px 12px;background:white!important;" class="panel-footer clearfix"> <div style="padding-left:4px;padding-right:4px;" class="col-lg-12 col-sm-12 col-xs-12"> <div style="padding-left:0px;" class="col-lg-4 col-sm-4 col-xs-4"> <a style="margin-bottom:2px;font-size:12px;color:#666" data-original-title="3/3/2015 11:08:28am" data-placement="top" rel="tooltip" class="btn btn-white btn-sm btnBuild width100" data-toggle="modal" href="javascript:void(0)">Last Build </a> </div><div style="padding-left:0px;padding-right:0px;" class="col-lg-4 col-sm-4 col-xs-4"> <a style="margin-bottom:2px;font-size:12px;color:#666" data-original-title="3/3/2015 17:08:52pm" data-placement="top" rel="tooltip" class="btn btn-white btn-sm btnDeploy width100" data-toggle="modal" href="javascript:void(0)">Last Deploy </a> </div><div style="padding-right:0px;" class="col-lg-4 col-sm-4 col-xs-4"> <a style="margin-bottom:2px;font-size:12px;color:#666" data-original-title="2/3/2015 09:23:25am" data-placement="top" rel="tooltip" class="btn btn-white btn-sm btnTest width100" data-toggle="modal" href="javascript:void(0)">Last Test </a> </div></div><div style="padding-left:4px;padding-right:4px;margin-top:-8px" class="col-lg-12 col-sm-12 col-xs-12"> <div style="padding-left:0px;" class="col-lg-4 col-sm-4 col-xs-4"> <a style="background: none repeat scroll 0 0 #01df3a;margin-bottom:2px; height: 4px;" class="btn btn-white btn-sm btnBuild" data-toggle="modal" href="javascript:void(0)"> </a> </div><div style="padding-left:0px;padding-right:0px;" class="col-lg-4 col-sm-4 col-xs-4"> <a style="background: none repeat scroll 0 0 red;margin-bottom:2px; height: 4px;" class="btn btn-white btn-sm btnBuild" data-toggle="modal" href="javascript:void(0)"> </a> </div><div style="padding-right:0px;" class="col-lg-4 col-sm-4 col-xs-4"> <a style="background: none repeat scroll 0 0 #01df3a;margin-bottom:2px; height: 4px;" class="btn btn-white btn-sm btnBuild" data-toggle="modal" href="javascript:void(0)"> </a> </div></div><div style="padding-left:4px;padding-right:4px;" class="col-lg-12 col-sm-12 col-xs-12"> <div style="padding-left:0px;" class="col-lg-4 col-sm-4 col-xs-4"> <a class="btn btn-primary btn-sm width50borderradius50 appCardBuildBtn" data-toggle="modal" href="javascript:void(0)"> <i style="font-size: 14px;" class="fa fa-inbox"> </i> </a> <span style="font-size: 10px;">Build</span> </div><div style="padding-left:0px;padding-right:0px;" class="col-lg-4 col-sm-4 col-xs-4"> <a class="btn btn-primary btn-sm width40borderradius50Deploy" data-toggle="modal" href="#modalappCardDeploy"> <i style="font-size: 14px;" class="fa fa-bullseye"> </i> </a> <span style="font-size: 10px;">Deploy</span> </div><div style="padding-right:0px;" class="col-lg-4 col-sm-4 col-xs-4"> <a style="padding-left:10px;" class="btn btn-primary btn-sm width50borderradius50" data-toggle="modal" href="#modalappCardTest"> <i style="font-size: 14px;" class="fa fa-location-arrow"> </i> </a> <span style="font-size: 10px;">Test</span> </div></div></div></div></div></div>'
    var $appCardTemplate = $(htmlTemplate);

    function createAppCard(data) {
        var $appCard = $appCardTemplate.clone();
        var applicationId = data._id;
        $appCard.data('applicationId', data._id);
        $appCard.find('.applicationName').html(data.name);

        $appCard.find('.appcard-role-inner').click(function(e) {
            var selectedappcardDesign = $(".appcard-role-inner").index($(this));
            localStorage.setItem("appCardListDisplay", "true");
            localStorage.setItem("selectedappcardDesign", selectedappcardDesign);
            $('.appcard-role-inner').removeClass('role-Selectedcard-app');
            $(this).addClass('role-Selectedcard-app');
        });

        $.get('../applications/' + applicationId + '/buildConf', function(buildData) {
            $appCard.find('.codeHealthUrl').attr('href', buildData.codeAnalysisUrl);
            $appCard.find('.uiHealthUrl').attr('href', buildData.uiPerformaceUrl);
        });



        $appCard.find('.appCardBuildBtn').data('applicationId', data._id).click(function(e) {
            var applicationId = $(this).data('applicationId');
            var $taskExecuteTabsHeaderContainer = $('#taskExecuteTabsHeader').empty();
            var $taskExecuteTabsContent = $('#taskExecuteTabsContent').empty();
            var $modal = $('#appCardBuildResult');
            $modal.find('.loadingContainer').show();
            $modal.find('.errorMsgContainer').hide();
            $modal.find('.outputArea').hide();
            $modal.modal('show');
            $.get('../applications/' + applicationId + '/build', function(data) {
                var date = new Date().setTime(data.timestamp);
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
                                    console.log('data==>', data);
                                    $.get('../jenkins/' + data.jenkinsServerId + '/jobs/' + data.jobName + '/builds/' + job.lastBuild.number + '/output', function(jobOutput) {
                                        $tabContent.find('.taskLogArea').html(jobOutput.output);
                                        setTimeout(function() {
                                            if ($('#appCardBuildResult').data()['bs.modal'].isShown) {
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



        return $appCard;
    }



    $(".chooseROE").select2();
    $(".chooseRLCE").select2();
    $('#divinstancestableview').hide();
    $(".selectSecurityEdit").select2();
    $(".selectInstanceEdit").select2();
    $(".selectOSEdit").select2();
    $(".selectNumberInstancesEdit").select2();
    $(".selectInstanceValidityEdit").select2();
    $(".selectBGEdit").select2();
    $(".selectProjectEdit").select2();
    $(".selectEnvironmentEdit").select2();
    $(".chooseOS").select2();
    $(".chooseSecurity").select2();
    $(".chooseInstance").select2();

    $(".chooseAppEnvironment").select2();
    $(".chooseTasks").select2();
    $(".chooseEnvironment").select2();
    $(".chooseInstances").select2();


    // loading cards

    $.get('../organizations/' + urlParams.org + '/businessgroups/' + urlParams.bg + '/projects/' + urlParams.projid + '/applications', function(apps) {
        var $cardList = $('.appcardList');
        for (var i = 0; i < apps.length; i++) {
            $cardList.append(createAppCard(apps[i]));
        }
    });



    // loading envronments 
    $.get('/d4dMasters/3/orgname_rowid/' + urlParams.org, function(envs) {
        envs = JSON.parse(envs);
        var $envList = $('#environmentList');
        if (envs.length) {
            $envList.prop("disabled", false);
        }
        for (var i = 0; i < envs.length; i++) {
            var $option = $('<option></option>').html(envs[i].environmentname).val(envs[i].rowid);
            $envList.append($option);
        }

        $envList.change(function(e) {

            var envId = $(this).val();
            if (envId) {
                var $taskList = $('#taskList').empty();
                $taskList.change();
                $taskList.prop("disabled", true);
                $.get('/organizations/' + urlParams.org + '/businessgroups/' + urlParams.bg + '/projects/' + urlParams.projid + '/environments/' + envId + '/tasks', function(tasks) {
                    for (var i = 0; i < tasks.length; i++) {
                        if (tasks[i].taskType === 'jenkins') {
                            var $option = $('<option></option>').val(tasks[i]._id).html(tasks[i].name);
                            $taskList.append($option);
                        }
                    }
                    $taskList.prop("disabled", false);
                });
            }
        });

    });

    $('.appCardSaveBtn').click(function(e) {
        var appCardData = {};
        appCardData.name = $('#applicationNameInput').val();
        if (!appCardData.name) {
            alert("App card name is empty");
            return;
        }

        var iconFileInput = $('#applicationiconInput')[0].files;
        if (!iconFileInput.length) {
            alert("Please add an icon file");
            return;
        }


        appCardData.git = {
            repoUrl: $('#gitURLInputaddApp').val(),
            repoUsername: $('#gitusernameaddApp').val(),
            repoPassword: $('#gitpasswordaddApp').val(),
        };

        if (!(appCardData.git.repoUrl && appCardData.git.repoUsername && appCardData.git.repoPassword)) {
            alert("Git configuration is incorrect");
            return;
        }

        appCardData.build = {
            envId: $('#environmentList').val(),
            taskId: $('#taskList').val(),
            functionalTestUrl: $('#appFunctionalTest').val(),
            performanceTestUrl: $('#appPerformanceTest').val(),
            securityTestUrl: $('#appSecurityTest').val(),
            nonFunctionalTestUrl: $('#appNonFunctionalTest').val(),
            unitTestUrl: $('#appUnitTest').val(),
            codeCoverageTestUrl: $('#appCodeCoverage').val(),
            codeAnalysisUrl: $('#appCodeAnalysis').val(),
            uiPerformaceUrl: $('#UIPerfAnalysis').val(),
        };

        if (!(appCardData.build.envId && appCardData.build.taskId)) {
            alert("Build configuration is incorrect");
            return;
        }

        /*var fd = new FormData();
        fd.append("applicationIcon", iconFileInput[0].data);
        fd.append('appData', JSON.stringify(appCardData));
        $.ajax({
            url: '../organizations/' + urlParams.org + '/businessgroups/' + urlParams.bg + '/projects/' + urlParams.projid + '/applications',
            type: "POST",
            data: fd,
            processData: false,
            contentType: false,
            success: function(response) {
                // .. do something
            },
            error: function(jqXHR, textStatus, errorMessage) {
                console.log(errorMessage); // Optional
            }
        });*/

        $.post('../organizations/' + urlParams.org + '/businessgroups/' + urlParams.bg + '/projects/' + urlParams.projid + '/applications', {
            appData: appCardData
        }, function(appCard) {
            console.log(appCard);
            $('.appcardList').append(createAppCard(appCard));
            $('#modaladdAppCard').modal('hide');
        });

    });
    $('.actionnewControlPanel').click(function(e) {
        var $selectedCard = $('.role-Selectedcard-app');
        if ($selectedCard.length) {
            var applicationId = $selectedCard.parent().data('applicationId');
            window.location.href = 'index.html#ajax/newControlpanel.html?appId=' + applicationId;
        }
    });

    if (localStorage.getItem("appCardListDisplay")) {
        $('#myTab3').find('a[href=#l2]').click();
        localStorage.removeItem("appCardListDisplay");
    }


    pageSetUp();
});