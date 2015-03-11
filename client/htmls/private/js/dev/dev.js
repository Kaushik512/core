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
    var urlParams = {};


    $(document).ready(function() {
        /*********************************Instance.js********************/
        /*
        This is the entry method for initialising the instance in Dev.html.
        */



        /************************************************Container.js************************************************/

        /*Binding Click events to Containers and showing the breadcrumb*/


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

        /***************************************Dev.js***************************************/
        //Registring events for pemFile selection

        var wzlink = window.location.href.split('#')[1];
        //alert(wzlink);
        $('li[navigation*="Workspace"]').find('a').attr('href', '#' + wzlink);
        //Set localstorage to hold the last wz href
        //update lastworkzone only when you have ? in url
        if (window.location.href.indexOf('?') > 0)
            localStorage.setItem("lastworkzoneurl", window.location.href);


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



        if (localStorage.getItem("SelectedClass") == "Orchestration") {
            localStorage.removeItem("SelectedClass");
            $('#myTab3').find('.Instances').removeClass('active');
            $('#myTab3').find('.Orchestration').addClass('active');
            $('#myTabContent3').find('#l1').removeClass('active');
            $('#myTabContent3').find('#l3').addClass('active');
            $('#myTab3').click();
        }
        //for Table view
        $('#defaultViewButton').click(); //setting the detault view




        $.get('../organizations/' + orgId + '/businessgroups/' + urlParams['bg'] + '/projects/' + projectId + '/environments/' + envId + '/', function(data) {
            console.log('success---3---4');

            //Syncing up the tree view based on url
            initializeBlueprintArea(data.blueprints);
            initializeTaskArea(data.tasks);
            x = data.instances;
            initializeInstanceArea(data.instances);

        });


        //Generating the docker launch parameters






        //End Containers table build
        var tableinstanceview = null;

        function getViewTile() {
            var locationData = localStorage.getItem("ControlID");
            if (locationData) {
                showHideControl(locationData);
             }
        }

        function loadCarousel() {
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

        initializeInstance();
        initializeBluePrints();
        registerEventsForPemFile();
        //   registerEventsForSearchInstances();
        initializeControlPanel();
        initializingOrchestration();
        initializeContainer();
        loadCarousel();
        getViewTile();

        // serachBoxInInstance.init();

    });
