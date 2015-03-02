
/*Binding Click events to Containers*/

function initializeContainer(){
    $('.Containers').click(function(e){
        //debugger;
        var getbreadcrumbul = $('#ribbon').find('.breadcrumb').find('li:lt(5)');
        var getbreadcrumbullength = getbreadcrumbul.length;
        var DummyBreadCrumb;
        if(getbreadcrumbullength > 0)
        {
            //alert(getbreadcrumbullength);
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
            DummyBreadCrumb += '>' + 'Containers';

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
            //$('#ribbon').find('.breadcrumb').append('<li>"'+ DummyBreadCrumb'"</li>');
            //alert(DummyBreadCrumb);
        }

    });
}
