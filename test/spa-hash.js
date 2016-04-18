$(function() {
    var $viewport = $('#qunit-fixture'),
        $title = $('title'),
        counter = {
            show: 0,
            hide: 0
        },
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

    app.Model = SPA.Model.extend({
        initialize: function(attributes, options) {
            this.on("shown", function() {
                counter.show++;
            });

            this.on("hidden", function() {
                counter.hide++;
            });

            app.Model.__super__.initialize.call(this, attributes, options);
        }
    });

    app.Collection = SPA.Collection.extend({
        view: app.View,
        model: app.Model
    });

    app.Router = SPA.Router.extend({
        collection: app.Collection,
        routes: {
            '': 'home',
            '!/': 'home',
            '!/first': 'first',
            '!/parameter/:p': 'parameter',
            '!/template/:p': 'template',
            '!/dynamic': 'dynamic'
        },
        home: function() {
            this.go({
                uri: '/',
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
        },
        template: function(p) {
            this.go({
                name: 'template',
                title: 'Pages with one template &ndash; Testing',
                parameter: p
            });
        },
        dynamic: function() {
            this.go({
                name: 'dynamic',
                title: 'Dynamic page &ndash; Testing'
            }, {
                force: true
            });
        }
    });

    // 2. Testing setup
    QUnit.testStart(function() {
        document.location.hash = "";
        counter = {
            show: 0,
            hide: 0
        };
    });

    QUnit.testDone(function() {
        Backbone.history.stop();
    });

    // 3. Running tests
    QUnit.test("Home", function(assert) {
        var done = assert.async();

        new app.Router({
            el: $viewport
        });

        document.location.href = "#!/";

        setTimeout(function() {
            assert.equal($('title').html(), 'Home – Testing', "Title set");
            assert.equal($viewport.find('.my-page').length, 1, "One page in viewport");
            assert.equal($viewport.find('.my-page:visible').find('.page-name').html(), "home", "Page is home");

            done();
        }, 100);
    });

    QUnit.test("History .back() and .forward()", function(assert) {
        var done = assert.async();

        new app.Router({
            el: $viewport
        });

        document.location.href = "#!/first";

        setTimeout(function() {
            var $visible = $viewport.find('div.my-page:visible');

            assert.equal($title.html(), 'First page – Testing', "Title set");
            assert.equal($viewport.find('div.my-page').length, 2, "Two pages in viewport");
            assert.equal($visible.find('.page-name').html(), "first", "Page is first");
            assert.equal($visible.length, 1, "One page is active");

            history.back();

            setTimeout(function() {
                var $visible = $viewport.find('div.my-page:visible');

                assert.equal($title.html(), 'Home – Testing', "history.back(): Title set");
                assert.equal($viewport.find('div.my-page').length, 2, "Still two pages in viewport");
                assert.equal($visible.find('.page-name').html(), "home", "Page is home");
                assert.equal($visible.length, 1, "One page is active");

                history.forward();

                setTimeout(function() {
                    var $visible = $viewport.find('div.my-page:visible');

                    assert.equal($title.html(), 'First page – Testing', "history.forward(): Title set");
                    assert.equal($viewport.find('div.my-page').length, 2, "Still two pages in viewport");
                    assert.equal($visible.find('.page-name').html(), "first", "Page is first");
                    assert.equal($visible.length, 1, "One page is active");

                    done();
                }, 100);
            }, 100);
        }, 100);
    });

    QUnit.test("Page with parameter", function(assert) {
        var done = assert.async();

        new app.Router({
            el: $viewport
        });

        document.location.href = "#!/parameter/100";

        setTimeout(function() {
            var $visible = $viewport.find('div.my-page:visible');

            assert.equal($title.html(), 'Page with parameter – Testing', "Title set");
            assert.equal($viewport.find('.my-page').length, 2, "Two pages in viewport");
            assert.equal($visible.find('.page-parameter').html(), "100", "Parameter transmitted");
            assert.equal($visible.length, 1, "One page is active");

            done();
        }, 100);
    });

    QUnit.test("Pages with one template", function(assert) {
        var done = assert.async();

        new app.Router({
            el: $viewport
        });

        document.location.href = "#!/template/a";

        setTimeout(function() {
            var $visible = $viewport.find('div.my-page:visible');

            assert.equal($title.html(), 'Pages with one template – Testing', "Title set");
            assert.equal($viewport.find('div.my-page').length, 2, "Two pages in viewport");
            assert.equal($visible.find('.page-name').html(), "template", "Page is template");
            assert.equal($visible.find('.page-parameter').html(), "a", "Parameter transmitted");
            assert.equal($visible.length, 1, "One page is active");

            document.location.href = "#!/template/b";

            setTimeout(function() {
                var $visible = $viewport.find('div.my-page:visible');

                assert.equal($title.html(), 'Pages with one template – Testing', "Title set");
                assert.equal($viewport.find('div.my-page').length, 3, "Three pages in viewport");
                assert.equal($visible.find('.page-name').html(), "template", "Page is template");
                assert.equal($visible.find('.page-parameter').html(), "b", "Parameter transmitted");
                assert.equal($visible.length, 1, "One page is active");

                // Go to /template/a again to make sure no excess views
                document.location.href = "#!/template/a";

                setTimeout(function() {
                    assert.equal(counter.show, 4, "shown event");
                    assert.equal(counter.hide, 3, "hidden event");
                    assert.equal($title.html(), 'Pages with one template – Testing', "Title set");
                    assert.equal($viewport.find('div.my-page').length, 3, "Still three pages in viewport");
                    assert.equal($viewport.find('div.my-page:visible').find('.page-parameter').html(), "a", "Parameter transmitted");

                    done();
                }, 100);
            }, 100);
        }, 100);
    });

    QUnit.test("Static page", function(assert) {
        var done = assert.async();

        new app.Router({
            el: $viewport
        });

        $viewport.find('div.my-page:visible').find('span.home-content').html("changed");

        document.location.href = "#!/first";

        setTimeout(function() {
            document.location.href = "#!/";

            setTimeout(function() {
                var $visible = $viewport.find('div.my-page:visible');

                assert.equal($visible.find('span.home-content').html(), "changed", "Page is NOT re-rendered");

                done();
            }, 100);
        }, 100);
    });

    QUnit.test("Dynamic page", function(assert) {
        var done = assert.async();

        new app.Router({
            el: $viewport
        });

        document.location.href = "#!/dynamic";

        setTimeout(function() {
            $viewport.find('div.my-page:visible').find('span.dynamic-content').html("changed");

            document.location.href = "#!/";

            setTimeout(function() {
                document.location.href = "#!/dynamic";

                setTimeout(function() {
                    var $visible = $viewport.find('div.my-page:visible');

                    assert.equal($visible.find('span.dynamic-content').html(), "", "Page has been re-rendered");

                    done();
                }, 100);
            }, 100);
        }, 100);
    });
});
