import LazyLoad from 'vanilla-lazyload';
import 'custom-event-polyfill';
import 'intersection-observer';

class LazyImages {
    constructor() {
        this.lazyLoadOptions = {// default image instance
            elements_selector: '.lazy-img',
            data_bg: 'bg',
            data_src: 'src',
            data_srcset: 'srcset',
            threshold: 400,
            thresholds: '400px 320px',
            callback_enter: function(el) {
                let event = new CustomEvent('lazyload:enter');
                el.dispatchEvent(event);
            },
            callback_reveal: function(el) {
                let event = new CustomEvent('lazyload:reveal');
                el.dispatchEvent(event);
            },
            callback_loaded: function(el) {
                let event = new CustomEvent('lazyload:load');
                el.dispatchEvent(event);

                let wrapperId = el.getAttribute('data-wrapper');
                if (null !== wrapperId) {
                    let wrapper = document.querySelector(el.getAttribute('data-wrapper'));
                    wrapper.classList.add('loaded');
                }
            },
        };
    }

    init() {
        return new LazyLoad(this.lazyLoadOptions);
    }
}

class LazyImagesInstance {
    constructor(instance) {
        this.instance = instance;
        this.linkElement = null;
    }

    update() {
        this.updateImages();
        this.updateWrappers();
    }

    updateImages(){
        this.instance.update();
    }

    updateWrappers() {
        if ('undefined' === typeof this.instance._elements || !Array.isArray(this.instance._elements)) return;

        if (null !== this.linkElement) {
            this.linkElement.remove();
            this.linkElement = null;
        }

        let wrapperStyles = [];

        this.instance._elements.forEach(function(el) {
            let wrapperStyle = el.getAttribute('data-wrapper-style');

            if (wrapperStyle) {
                wrapperStyles.push(wrapperStyle);
            }
        });

        if (wrapperStyles.length > 0) {
            let linkElement = document.createElement('link');
            linkElement.setAttribute('rel', 'stylesheet');
            linkElement.setAttribute('href', 'data:text/css;charset=UTF-8,' + encodeURIComponent(wrapperStyles.join('')));
            document.querySelector('head').appendChild(linkElement);
            this.linkElement = linkElement;
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    let instance = new LazyImages();
    window.lazyImagesInstance = new LazyImagesInstance(instance.init());
    window.lazyImagesInstance.updateWrappers();
});

// listen on each ajax request and trigger update() on each lazyload instance
const send = XMLHttpRequest.prototype.send;
XMLHttpRequest.prototype.send = function() {
    this.addEventListener('load', function() {
        if ('undefined' !== typeof window.lazyImagesInstance) {
            window.lazyImagesInstance.update();
        }
    });
    return send.apply(this, arguments);
};

export {LazyImagesInstance, LazyImages};
