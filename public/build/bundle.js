
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot_base(slot, slot_definition, ctx, $$scope, slot_changes, get_slot_context_fn) {
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function get_all_dirty_from_scope($$scope) {
        if ($$scope.ctx.length > 32) {
            const dirty = [];
            const length = $$scope.ctx.length / 32;
            for (let i = 0; i < length; i++) {
                dirty[i] = -1;
            }
            return dirty;
        }
        return -1;
    }
    function null_to_empty(value) {
        return value == null ? '' : value;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function get_root_for_style(node) {
        if (!node)
            return document;
        const root = node.getRootNode ? node.getRootNode() : node.ownerDocument;
        if (root.host) {
            return root;
        }
        return document;
    }
    function append_empty_stylesheet(node) {
        const style_element = element('style');
        append_stylesheet(get_root_for_style(node), style_element);
        return style_element;
    }
    function append_stylesheet(node, style) {
        append(node.head || node, style);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
    }

    const active_docs = new Set();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = get_root_for_style(node);
        active_docs.add(doc);
        const stylesheet = doc.__svelte_stylesheet || (doc.__svelte_stylesheet = append_empty_stylesheet(node).sheet);
        const current_rules = doc.__svelte_rules || (doc.__svelte_rules = {});
        if (!current_rules[name]) {
            current_rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            active_docs.forEach(doc => {
                const stylesheet = doc.__svelte_stylesheet;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                doc.__svelte_rules = {};
            });
            active_docs.clear();
        });
    }

    function create_animation(node, from, fn, params) {
        if (!from)
            return noop;
        const to = node.getBoundingClientRect();
        if (from.left === to.left && from.right === to.right && from.top === to.top && from.bottom === to.bottom)
            return noop;
        const { delay = 0, duration = 300, easing = identity, 
        // @ts-ignore todo: should this be separated from destructuring? Or start/end added to public api and documentation?
        start: start_time = now() + delay, 
        // @ts-ignore todo:
        end = start_time + duration, tick = noop, css } = fn(node, { from, to }, params);
        let running = true;
        let started = false;
        let name;
        function start() {
            if (css) {
                name = create_rule(node, 0, 1, duration, delay, easing, css);
            }
            if (!delay) {
                started = true;
            }
        }
        function stop() {
            if (css)
                delete_rule(node, name);
            running = false;
        }
        loop(now => {
            if (!started && now >= start_time) {
                started = true;
            }
            if (started && now >= end) {
                tick(1, 0);
                stop();
            }
            if (!running) {
                return false;
            }
            if (started) {
                const p = now - start_time;
                const t = 0 + 1 * easing(p / duration);
                tick(t, 1 - t);
            }
            return true;
        });
        start();
        tick(0, 1);
        return stop;
    }
    function fix_position(node) {
        const style = getComputedStyle(node);
        if (style.position !== 'absolute' && style.position !== 'fixed') {
            const { width, height } = style;
            const a = node.getBoundingClientRect();
            node.style.position = 'absolute';
            node.style.width = width;
            node.style.height = height;
            add_transform(node, a);
        }
    }
    function add_transform(node, a) {
        const b = node.getBoundingClientRect();
        if (a.left !== b.left || a.top !== b.top) {
            const style = getComputedStyle(node);
            const transform = style.transform === 'none' ? '' : style.transform;
            node.style.transform = `${transform} translate(${a.left - b.left}px, ${a.top - b.top}px)`;
        }
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            // @ts-ignore
            callbacks.slice().forEach(fn => fn.call(this, event));
        }
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    const null_transition = { duration: 0 };
    function create_bidirectional_transition(node, fn, params, intro) {
        let config = fn(node, params);
        let t = intro ? 0 : 1;
        let running_program = null;
        let pending_program = null;
        let animation_name = null;
        function clear_animation() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function init(program, duration) {
            const d = (program.b - t);
            duration *= Math.abs(d);
            return {
                a: t,
                b: program.b,
                d,
                duration,
                start: program.start,
                end: program.start + duration,
                group: program.group
            };
        }
        function go(b) {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            const program = {
                start: now() + delay,
                b
            };
            if (!b) {
                // @ts-ignore todo: improve typings
                program.group = outros;
                outros.r += 1;
            }
            if (running_program || pending_program) {
                pending_program = program;
            }
            else {
                // if this is an intro, and there's a delay, we need to do
                // an initial tick and/or apply CSS animation immediately
                if (css) {
                    clear_animation();
                    animation_name = create_rule(node, t, b, duration, delay, easing, css);
                }
                if (b)
                    tick(0, 1);
                running_program = init(program, duration);
                add_render_callback(() => dispatch(node, b, 'start'));
                loop(now => {
                    if (pending_program && now > pending_program.start) {
                        running_program = init(pending_program, duration);
                        pending_program = null;
                        dispatch(node, running_program.b, 'start');
                        if (css) {
                            clear_animation();
                            animation_name = create_rule(node, t, running_program.b, running_program.duration, 0, easing, config.css);
                        }
                    }
                    if (running_program) {
                        if (now >= running_program.end) {
                            tick(t = running_program.b, 1 - t);
                            dispatch(node, running_program.b, 'end');
                            if (!pending_program) {
                                // we're done
                                if (running_program.b) {
                                    // intro — we can tidy up immediately
                                    clear_animation();
                                }
                                else {
                                    // outro — needs to be coordinated
                                    if (!--running_program.group.r)
                                        run_all(running_program.group.c);
                                }
                            }
                            running_program = null;
                        }
                        else if (now >= running_program.start) {
                            const p = now - running_program.start;
                            t = running_program.a + running_program.d * easing(p / running_program.duration);
                            tick(t, 1 - t);
                        }
                    }
                    return !!(running_program || pending_program);
                });
            }
        }
        return {
            run(b) {
                if (is_function(config)) {
                    wait().then(() => {
                        // @ts-ignore
                        config = config();
                        go(b);
                    });
                }
                else {
                    go(b);
                }
            },
            end() {
                clear_animation();
                running_program = pending_program = null;
            }
        };
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function outro_and_destroy_block(block, lookup) {
        transition_out(block, 1, 1, () => {
            lookup.delete(block.key);
        });
    }
    function fix_and_outro_and_destroy_block(block, lookup) {
        block.f();
        outro_and_destroy_block(block, lookup);
    }
    function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
        let o = old_blocks.length;
        let n = list.length;
        let i = o;
        const old_indexes = {};
        while (i--)
            old_indexes[old_blocks[i].key] = i;
        const new_blocks = [];
        const new_lookup = new Map();
        const deltas = new Map();
        i = n;
        while (i--) {
            const child_ctx = get_context(ctx, list, i);
            const key = get_key(child_ctx);
            let block = lookup.get(key);
            if (!block) {
                block = create_each_block(key, child_ctx);
                block.c();
            }
            else if (dynamic) {
                block.p(child_ctx, dirty);
            }
            new_lookup.set(key, new_blocks[i] = block);
            if (key in old_indexes)
                deltas.set(key, Math.abs(i - old_indexes[key]));
        }
        const will_move = new Set();
        const did_move = new Set();
        function insert(block) {
            transition_in(block, 1);
            block.m(node, next);
            lookup.set(block.key, block);
            next = block.first;
            n--;
        }
        while (o && n) {
            const new_block = new_blocks[n - 1];
            const old_block = old_blocks[o - 1];
            const new_key = new_block.key;
            const old_key = old_block.key;
            if (new_block === old_block) {
                // do nothing
                next = new_block.first;
                o--;
                n--;
            }
            else if (!new_lookup.has(old_key)) {
                // remove old block
                destroy(old_block, lookup);
                o--;
            }
            else if (!lookup.has(new_key) || will_move.has(new_key)) {
                insert(new_block);
            }
            else if (did_move.has(old_key)) {
                o--;
            }
            else if (deltas.get(new_key) > deltas.get(old_key)) {
                did_move.add(new_key);
                insert(new_block);
            }
            else {
                will_move.add(old_key);
                o--;
            }
        }
        while (o--) {
            const old_block = old_blocks[o];
            if (!new_lookup.has(old_block.key))
                destroy(old_block, lookup);
        }
        while (n)
            insert(new_blocks[n - 1]);
        return new_blocks;
    }
    function validate_each_keys(ctx, list, get_context, get_key) {
        const keys = new Set();
        for (let i = 0; i < list.length; i++) {
            const key = get_key(get_context(ctx, list, i));
            if (keys.has(key)) {
                throw new Error('Cannot have duplicate keys in a keyed each');
            }
            keys.add(key);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : options.context || []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.42.1' }, detail), true));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev('SvelteDOMSetProperty', { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = new Set();
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (const subscriber of subscribers) {
                        subscriber[1]();
                        subscriber_queue.push(subscriber, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                subscribers.delete(subscriber);
                if (subscribers.size === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    const wishes = writable([]);

    const customWishesStore = {
      subscribe: wishes.subscribe,
      setWishes: (data) => {
        wishes.set(data);
      },
      addWish: (wishData) => {
        const newWish = {
          ...wishData,
        };
        wishes.update((items) => {
          return [newWish, ...items];
        });
      },
      toggleFavorite: (id) => {
        wishes.update((items) => {
          const updatedWish = { ...items.find((e) => e.id === id) };
          const wishIndex = items.findIndex((e) => e.id === id);
          updatedWish.isFavorite = !updatedWish.isFavorite;
          const updatedWishes = [...items];
          updatedWishes[wishIndex] = updatedWish;
          return updatedWishes;
        });
      },
      updateWish: (id, wishData) => {
        wishes.update((items) => {
          const updatedWish = { ...items.find((e) => e.id === id), ...wishData };
          const wishIndex = items.findIndex((e) => e.id === id);
          const updatedWishes = [...items];
          updatedWishes[wishIndex] = updatedWish;
          console.log(...items, "items");
          console.log({ ...wishData }, "wishes");
          return updatedWishes;
        });
      },
      removeWish: (id) => {
        wishes.update((items) => {
          return items.filter((i) => i.id !== id);
        });
      },
    };

    /* src/UI/Header.svelte generated by Svelte v3.42.1 */

    const file$c = "src/UI/Header.svelte";

    function create_fragment$c(ctx) {
    	let header;
    	let h1;

    	const block = {
    		c: function create() {
    			header = element("header");
    			h1 = element("h1");
    			h1.textContent = "Make a wish!";
    			attr_dev(h1, "class", "svelte-50w90f");
    			add_location(h1, file$c, 1, 2, 11);
    			attr_dev(header, "class", "svelte-50w90f");
    			add_location(header, file$c, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, header, anchor);
    			append_dev(header, h1);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(header);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Header', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Header> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Header extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Header",
    			options,
    			id: create_fragment$c.name
    		});
    	}
    }

    /* src/UI/Badge.svelte generated by Svelte v3.42.1 */

    const file$b = "src/UI/Badge.svelte";

    function create_fragment$b(ctx) {
    	let span;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[1].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[0], null);

    	const block = {
    		c: function create() {
    			span = element("span");
    			if (default_slot) default_slot.c();
    			attr_dev(span, "class", "svelte-1thke5e");
    			add_location(span, file$b, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);

    			if (default_slot) {
    				default_slot.m(span, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 1)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[0],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[0])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[0], dirty, null),
    						null
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Badge', slots, ['default']);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Badge> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('$$scope' in $$props) $$invalidate(0, $$scope = $$props.$$scope);
    	};

    	return [$$scope, slots];
    }

    class Badge extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Badge",
    			options,
    			id: create_fragment$b.name
    		});
    	}
    }

    /* src/UI/Button.svelte generated by Svelte v3.42.1 */

    const file$a = "src/UI/Button.svelte";

    // (9:2) {#if href}
    function create_if_block$4(ctx) {
    	let a;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[5].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[4], null);

    	const block = {
    		c: function create() {
    			a = element("a");
    			if (default_slot) default_slot.c();
    			attr_dev(a, "href", /*href*/ ctx[2]);
    			attr_dev(a, "class", "svelte-11y2qs9");
    			add_location(a, file$a, 9, 4, 155);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);

    			if (default_slot) {
    				default_slot.m(a, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 16)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[4],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[4])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[4], dirty, null),
    						null
    					);
    				}
    			}

    			if (!current || dirty & /*href*/ 4) {
    				attr_dev(a, "href", /*href*/ ctx[2]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(9:2) {#if href}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$a(ctx) {
    	let div;
    	let t;
    	let button;
    	let button_class_value;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block = /*href*/ ctx[2] && create_if_block$4(ctx);
    	const default_slot_template = /*#slots*/ ctx[5].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[4], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block) if_block.c();
    			t = space();
    			button = element("button");
    			if (default_slot) default_slot.c();
    			attr_dev(button, "type", /*type*/ ctx[0]);
    			button.disabled = /*availability*/ ctx[3];
    			attr_dev(button, "class", button_class_value = "" + (null_to_empty(/*mode*/ ctx[1]) + " svelte-11y2qs9"));
    			add_location(button, file$a, 11, 2, 188);
    			add_location(div, file$a, 7, 0, 132);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if (if_block) if_block.m(div, null);
    			append_dev(div, t);
    			append_dev(div, button);

    			if (default_slot) {
    				default_slot.m(button, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler*/ ctx[6], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*href*/ ctx[2]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*href*/ 4) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$4(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div, t);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 16)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[4],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[4])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[4], dirty, null),
    						null
    					);
    				}
    			}

    			if (!current || dirty & /*type*/ 1) {
    				attr_dev(button, "type", /*type*/ ctx[0]);
    			}

    			if (!current || dirty & /*availability*/ 8) {
    				prop_dev(button, "disabled", /*availability*/ ctx[3]);
    			}

    			if (!current || dirty & /*mode*/ 2 && button_class_value !== (button_class_value = "" + (null_to_empty(/*mode*/ ctx[1]) + " svelte-11y2qs9"))) {
    				attr_dev(button, "class", button_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block) if_block.d();
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Button', slots, ['default']);
    	let { type = "button" } = $$props;
    	let { mode = "" } = $$props;
    	let { href = "" } = $$props;
    	let { availability = null } = $$props;
    	const writable_props = ['type', 'mode', 'href', 'availability'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Button> was created with unknown prop '${key}'`);
    	});

    	function click_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ('type' in $$props) $$invalidate(0, type = $$props.type);
    		if ('mode' in $$props) $$invalidate(1, mode = $$props.mode);
    		if ('href' in $$props) $$invalidate(2, href = $$props.href);
    		if ('availability' in $$props) $$invalidate(3, availability = $$props.availability);
    		if ('$$scope' in $$props) $$invalidate(4, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ type, mode, href, availability });

    	$$self.$inject_state = $$props => {
    		if ('type' in $$props) $$invalidate(0, type = $$props.type);
    		if ('mode' in $$props) $$invalidate(1, mode = $$props.mode);
    		if ('href' in $$props) $$invalidate(2, href = $$props.href);
    		if ('availability' in $$props) $$invalidate(3, availability = $$props.availability);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [type, mode, href, availability, $$scope, slots, click_handler];
    }

    class Button extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$a, create_fragment$a, safe_not_equal, {
    			type: 0,
    			mode: 1,
    			href: 2,
    			availability: 3
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Button",
    			options,
    			id: create_fragment$a.name
    		});
    	}

    	get type() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set type(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get mode() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set mode(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get href() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set href(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get availability() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set availability(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Components/WishItem.svelte generated by Svelte v3.42.1 */

    const { Error: Error_1$3, console: console_1$3 } = globals;
    const file$9 = "src/Components/WishItem.svelte";

    // (55:6) {#if isFavorite}
    function create_if_block$3(ctx) {
    	let badge;
    	let current;

    	badge = new Badge({
    			props: {
    				$$slots: { default: [create_default_slot_3$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(badge.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(badge, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(badge.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(badge.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(badge, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(55:6) {#if isFavorite}",
    		ctx
    	});

    	return block;
    }

    // (56:8) <Badge>
    function create_default_slot_3$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Favorite");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3$1.name,
    		type: "slot",
    		source: "(56:8) <Badge>",
    		ctx
    	});

    	return block;
    }

    // (74:4) <Button on:click={editWish}>
    function create_default_slot_2$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Edit");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2$1.name,
    		type: "slot",
    		source: "(74:4) <Button on:click={editWish}>",
    		ctx
    	});

    	return block;
    }

    // (75:4) <Button on:click={showDetails}>
    function create_default_slot_1$2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Show Details");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$2.name,
    		type: "slot",
    		source: "(75:4) <Button on:click={showDetails}>",
    		ctx
    	});

    	return block;
    }

    // (76:4) <Button       mode={!isFavorite ? "outline" : "outline-active"}       on:click={toggleFavorite}       >
    function create_default_slot$4(ctx) {
    	let t_value = (/*isFavorite*/ ctx[6] ? "Unfavorite" : "Favorite") + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*isFavorite*/ 64 && t_value !== (t_value = (/*isFavorite*/ ctx[6] ? "Unfavorite" : "Favorite") + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$4.name,
    		type: "slot",
    		source: "(76:4) <Button       mode={!isFavorite ? \\\"outline\\\" : \\\"outline-active\\\"}       on:click={toggleFavorite}       >",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let article;
    	let header;
    	let h1;
    	let t0;
    	let t1;
    	let t2;
    	let h2;
    	let t3;
    	let t4;
    	let div0;
    	let img;
    	let img_src_value;
    	let t5;
    	let div1;
    	let p0;
    	let t6;
    	let t7;
    	let footer;
    	let div2;
    	let p1;
    	let t8;
    	let t9;
    	let div3;
    	let p2;
    	let t10;
    	let t11;
    	let button0;
    	let t12;
    	let button1;
    	let t13;
    	let button2;
    	let current;
    	let if_block = /*isFavorite*/ ctx[6] && create_if_block$3(ctx);

    	button0 = new Button({
    			props: {
    				$$slots: { default: [create_default_slot_2$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button0.$on("click", /*editWish*/ ctx[8]);

    	button1 = new Button({
    			props: {
    				$$slots: { default: [create_default_slot_1$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button1.$on("click", /*showDetails*/ ctx[7]);

    	button2 = new Button({
    			props: {
    				mode: !/*isFavorite*/ ctx[6] ? "outline" : "outline-active",
    				$$slots: { default: [create_default_slot$4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button2.$on("click", /*toggleFavorite*/ ctx[9]);

    	const block = {
    		c: function create() {
    			article = element("article");
    			header = element("header");
    			h1 = element("h1");
    			t0 = text(/*title*/ ctx[0]);
    			t1 = space();
    			if (if_block) if_block.c();
    			t2 = space();
    			h2 = element("h2");
    			t3 = text(/*subtitle*/ ctx[1]);
    			t4 = space();
    			div0 = element("div");
    			img = element("img");
    			t5 = space();
    			div1 = element("div");
    			p0 = element("p");
    			t6 = text(/*description*/ ctx[5]);
    			t7 = space();
    			footer = element("footer");
    			div2 = element("div");
    			p1 = element("p");
    			t8 = text(/*address*/ ctx[2]);
    			t9 = space();
    			div3 = element("div");
    			p2 = element("p");
    			t10 = text(/*email*/ ctx[4]);
    			t11 = space();
    			create_component(button0.$$.fragment);
    			t12 = space();
    			create_component(button1.$$.fragment);
    			t13 = space();
    			create_component(button2.$$.fragment);
    			attr_dev(h1, "class", "svelte-9kwnjk");
    			add_location(h1, file$9, 52, 4, 1149);
    			attr_dev(h2, "class", "svelte-9kwnjk");
    			add_location(h2, file$9, 58, 4, 1249);
    			attr_dev(header, "class", "svelte-9kwnjk");
    			add_location(header, file$9, 51, 2, 1136);
    			if (!src_url_equal(img.src, img_src_value = /*image*/ ctx[3])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", /*title*/ ctx[0]);
    			attr_dev(img, "class", "svelte-9kwnjk");
    			add_location(img, file$9, 61, 4, 1307);
    			attr_dev(div0, "class", "image svelte-9kwnjk");
    			add_location(div0, file$9, 60, 2, 1283);
    			attr_dev(p0, "class", "svelte-9kwnjk");
    			add_location(p0, file$9, 64, 4, 1376);
    			attr_dev(div1, "class", "content svelte-9kwnjk");
    			add_location(div1, file$9, 63, 2, 1350);
    			attr_dev(p1, "class", "svelte-9kwnjk");
    			add_location(p1, file$9, 68, 6, 1449);
    			attr_dev(div2, "class", "address svelte-9kwnjk");
    			add_location(div2, file$9, 67, 4, 1421);
    			attr_dev(p2, "class", "svelte-9kwnjk");
    			add_location(p2, file$9, 71, 6, 1507);
    			attr_dev(div3, "class", "email svelte-9kwnjk");
    			add_location(div3, file$9, 70, 4, 1481);
    			attr_dev(footer, "class", "svelte-9kwnjk");
    			add_location(footer, file$9, 66, 2, 1408);
    			attr_dev(article, "class", "svelte-9kwnjk");
    			add_location(article, file$9, 50, 0, 1124);
    		},
    		l: function claim(nodes) {
    			throw new Error_1$3("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, article, anchor);
    			append_dev(article, header);
    			append_dev(header, h1);
    			append_dev(h1, t0);
    			append_dev(h1, t1);
    			if (if_block) if_block.m(h1, null);
    			append_dev(header, t2);
    			append_dev(header, h2);
    			append_dev(h2, t3);
    			append_dev(article, t4);
    			append_dev(article, div0);
    			append_dev(div0, img);
    			append_dev(article, t5);
    			append_dev(article, div1);
    			append_dev(div1, p0);
    			append_dev(p0, t6);
    			append_dev(article, t7);
    			append_dev(article, footer);
    			append_dev(footer, div2);
    			append_dev(div2, p1);
    			append_dev(p1, t8);
    			append_dev(footer, t9);
    			append_dev(footer, div3);
    			append_dev(div3, p2);
    			append_dev(p2, t10);
    			append_dev(footer, t11);
    			mount_component(button0, footer, null);
    			append_dev(footer, t12);
    			mount_component(button1, footer, null);
    			append_dev(footer, t13);
    			mount_component(button2, footer, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*title*/ 1) set_data_dev(t0, /*title*/ ctx[0]);

    			if (/*isFavorite*/ ctx[6]) {
    				if (if_block) {
    					if (dirty & /*isFavorite*/ 64) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$3(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(h1, null);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			if (!current || dirty & /*subtitle*/ 2) set_data_dev(t3, /*subtitle*/ ctx[1]);

    			if (!current || dirty & /*image*/ 8 && !src_url_equal(img.src, img_src_value = /*image*/ ctx[3])) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (!current || dirty & /*title*/ 1) {
    				attr_dev(img, "alt", /*title*/ ctx[0]);
    			}

    			if (!current || dirty & /*description*/ 32) set_data_dev(t6, /*description*/ ctx[5]);
    			if (!current || dirty & /*address*/ 4) set_data_dev(t8, /*address*/ ctx[2]);
    			if (!current || dirty & /*email*/ 16) set_data_dev(t10, /*email*/ ctx[4]);
    			const button0_changes = {};

    			if (dirty & /*$$scope*/ 4096) {
    				button0_changes.$$scope = { dirty, ctx };
    			}

    			button0.$set(button0_changes);
    			const button1_changes = {};

    			if (dirty & /*$$scope*/ 4096) {
    				button1_changes.$$scope = { dirty, ctx };
    			}

    			button1.$set(button1_changes);
    			const button2_changes = {};
    			if (dirty & /*isFavorite*/ 64) button2_changes.mode = !/*isFavorite*/ ctx[6] ? "outline" : "outline-active";

    			if (dirty & /*$$scope, isFavorite*/ 4160) {
    				button2_changes.$$scope = { dirty, ctx };
    			}

    			button2.$set(button2_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			transition_in(button0.$$.fragment, local);
    			transition_in(button1.$$.fragment, local);
    			transition_in(button2.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			transition_out(button0.$$.fragment, local);
    			transition_out(button1.$$.fragment, local);
    			transition_out(button2.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(article);
    			if (if_block) if_block.d();
    			destroy_component(button0);
    			destroy_component(button1);
    			destroy_component(button2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('WishItem', slots, []);
    	let { id } = $$props;
    	let { title } = $$props;
    	let { subtitle } = $$props;
    	let { address } = $$props;
    	let { image } = $$props;
    	let { email } = $$props;
    	let { description } = $$props;
    	let { isFavorite } = $$props;
    	const dispatch = createEventDispatcher();

    	const showDetails = () => {
    		dispatch("show-details", id);
    	};

    	const editWish = () => {
    		dispatch("edit-wish", id);
    	};

    	const toggleFavorite = () => {
    		fetch(`https://wishlist-app-d8867-default-rtdb.firebaseio.com/wishes/${id}.json`, {
    			method: "PATCH",
    			body: JSON.stringify({ isFavorite: !isFavorite }),
    			headers: { "Content-Type": "application/json" }
    		}).then(res => {
    			if (!res.ok) {
    				throw new Error("Something went wrong");
    			}

    			customWishesStore.toggleFavorite(id);
    		}).catch(err => {
    			console.log(err);
    		});
    	};

    	const writable_props = [
    		'id',
    		'title',
    		'subtitle',
    		'address',
    		'image',
    		'email',
    		'description',
    		'isFavorite'
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$3.warn(`<WishItem> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('id' in $$props) $$invalidate(10, id = $$props.id);
    		if ('title' in $$props) $$invalidate(0, title = $$props.title);
    		if ('subtitle' in $$props) $$invalidate(1, subtitle = $$props.subtitle);
    		if ('address' in $$props) $$invalidate(2, address = $$props.address);
    		if ('image' in $$props) $$invalidate(3, image = $$props.image);
    		if ('email' in $$props) $$invalidate(4, email = $$props.email);
    		if ('description' in $$props) $$invalidate(5, description = $$props.description);
    		if ('isFavorite' in $$props) $$invalidate(6, isFavorite = $$props.isFavorite);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		Badge,
    		wishes: customWishesStore,
    		Button,
    		id,
    		title,
    		subtitle,
    		address,
    		image,
    		email,
    		description,
    		isFavorite,
    		dispatch,
    		showDetails,
    		editWish,
    		toggleFavorite
    	});

    	$$self.$inject_state = $$props => {
    		if ('id' in $$props) $$invalidate(10, id = $$props.id);
    		if ('title' in $$props) $$invalidate(0, title = $$props.title);
    		if ('subtitle' in $$props) $$invalidate(1, subtitle = $$props.subtitle);
    		if ('address' in $$props) $$invalidate(2, address = $$props.address);
    		if ('image' in $$props) $$invalidate(3, image = $$props.image);
    		if ('email' in $$props) $$invalidate(4, email = $$props.email);
    		if ('description' in $$props) $$invalidate(5, description = $$props.description);
    		if ('isFavorite' in $$props) $$invalidate(6, isFavorite = $$props.isFavorite);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*isFavorite*/ 64) {
    			console.log(isFavorite, "fav");
    		}
    	};

    	return [
    		title,
    		subtitle,
    		address,
    		image,
    		email,
    		description,
    		isFavorite,
    		showDetails,
    		editWish,
    		toggleFavorite,
    		id
    	];
    }

    class WishItem extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {
    			id: 10,
    			title: 0,
    			subtitle: 1,
    			address: 2,
    			image: 3,
    			email: 4,
    			description: 5,
    			isFavorite: 6
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "WishItem",
    			options,
    			id: create_fragment$9.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*id*/ ctx[10] === undefined && !('id' in props)) {
    			console_1$3.warn("<WishItem> was created without expected prop 'id'");
    		}

    		if (/*title*/ ctx[0] === undefined && !('title' in props)) {
    			console_1$3.warn("<WishItem> was created without expected prop 'title'");
    		}

    		if (/*subtitle*/ ctx[1] === undefined && !('subtitle' in props)) {
    			console_1$3.warn("<WishItem> was created without expected prop 'subtitle'");
    		}

    		if (/*address*/ ctx[2] === undefined && !('address' in props)) {
    			console_1$3.warn("<WishItem> was created without expected prop 'address'");
    		}

    		if (/*image*/ ctx[3] === undefined && !('image' in props)) {
    			console_1$3.warn("<WishItem> was created without expected prop 'image'");
    		}

    		if (/*email*/ ctx[4] === undefined && !('email' in props)) {
    			console_1$3.warn("<WishItem> was created without expected prop 'email'");
    		}

    		if (/*description*/ ctx[5] === undefined && !('description' in props)) {
    			console_1$3.warn("<WishItem> was created without expected prop 'description'");
    		}

    		if (/*isFavorite*/ ctx[6] === undefined && !('isFavorite' in props)) {
    			console_1$3.warn("<WishItem> was created without expected prop 'isFavorite'");
    		}
    	}

    	get id() {
    		throw new Error_1$3("<WishItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error_1$3("<WishItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get title() {
    		throw new Error_1$3("<WishItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error_1$3("<WishItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get subtitle() {
    		throw new Error_1$3("<WishItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set subtitle(value) {
    		throw new Error_1$3("<WishItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get address() {
    		throw new Error_1$3("<WishItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set address(value) {
    		throw new Error_1$3("<WishItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get image() {
    		throw new Error_1$3("<WishItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set image(value) {
    		throw new Error_1$3("<WishItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get email() {
    		throw new Error_1$3("<WishItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set email(value) {
    		throw new Error_1$3("<WishItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get description() {
    		throw new Error_1$3("<WishItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set description(value) {
    		throw new Error_1$3("<WishItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isFavorite() {
    		throw new Error_1$3("<WishItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isFavorite(value) {
    		throw new Error_1$3("<WishItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Components/WishFilter.svelte generated by Svelte v3.42.1 */
    const file$8 = "src/Components/WishFilter.svelte";

    function create_fragment$8(ctx) {
    	let div;
    	let button0;
    	let t1;
    	let button1;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			button0 = element("button");
    			button0.textContent = "All";
    			t1 = space();
    			button1 = element("button");
    			button1.textContent = "Favorites";
    			attr_dev(button0, "class", "svelte-yw9ja4");
    			toggle_class(button0, "active", /*selectedButton*/ ctx[0] === 0);
    			add_location(button0, file$8, 20, 2, 374);
    			attr_dev(button1, "class", "svelte-yw9ja4");
    			toggle_class(button1, "active", /*selectedButton*/ ctx[0] === 1);
    			add_location(button1, file$8, 21, 2, 452);
    			attr_dev(div, "class", "svelte-yw9ja4");
    			add_location(div, file$8, 19, 0, 366);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, button0);
    			append_dev(div, t1);
    			append_dev(div, button1);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*showAll*/ ctx[1], false, false, false),
    					listen_dev(button1, "click", /*showFavorites*/ ctx[2], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*selectedButton*/ 1) {
    				toggle_class(button0, "active", /*selectedButton*/ ctx[0] === 0);
    			}

    			if (dirty & /*selectedButton*/ 1) {
    				toggle_class(button1, "active", /*selectedButton*/ ctx[0] === 1);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('WishFilter', slots, []);
    	let selectedButton = 0;
    	let { filterFavorites = false } = $$props;
    	const dispatch = createEventDispatcher();

    	const showAll = () => {
    		dispatch("filter-wishes", 0);
    		$$invalidate(0, selectedButton = 0);
    	};

    	const showFavorites = () => {
    		dispatch("filter-wishes", 1);
    		$$invalidate(0, selectedButton = 1);
    	};

    	const writable_props = ['filterFavorites'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<WishFilter> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('filterFavorites' in $$props) $$invalidate(3, filterFavorites = $$props.filterFavorites);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		selectedButton,
    		filterFavorites,
    		dispatch,
    		showAll,
    		showFavorites
    	});

    	$$self.$inject_state = $$props => {
    		if ('selectedButton' in $$props) $$invalidate(0, selectedButton = $$props.selectedButton);
    		if ('filterFavorites' in $$props) $$invalidate(3, filterFavorites = $$props.filterFavorites);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [selectedButton, showAll, showFavorites, filterFavorites];
    }

    class WishFilter extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, { filterFavorites: 3 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "WishFilter",
    			options,
    			id: create_fragment$8.name
    		});
    	}

    	get filterFavorites() {
    		throw new Error("<WishFilter>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set filterFavorites(value) {
    		throw new Error("<WishFilter>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }

    function fade(node, { delay = 0, duration = 400, easing = identity } = {}) {
        const o = +getComputedStyle(node).opacity;
        return {
            delay,
            duration,
            easing,
            css: t => `opacity: ${t * o}`
        };
    }
    function fly(node, { delay = 0, duration = 400, easing = cubicOut, x = 0, y = 0, opacity = 0 } = {}) {
        const style = getComputedStyle(node);
        const target_opacity = +style.opacity;
        const transform = style.transform === 'none' ? '' : style.transform;
        const od = target_opacity * (1 - opacity);
        return {
            delay,
            duration,
            easing,
            css: (t, u) => `
			transform: ${transform} translate(${(1 - t) * x}px, ${(1 - t) * y}px);
			opacity: ${target_opacity - (od * u)}`
        };
    }
    function scale(node, { delay = 0, duration = 400, easing = cubicOut, start = 0, opacity = 0 } = {}) {
        const style = getComputedStyle(node);
        const target_opacity = +style.opacity;
        const transform = style.transform === 'none' ? '' : style.transform;
        const sd = 1 - start;
        const od = target_opacity * (1 - opacity);
        return {
            delay,
            duration,
            easing,
            css: (_t, u) => `
			transform: ${transform} scale(${1 - (sd * u)});
			opacity: ${target_opacity - (od * u)}
		`
        };
    }

    function flip(node, animation, params = {}) {
        const style = getComputedStyle(node);
        const transform = style.transform === 'none' ? '' : style.transform;
        const scaleX = animation.from.width / node.clientWidth;
        const scaleY = animation.from.height / node.clientHeight;
        const dx = (animation.from.left - animation.to.left) / scaleX;
        const dy = (animation.from.top - animation.to.top) / scaleY;
        const d = Math.sqrt(dx * dx + dy * dy);
        const { delay = 0, duration = (d) => Math.sqrt(d) * 120, easing = cubicOut } = params;
        return {
            delay,
            duration: is_function(duration) ? duration(d) : duration,
            easing,
            css: (_t, u) => `transform: ${transform} translate(${u * dx}px, ${u * dy}px);`
        };
    }

    /* src/Components/WishGrid.svelte generated by Svelte v3.42.1 */

    const { console: console_1$2 } = globals;
    const file$7 = "src/Components/WishGrid.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i];
    	return child_ctx;
    }

    // (23:2) {#each filterFavs as wish (wish.id)}
    function create_each_block(key_1, ctx) {
    	let div;
    	let wishitem;
    	let t;
    	let div_transition;
    	let rect;
    	let stop_animation = noop;
    	let current;

    	wishitem = new WishItem({
    			props: {
    				id: /*wish*/ ctx[6].id,
    				title: /*wish*/ ctx[6].title,
    				subtitle: /*wish*/ ctx[6].subtitle,
    				address: /*wish*/ ctx[6].address,
    				image: /*wish*/ ctx[6].image,
    				email: /*wish*/ ctx[6].email,
    				description: /*wish*/ ctx[6].description,
    				isFavorite: /*wish*/ ctx[6].isFavorite
    			},
    			$$inline: true
    		});

    	wishitem.$on("show-details", /*show_details_handler*/ ctx[4]);
    	wishitem.$on("edit-wish", /*edit_wish_handler*/ ctx[5]);

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			div = element("div");
    			create_component(wishitem.$$.fragment);
    			t = space();
    			add_location(div, file$7, 23, 4, 609);
    			this.first = div;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(wishitem, div, null);
    			append_dev(div, t);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const wishitem_changes = {};
    			if (dirty & /*filterFavs*/ 1) wishitem_changes.id = /*wish*/ ctx[6].id;
    			if (dirty & /*filterFavs*/ 1) wishitem_changes.title = /*wish*/ ctx[6].title;
    			if (dirty & /*filterFavs*/ 1) wishitem_changes.subtitle = /*wish*/ ctx[6].subtitle;
    			if (dirty & /*filterFavs*/ 1) wishitem_changes.address = /*wish*/ ctx[6].address;
    			if (dirty & /*filterFavs*/ 1) wishitem_changes.image = /*wish*/ ctx[6].image;
    			if (dirty & /*filterFavs*/ 1) wishitem_changes.email = /*wish*/ ctx[6].email;
    			if (dirty & /*filterFavs*/ 1) wishitem_changes.description = /*wish*/ ctx[6].description;
    			if (dirty & /*filterFavs*/ 1) wishitem_changes.isFavorite = /*wish*/ ctx[6].isFavorite;
    			wishitem.$set(wishitem_changes);
    		},
    		r: function measure() {
    			rect = div.getBoundingClientRect();
    		},
    		f: function fix() {
    			fix_position(div);
    			stop_animation();
    			add_transform(div, rect);
    		},
    		a: function animate() {
    			stop_animation();
    			stop_animation = create_animation(div, rect, flip, { duration: 400 });
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(wishitem.$$.fragment, local);

    			add_render_callback(() => {
    				if (!div_transition) div_transition = create_bidirectional_transition(div, scale, {}, true);
    				div_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(wishitem.$$.fragment, local);
    			if (!div_transition) div_transition = create_bidirectional_transition(div, scale, {}, false);
    			div_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(wishitem);
    			if (detaching && div_transition) div_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(23:2) {#each filterFavs as wish (wish.id)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let section0;
    	let wishfilter;
    	let t;
    	let section1;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let current;
    	wishfilter = new WishFilter({ $$inline: true });
    	wishfilter.$on("filter-wishes", /*setFilter*/ ctx[1]);
    	let each_value = /*filterFavs*/ ctx[0];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*wish*/ ctx[6].id;
    	validate_each_keys(ctx, each_value, get_each_context, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			section0 = element("section");
    			create_component(wishfilter.$$.fragment);
    			t = space();
    			section1 = element("section");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(section0, "id", "wish-controls");
    			attr_dev(section0, "class", "svelte-1xj8aeq");
    			add_location(section0, file$7, 17, 0, 457);
    			attr_dev(section1, "id", "wishes");
    			attr_dev(section1, "class", "svelte-1xj8aeq");
    			add_location(section1, file$7, 21, 0, 544);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section0, anchor);
    			mount_component(wishfilter, section0, null);
    			insert_dev(target, t, anchor);
    			insert_dev(target, section1, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(section1, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*filterFavs*/ 1) {
    				each_value = /*filterFavs*/ ctx[0];
    				validate_each_argument(each_value);
    				group_outros();
    				for (let i = 0; i < each_blocks.length; i += 1) each_blocks[i].r();
    				validate_each_keys(ctx, each_value, get_each_context, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, section1, fix_and_outro_and_destroy_block, create_each_block, null, get_each_context);
    				for (let i = 0; i < each_blocks.length; i += 1) each_blocks[i].a();
    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(wishfilter.$$.fragment, local);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(wishfilter.$$.fragment, local);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section0);
    			destroy_component(wishfilter);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(section1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let filterFavs;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('WishGrid', slots, []);
    	let { wishes } = $$props;
    	let { filterFavorites = false } = $$props;

    	const setFilter = wish => {
    		$$invalidate(2, filterFavorites = wish.detail === 1);
    	};

    	const writable_props = ['wishes', 'filterFavorites'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$2.warn(`<WishGrid> was created with unknown prop '${key}'`);
    	});

    	function show_details_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function edit_wish_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ('wishes' in $$props) $$invalidate(3, wishes = $$props.wishes);
    		if ('filterFavorites' in $$props) $$invalidate(2, filterFavorites = $$props.filterFavorites);
    	};

    	$$self.$capture_state = () => ({
    		WishItem,
    		WishFilter,
    		scale,
    		flip,
    		wishes,
    		filterFavorites,
    		setFilter,
    		filterFavs
    	});

    	$$self.$inject_state = $$props => {
    		if ('wishes' in $$props) $$invalidate(3, wishes = $$props.wishes);
    		if ('filterFavorites' in $$props) $$invalidate(2, filterFavorites = $$props.filterFavorites);
    		if ('filterFavs' in $$props) $$invalidate(0, filterFavs = $$props.filterFavs);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*filterFavorites, wishes*/ 12) {
    			$$invalidate(0, filterFavs = filterFavorites
    			? wishes.filter(e => e.isFavorite)
    			: wishes);
    		}

    		if ($$self.$$.dirty & /*filterFavs*/ 1) {
    			console.log(filterFavs, "favs");
    		}
    	};

    	return [
    		filterFavs,
    		setFilter,
    		filterFavorites,
    		wishes,
    		show_details_handler,
    		edit_wish_handler
    	];
    }

    class WishGrid extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, { wishes: 3, filterFavorites: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "WishGrid",
    			options,
    			id: create_fragment$7.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*wishes*/ ctx[3] === undefined && !('wishes' in props)) {
    			console_1$2.warn("<WishGrid> was created without expected prop 'wishes'");
    		}
    	}

    	get wishes() {
    		throw new Error("<WishGrid>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set wishes(value) {
    		throw new Error("<WishGrid>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get filterFavorites() {
    		throw new Error("<WishGrid>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set filterFavorites(value) {
    		throw new Error("<WishGrid>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const validator = (value) => {
      return value.trim().length === 0;
    };

    /* src/UI/TextInput.svelte generated by Svelte v3.42.1 */
    const file$6 = "src/UI/TextInput.svelte";

    // (27:2) {:else}
    function create_else_block$1(ctx) {
    	let input;
    	let input_placeholder_value;
    	let input_class_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			input = element("input");
    			attr_dev(input, "type", /*type*/ ctx[2]);
    			input.value = /*value*/ ctx[4];
    			attr_dev(input, "id", /*id*/ ctx[3]);
    			attr_dev(input, "placeholder", input_placeholder_value = /*typed*/ ctx[5] ? /*validityMessage*/ ctx[6] : "");

    			attr_dev(input, "class", input_class_value = "" + (null_to_empty(validator(/*value*/ ctx[4]) && /*typed*/ ctx[5]
    			? "invalid"
    			: "") + " svelte-1a23t8p"));

    			add_location(input, file$6, 27, 4, 549);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", /*input_handler_1*/ ctx[8], false, false, false),
    					listen_dev(input, "blur", /*blur_handler_1*/ ctx[10], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*type*/ 4) {
    				attr_dev(input, "type", /*type*/ ctx[2]);
    			}

    			if (dirty & /*value*/ 16 && input.value !== /*value*/ ctx[4]) {
    				prop_dev(input, "value", /*value*/ ctx[4]);
    			}

    			if (dirty & /*id*/ 8) {
    				attr_dev(input, "id", /*id*/ ctx[3]);
    			}

    			if (dirty & /*typed*/ 32 && input_placeholder_value !== (input_placeholder_value = /*typed*/ ctx[5] ? /*validityMessage*/ ctx[6] : "")) {
    				attr_dev(input, "placeholder", input_placeholder_value);
    			}

    			if (dirty & /*value, typed*/ 48 && input_class_value !== (input_class_value = "" + (null_to_empty(validator(/*value*/ ctx[4]) && /*typed*/ ctx[5]
    			? "invalid"
    			: "") + " svelte-1a23t8p"))) {
    				attr_dev(input, "class", input_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(27:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (17:2) {#if type === "textarea"}
    function create_if_block$2(ctx) {
    	let textarea;
    	let textarea_class_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			textarea = element("textarea");
    			attr_dev(textarea, "type", /*type*/ ctx[2]);
    			textarea.value = /*value*/ ctx[4];
    			attr_dev(textarea, "row", /*row*/ ctx[1]);
    			attr_dev(textarea, "id", /*id*/ ctx[3]);

    			attr_dev(textarea, "class", textarea_class_value = "" + (null_to_empty(validator(/*value*/ ctx[4]) && /*typed*/ ctx[5]
    			? "invalid"
    			: "") + " svelte-1a23t8p"));

    			add_location(textarea, file$6, 17, 4, 359);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, textarea, anchor);

    			if (!mounted) {
    				dispose = [
    					listen_dev(textarea, "input", /*input_handler*/ ctx[7], false, false, false),
    					listen_dev(textarea, "blur", /*blur_handler*/ ctx[9], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*type*/ 4) {
    				attr_dev(textarea, "type", /*type*/ ctx[2]);
    			}

    			if (dirty & /*value*/ 16) {
    				prop_dev(textarea, "value", /*value*/ ctx[4]);
    			}

    			if (dirty & /*row*/ 2) {
    				attr_dev(textarea, "row", /*row*/ ctx[1]);
    			}

    			if (dirty & /*id*/ 8) {
    				attr_dev(textarea, "id", /*id*/ ctx[3]);
    			}

    			if (dirty & /*value, typed*/ 48 && textarea_class_value !== (textarea_class_value = "" + (null_to_empty(validator(/*value*/ ctx[4]) && /*typed*/ ctx[5]
    			? "invalid"
    			: "") + " svelte-1a23t8p"))) {
    				attr_dev(textarea, "class", textarea_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(textarea);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(17:2) {#if type === \\\"textarea\\\"}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let div;
    	let label_1;
    	let t0;
    	let t1;

    	function select_block_type(ctx, dirty) {
    		if (/*type*/ ctx[2] === "textarea") return create_if_block$2;
    		return create_else_block$1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			label_1 = element("label");
    			t0 = text(/*label*/ ctx[0]);
    			t1 = space();
    			if_block.c();
    			attr_dev(label_1, "for", /*id*/ ctx[3]);
    			attr_dev(label_1, "class", "svelte-1a23t8p");
    			add_location(label_1, file$6, 15, 2, 295);
    			attr_dev(div, "class", "form-control svelte-1a23t8p");
    			add_location(div, file$6, 14, 0, 266);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, label_1);
    			append_dev(label_1, t0);
    			append_dev(div, t1);
    			if_block.m(div, null);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*label*/ 1) set_data_dev(t0, /*label*/ ctx[0]);

    			if (dirty & /*id*/ 8) {
    				attr_dev(label_1, "for", /*id*/ ctx[3]);
    			}

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div, null);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('TextInput', slots, []);
    	let { label } = $$props;
    	let { row = "" } = $$props;
    	let { type = "text" } = $$props;
    	let { id } = $$props;
    	let { value } = $$props;
    	let validityMessage = "Please input valid information.";
    	let typed = false;
    	const writable_props = ['label', 'row', 'type', 'id', 'value'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<TextInput> was created with unknown prop '${key}'`);
    	});

    	function input_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function input_handler_1(event) {
    		bubble.call(this, $$self, event);
    	}

    	const blur_handler = () => $$invalidate(5, typed = true);
    	const blur_handler_1 = () => $$invalidate(5, typed = true);

    	$$self.$$set = $$props => {
    		if ('label' in $$props) $$invalidate(0, label = $$props.label);
    		if ('row' in $$props) $$invalidate(1, row = $$props.row);
    		if ('type' in $$props) $$invalidate(2, type = $$props.type);
    		if ('id' in $$props) $$invalidate(3, id = $$props.id);
    		if ('value' in $$props) $$invalidate(4, value = $$props.value);
    	};

    	$$self.$capture_state = () => ({
    		validator,
    		label,
    		row,
    		type,
    		id,
    		value,
    		validityMessage,
    		typed
    	});

    	$$self.$inject_state = $$props => {
    		if ('label' in $$props) $$invalidate(0, label = $$props.label);
    		if ('row' in $$props) $$invalidate(1, row = $$props.row);
    		if ('type' in $$props) $$invalidate(2, type = $$props.type);
    		if ('id' in $$props) $$invalidate(3, id = $$props.id);
    		if ('value' in $$props) $$invalidate(4, value = $$props.value);
    		if ('validityMessage' in $$props) $$invalidate(6, validityMessage = $$props.validityMessage);
    		if ('typed' in $$props) $$invalidate(5, typed = $$props.typed);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		label,
    		row,
    		type,
    		id,
    		value,
    		typed,
    		validityMessage,
    		input_handler,
    		input_handler_1,
    		blur_handler,
    		blur_handler_1
    	];
    }

    class TextInput extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {
    			label: 0,
    			row: 1,
    			type: 2,
    			id: 3,
    			value: 4
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TextInput",
    			options,
    			id: create_fragment$6.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*label*/ ctx[0] === undefined && !('label' in props)) {
    			console.warn("<TextInput> was created without expected prop 'label'");
    		}

    		if (/*id*/ ctx[3] === undefined && !('id' in props)) {
    			console.warn("<TextInput> was created without expected prop 'id'");
    		}

    		if (/*value*/ ctx[4] === undefined && !('value' in props)) {
    			console.warn("<TextInput> was created without expected prop 'value'");
    		}
    	}

    	get label() {
    		throw new Error("<TextInput>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set label(value) {
    		throw new Error("<TextInput>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get row() {
    		throw new Error("<TextInput>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set row(value) {
    		throw new Error("<TextInput>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get type() {
    		throw new Error("<TextInput>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set type(value) {
    		throw new Error("<TextInput>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get id() {
    		throw new Error("<TextInput>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<TextInput>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<TextInput>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<TextInput>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/UI/Modal.svelte generated by Svelte v3.42.1 */
    const file$5 = "src/UI/Modal.svelte";
    const get_footer_slot_changes = dirty => ({});
    const get_footer_slot_context = ctx => ({});

    // (21:6) <Button on:click={() => dispatch("close")}>
    function create_default_slot$3(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Cancel");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$3.name,
    		type: "slot",
    		source: "(21:6) <Button on:click={() => dispatch(\\\"close\\\")}>",
    		ctx
    	});

    	return block;
    }

    // (20:24)        
    function fallback_block(ctx) {
    	let button;
    	let current;

    	button = new Button({
    			props: {
    				$$slots: { default: [create_default_slot$3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", /*click_handler_1*/ ctx[4]);

    	const block = {
    		c: function create() {
    			create_component(button.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(button, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const button_changes = {};

    			if (dirty & /*$$scope*/ 32) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(button, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block.name,
    		type: "fallback",
    		source: "(20:24)        ",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let div0;
    	let div0_transition;
    	let t0;
    	let div1;
    	let h1;
    	let t1;
    	let t2;
    	let t3;
    	let footer;
    	let div1_transition;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[2].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[5], null);
    	const footer_slot_template = /*#slots*/ ctx[2].footer;
    	const footer_slot = create_slot(footer_slot_template, ctx, /*$$scope*/ ctx[5], get_footer_slot_context);
    	const footer_slot_or_fallback = footer_slot || fallback_block(ctx);

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			t0 = space();
    			div1 = element("div");
    			h1 = element("h1");
    			t1 = text(/*title*/ ctx[0]);
    			t2 = space();
    			if (default_slot) default_slot.c();
    			t3 = space();
    			footer = element("footer");
    			if (footer_slot_or_fallback) footer_slot_or_fallback.c();
    			attr_dev(div0, "class", "modal-backdrop svelte-1wfedfe");
    			add_location(div0, file$5, 10, 0, 234);
    			attr_dev(h1, "class", "svelte-1wfedfe");
    			add_location(h1, file$5, 16, 2, 373);
    			attr_dev(footer, "class", "svelte-1wfedfe");
    			add_location(footer, file$5, 18, 2, 403);
    			attr_dev(div1, "class", "modal svelte-1wfedfe");
    			add_location(div1, file$5, 15, 0, 323);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, h1);
    			append_dev(h1, t1);
    			append_dev(div1, t2);

    			if (default_slot) {
    				default_slot.m(div1, null);
    			}

    			append_dev(div1, t3);
    			append_dev(div1, footer);

    			if (footer_slot_or_fallback) {
    				footer_slot_or_fallback.m(footer, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div0, "click", /*click_handler*/ ctx[3], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*title*/ 1) set_data_dev(t1, /*title*/ ctx[0]);

    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 32)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[5],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[5])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[5], dirty, null),
    						null
    					);
    				}
    			}

    			if (footer_slot) {
    				if (footer_slot.p && (!current || dirty & /*$$scope*/ 32)) {
    					update_slot_base(
    						footer_slot,
    						footer_slot_template,
    						ctx,
    						/*$$scope*/ ctx[5],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[5])
    						: get_slot_changes(footer_slot_template, /*$$scope*/ ctx[5], dirty, get_footer_slot_changes),
    						get_footer_slot_context
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!div0_transition) div0_transition = create_bidirectional_transition(div0, fade, {}, true);
    				div0_transition.run(1);
    			});

    			transition_in(default_slot, local);
    			transition_in(footer_slot_or_fallback, local);

    			add_render_callback(() => {
    				if (!div1_transition) div1_transition = create_bidirectional_transition(div1, fly, { y: 300 }, true);
    				div1_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!div0_transition) div0_transition = create_bidirectional_transition(div0, fade, {}, false);
    			div0_transition.run(0);
    			transition_out(default_slot, local);
    			transition_out(footer_slot_or_fallback, local);
    			if (!div1_transition) div1_transition = create_bidirectional_transition(div1, fly, { y: 300 }, false);
    			div1_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching && div0_transition) div0_transition.end();
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div1);
    			if (default_slot) default_slot.d(detaching);
    			if (footer_slot_or_fallback) footer_slot_or_fallback.d(detaching);
    			if (detaching && div1_transition) div1_transition.end();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Modal', slots, ['default','footer']);
    	let { title = "" } = $$props;
    	const dispatch = createEventDispatcher();
    	const writable_props = ['title'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Modal> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => dispatch("cancel");
    	const click_handler_1 = () => dispatch("close");

    	$$self.$$set = $$props => {
    		if ('title' in $$props) $$invalidate(0, title = $$props.title);
    		if ('$$scope' in $$props) $$invalidate(5, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		Button,
    		fly,
    		fade,
    		title,
    		dispatch
    	});

    	$$self.$inject_state = $$props => {
    		if ('title' in $$props) $$invalidate(0, title = $$props.title);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [title, dispatch, slots, click_handler, click_handler_1, $$scope];
    }

    class Modal extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { title: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Modal",
    			options,
    			id: create_fragment$5.name
    		});
    	}

    	get title() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Components/WishForm.svelte generated by Svelte v3.42.1 */

    const { Error: Error_1$2, console: console_1$1 } = globals;
    const file$4 = "src/Components/WishForm.svelte";

    // (136:0) <Modal title="Create New Wish Item" on:cancel={cancelForm}>
    function create_default_slot_3(ctx) {
    	let div6;
    	let form;
    	let div0;
    	let textinput0;
    	let t0;
    	let div1;
    	let textinput1;
    	let t1;
    	let div2;
    	let textinput2;
    	let t2;
    	let div3;
    	let textinput3;
    	let t3;
    	let div4;
    	let textinput4;
    	let t4;
    	let div5;
    	let textinput5;
    	let current;
    	let mounted;
    	let dispose;

    	textinput0 = new TextInput({
    			props: {
    				id: "title",
    				value: /*title*/ ctx[1],
    				label: "Title"
    			},
    			$$inline: true
    		});

    	textinput0.$on("input", /*input_handler*/ ctx[12]);

    	textinput1 = new TextInput({
    			props: {
    				id: "subtitle",
    				value: /*subtitle*/ ctx[2],
    				label: "Subtitle"
    			},
    			$$inline: true
    		});

    	textinput1.$on("input", /*input_handler_1*/ ctx[13]);

    	textinput2 = new TextInput({
    			props: {
    				id: "address",
    				value: /*address*/ ctx[3],
    				label: "Address"
    			},
    			$$inline: true
    		});

    	textinput2.$on("input", /*input_handler_2*/ ctx[14]);

    	textinput3 = new TextInput({
    			props: {
    				type: "url",
    				id: "image",
    				value: /*image*/ ctx[4],
    				label: "Image"
    			},
    			$$inline: true
    		});

    	textinput3.$on("input", /*input_handler_3*/ ctx[15]);

    	textinput4 = new TextInput({
    			props: {
    				type: "email",
    				id: "email",
    				value: /*email*/ ctx[5],
    				label: "Email"
    			},
    			$$inline: true
    		});

    	textinput4.$on("input", /*input_handler_4*/ ctx[16]);

    	textinput5 = new TextInput({
    			props: {
    				row: "3",
    				id: "description",
    				value: /*description*/ ctx[6],
    				label: "Description"
    			},
    			$$inline: true
    		});

    	textinput5.$on("input", /*input_handler_5*/ ctx[17]);

    	const block = {
    		c: function create() {
    			div6 = element("div");
    			form = element("form");
    			div0 = element("div");
    			create_component(textinput0.$$.fragment);
    			t0 = space();
    			div1 = element("div");
    			create_component(textinput1.$$.fragment);
    			t1 = space();
    			div2 = element("div");
    			create_component(textinput2.$$.fragment);
    			t2 = space();
    			div3 = element("div");
    			create_component(textinput3.$$.fragment);
    			t3 = space();
    			div4 = element("div");
    			create_component(textinput4.$$.fragment);
    			t4 = space();
    			div5 = element("div");
    			create_component(textinput5.$$.fragment);
    			attr_dev(div0, "class", "form-control");
    			add_location(div0, file$4, 138, 6, 3368);
    			attr_dev(div1, "class", "form-control");
    			add_location(div1, file$4, 146, 6, 3572);
    			attr_dev(div2, "class", "form-control");
    			add_location(div2, file$4, 154, 6, 3788);
    			attr_dev(div3, "class", "form-control");
    			add_location(div3, file$4, 162, 6, 4000);
    			attr_dev(div4, "class", "form-control");
    			add_location(div4, file$4, 172, 6, 4226);
    			attr_dev(div5, "class", "form-control");
    			add_location(div5, file$4, 181, 6, 4453);
    			attr_dev(form, "class", "svelte-16v3jr5");
    			add_location(form, file$4, 137, 4, 3317);
    			attr_dev(div6, "class", "form-section svelte-16v3jr5");
    			add_location(div6, file$4, 136, 2, 3286);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div6, anchor);
    			append_dev(div6, form);
    			append_dev(form, div0);
    			mount_component(textinput0, div0, null);
    			append_dev(form, t0);
    			append_dev(form, div1);
    			mount_component(textinput1, div1, null);
    			append_dev(form, t1);
    			append_dev(form, div2);
    			mount_component(textinput2, div2, null);
    			append_dev(form, t2);
    			append_dev(form, div3);
    			mount_component(textinput3, div3, null);
    			append_dev(form, t3);
    			append_dev(form, div4);
    			mount_component(textinput4, div4, null);
    			append_dev(form, t4);
    			append_dev(form, div5);
    			mount_component(textinput5, div5, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(form, "submit", prevent_default(/*submitForm*/ ctx[8]), false, true, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			const textinput0_changes = {};
    			if (dirty & /*title*/ 2) textinput0_changes.value = /*title*/ ctx[1];
    			textinput0.$set(textinput0_changes);
    			const textinput1_changes = {};
    			if (dirty & /*subtitle*/ 4) textinput1_changes.value = /*subtitle*/ ctx[2];
    			textinput1.$set(textinput1_changes);
    			const textinput2_changes = {};
    			if (dirty & /*address*/ 8) textinput2_changes.value = /*address*/ ctx[3];
    			textinput2.$set(textinput2_changes);
    			const textinput3_changes = {};
    			if (dirty & /*image*/ 16) textinput3_changes.value = /*image*/ ctx[4];
    			textinput3.$set(textinput3_changes);
    			const textinput4_changes = {};
    			if (dirty & /*email*/ 32) textinput4_changes.value = /*email*/ ctx[5];
    			textinput4.$set(textinput4_changes);
    			const textinput5_changes = {};
    			if (dirty & /*description*/ 64) textinput5_changes.value = /*description*/ ctx[6];
    			textinput5.$set(textinput5_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(textinput0.$$.fragment, local);
    			transition_in(textinput1.$$.fragment, local);
    			transition_in(textinput2.$$.fragment, local);
    			transition_in(textinput3.$$.fragment, local);
    			transition_in(textinput4.$$.fragment, local);
    			transition_in(textinput5.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(textinput0.$$.fragment, local);
    			transition_out(textinput1.$$.fragment, local);
    			transition_out(textinput2.$$.fragment, local);
    			transition_out(textinput3.$$.fragment, local);
    			transition_out(textinput4.$$.fragment, local);
    			transition_out(textinput5.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div6);
    			destroy_component(textinput0);
    			destroy_component(textinput1);
    			destroy_component(textinput2);
    			destroy_component(textinput3);
    			destroy_component(textinput4);
    			destroy_component(textinput5);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3.name,
    		type: "slot",
    		source: "(136:0) <Modal title=\\\"Create New Wish Item\\\" on:cancel={cancelForm}>",
    		ctx
    	});

    	return block;
    }

    // (194:4) <Button       type="button"       availability={!valid ? true : false}       on:click={submitForm}>
    function create_default_slot_2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Submit");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2.name,
    		type: "slot",
    		source: "(194:4) <Button       type=\\\"button\\\"       availability={!valid ? true : false}       on:click={submitForm}>",
    		ctx
    	});

    	return block;
    }

    // (199:4) <Button type="button" on:click={cancelForm}>
    function create_default_slot_1$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Cancel");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$1.name,
    		type: "slot",
    		source: "(199:4) <Button type=\\\"button\\\" on:click={cancelForm}>",
    		ctx
    	});

    	return block;
    }

    // (200:4) {#if editMode}
    function create_if_block$1(ctx) {
    	let button;
    	let current;

    	button = new Button({
    			props: {
    				$$slots: { default: [create_default_slot$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", /*removeWish*/ ctx[10]);

    	const block = {
    		c: function create() {
    			create_component(button.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(button, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const button_changes = {};

    			if (dirty & /*$$scope*/ 1048576) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(button, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(200:4) {#if editMode}",
    		ctx
    	});

    	return block;
    }

    // (201:6) <Button on:click={removeWish}>
    function create_default_slot$2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Remove Wish");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$2.name,
    		type: "slot",
    		source: "(201:6) <Button on:click={removeWish}>",
    		ctx
    	});

    	return block;
    }

    // (193:2) 
    function create_footer_slot(ctx) {
    	let div;
    	let button0;
    	let t0;
    	let button1;
    	let t1;
    	let current;

    	button0 = new Button({
    			props: {
    				type: "button",
    				availability: !/*valid*/ ctx[7] ? true : false,
    				$$slots: { default: [create_default_slot_2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button0.$on("click", /*submitForm*/ ctx[8]);

    	button1 = new Button({
    			props: {
    				type: "button",
    				$$slots: { default: [create_default_slot_1$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button1.$on("click", /*cancelForm*/ ctx[9]);
    	let if_block = /*editMode*/ ctx[0] && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(button0.$$.fragment);
    			t0 = space();
    			create_component(button1.$$.fragment);
    			t1 = space();
    			if (if_block) if_block.c();
    			attr_dev(div, "slot", "footer");
    			add_location(div, file$4, 192, 2, 4716);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(button0, div, null);
    			append_dev(div, t0);
    			mount_component(button1, div, null);
    			append_dev(div, t1);
    			if (if_block) if_block.m(div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const button0_changes = {};
    			if (dirty & /*valid*/ 128) button0_changes.availability = !/*valid*/ ctx[7] ? true : false;

    			if (dirty & /*$$scope*/ 1048576) {
    				button0_changes.$$scope = { dirty, ctx };
    			}

    			button0.$set(button0_changes);
    			const button1_changes = {};

    			if (dirty & /*$$scope*/ 1048576) {
    				button1_changes.$$scope = { dirty, ctx };
    			}

    			button1.$set(button1_changes);

    			if (/*editMode*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*editMode*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div, null);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button0.$$.fragment, local);
    			transition_in(button1.$$.fragment, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button0.$$.fragment, local);
    			transition_out(button1.$$.fragment, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(button0);
    			destroy_component(button1);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_footer_slot.name,
    		type: "slot",
    		source: "(193:2) ",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let modal;
    	let current;

    	modal = new Modal({
    			props: {
    				title: "Create New Wish Item",
    				$$slots: {
    					footer: [create_footer_slot],
    					default: [create_default_slot_3]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	modal.$on("cancel", /*cancelForm*/ ctx[9]);

    	const block = {
    		c: function create() {
    			create_component(modal.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error_1$2("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(modal, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const modal_changes = {};

    			if (dirty & /*$$scope, editMode, valid, description, email, image, address, subtitle, title*/ 1048831) {
    				modal_changes.$$scope = { dirty, ctx };
    			}

    			modal.$set(modal_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(modal.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(modal.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(modal, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('WishForm', slots, []);
    	let title = "";
    	let subtitle = "";
    	let address = "";
    	let image = "";
    	let email = "";
    	let description = "";
    	let isFavorite = false;
    	let valid = false;
    	let { id = null } = $$props;
    	let { editMode = false } = $$props;
    	const dispatch = createEventDispatcher();

    	const submitForm = () => {
    		dispatch("save-form-data");

    		const wishData = {
    			title,
    			subtitle,
    			address,
    			image,
    			email,
    			description,
    			isFavorite
    		};

    		if (id) {
    			fetch(`https://wishlist-app-d8867-default-rtdb.firebaseio.com/wishes/${id}.json`, {
    				method: "PATCH",
    				body: JSON.stringify({ ...wishData, isFavorite: false }),
    				headers: { "Content-Type": "application/json" }
    			}).then(res => {
    				if (!res.ok) {
    					throw new Error("Something went wrong.");
    				}

    				customWishesStore.updateWish(id, wishData);
    			}).catch(err => {
    				console.log(err);
    			});
    		} else {
    			fetch("https://wishlist-app-d8867-default-rtdb.firebaseio.com/wishes.json", {
    				method: "POST",
    				body: JSON.stringify({ ...wishData, isFavorite: false }),
    				headers: { "Content-Type": "application/json" }
    			}).then(res => {
    				if (!res.ok) {
    					throw new Error("Something went wrong.");
    				}

    				return res.json();
    			}).then(data => {
    				customWishesStore.addWish({
    					...wishData,
    					isFavorite: false,
    					id: data.name
    				});

    				for (let i in data) {
    					console.log({ ...data[i] }, "data");
    				}
    			}).catch(err => {
    				console.log(err);
    			});
    		}
    	};

    	const cancelForm = () => {
    		dispatch("cancel");
    	};

    	const removeWish = () => {
    		dispatch("remove-wish");

    		fetch(`https://wishlist-app-d8867-default-rtdb.firebaseio.com/wishes/${id}.json`, { method: "DELETE" }).then(res => {
    			if (!res.ok) {
    				throw new Error("Something went wrong.");
    			}

    			customWishesStore.removeWish(id);
    		}).catch(err => {
    			console.log(err);
    		});
    	};

    	const writable_props = ['id', 'editMode'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$1.warn(`<WishForm> was created with unknown prop '${key}'`);
    	});

    	const input_handler = wish => $$invalidate(1, title = wish.target.value);
    	const input_handler_1 = wish => $$invalidate(2, subtitle = wish.target.value);
    	const input_handler_2 = wish => $$invalidate(3, address = wish.target.value);
    	const input_handler_3 = wish => $$invalidate(4, image = wish.target.value);
    	const input_handler_4 = wish => $$invalidate(5, email = wish.target.value);
    	const input_handler_5 = wish => $$invalidate(6, description = wish.target.value);

    	$$self.$$set = $$props => {
    		if ('id' in $$props) $$invalidate(11, id = $$props.id);
    		if ('editMode' in $$props) $$invalidate(0, editMode = $$props.editMode);
    	};

    	$$self.$capture_state = () => ({
    		wishes: customWishesStore,
    		createEventDispatcher,
    		TextInput,
    		Button,
    		Modal,
    		validator,
    		title,
    		subtitle,
    		address,
    		image,
    		email,
    		description,
    		isFavorite,
    		valid,
    		id,
    		editMode,
    		dispatch,
    		submitForm,
    		cancelForm,
    		removeWish
    	});

    	$$self.$inject_state = $$props => {
    		if ('title' in $$props) $$invalidate(1, title = $$props.title);
    		if ('subtitle' in $$props) $$invalidate(2, subtitle = $$props.subtitle);
    		if ('address' in $$props) $$invalidate(3, address = $$props.address);
    		if ('image' in $$props) $$invalidate(4, image = $$props.image);
    		if ('email' in $$props) $$invalidate(5, email = $$props.email);
    		if ('description' in $$props) $$invalidate(6, description = $$props.description);
    		if ('isFavorite' in $$props) isFavorite = $$props.isFavorite;
    		if ('valid' in $$props) $$invalidate(7, valid = $$props.valid);
    		if ('id' in $$props) $$invalidate(11, id = $$props.id);
    		if ('editMode' in $$props) $$invalidate(0, editMode = $$props.editMode);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*id*/ 2048) {
    			if (id) {
    				const unsubscribe = customWishesStore.subscribe(items => {
    					const wishItem = items.find(item => item.id === id);
    					$$invalidate(1, title = wishItem.title);
    					$$invalidate(2, subtitle = wishItem.subtitle);
    					$$invalidate(3, address = wishItem.address);
    					$$invalidate(4, image = wishItem.image);
    					$$invalidate(5, email = wishItem.email);
    					$$invalidate(6, description = wishItem.description);
    				});

    				unsubscribe();
    			}
    		}

    		if ($$self.$$.dirty & /*title, subtitle, address, image, email, description*/ 126) {
    			if (validator(title) || validator(subtitle) || validator(address) || validator(image) || validator(email) || validator(description)) {
    				$$invalidate(7, valid = false);
    			} else {
    				$$invalidate(7, valid = true);
    			}
    		}
    	};

    	return [
    		editMode,
    		title,
    		subtitle,
    		address,
    		image,
    		email,
    		description,
    		valid,
    		submitForm,
    		cancelForm,
    		removeWish,
    		id,
    		input_handler,
    		input_handler_1,
    		input_handler_2,
    		input_handler_3,
    		input_handler_4,
    		input_handler_5
    	];
    }

    class WishForm extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { id: 11, editMode: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "WishForm",
    			options,
    			id: create_fragment$4.name
    		});
    	}

    	get id() {
    		throw new Error_1$2("<WishForm>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error_1$2("<WishForm>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get editMode() {
    		throw new Error_1$2("<WishForm>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set editMode(value) {
    		throw new Error_1$2("<WishForm>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/UI/Loader.svelte generated by Svelte v3.42.1 */

    const file$3 = "src/UI/Loader.svelte";

    function create_fragment$3(ctx) {
    	let div1;
    	let div0;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			attr_dev(div0, "class", "lds-hourglass svelte-1vcym03");
    			add_location(div0, file$3, 1, 2, 24);
    			attr_dev(div1, "class", "loading svelte-1vcym03");
    			add_location(div1, file$3, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Loader', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Loader> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Loader extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Loader",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src/UI/Error.svelte generated by Svelte v3.42.1 */

    const { Error: Error_1$1 } = globals;
    const file$2 = "src/UI/Error.svelte";

    // (7:0) <Modal on:close>
    function create_default_slot$1(ctx) {
    	let div;
    	let p;
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			p = element("p");
    			t = text(/*message*/ ctx[0]);
    			add_location(p, file$2, 8, 4, 114);
    			add_location(div, file$2, 7, 2, 104);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, p);
    			append_dev(p, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*message*/ 1) set_data_dev(t, /*message*/ ctx[0]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(7:0) <Modal on:close>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let modal;
    	let current;

    	modal = new Modal({
    			props: {
    				$$slots: { default: [create_default_slot$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	modal.$on("close", /*close_handler*/ ctx[1]);

    	const block = {
    		c: function create() {
    			create_component(modal.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error_1$1("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(modal, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const modal_changes = {};

    			if (dirty & /*$$scope, message*/ 5) {
    				modal_changes.$$scope = { dirty, ctx };
    			}

    			modal.$set(modal_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(modal.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(modal.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(modal, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Error', slots, []);
    	let { message } = $$props;
    	const writable_props = ['message'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Error> was created with unknown prop '${key}'`);
    	});

    	function close_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ('message' in $$props) $$invalidate(0, message = $$props.message);
    	};

    	$$self.$capture_state = () => ({ Modal, message });

    	$$self.$inject_state = $$props => {
    		if ('message' in $$props) $$invalidate(0, message = $$props.message);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [message, close_handler];
    }

    class Error$1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { message: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Error",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*message*/ ctx[0] === undefined && !('message' in props)) {
    			console.warn("<Error> was created without expected prop 'message'");
    		}
    	}

    	get message() {
    		throw new Error_1$1("<Error>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set message(value) {
    		throw new Error_1$1("<Error>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Components/WishDetail.svelte generated by Svelte v3.42.1 */
    const file$1 = "src/Components/WishDetail.svelte";

    function create_fragment$1(ctx) {
    	let section;
    	let div0;
    	let img;
    	let img_src_value;
    	let img_alt_value;
    	let t0;
    	let div1;
    	let h1;
    	let t1_value = /*wishDetail*/ ctx[0].title + "";
    	let t1;
    	let t2;
    	let div6;
    	let h2;
    	let t3_value = /*wishDetail*/ ctx[0].subtitle + "";
    	let t3;
    	let t4;
    	let div2;
    	let t5;
    	let div3;
    	let p0;
    	let t6_value = /*wishDetail*/ ctx[0].address + "";
    	let t6;
    	let t7;
    	let div4;
    	let p1;
    	let t8_value = /*wishDetail*/ ctx[0].email + "";
    	let t8;
    	let t9;
    	let div5;
    	let p2;
    	let t10_value = /*wishDetail*/ ctx[0].description + "";
    	let t10;

    	const block = {
    		c: function create() {
    			section = element("section");
    			div0 = element("div");
    			img = element("img");
    			t0 = space();
    			div1 = element("div");
    			h1 = element("h1");
    			t1 = text(t1_value);
    			t2 = space();
    			div6 = element("div");
    			h2 = element("h2");
    			t3 = text(t3_value);
    			t4 = space();
    			div2 = element("div");
    			t5 = space();
    			div3 = element("div");
    			p0 = element("p");
    			t6 = text(t6_value);
    			t7 = space();
    			div4 = element("div");
    			p1 = element("p");
    			t8 = text(t8_value);
    			t9 = space();
    			div5 = element("div");
    			p2 = element("p");
    			t10 = text(t10_value);
    			if (!src_url_equal(img.src, img_src_value = /*wishDetail*/ ctx[0].image)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", img_alt_value = /*wishDetail*/ ctx[0].title);
    			attr_dev(img, "class", "svelte-10utsu1");
    			add_location(img, file$1, 26, 4, 590);
    			attr_dev(div0, "class", "image svelte-10utsu1");
    			add_location(div0, file$1, 25, 2, 566);
    			attr_dev(h1, "class", "svelte-10utsu1");
    			add_location(h1, file$1, 29, 4, 665);
    			add_location(div1, file$1, 28, 2, 655);
    			attr_dev(h2, "class", "svelte-10utsu1");
    			add_location(h2, file$1, 32, 4, 714);
    			add_location(div2, file$1, 33, 4, 749);
    			attr_dev(p0, "class", "svelte-10utsu1");
    			add_location(p0, file$1, 35, 6, 773);
    			add_location(div3, file$1, 34, 4, 761);
    			attr_dev(p1, "class", "svelte-10utsu1");
    			add_location(p1, file$1, 38, 6, 828);
    			add_location(div4, file$1, 37, 4, 816);
    			attr_dev(p2, "class", "svelte-10utsu1");
    			add_location(p2, file$1, 41, 6, 897);
    			attr_dev(div5, "class", "content svelte-10utsu1");
    			add_location(div5, file$1, 40, 4, 869);
    			add_location(div6, file$1, 31, 2, 704);
    			attr_dev(section, "class", "svelte-10utsu1");
    			add_location(section, file$1, 24, 0, 554);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div0);
    			append_dev(div0, img);
    			append_dev(section, t0);
    			append_dev(section, div1);
    			append_dev(div1, h1);
    			append_dev(h1, t1);
    			append_dev(section, t2);
    			append_dev(section, div6);
    			append_dev(div6, h2);
    			append_dev(h2, t3);
    			append_dev(div6, t4);
    			append_dev(div6, div2);
    			append_dev(div6, t5);
    			append_dev(div6, div3);
    			append_dev(div3, p0);
    			append_dev(p0, t6);
    			append_dev(div6, t7);
    			append_dev(div6, div4);
    			append_dev(div4, p1);
    			append_dev(p1, t8);
    			append_dev(div6, t9);
    			append_dev(div6, div5);
    			append_dev(div5, p2);
    			append_dev(p2, t10);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*wishDetail*/ 1 && !src_url_equal(img.src, img_src_value = /*wishDetail*/ ctx[0].image)) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*wishDetail*/ 1 && img_alt_value !== (img_alt_value = /*wishDetail*/ ctx[0].title)) {
    				attr_dev(img, "alt", img_alt_value);
    			}

    			if (dirty & /*wishDetail*/ 1 && t1_value !== (t1_value = /*wishDetail*/ ctx[0].title + "")) set_data_dev(t1, t1_value);
    			if (dirty & /*wishDetail*/ 1 && t3_value !== (t3_value = /*wishDetail*/ ctx[0].subtitle + "")) set_data_dev(t3, t3_value);
    			if (dirty & /*wishDetail*/ 1 && t6_value !== (t6_value = /*wishDetail*/ ctx[0].address + "")) set_data_dev(t6, t6_value);
    			if (dirty & /*wishDetail*/ 1 && t8_value !== (t8_value = /*wishDetail*/ ctx[0].email + "")) set_data_dev(t8, t8_value);
    			if (dirty & /*wishDetail*/ 1 && t10_value !== (t10_value = /*wishDetail*/ ctx[0].description + "")) set_data_dev(t10, t10_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('WishDetail', slots, []);
    	let { wishDetail } = $$props;
    	let { wishId } = $$props;

    	const unsubscribe = customWishesStore.subscribe(items => {
    		const item = { ...items.find(i => i.id === wishId) };

    		$$invalidate(0, wishDetail = {
    			title: item.title,
    			subtitle: item.subtitle,
    			address: item.address,
    			image: item.image,
    			email: item.email,
    			description: item.description,
    			isFavorite: item.isFavorite
    		});
    	});

    	onDestroy(() => {
    		unsubscribe();
    	});

    	const writable_props = ['wishDetail', 'wishId'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<WishDetail> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('wishDetail' in $$props) $$invalidate(0, wishDetail = $$props.wishDetail);
    		if ('wishId' in $$props) $$invalidate(1, wishId = $$props.wishId);
    	};

    	$$self.$capture_state = () => ({
    		onDestroy,
    		wishes: customWishesStore,
    		wishDetail,
    		wishId,
    		unsubscribe
    	});

    	$$self.$inject_state = $$props => {
    		if ('wishDetail' in $$props) $$invalidate(0, wishDetail = $$props.wishDetail);
    		if ('wishId' in $$props) $$invalidate(1, wishId = $$props.wishId);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [wishDetail, wishId];
    }

    class WishDetail extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { wishDetail: 0, wishId: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "WishDetail",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*wishDetail*/ ctx[0] === undefined && !('wishDetail' in props)) {
    			console.warn("<WishDetail> was created without expected prop 'wishDetail'");
    		}

    		if (/*wishId*/ ctx[1] === undefined && !('wishId' in props)) {
    			console.warn("<WishDetail> was created without expected prop 'wishId'");
    		}
    	}

    	get wishDetail() {
    		throw new Error("<WishDetail>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set wishDetail(value) {
    		throw new Error("<WishDetail>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get wishId() {
    		throw new Error("<WishDetail>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set wishId(value) {
    		throw new Error("<WishDetail>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/App.svelte generated by Svelte v3.42.1 */

    const { Error: Error_1, console: console_1 } = globals;
    const file = "src/App.svelte";

    // (88:2) {#if error}
    function create_if_block_4(ctx) {
    	let error_1;
    	let current;

    	error_1 = new Error$1({
    			props: { message: /*error*/ ctx[2].message },
    			$$inline: true
    		});

    	error_1.$on("close", /*closeError*/ ctx[13]);

    	const block = {
    		c: function create() {
    			create_component(error_1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(error_1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const error_1_changes = {};
    			if (dirty & /*error*/ 4) error_1_changes.message = /*error*/ ctx[2].message;
    			error_1.$set(error_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(error_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(error_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(error_1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(88:2) {#if error}",
    		ctx
    	});

    	return block;
    }

    // (113:34) 
    function create_if_block_3(ctx) {
    	let wishdetail;
    	let t;
    	let button;
    	let current;

    	wishdetail = new WishDetail({
    			props: { wishId: /*wishId*/ ctx[4].id },
    			$$inline: true
    		});

    	button = new Button({
    			props: {
    				$$slots: { default: [create_default_slot_1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", /*closeDetailCard*/ ctx[10]);

    	const block = {
    		c: function create() {
    			create_component(wishdetail.$$.fragment);
    			t = space();
    			create_component(button.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(wishdetail, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(button, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const wishdetail_changes = {};
    			if (dirty & /*wishId*/ 16) wishdetail_changes.wishId = /*wishId*/ ctx[4].id;
    			wishdetail.$set(wishdetail_changes);
    			const button_changes = {};

    			if (dirty & /*$$scope*/ 32768) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(wishdetail.$$.fragment, local);
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(wishdetail.$$.fragment, local);
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(wishdetail, detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(button, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(113:34) ",
    		ctx
    	});

    	return block;
    }

    // (92:4) {#if UIMode === "overview"}
    function create_if_block(ctx) {
    	let button;
    	let t0;
    	let t1;
    	let current_block_type_index;
    	let if_block1;
    	let if_block1_anchor;
    	let current;

    	button = new Button({
    			props: {
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", /*click_handler*/ ctx[14]);
    	let if_block0 = /*opened*/ ctx[3] && create_if_block_2(ctx);
    	const if_block_creators = [create_if_block_1, create_else_block];
    	const if_blocks = [];

    	function select_block_type_1(ctx, dirty) {
    		if (/*loading*/ ctx[5]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type_1(ctx);
    	if_block1 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			create_component(button.$$.fragment);
    			t0 = space();
    			if (if_block0) if_block0.c();
    			t1 = space();
    			if_block1.c();
    			if_block1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			mount_component(button, target, anchor);
    			insert_dev(target, t0, anchor);
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t1, anchor);
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const button_changes = {};

    			if (dirty & /*$$scope*/ 32768) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);

    			if (/*opened*/ ctx[3]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty & /*opened*/ 8) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_2(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(t1.parentNode, t1);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type_1(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block1 = if_blocks[current_block_type_index];

    				if (!if_block1) {
    					if_block1 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block1.c();
    				} else {
    					if_block1.p(ctx, dirty);
    				}

    				transition_in(if_block1, 1);
    				if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			transition_in(if_block0);
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			transition_out(if_block0);
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(button, detaching);
    			if (detaching) detach_dev(t0);
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t1);
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(92:4) {#if UIMode === \\\"overview\\\"}",
    		ctx
    	});

    	return block;
    }

    // (115:6) <Button on:click={closeDetailCard}>
    function create_default_slot_1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Back");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(115:6) <Button on:click={closeDetailCard}>",
    		ctx
    	});

    	return block;
    }

    // (93:6) <Button on:click={() => (opened = true)}>
    function create_default_slot(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("New Wish");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(93:6) <Button on:click={() => (opened = true)}>",
    		ctx
    	});

    	return block;
    }

    // (94:6) {#if opened}
    function create_if_block_2(ctx) {
    	let wishform;
    	let current;

    	wishform = new WishForm({
    			props: {
    				id: /*wishId*/ ctx[4].id,
    				editMode: /*editMode*/ ctx[1]
    			},
    			$$inline: true
    		});

    	wishform.$on("save-form-data", /*submitWishesHandler*/ ctx[7]);
    	wishform.$on("cancel", /*cancelWish*/ ctx[8]);
    	wishform.$on("remove-wish", /*removeWish*/ ctx[12]);

    	const block = {
    		c: function create() {
    			create_component(wishform.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(wishform, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const wishform_changes = {};
    			if (dirty & /*wishId*/ 16) wishform_changes.id = /*wishId*/ ctx[4].id;
    			if (dirty & /*editMode*/ 2) wishform_changes.editMode = /*editMode*/ ctx[1];
    			wishform.$set(wishform_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(wishform.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(wishform.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(wishform, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(94:6) {#if opened}",
    		ctx
    	});

    	return block;
    }

    // (105:6) {:else}
    function create_else_block(ctx) {
    	let wishgrid;
    	let current;

    	wishgrid = new WishGrid({
    			props: {
    				wishes: /*$wishes*/ ctx[6],
    				loading: /*loading*/ ctx[5]
    			},
    			$$inline: true
    		});

    	wishgrid.$on("show-details", /*showDetails*/ ctx[9]);
    	wishgrid.$on("edit-wish", /*editWish*/ ctx[11]);

    	const block = {
    		c: function create() {
    			create_component(wishgrid.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(wishgrid, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const wishgrid_changes = {};
    			if (dirty & /*$wishes*/ 64) wishgrid_changes.wishes = /*$wishes*/ ctx[6];
    			if (dirty & /*loading*/ 32) wishgrid_changes.loading = /*loading*/ ctx[5];
    			wishgrid.$set(wishgrid_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(wishgrid.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(wishgrid.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(wishgrid, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(105:6) {:else}",
    		ctx
    	});

    	return block;
    }

    // (103:6) {#if loading}
    function create_if_block_1(ctx) {
    	let loader;
    	let current;
    	loader = new Loader({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(loader.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(loader, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(loader.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(loader.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(loader, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(103:6) {#if loading}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let header;
    	let t0;
    	let main;
    	let t1;
    	let div;
    	let current_block_type_index;
    	let if_block1;
    	let current;
    	header = new Header({ $$inline: true });
    	let if_block0 = /*error*/ ctx[2] && create_if_block_4(ctx);
    	const if_block_creators = [create_if_block, create_if_block_3];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*UIMode*/ ctx[0] === "overview") return 0;
    		if (/*UIMode*/ ctx[0] === "detail") return 1;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type(ctx))) {
    		if_block1 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	const block = {
    		c: function create() {
    			create_component(header.$$.fragment);
    			t0 = space();
    			main = element("main");
    			if (if_block0) if_block0.c();
    			t1 = space();
    			div = element("div");
    			if (if_block1) if_block1.c();
    			attr_dev(div, "class", "wish-controls svelte-s7u34d");
    			add_location(div, file, 90, 2, 1937);
    			attr_dev(main, "class", "svelte-s7u34d");
    			add_location(main, file, 86, 0, 1846);
    		},
    		l: function claim(nodes) {
    			throw new Error_1("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(header, target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, main, anchor);
    			if (if_block0) if_block0.m(main, null);
    			append_dev(main, t1);
    			append_dev(main, div);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*error*/ ctx[2]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty & /*error*/ 4) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_4(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(main, t1);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if (~current_block_type_index) {
    					if_blocks[current_block_type_index].p(ctx, dirty);
    				}
    			} else {
    				if (if_block1) {
    					group_outros();

    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block1 = if_blocks[current_block_type_index];

    					if (!if_block1) {
    						if_block1 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block1.c();
    					} else {
    						if_block1.p(ctx, dirty);
    					}

    					transition_in(if_block1, 1);
    					if_block1.m(div, null);
    				} else {
    					if_block1 = null;
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(header.$$.fragment, local);
    			transition_in(if_block0);
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(header.$$.fragment, local);
    			transition_out(if_block0);
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(header, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(main);
    			if (if_block0) if_block0.d();

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d();
    			}
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let $wishes;
    	validate_store(customWishesStore, 'wishes');
    	component_subscribe($$self, customWishesStore, $$value => $$invalidate(6, $wishes = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	let opened = false;
    	let wishId = {};
    	let loading = true;
    	let { UIMode = "overview" } = $$props;
    	let { editMode = false } = $$props;
    	let { error } = $$props;

    	fetch("https://wishlist-app-d8867-default-rtdb.firebaseio.com/wishes.json").then(res => {
    		if (!res.ok) {
    			throw new Error$1("Something went wrong.");
    		}

    		return res.json();
    	}).then(data => {
    		let loadedWishes = [];

    		for (let key in data) {
    			loadedWishes.push({ ...data[key], id: key });
    			console.log(data);
    		}

    		setTimeout(
    			() => {
    				$$invalidate(5, loading = false);
    				customWishesStore.setWishes(loadedWishes);
    			},
    			1000
    		);
    	}).catch(err => {
    		$$invalidate(2, error = err);
    		console.log(err);
    	});

    	const submitWishesHandler = () => {
    		$$invalidate(0, UIMode = "overview");
    		$$invalidate(3, opened = false);
    		$$invalidate(4, wishId.id = null, wishId);
    	};

    	const cancelWish = () => {
    		$$invalidate(3, opened = false);
    		$$invalidate(4, wishId.id = null, wishId);
    	};

    	const showDetails = wish => {
    		$$invalidate(4, wishId.id = wish.detail, wishId);
    		$$invalidate(0, UIMode = "detail");
    	};

    	const closeDetailCard = () => {
    		$$invalidate(0, UIMode = "overview");
    		$$invalidate(4, wishId.id = null, wishId);
    	};

    	const editWish = wish => {
    		$$invalidate(3, opened = true);
    		$$invalidate(4, wishId.id = wish.detail, wishId);
    		$$invalidate(1, editMode = true);
    	};

    	const removeWish = () => {
    		const id = wishId.id;
    		customWishesStore.removeWish(id);
    		$$invalidate(3, opened = false);
    		$$invalidate(4, wishId.id = null, wishId);
    		$$invalidate(1, editMode = false);
    	};

    	const closeError = () => {
    		$$invalidate(2, error = null);
    	};

    	const writable_props = ['UIMode', 'editMode', 'error'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => $$invalidate(3, opened = true);

    	$$self.$$set = $$props => {
    		if ('UIMode' in $$props) $$invalidate(0, UIMode = $$props.UIMode);
    		if ('editMode' in $$props) $$invalidate(1, editMode = $$props.editMode);
    		if ('error' in $$props) $$invalidate(2, error = $$props.error);
    	};

    	$$self.$capture_state = () => ({
    		wishes: customWishesStore,
    		Header,
    		WishGrid,
    		WishForm,
    		Button,
    		Loader,
    		Error: Error$1,
    		WishDetail,
    		opened,
    		wishId,
    		loading,
    		UIMode,
    		editMode,
    		error,
    		submitWishesHandler,
    		cancelWish,
    		showDetails,
    		closeDetailCard,
    		editWish,
    		removeWish,
    		closeError,
    		$wishes
    	});

    	$$self.$inject_state = $$props => {
    		if ('opened' in $$props) $$invalidate(3, opened = $$props.opened);
    		if ('wishId' in $$props) $$invalidate(4, wishId = $$props.wishId);
    		if ('loading' in $$props) $$invalidate(5, loading = $$props.loading);
    		if ('UIMode' in $$props) $$invalidate(0, UIMode = $$props.UIMode);
    		if ('editMode' in $$props) $$invalidate(1, editMode = $$props.editMode);
    		if ('error' in $$props) $$invalidate(2, error = $$props.error);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		UIMode,
    		editMode,
    		error,
    		opened,
    		wishId,
    		loading,
    		$wishes,
    		submitWishesHandler,
    		cancelWish,
    		showDetails,
    		closeDetailCard,
    		editWish,
    		removeWish,
    		closeError,
    		click_handler
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { UIMode: 0, editMode: 1, error: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*error*/ ctx[2] === undefined && !('error' in props)) {
    			console_1.warn("<App> was created without expected prop 'error'");
    		}
    	}

    	get UIMode() {
    		throw new Error_1("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set UIMode(value) {
    		throw new Error_1("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get editMode() {
    		throw new Error_1("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set editMode(value) {
    		throw new Error_1("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get error() {
    		throw new Error_1("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set error(value) {
    		throw new Error_1("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const app = new App({
      target: document.body,
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
