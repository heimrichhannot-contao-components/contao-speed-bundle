(function(w, d) {
    document.addEventListener('DOMContentLoaded', function(event) {
        let b = d.getElementsByTagName('body')[0];
        let s = d.createElement('script');
        s.async = true;
        let v = !('IntersectionObserver' in w) ? '8' : '10';
        // currently there is an bug in edge -> https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/12156111/
        if (w.navigator.userAgent.indexOf('Edge') > -1) {
            v = 8;
        }

        // safari works best with version 10, but window object has no IntersectionObserver -> force version 10
        if (w.navigator.userAgent.indexOf('Safari') > -1) {
            v = 10;
        }

        s.src = '/bundles';

        window.lazyLoad = {
            instances: [],
            update: function() {
                if (Array.isArray(window.lazyLoad.instances)) {
                    for (i in window.lazyLoad.instances) {
                        if (window.lazyLoad.instances.hasOwnProperty(i)) {
                            let instance = window.lazyLoad.instances[i];
                            instance.update();
                            this.updateWrapperStyles(instance._elements, instance);
                        }
                    }
                }
            },
            updateWrapperStyles: function(elements, instance) {
                if ('undefined' === typeof elements || !Array.isArray(elements)) return;

                if ('undefined' !== typeof instance.linkElement) {
                    instance.linkElement.remove();
                    delete instance.linkElement;
                }

                let wrapperStyles = [];

                elements.forEach(function(el) {
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
                    instance.linkElement = linkElement;
                }
            },
        };

        // Listen to the Initialized event
        w.addEventListener('LazyLoad::Initialized', function(e) {
            // Get the instance and puts it in the window lazyLoad instances letiable if not already present
            window.lazyLoad.instances.push(e.detail.instance);
            window.lazyLoad.updateWrapperStyles(e.detail.instance._elements, e.detail.instance);

        }, false);

        w.lazyLoadOptions = [
            {
                // default image instance
                data_src: 'src',
                data_srcset: 'srcset',
                threshold: 400,
                thresholds: '400px 320px',
                callback_enter: function(el) {
                    let event = new CustomEvent('lazyload:enter');
                    el.dispatchEvent(event);
                },
                callback_set: function(el) {
                    let event = new CustomEvent('lazyload:set');
                    el.dispatchEvent(event);
                },
                callback_load: function(el) {
                    let event = new CustomEvent('lazyload:load');
                    el.dispatchEvent(event);

                    let wrapperId = el.getAttribute('data-wrapper');
                    if (null !== wrapperId) {
                        let wrapper = document.querySelector(el.getAttribute('data-wrapper'));
                        wrapper.classList.add('loaded');
                    }
                },
            }, {
                // background image instance:  use lazy class on container and set data-src="[IMG_URL]" instead of style="background-image: url([IMG_URL]);"
                elements_selector: '.lazy',
                threshold: 400,
                thresholds: '400px 320px',
                callback_enter: function(el) {
                    let event = new CustomEvent('lazyload:enter');
                    el.dispatchEvent(event);
                },
                callback_set: function(el) {
                    let event = new CustomEvent('lazyload:set');
                    el.dispatchEvent(event);
                },
                callback_load: function(el) {
                    let event = new CustomEvent('lazyload:load');
                    el.dispatchEvent(event);
                },
            }];

        b.appendChild(s);

        // listen on each ajax request and trigger update() on each lazyload instance
        const send = XMLHttpRequest.prototype.send;
        XMLHttpRequest.prototype.send = function() {
            this.addEventListener('load', function() {
                w.lazyLoad.update();
            });
            return send.apply(this, arguments);
        };
    });

}(window, document));

module.exports = {};
