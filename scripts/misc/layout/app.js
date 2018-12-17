
import {log, info, warn, err} from './utils.js';
import {whenDocumentLoaded} from './utils.js';


whenDocumentLoaded(() => {

    window.onresize = function(event) {
        log("window resized to : ", window.innerWidth, "x", window.innerHeight)
    };

});
