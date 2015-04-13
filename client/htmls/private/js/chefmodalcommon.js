
// <div action="" id="" class="smart-form" novalidate="novalidate">
//     <div class="row" style="margin:0px;">
//         <div style="margin-left:15px;padding-top:15px;">
//             <div class="col-lg-6" style=" ">
//                 <div class="input-group" style="width: 100%;">
//                     <label class="input" style="width:80%;margin-bottom: 8px;"> 
//                         <i class="icon-append fa fa-search"></i>
//                         <input type="text" placeholder="Search Cookbooks/Roles" id="textbox">
//                     </label>
//                     <div class="btn-group selectCookbooksandRecipes" style="width: 80%;">
//                       <select id="cookbooksrecipesList" class="form-control" style="margin-bottom:10px;height:250px;" size="10" multiple="multiple">
                        
//                       </select>
//                     </div>
//                     <div class="btn-group" style="margin-left: 12px;">
//                         <a type="button" style="border-radius: 50%;height: 32px;width: 32px;margin-bottom: 15px;" class="btn btn-default btn-primary" id="btnaddToRunlist">
//                             <i class="fa fa-chevron-right" style="font-size:14px;margin-top: 8px;"></i>
//                         </a>

//                         <div class="clearfix"></div>
//                         <div class="clearfix"></div>

//                         <a type="button" style="border-radius: 50%;height: 32px;width: 32px;margin-top: 15px;" class="btn btn-default btn-primary" id="btnremoveFromRunlist">
//                             <i class="fa fa-chevron-left"style="font-size:14px;margin-top: 8px;"></i>
//                         </a>
//                     </div>
                    
//                 </div>
//             </div>
//             <div class="col-lg-6" style=" ">
//                 <div class="input-group" style="width: 100%;">
//                     <label class="label" style="font-size: 16px;margin-bottom:20px;">
//                         <img src="img/Order-run-list---deployment.png"/>
//                         <strong>Runlist</strong>
//                     </label>
//                     <div class="btn-group" style="width: 80%;">
//                         <select id="cookbooksrecipesselectedList" class="form-control" size="10" multiple="multiple" style="height:250px;">
                        
//                         </select>
//                     </div>
//                     <div class="btn-group" style="margin-left:10px;margin-top:20px;">
//                         <a type="button"  style="border-radius: 50%;height: 32px;width: 32px;margin-bottom:15px;" class="btn btn-default btn-primary" id="btnRunlistItemUp">
//                         <i class="fa  fa-chevron-up"style="font-size:14px;margin-top: 8px;"></i>
//                         </a>

//                         <div class="clearfix"></div>
//                         <div class="clearfix"></div>

//                         <a type="button" style="border-radius: 50%;height: 32px;margin-top: 15px;width: 32px;" class="btn btn-default btn-primary" id="btnRunlistItemDown">
//                         <i class="fa  fa-chevron-down"style="font-size:14px;margin-top: 8px;"></i>
//                         </a>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     </div>        
// </div>

var $chefCookbookRoleSelector = function(catorgname, callback, selectedRunlist, readMode) {
    if (!selectedRunlist) {
        selectedRunlist = [];
    }
    var $chefItemdiv = $("<div></div>").addClass('smart-form');
    var $row = $("<div></div>").addClass('row margin0');
    var $divtable = $("<div></div>").addClass('divtablemarginpadding');
    var $firstcol6 = $("<div></div>").addClass('col-lg-6');
    $loadingContainer = $('<div></div>').addClass('loadingContainer').addClass('hidden');
    var $imgerrorContainer = $("<img />").attr('src', 'img/loading.gif').addClass('center-block chefItemwithoutOrgloadingContainerCSS');
    $loadingContainer.append($imgerrorContainer);
    $firstcol6.append($loadingContainer);
    var $inputgroup = $("<div></div>").addClass('input-group width100');
    var $firstlabelinput = $("<label></label>").addClass('input searchCookbooksRolesLabel');
    var $searchiconappend = $("<i></i>").addClass('icon-append fa fa-search');
    
    var $searchinputtextbox = $('<input type="text" placeholder="Search Cookbooks/Roles" id="textbox"/>');
    $firstlabelinput.append($searchiconappend);
    $firstlabelinput.append($searchinputtextbox);
    $inputgroup.append($firstlabelinput);

    var $selectCookbooksandRecipesparentdiv = $("<div></div>").addClass('btn-group selectCookbooksandRecipesdiv');
    var $selectCookbooksandRecipes = $("<select id='cookbooksrecipesList' size='10' multiple='multiple'></select>").addClass('btn-group selectCookbooksandRecipes');
    
    // $.get('../organizations/' + catorgname + '/chefRunlist', function(data) {
    //     alert("Cookbooks Query:" + data);

    //     var cookbooks = data.cookbooks;
    //     var keys = Object.keys(cookbooks);
    //     alert(keys);
    //     keys.sort(function(a, b) {
    //         return a.toLowerCase().localeCompare(b.toLowerCase());
    //     });
    //     var $deploymentCookbookList = $('#cookbooksrecipesList');
    //     for (i = 0; i < keys.length; i++) {
    //         var $li = $('<option>' + keys[i] + '</option>');
            
    //         $deploymentCookbookList.append($li);
    //     }
    $selectCookbooksandRecipesparentdiv.append($selectCookbooksandRecipes);
    $inputgroup.append($selectCookbooksandRecipesparentdiv);
    var $btngroupAddRemove = $("<div></div>").addClass("btn-group marginleft12");
    var $anchorAdd = $("<a id='btnaddToRunlist' type='button'></a>").addClass('btn btn-default btn-primary anchorAdd');
    var $anchorAddi = $("<i></i>").addClass("fa fa-chevron-right anchorAddi");
    $anchorAdd.append($anchorAddi);
    $btngroupAddRemove.append($anchorAdd);
    $inputgroup.append($btngroupAddRemove);
    var $clearfix = $("<div></div>").addClass("clearfix");
    $btngroupAddRemove.append($clearfix);
    $btngroupAddRemove.append($clearfix);
    var $anchorAdd = $("<a id='btnremoveFromRunlist' type='button'></a>").addClass('btn btn-default btn-primary anchorRemove');
    var $anchorAddi = $("<i></i>").addClass("fa fa-chevron-right anchorRemovei");
    $anchorAdd.append($anchorAddi);
    $btngroupAddRemove.append($anchorAdd);
    $inputgroup.append($btngroupAddRemove);



    $firstcol6.append($inputgroup);
    $divtable.append($firstcol6);

    var $secondcol6 = $("<div></div>").addClass('col-lg-6');

    $divtable.append($secondcol6);
    $row.append($divtable);
    $chefItemdiv.append($row);
    $errorContainer = $('<div></div>').addClass('errorContainer').addClass('hidden').text('This is Error Cointainer div');
    $chefItemdiv.append($errorContainer);
    
    $chefItemdiv.find('.chooseCheforgType').select2();
    var cookbookrecipesTotallist = [
      { value: "apache", Class: "cookbook" },
      { value: "Oracle", Class: "cookbook" },
      { value: "Jboss", Class: "cookbook" },
      { value: "Drupal", Class: "cookbook" },
      { value: "Tomcat", Class: "cookbook" },
      { value: "Lamp Stack", Class: "cookbook" },
      { value: "NodeJs", Class: "cookbook" },
      { value: "MongoDB", Class: "cookbook" },
      { value: "Joomla", Class: "cookbook" },
      { value: "Mysql_Server", Class: "roles" },
      { value: "Server_time", Class: "roles" }
    ];

    var optionstoAdd = "<option class=${Class}>${value}</option>";

    /* Compile the markup as a named template */
    $.template( "optionTemplate", optionstoAdd );
    var tempoptions = $chefItemdiv.find("#cookbooksrecipesList");
    /* Render the template with the movies data and insert
       the rendered HTML under the "movieList" element */
    $.tmpl( "optionTemplate", cookbookrecipesTotallist ).appendTo(tempoptions);
    return $chefItemdiv;
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








    //To Add
    $chefItemdiv.find('#cookbooksrecipesList').on('dblclick','option',function(){
        var $this = $(this);
        var $selectedList = $chefItemdiv.find("#cookbooksrecipesselectedList");
        $selectedList.append($this.clone());
        $this.hide();
    });
    //To Remove
    $chefItemdiv.find('#cookbooksrecipesselectedList').on('dblclick','option',function(){
        var $instanceCookbookList = $chefItemdiv.find('#cookbooksrecipesList');
        var $this = $(this);
        var value = $this.val();
        $this.remove();
        $instanceCookbookList.find('option[value="'+value+'"]').show();
    });

    //To add the wizard
    $chefItemdiv.find("#btnaddToRunlist").on('click', function () {
        var $options = $chefItemdiv.find('#cookbooksrecipesList option:selected');
        var $selectedList = $chefItemdiv.find("#cookbooksrecipesselectedList");
        $options.each(function(){
            var $this = $(this);
            $selectedList.append($this.clone());
            $this.hide();
        });
    });

    $chefItemdiv.find("#btnremoveFromRunlist").on('click', function () {
        var $instanceCookbookList = $chefItemdiv.find('#cookbooksrecipesList');

        $chefItemdiv.find("#cookbooksrecipesselectedList option:selected").each(function(){
           var $this = $(this);
           var value = $this.val();
           $this.remove();
           $instanceCookbookList.find('option[value="'+value+'"]').show();

        });
        //$("#cookbooksrecipesselectedList option:selected").remove();
    });

    $chefItemdiv.find("#btnRunlistItemUp").on('click', function () {
        $chefItemdiv.find("#cookbooksrecipesselectedList option:selected").each(function () {
            var listItem = $(this);
            var listItemPosition = $chefItemdiv.find("#cookbooksrecipesselectedList option").index(listItem) + 1;

            if (listItemPosition == 1) return false;

            listItem.insertBefore(listItem.prev());
        });

    });

    $chefItemdiv.find("#btnRunlistItemDown").on('click', function () {
        var itemsCount = $chefItemdiv.find("#cookbooksrecipesselectedList option").length;

        $($chefItemdiv.find("#cookbooksrecipesselectedList option:selected").get().reverse()).each(function () {
            var listItem = $(this);
            var listItemPosition = $chefItemdiv.find("#cookbooksrecipesselectedList option").index(listItem) + 1;

            if (listItemPosition == itemsCount) return false;

            listItem.insertAfter(listItem.next());

        });
    });
    
    //Filter the Roles/Cookbooks
   jQuery.fn.filterByText = function(textbox, selectSingleMatch) {
    alert('sdhg');
        return this.each(function() {
            var select = this;
            var options = [];
            $(select).find('option').each(function() {
                //alert($(this).val());
                //alert($(this).hasClass('cookbook'));
                options.push({value: $(this).val(), text: $(this).text(),class:$(this).attr("class")});
            });
            $(select).data('options', options);
            var $selectedList = $chefItemdiv.find("#cookbooksrecipesselectedList");
            alert($selectedList);
            $(textbox).bind('change keyup', function() {
                var options = $(select).empty().data('options');
                var search = $(this).val().trim();
                var regex = new RegExp(search,"gi");
                
                
                $.each(options, function(i) {
                    var option = options[i];
                    var $options = $('<option>').text(option.text).val(option.value).addClass(option.class);
                    if(option.text.match(regex) !== null) { 
                       var $selectedOption = $selectedList.find('option[value="'+option.value+'"]');
                       console.log($selectedOption.length);
                       if(!$selectedOption.length) {
                       
                       } else {
                         $options.hide();
                       }                       
                        
                    } else {
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

    $(function() {
        $chefItemdiv.find('#cookbooksrecipesList').filterByText($chefItemdiv.find('#textbox'), false);
    });
