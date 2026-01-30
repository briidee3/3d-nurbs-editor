import Split from 'split.js';
    
// This code is only related to handling the split.
// Our three.js code has not changed
Split( [ '#view', '#controls' ], {
    sizes: [ 75, 25 ],
    minSize: 100,
    elementStyle: ( dimension, size, gutterSize ) => {
        return {
            'flex-basis': `calc(${size}% - ${gutterSize}px)`,
        };
    },
    gutterStyle: ( dimension, gutterSize ) => {
        return {
            'flex-basis': `${gutterSize}px`,
        };
    },
});