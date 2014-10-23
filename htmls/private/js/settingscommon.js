function deleteItem(docid, key, value,button) {

    if (confirm('You are about to remove this item \" ' + $(button).closest('tr').find('td').first().html() + ' \"')) {

        $.ajax({
            type: "get",
            dataType: "text",

            async: false,
            url: serviceURL + "removeitem/" + docid + "/" + key + "/" + value,
            success: function (data) {
                // alert(data.toString());  
                // debugger;
                //d4ddata = JSON.parse(data);
               // $('#refreshpage').click();
                $(button).closest('tr').detach();

                var tab = 'envtable';
                $('#' + tab).dataTable();
            },
            failure: function (data) {
                // debugger;
                //  alert(data.toString());
            }
        });
    }

}

function readMasterJson(id) {
    // debugger;
    $.ajax({
        type: "get",
        dataType: "text",

        async: false,
        url: serviceURL + "readmasterjson/" + id,
        success: function (data) {
       //      alert(data.toString());  
            // debugger;
            d4ddata = JSON.parse(data);
        },
        failure: function (data) {
            // debugger;
            //  alert(data.toString());
        }
    });
    return (d4ddata);
}

$.fn.getType = function () { return this[0].tagName == "INPUT" ? this[0].type.toLowerCase() : this[0].tagName.toLowerCase(); }

function CreateTableFromJson(formID,idFieldName,createFileName) {

    //To Do SAve...
    // var d4djson = $.parseJSON(d4ddata);
    // alert(d4ddata.sections.section[0].name);
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
    $.each(formData.rows.row, function (i, item) {

        var templateRow = $(".rowtemplate").clone();
        $.each(item.field, function (i, item) {


            var inputC = null;
            var editButton = null;
            var setOrgname = false;
            $.each(item, function (k, v) {
                if (k == "name") {
                    // alert(v);
                    inputC = $('.rowtemplate').find("[datafield='" + v + "']");
                    if (v == idFieldName) {
                        setOrgname = true;
                    }
                }
            });
            $.each(item, function (k, v) {
                if (k == "values") {
                    // alert(JSON.stringify(v));
                    if (inputC) {
                        //  alert(inputC.text());
                        //   inputC.html('test');
                        var tv = '';
                        $.each(v, function (k1, v1) {
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
                            $.each(v, function (k1, v1) {
                                if (tv == '')
                                    tv += v1;
                                else
                                    tv += ",&nbsp;" + v1;
                            });
                            if(imageTD){
                                if(imageTD.length > 0){
                                    var imgpath = '/d4dMasters/image/' + tv + '__' + imageTD.attr('datafieldoriginal')  + '__' + imageTD.html();
                                    imageTD.html('');
                                    imageTD.append($('<img src="' + imgpath + '" style="height:28px;width:auto"/>'));
                                }
                            }
                            editButton.attr("href", "#ajax/Settings/" + createFileName + "?" + tv);
                            editButton.addClass("tableactionbutton tableactionbuttonpadding");
                            editButton.removeClass('btn-xs');
                            editButton.addClass('btn-sg');
                            //importbutton will be present for config management screen.
                            var importbutton = $('.rowtemplate').find('a[title="Import Nodes"]');
                           // var tdorgname = $('.rowtemplate').find('td[datafield="orgname"]');
                            //&& tdorgname.length > 0
                            if(importbutton.length > 0 ){
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

var forceEdit = false; //variable used to force save one record ex. Authentication
//Create & Edit form functions

function readform(formID) {
    var formData = null;
  //  alert("force edit:" + forceEdit);
    //Prefilling dropdowns
    $('select').each(function () {

        if ($(this).attr('sourcepath') && $(this).attr('datapath')) {
            
            if ($(this).attr('linkedfields') || ($(this).attr('linkedfields') == null && $(this).attr('linkedto') == null)) {
                
                var tempJSON = JSON.parse(JSON.stringify(readMasterJson($(this).attr('sourcepath'))));
                var curSelect = $(this);
               //    alert(JSON.stringify(tempJSON));
                $.each(eval('tempJSON.' + curSelect.attr('datapath')), function (i, item) {
                    //     alert(item.field[0].values.value);
                    // debugger;
                    for (var k = 0; k < item.field.length; k++) {
                        if (item.field[k].name == curSelect.attr("id")) {
                            curSelect.append('<option value="' + item.field[k].values.value + '">' + item.field[k].values.value + '</option>');
                            // alert("Added:" + item.field[i].values.value);
                        }
                    }
                });
            }
            // debugger;
            if ($(this).attr('linkedfields')) {

                $(this).change(function () {
                    //  debugger;
                    var curCtrl = $(this);
                    $.each(eval($(this).attr('linkedfields')), function (i, item) {
                        var targetCtrl = $('#' + item);
                        targetCtrl.html('');
                        var opts = getRelatedValues(targetCtrl.attr('sourcepath'), curCtrl.attr("id"), $('#' + curCtrl.attr('id') + ' option:selected').text(), targetCtrl.attr("id"));
                        $.each(eval(opts), function (j, itm) {
                            if (targetCtrl.attr('multiselect'))
                                addToSelectList(itm, targetCtrl);
                            else
                                targetCtrl.append('<option value="' + itm + '">' + itm + '</option>');
                        });


                    });
                });

            }
        }

        //alert("Reading" + JSON.stringify(temp));
    });

    $('input[sourcepath]').each(function () {
        //debugger;
        if ($(this).attr('sourcepath') && $(this).attr('datapath')) {
            var tempJSON = JSON.parse(readMasterJson($(this).attr('sourcepath')));
            var curInput = $(this);
            //   alert(JSON.stringify(tempJSON));
            $.each(eval('tempJSON.' + curInput.attr('datapath')), function (i, item) {
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

    $('div[datatype="select"]').each(function () {
        //debugger;
        if ($(this).attr('linkedfields') || ($(this).attr('linkedfields') == null && $(this).attr('linkedto') == null)) {
            if ($(this).attr('sourcepath') && $(this).attr('datapath')) {
                var tempJSON = JSON.parse(JSON.stringify(readMasterJson($(this).attr('sourcepath'))));
                var curInput = $(this);
              //  alert('div select ' + curInput.attr("id"));
                $.each(eval('tempJSON.' + curInput.attr('datapath')), function (i, item) {
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
    //   alert("after d4d" + JSON.stringify(d4ddata));

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

    $.each(formData.rows.row, function (i, item) {
      //  alert(item.field.length);
        for(i = 0; i < item.field.length; i++){
          //  alert(typeof item.field[i].values.value);
        //    alert('Expanded field ' + JSON.stringify(item.field.length) + ":" + orgName.toLowerCase());
            if(typeof item.field[i].values.value == "string"){
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
    if (forceEdit == true){
        editMode = true;
        formSchema = formData.rows.row[0].field;
    }
    if (editMode == false) {
        return (false);
    }

    //Setting the header of the form to Edit if shown as Create
    var head = $('.widget-header').html().replace('Create','Edit').replace('New','Edit');
    $('.widget-header').html(head);


  //  debugger;
  //  alert('came here');
    //Read current form values with the field names
    var formSchemaNew = formSchema;



    //Since this section is executed only in edit mode. The rowid field is injected with the rowid
    $('button[onclick*="saveform"]').attr("rowid",orgName);


 //   alert(JSON.stringify(formData.rows.row[0].field));

    $.each(formSchemaNew, function (i, item) {
        var inputC = null;
        $.each(item, function (k, v) {
               // alert("k & v:" + k + ":" + v);
                if (k == "name" && v != "rowid") {
                    if(v.indexOf("_filename") > 0)
                    {
                        v = v.replace('_filename','');
                    }
                    inputC = $("#" + v);
                }
           
        });
       // alert($(inputC).attr("id"));
        $.each(item, function (k, v) {
            if (k == "values") {
                if (inputC) {
                    $.each(v, function (k1, v1) {
                        if (inputC.getType().toLowerCase() == "text") {
                            //  alert(inputC.attr("datavalues"));
                            if (inputC.attr("datavalues")) {
                                //var array = v[k1].split(",");
                                $.each(v[k1], function (i) {
                                    addToCodeList(v[k1][i]);
                                });
                            }
                            else
                                inputC.val(v[k1]);
                        }

                        if (inputC.getType().toLowerCase() == "file") {
                            //  v[k1]
                            $(inputC).closest('div').next().val(v[k1]);
                        }
                        if (inputC.getType().toLowerCase() == "select") {
                            $(inputC).val(v[k1]);
                            $(inputC).attr('savedvalue',v[k1]);
                        }
                        if (inputC.getType().toLowerCase() == "ul") {
                            if(v[k1].indexOf(',') >= 0){
                                var itms = v[k1].split(',');
                                
                                for(var j = 0; j < itms.length; j++){
                                    $(inputC).append('<li><label style="margin: 5px;"><input type="hidden" value="recipe[' + itms[j] + '"]">' + itms[j] + '</label></li>');
                                }
                            }
                        }
                        if (inputC.getType().toLowerCase() == "div") {
                            $(inputC).attr('savedvalue',v[k1])
                            //Set saved values to div.
                            var divselect1 = v[k1].split(',');
                            for(var j = 0; j < divselect1.length; j++){
                                inputC.find('input[value="' + divselect1[j] + '"]').trigger('click');
                              }
                        }
                    });
                }
                inputC = null;
            }
        });
    });
    //Force clicking on selects that has dependent controls
    $('[linkedfields]').each(function(){
      $(this).trigger('change');
      var ctrls = $(this).attr('linkedfields').replace(/'/g,"").replace(/]/g,"").replace(/\[/g,"").split(',');
      for(var i = 0; i < ctrls.length; i++){
        var ctrl = $("#" + ctrls[i]);
        if(ctrl.getType() == "select"){
          ctrl.val(ctrl.attr('savedvalue'));
        }
        if(ctrl.getType() == "div"){
          var divselect = ctrl.attr('savedvalue').split(',');
         // alert(divselect.length);
          for(var j = 0; j < divselect.length; j++){
            ctrl.find('input[value="' + divselect[j] + '"]').trigger('click');
          }
        }
      }
    });


  //  alert('almost exiting');
    //Setting the unique field with current value
    $('input[unique="true"]').each(function(){
       // alert($(this).val());
        $(this).attr('initialvalue',$(this).val());
       // alert($(this).attr('initialvalue'));
    });
    return (true);
}


function saveform(formID){
    //Validating the form
    if(isFormValid() == false)
        return(false);

    
    var data1 = new FormData();
    var fileNames = '';
    orgName = $('#orgname').val();

    //Iterate over each input control and get the items
    $('input[cdata="catalyst"],select[cdata="catalyst"]').each(function(){
        // alert($(this).prop("type"));
          if(($(this).prop("type") == "text" || $(this).prop("type").indexOf("select") >= 0) && $(this).prop("type") != '')
          {
            data1.append($(this).prop("id"),$(this).val());
         //   alert("this alert "+ $(this).prop("id") + ":" + $(this).val())
          }
          if($(this).prop("type") == "file" && orgName != '')
          {
            if($(this).get(0).files[0]){
                data1.append($(this).prop("id"),$(this).get(0).files[0]);
                data1.append($(this).prop("id") + "_filename",$(this).get(0).files[0].name);
                if(fileNames == '')
                    fileNames = $(this).prop("id");
                else
                    fileNames += ',' + $(this).prop("id");
            }
          }
    });
    // reading  multiselect values
    var v = [];
    var k = '';
    $('div[cdata="catalyst"]').each(function (){
       k =  $(this).attr("id");
      $(this).find("input").each(function (){
         // alert($(this).prop("type"));
          if ($(this).is(":checked")) {
        //    v.push("\"" + $(this).val() + "\"");
            v.push($(this).val());
          }
      });
      //bg-success
      $(this).find('p[class="bg-success"]').each(function (){
          if($(this).text() != ''){
             v.push($(this).text());
          }
          /*if ($(this).is(":checked")) {
        //    v.push("\"" + $(this).val() + "\"");
            v.push($(this).val());
          }*/
      });
    });

    //alert(k + ":" + v.toString());
    if(k != ''){
        //data1.append(k,"[" + v.toString() + "]");
        data1.append(k,v);
    }

    //Reading UL type of data

    var v1 = [];
    var k1 = '';
    $('ul[cdata="catalyst"]').each(function (){
       k1 =  $(this).attr("id");
      $(this).find("li").each(function (key1,value1){
         // alert($(this).prop("type"));
        
            v1.push($(value1).text());
          
      });
      
    });

    //alert(k + ":" + v.toString());
    if(k1 != ''){
        //data1.append(k,"[" + v.toString() + "]");
        data1.append(k1,v1);
    }


    
    //Verifying if the form is in edit mode by checking the rowid provided in the save button.
    if($('button[onclick*="saveform"]').attr("rowid") != null){
       // alert("in edit");
        data1.append("rowid",$('button[onclick*="saveform"]').attr("rowid"));
    }
    //alert("Length : " + data1.length);
    //data1.append("costcode","[\"code1\",\"code2\",\"code3\"]");
    //setting filenames to null if empty
    if(fileNames == '')
        fileNames = 'null';
    //console.log(data1);
  //  alert(serviceURL + "savemasterjsonrow/" + formID + "/" + fileNames + "/" + orgName );
    $.ajax({
            url:serviceURL + "savemasterjsonrow/" + formID + "/" + fileNames + "/" + orgName,
            data:data1,
            processData: false,
            contentType: false,
            type: 'POST',
            success:function(data,success){
              //alert('Successfully Saved'); 
                $(".savespinner").hide();
                if($('#btncancel'))
                        $('#btncancel').click();
                },
            error:function(jqxhr){
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

    $.each(formData.rows.row, function (i, item) {
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

    $.each(formSchemaNew, function (i, item) {
        var inputC = null;
        $.each(item, function (k, v) {
            if (k == "name") {
                inputC = $("#" + v);
                //   alert(v);
                //   alert(inputC == null);
            }
        });
    //    alert(inputC.attr("id"));
        $.each(item, function (k, v) {
            if (k == "values") {
                if (inputC) {
                    $.each(v, function (k1, v1) {
                        //   debugger;
                        if (inputC.attr("datatype")) {
                            debugger;
                            if (inputC.attr("datatype") == "select") {
                                // v.value.length = 0;
                                // alert(v.value);
                                v.value = '';
                                v.value = [];
                                
                                inputC.find("input").each(function () {
                                    if ($(this).is(":checked")) {
                                        //   debugger;
                                        v.value.push($(this).val());
                                    }
                                    //alert($(this).val());
                                });
                            }

                        }
                        else {
                            if (inputC.getType().toLowerCase() == "password") {
                                //alert(inputC.attr("datavalues"));
                                if (inputC.attr('datavalues')) {

                                    var itms = '';

                                    v1.splice(0, v1.length);
                                    $('.' + inputC.attr('datavalues')).each(function () {
                                        v1.push($(this).val());
                                    });
                                }
                                else
                                    v[k1] = inputC.val();
                            }
                            if (inputC.getType().toLowerCase() == "text") {
                                //alert(inputC.attr("datavalues"));
                                if (inputC.attr('datavalues')) {

                                    var itms = '';

                                    v1.splice(0, v1.length);
                                    $('.' + inputC.attr('datavalues')).each(function () {
                                        v1.push($(this).text());
                                    });
                                    //  alert(v1.length);

                                    // v[k1] = '';
                                    //   v[k1].push(v1);
                                }
                                else
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
    $('#frmconfigmanagement').ajaxForm(function () { alert('done'); });



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
        success: function (data) {
            //alert(data.toString());
           // alert('Successfully Saved');
        },
        failure: function (data) {
            alert(data.toString());
        }
    });

    $(".savespinner").hide();
    if($('#btncancel'))
        $('#btncancel').click();
}

function addToCodeList() {

    var imgCheck = "<i class=\'ace-icon fa fa-check bigger-110 green\' style=\'padding-left:10px;padding-right:10px\'></i>";
    var imgDed = "<button class=\'pull-right bordered btn-danger\' style=\'margin-right:10px\' onClick=\'removeFromCodeList(this);\' ><i class=\'ace-icon fa fa-trash-o bigger-110\'></i></button>";
    if ($('#costcode').val() != '') {
        $('#codelistitems').append('<div class=\'codelistitem \' style=\'margin-top:2px;padding-top:2px;border:1px solid #eeeeee; background-color:#eeeeee !important\'><p class=\'bg-success\'>' + imgCheck + $('#costcode').val() + imgDed + '</p></div>'); $('#costcode').val('');
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

    if (typeof (txtVal) == "undefined" && $('#costcode').val() != '')
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

function removeFromCodeList(btn) {
    if (confirm('Are you sure you wish to remove this Cost Code?')) {
        var closestDiv = $(btn).closest('div');
        closestDiv.detach();
    }
}

function validateForm() {
    //Check for required parameter
    $('#orgname').each(function () {
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
        reader.onload = function (e) {
            var imgLogoPreview = "<img src='" + e.target.result + "' style='border:0px;height:25px;width:28px'/>";
            $('#logoPreview').empty();
            $('#logoPreview').append(imgLogoPreview);
        }
        reader.readAsDataURL(input.files[0]);
    }
}

$("#id-input-file-2").change(function () {
    readURL(this);
    $(".ace-file-name").attr('data-title', '');
    $(".ace-file-name").html('<i class=" ace-icon fa fa-upload"></i>' + this.files[0].name);

});

function getCount(jsonID){
    readMasterJson(jsonID);
    var formData = d4ddata.masterjson;
    var count = 0;
    if(formData){
        count = formData.rows.row.length;
    }
    return(count);
}

function getRelatedValues(jsonID, comparedField, filterByValue, outputField) {
    readMasterJson(jsonID);
    formData = d4ddata.masterjson;
    // var comparedField = "orgname";
    //  var filterByValue = "Scholastic";
    //  var outputField = "productgroupname";
    var result = [];
    //debugger;
    $.each(eval(formData.rows.row), function (i, item) {
        $.each(item.field, function (k, item1) {

            if (item1.name == comparedField && item1.values.value == filterByValue) {
                // alert(item1.values.value);
                //found the row, now get the next column
                $.each(item.field, function (j, item2) {
                    if (item2.name == outputField) {
                        //  alert(item2.values.value);
                        result.push(item2.values.value);
                    }
                });
            }
        });
    });
    return (result);
}

function getSettingsNavFor(orgName) {
    var getBG = getRelatedValues(2, "orgname", orgName, "productgroupname");
    var getEnv = getRelatedValues(3, "orgname", orgName, "environmentname");
    var getProj = getRelatedValues(4, "orgname", orgName, "projectname");
    var retJson = { "Business Group": getBG, "Environments": getEnv, "Projects": getProj };
    return (retJson);

}

function getProjectsForOrg(orgname){
    var orgname = 'Scholastic';
    var tempJSON = JSON.parse(JSON.stringify(readMasterJson(1)));
    var getProj = null;
    //masterjson.rows.row
    $.each(eval('tempJSON.masterjson.rows.row'), function (m, n) {
        for (var o = 0; o < n.field.length; o++) {
            if (n.field[o].values) {
                if (n.field[o].values.value == orgname) {
                    var getBG = getRelatedValues(2, "orgname", n.field[o].values.value, "productgroupname");
                    $.each(getBG, function (i, k) {
                        //alert(k);
                        getProj = getRelatedValues(4, "productgroupname", k, "projectname");
                        //$.each(getProj, function (j, l) {
                        //    alert(n.field[o].values.value + ': ' + k + ":" + l);
                        //});

                    });
                }
            }
        }

    });
    return (getProj);
}

//function injects a error label for the input control and puts the message
function errormessageforInput(id,msg){
   // alert(id);
    var errlabel = $('#errmsg_' + id);
    var uniquelbl = $('#unique_' + id);

    var currCtrl = $('#' + id);
    if(errlabel.length > 0){ //no error label found
        errlabel.html(msg);
    }
    else
    {
        currCtrl.closest('section').find('label').first().append('<span id="errmsg_' + id + '" style="color:red"></span>');
        errlabel = $('#errmsg_' + id).html(msg);
    }
    //attaching a keydown event to clear the message
    currCtrl.click(function(){
        var el = $('#errmsg_' + id);
        if(el.length > 0){
            el.html('');
        }
    });

    //hiding any unique messages thrown
    if(uniquelbl.length > 0){
        uniquelbl.addClass('hidden');
    }
}

//run validation tests on inputs 
function isFormValid(){
    var isValid = true;
    $('[cat-validation]').each(function(itm){
      var currCtrl = $(this);
      var valiarr = $(this).attr('cat-validation').split(',');
      //$('#unique_loginname').text().indexOf('NOT') > 0
      if($('#unique_' + currCtrl.attr('id')).text().indexOf('NOT') > 0){
        //There is an error message displayed. Do not save form
        isValid = false;
      }
      //alert(currCtrl.attr('id'));
      $.each(valiarr,function(vali){
        switch(valiarr[vali]){
          case "required":
            if(currCtrl.val() == ''){
              isValid = false;
              errormessageforInput(currCtrl.attr('id'),"required");
              currCtrl.focus();
            }
            break;
          case "nospecial":
            var str = currCtrl.val();
            if(/^[a-zA-Z0-9- ]*$/.test(str) == false) {
                isValid = false;
                errormessageforInput(currCtrl.attr('id'),"special chars not allowed");
                currCtrl.focus();
            }
            break;
          case "numeric":
            var str = currCtrl.val();
            if(/^[0-9]*$/.test(str) == false) {
                isValid = false;
                errormessageforInput(currCtrl.attr('id'),"non numeric not allowed");
                currCtrl.focus();
            }
            break; //
          case "email":
            var str = currCtrl.val();
            if(/^([\w-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([\w-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/.test(str) == false) {
                isValid = false;
                errormessageforInput(currCtrl.attr('id'),"not a valid email address");
                currCtrl.focus();
            }
            break; 
        }
        
      });
      
    });
    return(isValid);
}

function enableUniqueCheckingForInputs(id){
  

  if($('input[unique="true"], select[unique="true"]').length > 0) {

    $('input[unique="true"], select[unique="true"]').blur(function(){
        //Disabling the save button while testing for uniqueness
        $('button[onclick*="saveform"]').attr('disabled','disabled');

          var uni = $('#unique_' + $(this).attr("id"));
          if($(this).attr("initialvalue") != null){
            if($(this).attr("initialvalue") == $(this).val()){
                if(uni.length > 0)
                     uni.html('');
                return(true);
            }
          }
          //alert(typeof uni);
          if(uni.length > 0)
            uni.html('');
          else{
             //alert("in");
              $(this).closest('section').find('label').first().append('<span id="unique_' + $(this).attr("id") + '" style="color:red"></span>');
              uni = $('#unique_' + $(this).attr("id"));
          }
          var getBG = getRelatedValues(id, $(this).attr("id"), $(this).val(), $(this).attr("id"));
          //alert(getBG != "" && uni.attr("id"));
          if(getBG != ""){ //this ensures that its present
            uni.css("color","red");
            uni.html('selected is already registered');
            $(this).focus();
          }
          else{
            uni.css("color","green");
            uni.html('available');
          }
          $('button[onclick*="saveform"]').removeAttr('disabled');
        });
    }
}

function checkusernameexistsinldap(inputID){
    
    if($('#' + inputID).length > 0){
        var inp = $('#' + inputID);
        inp.blur(function(){
            //Disabling the save button while testing for uniqueness
            $('button[onclick*="saveform"]').attr('disabled','disabled');
           // alert('in');
            var uni = $('#unique_' + inp.attr("id")); //check if the error span is loaded.
            if(uni.length > 0)
                if(uni.html().indexOf('LDAP') > 0) //check if the message is from LDAP check
                    uni.html('');
              else{
                 //alert("in");
                  inp.closest('section').find('label').first().append('<span id="unique_' + inp.attr("id") + '" style="color:red"></span>');
                  uni = $('#unique_' + $(this).attr("id"));
            }
            $.get('/auth/userexists/' + inp.val(),function(data){
                    if(data == "false"){
                        uni.css("color","red");
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
function getDockerTags(){
    var returnValue = '';
    debugger;
    $.ajax({
        type: "get",
        dataType: "text/json",
        async: false,
        url: "https://index.docker.io/v1/repositories/srinivasiyer/liferay_tomcat/tags",
        success: function (data) {
            //alert(data.toString());
          //  alert(data);
            returnValue = data;
        },
        failure: function (data) {
            alert(data.toString());
        }
    });
    return(returnValue);
}

function getDockerImages(){
    var returnValue = '';
    debugger;
    $.ajax({
        type: "get",
        dataType: "text/json",
        async: false,
        url: "https://index.docker.io/v1/search?q=rldevops/mysql",
        success: function (data) {
            //alert(data.toString());
          //  alert(data);
            returnValue = data;
        },
        failure: function (data) {
            alert(data.toString());
        }
    });
    return(returnValue);
}


//Cookbook popup to add to suite list

//1. Will have to remove unwanted rows
//2. Will have to remove unwanted columns
function aggregateTable(tableid,filterColumnNo,filterColumnValue,colsArr){
    var myRows = [],count = 0, obj = {};
    var colsCountArr = [];
    var $headers = $("th");
    var $rows = $("#"+tableid+" tr").each(function(index) {

      $cells = $(this).find("td");
      if($($cells[filterColumnNo]).text() == filterColumnValue){
        $(colsArr).each(function(i,v){
          var txt = $($cells[v]).text();
          if(txt != ''){
            if(obj[v]){
              if(obj[v]['data'][txt]){
                obj[v]['data'][txt]++;
              }else{
                obj[v].count++;
                obj[v]['data'][txt] = 1;
              }

            }else{
              obj[v] = {
                "data" : {},
                "count" : 1
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
