define(['../app', 'lodash', 'jquery'],
function(app) {
	app
	.directive('bonjourRipple',[function(){
		return {
			restrict: 'A',
			link: function(scope,element,attr){
				var parent, ink, d, x, y;
				$(element).click(function(e){
					parent = $(this).parent();
					//create .ink element if it doesn't exist
					if(parent.find(".ink").length == 0)
						parent.prepend("<span class='ink'></span>");
						
					ink = parent.find(".ink");
					//incase of quick double clicks stop the previous animation
					ink.removeClass("animate");
					
					//set size of .ink
					if(!ink.height() && !ink.width()) {
						//use parent's width or height whichever is larger for the diameter to make a circle which can cover the entire element.
						d = Math.max(parent.outerWidth(), parent.outerHeight());
						ink.css({height: d, width: d});
					}
					
					//get click coordinates
					//logic = click coordinates relative to page - parent's position relative to page - half of self height/width to make it controllable from the center;
					x = e.pageX - parent.offset().left - ink.width()/2;
					y = e.pageY - parent.offset().top - ink.height()/2;
					
					//set the position and add class .animate
					ink.css({top: y+'px', left: x+'px'}).addClass("animate");
				})
			}
		}
	}])
	.directive('bonjourText',['user',function(user) {
		return {
			restrict: 'A',
			link: function($scope,elem,attrs) {
				elem[0].style.width = elem[0].parentElement.clientWidth;
				elem.bind('keydown', function(e) {
				var code = e.keyCode || e.which;
				if ((code === 13) && !(e.shiftKey)) {
					e.preventDefault();
					if($scope.commentMessage){
						$scope.unreadCommentsCount = 0;
						user.postComment(attrs.topicId,$scope.commentMessage);
						$scope.commentMessage = "";
					}
				}
			});
		}
	  }
	}])
	.directive('autoScroll',['$location','$timeout','currentTopicId','user', function ($location,$timeout,currentTopicId,user) {
		return {
			restrict: 'A',
			link: function (scope, element, attr) {
				var commentListing = document.querySelector(".bonjour-comment-listing");
				if (scope.$last === true) {
					$timeout(function () {
						if(typeof scope.$parent.selected.topic.opened === "undefined" || currentTopicId==null || currentTopicId!=scope.$parent.selected.topic.id){
							scope.$parent.selected.topic.opened = false;
							currentTopicId=scope.$parent.selected.topic.id;
						}
						if(scope.$parent.selected.topic.opened == false){
							commentListing.scrollTop = commentListing.scrollHeight;
							scope.$parent.selected.topic.opened = true;
						}
						else{
							if((commentListing.scrollHeight-commentListing.scrollTop) < 900)
								commentListing.scrollTop = commentListing.scrollHeight;
						}
					},200);
				}

				commentListing.onscroll = function(e){
					if(e.target.scrollTop==0){
						var loadMorePromise = user.loadMoreComments();
						scope.$parent.loadMoreLoading = true;
						var lastSeenId = scope.$parent.selected.topic.comments[0].id;
						loadMorePromise.then(function(){
							scope.$parent.loadMoreLoading = false;
							$location.hash('comment-'+lastSeenId);
						})
					}
				}
			}
		}
	}])
	.directive('containerHeight',function($timeout){
	  return{
	    restrict:'A',
	    link:function(scope,elem,attrs){
	       $timeout(function(){
	         elem[0].style.height = window.innerHeight-64;
	         document.querySelector('.bonjour-room-listing').style.height = window.innerHeight-64-48;
	         document.querySelector('.bonjour-topic-listing').style.height = window.innerHeight-64-48;
	         document.querySelector('.bonjour-comment-listing').style.height = window.innerHeight-64-48-30;
	       },0);
	       window.onresize = function(){
	          console.log('room resize');
	       	 elem[0].style.height = window.innerHeight-64;
	       	 document.querySelector('#comment').style.width = document.querySelector('#comment').parentElement.clientWidth;
	         document.querySelector('.bonjour-room-listing').style.height = window.innerHeight-64-48;
	         document.querySelector('.bonjour-topic-listing').style.height = window.innerHeight-64-48;
	         document.querySelector('.bonjour-comment-listing').style.height = window.innerHeight-64-48-30;
	       }
	  	}
	  } 
	}).filter('fileup',function(){

		// for matching the [file] [/file] tag
		var rgx = /^\[file\].*\[\/file\]/;
		// for matching the file type extension
		var rgx_type = /\.([0-9a-z]+)(?:[\?#]|$)/i;

		return function(text){
			if(text.match(rgx)){
				var raw = text.match(rgx)[0].substring(7).slice(0,-8);
				var node = '[.'+raw.match(rgx_type)[1]+' file] ';
				var filename = (raw.match(/[^\\/]+\.[^\\/]+$/) || []).pop();
				return node+'<a href="'+raw+'" target="_blank"/>'+filename+'</a>';
			}else{
				return text;
			}
		}
	});
});
