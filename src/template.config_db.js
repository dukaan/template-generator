var booleanOffOn = {'false':'no', 'true':'yes' };
var backgroundColors = { 'white' : 'White', 'gray' : 'Light Gray' };
var aspects = { 'wide' : 'Wide Both', 'tall' : 'Tall Both', 'tallPhone' : 'Tall Phone / Wide Tablet', 'tallTablet' : 'Wide Phone / Tall Tablet' };

export var AttributeEnumerations = {
	opener : {fade: booleanOffOn},
	section : {backgroundColor: backgroundColors},
	subsection : {border: booleanOffOn, backgroundColor: backgroundColors},
	tabbedSubsection : {backgroundColor: backgroundColors},
	webview : {aspect: aspects}
};

export var MandatoryAttributes = {
	article : ['title', 'alias'],
	openerImage : ['src'],
	image : ['src'],
	tocThumbnail : ['src'],
	topicIcon : ['src'],
	moreArticleImage : ['src'],
	topic : ['topicTitle'],
	tab : ['tabIconActive', 'tabIconInactive'],
	webview : ['webSrc'],
	spacer : ['height'],
	openerVideo: ['videoSrc'],
	moreArticle: ['jumpTo']
};

export var HierarchyConstraints = {
	article : [
   		{ forbid : [  ] }
   	]
};

export var HiddenTypeAttributes = {
	article: [ ]
};

var RichtextConfig = {
	plugins: "textcolor colorpicker link paste fullscreen code allcaps nocaps",
	paste_as_text: true,
	toolbar : ['styleselect | fullscreen removeformat | bold italic underline | forecolor link | alignleft aligncenter alignright | allcaps nocaps'],
	fontsize_formats: "118px 106px 94px 82px 70px 65px 60px 55px 50px 45px 40px 33px 28px 25px 20px",
	textcolor_map: [
		"000000", "Black",
		"FFFFFF", "White",
	],
	background : '#cccccc',
	style_formats: [
		{ title : '180px'  , block : 'p', styles: { 'font-size': '180px', 'line-height': '200px' } },
		{ title : '160px'  , block : 'p', styles: { 'font-size': '160px', 'line-height': '176px' } },
		{ title : '140px'  , block : 'p', styles: { 'font-size': '140px', 'line-height': '154px' } },
		{ title : '120px'  , block : 'p', styles: { 'font-size': '120px', 'line-height': '132px' } },
		{ title : '110px'  , block : 'p', styles: { 'font-size': '110px', 'line-height': '120px' } },
		{ title : '100px'  , block : 'p', styles: { 'font-size': '100px', 'line-height': '110px' } },
		{ title : '96px'  , block : 'p', styles: { 'font-size': '96px', 'line-height': '104px' } },
		{ title : '80px'  , block : 'p', styles: { 'font-size': '80px', 'line-height': '88px' } },
		{ title : '70px'  , block : 'p', styles: { 'font-size': '70px', 'line-height': '76px' } },
		{ title : '60px'  , block : 'p', styles: { 'font-size': '60px', 'line-height': '66px' } },
		{ title : '50px'  , block : 'p', styles: { 'font-size': '50px', 'line-height': '54px' } },
		{ title : '45px'  , block : 'p', styles: { 'font-size': '45px', 'line-height': '50px' } },
		{ title : '40px'  , block : 'p', styles: { 'font-size': '40px', 'line-height': '44px' } },
		{ title : '36px body'  , block : 'p', styles: { 'font-size': '36px', 'line-height': '48px' } },
		{ title : '36px'  , block : 'p', styles: { 'font-size': '36px', 'line-height': '40px' } },
		{ title : '32px'  , block : 'p', styles: { 'font-size': '32px', 'line-height': '36px' } },
		{ title : '30px'  , block : 'p', styles: { 'font-size': '30px', 'line-height': '34px' } },
		{ title : '28px'  , block : 'p', styles: { 'font-size': '28px', 'line-height': '32px' } },
		{ title : '24px'  , block : 'p', styles: { 'font-size': '24px', 'line-height': '26px' } },
		{ title : '16px'  , block : 'p', styles: { 'font-size': '16px', 'line-height': '18px' } },
]
};

var MediaAttributes = {
	"*" : { src : ["image" ] }
};

var ImageCroppingConfiguration = {
	"Free A/R" : "NaN",
	"Square" : 1,
	"4:3" : 4/3,
	"3:4" : 3/4,
	"3:2" : 3/2,
	"2:3" : 2/3,
	"16:9" : 16/9,
	"9:16" : 9/16,
};

var TemplateAssets = [];
