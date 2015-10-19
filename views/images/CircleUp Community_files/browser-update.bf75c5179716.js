//browser-update.org notification script, <browser-update.org>
//Copyright (c) 2007-2009, MIT Style License <browser-update.org/LICENSE.txt>
(function() {
    "use strict";
    var $buo = function(op,test) {
    var jsv=5;
    var n = window.navigator,b;
    var self = {};


    var updateUrls = {
        "i": "http://windows.microsoft.com/en-us/internet-explorer/download-ie",
        "c": "http://www.google.com/chrome/",
        "s": "http://www.apple.com/safari/download/",
        "f": "http://www.mozilla.org/firefox/new/",
        "x": "http://browser-update.org/update.html"
    };

    self.op=op||{};
    //options
    self.op.l = op.l||n["language"]||n["userLanguage"]||document.documentElement.getAttribute("lang")||"en";
    self.op.vsakt = {i:10,f:21,o:12,s:6,n:20,c:28};
    self.op.vsdefault = {i:9,f:22,o:11,s:5,n:10,c:28};
    self.op.vs =op.vs||self.op.vsdefault;
    for (b in self.op.vsakt)
        if (self.op.vs[b]>=self.op.vsakt[b])
            self.op.vs[b]=self.op.vsakt[b]-0.05;

    if (!op.reminder || op.reminder<0.1 )
        self.op.reminder=0;
    else
        self.op.reminder=op.reminder||24;

    self.op.onshow = op.onshow||function(o){};
    self.op.url= op.url||"http://browser-update.org/update.html";
    self.op.pageurl = op.pageurl || window.location.hostname || "unknown";
    self.op.newwindow=op.newwindow||false;

    self.op.test=test||op.test||false;
    if (window.location.hash=="#test-bu")
        self.op.test=true;

    var names={i:'Internet Explorer',f:'Firefox',o:'Opera',s:'Apple Safari',n:'Netscape Navigator', c:"Chrome", x:"Other"};
    function getBrowser() {
        var n,v,t,ua = navigator.userAgent;
        if (/bot|googlebot|slurp|mediapartners|adsbot|silk|android|phone|bingbot|google web preview|like firefox|chromeframe|seamonkey|opera mini|min|meego|netfront|moblin|maemo|arora|camino|flot|k-meleon|fennec|kazehakase|galeon|android|mobile|iphone|ipod|ipad|epiphany|rekonq|symbian|webos/i.test(ua)) n="x";
        else if (/Trident.(\d+\.\d+)/i.test(ua)) n="io";
        else if (/MSIE.(\d+\.\d+)/i.test(ua)) n="i";
        else if (/Chrome.(\d+\.\d+)/i.test(ua)) n="c";
        else if (/Firefox.(\d+\.\d+)/i.test(ua)) n="f";
        else if (/Version.(\d+.\d+).{0,10}Safari/i.test(ua))	n="s";
        else if (/Safari.(\d+)/i.test(ua)) n="so";
        else if (/Opera.*Version.(\d+\.?\d+)/i.test(ua)) n="o";
        else if (/Opera.(\d+\.?\d+)/i.test(ua)) n="o";
        else if (/Netscape.(\d+)/i.test(ua)) n="n";
        else return {n:"x",v:0,t:names[n]};
        if (n=="x") return {n:"x",v:0,t:names[n]};
        
        v=new Number(RegExp.$1);
        if (n=="so") {
            v=((v<100) && 1.0) || ((v<130) && 1.2) || ((v<320) && 1.3) || ((v<520) && 2.0) || ((v<524) && 3.0) || ((v<526) && 3.2) ||4.0;
            n="s";
        }
        if (n=="i" && v==7 && window.XDomainRequest) {
            v=8;
        }
        if (n=="io") {
            n="i";
            if (v>5) v=10;
            else if (v>4) v=9;
            else if (v>3.1) v=8;
            else if (v>3) v=7;
            else v=9;
        }	
        return {n:n,v:v,t:names[n]+" "+v}
    }

    self.op.browser=getBrowser();
    if (!self.op.test && (!self.op.browser || !self.op.browser.n || self.op.browser.n=="x" || self.op.browser.n=="c" || document.cookie.indexOf("browserupdateorg=pause")>-1 || self.op.browser.v>self.op.vs[self.op.browser.n]))
        return;


    if (!self.op.test) {
        var i = new Image();
    }

    if (self.op.reminder>0) {
        var d = new Date(new Date().getTime() +1000*3600*self.op.reminder);
        document.cookie = 'browserupdateorg=pause; expires='+d.toGMTString()+'; path=/';
    }
    var ll=self.op.l.substr(0,2);
    var languages = "de,en";
    if (languages.indexOf(ll)!==false)
        self.op.url="http://browser-update.org/"+ll+"/update.html#"+jsv;
    var tar="";
    if (self.op.newwindow)
        tar=' target="_blank"';

    function busprintf() {
        var args=arguments;
        var data = args[ 0 ];
        for( var k=1; k<args.length; ++k ) {
            data = data.replace( /%s/, args[ k ] );
        }
        return data;
    }

    var t = "You're using an unsupported version of %s and some features on CircleUp may not work properly. Please <a%s>download a newer version</a>";

    if (op.text)
        t = op.text;

    //self.op.text=busprintf(t,names[self.op.browser.n],' href="'+self.op.url+'"'+tar);
    self.op.text=busprintf(t,names[self.op.browser.n],' href="' + updateUrls[self.op.browser.n] + '" ' + tar);

    var div = document.createElement("div");
    self.op.div = div;
    div.id="buorg";
    div.className="buorg alert alert-block";
    div.innerHTML= '<div>' + self.op.text + '<div id="buorgclose">x</div></div>';

    var sheet = document.createElement("style");
    //sheet.setAttribute("type", "text/css");
    var style = ".buorg {position:relative;z-index:111111;\
    width: 96%; top:20px; left:0px; height: 35px; \
    text-align:left; cursor:pointer; \
    font-family: Arial,Helvetica,sans-serif; color:#000; font-size: 16px;}\
    .buorg div { padding:5px 36px 5px 40px; } \
    .buorg a,.buorg a:visited  {color:#E25600; text-decoration: underline;}\
    #buorgclose { position: absolute; right: .5em; top:.2em; height: 20px; width: 12px; font-weight: bold;font-size:14px; padding:0; }";

    document.body.insertBefore(div,document.body.firstChild);
    document.getElementsByTagName("head")[0].appendChild(sheet);
    try {
        sheet.innerText=style;
        sheet.innerHTML=style;
    }
    catch(e) {
        try {
            sheet.styleSheet.cssText=style;
        }
        catch(e) {
            return;
        }
    }
    var me=self;
    div.onclick=function(){
        if (me.op.newwindow)
            window.open(me.op.url,"_blank");
        else
            window.location.href=me.op.url;
        return false;
    };
    div.getElementsByTagName("a")[0].onclick = function(e) {
        var e = e || window.event;
        if (e.stopPropagation) e.stopPropagation();
        else e.cancelBubble = true;
        return true;
    }

    self.op.bodymt = document.body.style.marginTop;
    document.body.style.marginTop = (div.clientHeight)+"px";
    document.getElementById("buorgclose").onclick = function(e) {
        var e = e || window.event;
        if (e.stopPropagation) e.stopPropagation();
        else e.cancelBubble = true;
        me.op.div.style.display="none";
        document.body.style.marginTop = me.op.bodymt;
        return true;
    }
    op.onshow(self.op);

    }
    var $buoop = $buoop||{};
    var $bu=$buo($buoop);

    // always show for debugging
    // $buo({},true);
})();
