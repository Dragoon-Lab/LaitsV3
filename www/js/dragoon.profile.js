var profile = (function(){
	var testResourceRe = /^dragoon\/tests\//,

		copyOnly = function(filename, mid){
			var list = {
				"dragoon/dragoon.profile":1,
				"dragoon/package.json":1
			};
			return (mid in list) ||
				/^dojo\/_base\/config\w+$/.test(mid) ||
				(/^dojo\/resources\//.test(mid) && !/\.css$/.test(filename)) ||
				/(png|jpg|jpeg|gif|tiff)$/.test(filename) ||
				/built\-i18n\-test\/152\-build/.test(mid);
		};
		isExcluded = function(filename, mid){
			return /^dragoon\/DojoNodeEditor\/\w+/.test(mid) ||
			/^dragoon\/examples\/\w+/.test(mid) ||
			/^dragoon\/json\/\w+/.test(mid)||
			/^dragoon\/xml\/\w+/.test(mid);
		};
	return {
		resourceTags:{
			test: function(filename, mid){
				return testResourceRe.test(mid);
			},

			copyOnly: function(filename, mid){
				return copyOnly(filename, mid);
			},

			amd: function(filename, mid) {
				return /\.js$/.test(filename);
			},

			miniExclude: function(filename, mid){
				return isExcluded(filename, mid);
			}
		}
	};
})();
