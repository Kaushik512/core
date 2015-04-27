  /************************************ControlPanel.js*****************************************************/
        //drawing the breadcrumb when user clicks on control-panel
        function initializeControlPanel() {
            $('.actionControlPanel').click(function(e) {
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
                            }
                    }
                } else {
                    var $selectedCard = $('.rowcustomselected');
                    if ($selectedCard.length) {
                        var instanceId = $selectedCard.attr('data-instanceId');
                        if (instanceId) {
                            urlText = 'index.html#ajax/Controlpanel.html?org=' + urlParams.org + '&id=' + instanceId + '&visibleControlid=' + controlId;                           
                            window.location.href = urlText;
                        }
                    }
                }
            });
        }
        


