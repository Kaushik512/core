function deleteItem(docid, key, value, button) {

    if (confirm('You are about to remove this item \" ' + $(button).closest('tr').find('td').first().html() + ' \"')) {

        $.ajax({
            type: "get",
            dataType: "text",

            async: false,
            url: serviceURL + "removeitem/" + docid + "/" + key + "/" + value,
            success: function(data) {
                // alert(data.toString());  
                // debugger;
                //d4ddata = JSON.parse(data);
                // $('#refreshpage').click();
                var $tr = $(button).closest('tr');
               
                //$tr.addClass('hidden').remove();
                var $table = $tr.parents('table');
               
                if ( $.fn.DataTable.isDataTable( $table ) ) {
                   var $dataTable = $table.DataTable();
                   $dataTable.row($tr).remove().draw( false );
                } else {
                    
                    $tr.fadeOut("slow");
                    $tr.addClass('hidden').remove();
                }
                 

                var tab = 'envtable';
                $('#' + tab).dataTable();
                if(parseInt(docid) < 5){
                    loadTreeFuncNew();
                }
            },
            failure: function(data) {
                // debugger;
                //  alert(data.toString());
            }
        });
    }

}

function validatedockeruser(usernameInput, passwordInput) {
    var retval = false;
    $.ajax({
        type: "get",
        dataType: "text",
        async: false,
        url: '/d4dmasters/dockervalidate/' + usernameInput.val() + '/' + passwordInput.val(),
        success: function(data) {
            if (data == '200')
                retval = true;
            else {
                errormessageforInput(usernameInput.attr('id'), "Not a valid Docker UserID / Password");
                retval = false;
            }
        },
        failure: function(data) {
            errormessageforInput(usernameInput.attr('id'), "Not a valid Docker UserID / Password");
            retval = false;
        }
    });


    return (retval);
}

//Reading a unique record from master data
function readMasterRecord(id,rowid){
    $.ajax({
        type: "get",
        dataType: "text",
        async: false,
        url: serviceURL + "readmasterjsonrecord/" + id +'/' + rowid,
        success: function(data) {
             //   alert(data.toString());  
            // debugger;
            d4ddata = JSON.parse(data);
        },
        failure: function(data) {
            // debugger;
            //  alert(data.toString());
        }
    });
    return (d4ddata);
}


function readMasterJson(id) {
    // debugger;
   //alert(url);
if(url.indexOf('List') >= 0 || url.indexOf('Create') >= 0 ){
    // alert('in 1');
    $.ajax({
        type: "get",
        dataType: "text",
        async: false,
        url: serviceURL + "readmasterjsonnew/" + id,
        success: function(data) {
                // alert(data.toString());  
            // debugger;
            d4ddata = JSON.parse(data);
        },
        failure: function(data) {
            // debugger;
            //  alert(data.toString());
        }
    });
    return (d4ddata);
}
if(id.toString() == "1" && url.indexOf('OrgList.html') > 0)
{
    //alert('in 1');
    $.ajax({
        type: "get",
        dataType: "text",
        async: false,
        url: serviceURL + "readmasterjsonnew/" + id,
        success: function(data) {
                // alert(data.toString());  
            // debugger;
            d4ddata = JSON.parse(data);
        },
        failure: function(data) {
            // debugger;
            //  alert(data.toString());
        }
    });
    return (d4ddata);
}
else{
    
    $.ajax({
        type: "get",
        dataType: "text",

        async: false,
        url: serviceURL + "readmasterjson/" + id,
        success: function(data) {
            //      alert(data.toString());  
            // debugger;
            d4ddata = JSON.parse(data);
        },
        failure: function(data) {
            // debugger;
            //  alert(data.toString());
        }
    });
    return (d4ddata);
    }
}

$.fn.getType = function() {
    return this[0].tagName == "INPUT" ? this[0].type.toLowerCase() : this[0].tagName.toLowerCase();
}

function CreateTableFromJson__(formID, idFieldName, createFileName) {

    //To Do SAve...
    // var d4djson = $.parseJSON(d4ddata);
    // alert(d4ddata.sections.section[0].name);
    //alert('run');
    var formData = null;
    readMasterJson(formID);

    /*$.each(d4ddata.sections.section, function (i, item) {
        if (item.name == formName) {
            formData = item;
        }
    });*/

    //force setting the idFieldName to "rowid"
    idFieldName = "rowid";

    // alert(JSON.stringify(formData));
    //Reading row to get schema
    formData = d4ddata.masterjson;

    var formSchema = null;
    $.each(formData.rows.row, function(i, item) {

        var templateRow = $(".rowtemplate").clone();
        $.each(item.field, function(i, item) {


            var inputC = null;
            var editButton = null;
            var setOrgname = false;
            var imageTD = null;
            $.each(item, function(k, v) {
                if (k == "name") {
                    // alert(v);
                    inputC = $('.rowtemplate').find("[datafield='" + v + "']");
                    if (v == idFieldName) {
                        setOrgname = true;
                    }
                }
            });
            $.each(item, function(k, v) {
                if (k == "values") {
                    // alert(JSON.stringify(v));
                    if (inputC) {
                        //  alert(inputC.text());
                        //   inputC.html('test');
                        var tv = '';
                        $.each(v, function(k1, v1) {
                            if (tv == '')
                                tv += v1;
                            else
                                tv += ",&nbsp;" + v1;
                        });

                        inputC.html(tv);
                    }
                    if (setOrgname == true) {
                        //get all image tags
                        imageTD = $('.rowtemplate').find("[datatype='image']");

                        editButton = $('.rowtemplate').find("[title='Update']");
                        if (editButton) {
                            var tv = '';
                            $.each(v, function(k1, v1) {
                                if (tv == '')
                                    tv += v1;
                                else
                                    tv += ",&nbsp;" + v1;
                            });
                            if (imageTD) {
                                if (imageTD.length > 0) {
                                    console.log("Template Icon:" + tv);
                                    var imgpath = 'img/blank.png';
                                    if (imageTD.html().indexOf('<img') >= 0) {
                                        imageTD.html(''); //fix for image tag gettnig embedded. - Vinod
                                    } else
                                        imgpath = '/d4dMasters/image/' + tv + '__' + imageTD.attr('datafieldoriginal') + '__' + imageTD.html();

                                    imageTD.html('');
                                    imageTD.append($('<img src="' + imgpath + '" style="height:28px;width:auto"/>'));

                                }

                            }
                            if(editButton){
                            editButton.attr("href", "#ajax/Settings/" + createFileName + "?" + tv);
                            editButton.addClass("tableactionbutton tableactionbuttonpadding");
                            editButton.removeClass('btn-xs');
                            editButton.addClass('btn-sg');
                            }
                            //importbutton will be present for config management screen.
                            var importbutton = $('.rowtemplate').find('a[title="Import Nodes"]');
                            // var tdorgname = $('.rowtemplate').find('td[datafield="orgname"]');
                            //&& tdorgname.length > 0
                            if (importbutton && importbutton.length > 0) {
                                importbutton.attr("href", "#ajax/Settings/chefSync.html?" + tv);
                                importbutton.removeClass('btn-xs');
                                importbutton.addClass('btn-sg');
                                importbutton.addClass('tableactionbutton');
                            }



                            //setting the delete button

                            var deletebutton = $('.rowtemplate').find("[title='Remove']");
                            if (deletebutton) {
                                deletebutton.attr('onClick', 'deleteItem(\"' + formID + '\", \"' + idFieldName + '\",\"' + tv + '\",this);');
                                deletebutton.removeClass('btn-xs');
                                deletebutton.addClass('btn-sg');
                                deletebutton.addClass('tableactionbutton');
                            }
                        }
                        setOrgname = false;
                    }
                }
            });

            //work on the belwo row.

        });
        var sRow = $(".rowtemplate").clone();
        sRow.removeClass("hidden");
        sRow.removeClass("rowtemplate");
        $('#envtable').append(sRow);
        
    });

    $(".savespinner").hide();

}


function CreateTableFromJson(formID, idFieldName, createFileName) {

        //To Do SAve...
        // var d4djson = $.parseJSON(d4ddata);
        // alert(d4ddata.sections.section[0].name);
        //alert('run');
        var formData = null;
        readMasterJson(formID);

        /*$.each(d4ddata.sections.section, function (i, item) {
            if (item.name == formName) {
                formData = item;
            }
        });*/

        //force setting the idFieldName to "rowid"
        idFieldName = "rowid";

        // alert(JSON.stringify(formData));
        //Reading row to get schema
        formData = d4ddata;

        var formSchema = null;
        $.each(d4ddata, function(i, item) { 
            console.log("Top:" + JSON.stringify(item)); //rows
            var editButton = null;
            var idFieldValue = null;
            var imageTD = null;
            $.each(item,function(k,v){ //columns
                // var inputC = null;
                console.log('k:' + k + ' v :' + JSON.stringify(v));
                if(k == idFieldName){
                        idFieldValue = v;
                }
                inputC = $('.rowtemplate').find("[datafield='" + k + "']");
                if(inputC){
                    inputC.html(v);
                }
            });

            var sRow = $(".rowtemplate").clone();
            sRow.removeClass("hidden");
            sRow.removeClass("rowtemplate");
            // $('#envtable').append(sRow);
            imageTD = $('.rowtemplate').find("[datatype='image']");

            editButton = $('.rowtemplate').find("[title='Update']");

            if(idFieldValue){
                if (imageTD) {
                    if (imageTD.length > 0) {
                        console.log("Template Icon:" + idFieldValue);
                        var imgpath = 'img/blank.png';
                        if (imageTD.html().indexOf('<img') >= 0) {
                            imageTD.html(''); //fix for image tag gettnig embedded. - Vinod
                        } else
                            imgpath = '/d4dMasters/image/' + idFieldValue + '__' + imageTD.attr('datafieldoriginal') + '__' + imageTD.html();

                        imageTD.html('');
                        imageTD.append($('<img src="' + imgpath + '" style="height:28px;width:auto"/>'));

                    }

                }
                if(editButton){
                    editButton.attr("href", "#ajax/Settings/" + createFileName + "?" + idFieldValue);
                    editButton.addClass("tableactionbutton tableactionbuttonpadding");
                    editButton.removeClass('btn-xs');
                    editButton.addClass('btn-sg');
                }
                //importbutton will be present for config management screen.
                var importbutton = $('.rowtemplate').find('a[title="Import Nodes"]');
                // var tdorgname = $('.rowtemplate').find('td[datafield="orgname"]');
                //&& tdorgname.length > 0
                if (importbutton && importbutton.length > 0) {
                    importbutton.attr("href", "#ajax/Settings/chefSync.html?" + idFieldValue);
                    importbutton.removeClass('btn-xs');
                    importbutton.addClass('btn-sg');
                    importbutton.addClass('tableactionbutton');
                }



                //setting the delete button

                var deletebutton = $('.rowtemplate').find("[title='Remove']");
                if (deletebutton) {
                    deletebutton.attr('onClick', 'deleteItem(\"' + formID + '\", \"' + idFieldName + '\",\"' + idFieldValue + '\",this);');
                    deletebutton.removeClass('btn-xs');
                    deletebutton.addClass('btn-sg');
                    deletebutton.addClass('tableactionbutton');
                }
            }


            console.log('-----------');
            var sRow = $(".rowtemplate").clone();
            sRow.removeClass("hidden");
            sRow.removeClass("rowtemplate");
            $('#envtable').append(sRow);

        });
      //  $.each(formData.data.fields, function(i, item) { //row iteration

            // var templateRow = $(".rowtemplate").clone();
            // $.each(item,function(k, v) {
            //     console.log('k:' + k + ',v:' + v);
            // });
            // var sRow = $(".rowtemplate").clone();
            // sRow.removeClass("hidden");
            // sRow.removeClass("rowtemplate");
            // $('#envtable').append(sRow);
            
     //   });

        $(".savespinner").hide();

    }
// function CreateTableFromJson(formID, idFieldName, createFileName) {
//     CreateTableFromJsonNew(formID, idFieldName, createFileName);
// }



var forceEdit = false; //variable used to force save one record ex. Authentication
//Create & Edit form functions

function readform__(formID) {
    var formData = null;
    //    alert("force edit:" + forceEdit);
    //Prefilling dropdowns
    $('select[cdata="catalyst"]').each(function() {

        if ($(this).attr('sourcepath') && $(this).attr('datapath')) {

            if ($(this).attr('linkedfields') || ($(this).attr('linkedfields') == null && $(this).attr('linkedto') == null)) {

                var tempJSON = JSON.parse(JSON.stringify(readMasterJson($(this).attr('sourcepath'))));
                var curSelect = $(this);
                //    alert(JSON.stringify(tempJSON));
                $.each(eval('tempJSON.' + curSelect.attr('datapath')), function(i, item) {
                    //     alert(item.field[0].values.value);
                    // debugger;
                    //Loop to get rowid 
                    var _rowid = 0;
                    for (var k = 0; k < item.field.length; k++) {
                        if (item.field[k].name == "rowid") {
                            //curSelect.append('<option value="' + item.field[k].values.value + '">' + item.field[k].values.value + '</option>');
                            // alert("Added:" + item.field[i].values.value);
                            _rowid = item.field[k].values.value;
                        }
                    }
                    for (var k = 0; k < item.field.length; k++) {
                        if (item.field[k].name == curSelect.attr("id")) {
                            curSelect.append('<option value="' + item.field[k].values.value + '" rowid = "' + _rowid + '">' + item.field[k].values.value + '</option>');
                            // alert("Added:" + item.field[i].values.value);
                        }
                    }
                });
            }
            // debugger;
            if ($(this).attr('linkedfields')) {

                $(this).change(function() {
                    //  debugger;
                    $('#content').attr('style', "opacity:1;")

                    var curCtrl = $(this);
                    $.each(eval($(this).attr('linkedfields')), function(i, item) {
                        var targetCtrl = $('#' + item);
                        targetCtrl.html('');
                        var opts = getRelatedValues(targetCtrl.attr('sourcepath'), curCtrl.attr("id"), $('#' + curCtrl.attr('id') + ' option:selected').text(), targetCtrl.attr("id"));

                        $.each(eval(opts), function(j, itm) {
                            if (targetCtrl.attr('multiselect'))
                                addToSelectList(itm, targetCtrl);
                            else
                                targetCtrl.append('<option value="' + itm + '">' + itm + '</option>');

                        });
                        //fix for select2 control - Vinod 
                        if (targetCtrl.attr('multiselect') == null)
                            targetCtrl.select2();

                    });
                });

            }
        }

        //alert("Reading" + JSON.stringify(temp));
    });

    $('input[sourcepath][cdata="catalyst"]').each(function() {
        //debugger;
        if ($(this).attr('sourcepath') && $(this).attr('datapath')) {
            var tempJSON = JSON.parse(readMasterJson($(this).attr('sourcepath')));
            var curInput = $(this);
            //   alert(JSON.stringify(tempJSON));
            $.each(eval('tempJSON.' + curInput.attr('datapath')), function(i, item) {
                //     alert(item.field[0].values.value);
                // debugger;
                for (var k = 0; k < item.field.length; k++) {
                    if (item.field[k].name == curInput.attr("id")) {
                        // curSelect.append('<option value="' + item.field[k].values.value + '">' + item.field[k].values.value + '</option>');
                        // alert("Added:" + item.field[i].values.value);
                        addToCodeList(item.field[k].values.value, curInput);
                    }
                }
            });
        }
    });

    $('div[datatype="select"]').each(function() {
        //debugger;
        if ($(this).attr('linkedfields') || ($(this).attr('linkedfields') == null && $(this).attr('linkedto') == null)) {
            if ($(this).attr('sourcepath') && $(this).attr('datapath')) {
                var tempJSON = JSON.parse(JSON.stringify(readMasterJson($(this).attr('sourcepath'))));
                var curInput = $(this);
                //  alert('div select ' + curInput.attr("id"));
                $.each(eval('tempJSON.' + curInput.attr('datapath')), function(i, item) {
                    //     alert(item.field[0].values.value);
                    // debugger;
                    for (var k = 0; k < item.field.length; k++) {
                        if (item.field[k].name == curInput.attr("id")) {
                            // curSelect.append('<option value="' + item.field[k].values.value + '">' + item.field[k].values.value + '</option>');
                            // alert("Added:" + item.field[i].values.value);
                            addToSelectList(item.field[k].values.value, curInput);
                        }
                    }
                });
            }
        }
    });

    // End Prefilling dropdowns



    // alert("before d4d" + JSON.stringify(d4ddata));
    readMasterJson(formID);
    //alert("after d4d" + JSON.stringify(d4ddata));

    /* $.each(d4ddata.sections.section, function (i, item) {
         if (item.name == formName) {
             formData = item;
         }
     });*/


    //Reading row to get schema
    var formSchema = null;
    var orgName = url.substr(url.indexOf("?") + 1);
    //  alert(orgName);
    var editMode = false;

    formData = d4ddata.masterjson;

    //alert("here " + JSON.stringify(formData) + ":" + orgName);

    $.each(formData.rows.row, function(i, item) {
        //  alert(item.field.length);
        for (i = 0; i < item.field.length; i++) {
            //  alert(typeof item.field[i].values.value);
            //    alert('Expanded field ' + JSON.stringify(item.field.length) + ":" + orgName.toLowerCase());
            if (typeof item.field[i].values.value == "string") {
                if (item.field[i].values.value.toLowerCase() == orgName.toLowerCase()) {
                    formSchema = item.field;
                    editMode = true;
                    return (false);
                }
            }
        }
        formSchema = item.field;
    });
    //  alert('Edit Mode:' + editMode);
    if (forceEdit == true) {
        editMode = true;
        formSchema = formData.rows.row[0].field;
    }
    if (editMode == false) {
        return (false);
    }

    //Setting the header of the form to Edit if shown as Create
    var head = $('.widget-header').html().replace('Create', 'Edit').replace('New', 'Edit');
    $('.widget-header').html(head);


    //  debugger;
    //  alert('came here');
    //Read current form values with the field names
    var formSchemaNew = formSchema;



    //Since this section is executed only in edit mode. The rowid field is injected with the rowid
    $('button[onclick*="saveform"]').attr("rowid", orgName);


    //   alert(JSON.stringify(formData.rows.row[0].field));

    $.each(formSchemaNew, function(i, item) {
        var inputC = null;
        $.each(item, function(k, v) {
            // alert("k & v:" + k + ":" + v);
            if (k == "name" && v != "rowid") {
                if (v.indexOf("_filename") > 0) {
                    v = v.replace('_filename', '');
                }
                inputC = $('#' + v);
            }

        });
        $.each(item, function(k, v) {
            if (k == "values") {
                if (inputC && $(inputC).attr("id") != undefined) {
                    $.each(v, function(k1, v1) {

                        if (inputC.getType().toLowerCase() == "text") {
                            //  alert(inputC.attr("datavalues"));
                            if (inputC.attr("datavalues")) {
                                //var array = v[k1].split(",");
                                $.each(v[k1], function(i) {
                                    addToCodeList(v[k1][i]);
                                });
                            } else
                                inputC.val(v[k1]);
                        }

                        if (inputC.getType().toLowerCase() == "file") {
                            //  v[k1]
                            $(inputC).closest('input').next().val(v[k1]);
                        }
                        if (inputC.getType().toLowerCase() == "select") {
                          //alert(v[k1]);
                            $(inputC).val(v[k1]);
                            $(inputC).attr('savedvalue', v[k1]);
                            //fix for select2 type control. Expecting all select boxes to be type select2. - Vinod

                            $(inputC).select2();
                        }
                        if (inputC.getType().toLowerCase() == "ul") {
                          //  alert('in ul');
                            if (v[k1].indexOf(',') >= 0) {
                                var itms = v[k1].split(',');
                                $(inputC).attr('defaultvalues', v[k1]);

                                /* for(var j = 0; j < itms.length; j++){
                                   $(inputC).append('<li><label style="margin: 5px;"><input type="hidden" value="recipe[' + itms[j] + '"]">' + itms[j] + '</label></li>');
                                } */
                            }
                        }
                        if (inputC.getType().toLowerCase() == "div") {
                            
                            $(inputC).attr('savedvalue', v[k1])
                            //Set saved values to div.
                            var ctype = '';
                            var csource = '';
                            if ($(inputC).attr('ctype'))
                                ctype = $(inputC).attr('ctype');
                            if ($(inputC).attr('csource'))
                                csource = $(inputC).attr('csource');
                            var divselect1 = v[k1].toString().split(',');
                          //  alert(v[k1]);
                            for (var j = 0; j < divselect1.length; j++) {
                                if (ctype == 'list' && csource != '') {

                                    addToTargetList($('#' + csource).clone().val(divselect1[j]));
                                }
                                if (ctype == '')
                                    inputC.find('input[value="' + divselect1[j] + '"]').trigger('click');
                                if(ctype == 'checkbox'){
                                    inputC.find('input[id="checkbox_' + divselect1[j] + '"]').attr('checked','checked');
                                }
                            }
                        }
                    });
                }
                inputC = null;
            }
        });
    });
    //Force clicking on selects that has dependent controls
    $('[linkedfields]').each(function() {
        $(this).trigger('change');
        var ctrls = $(this).attr('linkedfields').replace(/'/g, "").replace(/]/g, "").replace(/\[/g, "").split(',');
        for (var i = 0; i < ctrls.length; i++) {
            var ctrl = $("#" + ctrls[i]);
            if (ctrl.getType() == "select") {
                ctrl.val(ctrl.attr('savedvalue'));
            }
            if (ctrl.getType() == "div") {
                var divselect = ctrl.attr('savedvalue').split(',');
                // alert(divselect.length);
                for (var j = 0; j < divselect.length; j++) {
                    ctrl.find('input[value="' + divselect[j] + '"]').trigger('click');
                }
            }
        }
    });


    //  alert('almost exiting');
    //Setting the unique field with current value
    $('input[unique="true"],select[unique="true"]').each(function() {
        // alert($(this).val());
        $(this).attr('initialvalue', $(this).val());
        // alert($(this).attr('initialvalue'));
    });
    return (true);
}

function readform(formID) {
        var formData = null;
        var button = $("form[id*='myForm']").find('button');
        //    alert("force edit:" + forceEdit);
        //Prefilling dropdowns
        $('select[cdata="catalyst"]').each(function() {

            if ($(this).attr('sourcepath') && $(this).attr('datapath')) {

                if ($(this).attr('linkedfields') || ($(this).attr('linkedfields') == null && $(this).attr('linkedto') == null)) {

                    var tempJSON = JSON.parse(JSON.stringify(readMasterJson($(this).attr('sourcepath'))));
                    var curSelect = $(this);
                  //  alert(JSON.stringify(tempJSON));
                    var _rowid = 0;
                    $.each(tempJSON, function(i, item) {
                        _rowid = item['rowid'];

                        $.each(item,function(k,v){ //columns
                            console.log('1 k:' + k + ' 1 v :' + JSON.stringify(v));
                            if (k == curSelect.attr("id")) {
                                 curSelect.append('<option value="' + v + '" rowid = "' + _rowid + '">' + v + '</option>');
                            }
                        });
                    });
                    // $.each(eval('tempJSON.' + curSelect.attr('datapath')), function(i, item) {
                    //     //     alert(item.field[0].values.value);
                    //     // debugger;
                    //     //Loop to get rowid 
                    //     var _rowid = 0;
                    //     for (var k = 0; k < item.field.length; k++) {
                    //         if (item.field[k].name == "rowid") {
                    //             //curSelect.append('<option value="' + item.field[k].values.value + '">' + item.field[k].values.value + '</option>');
                    //             // alert("Added:" + item.field[i].values.value);
                    //             _rowid = item.field[k].values.value;
                    //         }
                    //     }
                    //     for (var k = 0; k < item.field.length; k++) {
                    //         if (item.field[k].name == curSelect.attr("id")) {
                    //             curSelect.append('<option value="' + item.field[k].values.value + '" rowid = "' + _rowid + '">' + item.field[k].values.value + '</option>');
                    //             // alert("Added:" + item.field[i].values.value);
                    //         }
                    //     }
                    // });
                }
                // debugger;
                if ($(this).attr('linkedfields')) {

                    $(this).change(function() {
                        //  debugger;
                        $('#content').attr('style', "opacity:1;")

                        var curCtrl = $(this);
                        $.each(eval($(this).attr('linkedfields')), function(i, item) {
                            var targetCtrl = $('#' + item);
                            targetCtrl.html('');
                            var opts = getRelatedValues(targetCtrl.attr('sourcepath'), curCtrl.attr("id"), $('#' + curCtrl.attr('id') + ' option:selected').text(), targetCtrl.attr("id"));
                            $.each(eval(opts), function(j, itm) {
                                if (targetCtrl.attr('multiselect'))
                                    addToSelectList(itm, targetCtrl);
                                else
                                    targetCtrl.append('<option value="' + itm + '">' + itm + '</option>');

                            });
                            //fix for select2 control - Vinod 
                            if (targetCtrl.attr('multiselect') == null)
                                targetCtrl.select2();

                        });
                    });

                }
            }

            //alert("Reading" + JSON.stringify(temp));
        });

        $('input[sourcepath][cdata="catalyst"]').each(function() {
            //debugger;
            if ($(this).attr('sourcepath') && $(this).attr('datapath')) {
                var tempJSON = JSON.parse(readMasterJson($(this).attr('sourcepath')));
                var curInput = $(this);
                //   alert(JSON.stringify(tempJSON));

                // $.each(eval('tempJSON.' + curInput.attr('datapath')), function(i, item) {
                //     //     alert(item.field[0].values.value);
                //     // debugger;
                //     for (var k = 0; k < item.field.length; k++) {
                //         if (item.field[k].name == curInput.attr("id")) {
                //             // curSelect.append('<option value="' + item.field[k].values.value + '">' + item.field[k].values.value + '</option>');
                //             // alert("Added:" + item.field[i].values.value);
                //             addToCodeList(item.field[k].values.value, curInput);
                //         }
                //     }
                // });
                $.each(tempJSON, function(i, item) {
                       // _rowid = item['rowid'];

                        $.each(item,function(k,v){ //columns
                            console.log('2 k:' + k + ' 2 v :' + JSON.stringify(v));
                           if (k == curInput.attr("id")) {
                                 addToCodeList(v, curInput);
                            }
                        });
                });
                
            }
        });

        $('div[datatype="select"]').each(function() {
            //debugger;
        
            if ($(this).attr('linkedfields') || ($(this).attr('linkedfields') == null && $(this).attr('linkedto') == null)) {
                if ($(this).attr('sourcepath') && $(this).attr('datapath')) {
                    var tempJSON = JSON.parse(JSON.stringify(readMasterJson($(this).attr('sourcepath'))));
                 //   debugger;
                    var curInput = $(this);
                    //  alert('div select ' + curInput.attr("id")); curInput.attr('datapath')
                    $.each(tempJSON, function(i, item) {
                        //     alert(item.field[0].values.value);
                        // debugger;
                        
                          //  if (item.field[k].name == curInput.attr("id")) {
                                // curSelect.append('<option value="' + item.field[k].values.value + '">' + item.field[k].values.value + '</option>');
                                // alert("Added:" + item.field[i].values.value);
                                addToSelectList(item[curInput.attr('datapath')], curInput);
                         //   }
                       
                    });
                }
            }
        });

        // End Prefilling dropdowns
        var formSchema = null;
        var rowid = url.substr(url.indexOf("?") + 1);
        //  alert(orgName);
        var editMode = false;


        // alert("before d4d" + JSON.stringify(d4ddata));
        readMasterRecord(formID,rowid);
        //alert("after d4d" + JSON.stringify(d4ddata));

        /* $.each(d4ddata.sections.section, function (i, item) {
             if (item.name == formName) {
                 formData = item;
             }
         });*/
        
        //get Unique record into d4ddata.



        //Reading row to get schema
        // var formSchema = null;
        // var orgName = url.substr(url.indexOf("?") + 1);
        // //  alert(orgName);
        // var editMode = false;
      //  alert(d4ddata);
        formData = d4ddata;

        //alert("here " + JSON.stringify(formData) + ":" + orgName);

        // $.each(formData.rows.row, function(i, item) {
        //     //  alert(item.field.length);
        //     for (i = 0; i < item.field.length; i++) {
        //         //  alert(typeof item.field[i].values.value);
        //         //    alert('Expanded field ' + JSON.stringify(item.field.length) + ":" + orgName.toLowerCase());
        //         if (typeof item.field[i].values.value == "string") {
        //             if (item.field[i].values.value.toLowerCase() == orgName.toLowerCase()) {
        //                 formSchema = item.field;
        //                 editMode = true;
        //                 return (false);
        //             }
        //         }
        //     }
        //     formSchema = item.field;
        // });
        //  alert('Edit Mode:' + editMode);
        
        if(typeof(formData.rowid) != 'undefined'){
            editMode = true;
        }
        if (forceEdit == true) {
            editMode = true;
            formSchema = formData;
        }
        if (editMode == false) {
            return (false);
        }

        //Setting the header of the form to Edit if shown as Create
        var head = $('.widget-header').html().replace('Create', 'Edit').replace('New', 'Edit');
        $('.widget-header').html(head);


        //  debugger;
        //  alert('came here');
        //Read current form values with the field names
        var formSchemaNew = formSchema;



        //Since this section is executed only in edit mode. The rowid field is injected with the rowid
        button.attr("rowid", rowid);
        /*$("button[rowid*='"+"']");*/


        //   alert(JSON.stringify(formData.rows.row[0].field));

        $.each(formData, function(k,v) {
            var inputC = null;
            console.log('k:' + k + ' v:' + v);
            //Finding the input control to bind.
            if (k.indexOf("_filename") > 0) {
                    k = k.replace('_filename', '');
            }
            if(k.indexOf('_id') < 0){ //ensuring that you do not find an id field
                inputC = $('#' + k);
            }
            if (inputC && $(inputC).attr("id") != undefined) {
                if (inputC.getType().toLowerCase() == "text") {
                    //  alert(inputC.attr("datavalues"));
                    if (inputC.attr("datavalues")) {
                        //var array = v[k1].split(",");
                        $.each(v, function(i) {
                            addToCodeList(v[i]);
                        });
                    } else
                        inputC.val(v);
                }
                if (inputC.getType().toLowerCase() == "file") {
                                //  v[k1]
                   $(inputC).closest('input').next().val(v);
                }
                if (inputC.getType().toLowerCase() == "select") {
                  //alert(v[k1]);
                    $(inputC).val(v);
                    $(inputC).attr('savedvalue', v);
                    //fix for select2 type control. Expecting all select boxes to be type select2. - Vinod
                    $(inputC).select2();
                }
                if (inputC.getType().toLowerCase() == "ul") {
                  //  alert('in ul');
                    if (v.indexOf(',') >= 0) {
                        var itms = v.split(',');
                        $(inputC).attr('defaultvalues', v);
                        /* for(var j = 0; j < itms.length; j++){
                           $(inputC).append('<li><label style="margin: 5px;"><input type="hidden" value="recipe[' + itms[j] + '"]">' + itms[j] + '</label></li>');
                        } */
                    }
                }
                if (inputC.getType().toLowerCase() == "div") {
                                
                    $(inputC).attr('savedvalue', v)
                    //Set saved values to div.
                    var ctype = '';
                    var csource = '';
                    if ($(inputC).attr('ctype'))
                        ctype = $(inputC).attr('ctype');
                    if ($(inputC).attr('csource'))
                        csource = $(inputC).attr('csource');
                    var divselect1 = v.toString().split(',');
                  //  alert(v[k1]);
                    for (var j = 0; j < divselect1.length; j++) {
                        if (ctype == 'list' && csource != '') {

                            addToTargetList($('#' + csource).clone().val(divselect1[j]));
                        }
                        if (ctype == '')
                            inputC.find('input[value="' + divselect1[j] + '"]').trigger('click');
                        if(ctype == 'checkbox'){
                            inputC.find('input[id="checkbox_' + divselect1[j] + '"]').attr('checked','checked');
                        }
                    }
                }
                inputC = null;

            }
            
        });
        //Force clicking on selects that has dependent controls
         $('[linkedfields]').each(function() {
             $(this).trigger('change');
             var ctrls = $(this).attr('linkedfields').replace(/'/g, "").replace(/]/g, "").replace(/\[/g, "").split(',');
            // alert(ctrls.length);
                for (var i = 0; i < ctrls.length; i++) {
                    var ctrl = $("#" + ctrls[i]);
                    if (ctrl.getType() == "select") {
                        ctrl.val(ctrl.attr('savedvalue'));
                    }
                    if (ctrl.getType() == "div") {
                        var divselect = ctrl.attr('savedvalue').split(',');
                        // alert(divselect.length);
                        for (var j = 0; j < divselect.length; j++) {
                            ctrl.find('input[value="' + divselect[j] + '"]').trigger('click');
                        }
                    }
                }
        });


        //  alert('almost exiting');
        //Setting the unique field with current value
        $('input[unique="true"],select[unique="true"]').each(function() {
           
            $(this).attr('initialvalue', $(this).val());
           
        });
        return (true);
    }//end readform



    function readformnew(formID) {
        var formData = null;
        //    alert("force edit:" + forceEdit);
        //Prefilling dropdowns
        $('select[cdata="catalyst"]').each(function() {

            if ($(this).attr('sourcepath') && $(this).attr('datapath')) {

                if ($(this).attr('linkedfields') || ($(this).attr('linkedfields') == null && $(this).attr('linkedto') == null)) {

                    var tempJSON = JSON.parse(JSON.stringify(readMasterJson($(this).attr('sourcepath'))));
                    var curSelect = $(this);
                  //  alert(JSON.stringify(tempJSON));
                    var _rowid = 0;
                    $.each(tempJSON, function(i, item) {
                        _rowid = item['rowid'];

                        $.each(item,function(k,v){ //columns
                            console.log('1 k:' + k + ' 1 v :' + JSON.stringify(v));
                            if (k == curSelect.attr("id")) {
                                 curSelect.append('<option value="' + v + '" rowid = "' + _rowid + '">' + v + '</option>');
                            }
                        });
                    });
                    // $.each(eval('tempJSON.' + curSelect.attr('datapath')), function(i, item) {
                    //     //     alert(item.field[0].values.value);
                    //     // debugger;
                    //     //Loop to get rowid 
                    //     var _rowid = 0;
                    //     for (var k = 0; k < item.field.length; k++) {
                    //         if (item.field[k].name == "rowid") {
                    //             //curSelect.append('<option value="' + item.field[k].values.value + '">' + item.field[k].values.value + '</option>');
                    //             // alert("Added:" + item.field[i].values.value);
                    //             _rowid = item.field[k].values.value;
                    //         }
                    //     }
                    //     for (var k = 0; k < item.field.length; k++) {
                    //         if (item.field[k].name == curSelect.attr("id")) {
                    //             curSelect.append('<option value="' + item.field[k].values.value + '" rowid = "' + _rowid + '">' + item.field[k].values.value + '</option>');
                    //             // alert("Added:" + item.field[i].values.value);
                    //         }
                    //     }
                    // });
                }
                // debugger;
                if ($(this).attr('linkedfields')) {

                    $(this).change(function() {
                        //  debugger;
                        $('#content').attr('style', "opacity:1;")

                        var curCtrl = $(this);
                        $.each(eval($(this).attr('linkedfields')), function(i, item) {
                            var targetCtrl = $('#' + item);
                            targetCtrl.html('');
                            var opts = getRelatedValues(targetCtrl.attr('sourcepath'), curCtrl.attr("id"), $('#' + curCtrl.attr('id') + ' option:selected').text(), targetCtrl.attr("id"));
                            $.each(eval(opts), function(j, itm) {
                                if (targetCtrl.attr('multiselect'))
                                    addToSelectList(itm, targetCtrl);
                                else
                                    targetCtrl.append('<option value="' + itm + '">' + itm + '</option>');

                            });
                            //fix for select2 control - Vinod 
                            if (targetCtrl.attr('multiselect') == null)
                                targetCtrl.select2();

                        });
                    });

                }
            }

            //alert("Reading" + JSON.stringify(temp));
        });

        $('input[sourcepath][cdata="catalyst"]').each(function() {
            //debugger;
            if ($(this).attr('sourcepath') && $(this).attr('datapath')) {
                var tempJSON = JSON.parse(readMasterJson($(this).attr('sourcepath')));
                var curInput = $(this);
                //   alert(JSON.stringify(tempJSON));

                // $.each(eval('tempJSON.' + curInput.attr('datapath')), function(i, item) {
                //     //     alert(item.field[0].values.value);
                //     // debugger;
                //     for (var k = 0; k < item.field.length; k++) {
                //         if (item.field[k].name == curInput.attr("id")) {
                //             // curSelect.append('<option value="' + item.field[k].values.value + '">' + item.field[k].values.value + '</option>');
                //             // alert("Added:" + item.field[i].values.value);
                //             addToCodeList(item.field[k].values.value, curInput);
                //         }
                //     }
                // });
                $.each(tempJSON, function(i, item) {
                       // _rowid = item['rowid'];

                        $.each(item,function(k,v){ //columns
                            console.log('2 k:' + k + ' 2 v :' + JSON.stringify(v));
                           if (k == curInput.attr("id")) {
                                 addToCodeList(v, curInput);
                            }
                        });
                });
                
            }
        });

        $('div[datatype="select"]').each(function() {
            //debugger;
            if ($(this).attr('linkedfields') || ($(this).attr('linkedfields') == null && $(this).attr('linkedto') == null)) {
                if ($(this).attr('sourcepath') && $(this).attr('datapath')) {
                    var tempJSON = JSON.parse(JSON.stringify(readMasterJson($(this).attr('sourcepath'))));
                    var curInput = $(this);
                    //  alert('div select ' + curInput.attr("id"));
                    $.each(eval('tempJSON.' + curInput.attr('datapath')), function(i, item) {
                        //     alert(item.field[0].values.value);
                        // debugger;
                        for (var k = 0; k < item.field.length; k++) {
                            if (item.field[k].name == curInput.attr("id")) {
                                // curSelect.append('<option value="' + item.field[k].values.value + '">' + item.field[k].values.value + '</option>');
                                // alert("Added:" + item.field[i].values.value);
                                addToSelectList(item.field[k].values.value, curInput);
                            }
                        }
                    });
                }
            }
        });

        // End Prefilling dropdowns
        var formSchema = null;
        var rowid = url.substr(url.indexOf("?") + 1);
        //  alert(orgName);
        var editMode = false;


        // alert("before d4d" + JSON.stringify(d4ddata));
        readMasterRecord(formID,rowid);
        //alert("after d4d" + JSON.stringify(d4ddata));

        /* $.each(d4ddata.sections.section, function (i, item) {
             if (item.name == formName) {
                 formData = item;
             }
         });*/
        
        //get Unique record into d4ddata.



        //Reading row to get schema
        // var formSchema = null;
        // var orgName = url.substr(url.indexOf("?") + 1);
        // //  alert(orgName);
        // var editMode = false;

        formData = d4ddata;

        //alert("here " + JSON.stringify(formData) + ":" + orgName);

        // $.each(formData.rows.row, function(i, item) {
        //     //  alert(item.field.length);
        //     for (i = 0; i < item.field.length; i++) {
        //         //  alert(typeof item.field[i].values.value);
        //         //    alert('Expanded field ' + JSON.stringify(item.field.length) + ":" + orgName.toLowerCase());
        //         if (typeof item.field[i].values.value == "string") {
        //             if (item.field[i].values.value.toLowerCase() == orgName.toLowerCase()) {
        //                 formSchema = item.field;
        //                 editMode = true;
        //                 return (false);
        //             }
        //         }
        //     }
        //     formSchema = item.field;
        // });
        //  alert('Edit Mode:' + editMode);
        
        if(typeof(formData.rowid) != 'undefined'){
            editMode = true;
        }
        if (forceEdit == true) {
            editMode = true;
            formSchema = formData;
        }
        if (editMode == false) {
            return (false);
        }

        //Setting the header of the form to Edit if shown as Create
        var head = $('.widget-header').html().replace('Create', 'Edit').replace('New', 'Edit');
        $('.widget-header').html(head);


        //  debugger;
        //  alert('came here');
        //Read current form values with the field names
        var formSchemaNew = formSchema;



        //Since this section is executed only in edit mode. The rowid field is injected with the rowid
        $('button').attr("rowid", rowid);
        $("button[rowid*='"+"']");


        //   alert(JSON.stringify(formData.rows.row[0].field));

        $.each(formData, function(k,v) {
            var inputC = null;
            console.log('k:' + k + ' v:' + v);
            //Finding the input control to bind.
            if (k.indexOf("_filename") > 0) {
                    k = k.replace('_filename', '');
            }
            if(k.indexOf('_id') < 0){ //ensuring that you do not find an id field
                inputC = $('#' + k);
            }
            if (inputC && $(inputC).attr("id") != undefined) {
                if (inputC.getType().toLowerCase() == "text") {
                    //  alert(inputC.attr("datavalues"));
                    if (inputC.attr("datavalues")) {
                        //var array = v[k1].split(",");
                        $.each(v, function(i) {
                            addToCodeList(v[i]);
                        });
                    } else
                        inputC.val(v);
                }
                if (inputC.getType().toLowerCase() == "file") {
                                //  v[k1]
                   $(inputC).closest('input').next().val(v);
                }
                if (inputC.getType().toLowerCase() == "select") {
                  //alert(v[k1]);
                    $(inputC).val(v);
                    $(inputC).attr('savedvalue', v);
                    //fix for select2 type control. Expecting all select boxes to be type select2. - Vinod
                    $(inputC).select2();
                }
                if (inputC.getType().toLowerCase() == "ul") {
                  //  alert('in ul');
                    if (v.indexOf(',') >= 0) {
                        var itms = v.split(',');
                        $(inputC).attr('defaultvalues', v);
                        /* for(var j = 0; j < itms.length; j++){
                           $(inputC).append('<li><label style="margin: 5px;"><input type="hidden" value="recipe[' + itms[j] + '"]">' + itms[j] + '</label></li>');
                        } */
                    }
                }
                if (inputC.getType().toLowerCase() == "div") {
                                
                    $(inputC).attr('savedvalue', v)
                    //Set saved values to div.
                    var ctype = '';
                    var csource = '';
                    if ($(inputC).attr('ctype'))
                        ctype = $(inputC).attr('ctype');
                    if ($(inputC).attr('csource'))
                        csource = $(inputC).attr('csource');
                    var divselect1 = v.toString().split(',');
                  //  alert(v[k1]);
                    for (var j = 0; j < divselect1.length; j++) {
                        if (ctype == 'list' && csource != '') {

                            addToTargetList($('#' + csource).clone().val(divselect1[j]));
                        }
                        if (ctype == '')
                            inputC.find('input[value="' + divselect1[j] + '"]').trigger('click');
                        if(ctype == 'checkbox'){
                            inputC.find('input[id="checkbox_' + divselect1[j] + '"]').attr('checked','checked');
                        }
                    }
                }
                inputC = null;

            }
            
        });
        //Force clicking on selects that has dependent controls
         $('[linkedfields]').each(function() {
             $(this).trigger('change');
             var ctrls = $(this).attr('linkedfields').replace(/'/g, "").replace(/]/g, "").replace(/\[/g, "").split(',');
            // alert(ctrls.length);
                for (var i = 0; i < ctrls.length; i++) {
                    var ctrl = $("#" + ctrls[i]);
                    if (ctrl.getType() == "select") {
                        ctrl.val(ctrl.attr('savedvalue'));
                    }
                    if (ctrl.getType() == "div") {
                        var divselect = ctrl.attr('savedvalue').split(',');
                        // alert(divselect.length);
                        for (var j = 0; j < divselect.length; j++) {
                            ctrl.find('input[value="' + divselect[j] + '"]').trigger('click');
                        }
                    }
                }
        });


        //  alert('almost exiting');
        //Setting the unique field with current value
        $('input[unique="true"],select[unique="true"]').each(function() {
            // alert($(this).val());
            $(this).attr('initialvalue', $(this).val());
            // alert($(this).attr('initialvalue'));
        });
        return (true);
    }// end readformnew

    function CreateTableFromJsonNew(formID, idFieldName, createFileName) {

        //To Do SAve...
        // var d4djson = $.parseJSON(d4ddata);
        // alert(d4ddata.sections.section[0].name);
        //alert('run');
        var formData = null;
        readMasterJson(formID);

        /*$.each(d4ddata.sections.section, function (i, item) {
            if (item.name == formName) {
                formData = item;
            }
        });*/

        //force setting the idFieldName to "rowid"
        idFieldName = "rowid";

        // alert(JSON.stringify(formData));
        //Reading row to get schema
        formData = d4ddata;

        var formSchema = null;
        $.each(d4ddata, function(i, item) { 
            console.log("Top:" + JSON.stringify(item)); //rows
            var editButton = null;
            var idFieldValue = null;
            var imageTD = null;
            $.each(item,function(k,v){ //columns
                // var inputC = null;
                console.log('k:' + k + ' v :' + JSON.stringify(v));
                if(k == idFieldName){
                        idFieldValue = v;
                }
                inputC = $('.rowtemplate').find("[datafield='" + k + "']");
                if(inputC){
                    inputC.html(v);
                }
            });

            var sRow = $(".rowtemplate").clone();
            sRow.removeClass("hidden");
            sRow.removeClass("rowtemplate");
            // $('#envtable').append(sRow);
            imageTD = $('.rowtemplate').find("[datatype='image']");

            editButton = $('.rowtemplate').find("[title='Update']");

            if(idFieldValue){
                if (imageTD) {
                    if (imageTD.length > 0) {
                        console.log("Template Icon:" + idFieldValue);
                        var imgpath = 'img/blank.png';
                        if (imageTD.html().indexOf('<img') >= 0) {
                            imageTD.html(''); //fix for image tag gettnig embedded. - Vinod
                        } else
                            imgpath = '/d4dMasters/image/' + idFieldValue + '__' + imageTD.attr('datafieldoriginal') + '__' + imageTD.html();

                        imageTD.html('');
                        imageTD.append($('<img src="' + imgpath + '" style="height:28px;width:auto"/>'));

                    }

                }
                if(editButton){
                    editButton.attr("href", "#ajax/Settings/" + createFileName + "?" + idFieldValue);
                    editButton.addClass("tableactionbutton tableactionbuttonpadding");
                    editButton.removeClass('btn-xs');
                    editButton.addClass('btn-sg');
                }
                //importbutton will be present for config management screen.
                var importbutton = $('.rowtemplate').find('a[title="Import Nodes"]');
                // var tdorgname = $('.rowtemplate').find('td[datafield="orgname"]');
                //&& tdorgname.length > 0
                if (importbutton && importbutton.length > 0) {
                    importbutton.attr("href", "#ajax/Settings/chefSync.html?" + idFieldValue);
                    importbutton.removeClass('btn-xs');
                    importbutton.addClass('btn-sg');
                    importbutton.addClass('tableactionbutton');
                }



                //setting the delete button

                var deletebutton = $('.rowtemplate').find("[title='Remove']");
                if (deletebutton) {
                    deletebutton.attr('onClick', 'deleteItem(\"' + formID + '\", \"' + idFieldName + '\",\"' + idFieldValue + '\",this);');
                    deletebutton.removeClass('btn-xs');
                    deletebutton.addClass('btn-sg');
                    deletebutton.addClass('tableactionbutton');
                }
            }


            console.log('-----------');
            var sRow = $(".rowtemplate").clone();
            sRow.removeClass("hidden");
            sRow.removeClass("rowtemplate");
            $('#envtable').append(sRow);

        });
      //  $.each(formData.data.fields, function(i, item) { //row iteration

            // var templateRow = $(".rowtemplate").clone();
            // $.each(item,function(k, v) {
            //     console.log('k:' + k + ',v:' + v);
            // });
            // var sRow = $(".rowtemplate").clone();
            // sRow.removeClass("hidden");
            // sRow.removeClass("rowtemplate");
            // $('#envtable').append(sRow);
            
     //   });

        $(".savespinner").hide();

    }



function saveform(formID) {
    //Validating the form
    if (isFormValid() == false)
        return (false);


    var data1 = new FormData();
    var fileNames = '';
    var orgName = $('#orgname').val();
    var button = $("form[id*='myForm']").find('button');
    
    //alert('orgname' + orgName);
    //Iterate over each input control and get the items
    $('input[cdata="catalyst"],select[cdata="catalyst"]').each(function() {

        if (($(this).prop("type") == "password" || $(this).prop("type") == "text" || $(this).prop("type").indexOf("select") >= 0) && $(this).prop("type") != '') {
            data1.append($(this).prop("id"), $(this).val());
        }
        if ($(this).prop("type") == "file" && orgName != '') {
            if ($(this).get(0).files[0]) {
                // alert('in' + $(this).attr('fixedname'));
                data1.append($(this).prop("id"), $(this).get(0).files[0]);
                if ($(this).attr("fixedname")) {
                   // alert('in' + $(this).attr('fixedname'));
                    data1.append($(this).prop("id") + "_filename", $(this).attr("fixedname"));
                } else
                    data1.append($(this).prop("id") + "_filename", $(this).get(0).files[0].name);

                if (fileNames == '')
                    fileNames = $(this).prop("id");
                else
                    fileNames += ',' + $(this).prop("id");
            }
        }
    });
    // reading  multiselect values

    $('div[cdata="catalyst"]').each(function() {
        var v = [];
        var k = '';
        k = $(this).attr("id");
       // alert('id:' + k);
        $(this).find("input").each(function() {
           // alert($(this).val());
            if ($(this).is(":checked")) {
                //    v.push("\"" + $(this).val() + "\"");
                v.push($(this).val());
            }
        });
        //bg-success
        $(this).find('p[class="bg-success"]').each(function() {
            if ($(this).text() != '') {
                v.push($(this).text());
            }
            /*if ($(this).is(":checked")) {
        //    v.push("\"" + $(this).val() + "\"");
            v.push($(this).val());
          }*/
        });

        //for chef cookbook selections
        if($(this).find('.deploymentSelectedRunList').length > 0)
        {
            var v2 = [];
            $(this).find('input[type="hidden"]').each(function(){
                v2.push("\"" + $(this).val() + "\"");
            });
            //alert('hit on run list' + v2.join(','));
            v.push(v2.join(','));
        }
        if (k != '') {
            //data1.append(k,"[" + v.toString() + "]");
           // alert(v);
            data1.append(k, v);
        }
    });

    //alert(k + ":" + v.toString());


    //Reading UL type of data

    var v1 = [];
    var k1 = '';
    $('ul[cdata="catalyst"]').each(function() {
        k1 = $(this).attr("id");
        var itms = '';
        $(this).find("li input").each(function(key1, value1) {
            // alert($(this).prop("type"));

            // v1.push($(value1).text());
            //v1.push('{\"' + $(this).val() + '\"}');
            if (itms == '') {
                itms = $(this).val();
            } else {
                itms += ',' + $(this).val();
            }

        });
        v1.push('\"' + itms + '\"');

    });

    //alert(k + ":" + v.toString());
    if (k1 != '') {
        //data1.append(k,"[" + v.toString() + "]");
        data1.append(k1, v1);
    }


    //alert(button.attr("rowid"));
    
    //Verifying if the form is in edit mode by checking the rowid provided in the save button.

    if (button.attr("rowid")) {

        
        data1.append("rowid", button.attr("rowid"));
    }

   
    //alert("Length : " + data1.length);
    //data1.append("costcode","[\"code1\",\"code2\",\"code3\"]");
    //setting filenames to null if empty
    if (fileNames == '')
        fileNames = 'null';
    if(typeof(orgname) == 'undefined'){
        orgName = '%2f';
    }
    //alert('This is the data that gets saved:' + JSON.stringify(data1));
   
    console.log('This is the data that gets saved:' + data1['rowid']);
   // alert(serviceURL + "savemasterjsonrownew/" + formID + "/" + fileNames + "/" + orgName );
    $.ajax({
        url: serviceURL + "savemasterjsonrownew/" + formID + "/" + fileNames + "/" + orgName,
        data: data1,
        processData: false,
        contentType: false,
        type: 'POST',
        success: function(data, success) {
            //alert('Successfully Saved'); 
            $(".savespinner").hide();
            if ($('#btncancel'))
                $('#btncancel').click();
            if(parseInt(formID) < 5)
            {
                loadTreeFuncNew(); //this should refresh the tree
            }
            button.removeAttr("rowid", "");
        },
        error: function(jqxhr) {
            alert(jqxhr.status);
        }
    });

}


function saveform_old(formID) {
    $(".savespinner").show();
    $('.widget-box').css('opacity', '1');

    var formData = null;
    //   alert("before d4d" + d4ddata);
    readMasterJson(formID);

    // alert(JSON.stringify(formData));
    //Reading row to get schema
    var formSchema = null;
    var orgName = url.substr(url.indexOf("?") + 1);
    //    alert(orgName);
    var editMode = false;

    formData = d4ddata.masterjson;

    $.each(formData.rows.row, function(i, item) {
        // alert('Expanded field ' + JSON.stringify(item.field[0].values.value.toLowerCase()));
        if (item.field[0].values.value.toLowerCase() == orgName.toLowerCase()) {
            formSchema = item.field;
            editMode = true;
            return (false);
        }
        formSchema = item.field;
    });

    // alert('saving' + JSON.stringify(formSchema));

    //Read current form values with the field names
    if (forceEdit == true)
        editMode = true;

    var formSchemaNew = null;
    if (editMode == false)
        formSchemaNew = JSON.parse(JSON.stringify(formSchema));
    else
        formSchemaNew = formSchema;

    //alert(JSON.stringify(formSchemaNew));

    $.each(formSchemaNew, function(i, item) {
        var inputC = null;
        $.each(item, function(k, v) {
            if (k == "name") {
                inputC = $("#" + v);
                //   alert(v);
                //   alert(inputC == null);
            }
        });
        //    alert(inputC.attr("id"));
        $.each(item, function(k, v) {
            if (k == "values") {
                if (inputC) {
                    $.each(v, function(k1, v1) {
                        //   debugger;
                        if (inputC.attr("datatype")) {
                            //debugger;
                            if (inputC.attr("datatype") == "select") {
                                // v.value.length = 0;
                                // alert(v.value);
                                v.value = '';
                                v.value = [];

                                inputC.find("input").each(function() {
                                    if ($(this).is(":checked")) {
                                        //   debugger;
                                        v.value.push($(this).val());
                                    }
                                    //alert($(this).val());
                                });
                            }

                        } else {
                            if (inputC.getType().toLowerCase() == "password") {
                                //alert(inputC.attr("datavalues"));
                                if (inputC.attr('datavalues')) {

                                    var itms = '';

                                    v1.splice(0, v1.length);
                                    $('.' + inputC.attr('datavalues')).each(function() {
                                        v1.push($(this).val());
                                    });
                                } else
                                    v[k1] = inputC.val();
                            }
                            if (inputC.getType().toLowerCase() == "text") {
                                //alert(inputC.attr("datavalues"));
                                if (inputC.attr('datavalues')) {

                                    var itms = '';

                                    v1.splice(0, v1.length);
                                    $('.' + inputC.attr('datavalues')).each(function() {
                                        v1.push($(this).text());
                                    });
                                    //  alert(v1.length);

                                    // v[k1] = '';
                                    //   v[k1].push(v1);
                                } else
                                    v[k1] = inputC.val();
                            }

                            if (inputC.getType().toLowerCase() == "select") {
                                v[k1] = inputC.val();
                            }
                            if (inputC.getType().toLowerCase() == "file") {
                                if (inputC.attr('keyfield')) {
                                    v[k1] = encodeURIComponent('settings/' + formData.name + '/' + $("#" + inputC.attr('keyfield')).val() + '/' + inputC.attr('id') + '/' + inputC.val());
                                }
                            }
                        }
                    });

                }
                inputC = null;
            }

        });

    });
    //     debugger;
    // alert("Editmode:" + editMode);
    if (editMode == false)
        formData.rows.row.push(JSON.parse('{\"field\":' + JSON.stringify(formSchemaNew) + '}'));

    //uploading all the files prior to saving json.
    $('#frmconfigmanagement').attr("action", serviceURL + "fileupload/" + formID);
    $('#frmconfigmanagement').attr("method", "POST");
    $('#frmconfigmanagement').ajaxForm(function() {
        alert('done');
    });



    //$('.smart-form').attr("action", serviceURL + "fileupload/" + formID);
    //$('.smart-form').attr("method", "POST");
    //$('.smart-form').submit();
    //var data = new FormData($('.smart-form')[0]);
    ////$('input[type="file"]').each(function (i, file) {
    ////    data.append("file-" + i, file);
    ////});
    //alert(data);
    //$.ajax({
    //    type: "post",
    //    mimeType: "multipart/form-data",
    //    dataType: "text",
    //    data: data,
    //    async: false,
    //    processData: false,
    //    contentType: false,
    //    cache: false,
    //    url: serviceURL + "fileupload/" + formID,
    //    success: function (data) {
    //        //alert(data.toString());
    //        alert('Successfully Saved');
    //    },
    //    failure: function (data) {
    //        alert(data.toString());
    //    }
    //});


    // alert("Final Json" + JSON.stringify(formData));
    //Call the nodejs to save the json
    $.ajax({
        type: "post",
        dataType: "text",
        data: formData,
        async: false,
        url: serviceURL + "savemasterjson/" + formID,
        success: function(data) {
            //alert(data.toString());
            // alert('Successfully Saved');
        },
        failure: function(data) {
            alert(data.toString());
        }
    });

    $(".savespinner").hide();
    if ($('#btncancel'))
        $('#btncancel').click();
}

function addToCodeList() {

    var imgCheck = "<i class=\'ace-icon fa fa-check bigger-110 green\' style=\'padding-left:10px;padding-right:10px\'></i>";
    var imgDed = "<button class=\'pull-right bordered btn-danger\' style=\'margin-right:10px\' onClick=\'removeFromCodeList(this);\' ><i class=\'ace-icon fa fa-trash-o bigger-110\'></i></button>";
    if ($('#costcode').val() != '') {
        $('#codelistitems').append('<div class=\'codelistitem \' style=\'margin-top:2px;padding-top:2px;border:1px solid #eeeeee; background-color:#eeeeee !important\'><p class=\'bg-success\'>' + imgCheck + $('#costcode').val() + imgDed + '</p></div>');
        $('#costcode').val('');
        $('.widget-main').css('height', ($('.widget-main').height() + 40) + "px");
        $('#costcode').focus();
    }
}

function addToSelectList(txtVal, inp) {


    var imgCheck = "<i class=\'ace-icon fa fa-check bigger-110 green\' style=\'padding-left:10px;padding-right:10px;visibility:hidden\' ></i>";
    var imgDed = "<button class=\'pull-right bordered btn-danger\' style=\'margin-right:10px\' onClick=\'removeFromCodeList(this);\' ></button>";
    if (txtVal != '') {
        inp.append('<label class=\"toggle font-sm\" ><input onclick=\'if($(this).is(\":checked\")) {$(this).closest(\"label\").css(\"background-color\",\"#eeeeee\");$(this).css(\"border-color\",\"#3b9ff3\");}else{$(this).closest(\"label\").css(\"background-color\",\"#ffffff\");$(this).css(\"border-color\",\"red\");}\' type=\"checkbox\" name=\"checkbox-toggle\" value=\"' + txtVal + '\" style=\"width:100%\"><i data-swchoff-text=\"NO\" data-swchon-text=\"YES\"></i>' + txtVal + '</label>');
        //inp.append('<div class=\'codelistitem\' style=\'margin-top:2px;padding-top:2px;border:1px solid #eeeeee; background-color:#eeeeee !important;height:26px;width:100%;cursor:pointer\'><p class=\'bg-success\'>' + imgCheck + txtVal + '</p></div>');
        $('.widget-main').css('height', ($('.widget-main').height() + 40) + "px");

    }

}

function addToCodeList(txtVal, inp) {

    if (typeof(txtVal) == "undefined" && $('#costcode').val() != '')
        txtVal = $('#costcode').val();

    var imgCheck = "<i class=\'ace-icon fa fa-check bigger-110 green\' style=\'padding-left:10px;padding-right:10px\'></i>";
    var imgDed = "<button class=\'pull-right bordered btn-danger\' style=\'margin-right:10px\' onClick=\'removeFromCodeList(this);\' ><i class=\'ace-icon fa fa-trash-o bigger-110\'></i></button>";
    if (txtVal != '') {
        $('#codelistitems').append('<div class=\'codelistitem\' style=\'margin-top:2px;padding-top:2px;border:1px solid #eeeeee; background-color:#eeeeee !important;height:26px;\'><p class=\'bg-success\'>' + imgCheck + txtVal + imgDed + '</p></div>');
        $('.widget-main').css('height', ($('.widget-main').height() + 40) + "px");
        $('#costcode').focus();
    }
    $('#costcode').val('');
}

function addToTargetList(inputctrl, inputctrl1) {
    if (inputctrl && inputctrl1) {
        if (inputctrl.val() == '' || inputctrl1.val() == '') //validating if both the controls have values
        {
            alert('Ensure you have a title and valid path before adding.');
            inputctrl.focus();
            return;
        }
    }
    if (inputctrl.attr('targetelement')) {
        var imgCheck = "<i class=\'ace-icon fa fa-check\' style=\'padding-left:10px;padding-right:10px\'></i>";
        var imgDed = "<button class=\'pull-right bordered btn-danger\' style=\'margin-right:10px\' onClick=\'return(removeFromCodeList(this";
        if (inputctrl.attr('relatedlist'))
            imgDed += ",\"" + inputctrl.attr('relatedlist') + "\"";
        imgDed += "));\' ><i class=\'ace-icon fa fa-trash-o bigger-110\'></i></button>";
        if (inputctrl.val() != '') {
            // alert('in' + inputctrl.attr('targetelement') + '#' + $(inputctrl).attr('targetelement'));
            if (inputctrl.attr('show').indexOf('imgDed') < 0)
                imgDed = '';
            if (inputctrl.attr('show').indexOf('imgCheck') < 0)
                imgCheck = '';

            $('#' + $(inputctrl).attr('targetelement')).append('<div class=\'codelistitem\' style=\'margin-top:2px;padding-top:2px;border:1px solid #eeeeee; background-color:#eeeeee !important;height:26px;\'><p class=\'bg-success\'>' + imgCheck + inputctrl.val() + imgDed + '</p></div>');
            inputctrl.val('');
            inputctrl.focus();
        }
    }
    if (inputctrl1) {
        if (inputctrl1.attr('targetelement')) {

            var imgCheck = "<i class=\'ace-icon fa fa-check\' style=\'padding-left:10px;padding-right:10px\'></i>";
            var imgDed = "<button class=\'pull-right bordered btn-danger\' style=\'margin-right:10px\' onClick=\'return(removeFromCodeList(this));\' ><i class=\'ace-icon fa fa-trash-o bigger-110\'></i></button>";
            if (inputctrl1.val() != '') {
                // alert('in');
                // alert('in' + inputctrl.attr('targetelement') + '#' + $(inputctrl).attr('targetelement'));
                if (inputctrl1.attr('show').indexOf('imgDed') < 0)
                    imgDed = '';
                if (inputctrl1.attr('show').indexOf('imgCheck') < 0)
                    imgCheck = '';
                $('#' + $(inputctrl1).attr('targetelement')).append('<div class=\'codelistitem\' style=\'margin-top:2px;padding-top:2px;border:1px solid #eeeeee; background-color:#eeeeee !important;height:26px;\'><p class=\'bg-success\'>' + imgCheck + inputctrl1.val() + imgDed + '</p></div>');
                inputctrl1.val('');
                inputctrl1.focus();
            }
        }
    }
}
function loadcookbooksinto(cookbookctrl,chefserverid){
  //  alert( ' yep1 ' + cookbookctrl);

  var csid = $('#' + chefserverid).find('option:selected').attr('rowid');
  $('#chefserverid').val(csid);
    //alert(csid);
    var $servicecookbookspinner = $('.' + cookbookctrl + 'spinner');
    $servicecookbookspinner.removeClass('hidden');
    $.get('/chef/servers/' + csid + '/cookbooks',function(data){
      
      if(data){
        var $servicecookbook = $('#' + cookbookctrl);
        
        $servicecookbook.empty();
        $.each(data,function(k,v){
          $servicecookbook.append('<option value="' + k + '">' + k + '</option>');
     
        });
        //Autoselecting the first item.
        $servicecookbook.val($servicecookbook.find('option:first').val());

        // Loading the saved value back
        if($servicecookbook.attr('savedvalue')){
            $servicecookbook.val($servicecookbook.attr('savedvalue'));
        }
        $servicecookbook.trigger('change');
      }
      $servicecookbookspinner.addClass('hidden');


    });


}
function loadreceipesinto(receipectrls,cookbook,chefserverid,finalfunction){
    if(cookbook){
   
    var csid = $('#' + chefserverid).find('option:selected').attr('rowid');
    $('.receipelistspinner').removeClass('hidden'); 
                   
    $.get('/chef/servers/' + csid + '/receipeforcookbooks/' + cookbook,function(data){
      //  alert('/chef/servers/' + csid + '/receipeforcookbooks/' + cookbook);
      if(data){
         $.each(receipectrls,function(k1,v1){
                var $servicecookbook = $('#' + v1);
                $servicecookbook.html('');
               // $servicecookbook.append('<option value="none">None</option>');
                $.each(data,function(k,v){
                    var recp = data[k].name.substring(0,data[k].name.length-3);
                 //   console.log(k + ":" + recp);
                  $servicecookbook.append('<option value="' +cookbook + '::' + recp + '">' + recp + '</option>');
             
                });
                //Autoselecting the first item.
                $servicecookbook.val($servicecookbook.find('option:first').val());

                // Loading the saved value back
                if($servicecookbook.attr('savedvalue') && $servicecookbook.attr('savedvalue').trim() != '' && $servicecookbook.attr('savedvalue').trim() != 'none'){
                    $servicecookbook.val($servicecookbook.attr('savedvalue'));
                }
                
                $servicecookbook.trigger('change');
                
        });
      }
      $('.receipelistspinner').addClass('hidden');
      loadactioncheckboxes(receipectrls);
      //eval(finalfunction + '([' + receipectrls.toString() +'])');
    });
  }

}

function loadactioncheckboxes(receipectrls){
     $.each(receipectrls,function(k1,v1){
            var $servicecookbook = $('#' + v1);
            var $servicecookbookcheckbox = $('#' + v1 +'checkbox');
            if($servicecookbook && $servicecookbookcheckbox){
                if($servicecookbook.attr('savedvalue').trim() == 'none' || $servicecookbook.attr('savedvalue').trim() == '')
                {
                    $servicecookbookcheckbox.removeAttr('checked');
                }
                else
                    $servicecookbookcheckbox.attr('checked','checked');
            }
     });
}

function removeFromCodeList(btn, div2) {
    if (confirm('Are you sure you wish to remove this?')) {
        var closestDiv = $(btn).closest('div');
        //alert(closestDiv.index());
        if ($('#' + div2 + ' div').length > 0) {
            $('#' + div2 + ' div:nth-child(' + (closestDiv.index() + 1) + ')').detach();
            closestDiv.detach();
        } else
            closestDiv.detach();
    }
    return (false);
}

function validateForm() {
    //Check for required parameter
    $('#orgname').each(function() {
        if ($(this).val() == '') {
            $("#msgOrgName").show();
            return (false);
        }
    });
    return (true);
}


function readURL(input) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();
        reader.onload = function(e) {
            var imgLogoPreview = "<img src='" + e.target.result + "' style='border:0px;height:25px;width:28px'/>";
            $('#logoPreview').empty();
            $('#logoPreview').append(imgLogoPreview);
        }
        reader.readAsDataURL(input.files[0]);
    }
}

$("#id-input-file-2").change(function() {
    readURL(this);
    $(".ace-file-name").attr('data-title', '');
    $(".ace-file-name").html('<i class=" ace-icon fa fa-upload"></i>' + this.files[0].name);

});

function getCount(jsonID) {
    readMasterJson(jsonID);
    var formData = d4ddata.masterjson;
    var count = 0;
    if (formData) {
        count = formData.rows.row.length;
    }
    return (count);
}

function getRelatedValuesForUniqueCheck(jsonID,queryconditionedby){
    var data1 = new FormData();
   // var queryconditionedby  = 'orgname,productgroupname';
    var retData = '';
    if(queryconditionedby != ''){
            var elems = queryconditionedby.split(',');
            var query = '';
            for(var y = 0; y < elems.length; y++){
                data1.append(elems[y],$('#' + elems[y]).val());
            }
        }
     $.ajax({
            url: '/d4dMasters/getListFiltered/' + jsonID,
            data: data1,
            processData: false,
            contentType: false,
            type: 'POST',
            async: false,
            success: function(data,success){
             // alert(data == "Not Found");
              retData = data;
              // if(data == "Not Found")
              //       retData('');
              //   else
              //       return('found');
              //$('#loginname').trigger('blur');
            }
    });
     return(retData);
    // if(queryconditionedby.indexOf('""') < 0){
    //    var data1 = {queryparams:[]};
    //    data1.queryparams.push(queryconditionedby);
    //    // data1.append('queryparams',v);

    //     $.post('/d4dMasters/getListFiltered/' + jsonID,JSON.stringify(data1),function(data){
    //             if(data == "OK")
    //                 return('');
    //             else
    //                 return('found');
    //     });
    // }
    // else
    //     return('');
}


function getRelatedValues(jsonID, comparedField, filterByValue, outputField) {
    readMasterJson(jsonID);
    formData = d4ddata;
    // var comparedField = "orgname";
    //  var filterByValue = "Scholastic";
    //  var outputField = "productgroupname";
    var result = [];
    //debugger;
    // $.each(eval(formData.rows.row), function(i, item) {
    //     $.each(item.field, function(k, item1) {

    //         if (item1.name == comparedField && item1.values.value == filterByValue) {
    //             // alert(item1.values.value);
    //             //found the row, now get the next column
    //             $.each(item.field, function(j, item2) {
    //                 if (item2.name == outputField) {
    //                     //  alert(item2.values.value);
    //                     result.push(item2.values.value);
    //                 }
    //             });
    //         }
    //     });
    // });
    $.each(d4ddata, function(i, item) { 
        if(item[comparedField] == filterByValue){
            result.push(item[outputField]);
        }
    });
    return (result);
}

function getSettingsNavFor(orgName) {
    var getBG = getRelatedValues(2, "orgname", orgName, "productgroupname");
    var getEnv = getRelatedValues(3, "orgname", orgName, "environmentname");
    var getProj = getRelatedValues(4, "orgname", orgName, "projectname");
    var retJson = {
        "Business Group": getBG,
        "Environments": getEnv,
        "Projects": getProj
    };
    return (retJson);

}

function getProjectsForOrg(orgname) {
    var orgname = 'Scholastic';
    var tempJSON = JSON.parse(JSON.stringify(readMasterJson(1)));
    var getProj = null;
    //masterjson.rows.row
    // $.each(eval('tempJSON.masterjson.rows.row'), function(m, n) {
    //     for (var o = 0; o < n.field.length; o++) {
    //         if (n.field[o].values) {
    //             if (n.field[o].values.value == orgname) {
    //                 var getBG = getRelatedValues(2, "orgname", n.field[o].values.value, "productgroupname");
    //                 $.each(getBG, function(i, k) {
    //                     //alert(k);
    //                     getProj = getRelatedValues(4, "productgroupname", k, "projectname");
    //                     //$.each(getProj, function (j, l) {
    //                     //    alert(n.field[o].values.value + ': ' + k + ":" + l);
    //                     //});

    //                 });
    //             }
    //         }
    //     }

    // });
    return (getProj);
}

//function injects a error label for the input control and puts the message
function errormessageforInput(id, msg) {
    // alert(id);
    var errlabel = $('#errmsg_' + id);
    var uniquelbl = $('#unique_' + id);

    var currCtrl = $('#' + id);
    if (errlabel.length > 0) { //no error label found
        errlabel.html(msg);
    } else {
        currCtrl.closest('div').find('label').first().append('<span id="errmsg_' + id + '" style="color:red"></span>');
        errlabel = $('#errmsg_' + id).html(msg);
    }
    //attaching a keydown event to clear the message
    currCtrl.click(function() {
        var el = $('#errmsg_' + id);
        if (el.length > 0) {
            el.html('');
        }
    });

    //hiding any unique messages thrown
    if (uniquelbl.length > 0) {
        uniquelbl.addClass('hidden');
    }
}

//run validation tests on inputs 
function isFormValid() {
    var isValid = true;
     if ($('input[unique="true"], select[unique="true"]').length > 0) {
       // alert('in isFormValid');
        $('input[unique="true"], select[unique="true"]').each(function(){
             $(this).trigger('blur');
              
              if($(this).closest('div').find('span[id*="unique_"]').length > 0 && $(this).closest('div').find('span[id*="unique_"]').text().indexOf('available') < 0){
               // alert('pusing isvalid false');
                isValid = false;
              }
        });
     }


    $('[cat-validation]').each(function(itm) {
        var currCtrl = $(this);
        var valiarr = $(this).attr('cat-validation').split(',');
        //$('#unique_loginname').text().indexOf('NOT') > 0
        if ($('#unique_' + currCtrl.attr('id')).text().indexOf('NOT') > 0) {
            //There is an error message displayed. Do not save form
            isValid = false;
        }
        //alert(currCtrl.attr('id'));
        $.each(valiarr, function(vali) {
            switch (valiarr[vali]) {
                case "required":
                    if (currCtrl.val() == '') {
                        isValid = false;
                        errormessageforInput(currCtrl.attr('id'), "Required");
                        currCtrl.focus();
                    }
                    break;
                case "nospecial":
                    var str = currCtrl.val();
                    if (/^[a-zA-Z0-9_-]*$/.test(str) == false) {
                        isValid = false;
                        errormessageforInput(currCtrl.attr('id'), "special chars not allowed");
                        currCtrl.focus();
                    }
                    break;
                case "max15":
                    if (currCtrl.val().length > 20) {
                        isValid = false;
                        errormessageforInput(currCtrl.attr('id'), "limited to 20 chars");
                        currCtrl.focus();
                    }
                    break;
                 case "nospace":
                    var str = currCtrl.val();
                    if (str.indexOf(' ') > 0) {
                        isValid = false;
                        errormessageforInput(currCtrl.attr('id'), "space(s) not allowed");
                        currCtrl.focus();
                    }
                    break;
                case "numeric":
                    var str = currCtrl.val();
                    if (/^[0-9]*$/.test(str) == false) {
                        isValid = false;
                        errormessageforInput(currCtrl.attr('id'), "non numeric not allowed");
                        currCtrl.focus();
                    }
                    break; //
                case "email":
                    var str = currCtrl.val();
                    if (/^([\w-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([\w-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/.test(str) == false) {
                        isValid = false;
                        //updating error message
                        errormessageforInput(currCtrl.attr('id'), "Email address is required");
                        currCtrl.focus();
                    }
                    break;
            }

        });

    });
    return (isValid);
}

function enableUniqueCheckingForInputs(id) {
    
    if ($('input[unique="true"], select[unique="true"]').length > 0) {

        $('input[unique="true"], select[unique="true"]').blur(function() {
            //Disabling the save button while testing for uniqueness
            //alert('in blue');
            $('button[onclick*="saveform"]').attr('disabled', 'disabled');
            
            var uni = $('#unique_' + $(this).attr("id"));
            if ($(this).attr("initialvalue") != null) {
                if ($(this).attr("initialvalue") == $(this).val()) {
                    if (uni.length > 0)
                        uni.html('');
                    $('button[onclick*="saveform"]').removeAttr('disabled');
                    return (true);
                }
            }
            //alert(typeof uni);
            if (uni.length > 0)
                uni.html('');
            else {
                //alert("in");
                $(this).closest('div').find('label').first().append('<span id="unique_' + $(this).attr("id") + '" style="color:red"></span>');
                uni = $('#unique_' + $(this).attr("id"));
            }
            var queryconditionedby = $(this).attr("uniqueconditionedby");
            if(queryconditionedby)
               { 
                    
                  // alert(queryconditionedby);
                    var getBG = getRelatedValuesForUniqueCheck(id, queryconditionedby);
                    //alert(getBG);
                  //  alert('getBG !=' + getBG);
                   //alert(getBG != "" && uni.attr("id"));
                   if (getBG != 'Not Found') { //this ensures that its present
                       uni.css("color", "red");
                       uni.html('Selected is already registered');
                       $(this).focus();
                   } else {
                       uni.css("color", "green");
                       uni.html('available');
                   }
                }
                $('button[onclick*="saveform"]').removeAttr('disabled');
        });
    }
}

function checkusernameexistsinldap(inputID) {

    if ($('#' + inputID).length > 0) {
        var inp = $('#' + inputID);
        inp.blur(function() {
            //Disabling the save button while testing for uniqueness
            $('button[onclick*="saveform"]').attr('disabled', 'disabled');
            // alert('in');
            var uni = $('#unique_' + inp.attr("id")); //check if the error span is loaded.
            if (uni.length > 0)
                if (uni.html().indexOf('LDAP') > 0) //check if the message is from LDAP check
                    uni.html('');
                else {
                    //alert("in");
                    inp.closest('section').find('label').first().append('<span id="unique_' + inp.attr("id") + '" style="color:red"></span>');
                    uni = $('#unique_' + $(this).attr("id"));
                }
            $.get('/auth/userexists/' + inp.val(), function(data) {
                if (data == "false") {
                    uni.css("color", "red");
                    uni.html('selected is NOT in LDAP.');
                    $(this).focus();
                }
                $('button[onclick*="saveform"]').removeAttr('disabled');
            });


            /*$.ajax({
            type: "get",
            dataType: "ltext",

            async: false,
            url: '/auth/userexists/' + inp.val(),
            success: function (data) {
                // alert(data.toString());  
                // debugger;
                //d4ddata = JSON.parse(data);
               //alert(data);
               alert(uni.html());
               if(data == "false"){
                uni.css("color","red");
                uni.html('selected is NOT in LDAP.');
                $(this).focus(); 
               }
            },
            failure: function (data) {
                // debugger;
                  alert(data.toString());
            }
            });*/
        });
    }
}

//STandby code to receive docker images. To be updated to receive the url from settings
function getDockerTags() {
    var returnValue = '';
    debugger;
    $.ajax({
        type: "get",
        dataType: "text/json",
        async: false,
        url: "https://index.docker.io/v1/repositories/srinivasiyer/liferay_tomcat/tags",
        success: function(data) {
            //alert(data.toString());
            //  alert(data);
            returnValue = data;
        },
        failure: function(data) {
            alert(data.toString());
        }
    });
    return (returnValue);
}

function getDockerImages() {
    var returnValue = '';
    debugger;
    $.ajax({
        type: "get",
        dataType: "text/json",
        async: false,
        url: "https://index.docker.io/v1/search?q=rldevops/mysql",
        success: function(data) {
            //alert(data.toString());
            //  alert(data);
            returnValue = data;
        },
        failure: function(data) {
            alert(data.toString());
        }
    });
    return (returnValue);
}


//Cookbook popup to add to suite list

//1. Will have to remove unwanted rows
//2. Will have to remove unwanted columns
function aggregateTable(tableid, filterColumnNo, filterColumnValue, colsArr) {
    var myRows = [],
        count = 0,
        obj = {};
    var colsCountArr = [];
    var $headers = $("th");
    var $rows = $("#" + tableid + " tr").each(function(index) {

        $cells = $(this).find("td");
        if ($($cells[filterColumnNo]).text() == filterColumnValue) {
            $(colsArr).each(function(i, v) {
                var txt = $($cells[v]).text();
                if (txt != '') {
                    if (obj[v]) {
                        if (obj[v]['data'][txt]) {
                            obj[v]['data'][txt]++;
                        } else {
                            obj[v].count++;
                            obj[v]['data'][txt] = 1;
                        }

                    } else {
                        obj[v] = {
                            "data": {},
                            "count": 1
                        }
                        obj[v]['data'][txt] = 1;
                    }

                }
            })
        }

    });
    console.log(obj);

    //alert('in' + JSON.stringify(obj));

    return obj;
}

