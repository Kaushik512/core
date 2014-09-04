function deleteItem(docid, key, value) {

    if (confirm('You are about to remove this itemstgdsfh ' + docid + ':' + key + ':' + value)) {
        $.ajax({
            type: "get",
            dataType: "text",

            async: false,
            url: serviceURL + "removeitem/" + docid + "/" + key + "/" + value,
            success: function (data) {
                // alert(data.toString());  
                // debugger;
                //d4ddata = JSON.parse(data);
                $('#refreshpage').click();
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

    alert(JSON.stringify(formData));
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
                        editButton = $('.rowtemplate').find("[title='Update']");
                        if (editButton) {
                            var tv = '';
                            $.each(v, function (k1, v1) {
                                if (tv == '')
                                    tv += v1;
                                else
                                    tv += ",&nbsp;" + v1;
                            });

                            editButton.attr("href", "index.html#ajax/Settings/" + createFileName + "?" + tv);
                            //setting the delete button

                            var deletebutton = $('.rowtemplate').find("[title='Remove']");
                            if (deletebutton) {
                                deletebutton.attr('onClick', 'deleteItem(\"4\", \"' + idFieldName + '\",\"' + tv + '\");');
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
                alert('div select ' + curInput.attr("id"));
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



    //  alert("before d4d" + JSON.stringify(d4ddata));
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

   // alert(JSON.stringify(formData));

    $.each(formData.rows.row, function (i, item) {
        // alert('Expanded field ' + JSON.stringify(item.field[0].values.value.toLowerCase()));
        if (item.field[0].values.value.toLowerCase() == orgName.toLowerCase()) {
            formSchema = item.field;
            editMode = true;
            return (false);
        }
        formSchema = item.field;
    });

    if (forceEdit == true){
        editMode = true;
        formSchema = formData.rows.row[0].field;
    }
    if (editMode == false) {
        return (false);
    }
  //  debugger;
  //  alert('came here');
    //Read current form values with the field names
    var formSchemaNew = formSchema;

 //   alert(JSON.stringify(formData.rows.row[0].field));

    $.each(formSchemaNew, function (i, item) {
        var inputC = null;
        $.each(item, function (k, v) {
            if (k == "name") {
                inputC = $("#" + v);
            }
        });
      //  alert($(inputC).attr("id"));
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
                        }
                        if (inputC.getType().toLowerCase() == "select") {
                            $(inputC).val(v[k1]);
                        }
                    });
                }
                inputC = null;
            }
        });
    });

    return (true);
}

var forceEdit = false; //variable used to force save one record ex. Authentication

function saveform(formID) {
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

    alert(JSON.stringify(formSchemaNew));

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


     alert("Final Json" + JSON.stringify(formData));
    //Call the nodejs to save the json
    $.ajax({
        type: "post",
        dataType: "text",
        data: formData,
        async: false,
        url: serviceURL + "savemasterjson/" + formID,
        success: function (data) {
            //alert(data.toString());
            alert('Successfully Saved');
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