$(function(){
  
  // creating a global namespace
  if(!window.DEVOPS) {
  	window.DEVOPS = {};
  }
  
  var navigation = {};
   
  var $actions = $('.page_nav'); 

  var $next_btn = $actions.find('a[href="#next"]');
  var $prev_btn = $actions.find('a[href="#previous"]');
  var $finish_btn = $actions.find('a[href="#finish"]');
  var $tabsNavBar = $('.nav-tabs');
  var $tabsList = $tabsNavBar.find('li');

  
  
  var nextBtnClickEvt =null;
  var prevBtnClickEvt =null;
  var finishBtnClickEvt =null;

  // adding events 
  $next_btn.click(function(e){

    var $currentActiveTab = $tabsList.filter('.active');
    var clickHandler = $currentActiveTab.data('clickHandler');
    showNextTab();
    DEVOPS.navigation.setContentOnCurrentTab('<img class="center-block" style="height:50px;width:50px;margin-top: 10%;" src="img/loading.gif" />');
    if(typeof clickHandler === 'function') {
      var $activeA = $tabsNavBar.find('li.active a');
      var tabContentId = $activeA.attr('href');
      clickHandler(e,$(tabContentId).get(0));
    }  
  });
  
  $prev_btn.click(function(e){
  	showPreviousTab();
  });

  $finish_btn.click(function(e){
  	if(typeof finishBtnClickEvt === 'function') {
    	finishBtnClickEvt();
    } 
  });

  function showBtn($btn) {
     $btn.parent().show();
  }

  function hideBtn($btn) {
  	$btn.parent().hide();
  }


  navigation.setContentOnCurrentTab = function(content) {
    var $activeA = $tabsNavBar.find('li.active a');
    var tabContentId = $activeA.attr('href');
    $(tabContentId).empty().append(content);

  };

  navigation.setNextBtnClickHandler = function(clickEvent) {
     var $currentActiveTab = $tabsList.filter('.active');
     $currentActiveTab.data('clickHandler',clickEvent);
     //nextBtnClickEvt = clickEvent;
  };

  
  navigation.setFinishBtnClickHandler = function(clickEvent) {
     finishBtnClickEvt = clickEvent;
  };

  navigation.showFirstTab = function(content) {
    $($tabsList.get(0)).find('a:first').tab('show');
    displayNavigationBtn();
    this.setContentOnCurrentTab(content);
  }

  
  function displayNavigationBtn() {
    //for navigation btn
     $currActiveTab = $tabsList.filter('.active');
     if($currActiveTab.next().length == 0 ) {
       hideBtn($next_btn);
       showBtn($finish_btn);
     } else {
       showBtn($next_btn);
       hideBtn($finish_btn);
     } 

     if($currActiveTab.prev().length != 0 ) {
       showBtn($prev_btn);
     } else {
       hideBtn($prev_btn);
     } 
  }


  var showNextTab = function() {
    
    var $currActiveTab = $tabsList.filter('.active');
    if($currActiveTab.length == 0) {
      console.log("opening first tab");
      $($tabsList.get(0)).find('a:first').tab('show');
    } else {
        $currActiveTab.next().find('a:first').tab('show');
    } 
    displayNavigationBtn();
    
  };

  var showPreviousTab = function() {
    var $currActiveTab = $tabsList.filter('.active');
    if($currActiveTab.length != 0) {
      $currActiveTab.prev().find('a:first').tab('show');
    } 
    displayNavigationBtn();
  }

  /*navigation.showPreviousTab = function() {

  };*/   

  /*
  navigation.showNextBtn = function(clickEvent) {
     nextBtnClickEvt = clickEvent;
     showBtn($next_btn);
  };
  
  navigation.showPreviousBtn = function(clickEvent) {
     prevBtnClickEvt = clickEvent;
     showBtn($prev_btn);
  };
  
  navigation.showFinishBtn = function(clickEvent) {
     finishBtnClickEvt = clickEvent;
     showBtn($finish_btn);
  };
 */
  navigation.hideAllBtns = function() {
      hideBtn($next_btn);
      hideBtn($prev_btn);
      hideBtn($finish_btn);
  };
  navigation.displayNavigationBtn = displayNavigationBtn;

  window.DEVOPS.navigation = navigation; 

});