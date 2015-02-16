/**
 * author anshul
 */

$.fn.modalCollapse = function() {

    return this.each(function() {
        var $minBtn = $('<a href="javascript:void(0)">-</a>');
        $this = $(this);
        $this.find('.modal-header').append($minBtn);
        
        $minBtn.click(function(e) {
            $this.hide();
            var $ModalBackdrop = $('.modal-backdrop').detach();
            $maxBtnContainer = $('<div></div>');
            $maxBtnContainer.css({
               position:'absolute',
               'background-color':'green'
            });
            $maxBtn = $('<a href="javascript:void(0)">+</a>');
            $maxBtnContainer.append($maxBtn);
            $maxBtn.click(function(){
            	$(document.body).append($ModalBackdrop);
            	$this.show();
            	$maxBtnContainer.remove();
            });
            $(document.body).append($maxBtnContainer);
        });
    });

};