function $chefCookbookRoleSelector(catorgname, callback, selectedRunlist, readMode, listVisible) {
    if (!selectedRunlist) {
        selectedRunlist = [];
    }
    $('.btnUpdateInstanceRunlist').addClass('pointereventsDisabled');
    var $chefItemdiv = $("<div></div>").addClass('smart-form');

    var $chefItemdiv = $.extend($chefItemdiv, {
        getSelectedRunlist: function() {
            var $options = this.find('#cookbooksrecipesselectedList').find('option');
            var runlist = [];
            $options.each(function() {
                var $option = $(this);
                runlist.push($option.val());
            });
            return runlist;
        },
        getChefServerId: function() {
            return this.find('#cookbooksrecipesselectedList').attr('data-chefServerId');
        }
    });

    var defaultVisilbleList = {
        cookbooks: true,
        roles: true,
        deploy: false,
        all: true
    };
    if (!listVisible) {
        listVisible = defaultVisilbleList;
    }
    //listVisible = $.extend(listVisible, defaultVisilbleList, listVisible);

    console.log(listVisible);


    var $row = $("<div></div>").addClass('row margin0');
    var $divFilterContainer = $("<div></div>").addClass('col-lg-12 divtablemarginpadding');
    var $divtable = $("<div></div>").addClass('divtablemarginpadding');
    var $firstcol6 = $("<div></div>").addClass('col-lg-6 availableRunlistContainer');

    var $inputgroup = $("<div></div>").addClass('input-group width100');
    var $firstlabelinput = $("<label></label>").addClass('input searchCookbooksRolesLabel');

    $loadingContainer = $('<div></div>').addClass('loadingContainer');
    var $imgerrorContainer = $("<img />").attr('src', 'img/select2-spinner.gif').addClass('center-block cookbookspinner loadingcookbookandroles');
    $loadingContainer.append($imgerrorContainer);
    $firstlabelinput.append($loadingContainer);

    var $beforesearchappend = $("<span></span>").addClass('fontsize13 loadCookbookroleslabel').text("Loading Cookbooks and Roles");
    $firstlabelinput.append($beforesearchappend);


    var $searchiconappend = $("<i></i>").addClass('icon-append fa fa-search');
    var $searchinputtextbox = $('<input type="text" placeholder="Search Cookbooks/Roles" id="textbox"/>');
    var $searchinputtextboxContainer = $("<div></div>").addClass('input-group width100').css({
        'width': '100px'
    });
    $searchinputtextboxContainer.append($searchiconappend);
    $searchinputtextboxContainer.append($searchinputtextbox);
    $divFilterContainer.append($searchinputtextboxContainer);
    $inputgroup.append($firstlabelinput);

    //checking for tasks class(deploy,all)
    var $cookbooksFilterNew = $('<label class="radio hidden col-lg-3" style="margin: 5px;font-size:13px;"><input class="listSelectorCkb" name="radio" type="radio" id="deployCookbooks"  value="DeployCookbooks"/><i></i>Deploy Cookbooks</label>');
    //var $allFilterNew = $('<label class="radio" style="margin: 5px;font-size:13px;"><input name="radio" type="radio" id="allNew"  value="All"/><i></i>All</label>');
    $divFilterContainer.append($cookbooksFilterNew);
    //$firstlabelinput.append($allFilterNew);

    var $rolesFilter = $('<label class="radio hidden col-lg-3" style="margin: 5px;font-size:13px;"><input name="radio" class="listSelectorCkb" type="radio" id="roles"  value="Roles"/><i></i>Roles</label>');
    var $cookbooksFilter = $('<label class="radio hidden col-lg-3" style="margin: 5px;font-size:13px;"><input name="radio" class="listSelectorCkb" type="radio" id="cookbooks"  value="Cookbooks"/><i></i>Cookbooks</label>');
    var $allFilter = $('<label class="radio hidden col-lg-3" style="margin: 5px;font-size:13px;"><input name="radio" class="listSelectorCkb" type="radio" id="all"  value="All"/><i></i>All</label>');

    $divFilterContainer.append($rolesFilter);
    $divFilterContainer.append($cookbooksFilter);
    $divFilterContainer.append($allFilter);

    var $selectCookbooksandRecipesparentdiv = $("<div></div>").addClass('btn-group selectCookbooksandRecipesdiv');
    var $selectCookbooksandRecipes = $("<select id='cookbooksrecipesList' size='10' multiple='multiple'></select>").addClass('btn-group selectCookbooksandRecipes');
    $loadingContainerGap = $('<div></div>').addClass('loadingContainerGap');
    //var $imgerrorContainer = $("<img />").attr('src', 'img/select2-spinner.gif').addClass('center-block cookbookspinner loadingcookbookandroles');
    //$loadingContainer.append($imgerrorContainer);
    $selectCookbooksandRecipesparentdiv.append($loadingContainerGap);

    $beforesearchappend.show();
    $searchinputtextbox.hide();
    $searchiconappend.hide();
    $('.btnUpdateInstanceRunlist').removeClass('pointereventsDisabled');
    $('.btnUpdateInstanceRunlist').addClass('pointereventsEnabled');




    $selectCookbooksandRecipesparentdiv.append($selectCookbooksandRecipes);
    $inputgroup.append($selectCookbooksandRecipesparentdiv);
    var $btngroupAddRemove = $("<div></div>").addClass("btn-group marginleft5");
    var $anchorAdd = $("<button id='btnaddToRunlist' type='button'></button>").addClass('btn btn-default btn-primary anchorAdd');
    if (readMode) {
        $anchorAdd.attr('disabled', 'disabled');
    }
    var $anchorAddi = $("<i></i>").addClass("fa fa-chevron-right anchorAddi");
    $anchorAdd.append($anchorAddi);
    $btngroupAddRemove.append($anchorAdd);
    $inputgroup.append($btngroupAddRemove);
    var $clearfix = $("<div></div>").addClass("clearfix");
    $btngroupAddRemove.append($clearfix);
    $btngroupAddRemove.append($clearfix);
    var $anchorRemove = $("<button id='btnremoveFromRunlist' type='button'></button>").addClass('btn btn-default btn-primary anchorRemove');
    if (readMode) {
        $anchorRemove.attr('disabled', 'disabled');
    }
    var $anchorAddi = $("<i></i>").addClass("fa fa-chevron-left anchorRemovei");
    $anchorRemove.append($anchorAddi);
    $btngroupAddRemove.append($anchorRemove);
    $inputgroup.append($btngroupAddRemove);

    $firstcol6.append($inputgroup);
    $divtable.append($firstcol6);


    var $secondcol6 = $("<div></div>").addClass('col-lg-6');
    var $inputgroupsecond = $("<div></div>").addClass('input-group width100');
    var $firstlabelinput = $("<label id='loadimageandtextlabel'></label>").addClass('input runlistLabel');
    //var $secondcolimage = $("<img id='secondcolimage'/>").attr('src', 'img/templateicons/Create-run-list---deployment.png');
    //var $strong = $("<strong></strong>").text('Runlist').addClass('fontsize13');
    //$firstlabelinput.append($secondcolimage);
    //$firstlabelinput.append($strong);
    $inputgroupsecond.append($firstlabelinput);

    var $selectRunlistparentdiv = $("<div></div>").addClass('btn-group selectCookbooksandRecipesdiv');
    var $runlistselectedList = $("<select id='cookbooksrecipesselectedList' size='10' multiple='multiple'></select>").addClass('btn-group selectCookbooksandRecipes');
    $selectRunlistparentdiv.append($runlistselectedList);
    $inputgroupsecond.append($selectRunlistparentdiv);

    var $btngroupUpDown = $("<div></div>").addClass("btn-group marginleft5");
    var $anchorUp = $("<button id='btnRunlistItemUp' type='button'></button>").addClass('btn btn-default btn-primary anchorUp');
    if (readMode) {
        $anchorUp.attr('disabled', 'disabled');
    }
    var $anchorUpi = $("<i></i>").addClass("fa fa-chevron-up anchorUpi");
    $anchorUp.append($anchorUpi);
    $btngroupUpDown.append($anchorUp);
    $inputgroupsecond.append($btngroupUpDown);
    var $clearfixsecond = $("<div></div>").addClass("clearfix");
    $btngroupUpDown.append($clearfixsecond);
    $btngroupUpDown.append($clearfixsecond);
    var $anchorDown = $("<button id='btnRunlistItemDown' type='button'></button>").addClass('btn btn-default btn-primary anchorDown');
    if (readMode) {
        $anchorDown.attr('disabled', 'disabled');
    }
    var $anchorDowni = $("<i></i>").addClass("fa fa-chevron-down anchorDowni");
    $anchorDown.append($anchorDowni);
    $btngroupUpDown.append($anchorDown);
    $inputgroupsecond.append($btngroupUpDown);




    $secondcol6.append($inputgroupsecond);
    $divtable.append($secondcol6);
    $row.append($divFilterContainer);
    $row.append($divtable);
    $chefItemdiv.append($row);


    $errorContainer = $('<div></div>').addClass('errorContainer').addClass('hidden').text('This is Error Cointainer div');
    $chefItemdiv.append($errorContainer);

    $chefItemdiv.find('.chooseCheforgType').select2();

    var cookbookDataList = [];
    var rolesDataList = [];
    var deployCookbookList = [];

    $chefItemdiv.find('.listSelectorCkb').change(function() {
        var cookbookrecipesTotallist = [];
        var val = $chefItemdiv.find('.listSelectorCkb:checked').val();
        var selectedRunlist = $chefItemdiv.getSelectedRunlist();
        if (val == 'All') {
            cookbookrecipesTotallist = cookbookrecipesTotallist.concat(cookbookDataList, rolesDataList);
        } else if (val == 'Roles') {
            cookbookrecipesTotallist = cookbookrecipesTotallist.concat(rolesDataList);
        } else if (val == 'Cookbooks') {
            cookbookrecipesTotallist = cookbookrecipesTotallist.concat(cookbookDataList);
        } else if (val == 'DeployCookbooks') {
            cookbookrecipesTotallist = cookbookrecipesTotallist.concat(deployCookbookList);
        }
        console.log('val ==> ', val);

        for (var i = 0; i < cookbookrecipesTotallist.length; i++) {
            if (selectedRunlist.indexOf(cookbookrecipesTotallist[i].value) === -1) {
                cookbookrecipesTotallist[i].display = 'block';
            } else {
                cookbookrecipesTotallist[i].display = 'none';
            }
        }

        var optionstoAdd = '<option class=${Class} value=${value} style="display:${display}">${name}</option>';
        $.template("optionTemplate", optionstoAdd);
        var tempoptions = $chefItemdiv.find("#cookbooksrecipesList").empty();
        $.tmpl("optionTemplate", cookbookrecipesTotallist).appendTo(tempoptions);

        $chefItemdiv.find('#cookbooksrecipesList').filterByText($chefItemdiv.find('#textbox'), false);

    });

    $.get('../organizations/' + catorgname + '/chefRunlist', function(data) {
        //console.log("Cookbooks Query:" + data);
        $chefItemdiv.find('#cookbooksrecipesselectedList').first().data('chefServerId', data.serverId);
        $chefItemdiv.find('#cookbooksrecipesselectedList').first().attr('data-chefServerId', data.serverId);


        var cookbooks = data.cookbooks;
        var keys = Object.keys(cookbooks);
        //alert(keys);
        keys.sort(function(a, b) {
            return a.toLowerCase().localeCompare(b.toLowerCase());
        });

        var cookbookrecipesTotallist = []


        for (i = 0; i < keys.length; i++) {
            var display = 'none';
            var obj = {
                value: 'recipe[' + keys[i] + ']',
                name: keys[i],
                Class: "cookbook",
                display: display
            };
            if (selectedRunlist.indexOf(obj.value) === -1) {
                obj.display = 'block';
            }
            if (obj.value.toLowerCase().indexOf('deploy') === -1) {
                cookbookDataList.push(obj);
            } else {
                cookbookDataList.push(obj);
                deployCookbookList.push(obj);
            }
        }
        var roles = data.roles;
        var keys = Object.keys(roles);
        keys.sort(function(a, b) {
            return a.toLowerCase().localeCompare(b.toLowerCase());
        });
        //alert("ServerID:" + data.serverId);
        for (i = 0; i < keys.length; i++) {
            var display = 'none';
            var obj = {
                value: 'role[' + keys[i] + ']',
                name: keys[i],
                Class: "roles",
                display: display
            };
            if (selectedRunlist.indexOf(obj.value) === -1) {
                obj.display = 'block';
            }
            rolesDataList.push(obj);
        }



        $loadingContainerGap.hide();
        $beforesearchappend.hide();
        $searchinputtextbox.show();
        $searchiconappend.show();
        $chefItemdiv.find('.availableRunlistContainer').css({
            'margin-top': '34px'
        });
        $('.cookbookspinner').detach();


        // loading selected runlist

        for (var i = 0; i < selectedRunlist.length; i++) {
            var className = 'cookbook';
            if (selectedRunlist[i].indexOf('recipe') === 0) {
                className = 'cookbook';
            } else {
                className = 'roles';
            }
            var name = '';
            var item = selectedRunlist[i];
            var indexOfBracketOpen = item.indexOf('[');
            if (indexOfBracketOpen != -1) {
                var indexOfBracketClose = item.indexOf(']');
                if (indexOfBracketClose != -1) {
                    name = item.substring(indexOfBracketOpen + 1, indexOfBracketClose);
                }
            }
            var $selOption = $('<option class=' + className + ' value=' + selectedRunlist[i] + '>' + name + '</option>')
            console.log($selOption);
            $chefItemdiv.find('#cookbooksrecipesselectedList').append($selOption);
        }


        var clicked = false;
        if (listVisible.deploy) {
            $chefItemdiv.find('#deployCookbooks').parents('label').removeClass('hidden');
            $chefItemdiv.find('#deployCookbooks').click();
            clicked = true;
        }
        if (listVisible.roles) {
            $chefItemdiv.find('#roles').parents('label').removeClass('hidden');
            if (!clicked) {
                $chefItemdiv.find('#roles').click();
                clicked = true;
            }
        }
        if (listVisible.cookbooks) {
            $chefItemdiv.find('#cookbooks').parents('label').removeClass('hidden');
            if (!clicked) {
                $chefItemdiv.find('#cookbooks').click();
                clicked = true;
            }
        }
        if (listVisible.all) {
            $chefItemdiv.find('#all').parents('label').removeClass('hidden');
            if (!clicked) {
                $chefItemdiv.find('#all').click();
                clicked = true;
            }
        }


        if (typeof callback === 'function') {
            callback('done');
        }
    }).fail(function(data) {
        var $erroMsgArea = $('<span></span>').css({
            'color': 'red'
        }).text(' ' + data.responseJSON.message);
        $('.cookbookspinner').detach();
        $firstlabelinput.append($erroMsgArea);
    });



    //Image load dynamically
    var secondcollabelimagesrc = [{
        src: "img/templateicons/Create-run-list---deployment.png"
    }, ];
    var imagetoAdd = "<img src=${src}>";
    /* Compile the markup as a named template */
    $.template("imageTemplate", imagetoAdd);
    var loadimageandtextlabel = $chefItemdiv.find("#loadimageandtextlabel");
    /* Render the template with the secondcollabelimagesrc data and insert
       the rendered HTML under the "loadimageandtextlabel" element */
    $.tmpl("imageTemplate", secondcollabelimagesrc).appendTo(loadimageandtextlabel);

    //Text load dynamically
    var secondcollabeltext = [{
        text: "Runlist",
        Class: "fontsize13"
    }];
    var texttoAdd = "<strong class=${Class}>${text}</strong>";
    $.template("textTemplate", texttoAdd);
    var loadimageandtextlabel = $chefItemdiv.find("#loadimageandtextlabel");
    $.tmpl("textTemplate", secondcollabeltext).appendTo(loadimageandtextlabel);

    //To Add
    $chefItemdiv.find('#cookbooksrecipesList').on('dblclick', 'option', function() {
        var $this = $(this);
        var $selectedList = $chefItemdiv.find("#cookbooksrecipesselectedList");
        $selectedList.append($this.clone());
        $this.hide();
    });
    //To Remove
    $chefItemdiv.find('#cookbooksrecipesselectedList').on('dblclick', 'option', function() {
        var $instanceCookbookList = $chefItemdiv.find('#cookbooksrecipesList');
        var $this = $(this);
        var value = $this.val();
        //alert(value);
        $this.remove();
        $instanceCookbookList.find('option[value="' + value + '"]').show();
    });

    //To add the wizard
    $chefItemdiv.find("#btnaddToRunlist").on('click', function() {
        var $options = $chefItemdiv.find('#cookbooksrecipesList option:selected');
        var $selectedList = $chefItemdiv.find("#cookbooksrecipesselectedList");
        $options.each(function() {
            var $this = $(this);
            $selectedList.append($this.clone());
            $this.hide();
        });
    });

    $chefItemdiv.find("#btnremoveFromRunlist").on('click', function() {
        var $instanceCookbookList = $chefItemdiv.find('#cookbooksrecipesList');

        $chefItemdiv.find("#cookbooksrecipesselectedList option:selected").each(function() {
            var $this = $(this);
            var value = $this.val();
            $this.remove();
            $instanceCookbookList.find('option[value="' + value + '"]').show();

        });
        //$("#cookbooksrecipesselectedList option:selected").remove();
    });

    $chefItemdiv.find("#btnRunlistItemUp").on('click', function() {
        $chefItemdiv.find("#cookbooksrecipesselectedList option:selected").each(function() {
            var listItem = $(this);
            var listItemPosition = $chefItemdiv.find("#cookbooksrecipesselectedList option").index(listItem) + 1;

            if (listItemPosition == 1) return false;

            listItem.insertBefore(listItem.prev());
        });

    });

    $chefItemdiv.find("#btnRunlistItemDown").on('click', function() {
        var itemsCount = $chefItemdiv.find("#cookbooksrecipesselectedList option").length;

        $($chefItemdiv.find("#cookbooksrecipesselectedList option:selected").get().reverse()).each(function() {
            var listItem = $(this);
            var listItemPosition = $chefItemdiv.find("#cookbooksrecipesselectedList option").index(listItem) + 1;

            if (listItemPosition == itemsCount) return false;

            listItem.insertAfter(listItem.next());

        });
    });

    //Filter the Roles/Cookbooks
    jQuery.fn.filterByText = function(textbox, selectSingleMatch) {
        return this.each(function() {
            var select = this;
            var options = [];
            //console.log('this == >',this);
            $(select).find('option').each(function() {
                //alert($(this).val());
                //alert($(this).hasClass('cookbook'));
                options.push({
                    value: $(this).val(),
                    text: $(this).text(),
                    class: $(this).attr("class")
                });
            });
            $(select).data('options', options);
            var $selectedList = $chefItemdiv.find("#cookbooksrecipesselectedList");
            //alert($selectedList);
            $(textbox).bind('keyup', function() {
                //alert('11');
                var options = $(select).empty().data('options');
                var search = $(this).val().trim();
                var regex = new RegExp(search, "gi");

                //console.log(options);
                $.each(options, function(i) {
                    var option = options[i];
                    var $options = $('<option>').text(option.text).val(option.value).addClass(option.class);
                    if (option.text.match(regex) !== null) {
                        var $selectedOption = $selectedList.find('option[value="' + option.value + '"]');
                        console.log($selectedOption.length);
                        if (!$selectedOption.length) {

                        } else {
                            //console.log('hiding');
                            $options.hide();
                        }
                    } else {
                        //console.log('hiding ==>');
                        $options.hide();
                    }
                    $(select).append($options);
                });

                if (selectSingleMatch === true && $(select).children().length === 1) {
                    $(select).children().get(0).selected = true;
                }

            });
        });
    };

    // $(function() {
    //     $chefItemdiv.find('#cookbooksrecipesList').filterByText($chefItemdiv.find('#textbox'), false);
    // });




    return $chefItemdiv;
}

$chefCookbookRoleSelector.getSelectedRunlist = function() {
    var $options = $('#cookbooksrecipesselectedList').find('option');
    var runlist = [];
    $options.each(function() {
        var $option = $(this);
        runlist.push($option.val());
    });
    return runlist;
};

$chefCookbookRoleSelector.getChefServerId = function() {
    return $('#cookbooksrecipesselectedList').attr('data-chefServerId');
}


//ChefItem added below
// var $chefCookbookRoleSelector = function(catorgname, callback, selectedRunlist, readMode) {
//     if (!selectedRunlist) {
//         selectedRunlist = [];
//     }
//     var $chefItemdiv = $("<div></div>").addClass('smart-form');

//     var $panelbody = $("<div></div>").addClass('panel-body');
//     var $fieldsetpanel = $("<fieldset></fieldset>").addClass('padding0');
//     var $section = $("<section></section>").addClass('col col-sm-6 col-xs-12');

//     $loadingContainer = $('<div></div>').addClass('loadingContainer').addClass('hidden');
//     var $imgerrorContainer = $("<img />").attr('src', 'img/loading.gif').addClass('center-block chefItemwithoutOrgloadingContainerCSS');
//     $loadingContainer.append($imgerrorContainer);
//     $section.append($loadingContainer);
//     $fieldsetpanel.append($section);
//     $panelbody.append($fieldsetpanel);

//     $chefItemdiv.append($panelbody);

//     var $fieldset = $("<fieldset></fieldset>").addClass('padding0 fieldsetContainschefItem');
//     var $section1 = $("<section></section>").addClass('col col-sm-6 col-xs-12 padding-right0');

//     var $label1 = $("<label></label>").addClass('label');
//     var $img1 = $("<img />").attr('src', 'img/templateicons/Create-run-list---deployment.png');
//     var $strong1 = $("<span></span>").css("margin-left","7px").text("Select Runlist").append('<img class="cookbookspinner" style="margin-left:5px" src="img/select2-spinner.gif"></img>');
//     $label1.append($img1);
//     $label1.append($strong1);
//     $section1.append($label1);
//     var $row1 = $("<div></div>").addClass('row');
//     var $div1 = $("<div></div>").addClass('col col-10 padding-right0');
//     var $div1forCookbook = $("<div></div>").addClass('border-color');
//     var $label2 = $("<label></label>").addClass('label text-align-center margintopbottom').text("Select Cookbooks");
//     var $inputtypetextCookbooks = $('<input type="text" style="height:24px;margin-left:2px;" placeholder="Search Cookbooks">').addClass('searchoptionforCookbooks form-control padding0');
//     $div1forCookbook.append($label2);
//     $div1forCookbook.append($inputtypetextCookbooks);
//     var $ul1 = $("<ul></ul>").addClass('deploymentsCookbookList deploymentsListCSS');

//     var $hr1 = $("<hr>");

//     $.get('../organizations/' + catorgname + '/chefRunlist', function(data) {
//         console.log("Cookbooks Query:" + data);

//         var cookbooks = data.cookbooks;
//         var keys = Object.keys(cookbooks);
//         //alert(keys);
//         keys.sort(function(a, b) {
//             return a.toLowerCase().localeCompare(b.toLowerCase());
//         });

//         var $deploymentCookbookList = $('.deploymentsCookbookList');
//         for (i = 0; i < keys.length; i++) {
//             var $li = $('<li><label class="checkbox" style="margin: 5px;"><input type="checkbox"  name="checkboxCookbook" value="recipe[' + keys[i] + ']" data-cookbookName="' + keys[i] + '"><i></i>' + keys[i] + '</label></li>');
//             if (selectedRunlist.indexOf('recipe[' + keys[i] + ']') !== -1) {
//                 $li.hide().data('itemSelected', true);
//             }
//             $deploymentCookbookList.append($li);
//         }
//         var roles = data.roles;
//         var keys = Object.keys(roles);
//         keys.sort(function(a, b) {
//             return a.toLowerCase().localeCompare(b.toLowerCase());
//         });
//         //alert("ServerID:" + data.serverId);
//         $('.deploymentSelectedRunList').first().data('chefServerId', data.serverId);
//         $('.deploymentSelectedRunList').first().attr('data-chefServerId', data.serverId);

//         var $deploymentRolesList = $('.deploymentRoleList');
//         for (i = 0; i < keys.length; i++) {
//             var $li = $('<li><label class="checkbox" style="margin: 5px;"><input type="checkbox"  name="checkboxRole" value="role[' + keys[i] + ']" data-roleName="' + keys[i] + '"><i></i>' + keys[i] + '</label></li>');
//             if (selectedRunlist.indexOf('role[' + keys[i] + ']') !== -1) {
//                 $li.hide().data('itemSelected', true);
//             }
//             $deploymentRolesList.append($li);
//         }
//         if ($('.deploymentsCookbookList li').length <= 0)
//             $('.deploymentsCookbookList').append($('<span class="label text-align-center">[ None Found ]</span>'));
//         if ($('.deploymentRoleList li').length <= 0)
//             $('.deploymentRoleList').append($('<span class="label text-align-center">[ None Found ]</span>'));
//         $('.cookbookspinner').detach();
//         if (typeof callback === 'function') {
//             callback('done');
//         }
//     }).fail(function(data) {
//         var $erroMsgArea = $('<span></span>').css({
//             'color': 'red'
//         }).text(' ' + data.responseJSON.message);
//         $('.cookbookspinner').detach();
//         $strong1.append($erroMsgArea);
//     });

//     //$ul1.append($hr1);

//     $div1forCookbook.append($ul1);
//     $div1.append($div1forCookbook);


//     var $div1forRoles = $("<div></div>").addClass('border-color');
//     var $label3 = $("<label></label>").addClass('label text-align-center margintopbottom').text("Select Roles");
//     var $inputtypetextRoles = $('<input type="text" style="height:24px;margin-left:2px;" placeholder="Search Roles">').addClass('searchoptionforRoles form-control padding0');
//     //var $hr2 = $("<hr>");
//     var $ul2 = $("<ul></ul>").addClass('deploymentRoleList deploymentsListCSS');

//     $div1forRoles.append($label3);
//     //$div1forRoles.append($hr2);
//     $div1forRoles.append($inputtypetextRoles);

//     $div1forRoles.append($ul2);

//     $div1.append($div1forRoles);
//     $row1.append($div1);

//     $div2 = $("<div></div>").addClass('col col-2 margin-top-172');
//     $divinputgroupAddRemove = $("<div></div>").addClass('input-group');
//     $divbtngroupAdd = $("<div></div>").addClass('btn-group padding-bottom-10');

//     $btntoAdd = $("<button></button>").addClass('btn btn-default btn-primary btnItemAdd btnItemCSS ');
//     if (readMode) {
//         $btntoAdd.attr('disabled', 'disabled');
//     }
//     $btntoAdditag = $("<i></i>").addClass('fa fa-angle-double-right font-size-20');
//     $btntoAdd.append($btntoAdditag);
//     $divbtngroupAdd.append($btntoAdd);
//     $divinputgroupAddRemove.append($divbtngroupAdd);

//     $btnClearfix = $("<div></div>").addClass('clearfix');
//     $divinputgroupAddRemove.append($btnClearfix);

//     $divbtngroupRemove = $("<div></div>").addClass('btn-group');
//     $btntoRemove = $("<button></button>").addClass('btn btn-default btn-primary btnItemRemove btnItemCSS');
//     if (readMode) {
//         $btntoRemove.attr('disabled', 'disabled');
//     }
//     $btntoRemoveitag = $("<i></i>").addClass('fa fa-angle-double-left font-size-20');

//     $btntoRemove.append($btntoRemoveitag);
//     $divbtngroupRemove.append($btntoRemove);
//     $divinputgroupAddRemove.append($divbtngroupRemove);

//     $div2.append($divinputgroupAddRemove);
//     $row1.append($div2);

//     $section1.append($row1);

//     //Section 2 started

//     var $section2 = $("<section></section>").addClass('col col-sm-6 col-xs-12 padding-left0');
//     var $label2 = $("<label></label>").addClass('label');
//     var $img2 = $("<img />").css("margin-left","30px").attr('src', 'img/templateicons/Order-run-list---deployment.png');
//     var $strong2 = $("<span></span>").css("margin-left","7px").text("Order Runlist");
//     $label2.append($img2);
//     $label2.append($strong2);
//     $section2.append($label2);

//     var $rowOrder1 = $("<div></div>").css("margin-left","14px").addClass('row');
//     var $divOrder1 = $("<div></div>").addClass('col col-10 padding-right0');
//     var $ulOrder1 = $("<ul></ul>").addClass('deploymentSelectedRunList deploymentSelectedRunListCSS');
//     //alert('here ==>');
//     //alert(selectedRunlist); 
//     for (var i = 0; i < selectedRunlist.length; i++) {
//         var name = '';
//         var item = selectedRunlist[i];
//         var indexOfBracketOpen = item.indexOf('[');
//         if (indexOfBracketOpen != -1) {
//             var indexOfBracketClose = item.indexOf(']');
//             if (indexOfBracketClose != -1) {
//                 name = item.substring(indexOfBracketOpen + 1, indexOfBracketClose);
//             }
//         }
//         if (name) {
//             if (item.indexOf('recipe') === 0) {
//                 $ulOrder1.append($('<li title="' + name + '"><label style="margin: 5px;"><input type="hidden" value="' + item + '"/>' + name.substr(0, 15) + '</label><img src="img/icon_cookbook_recipes.png" style="height:24px;width:auto;margin-top:4px" class="pull-right"></li>').on('click', function(e) {
//                     if ($(this).hasClass('deploymentCookbookSelected')) {
//                         $(this).removeClass('deploymentCookbookSelected');
//                     } else {
//                         $(this).addClass('deploymentCookbookSelected');
//                     }
//                 }));
//             } else {
//                 $ulOrder1.append($('<li title="' + name + '"><label style="margin: 5px;"><input type="hidden" value="' + item + '"/>' + name.substr(0, 15) + '</label><img src="img/icon_roles.png" style="height:24px;width:auto;margin-top:4px" class="pull-right"></li>').on('click', function(e) {
//                     if ($(this).hasClass('deploymentCookbookSelected')) {
//                         $(this).removeClass('deploymentCookbookSelected');
//                     } else {
//                         $(this).addClass('deploymentCookbookSelected');
//                     }
//                 }));
//             }
//         }


//     }

//     $divOrder1.append($ulOrder1);
//     $rowOrder1.append($divOrder1);



//     $divOrder2 = $("<div></div>").addClass('col col-2 margin-top-172');
//     $divinputgroupUpDown = $("<div></div>").addClass('input-group');
//     $divbtngroupUp = $("<div></div>").addClass('btn-group padding-bottom-10');

//     $btntoUp = $("<button></button>").addClass('btn btn-default btn-primary btnItemUp btnItemCSS ');
//     if (readMode) {
//         $btntoUp.attr('disabled', 'disabled');
//     }
//     $btntoUpitag = $("<i></i>").addClass('fa fa-angle-double-up font-size-20');
//     $btntoUp.append($btntoUpitag);
//     $divbtngroupUp.append($btntoUp);
//     $divinputgroupUpDown.append($divbtngroupUp);

//     $btnClearfix1 = $("<div></div>").addClass('clearfix');
//     $divinputgroupUpDown.append($btnClearfix1);

//     $divbtngroupDown = $("<div></div>").addClass('btn-group');
//     $btntoDown = $("<button></button>").addClass('btn btn-default btn-primary btnItemDown btnItemCSS');
//     if (readMode) {
//         $btntoDown.attr('disabled', 'disabled');
//     }
//     $btntoDownitag = $("<i></i>").addClass('fa fa-angle-double-down font-size-20');
//     $btntoDown.append($btntoDownitag);
//     $divbtngroupDown.append($btntoDown);
//     $divinputgroupUpDown.append($divbtngroupDown);

//     $divOrder2.append($divinputgroupUpDown);
//     $rowOrder1.append($divOrder2);


//     $section2.append($rowOrder1);



//     $fieldset.append($section1);
//     $fieldset.append($section2);
//     $chefItemdiv.append($fieldset);

//     $errorContainer = $('<div></div>').addClass('errorContainer').addClass('hidden').text('This is Error Cointainer div');
//     $chefItemdiv.append($errorContainer);

//     // if($loadingContainer)
//     //    $loadingContainer.detach(); //commented to handle a javascript error, to be reverted.
//     // $("#toAdd").click(function(e){
//     //    $("#toaddbtn").append($form);
//     // });

//     $chefItemdiv.find('.btnItemAdd').click(function(e) {
//         var $deploymentSelectedList = $('.deploymentSelectedRunList');
//         var $selectedCookbooks = $("input[name=checkboxCookbook]:checked");
//         $selectedCookbooks.each(function(idx) {
//             var $this = $(this);
//             //
//             $deploymentSelectedList.append($('<li title="' + $this.attr('data-cookbookName') + '"><label style="margin: 5px;"><input type="hidden" value="' + $this.val() + '"/>' + $this.attr('data-cookbookName').substr(0, 15) + '</label><img src="img/icon_cookbook_recipes.png" style="height:24px;width:auto;margin-top:4px" class="pull-right"></li>').on('click', function(e) {
//                 if ($(this).hasClass('deploymentCookbookSelected')) {
//                     $(this).removeClass('deploymentCookbookSelected');
//                 } else {
//                     $(this).addClass('deploymentCookbookSelected');
//                 }
//             }));
//             $this.attr('checked', false);
//             $this.parents('li').hide().data('itemSelected', true);
//         });
//         var $selectedRoles = $("input[name=checkboxRole]:checked");
//         $selectedRoles.each(function(idx) {
//             var $this = $(this);
//             //
//             $deploymentSelectedList.append($('<li title="' + $this.attr('data-roleName') + '"><label style="margin: 5px;"><input type="hidden" value="' + $this.val() + '"/>' + $this.attr('data-roleName').substr(0, 15) + '</label><img src="img/icon_roles.png" style="height:24px;width:auto;margin-top:4px" class="pull-right"></li>').on('click', function(e) {
//                 if ($(this).hasClass('deploymentCookbookSelected')) {
//                     $(this).removeClass('deploymentCookbookSelected');
//                 } else {
//                     $(this).addClass('deploymentCookbookSelected');
//                 }
//             }));
//             $this.attr('checked', false);
//             $this.parents('li').hide().data('itemSelected', true);
//         });
//         // $deploymentSelectedList.sortable({
//         // cursor: "move"
//         // });

//         //chrome fix - Page refresh - Vinod 
//         e.preventDefault();
//         return (false);
//     });
//     $inputtypetextCookbooks.keyup(function(e) {
//         var searchText = $(this).val().toUpperCase();
//         $allListElements = $chefItemdiv.find('.deploymentsCookbookList > li');
//         $matchingListElements = $allListElements.filter(function(i, el) {
//             if ($(el).data('itemSelected')) {
//                 return false;
//             }
//             return $(el).text().toUpperCase().indexOf(searchText) !== -1;
//         });
//         $allListElements.hide();
//         $matchingListElements.show();
//     });

//     $inputtypetextRoles.keyup(function(e) {
//         var searchText = $(this).val().toUpperCase();
//         $allListElements = $chefItemdiv.find('.deploymentRoleList > li');
//         $matchingListElements = $allListElements.filter(function(i, el) {
//             if ($(el).data('itemSelected')) {
//                 return false;
//             }
//             return $(el).text().toUpperCase().indexOf(searchText) !== -1;
//         });
//         $allListElements.hide();
//         $matchingListElements.show();
//     });
//     $chefItemdiv.find('.btnItemRemove').click(function(e) {
//         var $deploymentSelectedList = $('.deploymentSelectedRunList');
//         $deploymentSelectedList.find('.deploymentCookbookSelected').each(function() {
//             var value = $(this).find('input').val();
//             var selector = 'input[name=checkboxRole][value="' + value + '"]';
//             console.log(selector);
//             $('input[name=checkboxRole][value="' + value + '"]').parents('li').show().data('itemSelected', false);
//             $('input[name=checkboxCookbook][value="' + value + '"]').parents('li').show().data('itemSelected', false);
//             $(this).remove();
//         });
//         //chrome fix - Page refresh - Vinod 
//         e.preventDefault();
//         return (false);
//     });

//     $chefItemdiv.find(".btnItemUp").on('click', function(e) {
//         var $selectedRunlist = $('.deploymentCookbookSelected');

//         $selectedRunlist.insertBefore($selectedRunlist.first().prev());
//         //chrome fix - Page refresh - Vinod 
//         e.preventDefault();
//         return (false);
//     });

//     $chefItemdiv.find(".btnItemDown").on('click', function(e) {
//         var $selectedRunlistDown = $('.deploymentCookbookSelected');

//         $selectedRunlistDown.insertAfter($selectedRunlistDown.last().next());
//         //chrome fix - Page refresh - Vinod 
//         e.preventDefault();
//         return (false);
//     });

//     // $chefItemdiv.find(".chooseCheforgType").on('click', function () {
//     //     $(".chooseCheforgType").select2();
//     // });
//     // $chefItemdiv.ready(function() {
//     //     $(".chooseCheforgType").select2();
//     // });
//     $chefItemdiv.find('.chooseCheforgType').select2();
//     return $chefItemdiv;
// }