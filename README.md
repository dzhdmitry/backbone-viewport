# SPA
Tiny single page application framework.
Based on jQuery and Backbone, it provides an API to create single page applications.
Supports HTML5 `history.pushState` method and hash routing.

SPA stores pages as Backbone's models with related Views.
When [URL changes] user goes to some page, it retrieves URI, creates [page Model](#spamodel), renders [page View](#spaview), and put model into [Collection](#spacollection) with URI as unique id, and [shows](#show) it.
If page for URI exists in Collection, it just shown.

## Examples

[Example with hash method](http://dzhdmitry.github.io/spa/)

## Classes

### SPA.View

Inherited from [Backbone.View](http://backbonejs.org/#View).
Represents page view. View is rendered on any model's change.
Properties:

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| tagName | string | 'div' | *Inherited from `Backbone.View`.* Tag name of container element |

Methods:

#### .template(data)

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
var View = SPA.View.extend({
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

#### .render()

Renders model attributes by [template](templatedata) and [toggles](#toggleactive) the container by model's `active` attribute.

#### .toggle(active)

Set `display: block` css style to page container if `active=true`, or `display:none` if false.
Override it to use different behaviour.

### SPA.Model

Inherited from [Backbone.Model](http://backbonejs.org/#Model). 
Contains page's attributes and data, which can be rendered in view.
Attributes:

| Name   | Type    | Default | Description |
| ------ | ------- | ------- | ----------- |
| id     | string  |      | Unique identifier of every page. SPA uses `Backbone.history` methods `getPath()` and `getHash()` for `history.pushState` and hash routing. |
| name   | string  | ''   | Name/type of page. Use it to find a template for page. |
| active | boolean | true | Indicates visibility of a page. When true, page container is set `display: block` css style, and `display:none` if false. Override [SPA.View.toggle()](#toggleactive) to use whatever behaviour. |
| title  | string  | ''   | Will be set to document's title when page is shown. |

All model's attributes are available in `view.template()`.
Methods:

#### .show()

Set `page.active` property to `true` (must cause view rendering) and copy page's title to document.
Causes [view.render()](#render).

#### .hide()

Set `page.active` property to `false`.
Causes `view.render()`.

### SPA.Collection

Inherited from [Backbone.Collection](http://backbonejs.org/#Collection). 
Stores pages. Accessing pages to add/toggle them. 
When page is added, new `SPA.View` is created and linked to this page.
Properties:

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| model | Backbone.Model | SPA.Model | Type of model used by collection. |
| view  | Backbone.View  | SPA.View  | Type of view used by collection. Will be created on `collection.add()`. |

Methods:

#### .open(uri)

Open page with given uri and hide others.
Find page with `id=uri`, `show()` this page, `.hide()` other pages.

### SPA.Router

Inherited from [Backbone.Router](http://backbonejs.org/#Router). 
Listening to URI changes and handling assigned events. 
Contains `SPA.Collection` and accessing it to handle pages.
Properties:

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| collection | Backbone.Collection | SPA.Collection | Type of collection used by Router. |

Methods:

#### constructor / .initialize([options])

Creates new instance of `SPA.Router`. 
Runs `Backbone.history.start()` when initialized and begin listening to URL changes. 
Options are:

| Name      | Type    | Default     | Description |
| --------- | ----    | ----------- | ----------- |
| el        | jQuery  | `$('body')` | Type of collection used by Router. |
| pushState | boolean | false       | Defines which type of routing to use: `history.pushState` or hash. Will be transmitted to `Backbone.history.start()` |
| root      | string  | '/'         | *Make sense only if pushState=true* Will be transmitted to `Backbone.history.start()` |

```javascript
var Router = SPA.Router.extend({
    // extend default router by routes and methods...
});

var router = new Router({
    el: $('#viewport'),
    pushState: true,
    root: '/path/custom/'
});
```

#### .go(attributes)

Read document uri and activate page with given `attributes` (PlainObject). 
If page not exists in collection, it will be created and added to collection with id=uri.
URI is received:
* If `pushState=true`: full URI of document
* If `pushState=false`: hash part of URI

Page will be created with given `attributes` if not exist.

`SPA.Router.go()` is not supposed to be used anywhere except for Router's actions.

### .navigate(fragment, [options])

[Backbone.Router.](http://backbonejs.org/#Router-navigate)

Inherited from `Backbone.Router`. 
Use it in code to navigate to some page:

```javascript
router.navigate("product/1", {
    trigger: true
});
```

## Extending classes

SPA classes are unsuitable to usage and must be extended.
At least, `.template()` must be provided for `SPA.View`:

```javascript
var View = SPA.View.extend({
    className: 'my-page-class',
    template: function(data) {
        return _.template('<h1>Page title: <%= title %><h1> ...content... ', data);
    }
});
```

`SPA.Collection` must be extended to use View (also provide model if extended):

```javascript
var Collection = SPA.Collection.extend({
    view: View
});
```

Router must be extended to use `Collection` and set `routes` nad handlers. Refer [Backbone.Router.extend](http://backbonejs.org/#Router-routes) for routing syntax.

```javascript
var Router = SPA.Router.extend({
    collection: Collection,
    routes: {
        '': 'home',
        'page': 'discovery',
        'product/:name': 'product'
    },
    home: function() {
        this.go({ name: "home",      title: 'Home &ndash; My SPA' });
    },
    discovery: function() {
        this.go({ name: "discovery", title: 'Discovery &ndash; My SPA' });
    }
    product: function(name) {
        this.go({ name: "product",   title: name + ' &ndash; My SPA', productName: name });
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
`this` in actions points to current router, so `this.go()` can be called to open a page with page attributes and data.

## Handling hyperlinks

SPA does not handle any events on hyperlinks. 
They must be handled manually. 
Possible example:

```javascript
// Ensure router is instance of SPA.Router
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

In this example, all hyperlinks with `spa-link` class will be handled to use SPA router instead of common behavior.
