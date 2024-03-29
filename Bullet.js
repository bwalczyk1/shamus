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

/***/ "./src/Bullet.ts":
/*!***********************!*\
  !*** ./src/Bullet.ts ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\nvar Bullet = /** @class */ (function () {\r\n    function Bullet(id, movementForces) {\r\n        this.speed = 9;\r\n        this.id = id;\r\n        if (movementForces[0] == 0) {\r\n            this.type = \"vertical\";\r\n        }\r\n        else if (movementForces[1] == 0) {\r\n            this.type = \"horizontal\";\r\n        }\r\n        else if (movementForces[0] == movementForces[1]) {\r\n            this.type = \"diagonal\";\r\n        }\r\n        else {\r\n            this.type = \"diagonalInverted\";\r\n        }\r\n        this.speedX = movementForces[0] * this.speed;\r\n        this.speedY = movementForces[1] * this.speed;\r\n        if (this.type == \"horizontal\") {\r\n            this.width = 8;\r\n            this.height = 3;\r\n        }\r\n        else if (this.type == \"vertical\") {\r\n            this.width = 4;\r\n            this.height = 6;\r\n        }\r\n        else if (this.type == \"diagonal\" || this.type == \"diagonalInverted\") {\r\n            this.width = 4;\r\n            this.height = 4;\r\n        }\r\n    }\r\n    Bullet.prototype.setCoords = function (x, y) {\r\n        this.collisionRect = { x: x - this.speedX, y: y - this.speedY, width: this.width, height: this.height };\r\n    };\r\n    Bullet.prototype.move = function () {\r\n        this.collisionRect.x += this.speedX;\r\n        this.collisionRect.y += this.speedY;\r\n    };\r\n    return Bullet;\r\n}());\r\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Bullet);\r\n\n\n//# sourceURL=webpack://shamus/./src/Bullet.ts?");

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
/******/ 	__webpack_modules__["./src/Bullet.ts"](0, __webpack_exports__, __webpack_require__);
/******/ 	
/******/ })()
;