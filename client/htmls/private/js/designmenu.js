$(document).ready(function(){
    $("#tree-toggler").bind("click",
        function() {
            //$("body").hasClass("close-tree") ? $("body").removeClass("close-tree") : $("body").addClass("close-tree");
            if($("body").hasClass("close-tree") ){
                $("body").removeClass("close-tree");
                $("aside").css("width","254px");
                $("#main").css("margin-left","254px");
                $("ul#blueprints > li > a > span").show();
                $("ul#blueprints > li > a > b").show();
            } else{
                $("body").addClass("close-tree");
                $("aside").css("width","50px");
                $("#main").css("margin-left","50px");
                $("ul#blueprints > li > a > span").hide();
                $("ul#blueprints > li > a > b").hide();
            }
    });

    function loadProviderJSON(){
        $.ajax({
            url: '../allproviders/list',
            success: function(data) {
                addChildItems(data);                
            }
        });
    }
    function addChildItems(data){
        var children = $("#designTree").children();

        for(var i=0;i<children.length;i++){
            var id=$(children[i]).attr('data-ref');
            var _link = $(children[i]).attr('data-link');

            if(data[id]){
                var temp=data[id];                
                if(data[id].length > 0){
                    var $itemList=$('<ul class="sub-menu"></ul>');
                    $(temp).each(function(index,object){
                        $itemList.append($('<li id="'+object.providerName+'" class="childItem" data-id="'+object._id+'"><a href="#'+_link+index+'"><span class="title">'+object.providerName+'</span></a></li>'));
                    });
                    $(children[i]).append($itemList);
                }
            }
        }
        initTree($('#designTree'), data);
    };
    function initTree(treeParent, data){
        var lastSelected='';
        var childList=$(treeParent).children('li');
        var selectedProvider="";
        for(var i=0;i<childList.length;i++){
            $(childList[i]).attr('treeIndex','id_'+i).find('ul').find('li').each(function(index,value){
                $(this).attr('treeIndex','id_'+i+'_'+index);
            });
        };
        $(treeParent).children("li.treeItem").on('click', function(e){
            if(lastSelected === $(this).attr('treeIndex')){
                if( $(this).hasClass("open") ){
                    $(this).removeClass("open");
                }else{
                    $(this).addClass("open");    
                }
                
                lastSelected=$(this).attr('treeIndex');
            }else{
                lastSelected=$(this).attr('treeIndex');
                $(treeParent).children("li.treeItem").removeClass('open activ');
                var a=$(this).addClass('open activ').find('li').eq(0).find('a');
            }
        });
        $(treeParent).find('li.childItem').find('a').click(function(e){
            e.stopPropagation();
            $(treeParent).find('li.childItem').find('a').removeClass('itemSelected');
            $(this).addClass('itemSelected');

            var $parentLiElm = $(this).parent().parent().parent();
            var dataId = $(this).parent().attr('data-id');

            if(data[$parentLiElm.attr('data-ref')]){
                var iteminfo = data[$parentLiElm.attr('data-ref')];

                $(iteminfo).each(function(index,_d){
                    if(_d._id === dataId){
                        selectedProvider = _d;
                    }
                });
            }
            $(treeParent).children("li.treeItem").removeClass('activ open');
            $parentLiElm.addClass('activ open');

        });
    }
    loadProviderJSON(); 
});

//function ends