/*Binding Click events to Orchestration*/
function initializingOrchestration(){
   $('.Orchestration').click(function(e){
    var getbreadcrumbul = $('#ribbon').find('.breadcrumb').find('li:lt(5)');
    var getbreadcrumbullength = getbreadcrumbul.length;
    var DummyBreadCrumb;
    if(getbreadcrumbullength > 0)
    {
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
    DummyBreadCrumb += '>' + 'Orchestration';

    if(DummyBreadCrumb != null && DummyBreadCrumb != 'undefined')
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

/*Initialising the data table in orchestration*/
 function initializeTaskArea(data) {
      if (!$.fn.dataTable.isDataTable('#tableOrchestration') ){
        //var $taskListArea = $('.taskListArea').empty();
           $taskDatatable =  $('#tableOrchestration').DataTable({
                "pagingType": "full_numbers",
                "aoColumns": [
                    null,{
                        "bSortable": false
                    },
                    {
                        "bSortable": false
                    },
                    {
                        "bSortable": false
                    }, null,
                     {
                        "bSortable": false
                    }
                ]

            });
         }


        for (var i = 0; i < data.length; i++) {
            var $tr = $('<tr></tr>').attr('data-taskId', data[i]._id);
            var $tdName = $('<td></td>').append(data[i].name);
            $tr.append($tdName);
            var $tdNodeList = $('<td></td>').append('<a rel="tooltip" data-placement="top" data-original-title="Assigned Nodes" data-toggle="modal" class="btn btn-primary btn-sg tableactionbutton"><i class="ace-icon fa fa-sitemap fa-14x"></i></a>');
            $tdNodeList.find('a').data('nodeList', data[i].nodesIdList).click(function(e) {
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
            $tr.append($tdNodeList);

            var $tdRunlist = $('<td></td>').append('<a rel="tooltip" data-placement="top" data-original-title="Assigned Runlists" data-toggle="modal" href="#assignedRunlist" class="btn btn-primary btn-sg tableactionbutton"><i class="ace-icon fa fa-list-ul bigger-120"></i></a>');
            $tdRunlist.find('a').data('taskRunlist', data[i].runlist).click(function(e) {
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
            $tr.append($tdRunlist);

            var $tdExecute = $('<td></td>').append('<a rel="tooltip" data-placement="top" data-original-title="Execute" data-toggle="modal" href="#assignedExecute" class="btn btn-primary btn-sg tableactionbutton"><i class="ace-icon fa fa-play bigger-120"></i></a>');
            $tdExecute.find('a').data('taskId', data[i]._id).click(function(e) {
                var taskId = $(this).data('taskId');
                var $taskExecuteTabsHeaderContainer = $('#taskExecuteTabsHeader').empty();
                var $taskExecuteTabsContent = $('#taskExecuteTabsContent').empty();
                $.get('../tasks/' + taskId + '/run', function(data) {
                    var instances = data.instances;
                     var date = new Date().setTime(data.timestamp);
                      var taskTimestamp = new Date(date).toUTCString(); //converts to human readable strings
                    $('tr[data-taskId="'+taskId+'"] .taskrunTimestamp').html(taskTimestamp);
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



                    $('#taskExecuteTabsHeader').find('a[data-toggle="tab"]').each( function(e) {
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



                });



            });
            $tr.append($tdExecute);
            var timestamp = "-";
            if (data[i].lastRunTimestamp) {
                var date = new Date().setTime(data[i].lastRunTimestamp);
                timestamp = new Date(date).toUTCString(); //converts to human readable strings
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
                          $taskDatatable.row($(that).parents('tr')).remove().draw( false );
                    }
                })
            });
            $tdOptions.find('.btnEditTask').click(function(e) {
                setBreadCrumbAndViewOrchestration();

                var taskId = $(this).parents('td').attr('data-taskId');

                window.location.href = 'index.html#ajax/assignTask.html?org=' + urlParams.org + '&bg='+urlParams['bg']+'&projid=' + urlParams['projid'] + '&envid=' + urlParams['envid'] + '&taskId=' + taskId;

            });
            $tr.append($tdOptions);
             
            $taskDatatable.row.add($tr).draw(); 
            //$taskListArea.append($tr);

            //aaaa
            if($("#sorttableheader").length){
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
                    var $table = $('<div></div>');

                    for (var i = 0; i < data.length; i++) {
                        var $rowDiv = $('<div class="row"></div>');
                        var timeString = new Date().setTime(data[i].timestamp);
                        var date = new Date(timeString).toUTCString(); //converts to human readable strings
                        $rowDiv.append($('<div class="col-lg-4 col-sm-4"></div>').append('<div>' + date + '</div>'));

                        if (data[i].err) {
                            $rowDiv.append($('<div class="col-lg-7 col-sm-7" style="color:red;"></div>').append('<span style="width:100%">' + data[i].log + '</span>'));
                        } else {
                            $rowDiv.append($('<div class="col-lg-7 col-sm-7 " style="color:DarkBlue;"></div>').append('<span style="width:100%">' + data[i].log + '</span>'));
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
