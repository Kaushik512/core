// var $chefCookbookRoleSelector = function(catorgname, callback, selectedRunlist, readMode) {
//     if (!selectedRunlist) {
//         selectedRunlist = [];
//     }
//     var $chefItemdiv = $("<div></div>").addClass('smart-form');
//     var $row = $("<div></div>").addClass('row margin0');
//     var $divtable = $("<div id=\"divtable\"></div>").addClass('divtablemarginpadding');
//     var $firstcol6 = $("<div></div>").addClass('col-lg-6');
//     var $inputgroup = $("<div></div>").addClass('input-group width100');
//     var $firstlabelinput = $("<label></label>").addClass('input searchCookbooksRolesLabel');
//     var $searchiconappend = $("<i></i>").addClass('icon-append fa fa-search');
    
//     var $searchinputtextbox = $('<input type="text" placeholder="Search Cookbooks/Roles" id="textbox"/>');
//     $firstlabelinput.append($searchiconappend);
//     $firstlabelinput.append($searchinputtextbox);
    

//     $inputgroup.append($firstlabelinput);
//     $firstcol6.append($inputgroup);
//     $divtable.append($firstcol6);

//     var $secondcol6 = $("<div></div>").addClass('col-lg-6');

//     $divtable.append($secondcol6);
//     $row.append($divtable);
//     $chefItemdiv.append($divtable);
//     $errorContainer = $('<div></div>').addClass('errorContainer').addClass('hidden').text('This is Error Cointainer div');
//     $chefItemdiv.append($errorContainer);
    
//     $chefItemdiv.find('.chooseCheforgType').select2();
//     return $chefItemdiv;
// }
 
//ChefItem added below
var $chefCookbookRoleSelector = function(catorgname, callback, selectedRunlist, readMode) {
    if (!selectedRunlist) {
        selectedRunlist = [];
    }
    var $chefItemdiv = $("<div></div>").addClass('smart-form');

    var $panelbody = $("<div></div>").addClass('panel-body');
    var $fieldsetpanel = $("<fieldset></fieldset>").addClass('padding0');
    var $section = $("<section></section>").addClass('col col-sm-6 col-xs-12');

    $loadingContainer = $('<div></div>').addClass('loadingContainer').addClass('hidden');
    var $imgerrorContainer = $("<img />").attr('src', 'img/loading.gif').addClass('center-block chefItemwithoutOrgloadingContainerCSS');
    $loadingContainer.append($imgerrorContainer);
    $section.append($loadingContainer);
    $fieldsetpanel.append($section);
    $panelbody.append($fieldsetpanel);

    $chefItemdiv.append($panelbody);

    var $fieldset = $("<fieldset></fieldset>").addClass('padding0 fieldsetContainschefItem');
    var $section1 = $("<section></section>").addClass('col col-sm-6 col-xs-12 padding-right0');

    var $label1 = $("<label></label>").addClass('label');
    var $img1 = $("<img />").attr('src', 'img/templateicons/Create-run-list---deployment.png');
    var $strong1 = $("<span></span>").css("margin-left","7px").text("Select Runlist").append('<img class="cookbookspinner" style="margin-left:5px" src="img/select2-spinner.gif"></img>');
    $label1.append($img1);
    $label1.append($strong1);
    $section1.append($label1);
    var $row1 = $("<div></div>").addClass('row');
    var $div1 = $("<div></div>").addClass('col col-10 padding-right0');
    var $div1forCookbook = $("<div></div>").addClass('border-color');
    var $label2 = $("<label></label>").addClass('label text-align-center margintopbottom').text("Select Cookbooks");
    var $inputtypetextCookbooks = $('<input type="text" style="height:24px;margin-left:2px;" placeholder="Search Cookbooks">').addClass('searchoptionforCookbooks form-control padding0');
    $div1forCookbook.append($label2);
    $div1forCookbook.append($inputtypetextCookbooks);
    var $ul1 = $("<ul></ul>").addClass('deploymentsCookbookList deploymentsListCSS');

    var $hr1 = $("<hr>");

    $.get('../organizations/' + catorgname + '/chefRunlist', function(data) {
        console.log("Cookbooks Query:" + data);

        var cookbooks = data.cookbooks;
        var keys = Object.keys(cookbooks);
        //alert(keys);
        keys.sort(function(a, b) {
            return a.toLowerCase().localeCompare(b.toLowerCase());
        });

        var $deploymentCookbookList = $('.deploymentsCookbookList');
        for (i = 0; i < keys.length; i++) {
            var $li = $('<li><label class="checkbox" style="margin: 5px;"><input type="checkbox"  name="checkboxCookbook" value="recipe[' + keys[i] + ']" data-cookbookName="' + keys[i] + '"><i></i>' + keys[i] + '</label></li>');
            if (selectedRunlist.indexOf('recipe[' + keys[i] + ']') !== -1) {
                $li.hide().data('itemSelected', true);
            }
            $deploymentCookbookList.append($li);
        }
        var roles = data.roles;
        var keys = Object.keys(roles);
        keys.sort(function(a, b) {
            return a.toLowerCase().localeCompare(b.toLowerCase());
        });
        //alert("ServerID:" + data.serverId);
        $('.deploymentSelectedRunList').first().data('chefServerId', data.serverId);
        $('.deploymentSelectedRunList').first().attr('data-chefServerId', data.serverId);

        var $deploymentRolesList = $('.deploymentRoleList');
        for (i = 0; i < keys.length; i++) {
            var $li = $('<li><label class="checkbox" style="margin: 5px;"><input type="checkbox"  name="checkboxRole" value="role[' + keys[i] + ']" data-roleName="' + keys[i] + '"><i></i>' + keys[i] + '</label></li>');
            if (selectedRunlist.indexOf('role[' + keys[i] + ']') !== -1) {
                $li.hide().data('itemSelected', true);
            }
            $deploymentRolesList.append($li);
        }
        if ($('.deploymentsCookbookList li').length <= 0)
            $('.deploymentsCookbookList').append($('<span class="label text-align-center">[ None Found ]</span>'));
        if ($('.deploymentRoleList li').length <= 0)
            $('.deploymentRoleList').append($('<span class="label text-align-center">[ None Found ]</span>'));
        $('.cookbookspinner').detach();
        if (typeof callback === 'function') {
            callback('done');
        }
    }).fail(function(data) {
        var $erroMsgArea = $('<span></span>').css({
            'color': 'red'
        }).text(' ' + data.responseJSON.message);
        $('.cookbookspinner').detach();
        $strong1.append($erroMsgArea);
    });

    //$ul1.append($hr1);

    $div1forCookbook.append($ul1);
    $div1.append($div1forCookbook);


    var $div1forRoles = $("<div></div>").addClass('border-color');
    var $label3 = $("<label></label>").addClass('label text-align-center margintopbottom').text("Select Roles");
    var $inputtypetextRoles = $('<input type="text" style="height:24px;margin-left:2px;" placeholder="Search Roles">').addClass('searchoptionforRoles form-control padding0');
    //var $hr2 = $("<hr>");
    var $ul2 = $("<ul></ul>").addClass('deploymentRoleList deploymentsListCSS');

    $div1forRoles.append($label3);
    //$div1forRoles.append($hr2);
    $div1forRoles.append($inputtypetextRoles);

    $div1forRoles.append($ul2);

    $div1.append($div1forRoles);
    $row1.append($div1);

    $div2 = $("<div></div>").addClass('col col-2 margin-top-172');
    $divinputgroupAddRemove = $("<div></div>").addClass('input-group');
    $divbtngroupAdd = $("<div></div>").addClass('btn-group padding-bottom-10');

    $btntoAdd = $("<button></button>").addClass('btn btn-default btn-primary btnItemAdd btnItemCSS ');
    if (readMode) {
        $btntoAdd.attr('disabled', 'disabled');
    }
    $btntoAdditag = $("<i></i>").addClass('fa fa-angle-double-right font-size-20');
    $btntoAdd.append($btntoAdditag);
    $divbtngroupAdd.append($btntoAdd);
    $divinputgroupAddRemove.append($divbtngroupAdd);

    $btnClearfix = $("<div></div>").addClass('clearfix');
    $divinputgroupAddRemove.append($btnClearfix);

    $divbtngroupRemove = $("<div></div>").addClass('btn-group');
    $btntoRemove = $("<button></button>").addClass('btn btn-default btn-primary btnItemRemove btnItemCSS');
    if (readMode) {
        $btntoRemove.attr('disabled', 'disabled');
    }
    $btntoRemoveitag = $("<i></i>").addClass('fa fa-angle-double-left font-size-20');

    $btntoRemove.append($btntoRemoveitag);
    $divbtngroupRemove.append($btntoRemove);
    $divinputgroupAddRemove.append($divbtngroupRemove);

    $div2.append($divinputgroupAddRemove);
    $row1.append($div2);

    $section1.append($row1);

    //Section 2 started

    var $section2 = $("<section></section>").addClass('col col-sm-6 col-xs-12 padding-left0');
    var $label2 = $("<label></label>").addClass('label');
    var $img2 = $("<img />").css("margin-left","30px").attr('src', 'img/templateicons/Order-run-list---deployment.png');
    var $strong2 = $("<span></span>").css("margin-left","7px").text("Order Runlist");
    $label2.append($img2);
    $label2.append($strong2);
    $section2.append($label2);

    var $rowOrder1 = $("<div></div>").css("margin-left","14px").addClass('row');
    var $divOrder1 = $("<div></div>").addClass('col col-10 padding-right0');
    var $ulOrder1 = $("<ul></ul>").addClass('deploymentSelectedRunList deploymentSelectedRunListCSS');
    //alert('here ==>');
    //alert(selectedRunlist); 
    for (var i = 0; i < selectedRunlist.length; i++) {
        var name = '';
        var item = selectedRunlist[i];
        var indexOfBracketOpen = item.indexOf('[');
        if (indexOfBracketOpen != -1) {
            var indexOfBracketClose = item.indexOf(']');
            if (indexOfBracketClose != -1) {
                name = item.substring(indexOfBracketOpen + 1, indexOfBracketClose);
            }
        }
        if (name) {
            if (item.indexOf('recipe') === 0) {
                $ulOrder1.append($('<li title="' + name + '"><label style="margin: 5px;"><input type="hidden" value="' + item + '"/>' + name.substr(0, 15) + '</label><img src="img/icon_cookbook_recipes.png" style="height:24px;width:auto;margin-top:4px" class="pull-right"></li>').on('click', function(e) {
                    if ($(this).hasClass('deploymentCookbookSelected')) {
                        $(this).removeClass('deploymentCookbookSelected');
                    } else {
                        $(this).addClass('deploymentCookbookSelected');
                    }
                }));
            } else {
                $ulOrder1.append($('<li title="' + name + '"><label style="margin: 5px;"><input type="hidden" value="' + item + '"/>' + name.substr(0, 15) + '</label><img src="img/icon_roles.png" style="height:24px;width:auto;margin-top:4px" class="pull-right"></li>').on('click', function(e) {
                    if ($(this).hasClass('deploymentCookbookSelected')) {
                        $(this).removeClass('deploymentCookbookSelected');
                    } else {
                        $(this).addClass('deploymentCookbookSelected');
                    }
                }));
            }
        }


    }

    $divOrder1.append($ulOrder1);
    $rowOrder1.append($divOrder1);



    $divOrder2 = $("<div></div>").addClass('col col-2 margin-top-172');
    $divinputgroupUpDown = $("<div></div>").addClass('input-group');
    $divbtngroupUp = $("<div></div>").addClass('btn-group padding-bottom-10');

    $btntoUp = $("<button></button>").addClass('btn btn-default btn-primary btnItemUp btnItemCSS ');
    if (readMode) {
        $btntoUp.attr('disabled', 'disabled');
    }
    $btntoUpitag = $("<i></i>").addClass('fa fa-angle-double-up font-size-20');
    $btntoUp.append($btntoUpitag);
    $divbtngroupUp.append($btntoUp);
    $divinputgroupUpDown.append($divbtngroupUp);

    $btnClearfix1 = $("<div></div>").addClass('clearfix');
    $divinputgroupUpDown.append($btnClearfix1);

    $divbtngroupDown = $("<div></div>").addClass('btn-group');
    $btntoDown = $("<button></button>").addClass('btn btn-default btn-primary btnItemDown btnItemCSS');
    if (readMode) {
        $btntoDown.attr('disabled', 'disabled');
    }
    $btntoDownitag = $("<i></i>").addClass('fa fa-angle-double-down font-size-20');
    $btntoDown.append($btntoDownitag);
    $divbtngroupDown.append($btntoDown);
    $divinputgroupUpDown.append($divbtngroupDown);

    $divOrder2.append($divinputgroupUpDown);
    $rowOrder1.append($divOrder2);


    $section2.append($rowOrder1);



    $fieldset.append($section1);
    $fieldset.append($section2);
    $chefItemdiv.append($fieldset);

    $errorContainer = $('<div></div>').addClass('errorContainer').addClass('hidden').text('This is Error Cointainer div');
    $chefItemdiv.append($errorContainer);

    // if($loadingContainer)
    //    $loadingContainer.detach(); //commented to handle a javascript error, to be reverted.
    // $("#toAdd").click(function(e){
    //    $("#toaddbtn").append($form);
    // });

    $chefItemdiv.find('.btnItemAdd').click(function(e) {
        var $deploymentSelectedList = $('.deploymentSelectedRunList');
        var $selectedCookbooks = $("input[name=checkboxCookbook]:checked");
        $selectedCookbooks.each(function(idx) {
            var $this = $(this);
            //
            $deploymentSelectedList.append($('<li title="' + $this.attr('data-cookbookName') + '"><label style="margin: 5px;"><input type="hidden" value="' + $this.val() + '"/>' + $this.attr('data-cookbookName').substr(0, 15) + '</label><img src="img/icon_cookbook_recipes.png" style="height:24px;width:auto;margin-top:4px" class="pull-right"></li>').on('click', function(e) {
                if ($(this).hasClass('deploymentCookbookSelected')) {
                    $(this).removeClass('deploymentCookbookSelected');
                } else {
                    $(this).addClass('deploymentCookbookSelected');
                }
            }));
            $this.attr('checked', false);
            $this.parents('li').hide().data('itemSelected', true);
        });
        var $selectedRoles = $("input[name=checkboxRole]:checked");
        $selectedRoles.each(function(idx) {
            var $this = $(this);
            //
            $deploymentSelectedList.append($('<li title="' + $this.attr('data-roleName') + '"><label style="margin: 5px;"><input type="hidden" value="' + $this.val() + '"/>' + $this.attr('data-roleName').substr(0, 15) + '</label><img src="img/icon_roles.png" style="height:24px;width:auto;margin-top:4px" class="pull-right"></li>').on('click', function(e) {
                if ($(this).hasClass('deploymentCookbookSelected')) {
                    $(this).removeClass('deploymentCookbookSelected');
                } else {
                    $(this).addClass('deploymentCookbookSelected');
                }
            }));
            $this.attr('checked', false);
            $this.parents('li').hide().data('itemSelected', true);
        });
        // $deploymentSelectedList.sortable({
        // cursor: "move"
        // });

        //chrome fix - Page refresh - Vinod 
        e.preventDefault();
        return (false);
    });
    $inputtypetextCookbooks.keyup(function(e) {
        var searchText = $(this).val().toUpperCase();
        $allListElements = $chefItemdiv.find('.deploymentsCookbookList > li');
        $matchingListElements = $allListElements.filter(function(i, el) {
            if ($(el).data('itemSelected')) {
                return false;
            }
            return $(el).text().toUpperCase().indexOf(searchText) !== -1;
        });
        $allListElements.hide();
        $matchingListElements.show();
    });

    $inputtypetextRoles.keyup(function(e) {
        var searchText = $(this).val().toUpperCase();
        $allListElements = $chefItemdiv.find('.deploymentRoleList > li');
        $matchingListElements = $allListElements.filter(function(i, el) {
            if ($(el).data('itemSelected')) {
                return false;
            }
            return $(el).text().toUpperCase().indexOf(searchText) !== -1;
        });
        $allListElements.hide();
        $matchingListElements.show();
    });
    $chefItemdiv.find('.btnItemRemove').click(function(e) {
        var $deploymentSelectedList = $('.deploymentSelectedRunList');
        $deploymentSelectedList.find('.deploymentCookbookSelected').each(function() {
            var value = $(this).find('input').val();
            var selector = 'input[name=checkboxRole][value="' + value + '"]';
            console.log(selector);
            $('input[name=checkboxRole][value="' + value + '"]').parents('li').show().data('itemSelected', false);
            $('input[name=checkboxCookbook][value="' + value + '"]').parents('li').show().data('itemSelected', false);
            $(this).remove();
        });
        //chrome fix - Page refresh - Vinod 
        e.preventDefault();
        return (false);
    });

    $chefItemdiv.find(".btnItemUp").on('click', function(e) {
        var $selectedRunlist = $('.deploymentCookbookSelected');

        $selectedRunlist.insertBefore($selectedRunlist.first().prev());
        //chrome fix - Page refresh - Vinod 
        e.preventDefault();
        return (false);
    });

    $chefItemdiv.find(".btnItemDown").on('click', function(e) {
        var $selectedRunlistDown = $('.deploymentCookbookSelected');

        $selectedRunlistDown.insertAfter($selectedRunlistDown.last().next());
        //chrome fix - Page refresh - Vinod 
        e.preventDefault();
        return (false);
    });

    // $chefItemdiv.find(".chooseCheforgType").on('click', function () {
    //     $(".chooseCheforgType").select2();
    // });
    // $chefItemdiv.ready(function() {
    //     $(".chooseCheforgType").select2();
    // });
    $chefItemdiv.find('.chooseCheforgType').select2();
    return $chefItemdiv;
}