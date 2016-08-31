'use strict';
var Cesium = require('cesium');
var AccessorReader = require('./AccessorReader');
var changeAccessorComponentType = require('./changeAccessorComponentType');
var numberOfComponentsForType = require('./numberOfComponentsForType');

var WebGLConstants = Cesium.WebGLConstants;

module.exports = normalizeFloatAccessors;

function normalizeFloatAccessors(gltf) {
    var accessors = gltf.accessors;
    for (var accessorId in accessors) {
        if (accessors.hasOwnProperty(accessorId)) {
            var accessor = accessors[accessorId];
            normalizeFloatAccessor(gltf, accessor);
        }
    }
}

function normalizeFloatAccessor(gltf, accessor) {
    if (accessor.componentType === WebGLConstants.FLOAT && !accessor.normalized) {
        var min = accessor.min;
        var max = accessor.max;
        var numberOfComponents = numberOfComponentsForType(accessor.type);
        var canNormalize = true;
        for (var i = 0; i < numberOfComponents; i++) {
            if (min[i] < 0.0 || max[i] > 1.0) {
                canNormalize = false;
                break;
            }
        }
        if (canNormalize) {
            var value = [];
            var accessorReader = new AccessorReader(gltf, accessor);
            while(accessorReader.hasNext()) {
                accessorReader.read(value);
                for (var j = 0; j < numberOfComponents; j++) {
                    value[j] = value[j] * 255.0;
                }
                accessorReader.write(value);
                accessorReader.next();
            }
            changeAccessorComponentType(gltf, accessor, WebGLConstants.UNSIGNED_BYTE);
            accessor.normalized = true;
        }
    }
}