if (!window.AudioContext) {
    _fail("The Web Audio API is not available, please use a Web Audio capable browser.");
}

if (typeof(Worker) === "undefined") {
    _fail("Web Workers are not available, please use a web browser with Web Workers support.");
}

if (!window.FileReader) { 
    _fail("The FileReader API is not available, please use a FileReader capable browser.");
}