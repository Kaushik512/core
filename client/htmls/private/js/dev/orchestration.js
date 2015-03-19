
/*********************************************Orchestration.js*************************************/

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

    var $createTaskBtn = $('.createTaskLink');
    $('a[data-toggle="tab"][href="#l3"]').on('show.bs.tab', function() {
        var cardCount = $('.instancesList').find('.componentlistContainer:not(.stopped)').length;

        if (cardCount === 0) {
            $createTaskBtn[0].disabled = true;
        } else {
            $createTaskBtn[0].disabled = false;
        }
    });

    // });

    $('.createTaskLink').click(function(e) {
        setBreadCrumbAndViewOrchestration();

        window.location.href = 'index.html#ajax/assignTask.html?org=' + urlParams['org'] + '&bg=' + urlParams['bg'] + '&projid=' + urlParams['projid'] + '&envid=' + urlParams['envid'];
    });
}

/*Initialising the data table in orchestration*/
function initializeTaskArea(data) {
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
            $tdNodeList.find('a').data('nodeList', data[i].taskConfig.nodesIds).click(function(e) {
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
            $tdRunlist.find('a').data('taskRunlist', data[i].taskConfigrunlist).click(function(e) {
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
                if(jxhr.responseJSON && jxhr.responseJSON.message) {
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
