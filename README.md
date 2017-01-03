# backbone-viewport

Tiny single page application framework.
Based on jQuery and Backbone, it provides an API to create single page applications.
Supports HTML5 `history.pushState` method and hash routing.

Viewport stores pages as Backbone's models with related Views.
When [URL changes] user goes to some page, it retrieves URI, creates [page Model](#viewportmodel), renders [page View](#viewportview), and put model into [Collection](#viewportcollection) with unique URI, and [shows](#show) it.
If page for URI exists in Collection, it just shown.

## Requirements

* jQuery/Zepto/$-compatible framework can be used by Backbone.js
* Underscore.js
* Backbone.js

## Release

[Development version](https://github.com/dzhdmitry/viewport/blob/master/dist/viewport.js)

[Minimized production version](https://github.com/dzhdmitry/viewport/blob/master/dist/viewport.min.js)

## Examples

[Example with hash method](http://dzhdmitry.github.io/viewport/)

## Classes

### Viewport.View

Inherited from [Backbone.View](http://backbonejs.org/#View).
Represents page view. View is rendered on any model's change.

#### Attributes

| Name    | Type   | Default | Description |
| ------- | ------ | ------- | ----------- |
| tagName | string | 'div'   | *Inherited from `Backbone.View`.* Tag name of container element |

#### Methods

##### .template(data)

**Must be overridden.** Receives model attributes and return rendered string.

It is common to use html templates in `<script type="text/html">` elements and use [underscore](http://underscorejs.org/) to render them.
Here is an example how `.template()` may look like:

```html
<script type="text/html" id="template-page-discovery">
    <h1><%= name %></h1>
    ...content...
</script>
```

```javascript
var View = Viewport.View.extend({
    // ...
    template: function(data) {
        var template = $('#template-page-' + this.model.get("name")),
            templateFn = _.template(template.html());

        return templateFn(data);
    }
});

// Extending classes and configuring router...

// In Router's action:
router.go({ name: "discovery", content: "" /* , ... */ });
```

...will cause `script[id="template-page-discovery"]` will be rendered with data:

```html
<h1>discovery</h1>
...content...
```

##### .render()

Renders model attributes by [template](#templatedata).

##### .toggle(active)

Set `display: block` css style to page container if `active=true`, or `display:none` if false.
Override it to use different behaviour.

#### Events

| Event type | Description  |
| ---------- | ------------ |
| rendered   | Fires when `.render` was called. |

### Viewport.Model

Inherited from [Backbone.Model](http://backbonejs.org/#Model). 
Contains page's attributes and data, which can be rendered in view.

#### Attributes

| Name   | Type    | Default | Description |
| ------ | ------- | ------- | ----------- |
| uri    | string  |      | *Generated automatically if not given.* Unique identifier of every page. Viewport uses `Backbone.history` methods `getPath()` and `getHash()` for `history.pushState` and hash routing. |
| active | boolean | true | Indicates visibility of a page. When changed, page container is set `display: block` css style if true, and `display:none` if false. Override [Viewport.View.toggle()](#toggleactive) to use whatever behaviour. |

All model's attributes are available in `view.template()`.

#### Methods

##### .show()

Set `page.active` property to `true`.
Triggers `shown` event.

##### .hide()

Set `page.active` property to `false`.
Triggers `hidden` event.

##### .getFetchOptions()

Extend this method to provide options for ajax fetch call:

```javascript
var Page = Viewport.Model.extend({
    // ...
    getFetchOptions: function() {
        var defaults = Page.__super__.getFetchOptions.call();

        return _.extend({}, defaults, {
            beforeSend: function() {
                // custom beforeSend callback
            },
            error: function() {
                // custom error handling
            },
            complete: function() {
                // custom callback on complete
            }
        });
    }
});
```

#### Events

| Event type | Description  |
| ---------- | ------------ |
| shown      | Fires when page was hidden and became shown.   |
| hidden     | Fires when page was shown and became hidden.   |
| render     | Fires when page content needed to be rendered. |

```javascript
var Page = Viewport.Model.extend({
    initialize: function() {
        this.on("shown", this.onShown);
    },
    onShown: function() {
        // event handling
    }
});
```

### Viewport.Collection

Inherited from [Backbone.Collection](http://backbonejs.org/#Collection). 
Stores pages. Accessing pages to add/toggle them. 
When page is added, new `Viewport.View` is created and linked to this page.

#### Properties

| Name  | Type           | Default     | Description |
| ----- | -------------- | ----------- | ----------- |
| el    | jQuery         | `$('body')` | Pages container. Available after router initialized. *Not allowed in `extend()`.* |
| model | Backbone.Model | Viewport.Model   | Type of model used by collection. |
| view  | Backbone.View  | Viewport.View    | Type of view used by collection. Will be created on `collection.add()`. |

#### Methods

##### .open(uri)

Open page with given uri and hide others.
Find and `show()` page with uri, `hide()` other pages.

#### .pushPage(attributes, $el)

Create a page with given `attributes` and existing HTML-element (`$el`) and insert into collection.
Useful for rendering start page without loading data.
Returns added [page](#viewportmodel).

### Viewport.Router

Inherited from [Backbone.Router](http://backbonejs.org/#Router). 
Listening to URI changes and handling assigned events. 
Contains `Viewport.Collection` and accessing it to handle pages.

#### Properties

| Name       | Type                | Default        | Description |
| ---------- | ------------------- | -------------- | ----------- |
| collection | Backbone.Collection | Viewport.Collection | Type of collection used by Router. |

Methods:

##### constructor / .initialize([options])

Creates new instance of `Viewport.Router`.
If `start=true`, runs `Backbone.history.start()` when initialized and begin listening to URL changes. 
Options are:

| Name      | Type     | Default     | Description |
| --------- | -------- | ----------- | ----------- |
| el        | jQuery   | `$('body')` | Container of pages' views. |
| start     | boolean  | true        | Start to listen URI changes when initialized (Run [Router.start()](#startoptions)). |
| pushState | boolean  | false       | Defines which type of routing to use: `history.pushState` or hash. Will be transmitted to `Backbone.history.start()`. |
| silent    | boolean  | false       | Tells router not to navigate (in case if page is already rendered). Will be transmitted to `Backbone.history.start()`. |
| root      | string   | '/'         | *Make sense only if pushState=true* Will be transmitted to `Backbone.history.start()`. |
| pages     | Object[] | []          | Initial array of pages. |

```javascript
var Router = Viewport.Router.extend({
    // extend default router by routes and methods...
});

var router = new Router({
    el: $('#viewport'),
    pushState: true,
    root: '/path/custom/'
});
```

##### .start([options])

Run `Backbone.history.start()` with `pushState`, `root` and `silent` provided
in [constructor](#constructor--initializeoptions) and overridden by provided directly.

##### .stop()

Stop watching uri changes (Run `Backbone.history.stop()`).

##### .go(attributes[, options])

Read document uri and activate page with given `attributes` (PlainObject). 
If page not exists in collection, it will be created with given `attributes`, and added to collection.
URI is generated automatically:
* If `pushState=true`: full URI of document
* If `pushState=false`: hash part of URI

If page has been already added in collection, it will be just [shown](#show), none of attributes will be updated and view will not be re-rendered.

Options are:

| Name  | Type    | Default | Description |
| ----- | ------- | ------- | ----------- |
| force | boolean | false   | Update properties of model and make it re-render its view if page is already exists. |
| load  | boolean | false   | (_For pushState:true_) Make request to server with url=page's uri (run `Viewport.Model.fetch()`), update model with received data |

`Viewport.Router.go()` is not supposed to be used anywhere except for Router's actions.

##### .navigate(fragment[, options])

[Backbone.Router.navigate](http://backbonejs.org/#Router-navigate) inherited from `Backbone.Router`. 
Use it in code to navigate to some page:

```javascript
router.navigate("product/1", {
    trigger: true
});
```

## Extending classes

Viewport classes are unsuitable for end use and must be extended.
At least, `.template()` must be provided for `Viewport.View`:

```javascript
var View = Viewport.View.extend({
    className: 'my-page-class',
    template: function(data) {
        return _.template('<h1>Page title: <%= title %><h1> ...content... ', data);
    }
});
```

`Viewport.Collection` must be extended to use View (also provide model if extended):

```javascript
var Collection = Viewport.Collection.extend({
    view: View
});
```

Router must be extended to use `Collection` and set `routes` and handlers. 
Refer [Backbone.Router.routes](http://backbonejs.org/#Router-routes) for routing syntax.

```javascript
var Router = Viewport.Router.extend({
    collection: Collection,
    routes: {
        '': 'home',
        'discovery': 'discovery',
        'product/:name': 'product'
    },
    home: function() {
        this.go({ title: 'Home &ndash; My SPA' });
    },
    discovery: function() {
        this.go({ title: 'Discovery &ndash; My SPA' });
    }
    product: function(name) {
        this.go({ title: name + ' &ndash; My SPA', productName: name });
    }
});
```

Now application classes are ready to use, but it is not started yet.
To start the application, create instance of extended `Router`:

```javascript
var router = new Router({
    // options
});
```

Refer [Router.initialize()](#constructor--initializeoptions) for options.

## Routing process

When Router is initialized, or when URI is changed, Router begin to look for matching routes through `routes` property and if found, runs route's action. 
In an action, you can analyze route params, and maybe load some data from server to get some data required by page.
`this` in actions points to current router, so `this.go()` can be called to open a page with its attributes and data.

Viewport considers each page as unique for different uri.
But it may be useful to have one page for many uris, e.g one homepage for `/` and `/#!/`.
To make it, provide uri manually when go to a page:

```javascript
var Router = Viewport.Router.extend({
    // ...
    routes: {
        '': 'home',
        '#!/': 'home'
        // other routes
    },
    home: function() {
        this.go({
            uri: '/'
            // page properties
        });
    }
    // other actions
});
```

## Handling hyperlinks

Viewport does not handle any events on hyperlinks.
They must be handled manually. 
Possible example:

```javascript
// Ensure router is instance of Viewport.Router
$(document).on('click', 'a.spa-link', function(e) {
    if (!e.altKey && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
        e.preventDefault();

        var url = $(this).attr("href").replace(/^\//,'').replace('\#\!\/','');

        router.navigate(url, {
            trigger: true
        });

        return false;
    }
});
```

In this example, all hyperlinks with `spa-link` class will be handled to use Viewport router instead of common behavior.

## Updating title

Viewport does not update browser page's title automatically.
Page title can be changed on Page `shown` event:

```javascript
var Page = Viewport.Model.extend({
    initialize: function() {
        this.on("shown", function() {
            $("title").html(this.get("title"));
        });
    }
});
```
