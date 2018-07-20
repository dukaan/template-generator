export var MandatoryAttributes = {
    "issue": [],
    "cover": [],
    "article": [],
    "contents": [],
    "title": [],
    "coverImage": ["src"],
    "image": ["src"],
    "section": [],
    "text": [],
    "gallery": [],
    "slider": [],
    "slide": []
};
export var AttributeEnumerations = {
    "issue": {},
    "cover": {},
    "article": {},
    "contents": {},
    "title": {"alignment": {"left": "Left", "center": "Center", "right": "Right"}},
    "coverImage": {},
    "image": {"margin": {"fullbleed": "fullbleed", "small": "Small", "large": "Large"}},
    "section": {},
    "text": {},
    "gallery": {},
    "slider": {},
    "slide": {}
};
export var HierarchyConstraints = {
    "issue": [{forbid: []}],
    "cover": [{forbid: []}],
    "article": [{forbid: ["section"]}],
    "contents": [{forbid: []}],
    "title": [{forbid: []}],
    "coverImage": [{forbid: []}],
    "image": [{forbid: []}],
    "section": [{forbid: []}],
    "text": [{forbid: []}],
    "gallery": [{forbid: []}],
    "slider": [{forbid: []}],
    "slide": [{forbid: []}]
};
export var HiddenTypeAttributes = {
    "issue": [],
    "cover": [],
    "article": [],
    "contents": [],
    "title": [],
    "coverImage": ["margin"],
    "image": [],
    "section": [],
    "text": ["alignment"],
    "gallery": [],
    "slider": [],
    "slide": []
};
export var RichtextConfig = {
    plugins: "textcolor colorpicker link paste fullscreen code allcaps nocaps",
    paste_as_text: true,
    toolbar: ['fullscreen removeformat | bold italic underline | forecolor link | alignleft aligncenter alignright | allcaps nocaps'],
    fontsize_formats: "118px 106px 94px 82px 70px 65px 60px 55px 50px 45px 40px 33px 28px 25px 20px",
    textcolor_map: [
        "000000", "Black",
        "FFFFFF", "White",
    ],
    background: '#cccccc',
};

export var MediaAttributes = {
    "*": {src: ["image"]}
};

export var ImageCroppingConfiguration = {
    "Free A/R": "NaN",
    "Square": 1,
    "4:3": 4 / 3,
    "3:4": 3 / 4,
    "3:2": 3 / 2,
    "2:3": 2 / 3,
    "16:9": 16 / 9,
    "9:16": 9 / 16,
};

export var TemplateAssets = [];