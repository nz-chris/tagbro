exports.pad = function(pad, str, padLeft) {
    if (typeof str === "undefined")
        return pad;
    if (padLeft) {
        return (pad + str).slice(-pad.length);
    } else {
        return (str + pad).substring(0, pad.length);
    }
};

exports.log = function(message) {
    console.log(message);
};

exports.err = function(message) {
    console.error(message);
};