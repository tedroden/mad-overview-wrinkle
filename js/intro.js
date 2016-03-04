
var anagrams = ["A Wrinkled View Mover",
				// "Mad Overview Wrinkle",
				"Wavelike Word Vermin",
				"A Window Verve Milker",
				"Marveled Wive Ink Row",
				"Marveled Wire Kin Vow",
				"Learned View Vim Work",
				"Remade Liver Wink Vow",
				"Evader Milker Win Vow",
				"Married Evil Knew Vow",
				"Invader Were Milk Vow",
				"Arrived Ween Milk Vow",
				"Arrived Winkle Em Vow",
				"Waived Nerve Ilk Worm"
			   ];


app.controller('IntroCtrl',
			   ['$scope', '$sce',
				function($scope, $sce) {
					$scope.anagram = anagrams[Math.floor(Math.random() * anagrams.length)];
					$scope.title = "Live Markdown Viewer";
					$scope.appName = "Mad Overview Wrinkle";

					var TIMEOUT = 100;

					var handleAnagram = function() {
						console.log("in handleAnagram");						
						var sortOrder = [];
						while(sortOrder.length < $scope.title.length) {
							for(var i = 0; i < $scope.title.length; ++i) {
								var r = Math.floor(Math.random() * $scope.title.length);
								if(sortOrder.indexOf(r) === -1) {
									sortOrder.push(r);
								}
							}
						}
						
						var updateAnagram = function(s) {
							try {
								$scope.$apply(function() {
									$scope.anagram = s;
								});
							}
							catch(e) {}
						};

						var redo = function() {
							var i = sortOrder.pop();
							if(i != undefined) {
								if($scope.anagram[i] != $scope.title[i]) {
									var letter = $scope.title[i]; 
									updateAnagram($scope.anagram.slice(0, i) + letter + $scope.anagram.slice(i + 1));
								}
								setTimeout(redo, TIMEOUT);							
							}
							else {
								updateAnagram($scope.title);
								console.log($scope.title + " !=  " + $scope.appName);
								if($scope.title != $scope.appName) {
									$scope.title = $scope.appName;
									setTimeout(redo, 500);
								}
							}
						};
						setTimeout(redo, 500);
					};

					
					
					// console.log(sortOrder);
					handleAnagram();
					// setTimeout(handleAnagramredo, 500);
					console.log("OK");
				}]);

