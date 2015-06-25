/*
 -> JSViz <-
 Interactive GraphViz on DHTML

-- MIT License

Copyright (c) 2011-2012 Satoshi Ueyama

Permission is hereby granted, free of charge, to any person obtaining a copy of this
software and associated documentation files (the "Software"), to deal in the Software
without restriction, including without limitation the rights to use, copy, modify, 
merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit
persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or
substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, 
INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE
FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
DEALINGS IN THE SOFTWARE.
*/

(function() {
	function setWorkerSTDIN(txt) {
		postArgMessage(dotWorker, "setWorkerSTDIN", txt); }
	function setupGVContext(opt) {
		postArgMessage(dotWorker, "setupGVContext", opt); }
	function runDotLayout() {
		postArgMessage(dotWorker, "runDotLayout"); }

	var dotWorker = null;
	var progressView = null;
	var stopGo = null;
	var nodePosition = [];
	var minPosition = Number.MAX_VALUE;
	var maxPosition = Number.MIN_VALUE;

	var runOptions = {
		slow: false,
		prog: false
	};

	window.w_launch = function(graph, drawModel) {
		progressView = new JSViz.ProgressView();
		document.body.appendChild(progressView.getElement());
		progressView.autoFit();
		progressView.renderLabel(progressView.g, true, "Prettifying...");
		progressView.show();
		
		dotWorker = new Worker("./js/Liviz/main.js?v=2");
		setupMessageHandler(dotWorker);
		stopGo = new WorkerStopGo.Controller(dotWorker,
			function(){ // stopGo ready
				postArgMessage(dotWorker, "init");
                startDot(graph);
			},
			function() { // worker task complete
				drawModel.onPrettifyComplete(nodePosition);
			});
	};

	function startDot(graph) {
        runOptions.prog = true;
		setWorkerSTDIN(graph);
		setupGVContext(runOptions);
	}

	function afterErrorCheck(param) {
		//errorSink.load(param);
	}
	
	function afterSetupGVContext(param) {
		//progressView.clearAll();
		//appScreen.errorIndicator.update();
		//if (errorSink.countFatal() < 1) {
			stopGo.run();
		//} else {
		//	nextReady();
		//}
	}
	
	function afterRunDotLayout(param) {
		for(var i = 0; i < nodePosition.length; i++)
		{
			var node = document.getElementById(nodePosition[i].name);
			nodePosition[i].x = ((nodePosition[i].x - minPosition)*80) + 400;
			nodePosition[i].y = ((nodePosition[i].y - minPosition) * 80) + 50;

			node.style.left = nodePosition[i].x + "px";
			node.style.top = nodePosition[i].y  + "px";
		}
		
		jsPlumb.repaintEverything();

		progressView.hideWithAnimation();

	}

	function recvProgress(j) {
		var pg = JSViz.ProgressModel.fromJSON(j);
		if (pg.state == PROGRESS_LAYOUT_FINISH) {
			progressView.hideWithAnimation();
			//startAnimationFunc();
		} else {
			progressView.setNext(pg);
			progressView.startAnimation();
		}
	}
	
	function initializeNodePosition(param)
	{		
		minPosition = Math.min(param.x, param.y, minPosition);
		maxPosition = Math.max(param.x, param.y, maxPosition);
		var obj = {
			name: param.name,
			x: param.x,
			y: param.y
		};
		
		nodePosition.push(obj);
		
		//jsPlumb.repaint(param.name);
	}
	
	function setupMessageHandler(wk) {
		wk.addEventListener("message", function(event){
			var etype  = event.data.type;
			var arg0   = event.data.arg0 || null;
			
			switch(etype) {
			case "afterInit":
				//afterInit();
				break;
			case "afterSetupGVContext":
				afterSetupGVContext(JSON.parse(arg0)); break;
			case "afterRunDotLayout":
				afterRunDotLayout(JSON.parse(arg0)); break;
			case "afterErrorCheck":
				afterErrorCheck(JSON.parse(arg0)); break;
			case "sendProgress":
				recvProgress(JSON.parse(arg0)); break;
			case "initializeNodePosition":
				initializeNodePosition(JSON.parse(arg0)); break;
			case "log":
				console.log(arg0); break;
			}
		});
	}
})();
