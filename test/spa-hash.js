$(function() {
    var $viewport = $('#qunit-fixture'),
        app = {};

    // 1. SPA setup
    app.View = SPA.View.extend({
        className: 'my-page',
        template: function(data) {
            var template = $('#page-' + this.model.get("name")),
                templateFn = _.template(template.html());

            return templateFn(data);
        }
    });

    app.Collection = SPA.Collection.extend({
        view: app.View
    });

    app.Router = SPA.Router.extend({
        collection: app.Collection,
        routes: {
            '': 'home',
            '!/': 'home',
            '!/first': 'first',
            '!/parameter/:p': 'parameter'
        },
        home: function() {
            this.go({
                id: '-home-',
                name: 'home',
                title: 'Home &ndash; Testing'
            });
        },
        first: function() {
            this.go({
                name: 'first',
                title: 'First page &ndash; Testing'
            });
        },
        parameter: function(p) {
            this.go({
                name: 'parameter',
                title: 'Page with parameter &ndash; Testing',
                parameter: p
            });
        }
    });

    // 2. Testing setup
    QUnit.testStart(function(details) {
        document.location.hash = "";
    });

    // 3. Running tests
    QUnit.test("Home", function(assert) {
        var done = assert.async();

        var router = new app.Router({
            el: $viewport
        });

        document.location.href = "#!/";

        setTimeout(function() {
            assert.equal($('title').html(), 'Home – Testing', "Title set");
            assert.equal($viewport.find('.my-page').length, 1, "One page in viewport");
            assert.equal($viewport.find('.my-page:visible').find('.page-name').html(), "home", "Page is home");
            done();
            Backbone.history.stop();
        }, 100);
    });

    QUnit.test("First page", function(assert) {
        var done = assert.async();

        var router = new app.Router({
            el: $viewport
        });

        document.location.href = "#!/first";

        setTimeout(function() {
            assert.equal($('title').html(), 'First page – Testing', "Title set");
            assert.equal($viewport.find('.my-page').length, 2, "Two pages in viewport");
            assert.equal($viewport.find('.my-page:visible').find('.page-name').html(), "first", "Page is first");
            assert.equal($viewport.find('.my-page:visible').length, 1, "One page is active");
            done();
            Backbone.history.stop();
        }, 100);
    });

    QUnit.test("Page with parameter", function(assert) {
        var done = assert.async();

        var router = new app.Router({
            el: $viewport
        });

        document.location.href = "#!/parameter/100";

        setTimeout(function() {
            assert.equal($('title').html(), 'Page with parameter – Testing', "Title set");
            assert.equal($viewport.find('.my-page').length, 2, "Two pages in viewport");
            assert.equal($viewport.find('.my-page:visible').find('.page-parameter').html(), "100", "Parameter transmitted");
            assert.equal($viewport.find('.my-page:visible').length, 1, "One page is active");
            done();
            Backbone.history.stop();
        }, 100);
    });
});
