function initializeContainer() {
    initializeBreadCrumbForContainer();
    containerStuff();

    $('#Removelinkedcontainersonexitfield').select2();

    $('#Removeonexitfield').select2();

    $('#cAdvisorPageFrame').on('load', function() {
        $('#cadvisorloadingicon').hide();
    });


}
function initializeBreadCrumbForContainer(){
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
function containerStuff(){
    $('.dockerinstancestart').click(function(e) {
        $('.instanceselectedfordocker').each(function() {
            if ($(this).is(':checked')) {

                var instid = $(this).closest('tr').attr('data-instanceid');
                if (instid)
                    var $that = $(this);
                var $td = $that.closest('td');
                var tdtext = $td.text();
                $td.find('.dockerspinner').detach();
                $td.find('.dockermessage').detach();
                $td.append('<img class="dockerspinner" style="margin-left:5px" src="img/select2-spinner.gif" />');
                $td.attr('title', 'Pulling in Images');
                var imagename = $('.productdiv1.role-Selected1').first().attr('dockercontainerpaths');
                var repotag = $('.productdiv1.role-Selected1').find('.dockerrepotagselect').first().val();

                var repopath = $('.productdiv1.role-Selected1').first().attr('dockerreponame');

                var dockerlaunchparameters = generateDockerLaunchParams();
                if (!dockerlaunchparameters)
                    dockerlaunchparameters = 'null';
                var lp = 'null'; //launch parameter
                var sp = 'null'; //start parameter
                if (dockerlaunchparameters) {
                    if (dockerlaunchparameters[0])
                        lp = dockerlaunchparameters[0];
                    if (dockerlaunchparameters[1])
                        sp = dockerlaunchparameters[1];
                }
                $.get('../instances/dockerimagepull/' + instid + '/' + repopath + '/' + encodeURIComponent(imagename) + '/' + repotag + '/' + encodeURIComponent(lp) + '/' + encodeURIComponent(sp), function(data) {
                    if (data == "OK") {
                        var $statmessage = $td.find('.dockerspinner').parent();
                        $td.find('.dockerspinner').detach();
                        $td.find('.dockermessage').detach();
                        $statmessage.append('<span style="margin-left:5px;text-decoration:none" class="dockermessage">Pull done</span>');
                        //Updating instance card to show the docker icon.
                        var $dockericon = $('<img src="img/galleryIcons/Docker.png" alt="Docker" style="width:42px;height:42px;margin-left:32px;" class="dockerenabledinstacne"/>');
                        //find the instance card - to do instance table view update
                        var $instancecard = $('div[data-instanceid="' + instid + '"]');
                        if ($instancecard.find('.dockerenabledinstacne').length <= 0) {
                            $instancecard.find('.componentlistContainer').first().append($dockericon);
                        }
                        //debugger;
                        loadContainersTable(); //Clearing and loading the containers again.
                    } else {
                        var $statmessage = $('.dockerspinner').parent();
                        $('.dockerspinner').detach();
                        $td.find('.dockermessage').detach();
                        $statmessage.append('<span style="margin-left:5px;color:red" title="' + data + '"  class="dockermessage"><i class="fa  fa-exclamation"></i></span>');
                    }
                });
            }
        });
    });



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



}

function createdockercontainerrow(dockerContainerItem, instanceid) {
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

function generateDockerLaunchParams() {
    if ($('#Containernamefield').val() == '') {
        $('.dockerparamrequired').removeClass('hidden');
        return ('');
    }

    var launchparams = [];
    var preparams = '';
    var startparams = '';
    $('[dockerparamkey]').each(function() {
        if ($(this).val() != '') {
            var itms = $(this).val().split(',');
            for (itm in itms) {
                if ($(this).attr('dockerparamkey') != '-c') //checking for start parameter
                    preparams += ' ' + $(this).attr('dockerparamkey') + ' ' + itms[itm];
                else
                    startparams += ' ' + itms[itm];
            }
            launchparams[0] = preparams;
            launchparams[1] = startparams;
        }
    });
    return (launchparams);
}