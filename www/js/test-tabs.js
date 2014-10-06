require(["../dijit/layout/TabContainer", "../dijit/layout/ContentPane", "../dojo/domReady!"], function(TabContainer, ContentPane){
    var tc = new TabContainer({
        style: "height: 100%; width: 100%;"
    }, "tc1-prog");

    var cp1 = new ContentPane({
        title: "First Tab",
        content: "We offer amazing food"
    });
    tc.addChild(cp1);

    var cp2 = new ContentPane({
        title: "Second Tab",
        content: "We are known for our drinks."
    });
    tc.addChild(cp2);

    var cp3 = new ContentPane({
        title: "Third Tab",
        content: "This Tab has the attribute 'selected: true' set.",
        selected: true
    });
    tc.addChild(cp3);

    tc.startup();
});