module.exports = function (SETTINGS, DONE) {
    /**
     * Add some extra methods for handling DOM elements.
     */
    $.fn.extend({
        onlyText: function () {
            return this.contents().filter(function() {
                return this.nodeType === 3;
            }).text();
        }
    });

    /**
     * The global store.
     */
    var Store = {
        restaurant: null
    };

    /**
     * Returns the list of restaurants.
     *
     * @returns {Array} The list of restaurants.
     */
    var getRestaurants = function () {
        return $('#idListRestaurants .divRestaurant').map(function () {
            return {
                name:    $('.divTextTop', this).onlyText(),
                trigger: $('.divImgTop',  this)
            };
        });
    };

    /**
     * Return the current list of categories.
     *
     * @returns {Array} The list of categories.
     */
    var getCategories = function () {
        return $('#idDivCat .messageLeft').map(function () {
            return { name: $(this).text(), trigger: $(this) };
        });
    };

    /**
     * Return the current list of products.
     *
     * @returns {Array} The list of products.
     */
    var getProducts = function () {
        return $('#idDivProd .messageLeft').map(function () {
            return { name: $(this).onlyText(), trigger: $(this) };
        });
    };

    /**
     * Looks for a item matching a specific name and click on it.
     *
     * @param {string} name  The item name.
     * @param {Array} items The list of items.
     */
    var chooseItem = function (name, items) {
        var pattern = new RegExp(name);

        var match = $.grep(items, function (item) {
            return pattern.test(item.name);
        });

        if (match.length) {
            match[0].trigger.click();
        }
    };

    /**
     * Looks for a category matching a specific name and click on it.
     *
     * @param {string} name The category name.
     */
    var chooseCategory = function (name) {
        chooseItem(name, getCategories());
    };

    /**
     * Looks for a product matching a specific name and click on it.
     *
     * @param {string} name The product name.
     */
    var chooseProduct = function (name) {
        var products = getProducts();

        // Handle multiple choices for ingredients
        if ($.isArray(name)) {
            $.each(name, function (i, n) {
                chooseItem(n, products);
            });

            _setTimeout(function () {
                $('#idDivProd .messageLeftFinish:visible:first').click();
            }, 1000);
        } else {
            chooseItem(name, products);
        }
    };

    /**
     * Looks for the first restaurant matching the preferences and click on it.
     */
    var chooseRestaurant = function () {
        var restaurants = getRestaurants();

        $.each(SETTINGS.menu, function (i, choice) {
            var pattern = new RegExp(choice.name);

            var match = $.grep(restaurants, function (restaurant) {
                return pattern.test(restaurant.name);
            });

            if (match.length) {
                Store.restaurant = SETTINGS.menu[i];

                match[0].trigger.click();
                return false;
            }
        });
    };

    /**
     * Fills the shopping cart.
     */
    var fillShoppingCart = function () {
        var choices = SETTINGS.menu[0].choices;

        $.each(choices, function (i, choice) {
            TaskManager.enqueue(
                function () { chooseCategory(choice.category); }
            );

            $.each(choice.product, function (i, ingredient) {
                TaskManager.enqueue(
                    function () { chooseProduct(ingredient); }
                );
            });
        });
    };

    /**
     * Performs the checkout.
     */
    var performCheckout = function () {
        var button  = $('#idDivCheckouts .paymentBtn'),
            pattern = new RegExp('voucher', 'i');

        if (pattern.test(button.text())) {
            button.click();

            DONE('Order completed successfully');
        }
    };


    /**
     * Task manager to execute one task per time.
     */
    var TaskManager = new Array(
        function () { chooseRestaurant(); },
        function () { fillShoppingCart(); }
    );

    /**
     * Enqueues a task.
     *
     * @param task The function to execute.
     */
    TaskManager.enqueue = function (task) {
        this.push(task);
    };

    /**
     * Performs a task and pop it out from the queue.
     */
    TaskManager.perform = function () {
        this.shift()();
    };

    /**
     * Run the task manager.
     */
    TaskManager.run = function () {
        var that = this;

        var timer = _setInterval(function () {
            that.perform();

            if (!that.length) {
                clearInterval(timer);

                // Perform the checkout
                _setTimeout(function () { performCheckout(); }, SETTINGS.delay);
            }
        }, SETTINGS.delay);
    };


    // Run the task manager
    TaskManager.run();
};