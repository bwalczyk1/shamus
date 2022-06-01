/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/Enemy.ts":
/*!**********************!*\
  !*** ./src/Enemy.ts ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\nvar Enemy = /** @class */ (function () {\n    function Enemy(type) {\n        this.collisionRect = { x: 0, y: 0, width: 16, height: 8 };\n        this.movementObject = { endFrame: 0, forceX: 0, forceY: 0 };\n        this.type = type;\n        var availableColors;\n        switch (type) {\n            case 0:\n                availableColors = [\"red\", 'green', 'blue', 'white'];\n                this.speed = 3;\n                break;\n            case 1:\n                availableColors = [\"yellow\"];\n                //availableColors = [\"yellow\", \"cyan\", 'white']\n                this.speed = 2;\n                break;\n            default:\n                availableColors = [\"green\"];\n                this.collisionRect = { x: 0, y: 0, width: 12, height: 8 };\n                this.speed = 16;\n                break;\n        }\n        this.color = availableColors[Math.floor(Math.random() * availableColors.length)];\n    }\n    Enemy.prototype.setPosition = function (x, y) {\n        this.collisionRect.x = x;\n        this.collisionRect.y = y;\n    };\n    Enemy.prototype.equals = function (enemy) {\n        if (this.collisionRect.x == enemy.collisionRect.x && this.collisionRect.y == enemy.collisionRect.y) {\n            return true;\n        }\n        else {\n            return false;\n        }\n    };\n    return Enemy;\n}());\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Enemy);\n\n\n//# sourceURL=webpack://shamus/./src/Enemy.ts?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The require scope
/******/ 	var __webpack_require__ = {};
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = {};
/******/ 	__webpack_modules__["./src/Enemy.ts"](0, __webpack_exports__, __webpack_require__);
/******/ 	
/******/ })()
;