/*jslint browser:true, plusplus:true */
/*global
    define, requirejs, require, jQuery, console
*/

define(['extend-default', 'transitionend', 'ajax'], function (extendDefaults, transitionend, ajax) {
    'use strict';

    var body = document.querySelector('body');

    function PageController(opt) {
        var that = this,
            i = 0;

        that.options = {
            classes: {
                link: '.ajax',
                wrapper: '.wrapper',
                in: 'transition-in',
                out: 'transition-out'
            },
            events: {
                init: '',
                afterLoad: '',
                click: ''
            },
            elements: {
                links: [],
                wrapper: ''
            },
            click: new Event('page-click')
        };

        if (typeof opt === 'object') {
            extendDefaults(that.options, opt);
        }

        this.eventListeners();

        if (typeof that.options.events.init === 'function') {
            that.options.events.init.call();
        }

        window.addEventListener('popstate', function () {
            console.log('pop');
            window.location.href = window.location.href;
        })

        if (typeof that.options.events.afterLoad === 'function') {
            that.options.events.afterLoad.call(that);
        }

    }

    PageController.prototype.eventListeners = function () {
        var i = 0;
        this.options.elements.wrapper = document.querySelector(this.options.classes.wrapper);
        this.options.elements.links = document.querySelectorAll(this.options.classes.link);

        for (i = 0; i < this.options.elements.links.length; i++) {
            this.options.elements.links[i].addEventListener('click', this.click.bind({link: this.options.elements.links[i], controller: this}), false);
        }
    };

    PageController.prototype.transitionEnd = function () {
        this.section.removeEventListener(transitionend, this.controller.transitionEnd.bind({section: this.section, controller: this.controller}), false);
        body.classList.remove(this.controller.options.classes.out);

        var bodyClass = this.content.querySelector('body'),
            title = this.content.querySelector('title');

        body.classList.value = bodyClass.classList.value;
        scroll(0,0);

        document.title = title.innerHTML;

        this.controller.options.elements.wrapper.innerHTML = '';
        this.controller.options.elements.wrapper.innerHTML = this.content.querySelector(this.controller.options.classes.wrapper).innerHTML;

        if (typeof this.controller.options.events.afterLoad === 'function') {
            this.controller.eventListeners();
            this.controller.options.events.afterLoad.call(this);
        }
    };

    PageController.prototype.click = function (e, that) {
        if (typeof e !== "undefined") {
            e.preventDefault();
        }

        var that = this,
            section = that.controller.options.elements.wrapper.querySelector('section:last-of-type'),
            url = that.link.getAttribute('href');

        if (typeof that.controller.options.events.click === 'function') {
            that.controller.options.events.click.call(that);
        }

        document.dispatchEvent(that.controller.options.click);

        ajax().get(url).always(function (response, xhr) {
            var content = document.createElement('html');
            content.innerHTML = response;
            if (xhr.status === 200) {
                body.classList.add(that.controller.options.classes.out);
                section.addEventListener(transitionend, that.controller.transitionEnd.bind({section: section, controller: that.controller, content: content}), false);
                history.pushState({}, '', url);



            } else {
                window.location.href = xhr.responseURL;
            }

        });
    };

    return PageController;
});
