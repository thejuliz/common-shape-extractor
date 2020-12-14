var processedInputList = [];
var processingFileCount = 0;
var processedFileCount = 0;

var processedPixelArray = undefined;

var output = document.getElementById("result");

window.onload = function () {
    //Check File API support
    if (window.File && window.FileList && window.FileReader) {
        var filesInput = document.getElementById("files");

        filesInput.addEventListener("change", function (event) {

            var files = event.target.files; //FileList object
            processingFileCount = files.length;

            for (var i = 0; i < files.length; i++) {
                var file = files[i];

                //Only pics
                if (!file.type.match('image'))
                    continue;

                var picReader = new FileReader();

                picReader.addEventListener("load", function (event) {

                    var picFile = event.target;

                    var image = new Image();
                    image.src = picFile.result;

                    image.onload = function () {
                        // access image size here 
                        var canvas = document.createElement("canvas");
                        canvas.width = this.width;
                        canvas.height = this.height;
                        canvas.getContext('2d').drawImage(this, 0, 0, this.width, this.height);

                        if (processedPixelArray === undefined) {
                            processedPixelArray = new Array(this.width);
                        }
                        var imgArr = new Array(this.width);

                        for (var i = 0; i < this.width; i++) {
                            if (processedPixelArray[i] === undefined) {
                                processedPixelArray[i] = Array(this.height).fill(0);
                            }
                            imgArr[i] = new Array(this.height);
                            for (var j = 0; j < this.height; j++) {
                                var imgData = canvas.getContext('2d').getImageData(i, j, 1, 1).data;
                                var isBlack = imgData[0] === 0 && imgData[1] === 0 && imgData[2] === 0;
                                // if (processedPixelArray[i][j] === undefined) processedPixelArray[i][j] = 0;

                                imgArr[i][j] = isBlack;
                                if (isBlack) {
                                    processedPixelArray[i][j]++;
                                }
                            }
                        }

                        processedInputList.push(imgArr);

                        pollingComplete();
                    };

                });

                //Read the image
                picReader.readAsDataURL(file);
            }

        });
    }
    else {
        log("Your browser does not support File API");
    }
}

function pollingComplete() {
    processedFileCount++;
    log("Done processing " + processedFileCount + " file.");
    if (processedFileCount === processingFileCount) {
        log("Processed " + processedFileCount + " files successfully.");
        var threshold = document.getElementById("threshold").value;
        generateOutputImage(parseInt(threshold));
    }
}

function log(text) {
    console.log(text);
    document.getElementById("log").innerHTML = text;
}

function generateOutputImage(threshold) {
    log("Generating an output image (threshold=" + threshold + ")");
    if (processedPixelArray.length > 0) {
        var canvas = document.createElement("canvas");
        var width = processedPixelArray.length;
        var height = processedPixelArray[0].length;
        canvas.width = width;
        canvas.height = height;
        var ctx = canvas.getContext('2d');

        for (var i = 0; i < processedPixelArray.length; i++) {
            for (var j = 0; j < processedPixelArray[i].length; j++) {
                if (processedPixelArray[i][j] >= threshold) {
                    // console.log("Painting at (" + i + "," + j + ")");
                    var imgData = ctx.createImageData(1, 1); // width x height
                    var data = imgData.data;
                    data[0] = 0;
                    data[1] = 0;
                    data[2] = 0;
                    data[3] = 255;
                    ctx.putImageData(imgData, i, j);
                }
            }
        }

        output.insertBefore(canvas, null);
        log("Output generated successfully.");
    }
}