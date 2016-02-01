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
    //var htmlTemplate = '<div style="max-width: 262px !important;" class="col-sm-4 col-md-4 col-lg-3 col-xs-12 appcard-role-outer"> <div style="border-radius: 12px;border-color: #dddddd;" class="panel panel-primary appcard-role-inner"> <div style="height:40px;text-align:center;background:#40baf1 !important;border-radius: 10px 10px 0 0;border-color: #40baf1 !important;" class="panel-heading"> <span contenteditable="false" style="float:left;" class="domain-roles-icon"> <img src="img/liferay.jpg" style="height:24px"> </span> <span style="text-align:center;width:30px;font-weight: bold;"> <a class="applicationName" style="color:white" href="javascript:void(0)">Life Ray</a> </span> <br></div><div data-deploy-runlist="recipe[liferay]" data-instance-ip="52.11.46.8" data-jenkin-job-name="LR-Spring" class="appCardBody"> <div style="min-height: 115px;" class="appCardLoadingContainer"> <img src="img/loading.gif" style="height:50px;width:50px;margin-top: 10%;margin-bottom: 10%;" class="center-block"> </div><div style="padding: 7px;" class="panel-body panel-primary appCardInfo"> <div class="minheight120"> <div style="height:20px;" class="col-lg-12 col-sm-12 col-xs-12"> <label style="margin-left: 90px;" class="custom-select"> <select style="font-size: 11px;"> <option>AWS_SCLT</option> <option>AWS_CHINA</option> <option>AWS_INDIA</option> </select> </label> </div><div class="col-lg-12 col-sm-12 col-xs-12 paddingtopbottom10"> <img style="height: 24px;margin-left: -5px;" src="img/projectdemo/app-performanceblack.png"> <div style=" margin-left: 30px;margin-top: -22px;"> <a style="color: #777;font-size: 13px;" href="newrelic.html" target="_blank">App Performance</a> </div></div><div class="col-lg-12 col-sm-12 col-xs-12 paddingtopbottom10"> <img style="height: 27px;margin-left: -5px;" src="img/projectdemo/logsblack.png"> <div style=" margin-left: 30px;margin-top: -22px;"> <a style="color: #777;font-size: 13px;" href="kibana.html" target="_blank">App Logs</a> </div></div><div class="col-lg-12 col-sm-12 col-xs-12 paddingtopbottom10"> <img style="height: 27px;margin-left: -5px;" src="img/projectdemo/code_healthblack.png"> <div style=" margin-left: 30px;margin-top: -22px;"> <a class="codeHealthUrl" style="color: #777;font-size: 13px;" href="sonar.html" target="_blank">Code Health</a> </div></div><div class="col-lg-12 col-sm-12 col-xs-12 paddingtopbottom10"> <img style="height: 27px;margin-left: -5px;" src="img/projectdemo/UI_performanceblack.png"> <div style=" margin-left: 30px;margin-top: -22px;"> <a class="uiHealthUrl" style="color: #777;font-size: 13px;" href="yslow.html" target="_blank">UI Performance</a> </div></div></div></div><div style="padding:3px;border-radius:0 0 12px 12px;background:white!important;" class="panel-footer clearfix"> <div style="padding-left:4px;padding-right:4px;" class="col-lg-12 col-sm-12 col-xs-12"> <div style="padding-left:0px;" class="col-lg-4 col-sm-4 col-xs-4"> <a style="margin-bottom:2px;font-size:12px;color:#666" data-original-title="3/3/2015 11:08:28am" data-placement="top" rel="tooltip" class="btn btn-white btn-sm btnBuild width100" data-toggle="modal" href="javascript:void(0)">Last Build </a> </div><div style="padding-left:0px;padding-right:0px;" class="col-lg-4 col-sm-4 col-xs-4"> <a style="margin-bottom:2px;font-size:12px;color:#666" data-original-title="3/3/2015 17:08:52pm" data-placement="top" rel="tooltip" class="btn btn-white btn-sm btnDeploy width100" data-toggle="modal" href="javascript:void(0)">Last Deploy </a> </div><div style="padding-right:0px;" class="col-lg-4 col-sm-4 col-xs-4"> <a style="margin-bottom:2px;font-size:12px;color:#666" data-original-title="2/3/2015 09:23:25am" data-placement="top" rel="tooltip" class="btn btn-white btn-sm btnTest width100" data-toggle="modal" href="javascript:void(0)">Last Test </a> </div></div><div style="padding-left:4px;padding-right:4px;margin-top:-8px" class="col-lg-12 col-sm-12 col-xs-12"> <div style="padding-left:0px;" class="col-lg-4 col-sm-4 col-xs-4"> <a style="background: none repeat scroll 0 0 #01df3a;margin-bottom:2px; height: 4px;" class="btn btn-white btn-sm btnBuild" data-toggle="modal" href="javascript:void(0)"> </a> </div><div style="padding-left:0px;padding-right:0px;" class="col-lg-4 col-sm-4 col-xs-4"> <a style="background: none repeat scroll 0 0 red;margin-bottom:2px; height: 4px;" class="btn btn-white btn-sm btnBuild" data-toggle="modal" href="javascript:void(0)"> </a> </div><div style="padding-right:0px;" class="col-lg-4 col-sm-4 col-xs-4"> <a style="background: none repeat scroll 0 0 #01df3a;margin-bottom:2px; height: 4px;" class="btn btn-white btn-sm btnBuild" data-toggle="modal" href="javascript:void(0)"> </a> </div></div><div style="padding-left:4px;padding-right:4px;" class="col-lg-12 col-sm-12 col-xs-12"> <div style="padding-left:0px;" class="col-lg-4 col-sm-4 col-xs-4"> <a class="btn btn-primary btn-sm width50borderradius50 appCardBuildBtn" data-toggle="modal" href="javascript:void(0)"> <i style="font-size: 14px;" class="fa fa-inbox"> </i> </a> <span style="font-size: 10px;">Build</span> </div><div style="padding-left:0px;padding-right:0px;" class="col-lg-4 col-sm-4 col-xs-4"> <a class="btn btn-primary btn-sm width40borderradius50Deploy" data-toggle="modal" href="#modalappCardDeploy"> <i style="font-size: 14px;" class="fa fa-bullseye"> </i> </a> <span style="font-size: 10px;">Deploy</span> </div><div style="padding-right:0px;" class="col-lg-4 col-sm-4 col-xs-4"> <a style="padding-left:10px;" class="btn btn-primary btn-sm width50borderradius50" data-toggle="modal" href="#modalappCardTest"> <i style="font-size: 14px;" class="fa fa-location-arrow"> </i> </a> <span style="font-size: 10px;">Test</span> </div></div></div></div></div></div>'
    var htmlTemplate = '<div style="max-width: 262px !important;" class="col-sm-4 col-md-4 col-lg-3 col-xs-12 appcard-role-outer"> <div style="border-radius: 12px;border-color: #dddddd;" class="panel panel-primary appcard-role-inner"> <div style="height:40px;text-align:center;background:#40baf1 !important;border-radius: 10px 10px 0 0;border-color: #40baf1 !important;" class="panel-heading"> <span contenteditable="false" style="float:left;" class="domain-roles-icon"> <img src="img/liferay.jpg" style="height:24px"> </span> <span class="applicationName applicationNameCSS"> </span> <br></div><div data-deploy-runlist="recipe[liferay]" data-instance-ip="52.11.46.8" data-jenkin-job-name="LR-Spring" class="appCardBody"> <div style="min-height: 115px;" class="appCardLoadingContainer"> <img src="img/loading.gif" style="height:50px;width:50px;margin-top: 10%;margin-bottom: 10%;" class="center-block"> </div><div style="padding: 7px;" class="panel-body panel-primary appCardInfo"> <div class="minheight120"> <div style="height:20px;" class="col-lg-12 col-sm-12 col-xs-12"> <label style="margin-left: 90px;" class="custom-select appInstancesDropdownContainer"> <select class="appInstancesDropdown" style="font-size: 11px;"> </select> </label> </div><div class="col-lg-12 col-sm-12 col-xs-12 paddingtopbottom10"> <img style="height: 24px;margin-left: -5px;" src="img/projectdemo/app-performanceblack.png"> <div style=" margin-left: 30px;margin-top: -22px;"> <a style="color: #777;font-size: 13px;" href="newrelic.html" target="_blank">App Performance</a> </div></div><div class="col-lg-12 col-sm-12 col-xs-12 paddingtopbottom10"> <img style="height: 27px;margin-left: -5px;" src="img/projectdemo/logsblack.png"> <div style=" margin-left: 30px;margin-top: -22px;"> <a style="color: #777;font-size: 13px;" href="kibana.html" target="_blank">App Logs</a> </div></div><div class="col-lg-12 col-sm-12 col-xs-12 paddingtopbottom10"> <img style="height: 27px;margin-left: -5px;" src="img/projectdemo/code_healthblack.png"> <div style=" margin-left: 30px;margin-top: -22px;"> <a class="codeHealthUrl" style="color: #777;font-size: 13px;" href="sonar.html" target="_blank">Code Health</a> </div></div><div class="col-lg-12 col-sm-12 col-xs-12 paddingtopbottom10"> <img style="height: 27px;margin-left: -5px;" src="img/projectdemo/UI_performanceblack.png"> <div style=" margin-left: 30px;margin-top: -22px;"> <a class="uiHealthUrl" style="color: #777;font-size: 13px;" href="yslow.html" target="_blank">UI Performance</a> </div></div></div></div><div style="padding:3px;border-radius:0 0 12px 12px;background:white!important;" class="panel-footer clearfix"> <div style="padding-left:4px;padding-right:4px;" class="col-lg-12 col-sm-12 col-xs-12"> <div style="padding-left:0px;" class="col-lg-4 col-sm-4 col-xs-4"> <a style="margin-bottom:2px;font-size:12px;color:#666" data-original-title="3/3/2015 11:08:28am" data-placement="top" rel="tooltip" class="btn btn-white btn-sm btnBuild width100" data-toggle="modal" href="javascript:void(0)">Last Build </a> </div><div style="padding-left:0px;padding-right:0px;" class="col-lg-4 col-sm-4 col-xs-4"> <a style="margin-bottom:2px;font-size:12px;color:#666" data-original-title="3/3/2015 17:08:52pm" data-placement="top" rel="tooltip" class="btn btn-white btn-sm btnDeploy width100" data-toggle="modal" href="javascript:void(0)">Last Deploy </a> </div><div style="padding-right:0px;" class="col-lg-4 col-sm-4 col-xs-4"> <a style="margin-bottom:2px;font-size:12px;color:#666" data-original-title="2/3/2015 09:23:25am" data-placement="top" rel="tooltip" class="btn btn-white btn-sm btnTest width100" data-toggle="modal" href="javascript:void(0)">Last Test </a> </div></div><div style="padding-left:4px;padding-right:4px;margin-top:-8px" class="col-lg-12 col-sm-12 col-xs-12"> <div style="padding-left:0px;" class="col-lg-4 col-sm-4 col-xs-4"> <a style="background: none repeat scroll 0 0 #01df3a;margin-bottom:2px; height: 4px;" class="btn btn-white btn-sm btnBuild" data-toggle="modal" href="javascript:void(0)"> </a> </div><div style="padding-left:0px;padding-right:0px;" class="col-lg-4 col-sm-4 col-xs-4"> <a style="background: none repeat scroll 0 0 red;margin-bottom:2px; height: 4px;" class="btn btn-white btn-sm btnBuild" data-toggle="modal" href="javascript:void(0)"> </a> </div><div style="padding-right:0px;" class="col-lg-4 col-sm-4 col-xs-4"> <a style="background: none repeat scroll 0 0 #01df3a;margin-bottom:2px; height: 4px;" class="btn btn-white btn-sm btnBuild" data-toggle="modal" href="javascript:void(0)"> </a> </div></div><div style="padding-left:4px;padding-right:4px;" class="col-lg-12 col-sm-12 col-xs-12"> <div style="padding-left:0px;" class="col-lg-4 col-sm-4 col-xs-4"> <a class="btn btn-primary btn-sm width50borderradius50 appCardBuildBtn" data-toggle="modal" href="javascript:void(0)"> <i style="font-size: 14px;" class="fa fa-inbox"> </i> </a> <span style="font-size: 10px;">Build</span> </div><div style="padding-left:0px;padding-right:0px;" class="col-lg-4 col-sm-4 col-xs-4"> <a class="btn btn-primary btn-sm width40borderradius50Deploy appCardDeployBtn" data-toggle="modal" href="javascript:void(0)"> <i style="font-size: 14px;" class="fa fa-bullseye"> </i> </a> <span style="font-size: 10px;">Deploy</span> </div><div style="padding-right:0px;" class="col-lg-4 col-sm-4 col-xs-4"> <a style="padding-left:10px;" class="btn btn-primary btn-sm width50borderradius50" data-toggle="modal" href="#modalappCardTest"> <i style="font-size: 14px;" class="fa fa-location-arrow"> </i> </a> <span style="font-size: 10px;">Test</span> </div></div></div></div></div></div>';
    var $appCardTemplate = $(htmlTemplate);

    function createAppCard(data) {
        var $appCard = $appCardTemplate.clone();
        var applicationId = data._id;
        $appCard.data('applicationId', data._id);
        $appCard.find('.applicationName').html(data.name);
        //$('.appcard-role-inner:first').trigger('click');
        $appCard.find('.appcard-role-inner').click(function(e) {
            var selectedappcardDesign = $(".appcard-role-inner").index($(this));
            localStorage.setItem("appCardListDisplay", "true");
            localStorage.setItem("selectedappcardDesign", selectedappcardDesign);
            if($('.appcard-role-inner').hasClass('role-Selectedcard-app')){
                $('.appcard-role-inner').removeClass('role-Selectedcard-app');
                $(this).addClass('role-Selectedcard-app');
            }else{
                $('.appcard-role-inner:first').addClass('role-Selectedcard-app');
            }
            
        });

        $.get('../applications/' + applicationId + '/buildConf', function(buildData) {
            $appCard.find('.codeHealthUrl').attr('href', buildData.codeAnalysisUrl);
            $appCard.find('.uiHealthUrl').attr('href', buildData.uiPerformaceUrl);
        });

        if (!data.appInstances.length) {
            $appCard.find('.appInstancesDropdownContainer').css({
                'visibility': 'hidden'
            });
        }

        for (var i = 0; i < data.appInstances.length; i++) {
            $appCard.find('.appInstancesDropdown').append($('<option></option>').val(data.appInstances[i]._id).html(data.appInstances[i].name));
        }

        $appCard.find('.appCardDeployBtn').data('applicationId', data._id).click(function(e) {
            var applicationId = $(this).data('applicationId');
            var appInstanceId = $appCard.find('.appInstancesDropdown').val();
            var $modal = $('#deployConfiguretModel');
            $modal.find('.errorMsgContainer').hide();
            $modal.find('.workFlowArea').hide();
            $modal.find('.deployResultArea').hide();
            $modal.find('.loadingContainer').show();
            $modal.modal('show');
            $.get('../applications/' + applicationId + '/appInstances/' + appInstanceId + '/workflows', function(workflows) {
                var $workflowDropDown = $modal.find('.workflowDropdown');
                $workflowDropDown.empty();
                for (var j = 0; j < workflows.length; j++) {
                    var $option = $('<option></option>').val(workflows[j]._id).html(workflows[j].name);
                    $workflowDropDown.append($option);
                }
                $workflowDropDown.data('applicationId', applicationId);
                $workflowDropDown.data('appInstanceId', appInstanceId);

                $modal.find('.workFlowArea').show();
                $modal.find('.loadingContainer').hide();

            }).fail(function(jxhr) {
                $modal.find('.loadingContainer').hide();
                $modal.find('.workFlowArea').hide();
                $modal.find('.deployResultArea').hide();

                var $errorContainer = $modal.find('.errorMsgContainer').show();
                if (jxhr.responseJSON && jxhr.responseJSON.message) {
                    $errorContainer.html(jxhr.responseJSON.message);
                } else {
                    $errorContainer.html("Server Behaved Unexpectedly");
                }

            });
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

    $('#showDeployLogsLink').click(function(e) {
        var $this = $(this);
        var $modal = $('#deployResultModel');
        $modal.find('.errorMsgContainer').hide();
        $modal.find('.outputArea').hide();
        $modal.find('.loadingContainer').show();
        $modal.modal('show');
        var deployHistoryId = $this.data('deployHistoryId');
        var applicationId = $this.data('applicationId');
        $.get('../applications/' + applicationId + '/deployHistory/' + deployHistoryId, function(history) {

            $.get('../applications/' + history.applicationId + '/appInstances/' + history.appInstanceId + '/workflows/' + history.workflowId, function(workflow) {
                $.post('../tasks', {
                    taskIds: workflow.taskIds
                }, function(tasks) {
                    var $taskList = $('#logTaskList').empty();
                    for (var i = 0; i < tasks.length; i++) {
                        var $option = $('<option></option>').val(tasks[i]._id).html(tasks[i].name).data('task', tasks[i]);
                        $option.data('timestampStarted', history.timestampStarted);
                        $option.data('timestampEnded', history.timestampEnded);
                        $taskList.append($option);
                    }
                    if (tasks.length) {
                        $taskList.change();
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


    function pollTaskLogs($tabLink, $tab, timestamp, timestampEnded, delay, clearData) {
        var instanceId = $tabLink.attr('data-taskInstanceId');
        var poll = $tabLink.attr('data-taskPolling');
        if (poll !== 'true') {
            console.log('not polling');
            return;
        }

        var url = '../instances/' + instanceId + '/logs';
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
                if (!timestampEnded && $tabLink.attr('data-taskPolling') === 'true' && $('#deployResultModel').data()['bs.modal'].isShown) {

                    pollTaskLogs($tabLink, $tab, $tabLink.attr('data-taskPollLastTimestamp'), null, 1000, false);

                } else {
                    console.log('not polling again');
                }
            });
        }, delay);
    }

    $('#logTaskList').change(function(e) {
        var $option = $(this).find(":selected");
        console.log($option, $(this).val());
        var task = $option.data('task');
        var instanceIds = task.taskConfig.nodeIds;

        var timestampStarted = $option.data('timestampStarted');
        var timestampEnded = $option.data('timestampEnded');

        var $modal = $('#deployResultModel');
        $modal.find('.instanceErrorMsgContainer').hide();
        $modal.find('.instanceLogsOutputContainer').hide();
        $modal.find('.instanceLoadingContainer').show();

        var $taskExecuteTabsHeaderContainer = $('#deployTaskExecuteTabsHeader').empty();
        var $taskExecuteTabsContent = $('#deployTaskExecuteTabsContent').empty();

        $.post('../instances', {
            instanceIds: instanceIds
        }, function(instances) {
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
            $taskExecuteTabsHeaderContainer.find('a[data-toggle="tab"]').each(function(e) {
                $(this).attr('data-taskPolling', 'true');
                var tabId = $(this).attr('href')
                var lastTimestamp = null;
                if (timestampEnded) {
                    lastTimestamp = timestampEnded;
                }
                pollTaskLogs($(this), $(tabId), timestampStarted, lastTimestamp, 0, false);
                //e.relatedTarget // previous active tab
            });

            $taskExecuteTabsHeaderContainer.find('a[data-toggle="tab"]').on('hidden.bs.tab', function(e) {
                $(e.target).attr('data-taskPolling', 'true');
                //e.relatedTarget // previous active tab
            }).first().click();
            $modal.find('.instanceErrorMsgContainer').hide();
            $modal.find('.instanceLoadingContainer').hide();
            $modal.find('.instanceLogsOutputContainer').show();
        }).fail(function(jxhr) {
            $modal.find('.instanceLoadingContainer').hide();
            $modal.find('.instanceLogsOutputContainer').hide();
            var $errorContainer = $modal.find('.instanceErrorMsgContainer').show();
            if (jxhr.responseJSON && jxhr.responseJSON.message) {
                $errorContainer.html(jxhr.responseJSON.message);
            } else {
                $errorContainer.html("Server Behaved Unexpectedly");
            }
        });
    });

    $('.executeWorkflowBtn').click(function(e) {
        var $modal = $('#deployConfiguretModel');
        $modal.find('.errorMsgContainer').hide();
        $modal.find('.workFlowArea').hide();
        $modal.find('.deployResultArea').hide();
        $modal.find('.loadingContainer').show();
        var $workflowDropDown = $modal.find('.workflowDropdown');
        var applicationId = $workflowDropDown.data('applicationId');
        var appInstanceId = $workflowDropDown.data('appInstanceId');
        var workflowId = $workflowDropDown.val();

        $.get('../applications/' + applicationId + '/appInstances/' + appInstanceId + '/workflows/' + workflowId + '/execute', function(result) {
            $modal.find('.loadingContainer').hide();
            $modal.find('.workFlowArea').hide();
            $modal.find('.deployResultArea').show();
            $.get('../applications/' + applicationId + '/lastDeployInfo', function(lastDeploy) {
                $modal.modal('hide');
                if (lastDeploy) {
                    $('#showDeployLogsLink').data('applicationId', applicationId);
                    $('#showDeployLogsLink').data('deployHistoryId', lastDeploy._id).click();
                }

            });

        }).fail(function(jxhr) {
            $modal.find('.loadingContainer').hide();
            $modal.find('.workFlowArea').hide();
            $modal.find('.deployResultArea').hide();

            var $errorContainer = $modal.find('.errorMsgContainer').show();
            if (jxhr.responseJSON && jxhr.responseJSON.message) {
                $errorContainer.html(jxhr.responseJSON.message);
            } else {
                $errorContainer.html("Server Behaved Unexpectedly");
            }
        });

    });

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
        $('.appcard-role-inner:first').trigger('click');
    });



    // loading envronments 
    $.get('../d4dMasters/3/orgname_rowid/' + urlParams.org, function(envs) {
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
                    $taskList.select2('data', null);
                    $taskList.change();
                });
            }
        });

    });

    $('.appCardSaveBtn').click(function(e) {
        var appCardData = {};
        var regexpURL = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/; 
        appCardData.name = $('#applicationNameInput').val();
        if (!appCardData.name) {
            alert("App card name is empty");
            return;
        }

        /*var iconFileInput = $('#applicationiconInput')[0].files;
        if (!iconFileInput.length) {
            alert("Please add an icon file");
            return;
        }*/

        appCardData.git = {
            repoUrl: $('#gitURLInputaddApp').val(),
            repoUsername: $('#gitusernameaddApp').val(),
            repoPassword: $('#gitpasswordaddApp').val(),
        };


        if (!appCardData.git.repoUrl) {
            alert("Enter a Repo URL");
            return;
        }
        if(!regexpURL.test(appCardData.git.repoUrl)){
            alert('Enter a Valid URL');
            return;
        }
        if(!appCardData.git.repoUsername){
            alert('Enter a Username');
            return;
        }
        if(!appCardData.git.repoPassword){
            alert('Enter Password');
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

        // if (!(appCardData.build.envId && appCardData.build.taskId)) {
        //     alert("Build configuration is incorrect");
        //     return;
        // }
        if(appCardData.build.envId == 'Choose'){
            //$('#environmentList').val();
            alert('Choose an Environment');
            return;
        }
        if(!appCardData.build.taskId){
            alert('Choose a Task');
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
        //var i;
        //for(i=0;i<=100;i++){
            
            $.post('../organizations/' + urlParams.org + '/businessgroups/' + urlParams.bg + '/projects/' + urlParams.projid + '/applications', {
                appData: appCardData
            }, function(appCard) {
                console.log(appCard);
                $('.appcardList').append(createAppCard(appCard));
                $('.appcard-role-inner:first').trigger('click');
                $('#modaladdAppCard').modal('hide');
            });
        //}
    });
    $('.actionnewControlPanel').click(function(e) {
        var $selectedCard = $('.role-Selectedcard-app');
        if ($selectedCard.length) {
            var applicationId = $selectedCard.parent().data('applicationId');
            window.location.href = 'index.html#ajax/applicationControlPanel.html?appId=' + applicationId;
        }
    });

    if (localStorage.getItem("appCardListDisplay")) {
        $('#myTab3').find('a[href=#l2]').click();
        localStorage.removeItem("appCardListDisplay");
    }


    pageSetUp();
});